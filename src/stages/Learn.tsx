import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { Head, Reveal, Win } from '../components/ui';

const L = scenario.learn;
const segN = scenario.audience.build[scenario.audience.build.length - 1][1] as number;
export const holdoutCount = Math.round(segN * L.holdoutShare);
export const liftPoints = L.engagedContacted - L.engagedHoldout;

export function Learn({ local }: StageProps) {
  const [pick, setPick] = useState(L.outcomes[0].id);
  const o = L.outcomes.find(x => x.id === pick)!;
  // Each beat reveals a section further down; bring it into view.
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (local >= 1) setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 450); }, [local]);
  return (
    <>
      <Head
        title="What changes *next week*"
        sub="What Dr. Ortiz does next changes what the brand does for her next week."
        meta={<span className="tag">Illustrative numbers</span>}
      />
      <div className="split" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(260px, 1fr) minmax(0, 1.6fr)', alignItems: 'start' }}>
        <div role="radiogroup" aria-label="Outcome" style={{ display: 'grid', gap: 8 }}>
          <span className="muted" style={{ fontSize: 14 }}>Simulate what happened after activation</span>
          {L.outcomes.map(x => (
            <button key={x.id} role="radio" aria-checked={pick === x.id} onClick={() => setPick(x.id)} className="win"
              style={{ textAlign: 'left', cursor: 'pointer', padding: '12px 16px', borderColor: pick === x.id ? 'var(--blue-bright)' : undefined, background: pick === x.id ? 'var(--blue-soft)' : undefined }}>
              <span style={{ fontWeight: 600 }}>{x.label}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={pick} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
            <Win name="What changes for Dr. Ortiz" right="Before and after" flush>
              <table className="dt">
                <thead><tr><th>What</th><th>Before</th><th>After</th></tr></thead>
                <tbody>{o.rows.map(([k, b, a]) => <tr key={k}><td>{k}</td><td className="v muted">{b}</td><td className="v" style={{ color: 'var(--ok)', fontWeight: 500 }}>{a}</td></tr>)}</tbody>
              </table>
              <div className="note-line" style={{ padding: '10px 14px', borderTop: '1px solid var(--line)' }}>Who learns: {o.who}</div>
            </Win>
          </motion.div>
        </AnimatePresence>
      </div>
      <Reveal when={local >= 1}>
        <Win name="What flows back" right="Back to Snowflake through Zero Copy" flush>
          <table className="dt">
            <tbody>{L.flowback.map(([what, how], i) => <tr key={what}><td className="num" style={{ fontSize: 20, width: 50 }}>{i + 1}</td><td style={{ fontWeight: 500 }}>{what}</td><td className="muted">{how}</td></tr>)}</tbody>
          </table>
        </Win>
      </Reveal>
      <Reveal when={local >= 2}>
        <Win name="Proving it works: a holdout group in Snowflake" right={`${L.holdoutDays} days`}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'grid' }}><span className="big" style={{ fontSize: 44 }}>{holdoutCount}</span><span className="muted" style={{ fontSize: 13 }}>of {segN} held back</span></div>
            <div style={{ display: 'grid' }}><span className="big" style={{ fontSize: 44, color: 'var(--blue)' }}>{L.engagedContacted}%</span><span className="muted" style={{ fontSize: 13 }}>contacted, engaged</span></div>
            <div style={{ display: 'grid' }}><span className="big" style={{ fontSize: 44, color: 'var(--faint)' }}>{L.engagedHoldout}%</span><span className="muted" style={{ fontSize: 13 }}>holdout, engaged</span></div>
            <div style={{ display: 'grid' }}><span className="big g" style={{ fontSize: 44 }}>{liftPoints} pts</span><span className="muted" style={{ fontSize: 13 }}>caused by the program</span></div>
          </div>
          <span className="muted" style={{ fontSize: 14 }}>Hold back {Math.round(L.holdoutShare * 100)}% of {scenario.audience.name} from every action. After {L.holdoutDays} days, compare engagement and new patient starts from IQVIA.</span>
        </Win>
      </Reveal>
      <div ref={endRef} />
    </>
  );
}
