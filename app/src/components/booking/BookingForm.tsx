'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import PaymentMethodSelector, { type PaymentMethod } from './PaymentMethodSelector';

export type BookingContext =
  | {
      kind: 'package';
      slug: string;
      title: string;
      priceMru: number;
      priceEur: number;
      departureDate: string;
    }
  | {
      kind: 'flight';
      offerId: string;
      passengerId: string;
      origin: string;
      destination: string;
      departureDate: string;
      returnDate?: string;
      cabinClass: string;
      priceMru: number;
      priceEur: number;
    }
  | { kind: 'hotel'; name: string; priceMru: string; priceEur: string }
  | { kind: 'mock' };

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = 'text'
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        className="input bg-white"
        placeholder={placeholder}
        value={value}
        type={type}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

const paymentMethodApiValue: Record<PaymentMethod, 'CARD' | 'BANKILY' | 'MASRVI' | 'AGENCY'> = {
  card: 'CARD',
  bankily: 'BANKILY',
  masrvi: 'MASRVI',
  agency: 'AGENCY'
};

export default function BookingForm({ context }: { context: BookingContext }) {
  const t = useTranslations('Booking');
  const locale = useLocale();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [nationality, setNationality] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [title, setTitle] = useState<'mr' | 'mrs' | 'ms'>('mr');
  const [gender, setGender] = useState<'m' | 'f'>('m');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ bookingId: string; duffelWarning?: string | null } | null>(null);

  if (context.kind === 'mock') {
    return <MockBookingForm />;
  }
  if (context.kind === 'hotel') {
    return <HotelBookingView context={context} />;
  }

  async function handleSubmit() {
    if (context.kind === 'mock' || context.kind === 'hotel') return;

    setSubmitting(true);
    setError(null);

    try {
      if (context.kind === 'package') {
        const res = await fetch('/api/bookings/package', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: context.slug,
            paymentMethod: paymentMethodApiValue[paymentMethod],
            contact: { phone, email },
            travelers: [{ firstName, lastName, birthDate, nationality, passportNumber, passportExpiry }]
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error === 'not_enough_seats' ? t('errors.notEnoughSeats') : t('errors.generic'));
        setResult({ bookingId: data.bookingId });
      } else if (context.kind === 'flight') {
        const res = await fetch('/api/bookings/flight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offerId: context.offerId,
            origin: context.origin,
            destination: context.destination,
            departureDate: context.departureDate,
            returnDate: context.returnDate,
            cabinClass: context.cabinClass,
            priceMru: context.priceMru,
            priceEur: context.priceEur,
            paymentMethod: paymentMethodApiValue[paymentMethod],
            contact: { phone, email },
            travelers: [
              {
                offerPassengerId: context.passengerId,
                title,
                gender,
                firstName,
                lastName,
                birthDate,
                nationality,
                passportNumber,
                passportExpiry
              }
            ]
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(t('errors.generic'));
        setResult({ bookingId: data.bookingId, duffelWarning: data.duffelWarning });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.generic'));
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="border-2 border-[var(--color-green)] bg-[var(--color-green-tint)] p-6">
        <div className="mb-2 font-sans text-[18px] font-extrabold text-[var(--color-green)]">
          {t('confirmation.title')}
        </div>
        <p className="m-0 text-[14px] text-[rgba(15,17,21,0.75)]">
          {t('confirmation.reference')} <strong>{result.bookingId}</strong>
        </p>
        {result.duffelWarning && (
          <p className="mt-3 text-[13px] text-[var(--color-clay)]">{t('confirmation.duffelPending')}</p>
        )}
      </div>
    );
  }

  const routeLabel =
    context.kind === 'package'
      ? context.title
      : `${context.origin} — ${context.destination}`;
  const dateLabel =
    context.kind === 'package'
      ? new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
          new Date(context.departureDate)
        )
      : context.returnDate
        ? `${context.departureDate} — ${context.returnDate}`
        : context.departureDate;

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <h2 className="mb-4 text-[24px]">{t('travelerTitle')}</h2>
        <div className="mb-5.5 grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {context.kind === 'flight' && (
            <>
              <div className="field">
                <label>{t('fields.title')}</label>
                <select className="input bg-white" value={title} onChange={(e) => setTitle(e.target.value as typeof title)}>
                  <option value="mr">{t('fields.titleMr')}</option>
                  <option value="mrs">{t('fields.titleMrs')}</option>
                  <option value="ms">{t('fields.titleMs')}</option>
                </select>
              </div>
              <div className="field">
                <label>{t('fields.gender')}</label>
                <select className="input bg-white" value={gender} onChange={(e) => setGender(e.target.value as typeof gender)}>
                  <option value="m">{t('fields.genderM')}</option>
                  <option value="f">{t('fields.genderF')}</option>
                </select>
              </div>
            </>
          )}
          <Field label={t('fields.firstName')} placeholder={t('fields.firstNamePh')} value={firstName} onChange={setFirstName} />
          <Field label={t('fields.lastName')} placeholder={t('fields.lastNamePh')} value={lastName} onChange={setLastName} />
          <Field label={t('fields.birthDate')} placeholder={t('fields.datePh')} value={birthDate} onChange={setBirthDate} type="date" />
          <Field label={t('fields.nationality')} placeholder={t('fields.nationalityPh')} value={nationality} onChange={setNationality} />
          <Field label={t('fields.passportNumber')} placeholder={t('fields.passportPh')} value={passportNumber} onChange={setPassportNumber} />
          <Field label={t('fields.passportExpiry')} placeholder={t('fields.datePh')} value={passportExpiry} onChange={setPassportExpiry} type="date" />
        </div>

        <hr className="hr" />
        <h3 className="mb-3.5 text-[19px]">{t('contactTitle')}</h3>
        <div className="mb-5.5 grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <Field label={t('phone')} placeholder={t('phonePh')} value={phone} onChange={setPhone} />
          <Field label={t('email')} placeholder={t('emailPh')} value={email} onChange={setEmail} type="email" />
        </div>

        <hr className="hr" />
        <h3 className="mb-3.5 text-[19px]">{t('paymentTitle')}</h3>
        <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
        {paymentMethod === 'card' && (
          <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label>{t('cardNumber')}</label>
              <input className="input bg-white" placeholder={t('cardNumberPh')} value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
            </div>
            <Field label={t('expiry')} placeholder={t('expiryPh')} value={expiry} onChange={setExpiry} />
            <Field label={t('cvv')} placeholder={t('cvvPh')} value={cvv} onChange={setCvv} />
          </div>
        )}
      </form>

      <aside className="sticky top-[90px] border-2 border-[var(--color-divider)]">
        <div className="border-b-2 border-[var(--color-divider)] px-4.5 py-4">
          <div className="font-sans text-[16px] font-extrabold">{t('summary.title')}</div>
          <div className="text-[13px] text-[rgba(15,17,21,0.6)]">
            {routeLabel} · {dateLabel}
          </div>
        </div>
        <div className="px-4.5 py-4">
          <div className="flex items-baseline justify-between py-1">
            <span className="font-sans text-[15px] font-extrabold">{t('summary.total')}</span>
            <span className="font-sans text-[22px] font-extrabold text-[var(--color-accent)]">
              {context.priceMru.toLocaleString('fr-FR')} MRU
            </span>
          </div>
          <div className="mb-3.5 text-end text-[12px] text-[rgba(15,17,21,0.5)]">
            {context.priceEur.toLocaleString('fr-FR')} €
          </div>
          {error && <p className="mb-3 text-[12px] text-[var(--color-clay)]">{error}</p>}
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full cursor-pointer border-0 bg-[var(--color-accent)] p-3.5 text-start font-sans text-[14px] font-extrabold text-white disabled:opacity-60"
          >
            {submitting ? t('summary.submitting') : t('summary.pay')}
          </button>
          <p className="mt-2.5 text-[11px] text-[var(--color-green)]">{t('summary.note')}</p>
        </div>
      </aside>
    </div>
  );
}

function HotelBookingView({ context }: { context: { name: string; priceMru: string; priceEur: string } }) {
  const t = useTranslations('Booking');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
      <form onSubmit={(e) => e.preventDefault()}>
        <h2 className="mb-4 text-[24px]">{t('travelerTitle')}</h2>
        <div className="mb-5.5 grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <Field label={t('fields.firstName')} placeholder={t('fields.firstNamePh')} value={firstName} onChange={setFirstName} />
          <Field label={t('fields.lastName')} placeholder={t('fields.lastNamePh')} value={lastName} onChange={setLastName} />
        </div>
        <hr className="hr" />
        <h3 className="mb-3.5 text-[19px]">{t('contactTitle')}</h3>
        <div className="mb-5.5 grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <Field label={t('phone')} placeholder={t('phonePh')} value={phone} onChange={setPhone} />
          <Field label={t('email')} placeholder={t('emailPh')} value={email} onChange={setEmail} type="email" />
        </div>
      </form>

      <aside className="sticky top-[90px] border-2 border-[var(--color-divider)]">
        <div className="border-b-2 border-[var(--color-divider)] px-4.5 py-4">
          <div className="font-sans text-[16px] font-extrabold">{t('summary.title')}</div>
          <div className="text-[13px] text-[rgba(15,17,21,0.6)]">{context.name}</div>
        </div>
        <div className="px-4.5 py-4">
          <div className="flex items-baseline justify-between py-1">
            <span className="font-sans text-[15px] font-extrabold">{t('summary.total')}</span>
            <span className="font-sans text-[22px] font-extrabold text-[var(--color-accent)]">{context.priceMru}</span>
          </div>
          <div className="mb-3.5 text-end text-[12px] text-[rgba(15,17,21,0.5)]">{context.priceEur}</div>
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed border-0 bg-[var(--color-accent)] p-3.5 text-start font-sans text-[14px] font-extrabold text-white opacity-60"
          >
            {t('summary.pay')}
          </button>
          <p className="mt-2.5 text-[11px] text-[var(--color-clay)]">{t('hotelComingSoon')}</p>
        </div>
      </aside>
    </div>
  );
}

function MockBookingForm() {
  const t = useTranslations('Booking');

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
      <form>
        <h2 className="mb-4 text-[24px]">{t('travelerTitle')}</h2>
        <div className="mb-5.5 grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <Field label={t('fields.firstName')} placeholder={t('fields.firstNamePh')} value="" onChange={() => {}} />
          <Field label={t('fields.lastName')} placeholder={t('fields.lastNamePh')} value="" onChange={() => {}} />
          <Field label={t('fields.birthDate')} placeholder={t('fields.datePh')} value="" onChange={() => {}} />
          <Field label={t('fields.nationality')} placeholder={t('fields.nationalityPh')} value="" onChange={() => {}} />
          <Field label={t('fields.passportNumber')} placeholder={t('fields.passportPh')} value="" onChange={() => {}} />
          <Field label={t('fields.passportExpiry')} placeholder={t('fields.datePh')} value="" onChange={() => {}} />
        </div>

        <hr className="hr" />
        <h3 className="mb-3.5 text-[19px]">{t('contactTitle')}</h3>
        <div className="mb-5.5 grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <Field label={t('phone')} placeholder={t('phonePh')} value="" onChange={() => {}} />
          <Field label={t('email')} placeholder={t('emailPh')} value="" onChange={() => {}} />
        </div>

        <hr className="hr" />
        <h3 className="mb-3.5 text-[19px]">{t('paymentTitle')}</h3>
        <PaymentMethodSelector value="card" onChange={() => {}} />
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="field" style={{ gridColumn: '1/-1' }}>
            <label>{t('cardNumber')}</label>
            <input className="input bg-white" placeholder={t('cardNumberPh')} />
          </div>
          <Field label={t('expiry')} placeholder={t('expiryPh')} value="" onChange={() => {}} />
          <Field label={t('cvv')} placeholder={t('cvvPh')} value="" onChange={() => {}} />
        </div>
      </form>

      <aside className="sticky top-[90px] border-2 border-[var(--color-divider)]">
        <div className="border-b-2 border-[var(--color-divider)] px-4.5 py-4">
          <div className="font-sans text-[16px] font-extrabold">{t('summary.title')}</div>
          <div className="text-[13px] text-[rgba(15,17,21,0.6)]">{t('summary.route')}</div>
        </div>
        <div className="px-4.5 py-4">
          <div className="flex justify-between border-b border-[var(--color-divider)] pb-2.25 text-[13px]">
            <span>{t('summary.flight')}</span>
            <span>{t('summary.flightPrice')}</span>
          </div>
          <div className="flex justify-between border-b border-[var(--color-divider)] py-2.25 text-[13px]">
            <span>{t('summary.baggage')}</span>
            <span>{t('summary.baggagePrice')}</span>
          </div>
          <div className="flex justify-between border-b-2 border-[var(--color-divider)] py-2.25 text-[13px]">
            <span>{t('summary.service')}</span>
            <span>{t('summary.servicePrice')}</span>
          </div>
          <div className="flex items-baseline justify-between py-3.5 pb-1">
            <span className="font-sans text-[15px] font-extrabold">{t('summary.total')}</span>
            <span className="font-sans text-[22px] font-extrabold text-[var(--color-accent)]">
              {t('summary.totalMru')}
            </span>
          </div>
          <div className="mb-3.5 text-end text-[12px] text-[rgba(15,17,21,0.5)]">{t('summary.totalEur')}</div>
          <button
            type="button"
            className="w-full cursor-pointer border-0 bg-[var(--color-accent)] p-3.5 text-start font-sans text-[14px] font-extrabold text-white"
          >
            {t('summary.pay')}
          </button>
          <p className="mt-2.5 text-[11px] text-[var(--color-green)]">{t('summary.note')}</p>
        </div>
      </aside>
    </div>
  );
}
