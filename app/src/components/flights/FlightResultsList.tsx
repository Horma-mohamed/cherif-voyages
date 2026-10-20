'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import SortTabs, { type SortKey } from './SortTabs';
import FlightFilters from './FlightFilters';
import FlightResultRow from './FlightResultRow';
import type { FlightSearchResult } from '@/lib/flightSearch';

export type StopsFilter = 'direct' | 'oneMax' | 'all';

function minutesLabel(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} h ${String(minutes).padStart(2, '0')}`;
}

function stopCount(result: FlightSearchResult) {
  return Math.max(...result.slices.map((slice) => slice.segments.length - 1));
}

export default function FlightResultsList({
  results,
  searchQuery,
  initialStops = 'all',
  initialMaxPriceMru
}: {
  results: FlightSearchResult[];
  initialStops?: StopsFilter;
  initialMaxPriceMru?: number;
  searchQuery: {
    cabinClass: string;
    origin: string;
    destination: string;
  };
}) {
  const t = useTranslations('Flights');
  const tc = useTranslations('Common');
  const router = useRouter();
  const [sort, setSort] = useState<SortKey>('best');
  const [stops, setStops] = useState<StopsFilter>(initialStops);
  const priceCeiling = useMemo(
    () => Math.max(60000, ...results.map((r) => r.priceMru), initialMaxPriceMru ?? 0),
    [results, initialMaxPriceMru]
  );
  const [maxPriceMru, setMaxPriceMru] = useState(initialMaxPriceMru ?? priceCeiling);

  const allAirlineNames = useMemo(() => Array.from(new Set(results.map((r) => r.ownerAirline))), [results]);
  const [selectedAirlines, setSelectedAirlines] = useState<Set<string>>(() => new Set(allAirlineNames));

  const filtered = useMemo(() => {
    return results.filter((r) => {
      if (stops === 'direct' && stopCount(r) > 0) return false;
      if (stops === 'oneMax' && stopCount(r) > 1) return false;
      if (!selectedAirlines.has(r.ownerAirline)) return false;
      if (r.priceMru > maxPriceMru) return false;
      return true;
    });
  }, [results, stops, selectedAirlines, maxPriceMru]);

  const cheapestId = useMemo(
    () => filtered.reduce((min, r) => (r.priceEur < min.priceEur ? r : min), filtered[0])?.id,
    [filtered]
  );
  const fastestId = useMemo(
    () => filtered.reduce((min, r) => (r.totalDurationMinutes < min.totalDurationMinutes ? r : min), filtered[0])?.id,
    [filtered]
  );

  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (sort === 'cheap') copy.sort((a, b) => a.priceEur - b.priceEur);
    if (sort === 'fast') copy.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);
    return copy;
  }, [filtered, sort]);

  const airlines = useMemo(() => {
    const byAirline = new Map<string, number>();
    for (const r of results) {
      const current = byAirline.get(r.ownerAirline);
      if (current === undefined || r.priceMru < current) byAirline.set(r.ownerAirline, r.priceMru);
    }
    return Array.from(byAirline.entries()).map(([name, priceMru]) => ({ name, priceMru }));
  }, [results]);

  const cheapest = filtered.find((r) => r.id === cheapestId);
  const fastest = filtered.find((r) => r.id === fastestId);

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
        origin={searchQuery.origin}
        destination={searchQuery.destination}
        cheapestPriceMru={cheapest?.priceMru ?? null}
      />
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,230px)_minmax(0,1fr)]">
        <FlightFilters
          airlines={airlines}
          stops={stops}
          onStopsChange={setStops}
          selectedAirlines={selectedAirlines}
          onToggleAirline={(name, checked) =>
            setSelectedAirlines((prev) => {
              const next = new Set(prev);
              if (checked) next.add(name);
              else next.delete(name);
              return next;
            })
          }
          maxPriceMru={maxPriceMru}
          priceCeiling={priceCeiling}
          onMaxPriceChange={setMaxPriceMru}
          onClear={() => {
            setStops('all');
            setSelectedAirlines(new Set(allAirlineNames));
            setMaxPriceMru(priceCeiling);
          }}
        />
        <div className="border-2 border-[var(--color-divider)]">
          {sorted.length === 0 ? (
            <p className="p-5 text-[14px] text-[rgba(15,17,21,0.6)]">{t('empty')}</p>
          ) : (
            sorted.map((result, i) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
