#!/bin/sh
set -e

# PivoCloud runs nothing on your behalf at deploy time, migrations included.
# Opt in by setting RUN_MIGRATIONS=true in the app's environment variables.
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "[entrypoint] running migrations"
  # npx prisma migrate deploy
fi

echo "[entrypoint] PORT=${PORT:-<not injected>}"
exec "$@"
