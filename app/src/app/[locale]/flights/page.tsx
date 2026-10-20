import { getTranslations } from 'next-intl/server';
import { performFlightSearch, dateStripPrices } from '@/lib/flightSearch';
import { DuffelNotConfiguredError, DuffelApiError } from '@/lib/duffel';
import FlightResultsList from '@/components/flights/FlightResultsList';
import FlightSearchSummary from '@/components/search/FlightSearchSummary';
import FlightDateStrip from '@/components/search/FlightDateStrip';
import type { CabinClass } from '@/lib/searchPaths';
import type { SearchHubFlightState } from '@/lib/searchHubParams';

export default async function FlightsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const t = await getTranslations('Flights');

  const trip: 'rt' | 'ow' | 'mc' =
    params.trip === 'ow' || params.trip === 'mc' ? params.trip : params.returnDate ? 'rt' : 'ow';
  const cabinClass = (params.cabinClass as CabinClass) ?? 'economy';
  const adults = Number(params.adults ?? '1');

  const hubState: SearchHubFlightState = {
    trip,
    origin: params.origin ?? 'NKC',
    destination: params.destination ?? 'JED',
    origin2: params.origin2,
    destination2: params.destination2,
    departureDate: params.departureDate ?? '2027-03-12',
    returnDate: params.returnDate,
    departureDate2: params.departureDate2,
    adults,
    cabinClass,
    bagsIndex: Number(params.bags ?? '1'),
    directOnly: params.stops === 'direct',
    flexible: params.flexible === '1',
    nearby: params.nearby === '1',
    preferredAirline: params.airline ?? ''
  };

  const query = {
    origin: hubState.origin,
    destination: hubState.destination,
    departureDate: hubState.departureDate,
    returnDate: trip === 'rt' ? hubState.returnDate : undefined,
    trip,
    origin2: hubState.origin2,
    destination2: hubState.destination2,
    departureDate2: hubState.departureDate2,
    adults,
    cabinClass,
    flexible: hubState.flexible,
    nearby: hubState.nearby,
    preferredAirline: hubState.preferredAirline
  };

  let results: Awaited<ReturnType<typeof performFlightSearch>>['results'] = [];
  let datePrices: Record<string, number | null> | undefined;
  let errorMessage: string | null = null;

  try {
    const search = await performFlightSearch(query);
    results = search.results;
    datePrices = search.datePrices ?? dateStripPrices(hubState.departureDate, results);
  } catch (error) {
    if (error instanceof DuffelNotConfiguredError) {
      errorMessage = t('errors.notConfigured');
    } else if (error instanceof DuffelApiError) {
      errorMessage = error.message;
    } else {
      errorMessage = t('errors.generic');
    }
    datePrices = dateStripPrices(hubState.departureDate, []);
  }

  const initialStops =
    params.stops === 'direct' ? ('direct' as const) : params.stops === 'oneMax' ? ('oneMax' as const) : ('all' as const);

  const stripBase = {
    origin: hubState.origin,
    destination: hubState.destination,
    returnDate: trip === 'rt' ? hubState.returnDate : undefined,
    trip,
    origin2: hubState.origin2,
    destination2: hubState.destination2,
    departureDate2: hubState.departureDate2,
    adults,
    cabinClass,
    bagsIndex: hubState.bagsIndex,
    directOnly: hubState.directOnly,
    flexible: hubState.flexible,
    nearby: hubState.nearby,
    preferredAirline: hubState.preferredAirline
  };

  return (
    <main className="mx-auto max-w-[1300px] px-[28px] pb-14">
      <FlightSearchSummary query={hubState} />

      {datePrices && (
        <FlightDateStrip
          departureDate={hubState.departureDate}
          selectedDate={hubState.departureDate}
          prices={datePrices}
          searchBase={stripBase}
        />
      )}

      {errorMessage && (
        <div className="border-2 border-[var(--color-clay)] bg-[var(--color-clay-tint)] p-5 text-[14px] text-[var(--color-clay)]">
          {errorMessage}
        </div>
      )}

      {!errorMessage && results.length === 0 && (
        <div className="border-2 border-[var(--color-divider)] p-5 text-[14px] text-[rgba(15,17,21,0.6)]">
          {t('empty')}
        </div>
      )}

      {!errorMessage && results.length > 0 && (
        <FlightResultsList
          results={results}
          initialStops={initialStops}
          initialMaxPriceMru={params.maxPrice ? Number(params.maxPrice) : undefined}
          searchQuery={{ cabinClass, origin: hubState.origin, destination: hubState.destination }}
        />
      )}
    </main>
  );
}
