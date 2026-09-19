'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { PriceAlert } from '@prisma/client';

export default function AlertsSection({ initialAlerts }: { initialAlerts: PriceAlert[] }) {
  const t = useTranslations('Account.alerts');
  const [alerts, setAlerts] = useState(initialAlerts);

  async function toggle(id: string, active: boolean) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, active } : a)));
    await fetch(`/api/price-alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active })
    });
  }

  async function remove(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/price-alerts/${id}`, { method: 'DELETE' });
  }

  return (
    <div>
      <h2 className="mb-4 text-[22px]">{t('title')}</h2>
      {alerts.length === 0 ? (
        <p className="text-[14px] text-[rgba(15,17,21,0.6)]">{t('none')}</p>
      ) : (
        <div className="border-2 border-[var(--color-divider)]">
          {alerts.map((alert, i) => (
            <div
              key={alert.id}
              className={`flex flex-wrap items-center gap-4.5 p-4 ${
                i < alerts.length - 1 ? 'border-b border-[var(--color-divider)]' : ''
              }`}
            >
              <div className="flex-[1_1_260px]">
                <div className="font-sans text-[16px] font-extrabold">
                  {alert.origin} → {alert.destination}
                </div>
                <div className="text-[13px] text-[rgba(15,17,21,0.6)]">
                  {t('target')}: {alert.targetPriceMru.toLocaleString('fr-FR')} MRU
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={alert.active}
                  onChange={(e) => toggle(alert.id, e.target.checked)}
                  className="accent-[var(--color-accent)]"
                />
                {t('active')}
              </label>
              <button
                onClick={() => remove(alert.id)}
                className="uline cursor-pointer border-0 bg-transparent p-0 text-[13px] text-[var(--color-clay)]"
              >
                {t('delete')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
