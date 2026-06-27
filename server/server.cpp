// ============================================================
// GitPulse Proxy - a tiny C++ backend that fronts the GitHub API.
//
// Why: GitPulse runs in the browser. Contribution heatmaps need GitHub's
// GraphQL API (auth-only) and unauthenticated REST is capped at 60 req/h per IP.
// This proxy holds ONE server-side token, so visitors need no Personal Access
// Token of their own. It caches responses and rate-limits per IP so the token's
// budget can't be drained or abused.
//
// Build/run: see server/README.md (Docker) - GITHUB_TOKEN is read from env.
// ============================================================

#include "httplib.h"
#include <string>
#include <unordered_map>
#include <mutex>
#include <chrono>
#include <cstdlib>

using namespace std::chrono;

static std::string env(const char* key, const std::string& def = "") {
    const char* v = std::getenv(key);
    return v ? std::string(v) : def;
}

// ---- tiny in-memory TTL cache --------------------------------------------
struct CacheEntry { std::string body; std::string contentType; int status; steady_clock::time_point expires; };
static std::unordered_map<std::string, CacheEntry> g_cache;
static std::mutex g_cacheMx;
static const seconds CACHE_TTL{300};   // 5 minutes

static bool cacheGet(const std::string& key, CacheEntry& out) {
    std::lock_guard<std::mutex> lk(g_cacheMx);
    auto it = g_cache.find(key);
    if (it == g_cache.end()) return false;
    if (steady_clock::now() > it->second.expires) { g_cache.erase(it); return false; }
    out = it->second;
    return true;
}
static void cacheSet(const std::string& key, const CacheEntry& e) {
    std::lock_guard<std::mutex> lk(g_cacheMx);
    g_cache[key] = e;
}

// ---- per-IP rate limiting -------------------------------------------------
struct Bucket { int count; steady_clock::time_point windowStart; };
static std::unordered_map<std::string, Bucket> g_rl;
static std::mutex g_rlMx;
static const int RL_MAX = 60;          // requests per window per IP
static const seconds RL_WINDOW{60};

static bool rateLimitOk(const std::string& ip) {
    std::lock_guard<std::mutex> lk(g_rlMx);
    auto now = steady_clock::now();
    auto& b = g_rl[ip];
    if (b.count == 0 || now - b.windowStart > RL_WINDOW) { b.count = 1; b.windowStart = now; return true; }
    if (b.count >= RL_MAX) return false;
    b.count++;
    return true;
}

static std::string clientIp(const httplib::Request& req) {
    auto xff = req.get_header_value("X-Forwarded-For");
    if (!xff.empty()) { auto comma = xff.find(','); return comma == std::string::npos ? xff : xff.substr(0, comma); }
    return req.remote_addr;
}

// ---- GitHub client --------------------------------------------------------
static const std::string GH_TOKEN = env("GITHUB_TOKEN");
static const std::string ALLOWED_ORIGIN = env("ALLOWED_ORIGIN", "*");

static httplib::Headers githubHeaders() {
    httplib::Headers h = {
        {"User-Agent", "GitPulse-Proxy"},
        {"Accept", "application/vnd.github+json"},
    };
    if (!GH_TOKEN.empty()) h.insert({"Authorization", "Bearer " + GH_TOKEN});
    return h;
}

static void cors(httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
    res.set_header("Access-Control-Allow-Methods", "GET, OPTIONS");
}

static void sendJson(httplib::Response& res, int status, const std::string& body) {
    cors(res);
    res.status = status;
    res.set_content(body, "application/json");
}

// Forward a GET to api.github.com{path} (path may include a query string).
static void proxyGet(const std::string& cacheKey, const std::string& ghPath, httplib::Response& res) {
    CacheEntry cached;
    if (cacheGet(cacheKey, cached)) {
        cors(res); res.status = cached.status; res.set_content(cached.body, cached.contentType);
        res.set_header("X-GitPulse-Cache", "HIT");
        return;
    }
    httplib::Client cli("https://api.github.com");
    cli.set_connection_timeout(10);
    cli.set_read_timeout(15);
    auto gh = cli.Get(ghPath.c_str(), githubHeaders());
    if (!gh) { sendJson(res, 502, R"({"error":"Upstream request to GitHub failed"})"); return; }

    std::string ct = gh->get_header_value("Content-Type");
    if (ct.empty()) ct = "application/json";
    cors(res);
    res.status = gh->status;
    res.set_content(gh->body, ct);
    res.set_header("X-GitPulse-Cache", "MISS");
    if (gh->status == 200) cacheSet(cacheKey, {gh->body, ct, gh->status, steady_clock::now() + CACHE_TTL});
}

int main() {
    if (GH_TOKEN.empty())
        fprintf(stderr, "[gitpulse] WARNING: GITHUB_TOKEN not set - falling back to unauthenticated GitHub (60 req/h, no heatmaps).\n");

    httplib::Server svr;

    svr.Get("/healthz", [](const httplib::Request&, httplib::Response& res) {
        cors(res); res.set_content("ok", "text/plain");
    });

    // CORS preflight for everything
    svr.Options(R"(/.*)", [](const httplib::Request&, httplib::Response& res) { cors(res); res.status = 204; });

    // Generic GitHub REST passthrough: /api/gh/<github-path>?<query>
    //   e.g. /api/gh/users/torvalds  ->  https://api.github.com/users/torvalds
    svr.Get(R"(/api/gh/.*)", [](const httplib::Request& req, httplib::Response& res) {
        if (!rateLimitOk(clientIp(req))) { sendJson(res, 429, R"({"error":"Rate limit exceeded. Try again shortly."})"); return; }
        const std::string prefix = "/api/gh";
        std::string ghPath = req.target.substr(prefix.size());   // keeps the query string
        if (ghPath.empty() || ghPath[0] != '/') { sendJson(res, 400, R"({"error":"Bad path"})"); return; }
        proxyGet("gh:" + ghPath, ghPath, res);
    });

    // Contribution calendar (GraphQL) - the reason a token is needed.
    //   /api/contributions/<username>
    svr.Get(R"(/api/contributions/([A-Za-z0-9-]+))", [](const httplib::Request& req, httplib::Response& res) {
        if (!rateLimitOk(clientIp(req))) { sendJson(res, 429, R"({"error":"Rate limit exceeded. Try again shortly."})"); return; }
        const std::string user = req.matches[1];

        CacheEntry cached;
        const std::string key = "contrib:" + user;
        if (cacheGet(key, cached)) { cors(res); res.status = cached.status; res.set_content(cached.body, cached.contentType); res.set_header("X-GitPulse-Cache", "HIT"); return; }

        if (GH_TOKEN.empty()) { sendJson(res, 503, R"({"error":"Contribution data needs a server token; none configured."})"); return; }

        // username is restricted to [A-Za-z0-9-] by the route, so it's safe to inline.
        std::string body =
            "{\"query\":\"query($u:String!){user(login:$u){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{contributionCount date color}}}}}}\","
            "\"variables\":{\"u\":\"" + user + "\"}}";

        httplib::Client cli("https://api.github.com");
        cli.set_connection_timeout(10);
        cli.set_read_timeout(15);
        auto gh = cli.Post("/graphql", githubHeaders(), body, "application/json");
        if (!gh) { sendJson(res, 502, R"({"error":"Upstream GraphQL request failed"})"); return; }

        cors(res);
        res.status = gh->status;
        res.set_content(gh->body, "application/json");
        res.set_header("X-GitPulse-Cache", "MISS");
        if (gh->status == 200) cacheSet(key, {gh->body, "application/json", gh->status, steady_clock::now() + CACHE_TTL});
    });

    int port = std::stoi(env("PORT", "8080"));
    printf("[gitpulse] proxy listening on :%d (token: %s)\n", port, GH_TOKEN.empty() ? "none" : "set");
    svr.listen("0.0.0.0", port);
    return 0;
}
