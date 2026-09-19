'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import SortTabs, { type SortKey } from './SortTabs';
import FlightFilters from './FlightFilters';
import FlightResultRow from './FlightResultRow';
import type { FlightSearchResult } from '@/lib/flightSearch';

function minutesLabel(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} h ${String(minutes).padStart(2, '0')}`;
}

export default function FlightResultsList({
  results,
  searchQuery
}: {
  results: FlightSearchResult[];
  searchQuery: {
    cabinClass: string;
  };
}) {
  const t = useTranslations('Flights');
  const tc = useTranslations('Common');
  const router = useRouter();
  const [sort, setSort] = useState<SortKey>('best');

  const cheapestId = useMemo(
    () => results.reduce((min, r) => (r.priceEur < min.priceEur ? r : min), results[0])?.id,
    [results]
  );
  const fastestId = useMemo(
    () =>
      results.reduce((min, r) => (r.totalDurationMinutes < min.totalDurationMinutes ? r : min), results[0])?.id,
    [results]
  );

  const sorted = useMemo(() => {
    const copy = [...results];
    if (sort === 'cheap') copy.sort((a, b) => a.priceEur - b.priceEur);
    if (sort === 'fast') copy.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);
    return copy;
  }, [results, sort]);

  const airlines = useMemo(() => {
    const byAirline = new Map<string, number>();
    for (const r of results) {
      const current = byAirline.get(r.ownerAirline);
      if (current === undefined || r.priceMru < current) byAirline.set(r.ownerAirline, r.priceMru);
    }
    return Array.from(byAirline.entries()).map(([name, priceMru]) => ({ name, priceMru }));
  }, [results]);

  const cheapest = results.find((r) => r.id === cheapestId);
  const fastest = results.find((r) => r.id === fastestId);

  function handleSelect(result: FlightSearchResult) {
    const slice = result.slices[0];
    const returnSlice = result.slices[1];
    const params = new URLSearchParams({
      type: 'flight',
      offerId: result.id,
      passengerId: result.passengerIds[0] ?? '',
      origin: slice.origin,
      destination: slice.destination,
      departureDate: slice.segments[0].departingAt.slice(0, 10),
      cabinClass: searchQuery.cabinClass,
      priceMru: String(result.priceMru),
      priceEur: String(result.priceEur)
    });
    if (returnSlice) {
      params.set('returnDate', returnSlice.segments[0].departingAt.slice(0, 10));
    }
    router.push(`/booking?${params.toString()}`);
  }

  return (
    <div>
      <SortTabs
        sort={sort}
        onChange={setSort}
        cheapestSub={cheapest ? `${cheapest.priceMru.toLocaleString('fr-FR')} · ${minutesLabel(cheapest.totalDurationMinutes)}` : ''}
        fastestSub={fastest ? `${fastest.priceMru.toLocaleString('fr-FR')} · ${minutesLabel(fastest.totalDurationMinutes)}` : ''}
      />
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,230px)_minmax(0,1fr)]">
        <FlightFilters airlines={airlines} />
        <div className="border-2 border-[var(--color-divider)]">
          {sorted.map((result, i) => (
            <FlightResultRow
              key={result.id}
              result={result}
              isLast={i === sorted.length - 1}
              directLabel={t('direct')}
              stopLabel={t('stop')}
              cheapestTag={result.id === cheapestId ? t('cheapestTag') : null}
              roundTrip={tc('roundTrip')}
              select={tc('select')}
              onSelect={() => handleSelect(result)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
