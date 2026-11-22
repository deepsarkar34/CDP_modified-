import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { DeepDive, Head, Win } from '../components/ui';
import { channelCounts, useDemo } from '../store';
import { chooseAction } from '../decision';

const C = scenario.channels;
type Ch = keyof typeof C;
const ORDER: Ch[] = ['crm', 'email', 'media', 'rt', 'web'];
const PUSH = '#1B70E0', PULL = '#7167B8';
const SEG = scenario.audience.name;
const SEG_N = scenario.audience.build[scenario.audience.build.length - 1][1] as number;

const TITLES = ['Push and *pull*', `What ${scenario.hcp.short} *sees*`, 'From download to *follow-up*', 'One story across *channels*'];
const SUBS = [
  'Push channels receive a list from Data 360. Pull channels ask about one person at the moment she shows up.',
  'One decision, four channels.',
  'The real-time path, per event rather than per segment publish.',
  'Every channel follows the same decision.',
];

export function Activate({ local, deep, consent }: StageProps) {
  const [ch, setCh] = useState<Ch>('email');
  return (
    <>
      <Head title={TITLES[local]} sub={SUBS[local]} meta={<span className="tag">Activation targets</span>} />
      <AnimatePresence mode="wait">
        <motion.div key={local} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }} style={{ display: 'grid', gap: 16 }}>
          {local === 0 && <SankeyPanel ch={ch} setCh={setCh} consent={consent} />}
          {local === 1 && <Experience consent={consent} />}
          {local === 2 && <LiveEvent consent={consent} />}
          {local === 3 && <OneStory />}
        </motion.div>
      </AnimatePresence>
      <DeepDive show={deep} title="connection per channel">
        <table className="dt">
          <thead><tr><th>Channel</th><th>Type</th><th>Connection</th><th>Coming back</th></tr></thead>
          <tbody>{ORDER.map(c => <tr key={c}><td>{C[c].label}</td><td>{C[c].kind === 'push' ? 'Push' : 'Pull'}</td><td>{C[c].conn}</td><td>{C[c].back}</td></tr>)}</tbody>
        </table>
      </DeepDive>
    </>
  );
}

/* Beat 1: Sankey plus the selected channel's route */
function SankeyPanel({ ch, setCh, consent }: { ch: Ch; setCh: (c: Ch) => void; consent: boolean }) {
  const n = channelCounts(consent);
  const W = 1000, top = 50, H = 320, nw = 14, gapR = 16, gapM = 34;
  const pushT = ORDER.filter(c => C[c].kind === 'push').reduce((a, c) => a + n[c], 0);
  const total = pushT + n.web;
  const k = Math.min((H - gapR * (ORDER.length - 1)) / total, (H - gapM) / total);
  const X = [210, 490, 760];
  const stack = (vals: number[], gap: number) => {
    const hs = vals.map(x => x * k); const tot = hs.reduce((a, b) => a + b, 0) + gap * (vals.length - 1);
    let y = top + (H - tot) / 2; return hs.map(h => { const o = { y, h }; y += h + gap; return o; });
  };
  const L = stack([total], 0)[0], M = stack([pushT, n.web], gapM), R = stack(ORDER.map(c => n[c]), gapR);
  const path = (x0: number, y0: number, x1: number, y1: number, h: number) => {
    const xm = (x0 + x1) / 2;
    return `M${x0},${y0} C${xm},${y0} ${xm},${y1} ${x1},${y1} L${x1},${y1 + h} C${xm},${y1 + h} ${xm},${y0 + h} ${x0},${y0 + h} Z`;
  };
  let py = M[0].y;
  const bands = ORDER.map((c, i) => {
    const d = C[c].kind === 'push' ? path(X[1] + nw, py, X[2], R[i].y, R[i].h) : path(X[1] + nw, M[1].y, X[2], R[i].y, R[i].h);
    if (C[c].kind === 'push') py += R[i].h;
    return { c, d, i };
  });
  const col = (c: Ch) => (C[c].kind === 'push' ? PUSH : PULL);
  return (
    <div className="split" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1.6fr) minmax(300px, 1fr)', alignItems: 'start' }}>
      <div>
        <svg viewBox={`0 0 ${W} ${top + H + 40}`} role="img" aria-label={`Activation flow from ${SEG} to five channels`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <motion.path d={path(X[0] + nw, L.y, X[1], M[0].y, M[0].h)} fill={PUSH} initial={{ opacity: 0 }} animate={{ opacity: 0.22 }} transition={{ delay: 0.1 }} />
          <motion.path d={path(X[0] + nw, L.y + M[0].h, X[1], M[1].y, M[1].h)} fill={PULL} initial={{ opacity: 0 }} animate={{ opacity: 0.22 }} transition={{ delay: 0.2 }} />
          {bands.map(({ c, d, i }) => (
            <motion.path key={c} d={d} fill={col(c)} style={{ cursor: 'pointer' }} onClick={() => setCh(c)}
              initial={{ opacity: 0 }} animate={{ opacity: c === ch ? 0.6 : 0.18, d }} transition={{ delay: 0.35 + i * 0.12, duration: 0.4 }} />
          ))}
          <rect x={X[0]} y={L.y} width={nw} height={L.h} rx={3} fill="var(--ink)" />
          <text x={X[0] - 12} y={L.y + L.h / 2 - 6} textAnchor="end" fontSize={18} fontWeight={600} fill="var(--ink)">{SEG}</text>
          <text x={X[0] - 12} y={L.y + L.h / 2 + 14} textAnchor="end" fontSize={15} fill="var(--muted)">{SEG_N} oncologists</text>
          <rect x={X[1]} y={M[0].y} width={nw} height={M[0].h} rx={3} fill={PUSH} />
          <text x={X[1] + nw / 2} y={M[0].y - 12} textAnchor="middle" fontSize={16} fontWeight={600} fill={PUSH}>Push</text>
          <rect x={X[1]} y={M[1].y} width={nw} height={M[1].h} rx={3} fill={PULL} />
          <text x={X[1] + nw / 2} y={M[1].y + M[1].h + 22} textAnchor="middle" fontSize={16} fontWeight={600} fill={PULL}>Pull</text>
          {ORDER.map((c, i) => {
            const ly = R[i].y + R[i].h / 2;
            return (
              <g key={c} onClick={() => setCh(c)} style={{ cursor: 'pointer' }} role="button" tabIndex={0} aria-label={C[c].label} onKeyDown={e => { if (e.key === 'Enter') setCh(c); }}>
                <rect x={X[2]} y={R[i].y} width={nw} height={Math.max(R[i].h, 3)} rx={3} fill={col(c)} />
                <rect x={X[2] + nw + 4} y={ly - 16} width={220} height={34} fill="transparent" />
                <text x={X[2] + nw + 12} y={ly - 2} fontSize={18} fontWeight={c === ch ? 700 : 500} fill="var(--ink)">{C[c].label}</text>
                <text x={X[2] + nw + 12} y={ly + 17} fontSize={15} fill="var(--muted)">{n[c].toLocaleString('en-US')} oncologists</text>
              </g>
            );
          })}
        </svg>
        <p className="muted" style={{ fontSize: 13.5 }}>Band width is oncologists reached this cycle. One oncologist can be in several channels, so channels add up to more than {SEG_N}.</p>
      </div>
      <Win name={C[ch].label} right={C[ch].kind === 'pull' ? 'Pull' : 'Push'}>
        <span className="muted" style={{ fontSize: 13.5 }}>{C[ch].conn}</span>
        <ol style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 6, fontSize: 14 }}>{C[ch].steps.map(s => <li key={s}>{s}</li>)}</ol>
        {ch === 'email' && !consent && <span className="tag alert" style={{ justifySelf: 'start' }}>Consent off: Dr. Ortiz filtered out</span>}
      </Win>
    </div>
  );
}

/* Beat 2: what she sees */
function Experience({ consent }: { consent: boolean }) {
  const mode = useDemo(s => s.mode);
  const pick = chooseAction(mode, consent);
  const repAlert = mode === 'ml' || pick.id === 'visit';
  const emailItem = pick.email ? pick.name : null;
  return (
    <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', alignItems: 'start' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Win name="Inbox" right={emailItem ? '10:42' : 'Not sent'} style={{ opacity: emailItem ? 1 : 0.5 }}>
          {emailItem === 'Side effect guide email' ? (
            <div style={{ display: 'grid', gap: 6 }}>
              <span className="muted" style={{ fontSize: 13 }}>Oncology brand team</span>
              <span style={{ fontWeight: 600 }}>Managing immune related side effects: a guide for your team</span>
              <span style={{ fontSize: 14 }}>Dear Dr. Ortiz, here is the approved guide for your infusion nurses, with Important Safety Information.</span>
              <span className="tag blue" style={{ justifySelf: 'start' }}>MLR-approved asset</span>
            </div>
          ) : emailItem ? (
            <div style={{ display: 'grid', gap: 6 }}>
              <span className="muted" style={{ fontSize: 13 }}>Oncology brand team</span>
              <span style={{ fontWeight: 600 }}>{emailItem}</span>
              <span className="tag" style={{ justifySelf: 'start' }}>Picked by the brand priority list</span>
            </div>
          ) : <span className="tag alert" style={{ justifySelf: 'start' }}>{consent ? 'No email chosen' : 'No email consent'}</span>}
        </Win>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <Win name="Veeva CRM, rep alert" right={scenario.hcp.rep} style={{ opacity: repAlert ? 1 : 0.5 }}>
          {repAlert ? <>
            <span style={{ fontWeight: 600 }}>Visit Dr. Ortiz this week</span>
            <span style={{ fontSize: 14 }}>She downloaded the side effect guide today and asked about nurse support. Bring the nurse webinar invite.</span>
          </> : <span className="tag" style={{ justifySelf: 'start' }}>No alert: rules only, nothing plans the next touch</span>}
        </Win>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
        <Win name="hcp-publisher.example" right="Sponsored">
          <div style={{ borderRadius: 8, background: 'linear-gradient(120deg, #0F0A19, #2A1A55)', color: '#fff', padding: '16px 14px', display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>For medical oncologists</span>
            <span style={{ fontWeight: 600, fontSize: 17 }}>Side effect resources for your team</span>
          </div>
          <span className="muted" style={{ fontSize: 13 }}>Matched on NPI to a verified HCP login</span>
        </Win>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
        <Win name="hcp-website.example" right="From the email link">
          <span className="muted" style={{ fontSize: 13 }}>Welcome back, Dr. Ortiz</span>
          <div style={{ borderRadius: 8, border: '1px solid var(--line)', padding: '12px 14px', display: 'grid', gap: 4 }}>
            <span style={{ fontWeight: 600 }}>Side effect resources and the nurse webinar</span>
            <span className="muted" style={{ fontSize: 13 }}>Personalized at page load from her live profile, instead of the generic hero</span>
          </div>
        </Win>
      </motion.div>
    </div>
  );
}

/* Beat 3: the real-time path with clock times */
function LiveEvent({ consent }: { consent: boolean }) {
  const mode = useDemo(s => s.mode);
  const pick = chooseAction(mode, consent);
  const repAlert = mode === 'ml' || pick.id === 'visit';
  const steps = [
    { t: '10:14', s: 'Dr. Ortiz downloads the side effect guide' },
    { t: '10:14', s: 'The web tracking script streams the event into Data 360 within seconds' },
    { t: '10:16', s: consent ? 'Data Action rule checks: side effect download, score at least 0.7, email consent' : 'Data Action rule: no email consent, email path skipped' },
    { t: '10:16', s: `Decision runs: ${pick.name.toLowerCase()}` },
    { t: '10:42', s: pick.email ? `${pick.name} sent` : 'No email sent' },
    { t: 'Same day', s: repAlert ? 'Rep alert appears in Veeva CRM' : 'No rep alert: nothing plans the next touch' },
  ];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= steps.length) return;
    const t = setTimeout(() => setShown(s => s + 1), shown === 0 ? 400 : 700);
    return () => clearTimeout(t);
  }, [shown, steps.length]);
  return (
    <div className="split" style={{ display: 'grid', gap: 18, gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 1fr)', alignItems: 'start' }}>
      <div style={{ display: 'grid', gap: 10 }}>
        <Win name="Event log" right="Real time triggers" flush>
          <table className="dt">
            <tbody>
              {steps.map((st, i) => (
                <motion.tr key={i} initial={false} animate={{ opacity: i < shown ? 1 : 0.25 }} transition={{ duration: 0.3 }}>
                  <td className="v" style={{ width: 90, color: 'var(--blue-bright)' }}>{st.t}</td>
                  <td>{st.s}</td>
                  <td style={{ textAlign: 'right', width: 40 }}>{i < shown && <span style={{ color: 'var(--ok)' }}>✓</span>}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </Win>
        <button className="btn" style={{ justifySelf: 'start' }} onClick={() => setShown(0)}>Replay</button>
      </div>
      <div className="phone">
        <div className="clock">10:42</div>
        <AnimatePresence>
          {shown >= 5 && pick.email && (
            <motion.div key="email" className="notif" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="app-name"><span>Mail</span><span>10:42</span></span>
              <strong>Oncology brand team</strong>
              <span className="muted" style={{ fontSize: 13 }}>{pick.id === 'guide' ? 'Managing immune related side effects: a guide for your team' : pick.name}</span>
            </motion.div>
          )}
          {shown >= 6 && repAlert && (
            <motion.div key="rep" className="notif" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="app-name"><span>Veeva CRM, {scenario.hcp.rep}</span><span>today</span></span>
              <strong>Visit Dr. Ortiz this week</strong>
              <span className="muted" style={{ fontSize: 13 }}>Bring the nurse webinar invite</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* Beat 4: one story */
function OneStory() {
  const cards = [
    ['Email', 'Side effect guide, today at 10:42'],
    ['Rep alert', 'Visit this week, bring the nurse webinar invite'],
    ['Website', 'Leads with side effect resources and the nurse webinar'],
  ];
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {cards.map(([k, v], i) => (
          <motion.div key={k} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.18 }}>
            <Win name={k} right="Same decision"><span style={{ fontWeight: 600 }}>{v}</span></Win>
          </motion.div>
        ))}
      </div>
      <div className="legend"><span className="tag ok">Side effect support first</span><span>→</span><span className="tag">Nurse webinar next</span><span className="tag alert">No repeat of efficacy content she already has</span></div>
    </div>
  );
}
