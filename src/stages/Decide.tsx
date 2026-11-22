import { motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import type { VendorPack } from '../vendors';
import { Head, Win } from '../components/ui';
import { useDemo } from '../store';
import {
  OPTIONS, BASELINE, VALUE_PER_ENGAGED, SLOTS, SUBLAYERS, isActive, playOrder,
  lift, netValue, blockedReasons, decisionFor, rankCapacity, type Mode,
} from '../decision';

const STEP_MS = 1400;
const D = scenario.decide;
const usd = (n: number) => `${n < 0 ? '-' : n > 0 ? '+' : ''}$${Math.abs(n).toLocaleString('en-US')}`;
const cdpName = (v: VendorPack) => (v.id === 'salesforce' ? 'Data 360' : v.id === 'adobe' ? 'Adobe Real-Time CDP' : 'the CDP');
export const agentName = (v: VendorPack) => (v.id === 'salesforce' ? 'an Agentforce agent' : 'an AI agent');

/** One sentence per sublayer: what it is doing for Dr. Brown right now. */
function narration(n: number, mode: Mode, consent: boolean) {
  const brownRank = rankCapacity(mode).rankOf(scenario.hcp.short);
  switch (n) {
    case 1: return `Rules remove what is not allowed: the in-person visit (prefers remote, slots full) and the dosing email (sent twice this month)${consent ? '' : ', plus every email, because he has no email consent'}.`;
    case 2: return 'A model estimates how likely he is to engage with each option that is left.';
    case 3: return `Lift subtracts the ${BASELINE}% response he would give if we did nothing. What remains is what the action adds because of us.`;
    case 4: return `Each point of lift is worth $${VALUE_PER_ENGAGED.toLocaleString('en-US')} per engaged HCP, minus what the action costs.`;
    default: return mode === 'ml'
      ? `His rep has ${SLOTS} remote-call slots and 8 doctors compete for them. Ranked by lift, Dr. Brown is #${brownRank} and gets a slot.`
      : `A fixed brand priority list picks the action. Rep slots go by propensity, so Dr. Brown is #${brownRank} and misses this week.`;
  }
}

export function Decide({ local, v, consent }: StageProps) {
  const { mode, setMode, sub, subPlaying, setSub } = useDemo();
  const reduced = useReducedMotion();
  const order = playOrder(mode);

  // Start (or restart) the playthrough on entering the step or switching mode.
  // A sublayer clicked on the map from another step is honoured once.
  useEffect(() => {
    if (local >= 1 || reduced) { setSub(5, false); return; }
    const req = useDemo.getState().subRequest;
    if (req && isActive(req, mode)) {
      setSub(req, req < 5);
      const t = setTimeout(() => useDemo.getState().requestSub(null), 0);
      return () => clearTimeout(t);
    }
    setSub(order[0], true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local, mode, reduced]);

  // Advance one sublayer every STEP_MS while playing; Rules only skips 2 to 4.
  useEffect(() => {
    if (!subPlaying) return;
    const nextN = order.find(n => n > sub);
    const t = setTimeout(() => (nextN ? setSub(nextN, true) : setSub(sub, false)), STEP_MS);
    return () => clearTimeout(t);
  }, [sub, subPlaying, order, setSub]);

  const jump = (n: number) => { if (isActive(n, mode)) setSub(n, !reduced && n < 5); };
  const replay = () => setSub(order[0], !reduced);
  const shown = (n: number) => isActive(n, mode) && sub >= n;
  const decision = decisionFor(mode, consent);
  const current = SUBLAYERS[Math.max(1, sub) - 1];

  return (
    <>
      <Head
        title="A segment says who. The decision layer decides *what next*."
        sub={`Trigger: ${scenario.hcp.short} ${D.trigger}. The event streamed into ${cdpName(v)} and asked the decision engine what to do next for him.`}
        meta={<span className="tag">Illustrative numbers</span>}
      />

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="seg light" role="group" aria-label="Decision mode">
          <button aria-pressed={mode === 'rules'} onClick={() => setMode('rules')}>Rules only</button>
          <button aria-pressed={mode === 'ml'} onClick={() => setMode('ml')}>Rules plus machine learning</button>
        </div>
        <span className="muted" style={{ fontSize: 13.5 }}>Press M to switch</span>
        <button className="btn" style={{ marginLeft: 'auto' }} onClick={replay}>Replay decision</button>
      </div>

      <div className="pipe" role="list" aria-label="Decision layer sublayers">
        {SUBLAYERS.map(s => {
          const active = isActive(s.n, mode);
          const live = active && sub === s.n && subPlaying;
          const done = active && sub >= s.n;
          return (
            <button key={s.n} role="listitem" className={`pipe-step ${live ? 'live' : ''} ${done ? 'done' : ''} ${active ? '' : 'off'}`}
              onClick={() => jump(s.n)} disabled={!active} aria-current={sub === s.n ? 'step' : undefined}>
              <span className="num" style={{ fontSize: 24, gridRow: 'span 2' }}>{s.n}</span>
              <span style={{ fontWeight: 600 }}>{s.name}</span>
              <span className="muted" style={{ fontSize: 12.5 }}>{active ? s.kind : 'Off in Rules only'}</span>
            </button>
          );
        })}
      </div>

      <motion.div key={`${sub}-${mode}`} className="narr" initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} aria-live="polite">
        <span className="narr-label">Sublayer {current.n} of 5: {current.name}</span>
        <span>{narration(current.n, mode, consent)}</span>
      </motion.div>

      <div className="split" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1.9fr) minmax(300px, 1fr)', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 6, minWidth: 0 }}>
          <Win name="Options for Dr. Brown" right={`Predicted response. Baseline (do nothing): ${BASELINE}%`} flush>
            <div style={{ overflowX: 'auto' }}>
              <table className="dt decide-table">
                <thead>
                  <tr>
                    <th>Option</th>
                    <th>Guardrail</th>
                    <th className={isActive(2, mode) ? '' : 'struck'}>Response</th>
                    <th className={isActive(3, mode) ? '' : 'struck'}>Lift</th>
                    <th className={isActive(4, mode) ? '' : 'struck'}>Cost</th>
                    <th className={isActive(4, mode) ? '' : 'struck'}>Net value*</th>
                    <th>Priority</th>
                    <th>Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {OPTIONS.map(o => {
                    const reasons = blockedReasons(o, consent);
                    const blocked = reasons.length > 0;
                    const chosen = shown(5) && decision.action.id === o.id;
                    // A cell shows its value once its sublayer has run, a dash for blocked rows or switched-off sublayers.
                    const cell = (n: number, text: string, showBlocked = false) => {
                      const off = !isActive(n, mode) && sub >= 1;
                      const dash = off || (blocked && shown(1) && !showBlocked);
                      return (
                        <td className="v">
                          {dash ? <span className="faint">–</span>
                            : <motion.span initial={false} animate={{ opacity: shown(n) || (showBlocked && blocked && shown(1)) ? 1 : 0 }}>{text}</motion.span>}
                        </td>
                      );
                    };
                    return (
                      <tr key={o.id} className={`${blocked && shown(1) ? 'blocked' : ''} ${chosen ? 'chosen' : ''}`}>
                        <td style={{ fontWeight: 500 }}>{o.name}</td>
                        <td>
                          <motion.span initial={false} animate={{ opacity: shown(1) ? 1 : 0 }}>
                            {blocked ? <span className="tag alert" style={{ whiteSpace: 'normal' }}>Blocked: {reasons.join('; ')}</span> : <span className="tag ok">Allowed</span>}
                          </motion.span>
                        </td>
                        {cell(2, `${o.response}%`)}
                        {cell(3, lift(o) === 0 ? '0' : `+${lift(o)} pt`)}
                        {cell(4, o.costLabel, true)}
                        {cell(4, usd(netValue(o)))}
                        <td className="v" style={{ color: mode === 'rules' ? undefined : 'var(--faint)' }}>{blocked ? '–' : o.priority}</td>
                        <td>{chosen && <motion.span initial={reduced ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="tag solid">Chosen</motion.span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Win>
          <span className="muted" style={{ fontSize: 12.5 }}>*Net value = lift × ${VALUE_PER_ENGAGED.toLocaleString('en-US')} per engaged HCP − cost. Lift = predicted response − {BASELINE}. All numbers illustrative.</span>
        </div>

        {local === 0 ? <Capacity mode={mode} ready={sub >= 5} /> : <Output mode={mode} consent={consent} v={v} />}
      </div>

      <p className="muted" style={{ fontSize: 13, maxWidth: '110ch' }}>
        Where each layer runs on Salesforce: guardrails in Flow or the decision engine; predictions in Einstein Studio, or Snowflake models read through Zero Copy; choice within capacity in Snowflake or a dedicated engine (for example ZAIDYN or PharmaForceIQ); the rep's explanation written by an Agentforce agent. No engine yet? Start with rules plus one propensity score, then add lift and capacity.
      </p>
    </>
  );
}

/* Sublayer 5: the rep's remote-call slots, ranked by lift (ML) or propensity (Rules only). */
function Capacity({ mode, ready }: { mode: Mode; ready: boolean }) {
  const { thisWeek, nextWeek } = rankCapacity(mode);
  const row = (r: { name: string; propensity: number; lift: number; rank: number }, faded: boolean) => {
    const brown = r.name === scenario.hcp.short;
    return (
      <motion.tr layout key={r.name} transition={{ type: 'spring', stiffness: 300, damping: 32 }} className={brown ? 'brown' : ''} style={{ opacity: faded ? 0.55 : 1 }}>
        <td className="v" style={{ width: 36 }}>#{r.rank}</td>
        <td style={{ fontWeight: brown ? 600 : 400 }}>
          {r.name}
          {mode === 'ml' && r.name === 'Dr. Patel' && <span className="muted" style={{ display: 'block', fontSize: 12 }}>{D.capacity.patelNote}</span>}
        </td>
        <td className="v" style={{ fontWeight: mode === 'rules' ? 600 : 400 }}>{r.propensity.toFixed(2)}</td>
        <td className="v" style={{ fontWeight: mode === 'ml' ? 600 : 400 }}>+{r.lift}</td>
      </motion.tr>
    );
  };
  return (
    <Win name="Rep remote-call slots this week" right={`${SLOTS} slots, 8 doctors`} flush>
      {ready ? (
        <table className="dt cap-table">
          <thead><tr><th></th><th>Ranked by {mode === 'ml' ? 'lift' : 'propensity'}</th><th>Propensity</th><th>Lift if called</th></tr></thead>
          <tbody>
            {thisWeek.map(r => row(r, false))}
            <tr className="divider"><td colSpan={4}>Rolls to next week</td></tr>
            {nextWeek.map(r => row(r, true))}
          </tbody>
        </table>
      ) : <p className="muted" style={{ padding: '14px', fontSize: 14 }}>Runs at sublayer 5.</p>}
    </Win>
  );
}

/* Beat 2: what comes out of the decision. */
function Output({ mode, consent, v }: { mode: Mode; consent: boolean; v: VendorPack }) {
  const d = decisionFor(mode, consent);
  if (mode === 'rules') {
    const title = d.action.id === 'webinar'
      ? 'Webinar invite email to Dr. John Brown.'
      : 'Remote call with Dr. John Brown: no slot this week.';
    const why = d.action.id === 'webinar'
      ? 'Brand priority list, webinars first.'
      : `Brand priority list: the webinar is blocked (no email consent), so the rep call is next. Slots go by propensity and he ranks #${d.brownRank} of 8.`;
    return (
      <Win name="Output" right="Rules only">
        <span style={{ fontWeight: 600, fontSize: 18 }}>{title}</span>
        <dl className="fields" style={{ gridTemplateColumns: '60px 1fr' }}>
          <dt>Why</dt><dd style={{ fontFamily: 'var(--font)', fontSize: 14 }}>{why}</dd>
        </dl>
        <div className="note-line">No sequence: each rule fires on its own, so nothing plans the touch after this one.</div>
      </Win>
    );
  }
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Win name="What his rep sees in CRM" right="Rep app">
        <span style={{ fontWeight: 600, fontSize: 18 }}>Remote call with Dr. John Brown within 5 days.</span>
        <dl className="fields" style={{ gridTemplateColumns: '92px 1fr' }}>
          <dt>Why</dt><dd style={{ fontFamily: 'var(--font)', fontSize: 14 }}>{D.why.join('; ')}.</dd>
          <dt>Topic</dt><dd style={{ fontFamily: 'var(--font)', fontSize: 14 }}>{D.topic}</dd>
          <dt>Written by</dt><dd style={{ fontFamily: 'var(--font)', fontSize: 14 }}>{agentName(v)[0].toUpperCase() + agentName(v).slice(1)}, from the engine's reasons</dd>
        </dl>
        <div className="note-line">Models and rules made the choice. The language model only writes the explanation.</div>
      </Win>
      <Win name="Next best experience" right="Planned touches" flush>
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
