import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { cityFor } from '@/lib/airports';
import { buildHomeFlightSearchQuery, type SearchHubFlightState } from '@/lib/searchHubParams';

const CABIN_LABELS: Record<string, string> = {
  economy: 'Économie',
  premium_economy: 'Premium',
  business: 'Affaires',
  first: 'Première'
};

export default async function FlightSearchSummary({
  query
}: {
  query: SearchHubFlightState & { departureDate: string };
}) {
  const tc = await getTranslations('Common');
  const modifyHref = buildHomeFlightSearchQuery(query);

  const dateLabel =
    query.trip === 'ow' || !query.returnDate
      ? query.departureDate
      : `${query.departureDate} — ${query.returnDate}`;

  const travelersLabel = `${query.adults} · ${CABIN_LABELS[query.cabinClass] ?? query.cabinClass}`;

  return (
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
        <div className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">Dates</div>
        <div className="text-[14px] font-semibold">{dateLabel}</div>
      </div>
      <div className="flex-[1_1_180px] border-e border-[var(--color-divider)] p-3">
        <div className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">Voyageurs</div>
        <div className="text-[14px] font-semibold">{travelersLabel}</div>
      </div>
      <Link
        href={modifyHref}
        className="flex min-h-12 flex-none cursor-pointer items-center border-0 bg-[var(--color-accent)] px-6.5 font-sans text-[14px] font-extrabold text-white no-underline"
      >
        {tc('modify')}
      </Link>
    </div>
  );
}
