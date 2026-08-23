# vite-static-nginx

A built Vite (React) frontend served by nginx, deployed as **its own app**.

Use this when the frontend and the backend are two separate services. If the
backend can serve the build instead, prefer
[`../node-express-vite`](../node-express-vite): one container, one bill, no
CORS.

PivoCloud has no static-site product. Every app is a Dockerfile deployment, so
a "static site" here is nginx in a container. That is what this builds.

## Layout

```
.
├── Dockerfile
├── docker-entrypoint.sh      <- substitutes the injected PORT into the config
├── nginx.conf.template
├── index.html
├── src/main.jsx
└── vite.config.js
```

## Deploy it

1. Push this directory to a Git repository.
2. Create a **Dockerfile Deployment** app on PivoCloud pointing at it.

## Run it locally

```sh
npm install
npm run dev                       # :5173

docker build -t example-static .
docker run --rm -e PORT=9000 -p 9000:9000 example-static
```

## What the config handles, and why

- **The port.** nginx cannot read an environment variable inside its own
  configuration. The entrypoint substitutes `__PORT__` from the injected
  `PORT` at startup, using `sed` rather than `envsubst` so it cannot
  accidentally eat nginx's own `$uri` and `$host`.
- **SPA fallback.** `try_files $uri $uri/ /index.html`, so a deep link still
  works on a hard refresh.
- **Caching.** Vite emits content-hashed filenames, so `/assets/` is cached for
  a year, while `index.html` is never cached. Get this backwards and users keep
  loading the previous bundle after every deploy.

## Making it yours

- Replace `src/` and `index.html`.
- If your build output is not `dist/`, change the `COPY --from=build` line.
- `VITE_*` variables are build-time. Pass them with `ARG`/`ENV` in the build
  stage; setting them in the platform's runtime environment has no effect.
