import type { VendorPack } from '../vendors';

export interface StageProps {
  /** Beat index within this step (0-based). */
  local: number;
  v: VendorPack;
  deep: boolean;
  consent: boolean;
}
