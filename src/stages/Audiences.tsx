import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { Counter, DeepDive, Head, Win } from '../components/ui';

const AU = scenario.audience;
const TABS = ['Use case 1: brand team builds an audience', 'Use case 2: follow up while interest is fresh'];

export function Audiences({ local, deep, consent }: StageProps) {
  const [tab, setTab] = useState(local);
  useEffect(() => setTab(local), [local]);
  return (
    <>
      <Head
        title={tab === 0 ? 'Side effect *priority*' : 'In the audience *two minutes* later'}
        sub="A segment is a saved rule set run against every unified profile. Two ways a brand team uses them."
      />
      <div className="seg light" role="group" aria-label="Use case" style={{ justifySelf: 'start' }}>
        {TABS.map((t, i) => <button key={t} aria-pressed={tab === i} onClick={() => setTab(i)}>{t}</button>)}
      </div>
      {tab === 0 ? <Build /> : <RealTime consent={consent} />}
      <DeepDive show={deep} title="how the segments run">
        <table className="dt">
          <tbody>
            <tr><td className="muted" style={{ width: 220 }}>Side effect priority</td><td>Standard or rapid publish, built point and click in Data 360 on the Zero Copy fields</td></tr>
            <tr><td className="muted">Real-time audience</td><td>Real-time segment on streamed web events, evaluated within seconds</td></tr>
            <tr><td className="muted">Consent</td><td>Checked per channel at activation; the real-time audience feeds an email follow-up, so it also requires email consent</td></tr>
          </tbody>
        </table>
      </DeepDive>
    </>
  );
}

/* Use case 1: the brand manager adds rules one at a time and the count falls. */
function Build() {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? AU.build.length : 0);
  useEffect(() => {
    if (n >= AU.build.length) return;
    const t = setTimeout(() => setN(x => x + 1), n === 0 ? 300 : 700);
    return () => clearTimeout(t);
  }, [n]);
  const count = n === 0 ? AU.build[0][1] as number : AU.build[n - 1][1] as number;
  return (
    <div className="split" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1.6fr) minmax(260px, 1fr)', alignItems: 'start' }}>
      <div style={{ display: 'grid', gap: 10 }}>
        <Win name="Segment builder" right={`Built by ${scenario.hcp.brandManager}, brand manager`} flush>
          <table className="dt">
            <thead><tr><th style={{ width: 52 }}></th><th>Rule</th><th style={{ textAlign: 'right' }}>Oncologists</th></tr></thead>
            <tbody>
              {AU.build.map(([label, c], i) => (
                <motion.tr key={label as string} initial={false} animate={{ opacity: i < n ? 1 : 0.35, backgroundColor: i < n ? 'var(--ok-soft)' : 'rgba(0,0,0,0)' }}>
                  <td className="muted" style={{ fontSize: 13 }}>{i === 0 ? 'Where' : 'And'}</td>
                  <td>{label}</td>
                  <td className="v" style={{ textAlign: 'right', color: i < n ? 'var(--ok)' : undefined }}>{(c as number).toLocaleString('en-US')}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </Win>
        <button className="btn" style={{ justifySelf: 'start' }} onClick={() => setN(0)}>Rebuild it step by step</button>
      </div>
      <Win name="Result" right="Ready to activate">
        <Counter value={count} className="big" />
        <span className="muted" style={{ fontSize: 14 }}>oncologists, {scenario.hcp.short} is one</span>
        <dl className="fields" style={{ gridTemplateColumns: '110px 1fr', marginTop: 6 }}>
          <dt>Time to build</dt><dd style={{ fontFamily: 'var(--font)', fontSize: 14 }}>About 5 minutes, point and click</dd>
          <dt>Before</dt><dd style={{ fontFamily: 'var(--font)', fontSize: 14 }}>A data request and a change order</dd>
          <dt>Uses</dt><dd style={{ fontFamily: 'var(--font)', fontSize: 14 }}>Snowflake score, Cortex topic, web behaviour</dd>
        </dl>
      </Win>
    </div>
  );
}

/* Use case 2: a streamed download puts her in a real-time audience within minutes. */
function RealTime({ consent }: { consent: boolean }) {
  const rt = AU.rt;
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="legend"><span className="tag alert">{rt.event}</span><span style={{ color: 'var(--ink)' }}>{rt.eventText}</span></div>
      <div className="split" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1.6fr) minmax(260px, 1fr)', alignItems: 'start' }}>
        <Win name="Real-time segment" right={rt.name} flush>
          <table className="dt">
            <thead><tr><th>Rule</th><th>{scenario.hcp.short}</th><th style={{ width: 50 }}></th></tr></thead>
            <tbody>
              {rt.rules.map(([label, val], i) => {
                const fails = label === 'Email consent is yes' && !consent;
                return (
                  <motion.tr key={label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.15 }}>
                    <td>{label}</td><td className="v">{fails ? 'No' : val}</td>
                    <td style={{ color: fails ? 'var(--magenta)' : 'var(--ok)', fontWeight: 600 }}>{fails ? '✕' : '✓'}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </Win>
        <Win name={consent ? 'Entered the audience' : 'Not entered'} right="Data 360">
          <span className="big" style={{ color: consent ? 'var(--blue)' : 'var(--faint)' }}>{consent ? rt.entered : 'No'}</span>
          <span className="muted" style={{ fontSize: 14 }}>{consent ? 'two minutes after her download' : 'no email consent, so no email follow-up'}</span>
          <dl className="fields" style={{ gridTemplateColumns: '150px 1fr', marginTop: 6 }}>
            <dt>Interests</dt><dd style={{ fontFamily: 'var(--font)', fontSize: 14 }}>Efficacy, Side effects (new)</dd>
            <dt>Matches call note</dt><dd style={{ fontFamily: 'var(--font)', fontSize: 14 }}>Yes: side effect management</dd>
            <dt>Snowflake alone</dt><dd style={{ fontFamily: 'var(--font)', fontSize: 14 }}>Tomorrow, after the nightly batch</dd>
          </dl>
        </Win>
      </div>
    </div>
  );
}
