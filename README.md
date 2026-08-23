# PivoCloud examples

The deployment contract for [PivoCloud](https://pivocloud.com), and working
examples that meet it.

Each example is its own repository, so you can deploy it as-is or press **Use
this template** to get your own copy already set up.

| Example | What it is |
|---|---|
| [example-node-express-vite](https://github.com/PivoCloud/example-node-express-vite) | Express API serving a built Vite frontend. **One service, one bill.** |
| [example-vite-static-nginx](https://github.com/PivoCloud/example-vite-static-nginx) | A built Vite frontend served by nginx, as its own service. |

> **Why separate repositories?** PivoCloud builds from the root of a repository
> and has no root-directory setting yet, so an example living in a
> subdirectory cannot be deployed. One repo per example keeps every one of them
> a single paste away from running.

## The deployment contract


Six rules. Meet them and your app deploys. Most deploy failures are one of the
first two.

### 1. A Dockerfile at the root of the repository

PivoCloud builds from your Dockerfile. There is no build auto-detection, no
buildpack, and no framework guessing.

This is deliberate, and it is the answer to "which Node/Python/Go versions do
you support": **whichever your base image pins.** The runtime is yours to
choose, not ours to bless, so nothing breaks under you when we upgrade.

### 2. Listen on the port you declare with `EXPOSE`

**PivoCloud does not set a `PORT` environment variable.** It probes the port
your image declares with `EXPOSE`, so that is the port your process has to be
listening on.

Write it so the same image is correct everywhere. Read `PORT` if something set
it, because Render, Railway and Heroku all do, and fall back to the value you
declared with `EXPOSE`:

```js
// Dockerfile says: EXPOSE 8080
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0");
```

Do not hardcode a value that differs from `EXPOSE`, and do not set `ENV PORT`
in the Dockerfile: a variable baked into the image is one more place for the
two numbers to drift apart.

When this is wrong, the deploy fails with *"the container started but your app
did not respond on the PORT environment variable"*. Read that message as **"we
could not reach your app on the port it declared"**, because it is emitted for
almost every boot failure and it names a variable we do not actually set. If
you see it, check `EXPOSE` against the port in your startup log first, then
read the container logs.

### 3. Bind `0.0.0.0`, not `localhost`

A server bound to `127.0.0.1` inside a container is reachable by nothing
outside it.

### 4. One HTTP port per app

An app exposes exactly one HTTP port. If your project is a backend plus a
frontend, you have two choices:

- **Serve the built frontend from the backend.** One repo, one Dockerfile, one
  container, one billed service. See `node-express-vite`.
- **Deploy them as two apps.** Two Dockerfiles, two billed services. Sometimes
  the right call, especially mid-migration when you would rather not change
  application code at the same time as changing host.

A worker with no HTTP surface does not fit the app model. Neither do services
that must scale independently.

### 5. Nothing runs your migrations

No release phase, no automatic `migrate` step. If your schema needs migrating,
do it explicitly, and make it opt-in so a container restart cannot surprise
you:

```sh
if [ "$RUN_MIGRATIONS" = "true" ]; then
  npx prisma migrate deploy
fi
exec "$@"
```

Both examples ship this pattern in their entrypoint.

### 6. The filesystem is ephemeral

Containers are replaced on every deploy, and on an environment-variable change.
Anything written to local disk is gone. There is no persistent disk product.

Uploads belong in object storage (Cloudinary, S3-compatible, anything with an
API). Sessions and caches belong in your database or a managed store, not on
disk.

## Connecting to a managed PostgreSQL

- Server version is **17.10** across every tier.
- TLS is enforced, with a **self-signed certificate per database**. Use
  `sslmode=require`. `verify-full` will fail, and the error will not mention
  certificates.
- Driver behaviour differs and the symptoms never mention TLS: `postgres.js`
  wants `sslmode=require` in the URL, `node-postgres` may additionally want
  `uselibpqcompat=true`. If a connection hangs or is refused with a vague
  error, suspect the TLS parameters before anything else.
- **There is no connection pooler in the path.** If your tool expects a
  separate pooled and direct host (Neon-style), both values are the same
  string, and migration tools that refuse to run through a transaction pooler
  are safe here.

## Environment variables

Paste your whole `.env` into the app's environment variables, including at
creation time so the app starts with them already in place. They are encrypted
at rest.

Applying variables **replaces the container**, so treat it as a restart rather
than a hot reload.

One thing that surprises people: **`VITE_*` variables are read at build time**
and baked into the JavaScript bundle. Setting them in the platform's runtime
environment has no effect on the browser. Pass them as build arguments.

## Contributing

These are the configurations we actually run. If one breaks, or you have a
stack we should cover, open an issue.

## Licence

MIT. See [LICENSE](./LICENSE).
