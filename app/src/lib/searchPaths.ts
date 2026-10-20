export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export function normalizeIata(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
}

export function buildFlightsSearchPath(params: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  origin2?: string;
  destination2?: string;
  departureDate2?: string;
  trip?: 'rt' | 'ow' | 'mc';
  adults: number;
  cabinClass: CabinClass;
  bagsIndex?: number;
  directOnly?: boolean;
  flexible?: boolean;
  nearby?: boolean;
  preferredAirline?: string;
}): string {
  const q = new URLSearchParams();
  q.set('origin', normalizeIata(params.origin));
  q.set('destination', normalizeIata(params.destination));
  q.set('departureDate', params.departureDate);
  if (params.trip === 'ow') q.set('trip', 'ow');
  if (params.trip === 'mc') {
    q.set('trip', 'mc');
    if (params.origin2) q.set('origin2', normalizeIata(params.origin2));
    if (params.destination2) q.set('destination2', normalizeIata(params.destination2));
    if (params.departureDate2) q.set('departureDate2', params.departureDate2);
  }
  if (params.returnDate) q.set('returnDate', params.returnDate);
  q.set('adults', String(Math.max(1, Math.min(9, params.adults))));
  q.set('cabinClass', params.cabinClass);
  if (params.bagsIndex != null) q.set('bags', String(params.bagsIndex));
  if (params.directOnly) q.set('stops', 'direct');
  if (params.flexible) q.set('flexible', '1');
  if (params.nearby) q.set('nearby', '1');
  if (params.preferredAirline?.trim()) q.set('airline', params.preferredAirline.trim());
  return `/flights?${q.toString()}`;
}

export function buildHotelsSearchPath(params: {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
}): string {
  const q = new URLSearchParams();
  q.set('destination', params.destination.trim());
  q.set('checkIn', params.checkIn);
  q.set('checkOut', params.checkOut);
  q.set('adults', String(Math.max(1, params.adults)));
  q.set('rooms', String(Math.max(1, params.rooms)));
  return `/hotels?${q.toString()}`;
}

export function buildPackagesSearchPath(params: {
  kind: 'omra' | 'hajj';
  departureCity?: string;
  period?: string;
  duration?: string;
  pilgrims?: number;
}): string {
  const q = new URLSearchParams();
  q.set('kind', params.kind);
  if (params.departureCity?.trim()) q.set('city', params.departureCity.trim());
  if (params.period?.trim()) q.set('period', params.period.trim());
  if (params.duration?.trim()) q.set('duration', params.duration.trim());
  if (params.pilgrims && params.pilgrims > 0) q.set('pilgrims', String(params.pilgrims));
  return `/packages?${q.toString()}`;
}

export function buildHotelsSearchPathWithFilters(
  base: Parameters<typeof buildHotelsSearchPath>[0] & {
    nearHaram?: boolean;
    freeCancel?: boolean;
    breakfast?: boolean;
  }
): string {
  const path = buildHotelsSearchPath(base);
  const q = new URLSearchParams(path.split('?')[1] ?? '');
  if (base.nearHaram) q.set('nearHaram', '1');
  if (base.freeCancel) q.set('freeCancel', '1');
  if (base.breakfast) q.set('breakfast', '1');
  return `/hotels?${q.toString()}`;
}

export function buildServiceInquiryPath(params: {
  service: 'cars' | 'visa';
  place: string;
  dateFrom: string;
  dateTo?: string;
}): string {
  const q = new URLSearchParams();
  q.set('type', 'service');
  q.set('service', params.service);
  q.set('place', params.place.trim());
  q.set('dateFrom', params.dateFrom);
  if (params.dateTo) q.set('dateTo', params.dateTo);
  return `/booking?${q.toString()}`;
}
