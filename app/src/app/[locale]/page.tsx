import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import SearchHub from '@/components/home/SearchHub';
import FaqAccordion from '@/components/home/FaqAccordion';
import Placeholder from '@/components/Placeholder';

const statRules = ['var(--color-gold)', 'var(--color-green)', 'var(--color-sky)', 'var(--color-clay)'];

export default async function HomePage() {
  const t = await getTranslations('Home');
  const tc = await getTranslations('Common');
  const destinations = t.raw('destinations') as {
    id: string;
    city: string;
    duration: string;
    priceMru: string;
    priceEur: string;
  }[];
  const packages = t.raw('packages') as {
    kicker: string;
    title: string;
    description: string;
    priceMru: string;
    priceEur: string;
  }[];
  const explore = t.raw('explore') as { city: string; tags: string }[];
  const stats = t.raw('stats') as { value: string; label: string }[];
  const faq = t.raw('faq') as string[];

  return (
    <main>
      <section className="border-b-2 border-[var(--color-divider)] bg-[var(--color-surface)] px-[28px] py-[44px] pb-9">
        <div className="mx-auto max-w-[1180px]">
          <h1 className="mb-1.5 max-w-[19ch] text-balance text-[clamp(30px,4.2vw,46px)]">
            {t('heroTitle')}
          </h1>
          <p className="mb-6 text-[15px] text-[rgba(15,17,21,0.6)]">{t('heroSubtitle')}</p>
          <SearchHub />
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-[28px]">
        <div
          className="grid border-b-2 border-[var(--color-divider)]"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`border-t-[3px] px-5 py-[22px] ${i < 3 ? 'border-e border-[var(--color-divider)]' : ''}`}
              style={{ borderTopColor: statRules[i] }}
            >
              <div className="font-sans text-[25px] font-extrabold text-[var(--color-accent)]">{stat.value}</div>
              <div className="text-[13px] text-[rgba(15,17,21,0.6)]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-[28px] pb-2 pt-9">
        <div className="mb-4.5 flex flex-wrap items-baseline gap-3.5">
          <h2 className="text-[26px]">{t('destinationsTitle')}</h2>
          <Link href="/flights" className="uline text-[13px] text-[var(--color-sky)] no-underline">
            {tc('seeAll')}
          </Link>
        </div>
        <div
          className="grid gap-0.5 border-2 border-[var(--color-divider)] bg-[var(--color-divider)]"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}
        >
          {destinations.map((d) => (
            <Link
              key={d.id}
              href="/flights"
              className="rowlink block bg-white text-inherit no-underline"
            >
              <div className="h-[140px]">
                <Placeholder label={d.city} />
              </div>
              <div className="px-3.5 pb-3.5 pt-3">
                <div className="font-sans text-[17px] font-extrabold">{d.city}</div>
                <div className="mb-1.5 text-[12px] text-[rgba(15,17,21,0.55)]">{d.duration}</div>
                <div className="text-[14px] font-semibold text-[var(--color-accent)]">
                  {d.priceMru} <span className="font-normal text-[rgba(15,17,21,0.5)]">· {d.priceEur}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-11 bg-[var(--color-accent)] px-[28px] py-11 text-white">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-[clamp(26px,3.4vw,38px)] text-white">{t('packagesTitle')}</h2>
            <Link href="/packages/omra-ramadan" className="uline text-[13px] text-[#cfdeef] no-underline">
              {t('packagesFull')}
            </Link>
          </div>
          <div
            className="grid gap-0.5 border-2 border-white/25 bg-white/25"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
          >
            {packages.map((pkg, i) => (
              <div key={i} className="flex flex-col gap-2 bg-[var(--color-accent)] px-5 py-[22px]">
                <div className="text-[10px] uppercase tracking-[0.11em] text-[#8fb4e0]">{pkg.kicker}</div>
                <div className="font-sans text-[22px] font-extrabold">{pkg.title}</div>
                <p className="m-0 flex-1 text-[13px] text-white/72">{pkg.description}</p>
                <div className="font-sans text-[22px] font-extrabold">{pkg.priceMru}</div>
                <div className="-mt-1 text-[12px] text-white/60">
                  {pkg.priceEur} {tc('perPerson')}
                </div>
                <Link
                  href="/packages/omra-ramadan"
                  className={`mt-1.5 cursor-pointer px-3.5 py-2.5 text-start font-sans text-[13px] font-extrabold no-underline ${
                    i === 1 ? 'bg-white text-[var(--color-accent)]' : 'border border-white bg-transparent text-white'
                  }`}
                >
                  {tc('details')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-[28px] pb-2.5 pt-11">
        <h2 className="mb-1 text-[26px]">{t('exploreTitle')}</h2>
        <p className="mb-4.5 text-[14px] text-[rgba(15,17,21,0.6)]">{t('exploreSubtitle')}</p>
        <div className="grid gap-x-9" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {explore.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-[var(--color-divider)] py-[11px]"
            >
              <span className="text-[14px] font-semibold">{item.city}</span>
              <span className="text-[11px] tracking-[0.05em] text-[var(--color-sky)]">{item.tags}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-[28px] pb-12 pt-10">
        <h2 className="mb-4 text-[22px]">{t('faqTitle')}</h2>
        <FaqAccordion items={faq} />
      </section>
    </main>
  );
}
