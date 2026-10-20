'use client';

import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { addDaysToIsoDate } from '@/lib/flightSearch';
import { buildFlightsSearchPath, type CabinClass } from '@/lib/searchPaths';

export default function FlightDateStrip({
  departureDate,
  selectedDate,
  prices,
  searchBase
}: {
  departureDate: string;
  selectedDate: string;
  prices: Record<string, number | null>;
  searchBase: {
    origin: string;
    destination: string;
    returnDate?: string;
    trip?: 'rt' | 'ow' | 'mc';
    origin2?: string;
    destination2?: string;
    departureDate2?: string;
    adults: number;
    cabinClass: CabinClass;
    bagsIndex?: number;
    directOnly?: boolean;
    flexible?: boolean;
    nearby?: boolean;
    preferredAirline?: string;
  };
}) {
  const locale = useLocale();
  const router = useRouter();

  const days = Array.from({ length: 7 }, (_, i) => addDaysToIsoDate(departureDate, i - 3));
  const minPrice = days.reduce<number | null>((min, d) => {
    const p = prices[d];
    if (p == null) return min;
    return min == null || p < min ? p : min;
  }, null);

  function fmtDay(iso: string) {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'fr-FR', { day: 'numeric', month: 'short' }).format(
      new Date(`${iso}T12:00:00Z`)
    );
  }

  function shiftReturn(newDeparture: string) {
    if (!searchBase.returnDate || searchBase.trip !== 'rt') return undefined;
    const outbound = new Date(`${departureDate}T12:00:00Z`).getTime();
    const ret = new Date(`${searchBase.returnDate}T12:00:00Z`).getTime();
    const span = ret - outbound;
    return new Date(new Date(`${newDeparture}T12:00:00Z`).getTime() + span).toISOString().slice(0, 10);
  }

  return (
    <div className="mb-5 flex gap-0.5 overflow-x-auto border border-[var(--color-divider)]">
      {days.map((day) => {
        const price = prices[day];
        const isSelected = day === selectedDate;
        const isCheapest = minPrice != null && price != null && price === minPrice && days.filter((d) => prices[d] === minPrice).length >= 1;
        const highlightCheapest = isCheapest && !isSelected;

        return (
          <button
            key={day}
            type="button"
            onClick={() => {
              router.push(
                buildFlightsSearchPath({
                  ...searchBase,
                  departureDate: day,
                  returnDate: shiftReturn(day),
                  flexible: searchBase.flexible
                })
              );
            }}
            className={`min-w-[92px] flex-1 cursor-pointer border-0 px-3 py-2.5 text-start ${
              isSelected
                ? 'bg-[var(--color-accent)] text-white'
                : highlightCheapest
                  ? 'border-s border-[var(--color-divider)] bg-[var(--color-gold-tint)] shadow-[inset_0_-3px_0_var(--color-gold)]'
                  : 'border-s border-[var(--color-divider)] bg-white'
            }`}
          >
            <div className={`text-[11px] ${isSelected ? 'text-white/70' : 'text-[rgba(15,17,21,0.55)]'}`}>
              {fmtDay(day)}
            </div>
            <div
              className={`text-[13px] font-semibold ${
                highlightCheapest ? 'font-bold text-[var(--color-gold)]' : isSelected ? 'font-bold' : ''
              }`}
            >
              {price != null ? `${price.toLocaleString('fr-FR')}` : '—'}
              {highlightCheapest && price != null ? ' ↓' : ''}
            </div>
          </button>
        );
      })}
    </div>
  );
}
