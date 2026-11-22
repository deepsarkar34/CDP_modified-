import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { Head, Reveal, Win } from '../components/ui';
import { useDemo } from '../store';

const L = scenario.learn;
const segmentSize = scenario.segment.rules[scenario.segment.rules.length - 1][2] as number;

export function Learn({ local }: StageProps) {
  const mode = useDemo(s => s.mode);
  const [pick, setPick] = useState(L.outcomes[0].id);
  const o = L.outcomes.find(x => x.id === pick)!;
  const holdout = Math.round(segmentSize * L.holdoutShare);
  return (
    <>
      <Head
        title="What changes *next week*"
        sub="Three possible outcomes of the remote call. Each one feeds the next decision."
        meta={<span className="tag">Illustrative numbers</span>}
      />
      {mode === 'rules' && <span className="tag" style={{ justifySelf: 'start' }}>Shown for the Rules plus machine learning decision</span>}
      <div className="split" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(260px, 1fr) minmax(0, 1.4fr)', alignItems: 'start' }}>
        <div role="radiogroup" aria-label="Outcome" style={{ display: 'grid', gap: 8 }}>
          {L.outcomes.map(x => (
            <button key={x.id} role="radio" aria-checked={pick === x.id} onClick={() => setPick(x.id)} className="win"
              style={{ textAlign: 'left', cursor: 'pointer', padding: '12px 16px', borderColor: pick === x.id ? 'var(--blue-bright)' : undefined, background: pick === x.id ? 'var(--blue-soft)' : undefined }}>
              <span style={{ fontWeight: 600 }}>{x.label}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={pick} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
            <Win name={o.label} right="Next week">
              <dl className="fields" style={{ gridTemplateColumns: '130px 1fr' }}>
                <dt>What changes</dt><dd style={{ fontFamily: 'var(--font)', fontSize: 15 }}>{o.change}</dd>
                <dt>Next action</dt><dd style={{ fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600 }}>{o.next}</dd>
              </dl>
            </Win>
          </motion.div>
        </AnimatePresence>
      </div>
      <Reveal when={local >= 1}>
        <Win name="Holdout" right={`${L.holdoutDays} days`}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'grid' }}>
              <span className="big" style={{ fontSize: 44 }}>{holdout}</span>
              <span className="muted" style={{ fontSize: 13 }}>of {segmentSize.toLocaleString('en-US')} HCPs held back</span>
            </div>
            <p style={{ maxWidth: '70ch' }}>
              Hold back {Math.round(L.holdoutShare * 100)}% of the segment from suggestions. After {L.holdoutDays} days, compare acceptance, engagement and new prescribing. Without a holdout you measure activity, not lift.
            </p>
          </div>
        </Win>
      </Reveal>
    </>
  );
}
