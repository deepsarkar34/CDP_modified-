import { motion } from 'framer-motion';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { DeepDive, Head, Reveal, Win } from '../components/ui';

const CX = 340, CY = 170;
interface Node { x: number; y: number; k: string; val: string; rule: string; at: number; cookie?: boolean }
const VIEWS = ['Dosing guide', 'Dosing guide', 'MOA video', 'Safety data', 'Dosing calculator', 'Trial results', 'Contact a rep'];

export function Resolve({ local, v, deep }: StageProps) {
  const loggedIn = local >= 3;
  const nodes: Node[] = [
    { x: 140, y: 60, k: 'Master ID', val: scenario.hcp.masterId, rule: 'golden record', at: 0 },
    { x: 540, y: 60, k: 'Email', val: 'jbrown@retinaclinic.example', rule: 'exact email', at: 1 },
    { x: 540, y: 280, k: 'Email platform key', val: 'SUB-55120', rule: 'via email', at: 1 },
    { x: 140, y: 280, k: 'Portal login', val: 'drbrown.ret', rule: 'master ID at sign-up', at: 1 },
    { x: 340, y: 335, k: 'Web cookie', val: 'ck_9f2a71', rule: loggedIn ? 'linked at login' : 'anonymous', at: 2, cookie: true },
  ];
  const cookie = nodes[4];
  const linked = nodes.filter(n => local >= n.at && (!n.cookie || loggedIn)).length;
  return (
    <>
      <Head
        title={loggedIn ? 'Anonymous visits, now *his*' : 'One profile, every *identifier*'}
        sub={`${v.profile}, built from the golden record (${v.ingest})`}
        meta={<span className="tag blue">{linked} of 5 identifiers linked</span>}
      />
      {v.partners?.identity && <span className="tag" style={{ justifySelf: 'start' }}>Identity from a partner tool or Databricks CustomerLake (preview)</span>}
      <div className="split" style={{ display: 'grid', gap: 18, gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 1fr)', alignItems: 'start' }}>
        <svg viewBox="0 0 680 370" role="img" aria-label="Identity graph" style={{ width: '100%', height: 'auto', maxHeight: 360, display: 'block' }}>
          <defs>
            <linearGradient id="hub" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3783C2" /><stop offset=".55" stopColor="#7167B8" /><stop offset="1" stopColor="#DC1380" /></linearGradient>
          </defs>
          {nodes.map(n => {
            const show = local >= n.at;
            const dashed = n.cookie && !loggedIn;
            const mx = (CX + n.x) / 2, my = (CY + n.y) / 2;
            return (
              <motion.g key={n.k} initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ duration: 0.5 }}>
                <motion.line x1={CX} y1={CY} x2={n.x} y2={n.y} stroke={dashed ? 'var(--line-2)' : 'var(--blue-bright)'} strokeWidth={dashed ? 1.5 : 2}
                  strokeDasharray={dashed ? '6 6' : '0'} initial={false} animate={{ pathLength: show ? 1 : 0 }} transition={{ duration: 0.6 }} />
                <rect x={mx - 62} y={my - 11} width={124} height={22} rx={11} fill="var(--surface)" stroke="var(--line)" />
                <text x={mx} y={my + 4} textAnchor="middle" fontSize={11.5} fill="var(--muted)">{n.rule}</text>
                <motion.rect x={n.x - 132} y={n.y - 26} width={264} height={52} rx={10} fill="var(--surface)"
                  stroke={dashed ? 'var(--line-2)' : 'var(--blue-bright)'} strokeWidth={1.3} strokeDasharray={dashed ? '4 4' : '0'}
                  animate={n.cookie && loggedIn ? { scale: [1, 1.07, 1] } : {}} transition={{ duration: 0.5 }} style={{ transformOrigin: `${n.x}px ${n.y}px` }} />
                <text x={n.x} y={n.y - 6} textAnchor="middle" fontSize={12} fill="var(--muted)">{n.k}</text>
                <text x={n.x} y={n.y + 13} textAnchor="middle" fontSize={12.5} fill="var(--ink)" style={{ fontFamily: 'var(--mono)' }}>{n.val}</text>
              </motion.g>
            );
          })}
          {VIEWS.map((_, i) => {
            const ox = cookie.x - 90 + i * 30, oy = cookie.y + 34;
            return (
              <motion.circle key={i} r={6} fill="#DC1380" initial={false}
                animate={local < 2 ? { cx: ox, cy: oy, opacity: 0 } : loggedIn ? { cx: CX, cy: CY, opacity: [1, 1, 0] } : { cx: ox, cy: oy, opacity: 1 }}
                transition={{ duration: loggedIn ? 0.9 : 0.4, delay: loggedIn ? 0.3 + i * 0.08 : i * 0.05 }} />
            );
          })}
          <circle cx={CX} cy={CY} r={56} fill="url(#hub)" />
          <text x={CX} y={CY - 4} textAnchor="middle" fontSize={15} fontWeight={600} fill="#fff">{scenario.hcp.short}</text>
          <text x={CX} y={CY + 15} textAnchor="middle" fontSize={11.5} fill="#fff" opacity={0.85}>{scenario.hcp.masterId}</text>
        </svg>
        <div style={{ display: 'grid', gap: 12 }}>
          <Reveal when={local >= 2}>
            <Win name="Web sessions" right={loggedIn ? 'linked to profile' : 'anonymous'} flush>
              <table className="dt">
                <tbody>
                  {VIEWS.map((p, i) => (
                    <tr key={i}>
                      <td>{p}</td>
                      <td style={{ textAlign: 'right' }}><span className={`tag ${loggedIn ? 'blue' : ''}`} style={{ fontSize: 11.5 }}>{loggedIn ? scenario.hcp.short : 'ck_9f2a71'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Win>
          </Reveal>
        </div>
      </div>
      <Reveal when={loggedIn} delay={0.9}>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
          {scenario.insights.map(([k, val, kind]) => (
            <div key={k} className="win" style={{ padding: '12px 14px', gap: 4 }}>
              <span className="muted" style={{ fontSize: 13 }}>{k}</span>
              <span style={{ fontSize: 20, fontWeight: 600 }}>{val}</span>
              <span style={{ fontSize: 12, color: 'var(--faint)' }}>{kind === 'model' ? 'Model score' : kind === 'consent' ? 'Consent record' : v.insights}</span>
            </div>
          ))}
        </div>
      </Reveal>
      <DeepDive show={deep} title={v.identity}>
        <table className="dt">
          <tbody>
            <tr><td className="muted" style={{ width: 220 }}>Golden record arrives via</td><td>{v.ingest}</td></tr>
            <tr><td className="muted">Data model</td><td>{v.dataModel}</td></tr>
            <tr><td className="muted">Match rules</td><td>Exact master ID, exact normalized email, login to master ID, cookie to login. All deterministic.</td></tr>
            <tr><td className="muted">Profile key</td><td>{v.profile} has its own technical key. The business ID stays <code>{scenario.hcp.masterId}</code>.</td></tr>
          </tbody>
        </table>
      </DeepDive>
    </>
  );
}
