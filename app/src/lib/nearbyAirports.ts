/** Alternate IATA codes searched when « nearby airports » is enabled. */
export const NEARBY_AIRPORTS: Record<string, string[]> = {
  NKC: ['NKC'],
  JED: ['JED', 'MED'],
  MED: ['MED', 'JED'],
  CMN: ['CMN', 'RAK'],
  CDG: ['CDG', 'ORY'],
  IST: ['IST', 'SAW'],
  DXB: ['DXB', 'SHJ'],
  DSS: ['DSS'],
  TUN: ['TUN'],
  CAI: ['CAI', 'HBE'],
  RUH: ['RUH'],
  LHR: ['LHR', 'LGW', 'STN']
};

export function expandAirport(code: string, includeNearby: boolean): string[] {
  const base = code.trim().toUpperCase();
  if (!includeNearby) return [base];
  return NEARBY_AIRPORTS[base] ?? [base];
}
