#!/bin/sh
set -e

# PivoCloud injects PORT. Fall back only so the image is runnable locally.
: "${PORT:=8080}"

# Plain sed rather than envsubst: no extra package, and it cannot accidentally
# eat nginx's own $uri / $host variables the way an unfiltered envsubst does.
sed "s/__PORT__/${PORT}/g" \
    /etc/nginx/conf.d/default.conf.template \
    > /etc/nginx/conf.d/default.conf

echo "[entrypoint] nginx will listen on ${PORT}"
exec "$@"
