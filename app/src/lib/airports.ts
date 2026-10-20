export const AIRPORT_CITY: Record<string, string> = {
  NKC: 'Nouakchott',
  JED: 'Djeddah',
  CMN: 'Casablanca',
  DSS: 'Dakar',
  IST: 'Istanbul',
  CDG: 'Paris',
  TUN: 'Tunis',
  DXB: 'Dubaï',
  RUH: 'Riyad',
  MED: 'Médine',
  CAI: 'Le Caire',
  LHR: 'Londres',
  FCO: 'Rome'
};

/** IATA codes offered in the home search hub datalist. */
export const SEARCH_HUB_AIRPORTS = ['NKC', 'JED', 'CMN', 'DSS', 'IST', 'CDG', 'TUN', 'DXB', 'RUH', 'MED', 'CAI'] as const;

export function cityFor(iataCode: string): string {
  return AIRPORT_CITY[iataCode] ?? iataCode;
}

export function isKnownAirport(iataCode: string): boolean {
  const code = iataCode.trim().toUpperCase();
  return code.length === 3 && code in AIRPORT_CITY;
}
