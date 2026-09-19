'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BellIcon } from '@/components/Icons';

export default function SortTabs() {
  const t = useTranslations('Flights.sort');
  const [sort, setSort] = useState<'best' | 'cheap' | 'fast'>('best');

  const tabs: { key: 'best' | 'cheap' | 'fast'; label: string; sub: string }[] = [
    { key: 'best', label: t('best'), sub: t('bestSub') },
    { key: 'cheap', label: t('cheap'), sub: t('cheapSub') },
    { key: 'fast', label: t('fast'), sub: t('fastSub') }
  ];

  return (
    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex max-w-full overflow-x-auto border border-[var(--color-divider)]">
        {tabs.map(({ key, label, sub }, i) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            aria-pressed={sort === key}
            className={`seg-btn cursor-pointer border-0 bg-transparent px-4 py-2.5 text-start font-sans text-[13px] font-semibold text-[var(--color-ink)] ${
              i > 0 ? 'border-s border-[var(--color-divider)]' : ''
            }`}
          >
            {label}
            <div className="sub text-[11px] font-normal text-[rgba(15,17,21,0.5)]">{sub}</div>
          </button>
        ))}
      </div>
      <button className="btn btn-secondary gap-2">
        <BellIcon />
        {t('priceAlert')}
      </button>
    </div>
  );
}
