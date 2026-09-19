'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { AccountData } from '@/lib/accountData';
import AlertsSection from './AlertsSection';
import MessagesSection from './MessagesSection';

type Tab = 'trips' | 'bookings' | 'omra' | 'pax' | 'alerts' | 'msg';

function fmtDate(date: Date | null | undefined, locale: string) {
  if (!date) return '—';
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    date
  );
}

function bookingRoute(booking: AccountData['bookings'][number], locale: string) {
  if (booking.flightBooking) return `${booking.flightBooking.origin} → ${booking.flightBooking.destination}`;
  if (booking.packageBooking) return locale === 'ar' ? booking.packageBooking.package.titleAr : booking.packageBooking.package.titleFr;
  return '—';
}

function bookingDate(booking: AccountData['bookings'][number]) {
  return booking.flightBooking?.departureDate ?? booking.packageBooking?.package.departureDate ?? booking.createdAt;
}

export default function AccountDashboard({ data }: { data: AccountData }) {
  const t = useTranslations('Account');
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>('trips');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'trips', label: t('tabs.trips') },
    { key: 'bookings', label: t('tabs.bookings') },
    { key: 'omra', label: t('tabs.omra') },
    { key: 'pax', label: t('tabs.pax') },
    { key: 'alerts', label: t('tabs.alerts') },
    { key: 'msg', label: t('tabs.msg') }
  ];

  return (
    <div>
      <nav className="mb-1 flex gap-6.5 overflow-x-auto border-b-2 border-[var(--color-divider)] px-[28px]">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            aria-pressed={tab === key}
            className="tab-btn cursor-pointer whitespace-nowrap border-0 border-b-[3px] bg-transparent py-3.5 font-sans text-[14px]"
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="mx-auto max-w-[1240px] px-[28px] py-6.5 pb-14">
        {tab === 'trips' && <TripsTab data={data} locale={locale} t={t} onViewGroup={() => setTab('omra')} />}
        {tab === 'bookings' && <BookingsTab data={data} locale={locale} t={t} />}
        {tab === 'omra' && <OmraTab data={data} locale={locale} t={t} />}
        {tab === 'pax' && <PaxTab data={data} locale={locale} t={t} />}
        {tab === 'alerts' && <AlertsSection initialAlerts={data.priceAlerts} />}
        {tab === 'msg' && <MessagesSection initialMessages={data.messages} />}
      </main>
    </div>
  );
}

type TFn = ReturnType<typeof useTranslations>;

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border-e border-[var(--color-divider)] px-4.5 py-4 last:border-e-0">
      <div className="text-[11px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">{label}</div>
      <div className="font-sans text-[24px] font-extrabold text-[var(--color-accent)]">{value}</div>
      {sub && <div className="text-[12px] text-[rgba(15,17,21,0.55)]">{sub}</div>}
    </div>
  );
}

function statusTag(status: string) {
  const map: Record<string, string> = {
    CONFIRMED: 'border-[var(--color-green)] bg-[var(--color-green-tint)] text-[var(--color-green)]',
    PENDING: 'border-[var(--color-gold)] bg-[var(--color-gold-tint)] text-[var(--color-gold)]',
    CANCELLED: 'border-[var(--color-divider)] bg-white text-[rgba(15,17,21,0.5)]'
  };
  return map[status] ?? map.PENDING;
}

function TripsTab({
  data,
  locale,
  t,
  onViewGroup
}: {
  data: AccountData;
  locale: string;
  t: TFn;
  onViewGroup: () => void;
}) {
  const upcoming = data.upcoming;
  const nextDate = upcoming ? bookingDate(upcoming) : null;

  return (
    <div>
      <div className="mb-6.5 grid grid-cols-2 border-b-2 border-[var(--color-divider)] sm:grid-cols-4">
        <StatTile
          label={t('trips.nextDeparture')}
          value={nextDate ? fmtDate(nextDate, locale) : t('trips.noDeparture')}
          sub={upcoming ? bookingRoute(upcoming, locale) : undefined}
        />
        <StatTile
          label={t('trips.walletBalance')}
          value={`${data.customer.walletBalanceMru.toLocaleString('fr-FR')} MRU`}
        />
        <StatTile label={t('trips.loyaltyPoints')} value={data.loyaltyPoints.toLocaleString('fr-FR')} />
        <StatTile
          label={t('trips.documentsToRenew')}
          value={String(data.documentsToRenew.length)}
          sub={data.documentsToRenew[0] ? `${data.documentsToRenew[0].firstName} ${data.documentsToRenew[0].lastName}` : undefined}
        />
      </div>

      <h2 className="mb-3.5 text-[22px]">{t('trips.upcomingTitle')}</h2>
      {!upcoming ? (
        <p className="text-[14px] text-[rgba(15,17,21,0.6)]">{t('trips.noUpcoming')}</p>
      ) : (
        <div className="border-2 border-[var(--color-accent)] p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2.5">
            <span className={`tag border ${statusTag(upcoming.status)}`}>{upcoming.status}</span>
            <span className="text-[12px] text-[rgba(15,17,21,0.55)]">
              {t('trips.reference')} {upcoming.id.slice(-8).toUpperCase()}
            </span>
          </div>
          <div className="font-sans text-[20px] font-extrabold">{bookingRoute(upcoming, locale)}</div>
          <div className="mb-3 text-[13px] text-[rgba(15,17,21,0.65)]">{fmtDate(bookingDate(upcoming), locale)}</div>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[11px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">{t('trips.paid')}</span>
            <span className="font-sans text-[18px] font-extrabold text-[var(--color-accent)]">
              {upcoming.totalAmountMru.toLocaleString('fr-FR')} MRU
            </span>
          </div>
        </div>
      )}

      {data.activeOmra && (
        <div className="mt-4.5 flex flex-wrap items-center gap-4.5 border-2 border-[var(--color-divider)] p-5">
          <div className="flex-[1_1_260px]">
            <div className="font-sans text-[16px] font-extrabold">{t('trips.omraGroupTitle')}</div>
            <div className="text-[13px] text-[rgba(15,17,21,0.6)]">
              {locale === 'ar' ? data.activeOmra.packageBooking!.package.titleAr : data.activeOmra.packageBooking!.package.titleFr}
            </div>
          </div>
          <div className="flex-[1_1_220px]">
            <div className="h-2.5 bg-[var(--color-accent-200)]">
              <div
                className="h-2.5 bg-[var(--color-accent)]"
                style={{
                  width: `${Math.round(
                    (data.activeOmra.packageBooking!.package.seatsBooked / data.activeOmra.packageBooking!.package.seatsTotal) * 100
                  )}%`
                }}
              />
            </div>
            <div className="mt-1.5 text-[12px] text-[rgba(15,17,21,0.6)]">
              {data.activeOmra.packageBooking!.package.seatsBooked} / {data.activeOmra.packageBooking!.package.seatsTotal}{' '}
              {t('trips.seatsFilled')}
            </div>
          </div>
          <button
            onClick={onViewGroup}
            className="cursor-pointer border-0 bg-[var(--color-accent)] px-4.5 py-2.75 font-sans text-[13px] font-extrabold text-white"
          >
            {t('trips.viewGroup')}
          </button>
        </div>
      )}
    </div>
  );
}

function BookingsTab({ data, locale, t }: { data: AccountData; locale: string; t: TFn }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline gap-3.5">
        <h2 className="text-[22px]">{t('bookings.title')}</h2>
        <span className="text-[13px] text-[rgba(15,17,21,0.55)]">
          {data.bookings.length} {t('bookings.count')}
        </span>
      </div>
      {data.bookings.length === 0 ? (
        <p className="text-[14px] text-[rgba(15,17,21,0.6)]">{t('bookings.none')}</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>{t('bookings.reference')}</th>
              <th>{t('bookings.type')}</th>
              <th>{t('bookings.routeOrStay')}</th>
              <th>{t('bookings.date')}</th>
              <th>{t('bookings.amount')}</th>
              <th>{t('bookings.status')}</th>
            </tr>
          </thead>
          <tbody>
            {data.bookings.map((b) => (
              <tr key={b.id}>
                <td>
                  <strong>{b.id.slice(-8).toUpperCase()}</strong>
                </td>
                <td>{b.type === 'FLIGHT' ? t('bookings.typeFlight') : t('bookings.typePackage')}</td>
                <td>{bookingRoute(b, locale)}</td>
                <td>{fmtDate(bookingDate(b), locale)}</td>
                <td>{b.totalAmountMru.toLocaleString('fr-FR')} MRU</td>
                <td>
                  <span className={`tag border ${statusTag(b.status)}`}>{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function OmraTab({ data, locale, t }: { data: AccountData; locale: string; t: TFn }) {
  const booking = data.activeOmra;
  if (!booking?.packageBooking) {
    return (
      <div>
        <h2 className="mb-4 text-[22px]">{t('omra.title')}</h2>
        <p className="text-[14px] text-[rgba(15,17,21,0.6)]">{t('omra.none')}</p>
      </div>
    );
  }

  const pkg = booking.packageBooking.package;
  return (
    <div>
      <h2 className="mb-1 text-[22px]">{locale === 'ar' ? pkg.titleAr : pkg.titleFr}</h2>
      <p className="mb-5 text-[13px] text-[rgba(15,17,21,0.6)]">
        {t('omra.departure')}: {fmtDate(pkg.departureDate, locale)}
      </p>

      <div className="mb-5 border-2 border-[var(--color-divider)] p-5">
        <div className="mb-1.5 flex justify-between text-[13px]">
          <span>{t('omra.seats')}</span>
          <strong>
            {pkg.seatsBooked} / {pkg.seatsTotal}
          </strong>
        </div>
        <div className="h-2.5 bg-[var(--color-accent-200)]">
          <div className="h-2.5 bg-[var(--color-accent)]" style={{ width: `${Math.round((pkg.seatsBooked / pkg.seatsTotal) * 100)}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="border-2 border-[var(--color-divider)] p-4.5">
          <div className="text-[11px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">{t('omra.travelers')}</div>
          <div className="font-sans text-[22px] font-extrabold text-[var(--color-accent)]">
            {booking.packageBooking.travelersCount}
          </div>
        </div>
        <div className="border-2 border-[var(--color-divider)] p-4.5">
          <div className="text-[11px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">{t('omra.payment')}</div>
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-[18px] font-extrabold text-[var(--color-accent)]">
              {booking.totalAmountMru.toLocaleString('fr-FR')} MRU
            </span>
            {booking.payment && <span className={`tag border ${statusTag(booking.payment.status)}`}>{booking.payment.status}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaxTab({ data, locale, t }: { data: AccountData; locale: string; t: TFn }) {
  const renewalIds = new Set(data.documentsToRenew.map((d) => d.id));

  return (
    <div>
      <h2 className="mb-4 text-[22px]">{t('pax.title')}</h2>
      {data.travelers.length === 0 ? (
        <p className="text-[14px] text-[rgba(15,17,21,0.6)]">{t('pax.none')}</p>
      ) : (
        <div className="grid gap-0.5 border-2 border-[var(--color-divider)] bg-[var(--color-divider)] sm:grid-cols-2 lg:grid-cols-3">
          {data.travelers.map((trav) => (
            <div key={trav.id} className="bg-white p-4.5">
              <div className="font-sans text-[17px] font-extrabold">
                {trav.firstName} {trav.lastName}
              </div>
              <div className="mb-2.5 text-[12px] text-[rgba(15,17,21,0.55)]">
                {trav.nationality ?? '—'}
              </div>
              <div className="flex justify-between border-t border-[var(--color-divider)] py-1.5 text-[13px]">
                <span>{t('pax.passport')}</span>
                <span>{trav.passportNumber ?? '—'}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-divider)] py-1.5 text-[13px]">
                <span>{t('pax.expires')}</span>
                <span className={renewalIds.has(trav.id) ? 'font-semibold text-[var(--color-clay)]' : ''}>
                  {trav.passportExpiry ? fmtDate(trav.passportExpiry, locale) : '—'}
                  {renewalIds.has(trav.id) && ` ⚠ ${t('pax.warning')}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
