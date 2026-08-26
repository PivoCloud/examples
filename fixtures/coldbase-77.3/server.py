"""Minimal fixture server: reports what built it, so a green page cannot be
mistaken for a cached or stale deploy."""
import http.server
import os
import socketserver

PORT = 8000
BASE_IMAGE = "python:3.12-alpine"


class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        body = (
            "<!doctype html><meta charset=utf-8>"
            "<title>PivoCloud cold-base fixture</title>"
            "<h1>PivoCloud cold-base fixture</h1>"
            f"<p>Built <code>FROM {BASE_IMAGE}</code>, a base image the production "
            "worker had never pulled.</p>"
            "<p>This page rendering means the worker opened a BuildKit session and "
            "resolved that base from the registry. Phase 77.3.</p>"
            f"<p>python: {os.sys.version.split()[0]}</p>"
        ).encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        print("[fixture] " + fmt % args, flush=True)


with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"[fixture] serving on :{PORT} from {BASE_IMAGE}", flush=True)
    httpd.serve_forever()
