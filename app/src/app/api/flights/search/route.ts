import { NextRequest, NextResponse } from 'next/server';
import { performFlightSearch } from '@/lib/flightSearch';
import { DuffelNotConfiguredError, DuffelApiError } from '@/lib/duffel';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const origin = params.get('origin');
  const destination = params.get('destination');
  const departureDate = params.get('departureDate');

  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      { error: 'missing_params', message: 'origin, destination and departureDate are required' },
      { status: 400 }
    );
  }

  try {
    const { offerRequestId, results } = await performFlightSearch({
      origin,
      destination,
      departureDate,
      returnDate: params.get('returnDate') ?? undefined,
      adults: Number(params.get('adults') ?? '1'),
      cabinClass: (params.get('cabinClass') as 'economy' | 'premium_economy' | 'business' | 'first') ?? 'economy'
    });

    return NextResponse.json({ offerRequestId, results });
  } catch (error) {
    if (error instanceof DuffelNotConfiguredError) {
      return NextResponse.json(
        { error: 'not_configured', message: 'Set DUFFEL_API_KEY to enable live flight search.' },
        { status: 501 }
      );
    }
    if (error instanceof DuffelApiError) {
      return NextResponse.json({ error: 'duffel_error', message: error.message }, { status: 502 });
    }
    return NextResponse.json(
      { error: 'network_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 }
    );
  }
}
