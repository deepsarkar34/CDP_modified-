import { useEffect } from 'react';
import { useDemo } from './store';
import { STEPS } from './beats';

export function openPresenter() {
  const url = new URL(location.href);
  url.searchParams.set('presenter', '1');
  window.open(url.toString(), 'cdp-presenter', 'width=1000,height=700');
}

export function toggleTheme() {
  const root = document.documentElement;
  if (root.dataset.theme === 'dark') delete root.dataset.theme; else root.dataset.theme = 'dark';
}

/** Global presenter keys. Works with most clickers (they send arrows / PageUp / PageDown). */
export function useKeyboard(opts: { presenterWindow?: boolean } = {}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest('input,textarea,select')) return;
      const s = useDemo.getState();
      const k = e.key;
      if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') { e.preventDefault(); s.next(); }
      else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); s.prev(); }
      else if (/^[0-9]$/.test(k)) { const n = k === '0' ? 10 : +k; if (n <= STEPS.length) s.jumpStep(n - 1); }
      else if (k === 'd' || k === 'D') s.toggleDeepDive();
      else if (k === 'c' || k === 'C') s.toggleConsent();
      else if (k === 'm' || k === 'M') s.toggleMode();
      else if (k === 'r' || k === 'R') s.reset();
      else if (k === 't' || k === 'T') toggleTheme();
      else if ((k === 'p' || k === 'P') && !opts.presenterWindow) openPresenter();
      else if ((k === 'f' || k === 'F') && !opts.presenterWindow) {
        if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [opts.presenterWindow]);
}
