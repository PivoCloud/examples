import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Local dev only: proxy API calls to the Express process. In production the
  // same Express process serves this build, so there is no cross-origin call
  // and no CORS configuration to get wrong.
  server: {
    proxy: { "/api": "http://localhost:3000" },
  },
});
