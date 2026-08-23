# node-express-vite

Express API serving a built Vite (React) frontend from **one container, one
HTTP port, one billed service**.

This is the recommended shape for most applications. It is also the one with
the fewest moving parts: no CORS, no second deploy to keep in sync, no second
bill.

## Layout

```
.
├── Dockerfile
├── docker-entrypoint.sh
├── package.json          <- backend
├── src/index.js          <- Express, serves /api and the built frontend
└── client/               <- Vite app with its own package.json
```

## Deploy it

1. Push this directory to a Git repository.
2. Create a **Dockerfile Deployment** app on PivoCloud pointing at it.
3. Paste your environment variables (none are required for this example).

Open the app. The page fetches `/api/health` and prints the port the container
is actually listening on, so a first deploy is self-verifying.

## Run it locally

```sh
npm install
npm --prefix client install
npm --prefix client run dev      # frontend on :5173, proxying /api to :3000
npm start                        # backend on :3000
```

Or the way the platform runs it:

```sh
docker build -t example .
docker run --rm -e PORT=9000 -p 9000:9000 example
```

Note the port is passed in rather than baked in. That is the whole point.

## Making it yours

- Replace `src/` with your API and `client/` with your frontend.
- Keep the route order in `src/index.js`: **API first, static second, SPA
  fallback last.** A fallback registered before your API will swallow it.
- Adding Prisma: uncomment the two lines in the Dockerfile's `server` stage
  (`COPY prisma` and `npx prisma generate`), and the `migrate deploy` line in
  `docker-entrypoint.sh`. Migrations then run only when you set
  `RUN_MIGRATIONS=true`.
- Anything the browser needs at build time goes through `ARG`/`ENV` in the
  `client` stage, not the platform's runtime variables.
