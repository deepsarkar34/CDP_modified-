import { motion } from 'framer-motion';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { DeepDive, Head, Reveal, Win } from '../components/ui';

const total = scenario.sources.reduce((a, s) => a + s.records, 0);

export function Capture({ local, deep }: StageProps) {
  const arrived = local >= 1;
  const flag = local >= 2;
  return (
    <>
      <Head
        title="Same oncologist, six systems, six *versions*"
        sub="Each system sends its own version, in its own format, on its own schedule."
        meta={arrived && <span className="tag">{total} records in {scenario.sources.length} systems</span>}
      />
      <div className="grid3">
        {scenario.sources.map((s, i) => (
          <Win key={s.id} name={s.name} right={s.cadence.replace(', via data partner', '')} style={{ minHeight: 200 }}>
            {arrived ? (
              <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.15 }} style={{ display: 'grid', gap: 10 }}>
                <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className="tag">{s.recordsLabel ?? `${s.records} record${s.records > 1 ? 's' : ''}`}</span>
                  <span className={`tag ${s.route === 'stream' ? 'blue' : ''}`}>{s.route === 'stream' ? 'Streams to Data 360' : 'Openflow to Snowflake'}</span>
                </span>
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
          <span>Two routes in: batch through Openflow, web behaviour streamed in seconds</span>
        </div>
      </Reveal>
      <DeepDive show={deep} title="how the data arrives">
        <table className="dt">
          <thead><tr><th>Source</th><th>Route</th><th>Cadence</th><th>Watch for</th></tr></thead>
          <tbody>
            <tr><td>Veeva CRM</td><td>Openflow connector to Snowflake</td><td>Nightly</td><td>Duplicate accounts; free-text call notes</td></tr>
            <tr><td>IQVIA prescriptions</td><td>Licensed file to Snowflake</td><td>Weekly</td><td>Contract limits on use of Rx data</td></tr>
            <tr><td>Claims and EHR</td><td>Data partner, de-identified</td><td>Monthly</td><td>Vendor tokens only</td></tr>
            <tr><td>SFMC email</td><td>Openflow connector to Snowflake</td><td>Hourly</td><td>Duplicate contacts, consent flags</td></tr>
            <tr><td>HCP website</td><td>Streamed to Data 360 and landed in Snowflake</td><td>Seconds</td><td>Anonymous devices</td></tr>
            <tr><td>OneKey reference</td><td>Reference file to Snowflake</td><td>Weekly</td><td>Used to confirm identity and specialty</td></tr>
          </tbody>
        </table>
      </DeepDive>
    </>
  );
}
