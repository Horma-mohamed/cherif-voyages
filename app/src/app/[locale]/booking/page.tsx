import { getTranslations } from 'next-intl/server';
import PaymentMethodSelector from '@/components/booking/PaymentMethodSelector';

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input className="input bg-white" placeholder={placeholder} />
    </div>
  );
}

export default async function BookingPage() {
  const t = await getTranslations('Booking');

  const steps = [t('steps.travelers'), t('steps.options'), t('steps.payment')];

  return (
    <main className="mx-auto max-w-[1080px] px-[28px] py-7 pb-16">
      <div className="mb-6.5 flex border-2 border-[var(--color-divider)]">
        {steps.map((label, i) => (
          <div
            key={label}
            className={`flex-1 px-4 py-3 ${i > 0 ? 'border-s border-[var(--color-divider)]' : ''} ${
              i === 0 ? 'bg-[var(--color-accent)] text-white' : ''
            }`}
          >
            <div className={`text-[11px] ${i === 0 ? 'text-[#8fb4e0]' : 'text-[rgba(15,17,21,0.5)]'}`}>
              0{i + 1}
            </div>
            <div className="font-sans text-[14px] font-extrabold">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-10" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,320px)' }}>
        <form>
          <h2 className="mb-4 text-[24px]">{t('travelerTitle')}</h2>
          <div
            className="mb-5.5 grid gap-3.5"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
          >
            <Field label={t('fields.firstName')} placeholder={t('fields.firstNamePh')} />
            <Field label={t('fields.lastName')} placeholder={t('fields.lastNamePh')} />
            <Field label={t('fields.birthDate')} placeholder={t('fields.datePh')} />
            <Field label={t('fields.nationality')} placeholder={t('fields.nationalityPh')} />
            <Field label={t('fields.passportNumber')} placeholder={t('fields.passportPh')} />
            <Field label={t('fields.passportExpiry')} placeholder={t('fields.datePh')} />
          </div>

          <hr className="hr" />
          <h3 className="mb-3.5 text-[19px]">{t('contactTitle')}</h3>
          <div
            className="mb-5.5 grid gap-3.5"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
          >
            <Field label={t('phone')} placeholder={t('phonePh')} />
            <Field label={t('email')} placeholder={t('emailPh')} />
          </div>

          <hr className="hr" />
          <h3 className="mb-3.5 text-[19px]">{t('paymentTitle')}</h3>
          <PaymentMethodSelector />
          <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label>{t('cardNumber')}</label>
              <input className="input bg-white" placeholder={t('cardNumberPh')} />
            </div>
            <Field label={t('expiry')} placeholder={t('expiryPh')} />
            <Field label={t('cvv')} placeholder={t('cvvPh')} />
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
    </main>
  );
}
