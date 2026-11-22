import { motion } from 'framer-motion';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { DeepDive, Head, Reveal, Win } from '../components/ui';

export function Capture({ local, deep }: StageProps) {
  const arrived = local >= 1;
  const flag = local >= 2;
  return (
    <>
      <Head title="Same doctor, five systems, five *spellings*" sub="What arrives from each source in a normal week." />
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
        {scenario.sources.map((s, i) => (
          <Win key={s.id} name={s.name} right={s.cadence.replace(', via data partner', '')} style={{ minHeight: 250 }}>
            {arrived ? (
              <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.18 }} style={{ display: 'grid', gap: 10 }}>
                <span className="tag" style={{ justifySelf: 'start' }}>{s.records}</span>
                <dl className="fields">
                  {s.fields.map(([k, val, kind]) => (
                    <div key={k as string} style={{ display: 'contents' }}>
                      <dt>{k}</dt>
                      <dd><span className={flag ? (kind === true ? 'conflict' : kind === 'phi' ? 'deid' : '') : ''}>{val}</span></dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            ) : <span className="muted" style={{ fontSize: 14 }}>Waiting for file</span>}
          </Win>
        ))}
      </div>
      <Reveal when={flag}>
        <div className="legend">
          <span><i style={{ background: 'var(--magenta-soft)', border: '1px solid var(--magenta)' }} />Conflicts with another source</span>
          <span><i style={{ background: 'var(--blue-soft)', border: '1px solid var(--blue)' }} />Patient ID, de-identified by the data vendor</span>
        </div>
      </Reveal>
      <DeepDive show={deep} title="how the data arrives">
        <table className="dt">
          <thead><tr><th>Source</th><th>Mechanism</th><th>Cadence</th><th>Watch for</th></tr></thead>
          <tbody>
            <tr><td>Veeva CRM</td><td>Nightly extract to the warehouse</td><td>Daily</td><td>Duplicate accounts across territories</td></tr>
            <tr><td>IQVIA Rx</td><td>Licensed file, keyed on NPI</td><td>Weekly</td><td>Contract limits on use of Rx data</td></tr>
            <tr><td>EHR and claims</td><td>Data partner, de-identified under HIPAA</td><td>Monthly</td><td>Vendor tokens only, expert determination</td></tr>
            <tr><td>Web and email</td><td>Tracking script stream, email platform export</td><td>Real time, daily</td><td>Anonymous cookies, consent flags</td></tr>
          </tbody>
        </table>
      </DeepDive>
    </>
  );
}
