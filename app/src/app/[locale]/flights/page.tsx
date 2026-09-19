import { getTranslations } from 'next-intl/server';
import { performFlightSearch } from '@/lib/flightSearch';
import { DuffelNotConfiguredError, DuffelApiError } from '@/lib/duffel';
import { cityFor } from '@/lib/airports';
import FlightResultsList from '@/components/flights/FlightResultsList';

export default async function FlightsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const t = await getTranslations('Flights');
  const tc = await getTranslations('Common');

  const query = {
    origin: params.origin ?? 'NKC',
    destination: params.destination ?? 'JED',
    departureDate: params.departureDate ?? '2027-03-12',
    returnDate: params.returnDate ?? '2027-03-26',
    adults: Number(params.adults ?? '1'),
    cabinClass: (params.cabinClass as 'economy' | 'premium_economy' | 'business' | 'first') ?? 'economy'
  };

  let results: Awaited<ReturnType<typeof performFlightSearch>>['results'] = [];
  let errorMessage: string | null = null;

  try {
    const search = await performFlightSearch(query);
    results = search.results;
  } catch (error) {
    if (error instanceof DuffelNotConfiguredError) {
      errorMessage = t('errors.notConfigured');
    } else if (error instanceof DuffelApiError) {
      errorMessage = error.message;
    } else {
      errorMessage = t('errors.generic');
    }
  }

  return (
    <main className="mx-auto max-w-[1300px] px-[28px] pb-14">
      <div className="my-5 flex flex-wrap border-2 border-[var(--color-accent)]">
        <div className="flex-[1_1_180px] border-e border-[var(--color-divider)] p-3">
          <div className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">{query.origin}</div>
          <div className="text-[14px] font-semibold">{cityFor(query.origin)}</div>
        </div>
        <div className="flex-[1_1_180px] border-e border-[var(--color-divider)] p-3">
          <div className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">{query.destination}</div>
          <div className="text-[14px] font-semibold">{cityFor(query.destination)}</div>
        </div>
        <div className="flex-[1_1_200px] border-e border-[var(--color-divider)] p-3">
          <div className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
            {t('summary.datesLabel')}
          </div>
          <div className="text-[14px] font-semibold">
            {query.departureDate} — {query.returnDate}
          </div>
        </div>
        <div className="flex-[1_1_180px] border-e border-[var(--color-divider)] p-3">
          <div className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
            {t('summary.travelersLabel')}
          </div>
          <div className="text-[14px] font-semibold">
            {query.adults} · {query.cabinClass}
          </div>
        </div>
        <button className="min-h-12 flex-none cursor-pointer border-0 bg-[var(--color-accent)] px-6.5 font-sans text-[14px] font-extrabold text-white">
          {tc('modify')}
        </button>
      </div>

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
        <FlightResultsList results={results} searchQuery={{ cabinClass: query.cabinClass }} />
      )}
    </main>
  );
}
