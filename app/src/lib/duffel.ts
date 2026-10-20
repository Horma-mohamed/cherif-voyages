/**
 * Duffel Flights API client — https://duffel.com/docs/api
 *
 * Not reachable from this sandbox: outbound requests to api.duffel.com are
 * blocked at the network-policy level here regardless of credentials, so
 * this module is written against Duffel's documented request/response
 * shapes but has never made a live call. Verify against a real sandbox
 * token once this runs outside the sandbox, and check the current
 * `Duffel-Version` in their docs before going live — it changes over time
 * and Duffel enforces it strictly.
 */

const DUFFEL_API_BASE = 'https://api.duffel.com';
const DUFFEL_VERSION = 'v2';

export class DuffelApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'DuffelApiError';
    this.status = status;
    this.body = body;
  }
}

export class DuffelNotConfiguredError extends Error {
  constructor() {
    super('DUFFEL_API_KEY is not set');
    this.name = 'DuffelNotConfiguredError';
  }
}

function apiKey(): string {
  const key = process.env.DUFFEL_API_KEY;
  if (!key) throw new DuffelNotConfiguredError();
  return key;
}

async function duffelRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${DUFFEL_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Duffel-Version': DUFFEL_VERSION,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init?.headers
    }
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      json?.errors?.[0]?.message ?? `Duffel request failed with status ${res.status}`;
    throw new DuffelApiError(message, res.status, json);
  }

  return json.data as T;
}

// ---- Raw Duffel response shapes (snake_case, as documented) ----

interface RawSegment {
  origin: { iata_code: string; name: string };
  destination: { iata_code: string; name: string };
  departing_at: string;
  arriving_at: string;
  duration: string;
  marketing_carrier: { name: string; iata_code: string };
  marketing_carrier_flight_number: string;
  aircraft: { name: string } | null;
}

interface RawSlice {
  origin: { iata_code: string };
  destination: { iata_code: string };
  duration: string;
  segments: RawSegment[];
}

interface RawPassenger {
  id: string;
  type: string;
}

interface RawOffer {
  id: string;
  total_amount: string;
  total_currency: string;
  slices: RawSlice[];
  passengers: RawPassenger[];
  owner: { name: string; iata_code: string | null };
  payment_requirements: {
    requires_instant_payment: boolean;
    payment_required_by: string | null;
  };
}

interface RawOfferRequest {
  id: string;
  offers?: RawOffer[];
}

interface RawOrder {
  id: string;
  booking_reference: string;
  total_amount: string;
  total_currency: string;
}

// ---- Normalized shapes used by the rest of the app ----

export interface FlightSegment {
  origin: string;
  destination: string;
  departingAt: string;
  arrivingAt: string;
  duration: string;
  flightNumber: string;
  carrierName: string;
  aircraft: string | null;
}

export interface FlightSlice {
  origin: string;
  destination: string;
  duration: string;
  segments: FlightSegment[];
}

export interface FlightOffer {
  id: string;
  totalAmount: number;
  totalCurrency: string;
  slices: FlightSlice[];
  passengerIds: string[];
  ownerAirline: string;
  requiresInstantPayment: boolean;
  paymentRequiredBy: string | null;
}

export interface FlightSearchSlice {
  origin: string;
  destination: string;
  departureDate: string;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD
  extraSlices?: FlightSearchSlice[];
  adults: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
}

function mapSegment(segment: RawSegment): FlightSegment {
  return {
    origin: segment.origin.iata_code,
    destination: segment.destination.iata_code,
    departingAt: segment.departing_at,
    arrivingAt: segment.arriving_at,
    duration: segment.duration,
    flightNumber: `${segment.marketing_carrier.iata_code} ${segment.marketing_carrier_flight_number}`,
    carrierName: segment.marketing_carrier.name,
    aircraft: segment.aircraft?.name ?? null
  };
}

function mapOffer(offer: RawOffer): FlightOffer {
  return {
    id: offer.id,
    totalAmount: Number(offer.total_amount),
    totalCurrency: offer.total_currency,
    slices: offer.slices.map((slice) => ({
      origin: slice.origin.iata_code,
      destination: slice.destination.iata_code,
      duration: slice.duration,
      segments: slice.segments.map(mapSegment)
    })),
    passengerIds: offer.passengers.map((p) => p.id),
    ownerAirline: offer.owner.name,
    requiresInstantPayment: offer.payment_requirements.requires_instant_payment,
    paymentRequiredBy: offer.payment_requirements.payment_required_by
  };
}

/**
 * Creates an offer request and returns the offers Duffel found for it.
 * `return_offers=true` asks Duffel to include the first page of offers in
 * the same response instead of a separate GET /air/offers call.
 */
export async function searchFlights(
  params: FlightSearchParams
): Promise<{ offerRequestId: string; offers: FlightOffer[] }> {
  const slices = [
    { origin: params.origin, destination: params.destination, departure_date: params.departureDate }
  ];
  if (params.extraSlices?.length) {
    for (const leg of params.extraSlices) {
      slices.push({
        origin: leg.origin,
        destination: leg.destination,
        departure_date: leg.departureDate
      });
    }
  } else if (params.returnDate) {
    slices.push({
      origin: params.destination,
      destination: params.origin,
      departure_date: params.returnDate
    });
  }

  const offerRequest = await duffelRequest<RawOfferRequest>('/air/offer_requests?return_offers=true', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        slices,
        passengers: Array.from({ length: params.adults }, () => ({ type: 'adult' })),
        cabin_class: params.cabinClass ?? 'economy'
      }
    })
  });

  return {
    offerRequestId: offerRequest.id,
    offers: (offerRequest.offers ?? []).map(mapOffer)
  };
}

export interface DuffelPassengerInput {
  offerPassengerId: string;
  title: 'mr' | 'mrs' | 'ms' | 'miss' | 'dr';
  gender: 'm' | 'f';
  givenName: string;
  familyName: string;
  bornOn: string; // YYYY-MM-DD
  email: string;
  phoneNumber: string; // E.164
}

/**
 * Creates a "hold" order: Duffel reserves the seats without taking payment
 * immediately. This matches this agency's actual payment rails (Bankily,
 * Masrvi, bank transfer) — none of which Duffel can process directly — so
 * the agency settles with Duffel separately (balance top-up) before
 * `paymentRequiredBy`, while we track the customer's payment status in our
 * own database. Offers with `requiresInstantPayment: true` cannot be held
 * this way; that path (instant card payment via Duffel Payments/Components)
 * isn't implemented yet.
 */
export async function createHoldOrder(params: {
  offerId: string;
  passengers: DuffelPassengerInput[];
}): Promise<{ orderId: string; bookingReference: string; totalAmount: number; totalCurrency: string }> {
  const order = await duffelRequest<RawOrder>('/air/orders', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'hold',
        selected_offers: [params.offerId],
        passengers: params.passengers.map((p) => ({
          id: p.offerPassengerId,
          title: p.title,
          gender: p.gender,
          given_name: p.givenName,
          family_name: p.familyName,
          born_on: p.bornOn,
          email: p.email,
          phone_number: p.phoneNumber
        }))
      }
    })
  });

  return {
    orderId: order.id,
    bookingReference: order.booking_reference,
    totalAmount: Number(order.total_amount),
    totalCurrency: order.total_currency
  };
}
