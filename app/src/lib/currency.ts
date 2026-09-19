/**
 * Duffel settles in currencies it supports (EUR/USD/etc.) — MRU isn't one
 * of them, so offers are requested/priced in EUR and converted here for
 * display. This rate is a static placeholder; wire it to the agency's real
 * exchange-rate source (a small admin setting, or a daily FX fetch) before
 * relying on it for actual pricing.
 */
export const MRU_PER_EUR = 40;

export function eurToMru(amountEur: number): number {
  return Math.round(amountEur * MRU_PER_EUR);
}
