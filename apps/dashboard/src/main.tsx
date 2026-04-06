import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Debug: catch any uncaught errors and render them visually
window.addEventListener('error', (e) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding:40px;color:#ef4444;font-family:monospace;background:#0a0a0a;min-height:100vh">
      <h1 style="color:#c19b3a;margin-bottom:20px">⚠️ Dashboard Runtime Error</h1>
      <pre style="white-space:pre-wrap;word-break:break-all;color:#f87171">${e.message}\n\nFile: ${e.filename}\nLine: ${e.lineno}:${e.colno}</pre>
    </div>`;
  }
});

window.addEventListener('unhandledrejection', (e) => {
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `<div style="padding:40px;color:#ef4444;font-family:monospace;background:#0a0a0a;min-height:100vh">
      <h1 style="color:#c19b3a;margin-bottom:20px">⚠️ Dashboard Promise Rejection</h1>
      <pre style="white-space:pre-wrap;word-break:break-all;color:#f87171">${e.reason}</pre>
    </div>`;
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
