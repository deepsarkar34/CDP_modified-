import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { Counter, Head, Reveal, Win } from '../components/ui';

const MODE_TEXT = ['Daily. Email and CRM lists.', 'Several times a day. Faster campaigns.', 'Within seconds. Web and triggers.'];

export function Segment({ local, v, deep, consent }: StageProps) {
  const rules = scenario.segment.rules;
  const [passed, setPassed] = useState(local >= 1 ? rules.length : 0);
  const [mode, setMode] = useState(0);

  // Apply rules one at a time so the count visibly drops.
  useEffect(() => {
    if (local < 1) { setPassed(0); return; }
    if (passed >= rules.length) return;
    const t = setTimeout(() => setPassed(p => p + 1), passed === 0 ? 300 : 750);
    return () => clearTimeout(t);
  }, [local, passed, rules.length]);

  const count = passed === 0 ? scenario.segment.universe : (rules[passed - 1][2] as number);
  return (
    <>
      <Head
        title={`Retina *priority*`}
        sub={`${v.segment}. Every unified profile is checked against these rules.`}
      />
      {v.partners?.segment && <span className="tag" style={{ justifySelf: 'start' }}>Built in a partner tool on top of the lakehouse</span>}
      <div className="split" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1.6fr) minmax(250px, 1fr)', alignItems: 'start' }}>
        <Win name="Segment builder" right={scenario.segment.name} flush>
          <table className="dt">
            <thead><tr><th style={{ width: 52 }}></th><th>Rule</th><th>Dr. Brown</th><th style={{ width: 70, textAlign: 'right' }}>Result</th></tr></thead>
            <tbody>
              {rules.map(([label, his, n, expr], i) => {
                const ok = passed > i;
                return (
                  <motion.tr key={label as string} initial={false} animate={{ backgroundColor: ok ? 'var(--ok-soft)' : 'rgba(0,0,0,0)' }}>
                    <td className="muted" style={{ fontSize: 13 }}>{i === 0 ? 'Where' : 'And'}</td>
                    <td>{label}{deep && <code className="mono muted" style={{ display: 'block', fontSize: 12 }}>{expr}</code>}</td>
                    <td className="v">{his}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      <motion.span initial={false} animate={{ opacity: ok ? 1 : 0 }} style={{ color: 'var(--ok)', fontWeight: 600 }}>{(n as number).toLocaleString('en-US')}</motion.span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </Win>
        <div className="win" style={{ padding: 22, gap: 6, justifyItems: 'center', textAlign: 'center', display: 'grid' }}>
          <span className="muted" style={{ fontSize: 14 }}>HCPs in segment</span>
          <Counter value={count} className="big" />
          <span className="muted" style={{ fontSize: 14 }}>{passed === 0 ? 'Eye-care HCP universe' : `${passed} of ${rules.length} rules applied`}</span>
          {passed === rules.length && <span className="tag ok" style={{ marginTop: 6 }}>Dr. Brown qualifies</span>}
        </div>
      </div>
      <Reveal when={local >= 2}>
        <div className="split" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1.6fr) minmax(250px, 1fr)', alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <span className="muted" style={{ fontSize: 14 }}>Refresh</span>
            <div role="radiogroup" style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              {v.publish.map((m, i) => (
                <button key={m} role="radio" aria-checked={mode === i} onClick={() => setMode(i)} className="win"
                  style={{ textAlign: 'left', cursor: 'pointer', padding: '10px 14px', gap: 2, borderColor: mode === i ? 'var(--blue-bright)' : undefined, background: mode === i ? 'var(--blue-soft)' : undefined }}>
                  <span style={{ fontWeight: 600 }}>{m}</span><span className="muted" style={{ fontSize: 13.5 }}>{MODE_TEXT[i]}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            <span className="muted" style={{ fontSize: 14 }}>Consent</span>
            <div className="win" style={{ padding: '10px 14px', gap: 4, borderColor: consent ? undefined : 'var(--magenta)' }}>
              <span style={{ fontWeight: 600, color: consent ? undefined : 'var(--magenta)' }}>Email consent {consent ? 'on' : 'off'}</span>
              <span className="muted" style={{ fontSize: 13.5 }}>{consent ? 'Checked per channel at activation.' : 'Stays in segment. Removed from email only.'}</span>
            </div>
          </div>
        </div>
      </Reveal>
    </>
  );
}
