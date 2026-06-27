# GitPulse Proxy (C++)

A small C++ service that fronts the GitHub API for the GitPulse frontend.

## Why this exists

GitPulse runs entirely in the browser. Two things break for ordinary visitors:

- **Contribution heatmaps need GitHub's GraphQL API**, which is auth-only.
- **Unauthenticated REST is capped at 60 requests/hour per IP.**

The original design asked every visitor to paste their own Personal Access Token -
bad UX and a security non-starter for a public site. This proxy holds **one
server-side token** so visitors need nothing. It also:

- **caches** responses for 5 minutes (per path / per user), and
- **rate-limits** each client IP (60 requests/minute),

so the token's budget can't be drained or abused.

## Endpoints

| Route | Forwards to | Notes |
|---|---|---|
| `GET /api/gh/<path>` | `https://api.github.com/<path>` (query preserved) | REST passthrough (user, repos, events) |
| `GET /api/contributions/<username>` | GitHub GraphQL contribution calendar | the heatmap data |
| `GET /healthz` | - | liveness check |

All responses include permissive CORS headers (lock `ALLOWED_ORIGIN` down in prod).

## Run it (Docker)

```bash
cd server
cp .env.example .env          # then put your token in .env
docker compose up --build
# proxy now on http://localhost:8080
curl http://localhost:8080/api/gh/users/torvalds
```

## Run it (without Docker)

```bash
curl -fsSL https://raw.githubusercontent.com/yhirose/cpp-httplib/v0.15.3/httplib.h -o httplib.h
g++ -O2 -std=c++17 -DCPPHTTPLIB_OPENSSL_SUPPORT server.cpp -o gitpulse-server -lssl -lcrypto -lpthread
GITHUB_TOKEN=ghp_... PORT=8080 ./gitpulse-server
```

Requires a C++17 compiler and OpenSSL dev headers.

## Connect the frontend

Deploy this somewhere with a public URL, then set `PROXY_BASE` at the top of
[`../js/api.js`](../js/api.js) to that URL. When set, GitPulse routes all GitHub
calls through the proxy and **no visitor needs a PAT**. Leave it empty and the app
falls back to direct GitHub calls (with the optional per-user PAT).

## Configuration

| Env var | Default | Purpose |
|---|---|---|
| `GITHUB_TOKEN` | _(none)_ | server-side token; without it, heatmaps are disabled and REST is unauthenticated |
| `PORT` | `8080` | listen port |
| `ALLOWED_ORIGIN` | `*` | CORS origin; set to your site, e.g. `https://kanishksigar.me` |

## Stack

C++17, [cpp-httplib](https://github.com/yhirose/cpp-httplib) (HTTP server + HTTPS client, single header), OpenSSL.
