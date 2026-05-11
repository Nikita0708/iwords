import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { Home } from './pages/Home';
import { DeckView } from './pages/DeckView';
import { StudyView } from './pages/StudyView';

const LIGHT_THEME = {
  '--tg-theme-bg-color': '#ffffff',
  '--tg-theme-secondary-bg-color': '#f4f4f5',
  '--tg-theme-text-color': '#000000',
  '--tg-theme-hint-color': '#999999',
  '--tg-theme-link-color': '#2481cc',
  '--tg-theme-button-color': '#2481cc',
  '--tg-theme-button-text-color': '#ffffff',
};

function applyTheme(overrides: Record<string, string>) {
  const root = document.documentElement;
  Object.entries(overrides).forEach(([k, v]) => v && root.style.setProperty(k, v));
}

// Always start with light defaults, then override with Telegram theme if present
applyTheme(LIGHT_THEME);

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready?.();
  tg.expand?.();
  const p = tg.themeParams ?? {};
  applyTheme({
    '--tg-theme-bg-color': p.bg_color ?? '',
    '--tg-theme-secondary-bg-color': p.secondary_bg_color ?? '',
    '--tg-theme-text-color': p.text_color ?? '',
    '--tg-theme-hint-color': p.hint_color ?? '',
    '--tg-theme-link-color': p.link_color ?? '',
    '--tg-theme-button-color': p.button_color ?? '',
    '--tg-theme-button-text-color': p.button_text_color ?? '',
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/deck/:id" element={<DeckView />} />
        <Route path="/study/:id" element={<StudyView />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
