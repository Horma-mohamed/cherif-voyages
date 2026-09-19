import { getTranslations } from 'next-intl/server';
import FlightFilters from '@/components/flights/FlightFilters';
import SortTabs from '@/components/flights/SortTabs';
import FlightResultRow, { type FlightResult } from '@/components/flights/FlightResultRow';

export default async function FlightsPage() {
  const t = await getTranslations('Flights');
  const tc = await getTranslations('Common');
  const priceStrip = t.raw('priceStrip') as { date: string; price: string }[];
  const results = t.raw('results') as FlightResult[];
  const labels = t.raw('labels') as Record<string, string>;

  return (
    <main className="mx-auto max-w-[1300px] px-[28px] pb-14">
      <div className="my-5 flex flex-wrap border-2 border-[var(--color-accent)]">
        <div className="flex-[1_1_180px] border-e border-[var(--color-divider)] p-3">
          <div className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">NKC</div>
          <div className="text-[14px] font-semibold">{t('summary.from')}</div>
        </div>
        <div className="flex-[1_1_180px] border-e border-[var(--color-divider)] p-3">
          <div className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">JED</div>
          <div className="text-[14px] font-semibold">{t('summary.to')}</div>
        </div>
        <div className="flex-[1_1_200px] border-e border-[var(--color-divider)] p-3">
          <div className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
            {t('summary.datesLabel')}
          </div>
          <div className="text-[14px] font-semibold">{t('summary.dates')}</div>
        </div>
        <div className="flex-[1_1_180px] border-e border-[var(--color-divider)] p-3">
          <div className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
            {t('summary.travelersLabel')}
          </div>
          <div className="text-[14px] font-semibold">{t('summary.travelers')}</div>
        </div>
        <button className="min-h-12 flex-none cursor-pointer border-0 bg-[var(--color-accent)] px-6.5 font-sans text-[14px] font-extrabold text-white">
          {tc('modify')}
        </button>
      </div>

      <div className="mb-5 flex gap-0.5 overflow-x-auto border border-[var(--color-divider)]">
        {priceStrip.map((day, i) => {
          const isSelected = i === 2;
          const isCheapest = i === 4;
          return (
            <div
              key={i}
              className={`min-w-[92px] flex-1 px-3 py-2.5 ${i > 0 ? 'border-s border-[var(--color-divider)]' : ''} ${
                isSelected ? 'bg-[var(--color-accent)] text-white' : isCheapest ? 'bg-[var(--color-gold-tint)] shadow-[inset_0_-3px_0_var(--color-gold)]' : 'bg-white'
              }`}
            >
              <div className={`text-[11px] ${isSelected ? 'text-white/70' : 'text-[rgba(15,17,21,0.55)]'}`}>
                {day.date}
              </div>
              <div
                className={`text-[13px] ${isSelected ? 'font-bold' : 'font-semibold'} ${
                  isCheapest ? 'text-[var(--color-gold)] font-bold' : ''
                }`}
              >
                {day.price}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,230px)_minmax(0,1fr)]">
        <FlightFilters />
        <div>
          <SortTabs />
          <div className="border-2 border-[var(--color-divider)]">
            {results.map((result, i) => (
              <FlightResultRow
                key={result.id}
                result={result}
                isLast={i === results.length - 1}
                labels={labels}
                directLabel={t('direct')}
                stopLabel={t('stop')}
                cheapestTag={t('cheapestTag')}
                roundTrip={tc('roundTrip')}
                select={tc('select')}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
