'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { FlightIcon, HotelIcon, OmraIcon, HajjIcon, CarIcon, VisaIcon } from '@/components/Icons';

type Mode = 'flights' | 'hotels' | 'omra' | 'hajj' | 'cars' | 'visa';
type Trip = 'rt' | 'ow' | 'mc';

// Matches the fixed NKC → JED / 12–26 mars search shown above — the fields
// aren't freely editable yet, so this stays in sync with what's displayed.
const FLIGHT_SEARCH_PATH =
  '/flights?origin=NKC&destination=JED&departureDate=2027-03-12&returnDate=2027-03-26&adults=1&cabinClass=economy';

const modeTabs: { key: Mode; Icon: () => React.JSX.Element }[] = [
  { key: 'flights', Icon: FlightIcon },
  { key: 'hotels', Icon: HotelIcon },
  { key: 'omra', Icon: OmraIcon },
  { key: 'hajj', Icon: HajjIcon },
  { key: 'cars', Icon: CarIcon },
  { key: 'visa', Icon: VisaIcon }
];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-[1_1_150px] border-e border-[var(--color-divider)] px-3 py-2 last:border-e-0">
      <div className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">{label}</div>
      <div className="text-[15px] font-semibold">{value}</div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="tag tag-neutral">{children}</span>;
}

export default function SearchHub() {
  const t = useTranslations('Home');
  const tc = useTranslations('Common');
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('flights');
  const [trip, setTrip] = useState<Trip>('rt');

  const isPilgrim = mode === 'omra' || mode === 'hajj';
  const isSimple = mode === 'cars' || mode === 'visa';

  return (
    <div>
      <div className="flex w-fit max-w-full flex-wrap border-2 border-b-0 border-[var(--color-divider)] bg-white">
        {modeTabs.map(({ key, Icon }, i) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            aria-pressed={mode === key}
            className={`seg-btn hoverable flex cursor-pointer items-center gap-2 border-0 bg-white px-[18px] py-3 font-sans text-[13px] font-semibold text-[var(--color-ink)] ${
              i < modeTabs.length - 1 ? 'border-e border-[var(--color-divider)]' : ''
            }`}
          >
            <Icon />
            {t(`modes.${key}`)}
          </button>
        ))}
      </div>

      <div className="border-2 border-[var(--color-divider)] bg-white px-4 pb-4 pt-3.5">
        {mode === 'flights' && (
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2.5">
              <div className="flex border border-[var(--color-divider)]">
                {(['rt', 'ow', 'mc'] as Trip[]).map((key, i) => (
                  <button
                    key={key}
                    onClick={() => setTrip(key)}
                    aria-pressed={trip === key}
                    className={`seg-btn cursor-pointer border-0 bg-transparent px-3.5 py-[7px] font-sans text-[13px] text-[var(--color-ink)] ${
                      i > 0 ? 'border-s border-[var(--color-divider)]' : ''
                    }`}
                  >
                    {t(
                      key === 'rt'
                        ? 'flightSearch.tripRoundTrip'
                        : key === 'ow'
                          ? 'flightSearch.tripOneWay'
                          : 'flightSearch.tripMulti'
                    )}
                  </button>
                ))}
              </div>
              <select className="input w-auto bg-white">
                {t.raw('flightSearch.travelerClass').map((opt: string) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
              <select className="input w-auto bg-white">
                {t.raw('flightSearch.bags').map((opt: string) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap border-2 border-[var(--color-accent)]">
              <div className="relative min-w-0 flex-[1_1_150px] border-e border-[var(--color-divider)] px-3 py-2">
                <div className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
                  {t('flightSearch.from')}
                </div>
                <div className="flex items-center gap-2 text-[15px] font-semibold">
                  {t('flightSearch.fromCity')}
                  <span className="text-[11px] font-normal text-[rgba(15,17,21,0.5)]">×</span>
                </div>
              </div>
              <button className="w-10 cursor-pointer border-0 border-e border-[var(--color-divider)] bg-white text-[15px] text-[var(--color-accent)]">
                ⇄
              </button>
              <Field label={t('flightSearch.to')} value={t('flightSearch.toCity')} />
              <Field label={t('flightSearch.dates')} value={t('flightSearch.datesValue')} />
              <button
                onClick={() => router.push(FLIGHT_SEARCH_PATH)}
                className="min-h-[52px] flex-none cursor-pointer border-0 bg-[var(--color-accent)] px-6 font-sans text-[15px] font-extrabold text-white"
              >
                {tc('search')}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Chip>{t('flightSearch.chips.direct')}</Chip>
              <Chip>{t('flightSearch.chips.flexible')}</Chip>
              <Chip>{t('flightSearch.chips.nearby')}</Chip>
              <Chip>{t('flightSearch.chips.preferred')}</Chip>
              <button
                onClick={() => router.push(FLIGHT_SEARCH_PATH)}
                className="uline ms-1 cursor-pointer border-0 bg-transparent p-0 text-[13px] text-[var(--color-gold)]"
              >
                {t('flightSearch.cheapestMonth')}
              </button>
            </div>
          </div>
        )}

        {mode === 'hotels' && (
          <div>
            <div className="flex flex-wrap border-2 border-[var(--color-accent)]">
              <div className="min-w-0 flex-[1_1_280px] border-e border-[var(--color-divider)] px-3 py-2">
                <div className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
                  {t('hotelSearch.destination')}
                </div>
                <div className="text-[15px] font-semibold">{t('hotelSearch.destinationValue')}</div>
              </div>
              <Field label={t('hotelSearch.dates')} value={t('hotelSearch.datesValue')} />
              <Field label={t('hotelSearch.travelers')} value={t('hotelSearch.travelersValue')} />
              <button
                onClick={() => router.push('/hotels')}
                className="min-h-[52px] flex-none cursor-pointer border-0 bg-[var(--color-accent)] px-6 font-sans text-[15px] font-extrabold text-white"
              >
                {tc('search')}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip>{t('hotelSearch.chips.nearHaram')}</Chip>
              <Chip>{t('hotelSearch.chips.freeCancel')}</Chip>
              <Chip>{t('hotelSearch.chips.breakfast')}</Chip>
            </div>
          </div>
        )}

        {isPilgrim && (
          <div>
            <div className="flex flex-wrap border-2 border-[var(--color-accent)]">
              <Field label={t('pilgrimSearch.departureCity')} value={t('pilgrimSearch.departureCityValue')} />
              <Field label={t('pilgrimSearch.period')} value={t('pilgrimSearch.periodValue')} />
              <Field label={t('pilgrimSearch.duration')} value={t('pilgrimSearch.durationValue')} />
              <Field label={t('pilgrimSearch.pilgrims')} value={t('pilgrimSearch.pilgrimsValue')} />
              <button
                onClick={() => router.push('/packages/omra-ramadan')}
                className="min-h-[52px] flex-none cursor-pointer border-0 bg-[var(--color-accent)] px-6 font-sans text-[15px] font-extrabold text-white"
              >
                {t('pilgrimSearch.seePackages')}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip>{t('pilgrimSearch.chips.flightHotelVisa')}</Chip>
              <Chip>{t('pilgrimSearch.chips.guide')}</Chip>
              <Chip>{t('pilgrimSearch.chips.installments')}</Chip>
            </div>
          </div>
        )}

        {isSimple && (
          <div>
            <div className="flex flex-wrap border-2 border-[var(--color-accent)]">
              <div className="min-w-0 flex-[1_1_260px] border-e border-[var(--color-divider)] px-3 py-2">
                <div className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
                  {t('simpleSearch.place')}
                </div>
                <div className="text-[15px] font-semibold">{t('simpleSearch.placeValue')}</div>
              </div>
              <Field label={t('simpleSearch.dates')} value={t('simpleSearch.datesValue')} />
              <button className="min-h-[52px] flex-none cursor-pointer border-0 bg-[var(--color-accent)] px-6 font-sans text-[15px] font-extrabold text-white">
                {tc('search')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
