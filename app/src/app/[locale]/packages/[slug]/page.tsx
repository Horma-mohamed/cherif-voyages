import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import Placeholder from '@/components/Placeholder';
import { getPackageBySlug } from '@/lib/packages';

export default async function PackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [pkg, locale, t] = await Promise.all([
    getPackageBySlug(slug),
    getLocale(),
    getTranslations('Package')
  ]);

  if (!pkg) notFound();

  const isAr = locale === 'ar';
  const title = isAr ? pkg.titleAr : pkg.titleFr;
  const kicker = isAr ? pkg.kickerAr : pkg.kickerFr;
  const description = isAr ? pkg.descriptionAr : pkg.descriptionFr;

  const departureDateLabel = new Intl.DateTimeFormat(isAr ? 'ar' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(pkg.departureDate);

  return (
    <main>
      <div className="relative h-[320px] border-b-2 border-[var(--color-divider)]">
        <Placeholder label="Photographie — Masjid al-Haram" />
      </div>
      <div
        className="mx-auto grid max-w-[1180px] items-start gap-10 p-[28px]"
        style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,320px)' }}
      >
        <div>
          <div className="mb-1.5 text-[11px] uppercase tracking-[0.11em] text-[var(--color-sky)]">{kicker}</div>
          <h1 className="mb-2.5 text-[clamp(28px,3.6vw,40px)]">{title}</h1>
          <p className="mb-5.5 max-w-[62ch] text-[15px] text-[rgba(15,17,21,0.65)]">{description}</p>

          <hr className="hr" />
          <h3 className="mb-3.5 text-[19px]">{t('programTitle')}</h3>
          {pkg.programSteps.map((step, i) => (
            <div
              key={i}
              className={`flex gap-3.5 py-3.5 ${
                i === pkg.programSteps.length - 1 ? 'border-b-2' : 'border-b'
              } border-[var(--color-divider)]`}
            >
              <div className="w-[74px] flex-none font-sans text-[13px] font-extrabold text-[var(--color-sky)]">
                {isAr ? step.daysLabelAr : step.daysLabelFr}
              </div>
              <div className="text-[14px]">{isAr ? step.textAr : step.textFr}</div>
            </div>
          ))}

          <h3 className="mb-3 mt-6.5 text-[19px]">{t('includedTitle')}</h3>
          <table className="table">
            <tbody>
              {pkg.inclusions.map((row, i) => (
                <tr key={i}>
                  <td className="w-[46%] font-medium">{isAr ? row.itemAr : row.itemFr}</td>
                  <td className={row.highlight ? 'text-[var(--color-green)]' : ''}>
                    {isAr ? row.valueAr : row.valueFr}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="sticky top-[90px] border-2 border-[var(--color-accent)]">
          <div className="bg-[var(--color-accent)] px-5 py-4.5 text-white">
            <div className="text-[11px] uppercase tracking-[0.1em] text-[#8fb4e0]">{t('sidebar.fromLabel')}</div>
            <div className="font-sans text-[30px] font-extrabold">{pkg.priceMru.toLocaleString('fr-FR')} MRU</div>
            <div className="text-[13px] text-white/70">
              {pkg.priceEur.toLocaleString('fr-FR')} € / {t('sidebar.perPerson')}
            </div>
          </div>
          <div className="px-5 py-4.5">
            <div className="flex justify-between border-b border-[var(--color-divider)] pb-2.5 text-[13px]">
              <span>{t('sidebar.seatsLabel')}</span>
              <strong className="text-[var(--color-clay)]">
                {pkg.seatsRemaining} / {pkg.seatsTotal}
              </strong>
            </div>
            <div className="flex justify-between border-b border-[var(--color-divider)] py-2.5 text-[13px]">
              <span>{t('sidebar.depositLabel')}</span>
              <strong>{pkg.depositPercent} %</strong>
            </div>
            <div className="flex justify-between py-2.5 pb-4 text-[13px]">
              <span>{t('sidebar.departureLabel')}</span>
              <strong>{departureDateLabel}</strong>
            </div>
            <Link
              href={`/booking?type=package&slug=${pkg.slug}`}
              className="block w-full cursor-pointer border-0 bg-[var(--color-accent)] p-3.5 text-start font-sans text-[14px] font-extrabold text-white no-underline"
            >
              {t('sidebar.reserve')}
            </Link>
            <button className="btn btn-secondary btn-block">{t('sidebar.talkToAdvisor')}</button>
          </div>
        </aside>
      </div>
    </main>
  );
}
