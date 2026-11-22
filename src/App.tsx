import { AnimatePresence, motion } from 'framer-motion';
import type { ComponentType } from 'react';
import { useDemo, currentBeat } from './store';
import { BEATS, STEPS } from './beats';
import { VENDORS } from './vendors';
import { useKeyboard, openPresenter } from './keyboard';
import scenario from './scenario/scenario.json';
import { Logo } from './components/Logo';
import { Hook } from './stages/Hook';
import { Capture } from './stages/Capture';
import { Clean } from './stages/Clean';
import { Master } from './stages/Master';
import { AiMl } from './stages/AiMl';
import { Resolve } from './stages/Resolve';
import { Audiences } from './stages/Audiences';
import { Decide } from './stages/Decide';
import { Activate } from './stages/Activate';
import { Learn } from './stages/Learn';
import { PASSES, isActive, decisionLabel, type Mode } from './decision';
import type { StageProps } from './stages/types';

const STAGES: ComponentType<StageProps>[] = [Hook, Capture, Clean, Master, AiMl, Resolve, Audiences, Decide, Activate, Learn];
const DECIDE = 7;

// Short, factual status per step: what the systems know about her right now.
const status = (step: number, mode: Mode, consent: boolean) => [
  '6 fragments, not linked yet',
  '8 records in 6 systems',
  'Records standardized, patient IDs re-tokenized',
  `Golden ID ${scenario.hcp.goldenId}`,
  'Likelihood score 0.81, call note topic: side effect management',
  'Recognized by email, CRM ID and web device',
  `In ${scenario.audience.name} (342 oncologists) and the real-time audience since 10:16`,
  `Next action: ${decisionLabel(mode, consent).toLowerCase()}`,
  'Reached by email, her rep, HCP media and the website',
  'Her response changes next week',
][step];

type ZoneKey = 'sources' | 'engineering' | 'cdp' | 'decision' | 'channels';
const ZONES: { key: ZoneKey; steps: number[] }[] = [
  { key: 'sources', steps: [0, 1] },
  { key: 'engineering', steps: [2, 3, 4] },
  { key: 'cdp', steps: [5, 6] },
  { key: 'decision', steps: [7] },
  { key: 'channels', steps: [8, 9] },
];

export default function App() {
  useKeyboard();
  const { beat, vendor, deepDive, consent, mode, sub, subPlaying, setSub, requestSub, next, prev, jumpStep, toggleDeepDive, toggleConsent } = useDemo();
  const b = currentBeat(beat);
  const v = VENDORS[vendor];
  const Stage = STAGES[b.step];
  const stepBeats = STEPS[b.step].notes.length;

  return (
    <div className="app">
      <div className="chrome">
        <header className="topbar">
          <div className="brand">
            <Logo />
            <span className="divider" aria-hidden />
            <span className="title"><b>Customer data platform</b> walkthrough for {scenario.brand}</span>
          </div>
          <span className="stack-label">Snowflake + Salesforce Data 360</span>
          <button className={`tog ${deepDive ? 'on' : ''}`} onClick={toggleDeepDive} aria-pressed={deepDive}><span className="dot" />Technical <kbd>D</kbd></button>
          <button className={`tog ${consent ? '' : 'alert'}`} onClick={toggleConsent} aria-pressed={!consent}><span className="dot" />Email consent {consent ? 'on' : 'off'} <kbd>C</kbd></button>
          <button className="tog" onClick={openPresenter}>Notes <kbd>P</kbd></button>
        </header>

        <nav className="map" aria-label="Pipeline">
          {ZONES.map(z => (
            <div key={z.key} className="zone">
              <div className="zone-name" title={v.zones[z.key]}>{v.zones[z.key]}</div>
              <div className="zone-steps">
                {z.steps.map(i => {
                  const cur = i === b.step;
                  return (
                    <button key={i} className={`step ${i < b.step ? 'done' : ''}`} aria-current={cur ? 'step' : undefined} onClick={() => jumpStep(i)}>
                      <span className="n">{String(i + 1).padStart(2, '0')}</span>
                      <span className="t">{STEPS[i].title}</span>
                      {cur && <span className="prog" style={{ width: `${((b.local + 1) / stepBeats) * 100}%` }} />}
                    </button>
                  );
                })}
              </div>
              {z.key === 'decision' && (
                <div className="subs" aria-label="Decision passes">
                  {PASSES.map(p => {
                    const active = isActive(p.n, mode);
                    const here = b.step === DECIDE;
                    const done = active && (b.step > DECIDE || (here && sub >= p.n));
                    const live = active && here && sub === p.n && subPlaying;
                    return (
                      <button key={p.n} className={`sl ${done ? 'done' : ''} ${live ? 'live' : ''} ${active ? '' : 'off'}`}
                        title={`Pass ${p.n}: ${p.name}${active ? '' : ' (off in Rules only)'}`}
                        onClick={() => { if (!active) return; if (here) setSub(p.n, true); else { requestSub(p.n); jumpStep(DECIDE); } }}>
                        {p.n} {p.short}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <main className="stage" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div key={b.step} className="stage-inner"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
            <Stage local={b.local} v={v} deep={deepDive} consent={consent} />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="foot">
        <div className="who">
          <div className="avatar" aria-hidden>{scenario.hcp.initials}</div>
          <span><b style={{ fontWeight: 600 }}>{scenario.hcp.short}</b> <span className="muted">{status(b.step, mode, consent)}</span></span>
        </div>
        <span className="disclaimer" title={scenario.disclaimer}>Illustrative data</span>
        <div className="dots" aria-label={`Beat ${beat + 1} of ${BEATS.length}`}>
          {Array.from({ length: stepBeats }, (_, i) => <span key={i} className={i <= b.local ? 'on' : ''} />)}
        </div>
        <button className="btn" onClick={prev} disabled={beat === 0}>Back</button>
        <button className="btn primary" onClick={next} disabled={beat === BEATS.length - 1}>Next ↗</button>
      </footer>
    </div>
  );
}
