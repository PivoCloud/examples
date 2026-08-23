import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", lineHeight: 1.6 }}>
      <h1>Static frontend on PivoCloud</h1>
      <p>
        This is a Vite build served by nginx, deployed as its own app. The API
        it talks to lives in a separate service.
      </p>
      <p>
        The build is baked into the image, so <code>VITE_*</code> variables must
        be passed at build time. Runtime environment variables never reach the
        browser.
      </p>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
