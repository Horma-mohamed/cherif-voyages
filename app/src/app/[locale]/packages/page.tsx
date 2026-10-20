import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { listPackages } from '@/lib/packages';

function fmtDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export default async function PackagesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [locale, t, tc, allPackages] = await Promise.all([
    getLocale(),
    getTranslations('Packages'),
    getTranslations('Common'),
    listPackages()
  ]);
  const isAr = locale === 'ar';

  const kind = params.kind === 'hajj' ? 'hajj' : params.kind === 'omra' ? 'omra' : null;
  const cityQuery = params.city?.trim().toLowerCase() ?? '';
  const pilgrims = params.pilgrims ? Number(params.pilgrims) : null;
  const periodQuery = params.period?.trim().toLowerCase() ?? '';
  const durationQuery = params.duration?.trim().toLowerCase() ?? '';

  let packages = allPackages;
  if (kind === 'hajj') {
    packages = packages.filter((p) => p.slug.includes('hajj'));
  } else if (kind === 'omra') {
    packages = packages.filter((p) => p.slug.includes('omra'));
  }
  if (cityQuery) {
    packages = packages.filter(
      (p) =>
        p.departureCityFr.toLowerCase().includes(cityQuery) || p.departureCityAr.includes(params.city ?? '')
    );
  }
  if (pilgrims && pilgrims > 0) {
    packages = packages.filter((p) => p.seatsRemaining >= pilgrims);
  }
  if (periodQuery) {
    packages = packages.filter(
      (p) => p.kickerFr.toLowerCase().includes(periodQuery) || p.kickerAr.includes(params.period ?? '')
    );
  }
  if (durationQuery) {
    packages = packages.filter((p) => {
      const days = `${p.durationDays}`;
      return durationQuery.includes(days) || durationQuery.includes('12') || durationQuery.includes('15');
    });
  }

  return (
    <main className="mx-auto max-w-[1180px] px-[28px] py-8 pb-14">
      <div className="mb-6 flex flex-wrap items-baseline gap-3">
        <h1 className="text-[28px]">{t('title')}</h1>
        {kind && (
          <span className="tag tag-neutral">{kind === 'hajj' ? t('filterHajj') : t('filterOmra')}</span>
        )}
        {cityQuery && <span className="text-[13px] text-[rgba(15,17,21,0.55)]">{params.city}</span>}
      </div>

      {packages.length === 0 ? (
        <p className="text-[14px] text-[rgba(15,17,21,0.6)]">{t('empty')}</p>
      ) : (
        <div className="grid gap-0.5 border-2 border-[var(--color-divider)] bg-[var(--color-divider)]">
          {packages.map((pkg) => (
            <div
              key={pkg.slug}
              className="flex flex-col gap-3 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-[0.11em] text-[rgba(15,17,21,0.5)]">
                  {isAr ? pkg.kickerAr : pkg.kickerFr}
                </div>
                <div className="font-sans text-[20px] font-extrabold">{isAr ? pkg.titleAr : pkg.titleFr}</div>
                <p className="m-0 mt-1 text-[13px] text-[rgba(15,17,21,0.65)]">
                  {isAr ? pkg.descriptionAr : pkg.descriptionFr}
                </p>
                <div className="mt-2 text-[12px] text-[rgba(15,17,21,0.55)]">
                  {t('departure')}: {fmtDate(pkg.departureDate, locale)} · {isAr ? pkg.departureCityAr : pkg.departureCityFr}{' '}
                  · {pkg.durationDays} {t('days')}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                <div className="font-sans text-[22px] font-extrabold text-[var(--color-accent)]">
                  {pkg.priceMru.toLocaleString('fr-FR')} MRU
                </div>
                <div className="text-[12px] text-[rgba(15,17,21,0.5)]">
                  {pkg.priceEur.toLocaleString('fr-FR')} € {tc('perPerson')}
                </div>
                <div className="text-[12px] text-[rgba(15,17,21,0.55)]">
                  {t('seatsLeft', { count: pkg.seatsRemaining })}
                </div>
                <Link
                  href={`/packages/${pkg.slug}`}
                  className="cursor-pointer border-0 bg-[var(--color-accent)] px-4.5 py-2.5 font-sans text-[13px] font-extrabold text-white no-underline"
                >
                  {tc('details')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
