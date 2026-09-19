'use client';

import { useTranslations } from 'next-intl';
import type { StopsFilter } from './FlightResultsList';

export default function FlightFilters({
  airlines,
  stops,
  onStopsChange,
  selectedAirlines,
  onToggleAirline,
  onClear
}: {
  airlines: { name: string; priceMru: number }[];
  stops: StopsFilter;
  onStopsChange: (stops: StopsFilter) => void;
  selectedAirlines: Set<string>;
  onToggleAirline: (name: string, checked: boolean) => void;
  onClear: () => void;
}) {
  const t = useTranslations('Flights.filters');

  return (
    <aside className="sticky top-[90px]">
      <div className="mb-3.5 flex items-baseline justify-between border-b-2 border-[var(--color-divider)] pb-2">
        <h3 className="text-[15px]">{t('title')}</h3>
        <button
          onClick={onClear}
          className="uline cursor-pointer border-0 bg-transparent p-0 text-[12px] text-[var(--color-sky)]"
        >
          {t('clear')}
        </button>
      </div>

      <div className="mb-2 text-[11px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
        {t('stopsTitle')}
      </div>
      {(['direct', 'oneMax', 'all'] as const).map((key) => (
        <label key={key} className="radio mb-1.75 flex">
          <input type="radio" name="stops" checked={stops === key} onChange={() => onStopsChange(key)} />
          <span className="dot" />
          {t(key === 'direct' ? 'stopsDirect' : key === 'oneMax' ? 'stopsOneMax' : 'stopsAll')}
        </label>
      ))}

      {airlines.length > 0 && (
        <>
          <div className="mb-2 mt-4.5 text-[11px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
            {t('airlinesTitle')}
          </div>
          {airlines.map((airline) => (
            <label key={airline.name} className="mb-1.75 flex cursor-pointer justify-between text-[13px]">
              <span>
                <input
                  type="checkbox"
                  checked={selectedAirlines.has(airline.name)}
                  onChange={(e) => onToggleAirline(airline.name, e.target.checked)}
                  className="me-2 accent-[var(--color-accent)]"
                />
                {airline.name}
              </span>
              <span className="text-[rgba(15,17,21,0.5)]">{airline.priceMru.toLocaleString('fr-FR')}</span>
            </label>
          ))}
        </>
      )}
    </aside>
  );
}
