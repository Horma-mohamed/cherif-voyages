import type { CabinClass } from '@/lib/searchPaths';

export type SearchHubMode = 'flights' | 'hotels' | 'omra' | 'hajj' | 'cars' | 'visa';

export type SearchHubFlightState = {
  trip: 'rt' | 'ow' | 'mc';
  origin: string;
  destination: string;
  origin2?: string;
  destination2?: string;
  departureDate: string;
  returnDate?: string;
  departureDate2?: string;
  adults: number;
  cabinClass: CabinClass;
  bagsIndex: number;
  directOnly: boolean;
  flexible: boolean;
  nearby: boolean;
  preferredAirline: string;
};

export function flightStateFromParams(params: Record<string, string | undefined>): Partial<SearchHubFlightState> {
  return {
    trip: params.trip === 'ow' || params.trip === 'mc' ? params.trip : 'rt',
    origin: params.origin,
    destination: params.destination,
    origin2: params.origin2,
    destination2: params.destination2,
    departureDate: params.departureDate,
    returnDate: params.returnDate,
    departureDate2: params.departureDate2,
    adults: params.adults ? Number(params.adults) : undefined,
    cabinClass: params.cabinClass as CabinClass | undefined,
    bagsIndex: params.bags ? Number(params.bags) : undefined,
    directOnly: params.stops === 'direct',
    flexible: params.flexible === '1',
    nearby: params.nearby === '1',
    preferredAirline: params.airline
  };
}

export function parseHomeSearchParams(params: Record<string, string | undefined>) {
  const hub = params.hub as SearchHubMode | undefined;
  if (!hub) return { mode: 'flights' as SearchHubMode };

  if (hub === 'flights') {
    const partial = flightStateFromParams(params);
    return {
      mode: hub,
      flight: {
        trip: partial.trip ?? 'rt',
        origin: partial.origin ?? 'NKC',
        destination: partial.destination ?? 'JED',
        origin2: partial.origin2 ?? 'CMN',
        destination2: partial.destination2 ?? 'CDG',
        departureDate: partial.departureDate ?? '2027-03-12',
        returnDate: partial.returnDate ?? '2027-03-26',
        departureDate2: partial.departureDate2 ?? '2027-03-20',
        adults: partial.adults ?? 1,
        cabinClass: partial.cabinClass ?? 'economy',
        bagsIndex: partial.bagsIndex ?? 1,
        directOnly: partial.directOnly ?? false,
        flexible: partial.flexible ?? false,
        nearby: partial.nearby ?? false,
        preferredAirline: partial.preferredAirline ?? '',
        preferredAirlineActive: !!partial.preferredAirline
      }
    };
  }

  return { mode: hub };
}

export function buildHomeFlightSearchQuery(state: SearchHubFlightState): string {
  const q = new URLSearchParams();
  q.set('hub', 'flights');
  q.set('trip', state.trip);
  q.set('origin', state.origin);
  q.set('destination', state.destination);
  q.set('departureDate', state.departureDate);
  if (state.returnDate) q.set('returnDate', state.returnDate);
  if (state.origin2) q.set('origin2', state.origin2);
  if (state.destination2) q.set('destination2', state.destination2);
  if (state.departureDate2) q.set('departureDate2', state.departureDate2);
  q.set('adults', String(state.adults));
  q.set('cabinClass', state.cabinClass);
  q.set('bags', String(state.bagsIndex));
  if (state.directOnly) q.set('stops', 'direct');
  if (state.flexible) q.set('flexible', '1');
  if (state.nearby) q.set('nearby', '1');
  if (state.preferredAirline) q.set('airline', state.preferredAirline);
  return `/?${q.toString()}`;
}
