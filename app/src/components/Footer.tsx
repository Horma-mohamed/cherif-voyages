import { getTranslations } from 'next-intl/server';

export default async function Footer() {
  const t = await getTranslations('Common');
  const services = t.raw('footer.services') as string[];
  const agencyLinks = t.raw('footer.agencyLinks') as string[];

  return (
    <footer className="mt-2 border-t-2 border-[var(--color-divider)] bg-[var(--color-surface)] px-[28px] py-9 pb-6.5">
      <div className="mx-auto grid max-w-[1180px] gap-7" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div>
          <div className="mb-2 font-sans text-[17px] font-extrabold text-[var(--color-accent)]">{t('brand')}</div>
          <p className="m-0 text-[13px] text-[rgba(15,17,21,0.6)]">{t('footer.address')}</p>
        </div>
        <div className="flex flex-col gap-1.5 text-[13px]">
          <div className="text-[11px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
            {t('footer.servicesTitle')}
          </div>
          {services.map((s, i) => (
            <span key={i}>{s}</span>
          ))}
        </div>
        <div className="flex flex-col gap-1.5 text-[13px]">
          <div className="text-[11px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
            {t('footer.agencyTitle')}
          </div>
          {agencyLinks.map((s, i) => (
            <span key={i}>{s}</span>
          ))}
        </div>
        <div className="flex flex-col gap-1.5 text-[13px]">
          <div className="text-[11px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
            {t('footer.contactTitle')}
          </div>
          <span>{t('footer.phone')}</span>
          <span>{t('footer.email')}</span>
          <span>{t('footer.hours')}</span>
        </div>
      </div>
      <div className="mx-auto mt-5.5 max-w-[1180px] border-t border-[var(--color-divider)] pt-3.5 text-[12px] text-[rgba(15,17,21,0.5)]">
        {t('footer.copyright')}
      </div>
    </footer>
  );
}
