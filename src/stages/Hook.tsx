import { motion } from 'framer-motion';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { Head } from '../components/ui';

// Where each fragment sits (% of the field). One fragment per source system.
const SPOTS = [[4, 8], [58, 2], [70, 46], [36, 70], [0, 54], [30, 30]];
const ROT = [-4, 3, -2, 4, 2, -3];

export function Hook({ local }: StageProps) {
  const merged = local >= 1;
  const h = scenario.hcp;
  return (
    <>
      <Head
        title={merged ? 'One *oncologist*' : 'One oncologist, or *six*?'}
        sub={merged ? `${h.full}. ${h.specialty}, ${h.practice}, ${h.city}.` : 'Six fragments from six systems the brand already uses.'}
      />
      <div style={{ position: 'relative', height: 400 }}>
        {scenario.hookFragments.map(([from, t], i) => (
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
            <div className="win-bar" style={{ padding: '5px 12px' }}><span className="right" style={{ marginLeft: 0 }}>{from}</span></div>
            <div className="mono" style={{ padding: '10px 16px', fontSize: 'clamp(15px, 1.7vw, 19px)', whiteSpace: 'nowrap' }}>{t}</div>
          </motion.div>
        ))}
        <motion.div
          initial={false}
          animate={merged ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.5, delay: merged ? 0.55 : 0 }}
          style={{ position: 'absolute', left: 0, right: 0, top: '22%', display: 'grid', justifyItems: 'center', gap: 12 }}
        >
          <div className="avatar" style={{ width: 92, height: 92, fontSize: 32, background: 'var(--grad)' }}>{h.initials}</div>
          <h3 style={{ fontSize: 32 }}>{h.full}</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="tag">{h.specialty}</span>
            <span className="tag mono">NPI {h.npi}</span>
          </div>
        </motion.div>
      </div>
    </>
  );
}
