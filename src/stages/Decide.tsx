import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { Head, Win } from '../components/ui';
import { useDemo } from '../store';
import { OPTIONS, PASSES, isActive, playOrder, blockedReasons, chooseAction, type Mode } from '../decision';

const STEP_MS = 1600;
const D = scenario.decide;

function narration(n: number, mode: Mode, consent: boolean) {
  if (n === 0) return { head: 'Trigger received', text: 'The decision layer lists every possible move for Dr. Ortiz.' };
  const p = PASSES[n - 1];
  const extra = n === 1 && !consent ? ' With email consent off, every email option is blocked too.' : '';
  const rulesOnly = n === 1 && mode === 'rules' ? ' Rules only: no model, so a fixed brand priority list picks among the allowed options.' : '';
  return { head: `Pass ${n} of 2: ${p.name}`, text: p.text + extra + rulesOnly };
}

export function Decide({ local, consent }: StageProps) {
  const { mode, setMode, sub, subPlaying, setSub } = useDemo();
  const reduced = useReducedMotion();
  const order = playOrder(mode);
  const last = order[order.length - 1];

  // Start the playthrough on entering the step or switching mode; a pass clicked on the map is honoured once.
  useEffect(() => {
    if (local >= 1 || reduced) { setSub(2, false); return; }
    const req = useDemo.getState().subRequest;
    if (req && isActive(req, mode)) {
      setSub(req, true);
      const t = setTimeout(() => useDemo.getState().requestSub(null), 0);
      return () => clearTimeout(t);
    }
    setSub(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local, mode, reduced]);

  // Trigger, then pass 1, then pass 2 (skipped in Rules only).
  useEffect(() => {
    if (!subPlaying) return;
    const nextN = sub === 0 ? order[0] : order.find(n => n > sub);
    const t = setTimeout(() => (nextN ? setSub(nextN, true) : setSub(sub, false)), sub === 0 ? 900 : STEP_MS);
    return () => clearTimeout(t);
  }, [sub, subPlaying, order, last, setSub]);

  // The decision is shown once the last pass for this mode has started.
  const finished = sub >= last;
  const ml = mode === 'ml';
  const pick = chooseAction(mode, consent);
  const nar = narration(Math.min(sub, mode === 'rules' ? 1 : 2), mode, consent);
  const jump = (n: number) => { if (isActive(n, mode)) setSub(n, !reduced); };
  // On the second beat, bring the result cards into view.
  const outRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (local >= 1) setTimeout(() => outRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' }), 350); }, [local, mode, reduced]);

  return (
    <>
      <Head
        title="Rules first, then *machine learning*"
        sub={`Trigger: ${scenario.hcp.short} entered the real-time side effect audience at ${scenario.audience.rt.entered}. Data 360 asks the decision layer what to do next for her.`}
        meta={<span className="tag">Illustrative numbers</span>}
      />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="seg light" role="group" aria-label="Decision method">
          <button aria-pressed={!ml} onClick={() => setMode('rules')}>Rules only</button>
          <button aria-pressed={ml} onClick={() => setMode('ml')}>Rules plus machine learning</button>
        </div>
        <span className="muted" style={{ fontSize: 13.5 }}>Press M to switch</span>
        <button className="btn" style={{ marginLeft: 'auto' }} onClick={() => setSub(0, !reduced)} disabled={subPlaying}>{subPlaying ? 'Running…' : 'Replay decision'}</button>
      </div>

      <div className="pipe" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }} role="list" aria-label="Decision passes">
        {PASSES.map(p => {
          const active = isActive(p.n, mode);
          const live = active && sub === p.n && subPlaying;
          const done = active && sub >= p.n;
          return (
            <button key={p.n} role="listitem" className={`pipe-step ${live ? 'live' : ''} ${done ? 'done' : ''} ${active ? '' : 'off'}`}
              onClick={() => jump(p.n)} disabled={!active} aria-current={sub === p.n ? 'step' : undefined}>
              <span className="num" style={{ fontSize: 24, gridRow: 'span 2' }}>{p.n}</span>
              <span style={{ fontWeight: 600 }}>{p.name}</span>
              <span className="muted" style={{ fontSize: 12.5 }}>{active ? p.kind : 'Off in Rules only'}</span>
            </button>
          );
        })}
      </div>

      <motion.div key={`${sub}-${mode}`} className="narr" initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} aria-live="polite">
        <span className="narr-label">{nar.head}</span><span>{nar.text}</span>
      </motion.div>

      <Win name="Options for Dr. Ortiz" right={ml ? 'Pass 2 ranks by chance she engages' : 'Brand priority list'} flush>
        <div style={{ overflowX: 'auto' }}>
          <table className="dt decide-table">
            <thead>
              <tr><th>Option</th><th>Pass 1: rules</th><th className={ml ? '' : 'struck'}>Pass 2: chance she engages</th><th className={ml ? 'struck' : ''}>Rules only rank</th><th>Decision</th></tr>
            </thead>
            <tbody>
              {OPTIONS.map(o => {
                const reasons = blockedReasons(o, consent);
                const blocked = reasons.length > 0;
                const ruled = sub >= 1;
                const ranked = ml ? sub >= 2 : ruled;
                const chosen = finished && pick.id === o.id;
                return (
                  <tr key={o.id} className={`${blocked && ruled ? 'blocked' : ''} ${chosen ? 'chosen' : ''}`}>
                    <td style={{ fontWeight: 500 }}>{o.name}</td>
                    <td>{!ruled ? <span className="faint">…</span> : blocked
                      ? <span className="tag alert" style={{ whiteSpace: 'normal' }}>Blocked: {reasons.join('; ')}</span>
                      : <span className="tag ok">Allowed</span>}</td>
                    <td className="v">
                      {!ml ? <span className="faint">Not used</span> : blocked && ruled ? <span className="faint">–</span> : !ranked ? <span className="faint">…</span> : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 70, height: 8, borderRadius: 4, background: 'var(--line)', overflow: 'hidden', display: 'inline-block' }}>
                            <motion.span initial={reduced ? false : { width: 0 }} animate={{ width: `${((o.response ?? 0) / 40) * 100}%` }} transition={{ duration: 0.5 }}
                              style={{ display: 'block', height: '100%', background: 'var(--grad)' }} />
                          </span>{o.response}%
                        </span>
                      )}
                    </td>
                    <td className="v">{ml ? <span className="faint">Not used</span> : blocked && ruled ? <span className="faint">–</span> : !ranked ? <span className="faint">…</span> : `Priority ${o.rank}`}</td>
                    <td>{chosen && <motion.span initial={reduced ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="tag solid">Chosen</motion.span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Win>

      {local >= 1 && finished && (
        <div ref={outRef} className="split" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1.3fr) minmax(280px, 1fr)', alignItems: 'start' }}>
          {ml ? <MlOutput consent={consent} pickName={pick.name} /> : <RulesOutput pickName={pick.name} />}
          <div style={{ display: 'grid', gap: 12 }}>
            <Win name="Rules first, always">
              <span style={{ fontSize: 14 }}>The model only ranks what the rules allow, so it can never pick an action the brand is not permitted to take. People write the rules and approve the content.</span>
            </Win>
            <Win name="Where this runs today">
              <span style={{ fontSize: 14 }}>There is no decision engine today. Rules run in Salesforce Flow on Data 360 events; the ranking model is trained and scored in Snowflake and read through Zero Copy. A dedicated engine can come later without changing this logic.</span>
            </Win>
          </div>
        </div>
      )}
    </>
  );
}

function MlOutput({ consent, pickName }: { consent: boolean; pickName: string }) {
  const isGuide = pickName === 'Side effect guide email';
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Win name="Next best action" right="Rules plus machine learning">
        <span style={{ fontWeight: 600, fontSize: 18 }}>{isGuide ? 'Send the side effect guide email today' : pickName}</span>
        <dl className="fields" style={{ gridTemplateColumns: '100px 1fr' }}>
          <dt>Why</dt><dd style={{ fontFamily: 'var(--font)', fontSize: 14 }}>{isGuide ? D.why : 'Email options are blocked without consent; this is the highest-ranked allowed option'}</dd>
          <dt>Explained by</dt><dd style={{ fontFamily: 'var(--font)', fontSize: 14 }}>An Agentforce agent writes the rep's reason from the decision. The language model explains; it never decides.</dd>
        </dl>
      </Win>
      <Win name="Next best experience" right="Touches planned after it" flush>
        <table className="dt">
          <tbody>
            {D.nbe.map(([when, what, isEmail]) => {
              const skip = isEmail && !consent;
              return (
                <tr key={when as string} style={{ opacity: skip ? 0.5 : 1 }}>
                  <td className="muted" style={{ width: 150 }}>{when}</td>
                  <td>{what}{skip && <span className="tag alert" style={{ marginLeft: 8 }}>Skipped: no email consent</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Win>
    </div>
  );
}

function RulesOutput({ pickName }: { pickName: string }) {
  return (
    <Win name="What gets sent" right="Rules only">
      <span style={{ fontWeight: 600, fontSize: 18 }}>{pickName}</span>
      <dl className="fields" style={{ gridTemplateColumns: '60px 1fr' }}>
        <dt>Why</dt><dd style={{ fontFamily: 'var(--font)', fontSize: 14 }}>Brand priority list{pickName.includes('webinar') ? ': webinars first' : ', top allowed option'}</dd>
      </dl>
      <div className="note-line">Allowed, but not what she just asked for. With no model and no sequence, each rule fires on its own and nothing plans the next touch.</div>
    </Win>
  );
}
