import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import type { VendorPack } from '../vendors';
import { DeepDive, Head, Win } from '../components/ui';
import { brownChannels, channelCounts, useDemo } from '../store';
import { decisionFor } from '../decision';

type Ch = 'crm' | 'email' | 'media' | 'rt' | 'web';
const ORDER: Ch[] = ['crm', 'email', 'media', 'rt', 'web'];
const LABEL: Record<Ch, string> = { crm: 'Rep (CRM)', email: 'Email', media: 'HCP media', rt: 'Event triggers', web: 'Website and portal' };
const KIND: Record<Ch, 'push' | 'pull'> = { crm: 'push', email: 'push', media: 'push', rt: 'push', web: 'pull' };
const PUSH = '#1B70E0', PULL = '#7167B8';
const route = (v: VendorPack, c: Ch) => ({ crm: v.crmRoute, email: v.email, media: v.media, rt: v.realtime, web: v.personalization }[c]);

const TITLES = [
  'Push and *pull*',
  `What Dr. Brown *sees*`,
  'Event to rep alert in *2.4 seconds*',
  'Clean room or *activation*',
  '6 source records to *5 channels*',
];
const SUBS = [
  'Push sends a list ahead of time. Pull asks about one person when he arrives.',
  'One profile, four different experiences.',
  'He downloads the dosing guide on the HCP site.',
  'Two ways to work with a publisher.',
  `${scenario.hcp.full}, end to end.`,
];

export function Activate({ local, v, deep, consent }: StageProps) {
  const [ch, setCh] = useState<Ch>('email');
  return (
    <>
      <Head title={TITLES[local]} sub={SUBS[local]} meta={v.id !== 'neutral' && <span className="tag">{v.activation}</span>} />
      {v.partners?.activation && local < 3 && <span className="tag" style={{ justifySelf: 'start' }}>Activation through reverse ETL partners such as Hightouch or Census</span>}
      <AnimatePresence mode="wait">
        <motion.div key={local} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }} style={{ display: 'grid', gap: 16 }}>
          {local === 0 && <SankeyPanel ch={ch} setCh={setCh} v={v} consent={consent} />}
          {local === 1 && <Experience consent={consent} />}
          {local === 2 && <LiveEvent consent={consent} v={v} />}
          {local === 3 && <CleanRoom v={v} />}
          {local === 4 && <Recap />}
        </motion.div>
      </AnimatePresence>
      <DeepDive show={deep} title="route per channel">
        <table className="dt">
          <thead><tr><th>Channel</th><th>Type</th><th>Route</th></tr></thead>
          <tbody>{ORDER.map(c => <tr key={c}><td>{LABEL[c]}</td><td>{KIND[c] === 'push' ? 'Push' : 'Pull'}</td><td>{route(v, c)}</td></tr>)}</tbody>
        </table>
      </DeepDive>
    </>
  );
}

/* Beat 0: Sankey */
function SankeyPanel({ ch, setCh, v, consent }: { ch: Ch; setCh: (c: Ch) => void; v: VendorPack; consent: boolean }) {
  const n = channelCounts(consent);
  const W = 1000, top = 50, H = 320, nw = 14, gapR = 16, gapM = 34;
  const pushT = ORDER.filter(c => KIND[c] === 'push').reduce((a, c) => a + n[c], 0);
  const total = pushT + n.web;
  const k = Math.min((H - gapR * (ORDER.length - 1)) / total, (H - gapM) / total);
  const X = [190, 480, 760];
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
    const d = KIND[c] === 'push' ? path(X[1] + nw, py, X[2], R[i].y, R[i].h) : path(X[1] + nw, M[1].y, X[2], R[i].y, R[i].h);
    if (KIND[c] === 'push') py += R[i].h;
    return { c, d, i };
  });
  const col = (c: Ch) => (KIND[c] === 'push' ? PUSH : PULL);
  return (
    <div className="split" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1.8fr) minmax(260px, 1fr)', alignItems: 'start' }}>
      <div>
        <svg viewBox={`0 0 ${W} ${top + H + 40}`} role="img" aria-label="Activation flow from the segment to five channels" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <motion.path d={path(X[0] + nw, L.y, X[1], M[0].y, M[0].h)} fill={PUSH} initial={{ opacity: 0 }} animate={{ opacity: 0.22 }} transition={{ delay: 0.1 }} />
          <motion.path d={path(X[0] + nw, L.y + M[0].h, X[1], M[1].y, M[1].h)} fill={PULL} initial={{ opacity: 0 }} animate={{ opacity: 0.22 }} transition={{ delay: 0.2 }} />
          {bands.map(({ c, d, i }) => (
            <motion.path key={c} d={d} fill={col(c)} style={{ cursor: 'pointer' }} onClick={() => setCh(c)}
              initial={{ opacity: 0 }} animate={{ opacity: c === ch ? 0.6 : 0.18, d }} transition={{ delay: 0.35 + i * 0.12, duration: 0.4 }} />
          ))}
          <rect x={X[0]} y={L.y} width={nw} height={L.h} rx={3} fill="var(--ink)" />
          <text x={X[0] - 12} y={L.y + L.h / 2 - 6} textAnchor="end" fontSize={18} fontWeight={600} fill="var(--ink)">{scenario.segment.name}</text>
          <text x={X[0] - 12} y={L.y + L.h / 2 + 14} textAnchor="end" fontSize={15} fill="var(--muted)">1,240 HCPs</text>
          <rect x={X[1]} y={M[0].y} width={nw} height={M[0].h} rx={3} fill={PUSH} />
          <text x={X[1] + nw / 2} y={M[0].y - 12} textAnchor="middle" fontSize={16} fontWeight={600} fill={PUSH}>Push</text>
          <rect x={X[1]} y={M[1].y} width={nw} height={M[1].h} rx={3} fill={PULL} />
          <text x={X[1] + nw / 2} y={M[1].y + M[1].h + 22} textAnchor="middle" fontSize={16} fontWeight={600} fill={PULL}>Pull</text>
          {ORDER.map((c, i) => {
            const ly = R[i].y + R[i].h / 2;
            return (
              <g key={c} onClick={() => setCh(c)} style={{ cursor: 'pointer' }} role="button" tabIndex={0} aria-label={LABEL[c]} onKeyDown={e => { if (e.key === 'Enter') setCh(c); }}>
                <rect x={X[2]} y={R[i].y} width={nw} height={Math.max(R[i].h, 3)} rx={3} fill={col(c)} />
                <rect x={X[2] + nw + 4} y={ly - 16} width={220} height={34} fill="transparent" />
                <text x={X[2] + nw + 12} y={ly - 2} fontSize={18} fontWeight={c === ch ? 700 : 500} fill="var(--ink)">{LABEL[c]}</text>
                <text x={X[2] + nw + 12} y={ly + 17} fontSize={15} fill="var(--muted)">{n[c].toLocaleString('en-US')} HCPs</text>
              </g>
            );
          })}
        </svg>
        <p className="muted" style={{ fontSize: 13.5 }}>Band width is HCPs reached this cycle. One HCP can be in several channels.</p>
      </div>
      <Win name={LABEL[ch]} right={KIND[ch] === 'pull' ? 'Pull' : 'Push'}>
        <dl className="fields" style={{ gridTemplateColumns: '90px 1fr' }}>
          <dt>Route</dt><dd style={{ fontFamily: 'var(--font)', fontSize: 14 }}>{route(v, ch)}</dd>
          <dt>Reached</dt><dd>{n[ch].toLocaleString('en-US')} HCPs</dd>
          <dt>Timing</dt><dd style={{ fontFamily: 'var(--font)', fontSize: 14 }}>{KIND[ch] === 'pull' ? 'At page load' : ch === 'rt' ? 'Per event, in seconds' : 'Each segment refresh'}</dd>
        </dl>
        {ch === 'email' && !consent && <span className="tag alert" style={{ justifySelf: 'start' }}>Consent off: Dr. Brown filtered out</span>}
      </Win>
    </div>
  );
}

/* Beat 1: what he sees in each channel */
function Experience({ consent }: { consent: boolean }) {
  const reach = brownChannels(consent);
  const d = decisionFor(useDemo(s => s.mode), consent);
  const webinar = d.action.id === 'webinar';
  return (
    <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', alignItems: 'start' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Win name="Inbox" right={reach.email ? '9:12 AM' : 'Not sent'} style={{ opacity: reach.email ? 1 : 0.5 }}>
          {reach.email ? (
            <div style={{ display: 'grid', gap: 6 }}>
              <span className="muted" style={{ fontSize: 13 }}>{scenario.brand} Medical Information</span>
              {webinar ? <>
                <span style={{ fontWeight: 600 }}>Invitation: retina webinar</span>
                <span style={{ fontSize: 14 }}>Dear Dr. Brown, you are invited to our upcoming webinar for retina specialists.</span>
              </> : <>
                <span style={{ fontWeight: 600 }}>Updated dosing guidance for retina specialists</span>
                <span style={{ fontSize: 14 }}>Dear Dr. Brown, the dosing guide you viewed last week now includes the 16-week interval data.</span>
              </>}
              <span className="tag blue" style={{ justifySelf: 'start' }}>Approved content</span>
            </div>
          ) : <span className="tag alert" style={{ justifySelf: 'start' }}>No email consent</span>}
        </Win>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <Win name="Rep app" right="Today" style={{ opacity: d.repCall ? 1 : 0.6 }}>
          <span style={{ fontWeight: 600 }}>{d.repCall ? 'Dr. John Brown: remote call within 5 days' : 'Dr. John Brown: no call slot this week'}</span>
          {!d.repCall && <span className="tag" style={{ justifySelf: 'start' }}>Rolls to next week (#{d.brownRank} of 8)</span>}
          <dl className="fields" style={{ gridTemplateColumns: '120px 1fr' }}>
            <dt>Propensity</dt><dd>0.82</dd>
            <dt>Last visit</dt><dd>81 days ago</dd>
            <dt>Prefers</dt><dd style={{ fontFamily: 'var(--font)' }}>Remote calls</dd>
          </dl>
        </Win>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
        <Win name="hcp-publisher.example" right="Sponsored">
          <div style={{ borderRadius: 8, background: 'linear-gradient(120deg, #0F0A19, #2A1A55)', color: '#fff', padding: '16px 14px', display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>For US retina specialists</span>
            <span style={{ fontWeight: 600, fontSize: 17 }}>16-week dosing data</span>
          </div>
          <span className="muted" style={{ fontSize: 13 }}>Matched on NPI to a verified HCP login</span>
        </Win>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
        <Win name="hcp-portal.example/home" right="Signed in">
          <span className="muted" style={{ fontSize: 13 }}>Welcome back, Dr. Brown</span>
          <div style={{ borderRadius: 8, border: '1px solid var(--line)', padding: '12px 14px', display: 'grid', gap: 4 }}>
            <span style={{ fontWeight: 600 }}>Continue: retina dosing guide</span>
            <span className="muted" style={{ fontSize: 13 }}>Personalized at page load from his profile</span>
          </div>
        </Win>
      </motion.div>
    </div>
  );
}

/* Beat 2: live event */
function LiveEvent({ consent, v }: { consent: boolean; v: VendorPack }) {
  const d = decisionFor(useDemo(s => s.mode), consent);
  const steps = [
    { t: '0.0s', s: 'Dosing guide downloaded on the HCP site' },
    { t: '0.8s', s: `Event received by ${v.id === 'neutral' ? 'the CDP' : v.zones.cdp}` },
    { t: '1.6s', s: `Decision layer chose: ${d.label.toLowerCase()}` },
    { t: '2.4s', s: 'Rep alerted' },
    { t: '3.2s', s: consent ? 'Follow-up email journey started' : 'Email skipped, no consent' },
  ];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= steps.length) return;
    const t = setTimeout(() => setShown(s => s + 1), shown === 0 ? 400 : 800);
    return () => clearTimeout(t);
  }, [shown, steps.length]);
  return (
    <div className="split" style={{ display: 'grid', gap: 18, gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 1fr)', alignItems: 'start' }}>
      <div style={{ display: 'grid', gap: 10 }}>
        <Win name="Event log" right={v.realtime} flush>
          <table className="dt">
            <tbody>
              {steps.map((st, i) => (
                <motion.tr key={i} initial={false} animate={{ opacity: i < shown ? 1 : 0.25 }} transition={{ duration: 0.3 }}>
                  <td className="v" style={{ width: 70, color: 'var(--blue-bright)' }}>{st.t}</td>
                  <td>{st.s}</td>
                  <td style={{ textAlign: 'right', width: 40 }}>{i < shown && <span style={{ color: i === 4 && !consent ? 'var(--magenta)' : 'var(--ok)' }}>{i === 4 && !consent ? '✕' : '✓'}</span>}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </Win>
        <button className="btn" style={{ justifySelf: 'start' }} onClick={() => setShown(0)}>Replay</button>
      </div>
      <div className="phone">
        <div className="clock">9:41</div>
        <AnimatePresence>
          {shown >= 4 && (
            <motion.div key="rep" className="notif" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="app-name"><span>Rep app</span><span>now</span></span>
              <strong>Dr. Brown downloaded the dosing guide</strong>
              <span className="muted" style={{ fontSize: 13 }}>{d.repCall ? 'Remote call within 5 days' : 'No call slot this week'}</span>
            </motion.div>
          )}
          {shown >= 5 && consent && (
            <motion.div key="email" className="notif" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="app-name"><span>Journey</span><span>now</span></span>
              <strong>Dr. Brown entered "Dosing follow-up"</strong>
              <span className="muted" style={{ fontSize: 13 }}>First email in 1 hour</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* Beat 3: clean room vs activation */
function CleanRoom({ v }: { v: VendorPack }) {
  const Box = ({ label, sub, tone }: { label: string; sub: string; tone?: string }) => (
    <div className="win" style={{ padding: '12px 14px', gap: 2, textAlign: 'center', borderColor: tone }}>
      <span style={{ fontWeight: 600 }}>{label}</span><span className="muted" style={{ fontSize: 13 }}>{sub}</span>
    </div>
  );
  return (
    <div className="split" style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
      <Win name="Activation" right="List shared">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
          <Box label={scenario.brand} sub="1,240 NPIs" />
          <span style={{ color: 'var(--magenta)', fontWeight: 600 }}>→</span>
          <Box label="Publisher" sub="sees all 1,240" tone="var(--magenta)" />
        </div>
        <span className="muted" style={{ fontSize: 14 }}>The publisher receives your target list.</span>
      </Win>
      <Win name={v.cleanRoom} right="Totals only">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
          <Box label={scenario.brand} sub="encrypted keys" />
          <div className="win" style={{ padding: '10px 14px', textAlign: 'center', gap: 0, background: 'var(--blue-soft)', borderColor: 'transparent' }}>
            <span className="big" style={{ fontSize: 34, color: 'var(--blue)' }}>{scenario.cleanRoomOverlap}</span>
            <span className="muted" style={{ fontSize: 12 }}>overlap</span>
          </div>
          <Box label="Publisher" sub="encrypted keys" />
        </div>
        <span className="muted" style={{ fontSize: 14 }}>Neither side sees the other's names.</span>
      </Win>
    </div>
  );
}

/* Beat 4: recap */
function Recap() {
  const cols = [
    { n: '6', l: 'source records', s: '5 systems' },
    { n: '1', l: 'golden record', s: scenario.hcp.masterId },
    { n: '5', l: 'linked identifiers', s: 'email, login, cookie' },
    { n: '1,240', l: 'HCPs in segment', s: scenario.segment.name },
    { n: '5', l: 'channels', s: 'push and pull' },
  ];
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'stretch', flexWrap: 'wrap' }}>
      {cols.map((c, i) => (
        <motion.div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', flex: '1 1 160px' }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.22 }}>
          <div className="win" style={{ flex: 1, padding: '18px 16px', gap: 4 }}>
            <span className="num">{String(i + 1).padStart(2, '0')}</span>
            <span className={`big ${i === cols.length - 1 ? 'g' : ''}`} style={{ fontSize: 48 }}>{c.n}</span>
            <span style={{ fontWeight: 600 }}>{c.l}</span>
            <span className="muted mono" style={{ fontSize: 12.5 }}>{c.s}</span>
          </div>
          {i < cols.length - 1 && <span className="muted" aria-hidden>→</span>}
        </motion.div>
      ))}
    </div>
  );
}
