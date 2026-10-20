'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { FlightIcon, HotelIcon, OmraIcon, HajjIcon, CarIcon, VisaIcon } from '@/components/Icons';
import { SEARCH_HUB_AIRPORTS, cityFor, isKnownAirport } from '@/lib/airports';
import {
  buildFlightsSearchPath,
  buildHotelsSearchPathWithFilters,
  buildPackagesSearchPath,
  buildServiceInquiryPath,
  normalizeIata,
  type CabinClass
} from '@/lib/searchPaths';
import { parseHomeSearchParams } from '@/lib/searchHubParams';

type Mode = 'flights' | 'hotels' | 'omra' | 'hajj' | 'cars' | 'visa';
type Trip = 'rt' | 'ow' | 'mc';

const TRAVELER_CLASS_OPTIONS: { adults: number; cabinClass: CabinClass }[] = [
  { adults: 1, cabinClass: 'economy' },
  { adults: 2, cabinClass: 'economy' },
  { adults: 1, cabinClass: 'business' }
];

const modeTabs: { key: Mode; Icon: () => React.JSX.Element }[] = [
  { key: 'flights', Icon: FlightIcon },
  { key: 'hotels', Icon: HotelIcon },
  { key: 'omra', Icon: OmraIcon },
  { key: 'hajj', Icon: HajjIcon },
  { key: 'cars', Icon: CarIcon },
  { key: 'visa', Icon: VisaIcon }
];

function SearchInput({
  label,
  value,
  onChange,
  type = 'text',
  listId,
  className = ''
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  listId?: string;
  className?: string;
}) {
  return (
    <div className={`min-w-0 flex-[1_1_150px] border-e border-[var(--color-divider)] px-3 py-2 last:border-e-0 ${className}`}>
      <label className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">{label}</label>
      <input
        type={type}
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-0 bg-transparent p-0 text-[15px] font-semibold outline-none"
      />
    </div>
  );
}

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`tag cursor-pointer border-0 ${active ? 'border border-[var(--color-accent)] bg-[var(--color-accent-100)] text-[var(--color-accent)]' : 'tag-neutral'}`}
    >
      {children}
    </button>
  );
}

export default function SearchHub({ initialParams = {} }: { initialParams?: Record<string, string | undefined> }) {
  const t = useTranslations('Home');
  const tc = useTranslations('Common');
  const router = useRouter();
  const airportListId = useId();
  const parsed = parseHomeSearchParams(initialParams);
  const flightInit = 'flight' in parsed ? parsed.flight : null;

  const [mode, setMode] = useState<Mode>((parsed.mode as Mode) ?? 'flights');
  const [trip, setTrip] = useState<Trip>(flightInit?.trip ?? 'rt');
  const [travelerClassIndex, setTravelerClassIndex] = useState(() => {
    if (!flightInit) return 0;
    const idx = TRAVELER_CLASS_OPTIONS.findIndex(
      (o) => o.adults === flightInit.adults && o.cabinClass === flightInit.cabinClass
    );
    return idx >= 0 ? idx : 0;
  });
  const [bagsIndex, setBagsIndex] = useState(flightInit?.bagsIndex ?? 1);
  const [flightError, setFlightError] = useState<string | null>(null);

  const [origin, setOrigin] = useState(flightInit?.origin ?? 'NKC');
  const [destination, setDestination] = useState(flightInit?.destination ?? 'JED');
  const [origin2, setOrigin2] = useState(flightInit?.origin2 ?? 'CMN');
  const [destination2, setDestination2] = useState(flightInit?.destination2 ?? 'CDG');
  const [departureDate, setDepartureDate] = useState(flightInit?.departureDate ?? '2027-03-12');
  const [returnDate, setReturnDate] = useState(flightInit?.returnDate ?? '2027-03-26');
  const [departureDate2, setDepartureDate2] = useState(flightInit?.departureDate2 ?? '2027-03-20');
  const [directOnly, setDirectOnly] = useState(flightInit?.directOnly ?? false);
  const [flexibleDates, setFlexibleDates] = useState(flightInit?.flexible ?? false);
  const [nearbyAirports, setNearbyAirports] = useState(flightInit?.nearby ?? false);
  const [preferredActive, setPreferredActive] = useState(flightInit?.preferredAirlineActive ?? false);
  const [preferredAirline, setPreferredAirline] = useState(flightInit?.preferredAirline ?? '');

  const [hotelDestination, setHotelDestination] = useState('Makkah, Arabie Saoudite');
  const [hotelCheckIn, setHotelCheckIn] = useState('2027-03-12');
  const [hotelCheckOut, setHotelCheckOut] = useState('2027-03-19');
  const [hotelAdults, setHotelAdults] = useState('2');
  const [hotelRooms, setHotelRooms] = useState('1');
  const [hotelNearHaram, setHotelNearHaram] = useState(false);
  const [hotelFreeCancel, setHotelFreeCancel] = useState(false);
  const [hotelBreakfast, setHotelBreakfast] = useState(false);

  const periodOptions = t.raw('pilgrimSearch.periodOptions') as string[];
  const durationOptions = t.raw('pilgrimSearch.durationOptions') as string[];
  const [pilgrimCity, setPilgrimCity] = useState('Nouakchott');
  const [pilgrimPeriod, setPilgrimPeriod] = useState(periodOptions[0] ?? '');
  const [pilgrimDuration, setPilgrimDuration] = useState(durationOptions[1] ?? durationOptions[0] ?? '');
  const [pilgrims, setPilgrims] = useState('2');

  const [servicePlace, setServicePlace] = useState('Nouakchott');
  const [serviceDateFrom, setServiceDateFrom] = useState('2027-03-12');
  const [serviceDateTo, setServiceDateTo] = useState('2027-03-19');

  const isPilgrim = mode === 'omra' || mode === 'hajj';
  const isSimple = mode === 'cars' || mode === 'visa';
  const travelerLabels = t.raw('flightSearch.travelerClass') as string[];

  function swapAirports() {
    setOrigin(destination);
    setDestination(origin);
  }

  function validateAirports(from: string, to: string) {
    if (from.length !== 3 || to.length !== 3) return t('flightSearch.errors.invalidAirport');
    if (!isKnownAirport(from) || !isKnownAirport(to)) return t('flightSearch.errors.invalidAirport');
    if (from === to) return t('flightSearch.errors.sameAirport');
    return null;
  }

  function searchFlights(opts?: { flexible?: boolean }) {
    setFlightError(null);
    const from = normalizeIata(origin);
    const to = normalizeIata(destination);
    const err = validateAirports(from, to);
    if (err) {
      setFlightError(err);
      return;
    }
    if (!departureDate) {
      setFlightError(t('flightSearch.errors.missingDates'));
      return;
    }
    if (trip === 'rt') {
      if (!returnDate) {
        setFlightError(t('flightSearch.errors.missingDates'));
        return;
      }
      if (returnDate < departureDate) {
        setFlightError(t('flightSearch.errors.returnBeforeDeparture'));
        return;
      }
    }
    if (trip === 'mc') {
      const from2 = normalizeIata(origin2);
      const to2 = normalizeIata(destination2);
      const err2 = validateAirports(from2, to2);
      if (err2 || !departureDate2) {
        setFlightError(err2 ?? t('flightSearch.errors.missingDates'));
        return;
      }
    }

    const { adults, cabinClass } = TRAVELER_CLASS_OPTIONS[travelerClassIndex] ?? TRAVELER_CLASS_OPTIONS[0];
    router.push(
      buildFlightsSearchPath({
        origin: from,
        destination: to,
        departureDate,
        returnDate: trip === 'rt' ? returnDate : undefined,
        trip,
        origin2: trip === 'mc' ? normalizeIata(origin2) : undefined,
        destination2: trip === 'mc' ? normalizeIata(destination2) : undefined,
        departureDate2: trip === 'mc' ? departureDate2 : undefined,
        adults,
        cabinClass,
        bagsIndex,
        directOnly,
        flexible: opts?.flexible ?? flexibleDates,
        nearby: nearbyAirports,
        preferredAirline: preferredActive ? preferredAirline : undefined
      })
    );
  }

  function searchHotels() {
    router.push(
      buildHotelsSearchPathWithFilters({
        destination: hotelDestination,
        checkIn: hotelCheckIn,
        checkOut: hotelCheckOut,
        adults: Number(hotelAdults) || 2,
        rooms: Number(hotelRooms) || 1,
        nearHaram: hotelNearHaram,
        freeCancel: hotelFreeCancel,
        breakfast: hotelBreakfast
      })
    );
  }

  function searchPackages() {
    router.push(
      buildPackagesSearchPath({
        kind: mode === 'hajj' ? 'hajj' : 'omra',
        departureCity: pilgrimCity,
        period: pilgrimPeriod,
        duration: pilgrimDuration,
        pilgrims: Number(pilgrims) || 1
      })
    );
  }

  function searchService() {
    router.push(
      buildServiceInquiryPath({
        service: mode === 'cars' ? 'cars' : 'visa',
        place: servicePlace,
        dateFrom: serviceDateFrom,
        dateTo: mode === 'cars' ? serviceDateTo : undefined
      })
    );
  }

  return (
    <div>
      <datalist id={airportListId}>
        {SEARCH_HUB_AIRPORTS.map((code) => (
          <option key={code} value={code}>
            {cityFor(code)}
          </option>
        ))}
      </datalist>

      <div className="flex w-fit max-w-full flex-wrap border-2 border-b-0 border-[var(--color-divider)] bg-white">
        {modeTabs.map(({ key, Icon }, i) => (
          <button
            key={key}
            type="button"
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
                    type="button"
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
              <select
                className="input w-auto bg-white"
                value={travelerClassIndex}
                onChange={(e) => setTravelerClassIndex(Number(e.target.value))}
              >
                {travelerLabels.map((opt, i) => (
                  <option key={opt} value={i}>
                    {opt}
                  </option>
                ))}
              </select>
              <select
                className="input w-auto bg-white"
                value={bagsIndex}
                onChange={(e) => setBagsIndex(Number(e.target.value))}
                aria-label={t('flightSearch.bags')[1]}
              >
                {(t.raw('flightSearch.bags') as string[]).map((opt, i) => (
                  <option key={opt} value={i}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap border-2 border-[var(--color-accent)]">
              <SearchInput
                label={t('flightSearch.from')}
                value={origin}
                onChange={setOrigin}
                listId={airportListId}
              />
              <button
                type="button"
                onClick={swapAirports}
                className="w-10 cursor-pointer border-0 border-e border-[var(--color-divider)] bg-white text-[15px] text-[var(--color-accent)]"
                aria-label={t('flightSearch.swap')}
              >
                ⇄
              </button>
              <SearchInput
                label={t('flightSearch.to')}
                value={destination}
                onChange={setDestination}
                listId={airportListId}
              />
              <SearchInput
                label={trip === 'ow' ? t('flightSearch.departure') : t('flightSearch.dates')}
                value={departureDate}
                onChange={setDepartureDate}
                type="date"
              />
              {trip === 'rt' && (
                <SearchInput label={t('flightSearch.return')} value={returnDate} onChange={setReturnDate} type="date" />
              )}
              <button
                type="button"
                onClick={() => searchFlights()}
                className="min-h-[52px] flex-none cursor-pointer border-0 bg-[var(--color-accent)] px-6 font-sans text-[15px] font-extrabold text-white"
              >
                {tc('search')}
              </button>
            </div>

            {trip === 'mc' && (
              <div className="mt-2 flex flex-wrap border-2 border-[var(--color-divider)]">
                <SearchInput label={t('flightSearch.from')} value={origin2} onChange={setOrigin2} listId={airportListId} />
                <SearchInput label={t('flightSearch.to')} value={destination2} onChange={setDestination2} listId={airportListId} />
                <SearchInput
                  label={t('flightSearch.departure')}
                  value={departureDate2}
                  onChange={setDepartureDate2}
                  type="date"
                />
              </div>
            )}

            {flightError && (
              <p className="mt-2 text-[13px] text-[var(--color-clay)]" role="alert">
                {flightError}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ToggleChip active={directOnly} onClick={() => setDirectOnly((v) => !v)}>
                {t('flightSearch.chips.direct')}
              </ToggleChip>
              <ToggleChip active={flexibleDates} onClick={() => setFlexibleDates((v) => !v)}>
                {t('flightSearch.chips.flexible')}
              </ToggleChip>
              <ToggleChip active={nearbyAirports} onClick={() => setNearbyAirports((v) => !v)}>
                {t('flightSearch.chips.nearby')}
              </ToggleChip>
              <ToggleChip active={preferredActive} onClick={() => setPreferredActive((v) => !v)}>
                {t('flightSearch.chips.preferred')}
              </ToggleChip>
              <button
                type="button"
                onClick={() => searchFlights({ flexible: true })}
                className="uline ms-1 cursor-pointer border-0 bg-transparent p-0 text-[13px] text-[var(--color-gold)]"
              >
                {t('flightSearch.cheapestMonth')}
              </button>
            </div>
            {preferredActive && (
              <div className="mt-2 max-w-md">
                <input
                  className="input w-full bg-white"
                  value={preferredAirline}
                  onChange={(e) => setPreferredAirline(e.target.value)}
                  placeholder={t('pilgrimSearch.preferredAirlinePh')}
                />
              </div>
            )}
          </div>
        )}

        {mode === 'hotels' && (
          <div>
            <div className="flex flex-wrap border-2 border-[var(--color-accent)]">
              <SearchInput
                label={t('hotelSearch.destination')}
                value={hotelDestination}
                onChange={setHotelDestination}
                className="flex-[1_1_280px]"
              />
              <SearchInput label={t('hotelSearch.checkIn')} value={hotelCheckIn} onChange={setHotelCheckIn} type="date" />
              <SearchInput label={t('hotelSearch.checkOut')} value={hotelCheckOut} onChange={setHotelCheckOut} type="date" />
              <SearchInput label={t('hotelSearch.adults')} value={hotelAdults} onChange={setHotelAdults} type="number" />
              <SearchInput label={t('hotelSearch.rooms')} value={hotelRooms} onChange={setHotelRooms} type="number" />
              <button
                type="button"
                onClick={searchHotels}
                className="min-h-[52px] flex-none cursor-pointer border-0 bg-[var(--color-accent)] px-6 font-sans text-[15px] font-extrabold text-white"
              >
                {tc('search')}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <ToggleChip active={hotelNearHaram} onClick={() => setHotelNearHaram((v) => !v)}>
                {t('hotelSearch.chips.nearHaram')}
              </ToggleChip>
              <ToggleChip active={hotelFreeCancel} onClick={() => setHotelFreeCancel((v) => !v)}>
                {t('hotelSearch.chips.freeCancel')}
              </ToggleChip>
              <ToggleChip active={hotelBreakfast} onClick={() => setHotelBreakfast((v) => !v)}>
                {t('hotelSearch.chips.breakfast')}
              </ToggleChip>
            </div>
          </div>
        )}

        {isPilgrim && (
          <div>
            <div className="flex flex-wrap border-2 border-[var(--color-accent)]">
              <SearchInput label={t('pilgrimSearch.departureCity')} value={pilgrimCity} onChange={setPilgrimCity} />
              <div className="min-w-0 flex-[1_1_150px] border-e border-[var(--color-divider)] px-3 py-2">
                <label className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
                  {t('pilgrimSearch.period')}
                </label>
                <select
                  className="w-full border-0 bg-transparent p-0 text-[15px] font-semibold outline-none"
                  value={pilgrimPeriod}
                  onChange={(e) => setPilgrimPeriod(e.target.value)}
                >
                  {periodOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0 flex-[1_1_150px] border-e border-[var(--color-divider)] px-3 py-2">
                <label className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
                  {t('pilgrimSearch.duration')}
                </label>
                <select
                  className="w-full border-0 bg-transparent p-0 text-[15px] font-semibold outline-none"
                  value={pilgrimDuration}
                  onChange={(e) => setPilgrimDuration(e.target.value)}
                >
                  {durationOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <SearchInput label={t('pilgrimSearch.pilgrims')} value={pilgrims} onChange={setPilgrims} type="number" />
              <button
                type="button"
                onClick={searchPackages}
                className="min-h-[52px] flex-none cursor-pointer border-0 bg-[var(--color-accent)] px-6 font-sans text-[15px] font-extrabold text-white"
              >
                {t('pilgrimSearch.seePackages')}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="tag tag-neutral">{t('pilgrimSearch.chips.flightHotelVisa')}</span>
              <span className="tag tag-neutral">{t('pilgrimSearch.chips.guide')}</span>
              <span className="tag tag-neutral">{t('pilgrimSearch.chips.installments')}</span>
            </div>
          </div>
        )}

        {isSimple && (
          <div>
            <div className="flex flex-wrap border-2 border-[var(--color-accent)]">
              <SearchInput
                label={t('simpleSearch.place')}
                value={servicePlace}
                onChange={setServicePlace}
                className="flex-[1_1_260px]"
              />
              <SearchInput label={t('simpleSearch.dateFrom')} value={serviceDateFrom} onChange={setServiceDateFrom} type="date" />
              {mode === 'cars' && (
                <SearchInput label={t('simpleSearch.dateTo')} value={serviceDateTo} onChange={setServiceDateTo} type="date" />
              )}
              <button
                type="button"
                onClick={searchService}
                className="min-h-[52px] flex-none cursor-pointer border-0 bg-[var(--color-accent)] px-6 font-sans text-[15px] font-extrabold text-white"
              >
                {tc('search')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
