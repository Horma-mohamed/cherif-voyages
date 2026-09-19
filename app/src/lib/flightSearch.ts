import { searchFlights, type FlightOffer } from '@/lib/duffel';
import { eurToMru } from '@/lib/currency';
import { isoDurationToMinutes } from '@/lib/duration';

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
  adults?: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
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

export async function performFlightSearch(
  query: FlightSearchQuery
): Promise<{ offerRequestId: string; results: FlightSearchResult[] }> {
  const { offerRequestId, offers } = await searchFlights({
    origin: query.origin,
    destination: query.destination,
    departureDate: query.departureDate,
    returnDate: query.returnDate,
    adults: query.adults ?? 1,
    cabinClass: query.cabinClass ?? 'economy'
  });

  return {
    offerRequestId,
    results: offers.map(toSearchResult).sort((a, b) => a.priceEur - b.priceEur)
  };
}
