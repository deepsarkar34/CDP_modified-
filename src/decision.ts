// The decision layer, as plain functions. All numbers come from scenario.json and are illustrative.
import scenario from './scenario/scenario.json';

export type Mode = 'ml' | 'rules';
export type OptionId = 'call' | 'webinar' | 'none' | 'visit' | 'dosing';

export interface DecideOption {
  id: OptionId; name: string; costLabel: string; email: boolean;
  response?: number; cost?: number; priority?: number; blocked?: string;
}

const D = scenario.decide;
export const OPTIONS = D.options as DecideOption[];
export const BASELINE = D.baseline;
export const VALUE_PER_ENGAGED = D.valuePerEngaged;
export const SLOTS = D.capacity.slots;

export const SUBLAYERS = [
  { n: 1, name: 'Guardrails', short: 'Guardrails', kind: 'Rules' },
  { n: 2, name: 'Predict response', short: 'Predict', kind: 'Machine learning' },
  { n: 3, name: 'Lift', short: 'Lift', kind: 'Machine learning' },
  { n: 4, name: 'Value vs cost', short: 'Value', kind: 'Math' },
  { n: 5, name: 'Choose within capacity', short: 'Capacity', kind: 'Rules + math' },
] as const;

/** Sublayers 2 to 4 are switched off in Rules only. */
export const isActive = (n: number, mode: Mode) => mode === 'ml' || n === 1 || n === 5;
/** Order the sublayers play in for a mode. */
export const playOrder = (mode: Mode) => SUBLAYERS.map(s => s.n).filter(n => isActive(n, mode));

/** Lift in percentage points over the "do nothing" baseline. */
export const lift = (o: DecideOption) => (o.response ?? BASELINE) - BASELINE;
/** Net value in dollars: lift × value of an engaged HCP − cost. */
export const netValue = (o: DecideOption) => (lift(o) / 100) * VALUE_PER_ENGAGED - (o.cost ?? 0);

/** Guardrail reasons that remove an option (empty = allowed). */
export function blockedReasons(o: DecideOption, consent: boolean): string[] {
  const r: string[] = [];
  if (o.email && !consent) r.push('No email consent');
  if (o.blocked) r.push(o.blocked);
  return r;
}

export const allowedOptions = (consent: boolean) => OPTIONS.filter(o => blockedReasons(o, consent).length === 0);

/** The chosen action: highest net value (ML) or top of the brand priority list (Rules only). */
export function chooseAction(mode: Mode, consent: boolean): DecideOption {
  const allowed = allowedOptions(consent);
  return mode === 'ml'
    ? allowed.reduce((best, o) => (netValue(o) > netValue(best) ? o : best))
    : allowed.reduce((best, o) => ((o.priority ?? 99) < (best.priority ?? 99) ? o : best));
}

export interface Ranked { name: string; propensity: number; lift: number; rank: number }

/** Rank the doctors competing for the rep's remote-call slots: by lift (ML) or by propensity (Rules only). */
export function rankCapacity(mode: Mode) {
  const docs = D.capacity.doctors.map(([name, propensity, l]) => ({ name: name as string, propensity: propensity as number, lift: l as number }));
  const sorted = [...docs].sort((a, b) => (mode === 'ml' ? b.lift - a.lift : b.propensity - a.propensity));
  const ranked: Ranked[] = sorted.map((d, i) => ({ ...d, rank: i + 1 }));
  return { thisWeek: ranked.slice(0, SLOTS), nextWeek: ranked.slice(SLOTS), rankOf: (n: string) => ranked.find(r => r.name === n)!.rank };
}

/** What the decision means for Dr. Brown, used by Decide, Activate and the footer. */
export function decisionFor(mode: Mode, consent: boolean) {
  const action = chooseAction(mode, consent);
  const brownRank = rankCapacity(mode).rankOf(scenario.hcp.short);
  const brownHasSlot = brownRank <= SLOTS;
  const repCall = action.id === 'call' && brownHasSlot;
  const label = action.id === 'call'
    ? (brownHasSlot ? 'Remote call within 5 days' : 'Remote call, no slot this week')
    : action.name;
  return { action, brownRank, brownHasSlot, repCall, label };
}
