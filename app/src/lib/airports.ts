export const AIRPORT_CITY: Record<string, string> = {
  NKC: 'Nouakchott',
  JED: 'Djeddah',
  CMN: 'Casablanca',
  DSS: 'Dakar',
  IST: 'Istanbul',
  CDG: 'Paris',
  TUN: 'Tunis',
  DXB: 'Dubaï'
};

export function cityFor(iataCode: string): string {
  return AIRPORT_CITY[iataCode] ?? iataCode;
}
