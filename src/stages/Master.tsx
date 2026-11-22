import { motion } from 'framer-motion';
import { useState } from 'react';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { DeepDive, Head, Win } from '../components/ui';

const SHORT: Record<string, string> = { crm: 'Veeva', rx: 'IQVIA', claims: 'Claims', sfmc: 'SFMC', ref: 'OneKey', match: 'Snowflake' };

export function Master({ local, deep }: StageProps) {
  const [sel, setSel] = useState<string | null>(null);
  const merged = local >= 1;
  const stamped = local >= 2;
  return (
    <>
      <Head
        title={merged ? 'One golden *record*' : 'Five sources, one *oncologist*?'}
        sub={stamped ? 'Matched in Snowflake, checked against OneKey. Golden ID issued.' : merged ? 'Each field shows the source it came from.' : 'Clean silver records, not yet matched.'}
        meta={merged && <span className="tag ok">Merged into 1</span>}
      />
      <div className="split" style={{ display: 'grid', gap: 16, gridTemplateColumns: merged ? 'minmax(230px, 1fr) minmax(0, 1.7fr)' : '1fr', alignItems: 'start' }}>
        <motion.div layout style={{ display: 'grid', gap: 8, gridTemplateColumns: merged ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {merged && <span className="muted" style={{ fontSize: 13.5 }}>Sources ({scenario.masterSources.length}). Click one to see what it contributed.</span>}
          {scenario.masterSources.map(([id, name, how]) => (
            <motion.button layout key={id} transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              onClick={() => setSel(sel === id ? null : id)} aria-pressed={sel === id} className="win"
              style={{ textAlign: 'left', cursor: 'pointer', padding: merged ? '9px 13px' : '16px 18px', gap: 2, borderColor: sel === id ? 'var(--blue-bright)' : undefined, background: sel === id ? 'var(--blue-soft)' : undefined }}>
              <motion.span layout="position" style={{ fontWeight: 600 }}>{name}</motion.span>
              <motion.span layout="position" className="muted" style={{ fontSize: 13.5 }}>{how}</motion.span>
            </motion.button>
          ))}
        </motion.div>

        {merged && (
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.25 }}>
            <Win name="Golden record" right={stamped ? 'gold.hcp' : 'Matching'} flush>
              <table className="dt">
                <tbody>
                  {scenario.golden.map(([k, val, srcs], i) => {
                    const isId = k === 'Golden ID';
                    const hit = sel ? (srcs as string[]).includes(sel) : false;
                    if (isId && !stamped) return null;
                    return (
                      <motion.tr key={k as string} initial={{ opacity: 0, x: -24 }} animate={{ opacity: sel && !hit ? 0.3 : 1, x: 0 }} transition={{ duration: 0.35, delay: isId ? 0 : 0.35 + i * 0.08 }}
                        style={{ background: hit ? 'var(--blue-soft)' : undefined }}>
                        <td className="muted" style={{ width: 190 }}>{k}</td>
                        <td className="v" style={isId ? { fontSize: 18, fontWeight: 500, color: 'var(--blue)' } : undefined}>{val}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {(srcs as string[]).map(s => <span key={s} className={`tag ${isId ? 'solid' : ''}`} style={{ fontSize: 11.5 }}>{SHORT[s]}</span>)}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </Win>
          </motion.div>
        )}
      </div>
      <DeepDive show={deep} title="match and survivorship rules">
        <table className="dt">
          <thead><tr><th>Rule</th><th>Logic</th><th>Type</th></tr></thead>
          <tbody>
            <tr><td>NPI exact</td><td><code>rx.npi = claims.treating_npi = onekey.npi</code></td><td>Deterministic</td></tr>
            <tr><td>Veeva to NPI</td><td>Name and standardized address, confirmed by OneKey</td><td>Scored, steward review below threshold</td></tr>
            <tr><td>SFMC to Veeva</td><td>Exact normalized email</td><td>Deterministic</td></tr>
            <tr><td>Survivorship</td><td>Name, specialty and practice from OneKey; email by recency; Rx fields from IQVIA only</td><td>Per-field policy</td></tr>
          </tbody>
        </table>
        <p>Mastering happens once, in Snowflake. Data 360 receives the golden ID and never re-decides it.</p>
      </DeepDive>
    </>
  );
}
