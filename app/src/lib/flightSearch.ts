import { searchFlights, type FlightOffer } from '@/lib/duffel';
import { eurToMru } from '@/lib/currency';
import { isoDurationToMinutes } from '@/lib/duration';
import { expandAirport } from '@/lib/nearbyAirports';

export type FlightSearchResult = {
  id: string;
  ownerAirline: string;
  direct: boolean;
  priceEur: number;
  priceMru: number;
  totalDurationMinutes: number;
  requiresInstantPayment: boolean;
  passengerIds: string[];
  slices: FlightOffer['slices'];
};

export interface FlightSearchQuery {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  trip?: 'rt' | 'ow' | 'mc';
  origin2?: string;
  destination2?: string;
  departureDate2?: string;
  adults?: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  flexible?: boolean;
  nearby?: boolean;
  preferredAirline?: string;
}

function toSearchResult(offer: FlightOffer): FlightSearchResult {
  const totalDurationMinutes = offer.slices.reduce(
    (sum, slice) => sum + isoDurationToMinutes(slice.duration),
    0
  );
  return {
    id: offer.id,
    ownerAirline: offer.ownerAirline,
    direct: offer.slices.every((slice) => slice.segments.length === 1),
    priceEur: offer.totalAmount,
    priceMru: eurToMru(offer.totalAmount),
    totalDurationMinutes,
    requiresInstantPayment: offer.requiresInstantPayment,
    passengerIds: offer.passengerIds,
    slices: offer.slices
  };
}

function addDays(isoDate: string, delta: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function mergeResults(batches: FlightSearchResult[][]): FlightSearchResult[] {
  const byId = new Map<string, FlightSearchResult>();
  for (const batch of batches) {
    for (const r of batch) {
      const existing = byId.get(r.id);
      if (!existing || r.priceEur < existing.priceEur) byId.set(r.id, r);
    }
  }
  return Array.from(byId.values()).sort((a, b) => a.priceEur - b.priceEur);
}

async function searchOnce(query: FlightSearchQuery, departureDate: string): Promise<FlightSearchResult[]> {
  const extraSlices =
    query.trip === 'mc' && query.origin2 && query.destination2 && query.departureDate2
      ? [{ origin: query.origin2, destination: query.destination2, departureDate: query.departureDate2 }]
      : undefined;

  const { offers } = await searchFlights({
    origin: query.origin,
    destination: query.destination,
    departureDate,
    returnDate: query.trip === 'rt' ? query.returnDate : undefined,
    extraSlices,
    adults: query.adults ?? 1,
    cabinClass: query.cabinClass ?? 'economy'
  });

  let results = offers.map(toSearchResult);
  if (query.preferredAirline?.trim()) {
    const pref = query.preferredAirline.trim().toLowerCase();
    const preferred = results.filter((r) => r.ownerAirline.toLowerCase().includes(pref));
    if (preferred.length > 0) results = preferred;
  }
  return results;
}

export async function performFlightSearch(
  query: FlightSearchQuery
): Promise<{ offerRequestId: string; results: FlightSearchResult[]; datePrices?: Record<string, number | null> }> {
  const departureDates = query.flexible
    ? Array.from({ length: 7 }, (_, i) => addDays(query.departureDate, i - 3))
    : [query.departureDate];

  const originCodes = expandAirport(query.origin, !!query.nearby);
  const destinationCodes = expandAirport(query.destination, !!query.nearby);

  const batches: FlightSearchResult[][] = [];
  const datePrices: Record<string, number | null> = {};

  for (const dep of departureDates) {
    let dayMin: number | null = null;
    for (const origin of originCodes) {
      for (const destination of destinationCodes) {
        if (origin === destination) continue;
        const batch = await searchOnce({ ...query, origin, destination }, dep);
        batches.push(batch);
        for (const r of batch) {
          if (dayMin === null || r.priceMru < dayMin) dayMin = r.priceMru;
        }
      }
    }
    datePrices[dep] = dayMin;
  }

  const results = mergeResults(batches);
  return { offerRequestId: 'merged', results, datePrices: query.flexible ? datePrices : undefined };
}

/** Min MRU price per day for the date strip (±3 days) using the current result set only. */
export function dateStripPrices(
  departureDate: string,
  results: FlightSearchResult[]
): Record<string, number | null> {
  const min = results.length ? Math.min(...results.map((r) => r.priceMru)) : null;
  const out: Record<string, number | null> = {};
  for (let i = -3; i <= 3; i++) {
    const d = addDays(departureDate, i);
    out[d] = d === departureDate ? min : null;
  }
  return out;
}

export { addDays as addDaysToIsoDate };
