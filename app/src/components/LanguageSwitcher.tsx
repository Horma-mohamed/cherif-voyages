'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function setLocale(next: Locale) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex border border-[var(--color-divider)]">
      <button
        onClick={() => setLocale('fr')}
        aria-pressed={locale === 'fr'}
        className="seg-btn cursor-pointer border-0 bg-transparent px-3 py-1.5 font-sans text-[12px] font-semibold text-[var(--color-ink)]"
      >
        FR
      </button>
      <button
        onClick={() => setLocale('ar')}
        aria-pressed={locale === 'ar'}
        className="seg-btn cursor-pointer border-0 border-s border-[var(--color-divider)] bg-transparent px-3 py-1.5 text-[12px] font-semibold text-[var(--color-ink)]"
        style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
      >
        ع
      </button>
    </div>
  );
}
