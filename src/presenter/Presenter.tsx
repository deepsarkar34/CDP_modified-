import { useEffect, useState } from 'react';
import { useDemo } from '../store';
import { BEATS, STEPS, TARGET_SECONDS } from '../beats';
import { VENDORS } from '../vendors';
import { useKeyboard } from '../keyboard';

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Laptop-only view: speaker notes, what comes next, and a timer against the 12-minute target. */
export default function Presenter() {
  useKeyboard({ presenterWindow: true });
  const { beat, vendor, deepDive, consent, startedAt, next, prev } = useDemo();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(t); }, []);
  useEffect(() => { document.title = 'Presenter notes'; }, []);

  const b = BEATS[beat];
  const nb = BEATS[beat + 1];
  const elapsed = startedAt ? (now - startedAt) / 1000 : 0;
  const expected = (beat / (BEATS.length - 1)) * TARGET_SECONDS;
  const pace = startedAt ? elapsed - expected : 0;

  return (
    <div className="presenter">
      <header style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className={`timer ${elapsed > TARGET_SECONDS ? 'over' : ''}`}>{fmt(elapsed)}</div>
        <div style={{ display: 'grid', gap: 4, flex: 1, minWidth: 220 }}>
          <span className="muted" style={{ fontSize: 14 }}>
            Target {fmt(TARGET_SECONDS)}, {startedAt ? (Math.abs(pace) < 20 ? 'on pace' : pace > 0 ? `${fmt(pace)} behind` : `${fmt(-pace)} ahead`) : 'starts on first →'}
          </span>
          <div className="bar"><div style={{ width: `${((beat + 1) / BEATS.length) * 100}%` }} /></div>
        </div>
        <span className="tag">{VENDORS[vendor].label}</span>
        {deepDive && <span className="tag blue">Technical on</span>}
        {!consent && <span className="tag alert">Consent off</span>}
      </header>

      <main style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
        <span className="muted">{String(b.step + 1).padStart(2, '0')} {STEPS[b.step].title}, beat {b.local + 1} of {STEPS[b.step].notes.length}</span>
        <p className="now">{b.note}</p>
        <div className="win" style={{ padding: '12px 16px', gap: 4 }}>
          <span className="muted" style={{ fontSize: 13 }}>Next</span>
          <p className="next">{nb ? `${STEPS[nb.step].title}: ${nb.note}` : 'End of demo. Open for questions.'}</p>
        </div>
      </main>

      <footer style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <span className="muted" style={{ fontSize: 13 }}>Arrows move, 1 to 7 jump, D technical, V platform, C consent, R reset</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={prev}>← Back</button>
          <button className="btn primary" onClick={next}>Next →</button>
        </div>
      </footer>
    </div>
  );
}
