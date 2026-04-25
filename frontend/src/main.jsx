import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ===== PWA SERVICE WORKER =====
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('WasteWise PWA ready ✅', reg.scope))
      .catch(err => console.error('SW registration failed:', err));
  });
}

// ===== INSTALL BANNER =====
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  if (localStorage.getItem('pwa-dismissed')) return;
  const banner = document.createElement('div');
  banner.id = 'install-banner';
  banner.style.cssText = `
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
    background: #2d6a4f; color: white; padding: 16px 20px;
    display: flex; align-items: center; justify-content: space-between;
    border-radius: 24px 24px 0 0; box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
    font-family: Inter, sans-serif; animation: fadeInUp 0.3s ease;
  `;
  banner.innerHTML = `
    <div style="display:flex; align-items:center; gap:12px;">
      <span style="font-size:28px;">🌱</span>
      <div>
        <div style="font-weight:700; font-size:15px;">Install WasteWise</div>
        <div style="font-size:12px; opacity:0.8;">Works offline · Get checkpoint reminders</div>
      </div>
    </div>
    <div style="display:flex; gap:8px; align-items:center;">
      <button id="install-btn" style="
        background:white; color:#2d6a4f; border:none; border-radius:999px;
        padding:8px 18px; font-weight:700; font-size:13px; cursor:pointer;
      ">Install</button>
      <button id="dismiss-btn" style="
        background:transparent; color:rgba(255,255,255,0.7); border:none;
        font-size:13px; cursor:pointer; padding:8px;
      ">✕</button>
    </div>
  `;
  document.body.appendChild(banner);
  document.getElementById('install-btn').onclick = () => {
    e.prompt();
    e.userChoice.then(() => banner.remove());
  };
  document.getElementById('dismiss-btn').onclick = () => {
    localStorage.setItem('pwa-dismissed', '1');
    banner.remove();
  };
});
