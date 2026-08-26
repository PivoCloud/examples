# Test fixture for PivoCloud phase 77.3.
#
# THE BASE IMAGE IS THE WHOLE POINT. `python:3.12-alpine` was measured absent
# from the production worker's image store on 2026-08-26, which is exactly the
# condition the 77.3 defect needed: the worker selected BuildKit but opened no
# BuildKit session, and BuildKit resolves registry metadata THROUGH a session,
# so any base not already in the local image store died at
# `[internal] load metadata` with `no active sessions`.
#
# If this app builds and serves, the worker opened a session. Before the fix it
# could not have.
#
# Do NOT change this to a base image the platform already has (node:*, nginx:*,
# postgres:*). That would make the fixture pass for the wrong reason, which is
# the exact failure mode that let the defect ship for three weeks.
FROM python:3.12-alpine

WORKDIR /app
COPY server.py .

EXPOSE 8000
CMD ["python", "server.py"]
