# PivoCloud examples

The deployment contract for [PivoCloud](https://pivocloud.com), and working
examples that meet it.

Each example is its own repository, so you can deploy it as-is or press **Use
this template** to get your own copy already set up.

The deployment contract and the rest of the documentation live at [docs.pivocloud.com](https://docs.pivocloud.com).

| Example | What it is |
|---|---|
| [example-node-express-vite](https://github.com/PivoCloud/example-node-express-vite) | Express API serving a built Vite frontend. **One service, one bill.** |
| [example-vite-static-nginx](https://github.com/PivoCloud/example-vite-static-nginx) | A built Vite frontend served by nginx, as its own service. |
| [example-monorepo-two-apps](https://github.com/PivoCloud/example-monorepo-two-apps) | An API and a frontend in one repository, deployed as two apps. **Two Dockerfiles, no Dockerfile at the root.** |

> **Why separate repositories?** So that each one is a single paste away from
> running, and **Use this template** gives you a copy of that example and
> nothing else. It is not a platform limit: an app builds from whichever
> subdirectory you point it at, which is what `monorepo-two-apps` is there to
> show.

## The deployment contract

The six rules a repository must meet now live at
[docs.pivocloud.com](https://docs.pivocloud.com), kept in one place so they
cannot drift from the platform.

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
environment has no effect on the browser, and PivoCloud passes no build
arguments, so a `VITE_*` value can only be whatever your repository contained
when the image was built.

Anything the browser has to learn per environment goes in at container start
instead: have your entrypoint render a small `config.js` from the environment,
and read it from the page. `monorepo-two-apps` does exactly that to tell its
frontend where its API lives.

## Contributing

These are the configurations we actually run. If one breaks, or you have a
stack we should cover, open an issue.

## Licence

MIT. See [LICENSE](./LICENSE).
