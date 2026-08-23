# syntax=docker/dockerfile:1
#
# PivoCloud template — a built Vite/React (or Vue) frontend served as its OWN app.
#
# Use this when the customer keeps frontend and backend as two separate services.
# If instead the backend serves the build from one container, use
# ../node20-vite-express/ and do not deploy this at all.
#
# PivoCloud has no static-site product: every app is a Dockerfile deployment.
# So a "static site" here is nginx in a container, which is what this builds.

# ---------- 1. Build ----------
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Vite reads VITE_* variables at BUILD time and bakes them into the bundle.
# Anything the browser needs must be passed as a build arg here. Setting it in
# the PivoCloud environment variables at runtime will NOT reach the browser.
#   ARG VITE_API_URL
#   ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- 2. Serve ----------
FROM nginx:1.27-alpine AS runtime

# The build output. Vite writes to dist/ by default; adapt if yours differs.
COPY --from=build /app/dist /usr/share/nginx/html

# nginx cannot read an environment variable in its own config, so the port is a
# placeholder substituted at startup by the entrypoint.
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template
RUN rm -f /etc/nginx/conf.d/default.conf

COPY docker-entrypoint.sh /docker-entrypoint-pivocloud.sh
RUN chmod +x /docker-entrypoint-pivocloud.sh

# NEVER add `ENV PORT=...`. PivoCloud injects PORT at runtime and a baked value
# shadows it, failing the deploy with "did not respond on the PORT environment
# variable".
EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint-pivocloud.sh"]
CMD ["nginx", "-g", "daemon off;"]
