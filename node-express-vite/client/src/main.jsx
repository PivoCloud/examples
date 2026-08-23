import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", lineHeight: 1.6 }}>
      <h1>Deployed on PivoCloud</h1>
      <p>This page is the Vite build. It is served by the Express process in the same container.</p>
      <h2>API response</h2>
      {error && <pre style={{ color: "crimson" }}>{error}</pre>}
      <pre>{health ? JSON.stringify(health, null, 2) : "loading..."}</pre>
      <p>
        If <code>port</code> above matches the port the platform injected, the
        container is reading <code>PORT</code> correctly.
      </p>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
