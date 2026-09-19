import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Placeholder from '@/components/Placeholder';

export default async function PackagePage() {
  const t = await getTranslations('Package');
  const program = t.raw('program') as { days: string; text: string }[];
  const included = t.raw('included') as { item: string; value: string }[];

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
          <div className="mb-1.5 text-[11px] uppercase tracking-[0.11em] text-[var(--color-sky)]">
            {t('kicker')}
          </div>
          <h1 className="mb-2.5 text-[clamp(28px,3.6vw,40px)]">{t('title')}</h1>
          <p className="mb-5.5 max-w-[62ch] text-[15px] text-[rgba(15,17,21,0.65)]">{t('description')}</p>

          <hr className="hr" />
          <h3 className="mb-3.5 text-[19px]">{t('programTitle')}</h3>
          {program.map((step, i) => (
            <div
              key={i}
              className={`flex gap-3.5 py-3.5 ${
                i === program.length - 1 ? 'border-b-2' : 'border-b'
              } border-[var(--color-divider)]`}
            >
              <div className="w-[74px] flex-none font-sans text-[13px] font-extrabold text-[var(--color-sky)]">
                {step.days}
              </div>
              <div className="text-[14px]">{step.text}</div>
            </div>
          ))}

          <h3 className="mb-3 mt-6.5 text-[19px]">{t('includedTitle')}</h3>
          <table className="table">
            <tbody>
              {included.map((row, i) => (
                <tr key={i}>
                  <td className="w-[46%] font-medium">{row.item}</td>
                  <td className={i === 3 ? 'text-[var(--color-green)]' : ''}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="sticky top-[90px] border-2 border-[var(--color-accent)]">
          <div className="bg-[var(--color-accent)] px-5 py-4.5 text-white">
            <div className="text-[11px] uppercase tracking-[0.1em] text-[#8fb4e0]">{t('sidebar.fromLabel')}</div>
            <div className="font-sans text-[30px] font-extrabold">{t('sidebar.priceMru')}</div>
            <div className="text-[13px] text-white/70">
              {t('sidebar.priceEur')} / {t('sidebar.perPerson')}
            </div>
          </div>
          <div className="px-5 py-4.5">
            <div className="flex justify-between border-b border-[var(--color-divider)] pb-2.5 text-[13px]">
              <span>{t('sidebar.seatsLabel')}</span>
              <strong className="text-[var(--color-clay)]">{t('sidebar.seatsValue')}</strong>
            </div>
            <div className="flex justify-between border-b border-[var(--color-divider)] py-2.5 text-[13px]">
              <span>{t('sidebar.depositLabel')}</span>
              <strong>{t('sidebar.depositValue')}</strong>
            </div>
            <div className="flex justify-between py-2.5 pb-4 text-[13px]">
              <span>{t('sidebar.departureLabel')}</span>
              <strong>{t('sidebar.departureValue')}</strong>
            </div>
            <Link
              href="/booking"
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
