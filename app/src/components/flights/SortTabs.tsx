'use client';

import { useTranslations } from 'next-intl';
import { BellIcon } from '@/components/Icons';

export type SortKey = 'best' | 'cheap' | 'fast';

export default function SortTabs({
  sort,
  onChange,
  cheapestSub,
  fastestSub
}: {
  sort: SortKey;
  onChange: (sort: SortKey) => void;
  cheapestSub: string;
  fastestSub: string;
}) {
  const t = useTranslations('Flights.sort');

  const tabs: { key: SortKey; label: string; sub: string }[] = [
    { key: 'best', label: t('best'), sub: '' },
    { key: 'cheap', label: t('cheap'), sub: cheapestSub },
    { key: 'fast', label: t('fast'), sub: fastestSub }
  ];

  return (
    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex max-w-full overflow-x-auto border border-[var(--color-divider)]">
        {tabs.map(({ key, label, sub }, i) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            aria-pressed={sort === key}
            className={`seg-btn cursor-pointer border-0 bg-transparent px-4 py-2.5 text-start font-sans text-[13px] font-semibold text-[var(--color-ink)] ${
              i > 0 ? 'border-s border-[var(--color-divider)]' : ''
            }`}
          >
            {label}
            {sub && <div className="sub text-[11px] font-normal text-[rgba(15,17,21,0.5)]">{sub}</div>}
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
