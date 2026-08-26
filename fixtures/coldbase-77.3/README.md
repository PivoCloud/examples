# Cold-base fixture (internal, phase 77.3)

**This is not a customer example.** It is deliberately not listed in the table in
the repository root README. It exists to prove one platform property, and a
customer copying it would learn nothing useful.

## What it proves

Phase 77.3 fixed a defect where the worker selected BuildKit but never opened a
BuildKit **session**. BuildKit resolves registry metadata *through* a session, so
any base image not already in the worker's local image store failed at
`[internal] load metadata` with `no active sessions`. It blocked the first
production customer on 2026-08-25.

Proving the fix needs an app whose base image the worker has **never pulled**.
The original plan made that condition by deleting two images from the production
image store and redeploying a paying customer's app. This fixture reaches the
same condition by simply naming a base production has never had, so nothing is
deleted and no customer app is touched.

`python:3.12-alpine` was measured absent from the production worker's image store
on 2026-08-26.

## Deploy settings

| Setting | Value |
|---|---|
| Repository | `PivoCloud/examples` |
| Root directory | `fixtures/coldbase-77.3` |
| Dockerfile path | `Dockerfile` |
| Port | 8000 (from `EXPOSE`) |

## What a pass looks like

1. The app reaches **running** with no `deployment_jobs.error_message`.
2. Its hostname answers **200** over HTTPS and renders the fixture page.
3. `python:3.12-alpine` is **still absent** from `docker images` on the worker.

Point 3 is the one to read twice. It is the **correct** outcome, not a failure:
dockerd-integrated BuildKit resolves a base into its own content store, never
into the docker image store. An earlier draft of the production checklist asked
an operator to confirm the opposite, which would have produced a false negative
on exactly the run that proves the fix.

## Rule for whoever edits this

Do not change the base image to one the platform already has (`node:*`,
`nginx:*`, `postgres:*`). A fixture that passes because its base was cached
proves nothing, and that is precisely the blind spot that let the defect ship
for three weeks.
