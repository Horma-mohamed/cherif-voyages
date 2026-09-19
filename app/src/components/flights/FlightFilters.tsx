'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

const airlines = [
  { name: 'Mauritania Airlines', price: '32 000', defaultChecked: true },
  { name: 'Royal Air Maroc', price: '34 500', defaultChecked: true },
  { name: 'Turkish Airlines', price: '38 900', defaultChecked: true },
  { name: 'Tunisair', price: '41 200', defaultChecked: false }
];

export default function FlightFilters() {
  const t = useTranslations('Flights.filters');
  const [stops, setStops] = useState<'direct' | 'oneMax' | 'all'>('direct');

  return (
    <aside className="sticky top-[90px]">
      <div className="mb-3.5 flex items-baseline justify-between border-b-2 border-[var(--color-divider)] pb-2">
        <h3 className="text-[15px]">{t('title')}</h3>
        <button className="uline cursor-pointer border-0 bg-transparent p-0 text-[12px] text-[var(--color-sky)]">
          {t('clear')}
        </button>
      </div>

      <div className="mb-2 text-[11px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
        {t('stopsTitle')}
      </div>
      {(['direct', 'oneMax', 'all'] as const).map((key) => (
        <label key={key} className="radio mb-1.75 flex">
          <input
            type="radio"
            name="stops"
            checked={stops === key}
            onChange={() => setStops(key)}
          />
          <span className="dot" />
          {t(key === 'direct' ? 'stopsDirect' : key === 'oneMax' ? 'stopsOneMax' : 'stopsAll')}
        </label>
      ))}

      <div className="mb-2 mt-4.5 text-[11px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
        {t('priceTitle')}
      </div>
      <input className="input mb-1 bg-white p-0" type="range" min={9000} max={60000} defaultValue={60000} />
      <div className="mb-4.5 flex justify-between text-[12px] text-[rgba(15,17,21,0.55)]">
        <span>{t('priceMin')}</span>
        <span>{t('priceMax')}</span>
      </div>

      <div className="mb-2 text-[11px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
        {t('airlinesTitle')}
      </div>
      {airlines.map((airline) => (
        <label key={airline.name} className="mb-1.75 flex cursor-pointer justify-between text-[13px]">
          <span>
            <input
              type="checkbox"
              defaultChecked={airline.defaultChecked}
              className="me-2 accent-[var(--color-accent)]"
            />
            {airline.name}
          </span>
          <span className="text-[rgba(15,17,21,0.5)]">{airline.price}</span>
        </label>
      ))}

      <div className="mb-2 mt-4.5 text-[11px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
        {t('baggageTitle')}
      </div>
      <label className="mb-1.75 flex cursor-pointer text-[13px]">
        <input type="checkbox" className="me-2 accent-[var(--color-accent)]" />
        {t('baggage23')}
      </label>
      <label className="flex cursor-pointer text-[13px]">
        <input type="checkbox" className="me-2 accent-[var(--color-accent)]" />
        {t('zamzam')}
      </label>
    </aside>
  );
}
