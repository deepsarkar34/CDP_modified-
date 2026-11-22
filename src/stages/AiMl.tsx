import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { DeepDive, Head, Win } from '../components/ui';

const A = scenario.ai;
const TABS = ['Snowflake ML: predict', 'Cortex: read call notes', 'Cortex: ask in plain English'];
const TITLES = ['A likelihood score for *every oncologist*', 'A call note becomes *data*', 'Ask across all oncologists in *plain English*'];

export function AiMl({ local, deep }: StageProps) {
  // Each beat opens one capability; the tabs let the presenter jump around for questions.
  const [tab, setTab] = useState(local);
  useEffect(() => setTab(local), [local]);
  return (
    <>
      <Head title={TITLES[tab]} sub="Three ways Snowflake adds intelligence before Data 360 sees her." />
      <div className="seg light" role="group" aria-label="Snowflake AI capability" style={{ justifySelf: 'start' }}>
        {TABS.map((t, i) => <button key={t} aria-pressed={tab === i} onClick={() => setTab(i)}>{t}</button>)}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
          {tab === 0 && <Predict />}
          {tab === 1 && <Notes />}
          {tab === 2 && <Ask />}
        </motion.div>
      </AnimatePresence>
      <div className="legend" style={{ gap: 8 }}>
        <span className="tag">Gold record</span><span>+</span><span className="tag">ML.HCP_SCORES</span><span>+</span><span className="tag">AI.CALL_NOTE_TOPICS</span><span>→</span>
        <span className="tag blue">Zero Copy to Data 360, no pipeline, no copy</span>
      </div>
      <DeepDive show={deep} title="where each piece runs">
        <table className="dt">
          <tbody>
            <tr><td className="muted" style={{ width: 220 }}>Model</td><td>Snowflake ML: Feature Store, notebooks, Model Registry, weekly batch scoring</td></tr>
            <tr><td className="muted">Call notes</td><td>Cortex AI <code>AI_EXTRACT</code> over every new Veeva note, nightly</td></tr>
            <tr><td className="muted">Questions</td><td>Snowflake Intelligence over governed tables, answered with SQL</td></tr>
            <tr><td className="muted">Into Data 360</td><td>All three read through Zero Copy, no pipeline and no copy</td></tr>
          </tbody>
        </table>
      </DeepDive>
    </>
  );
}

function Predict() {
  return (
    <div className="split" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 1fr)', alignItems: 'start' }}>
      <div style={{ display: 'grid', gap: 12 }}>
        <Win name="The question the model answers">
          <span style={{ fontWeight: 600, fontSize: 18 }}>{A.question}</span>
          <span className="muted" style={{ fontSize: 14 }}>{A.trainedOn}</span>
        </Win>
        <div className="legend" style={{ gap: 8 }}>
          {A.pipeline.map((p, i) => <span key={p} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><span className="tag">{p}</span>{i < A.pipeline.length - 1 && <span>→</span>}</span>)}
        </div>
      </div>
      <Win name={`${scenario.hcp.short}, ${A.table}`} right={A.percentile}>
        <span className="big" style={{ color: 'var(--blue)' }}>{A.score.toFixed(2)}</span>
        <span className="muted" style={{ fontSize: 13.5 }}>Why the model thinks so</span>
        {A.drivers.map(([label, w], i) => (
          <div key={label as string} style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10, alignItems: 'center', fontSize: 14 }}>
            <span>{label}</span>
            <span style={{ height: 8, borderRadius: 4, background: 'var(--line)', overflow: 'hidden' }}>
              <motion.span initial={{ width: 0 }} animate={{ width: `${((w as number) / 80) * 100}%` }} transition={{ delay: 0.2 + i * 0.12, duration: 0.5 }}
                style={{ display: 'block', height: '100%', background: 'var(--grad)' }} />
            </span>
          </div>
        ))}
      </Win>
    </div>
  );
}

function Notes() {
  return (
    <div className="split" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', alignItems: 'start' }}>
      <Win name={A.noteSource} right="Free text">
        <p style={{ fontStyle: 'italic', fontSize: 16 }}>"{A.note}"</p>
        <code className="mono" style={{ fontSize: 13, color: 'var(--blue)' }}>AI_EXTRACT(note, ['topic', 'audience', 'sentiment'])</code>
      </Win>
      <Win name="Cortex AI output" right="Nightly, every note" flush>
        <table className="dt">
          <tbody>
            {A.extract.map(([k, val], i) => (
              <motion.tr key={k} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.12 }}
                style={{ background: i === 0 ? 'var(--blue-soft)' : undefined }}>
                <td className="muted" style={{ width: 130 }}>{k}</td><td className={i === 3 ? 'v' : ''} style={{ fontWeight: i === 0 ? 600 : 400 }}>{val}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </Win>
    </div>
  );
}

function Ask() {
  return (
    <div className="split" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 1fr)', alignItems: 'start' }}>
      <Win name="Snowflake Intelligence" right="Brand analytics">
        <div style={{ background: 'var(--navy)', color: '#fff', borderRadius: 10, padding: '10px 14px', fontSize: 15 }}>{A.ask}</div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ display: 'grid', gap: 8 }}>
          <span style={{ fontWeight: 600 }}>{A.answer}</span>
          <pre className="mono" style={{ margin: 0, fontSize: 12.5, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px', overflowX: 'auto' }}>{A.sql}</pre>
        </motion.div>
      </Win>
      <div style={{ display: 'grid', gap: 12 }}>
        <Win name="Who uses this">
          <span style={{ fontSize: 14 }}>Analysts and brand leads asking questions across all oncologists, answered with governed SQL on Snowflake.</span>
        </Win>
        <Win name="What it does not do">
          <span style={{ fontSize: 14 }}>It finds the 38. It does not send anything, check consent at send time, or react when one of them clicks. That is the job of Data 360.</span>
        </Win>
      </div>
    </div>
  );
}
