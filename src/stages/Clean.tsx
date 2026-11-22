import { AnimatePresence, motion } from 'framer-motion';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { DeepDive, Head, Win } from '../components/ui';

// Which beat cleans each row: 1 standardize, 2 dedupe, 3 tokenize and quality checks.
const ROW_BEAT: Record<string, number> = { Duplicates: 2, 'Patient identity': 3, 'Quality checks': 3 };

export function Clean({ local, v, deep }: StageProps) {
  const rows = scenario.clean;
  const done = (f: string) => local >= (ROW_BEAT[f] ?? 1);
  const passed = rows.filter(r => done(r[0])).length;
  const layer = local === 0 ? v.layers.bronze : v.layers.silver;
  return (
    <>
      <Head
        title={local === 0 ? 'Raw, as *received*' : 'Raw to *clean*'}
        sub={`${v.zones.engineering}, ${v.layers.bronze.toLowerCase()} to ${v.layers.silver.toLowerCase()}`}
        meta={<span className={`tag ${passed === rows.length ? 'ok' : ''}`}>{passed} of {rows.length} rules applied</span>}
      />
      <Win name={`hcp_ortiz_lena / ${layer}`} right={local === 0 ? 'unvalidated' : 'validated'} flush>
        <table className="dt">
          <thead><tr><th style={{ width: 170 }}>Field</th><th style={{ width: '42%' }}>Value</th><th>Rule</th></tr></thead>
          <tbody>
            {rows.map(([field, raw, clean, rule]) => {
              const ok = done(field);
              return (
                <tr key={field} style={{ background: ok ? 'var(--ok-soft)' : undefined, transition: 'background .4s' }}>
                  <td style={{ fontWeight: 500 }}>{field}</td>
                  <td className="v">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span key={ok ? 'c' : 'r'} initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.3 }}
                        style={{ display: 'inline-block', color: ok ? 'var(--ok)' : 'var(--muted)' }}>
                        {ok ? clean : raw}
                      </motion.span>
                    </AnimatePresence>
                  </td>
                  <td className="muted" style={{ fontSize: 13.5 }}>{ok ? rule : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Win>
      <DeepDive show={deep} title="pipeline layers">
        <table className="dt">
          <thead><tr><th>Layer</th><th>What happens</th><th>Typical tooling</th></tr></thead>
          <tbody>
            <tr><td>{v.layers.bronze}</td><td>Append-only raw copy with full lineage</td><td>Openflow connectors, file loads</td></tr>
            <tr><td>{v.layers.silver}</td><td>Standardize, dedupe within source, NPI check digit, re-tokenize</td><td>Snowpark and dynamic tables on every refresh; Cortex Code helps engineers write the rules</td></tr>
            <tr><td>Quality gate</td><td>Failed records are quarantined and reported, not dropped</td><td>Data quality tests and alerts</td></tr>
          </tbody>
        </table>
      </DeepDive>
    </>
  );
}
