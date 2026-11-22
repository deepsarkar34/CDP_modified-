import { motion } from 'framer-motion';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { Head } from '../components/ui';

// Where each fragment sits (% of the field) and which system it came from.
const SPOTS = [[6, 8], [56, 2], [70, 46], [38, 70], [2, 56], [28, 30]];
const FROM = ['CRM', 'CRM', 'Rx data', 'Claims', 'Email platform', 'Website'];
const ROT = [-4, 3, -2, 4, 2, -3];

export function Hook({ local }: StageProps) {
  const merged = local >= 1;
  return (
    <>
      <Head
        title={merged ? 'One *doctor*' : 'One doctor, or *six*?'}
        sub={merged ? `${scenario.hcp.full}. Retina specialist, Tarrytown, NY.` : 'Six fragments from six places your teams already use.'}
      />
      <div style={{ position: 'relative', height: 400 }}>
        {scenario.hookVariants.map((t, i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={merged
              ? { opacity: 0, left: '50%', top: '40%', x: '-50%', rotate: 0, scale: 0.6 }
              : { opacity: 1, left: `${SPOTS[i][0]}%`, top: `${SPOTS[i][1]}%`, x: '0%', rotate: ROT[i], scale: 1 }}
            transition={{ duration: 0.7, delay: merged ? i * 0.06 : i * 0.12, ease: 'easeInOut' }}
            className="win"
            style={{ position: 'absolute' }}
          >
            <div className="win-bar" style={{ padding: '5px 12px' }}><span className="right" style={{ marginLeft: 0 }}>{FROM[i]}</span></div>
            <div className="mono" style={{ padding: '10px 16px', fontSize: 'clamp(15px, 1.7vw, 19px)', whiteSpace: 'nowrap' }}>{t}</div>
          </motion.div>
        ))}
        <motion.div
          initial={false}
          animate={merged ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.5, delay: merged ? 0.55 : 0 }}
          style={{ position: 'absolute', left: 0, right: 0, top: '22%', display: 'grid', justifyItems: 'center', gap: 12 }}
        >
          <div className="avatar" style={{ width: 92, height: 92, fontSize: 32, background: 'var(--grad)' }}>{scenario.hcp.initials}</div>
          <h3 style={{ fontSize: 32 }}>{scenario.hcp.full}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="tag">{scenario.hcp.specialty}</span>
            <span className="tag mono">NPI {scenario.hcp.npi}</span>
          </div>
        </motion.div>
      </div>
    </>
  );
}
