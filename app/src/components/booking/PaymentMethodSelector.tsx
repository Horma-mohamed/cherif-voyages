'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function PaymentMethodSelector() {
  const t = useTranslations('Booking.paymentMethods');
  const [method, setMethod] = useState<'card' | 'bankily' | 'masrvi' | 'agency'>('card');

  const methods: { key: 'card' | 'bankily' | 'masrvi' | 'agency'; label: string }[] = [
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
          onClick={() => setMethod(key)}
          aria-pressed={method === key}
          className="seg-btn cursor-pointer border border-[var(--color-divider)] bg-white px-4.5 py-2.75 font-sans text-[13px] font-semibold text-[var(--color-ink)]"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
