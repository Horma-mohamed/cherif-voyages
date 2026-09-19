import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { getCurrentCustomer } from '@/lib/auth';

export default async function Header() {
  const [t, customer] = await Promise.all([getTranslations('Common'), getCurrentCustomer()]);

  const navLinks = [
    { href: '/flights', label: t('nav.flights') },
    { href: '/hotels', label: t('nav.hotels') },
    { href: '/packages/omra-ramadan', label: t('nav.omraHajj') },
    { href: '/', label: t('nav.visa') },
    { href: '/', label: t('nav.agency') }
  ];

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-[28px] border-b-2 border-[var(--color-divider)] bg-white px-[28px] py-3.5">
      <Link
        href="/"
        className="font-sans text-[19px] font-extrabold tracking-tight text-[var(--color-accent)]"
      >
        {t('brand')}
      </Link>
      <nav className="me-auto flex flex-wrap items-center gap-[22px] text-sm">
        {navLinks.map((link, i) => (
          <Link
            key={i}
            href={link.href}
            className="text-[var(--color-ink)] no-underline hover:text-[var(--color-sky)]"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2.5">
        <LanguageSwitcher />
        <span className="text-[12px] text-[rgba(15,17,21,0.55)]">{t('currency')}</span>
        <Link href={customer ? '/account' : '/account/login'} className="btn btn-secondary text-[13px] no-underline">
          {customer ? customer.firstName : t('account')}
        </Link>
      </div>
    </header>
  );
}
