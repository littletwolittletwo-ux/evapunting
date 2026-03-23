import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (err) {
  // If React fails to mount at all, show the error in the DOM
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding:2rem;font-family:system-ui;max-width:600px;margin:2rem auto">
        <h1 style="color:#dc2626">Fatal Error</h1>
        <pre style="background:#f3f4f6;padding:1rem;border-radius:0.5rem;overflow:auto;font-size:12px;white-space:pre-wrap">${
          err instanceof Error ? err.stack || err.message : String(err)
        }</pre>
      </div>`;
  }
}
