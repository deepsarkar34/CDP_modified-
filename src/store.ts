import { create } from 'zustand';
import { BEATS, clampBeat, firstBeatOf } from './beats';
import { VENDOR_ORDER, type VendorId } from './vendors';
import scenario from './scenario/scenario.json';
import type { Mode } from './decision';

export interface DemoState {
  beat: number;
  vendor: VendorId;
  deepDive: boolean;
  consent: boolean;
  /** Decision layer mode: rules plus machine learning, or rules only. */
  mode: Mode;
  /** Decide step playback: highest sublayer revealed (0 = none, 5 = finished). Local to this window. */
  sub: number;
  /** True while the Decide sublayers are auto-playing. Local to this window. */
  subPlaying: boolean;
  /** Sublayer clicked on the map from another step; Decide starts from it on entry. */
  subRequest: number | null;
  startedAt: number | null;
}

export interface DemoActions {
  next: () => void;
  prev: () => void;
  jumpStep: (step: number) => void;
  setVendor: (v: VendorId) => void;
  cycleVendor: () => void;
  toggleDeepDive: () => void;
  toggleConsent: () => void;
  toggleMode: () => void;
  setMode: (m: Mode) => void;
  setSub: (n: number, playing?: boolean) => void;
  requestSub: (n: number | null) => void;
  reset: () => void;
  /** Apply state received from another window (presenter sync). */
  hydrate: (s: Partial<DemoState>) => void;
}

export const initialState: DemoState = { beat: 0, vendor: 'salesforce', deepDive: false, consent: true, mode: 'ml', sub: 0, subPlaying: false, subRequest: null, startedAt: null };

const started = (s: DemoState) => s.startedAt ?? Date.now();

export const useDemo = create<DemoState & DemoActions>((set, get) => ({
  ...initialState,
  next: () => set(s => ({ beat: clampBeat(s.beat + 1), startedAt: started(s) })),
  prev: () => set(s => ({ beat: clampBeat(s.beat - 1) })),
  jumpStep: step => { const i = firstBeatOf(step); if (i >= 0) set(s => ({ beat: i, startedAt: started(s) })); },
  setVendor: vendor => set({ vendor }),
  cycleVendor: () => { const i = VENDOR_ORDER.indexOf(get().vendor); set({ vendor: VENDOR_ORDER[(i + 1) % VENDOR_ORDER.length] }); },
  toggleDeepDive: () => set(s => ({ deepDive: !s.deepDive })),
  toggleConsent: () => set(s => ({ consent: !s.consent })),
  toggleMode: () => set(s => ({ mode: s.mode === 'ml' ? 'rules' : 'ml' })),
  setMode: mode => set({ mode }),
  setSub: (sub, playing = false) => set({ sub, subPlaying: playing }),
  requestSub: subRequest => set({ subRequest }),
  reset: () => set({ ...initialState }),
  hydrate: s => set(s),
}));

export const currentBeat = (beat: number) => BEATS[beat];

/** Channel reach counts. Consent is a per-channel filter: it only affects email. */
export function channelCounts(consent: boolean) {
  const c = scenario.channels;
  const n = Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v.n])) as Record<keyof typeof c, number>;
  return { ...n, email: consent ? n.email : n.email - 1 };
}
