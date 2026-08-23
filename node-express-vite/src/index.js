import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// --- API routes first ---------------------------------------------------
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    // Echoed so a first deploy can be verified from the browser: this is the
    // port the platform injected, not one hardcoded in the image.
    port: process.env.PORT ?? "(unset, using fallback)",
    node: process.version,
  });
});

// --- Static frontend ----------------------------------------------------
// The Vite build is copied to ./public by the Dockerfile.
const clientDir = path.join(__dirname, "..", "public");
app.use(express.static(clientDir));

// SPA fallback: any unknown path returns index.html so client-side routing
// survives a hard refresh or a shared deep link. Must come after the API.
app.get("*", (_req, res) => res.sendFile(path.join(clientDir, "index.html")));

// --- Listen -------------------------------------------------------------
// PORT comes from the platform. The fallback is only for local runs.
// Never set ENV PORT in the Dockerfile: it would shadow the injected value.
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`[server] listening on 0.0.0.0:${port}`);
});
