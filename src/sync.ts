// Keeps the main (projector) window and the presenter window in lockstep via BroadcastChannel.
import { useDemo, type DemoState } from './store';

const KEYS: (keyof DemoState)[] = ['beat', 'vendor', 'deepDive', 'consent', 'mode', 'startedAt'];

export function startSync() {
  if (typeof BroadcastChannel === 'undefined') return () => {};
  const ch = new BroadcastChannel('cdp-journey-demo');
  let applying = false;

  ch.onmessage = e => {
    if (e.data?.type === 'state') { applying = true; useDemo.getState().hydrate(e.data.state); applying = false; }
    if (e.data?.type === 'hello') send();
  };

  function send() {
    const s = useDemo.getState();
    const state = Object.fromEntries(KEYS.map(k => [k, s[k]]));
    ch.postMessage({ type: 'state', state });
  }

  const unsub = useDemo.subscribe((s, prev) => {
    if (applying) return;
    if (KEYS.some(k => s[k] !== prev[k])) send();
  });

  ch.postMessage({ type: 'hello' });
  return () => { unsub(); ch.close(); };
}
