# syntax=docker/dockerfile:1
#
# Express API + built Vite frontend in ONE container, ONE HTTP port, ONE
# billed service.
#
# Debian slim rather than Alpine: if you add Prisma, its query engine wants
# OpenSSL and musl builds are a recurring source of "engine not found".

# ---------- 1. Build the frontend ----------
FROM node:20-slim AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
# VITE_* variables are read HERE, at build time, and baked into the bundle.
# Setting them in the platform's runtime env will not reach the browser.
#   ARG VITE_API_URL
#   ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- 2. Install backend dependencies ----------
FROM node:20-slim AS server
WORKDIR /app
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
# If you use Prisma, copy the schema and generate here:
#   COPY prisma ./prisma
#   RUN npx prisma generate

# ---------- 3. Runtime ----------
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY --from=server /app/node_modules ./node_modules
COPY --from=server /app/package*.json ./
COPY --from=server /app/src          ./src
COPY --from=client /app/client/dist  ./public

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# NEVER add `ENV PORT=...`. The platform injects PORT and a baked value shadows
# it, failing the deploy with "did not respond on the PORT environment variable".
EXPOSE 8080

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "src/index.js"]
