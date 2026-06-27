# ---- build stage ----
FROM gcc:13 AS build
RUN apt-get update && apt-get install -y --no-install-recommends libssl-dev curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# cpp-httplib is a single header (server + HTTPS client). Pin a known release.
RUN curl -fsSL https://raw.githubusercontent.com/yhirose/cpp-httplib/v0.15.3/httplib.h -o httplib.h
COPY server.cpp .
RUN g++ -O2 -std=c++17 -DCPPHTTPLIB_OPENSSL_SUPPORT server.cpp -o gitpulse-server -lssl -lcrypto -lpthread

# ---- runtime stage ----
FROM debian:stable-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates libssl3 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/gitpulse-server .
ENV PORT=8080
EXPOSE 8080
CMD ["./gitpulse-server"]
