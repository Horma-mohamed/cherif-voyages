'use client';

import { useTranslations } from 'next-intl';

export type PaymentMethod = 'card' | 'bankily' | 'masrvi' | 'agency';

export default function PaymentMethodSelector({
  value,
  onChange
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}) {
  const t = useTranslations('Booking.paymentMethods');

  const methods: { key: PaymentMethod; label: string }[] = [
    { key: 'card', label: t('card') },
    { key: 'bankily', label: t('bankily') },
    { key: 'masrvi', label: t('masrvi') },
    { key: 'agency', label: t('agency') }
  ];

  return (
    <div className="mb-4 flex flex-wrap gap-0.5">
      {methods.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          className="seg-btn cursor-pointer border border-[var(--color-divider)] bg-white px-4.5 py-2.75 font-sans text-[13px] font-semibold text-[var(--color-ink)]"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
