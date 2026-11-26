import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { applyTheme, getStoredTheme } from './services/themeService';

if (typeof window !== 'undefined') {
  applyTheme(getStoredTheme());
  if ('caches' in window) {
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k === 'easylib-pwa-v1' || import.meta.env.DEV)
            .map((k) => caches.delete(k))
        )
      )
      .catch(() => undefined);
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => {
        regs.forEach((reg) => {
          reg.update().catch(() => undefined);
        });
      })
      .catch(() => undefined);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
