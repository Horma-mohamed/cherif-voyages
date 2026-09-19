'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type {
  OverviewStats,
  AdminBookingsList,
  AdminGroupsList,
  AdminPaymentsList,
  AdminCustomersList,
  AdminCataloguePackages
} from '@/lib/adminData';
import { markBookingPaidAction, cancelBookingAction } from '@/lib/actions/adminActions';
import CatalogueSection from './CatalogueSection';

type Tab = 'overview' | 'bookings' | 'groups' | 'payments' | 'crm' | 'catalogue';
type TFn = ReturnType<typeof useTranslations>;

function fmtDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    date
  );
}

function statusTag(status: string) {
  const map: Record<string, string> = {
    CONFIRMED: 'border-[var(--color-green)] bg-[var(--color-green-tint)] text-[var(--color-green)]',
    PAID: 'border-[var(--color-green)] bg-[var(--color-green-tint)] text-[var(--color-green)]',
    PENDING: 'border-[var(--color-gold)] bg-[var(--color-gold-tint)] text-[var(--color-gold)]',
    CANCELLED: 'border-[var(--color-divider)] bg-white text-[rgba(15,17,21,0.5)]',
    FAILED: 'border-[var(--color-clay)] bg-[var(--color-clay-tint)] text-[var(--color-clay)]'
  };
  return map[status] ?? map.PENDING;
}

function bookingProduct(booking: AdminBookingsList[number], locale: string) {
  if (booking.flightBooking) return `${booking.flightBooking.origin} → ${booking.flightBooking.destination}`;
  if (booking.packageBooking)
    return locale === 'ar' ? booking.packageBooking.package.titleAr : booking.packageBooking.package.titleFr;
  return '—';
}

export default function AdminDashboard({
  stats,
  bookings,
  groups,
  payments,
  customers,
  packages
}: {
  stats: OverviewStats;
  bookings: AdminBookingsList;
  groups: AdminGroupsList;
  payments: AdminPaymentsList;
  customers: AdminCustomersList;
  packages: AdminCataloguePackages;
}) {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>('overview');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: t('tabs.overview') },
    { key: 'bookings', label: t('tabs.bookings') },
    { key: 'groups', label: t('tabs.groups') },
    { key: 'payments', label: t('tabs.payments') },
    { key: 'crm', label: t('tabs.crm') },
    { key: 'catalogue', label: t('tabs.catalogue') }
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

      <main className="mx-auto max-w-[1320px] px-[28px] py-6.5 pb-14">
        {tab === 'overview' && <OverviewTab stats={stats} t={t} />}
        {tab === 'bookings' && <BookingsTab bookings={bookings} locale={locale} t={t} />}
        {tab === 'groups' && <GroupsTab groups={groups} locale={locale} t={t} />}
        {tab === 'payments' && <PaymentsTab payments={payments} t={t} />}
        {tab === 'crm' && <CrmTab customers={customers} t={t} />}
        {tab === 'catalogue' && <CatalogueSection packages={packages} locale={locale} t={t} />}
      </main>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border-e border-[var(--color-divider)] px-4.5 py-4 last:border-e-0">
      <div className="text-[11px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">{label}</div>
      <div className="font-sans text-[24px] font-extrabold text-[var(--color-accent)]">{value}</div>
      {sub && <div className="text-[12px] text-[rgba(15,17,21,0.55)]">{sub}</div>}
    </div>
  );
}

function OverviewTab({ stats, t }: { stats: OverviewStats; t: TFn }) {
  const maxWeek = Math.max(1, ...stats.weeklyRevenue.map((w) => w.amount));

  return (
    <div>
      <div className="mb-7 grid grid-cols-2 border-y-2 border-[var(--color-divider)] sm:grid-cols-4">
        <Stat label={t('overview.salesThisMonth')} value={`${stats.salesThisMonthMru.toLocaleString('fr-FR')} MRU`} />
        <Stat label={t('overview.ticketsIssued')} value={String(stats.ticketsIssued)} />
        <Stat label={t('overview.pendingPayments')} value={String(stats.pendingPayments)} />
        <Stat label={t('overview.pilgrims')} value={String(stats.pilgrimsRegistered)} />
      </div>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <div>
          <div className="mb-3 text-[11px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
            {t('overview.weeklyRevenue')}
          </div>
          <div className="flex h-[160px] items-end gap-2 border-b-2 border-[var(--color-divider)]">
            {stats.weeklyRevenue.map((w, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full bg-[var(--color-accent-200)]"
                  style={{ height: `${Math.max(2, Math.round((w.amount / maxWeek) * 140))}px` }}
                />
                <span className="text-[10px] text-[rgba(15,17,21,0.5)]">S{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-3 text-[11px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
            {t('overview.productMix')}
          </div>
          {stats.productMix.length === 0 ? (
            <p className="text-[13px] text-[rgba(15,17,21,0.55)]">—</p>
          ) : (
            stats.productMix.map((m) => (
              <div
                key={m.type}
                className="flex justify-between border-b border-[var(--color-divider)] py-1.75 text-[13px]"
              >
                <span>{m.type === 'FLIGHT' ? t('overview.flight') : t('overview.package')}</span>
                <span>
                  {m.percent}% · {m.amount.toLocaleString('fr-FR')} MRU
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function BookingsTab({ bookings, locale, t }: { bookings: AdminBookingsList; locale: string; t: TFn }) {
  if (bookings.length === 0) return <p className="text-[14px] text-[rgba(15,17,21,0.6)]">{t('bookings.none')}</p>;

  return (
    <table className="table">
      <thead>
        <tr>
          <th>{t('bookings.reference')}</th>
          <th>{t('bookings.customer')}</th>
          <th>{t('bookings.product')}</th>
          <th>{t('bookings.date')}</th>
          <th>{t('bookings.amount')}</th>
          <th>{t('bookings.status')}</th>
          <th>{t('bookings.actions')}</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((b) => (
          <tr key={b.id}>
            <td>
              <strong>{b.id.slice(-8).toUpperCase()}</strong>
            </td>
            <td>
              {b.customer.firstName} {b.customer.lastName}
            </td>
            <td>{bookingProduct(b, locale)}</td>
            <td>{fmtDate(b.createdAt, locale)}</td>
            <td>{b.totalAmountMru.toLocaleString('fr-FR')} MRU</td>
            <td>
              <span className={`tag border ${statusTag(b.status)}`}>{b.status}</span>
            </td>
            <td>
              {b.status === 'PENDING' && (
                <div className="flex gap-1.5">
                  <form action={markBookingPaidAction}>
                    <input type="hidden" name="bookingId" value={b.id} />
                    <button className="btn btn-secondary" style={{ fontSize: 12, padding: '5px 10px' }}>
                      {t('bookings.markPaid')}
                    </button>
                  </form>
                  <form action={cancelBookingAction}>
                    <input type="hidden" name="bookingId" value={b.id} />
                    <button className="btn btn-secondary" style={{ fontSize: 12, padding: '5px 10px' }}>
                      {t('bookings.cancel')}
                    </button>
                  </form>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GroupsTab({ groups, locale, t }: { groups: AdminGroupsList; locale: string; t: TFn }) {
  return (
    <div>
      <h2 className="mb-4 text-[22px]">{t('groups.title')}</h2>
      <div
        className="mb-7 grid gap-0.5 border-2 border-[var(--color-divider)] bg-[var(--color-divider)]"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}
      >
        {groups.map((g) => (
          <div key={g.id} className="bg-white p-4.5">
            <div className="font-sans text-[17px] font-extrabold">{locale === 'ar' ? g.titleAr : g.titleFr}</div>
            <div className="mb-2.5 text-[12px] text-[rgba(15,17,21,0.55)]">
              {t('groups.departure')}: {fmtDate(g.departureDate, locale)}
            </div>
            <div className="mb-1.5 h-2.5 bg-[var(--color-accent-200)]">
              <div
                className="h-2.5 bg-[var(--color-accent)]"
                style={{ width: `${Math.round((g.seatsBooked / g.seatsTotal) * 100)}%` }}
              />
            </div>
            <div className="text-[12px] text-[rgba(15,17,21,0.6)]">
              {g.seatsBooked} / {g.seatsTotal} {t('groups.seats')}
            </div>
          </div>
        ))}
      </div>

      {groups.map((g) => {
        const pilgrims = g.bookings.flatMap((pb) => pb.booking.travelers.map((trav) => ({ trav, booking: pb.booking })));
        if (pilgrims.length === 0) return null;
        return (
          <div key={g.id} className="mb-8">
            <h3 className="mb-3 text-[16px] font-extrabold">{locale === 'ar' ? g.titleAr : g.titleFr}</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>{t('groups.pilgrim')}</th>
                  <th>{t('groups.passport')}</th>
                  <th>{t('groups.payment')}</th>
                </tr>
              </thead>
              <tbody>
                {pilgrims.map(({ trav, booking }) => (
                  <tr key={trav.id}>
                    <td>
                      <strong>
                        {trav.firstName} {trav.lastName}
                      </strong>
                    </td>
                    <td>{trav.passportNumber ?? '—'}</td>
                    <td>
                      {booking.payment && (
                        <span className={`tag border ${statusTag(booking.payment.status)}`}>{booking.payment.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

function PaymentsTab({ payments, t }: { payments: AdminPaymentsList; t: TFn }) {
  if (payments.length === 0) return <p className="text-[14px] text-[rgba(15,17,21,0.6)]">{t('payments.none')}</p>;

  return (
    <table className="table">
      <thead>
        <tr>
          <th>{t('payments.method')}</th>
          <th>{t('payments.reference')}</th>
          <th>{t('payments.customer')}</th>
          <th>{t('payments.amount')}</th>
          <th>{t('payments.status')}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {payments.map((p) => (
          <tr key={p.id}>
            <td>{p.method}</td>
            <td>{p.bookingId.slice(-8).toUpperCase()}</td>
            <td>
              {p.booking.customer.firstName} {p.booking.customer.lastName}
            </td>
            <td>{p.amountMru.toLocaleString('fr-FR')} MRU</td>
            <td>
              <span className={`tag border ${statusTag(p.status)}`}>{p.status}</span>
            </td>
            <td>
              {p.status === 'PENDING' && (
                <form action={markBookingPaidAction}>
                  <input type="hidden" name="bookingId" value={p.bookingId} />
                  <button className="btn btn-secondary" style={{ fontSize: 12, padding: '5px 10px' }}>
                    {t('payments.markPaid')}
                  </button>
                </form>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CrmTab({ customers, t }: { customers: AdminCustomersList; t: TFn }) {
  if (customers.length === 0) return <p className="text-[14px] text-[rgba(15,17,21,0.6)]">{t('crm.none')}</p>;

  return (
    <table className="table">
      <thead>
        <tr>
          <th>{t('crm.customer')}</th>
          <th>{t('crm.bookings')}</th>
          <th>{t('crm.totalValue')}</th>
        </tr>
      </thead>
      <tbody>
        {customers.map((c) => (
          <tr key={c.id}>
            <td>
              <strong>
                {c.firstName} {c.lastName}
              </strong>
              <div className="text-[12px] text-[rgba(15,17,21,0.55)]">{c.email}</div>
            </td>
            <td>{c.bookingCount}</td>
            <td>{c.totalValueMru.toLocaleString('fr-FR')} MRU</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
