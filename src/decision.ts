// The decision layer for Dr. Ortiz: two passes, in this order.
// Pass 1 (rules) removes what is not allowed. Pass 2 (machine learning) ranks what is left.
// In Rules only, pass 2 is off and a fixed brand priority list picks. All numbers illustrative.
import scenario from './scenario/scenario.json';

export type Mode = 'ml' | 'rules';
export interface DecideOption { id: string; name: string; email: boolean; response?: number; rank?: number; blocked?: string }

export const OPTIONS = scenario.decide.options as DecideOption[];

export const PASSES = [
  { n: 1, name: 'Rules: what is allowed', short: 'Rules', kind: 'Rules',
    text: 'Remove what the brand may not do: consent, contact limits, MLR approved content, the call plan and medical versus promotional boundaries.' },
  { n: 2, name: 'ML: what works best', short: 'ML', kind: 'Machine learning',
    text: 'A model trained in Snowflake on how similar oncologists responded estimates her chance of engaging with each allowed option, and ranks them.' },
] as const;

/** Pass 2 is switched off in Rules only. */
export const isActive = (n: number, mode: Mode) => mode === 'ml' || n === 1;
export const playOrder = (mode: Mode) => PASSES.map(p => p.n).filter(n => isActive(n, mode));

/** Guardrail reasons that remove an option (empty = allowed). */
export function blockedReasons(o: DecideOption, consent: boolean): string[] {
  const r: string[] = [];
  if (o.blocked) r.push(o.blocked);
  if (o.email && !consent && !o.blocked) r.push('No email consent');
  return r;
}
export const allowedOptions = (consent: boolean) => OPTIONS.filter(o => blockedReasons(o, consent).length === 0);

/** Rules plus ML: highest predicted engagement. Rules only: top of the brand priority list. */
export function chooseAction(mode: Mode, consent: boolean): DecideOption {
  const a = allowedOptions(consent);
  return mode === 'ml'
    ? a.reduce((best, o) => ((o.response ?? 0) > (best.response ?? 0) ? o : best))
    : a.reduce((best, o) => ((o.rank ?? 99) < (best.rank ?? 99) ? o : best));
}

/** Short label used by the footer and Activate. */
export const decisionLabel = (mode: Mode, consent: boolean) => chooseAction(mode, consent).name;
