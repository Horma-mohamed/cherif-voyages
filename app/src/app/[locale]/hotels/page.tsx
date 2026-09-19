import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Placeholder from '@/components/Placeholder';

type Hotel = {
  id: string;
  name: string;
  stars: string;
  distance: string;
  description: string;
  priceMru: string;
  priceEur: string;
};

export default async function HotelsPage() {
  const t = await getTranslations('Hotels');
  const tc = await getTranslations('Common');
  const hotels = t.raw('hotels') as Hotel[];

  return (
    <main className="mx-auto max-w-[1300px] px-[28px] pb-14">
      <div className="my-5 flex flex-wrap border-2 border-[var(--color-accent)]">
        <div className="flex-[1_1_240px] border-e border-[var(--color-divider)] p-3">
          <div className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
            {t('summary.destinationLabel')}
          </div>
          <div className="text-[14px] font-semibold">{t('summary.destination')}</div>
        </div>
        <div className="flex-[1_1_200px] border-e border-[var(--color-divider)] p-3">
          <div className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
            {t('summary.stayLabel')}
          </div>
          <div className="text-[14px] font-semibold">{t('summary.stay')}</div>
        </div>
        <div className="flex-[1_1_180px] border-e border-[var(--color-divider)] p-3">
          <div className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
            {t('summary.travelersLabel')}
          </div>
          <div className="text-[14px] font-semibold">{t('summary.travelers')}</div>
        </div>
        <button className="min-h-12 flex-none cursor-pointer border-0 bg-[var(--color-accent)] px-6.5 font-sans text-[14px] font-extrabold text-white">
          {tc('modify')}
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,330px)]">
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="tag border border-[var(--color-accent)] bg-[var(--color-accent)] text-white">
              {t('tags.underOneKm')}
            </span>
            <span className="tag tag-neutral">{t('tags.fourStarPlus')}</span>
            <span className="tag tag-neutral">{t('tags.shuttle')}</span>
            <span className="tag border border-[var(--color-green)] bg-[var(--color-green-tint)] text-[var(--color-green)]">
              {t('tags.freeCancel')}
            </span>
          </div>

          {hotels.map((hotel, i) => (
            <div
              key={hotel.id}
              className={`flex flex-col border-2 border-[var(--color-divider)] sm:flex-row ${i < hotels.length - 1 ? 'mb-0.5' : ''}`}
            >
              <div className="h-[160px] w-full flex-none sm:h-auto sm:w-[200px]">
                <Placeholder label={hotel.name} />
              </div>
              <div className="flex min-w-0 flex-1 flex-wrap items-start gap-4 px-4.5 py-4">
                <div className="min-w-0 flex-[1_1_220px]">
                  <div className="font-sans text-[19px] font-extrabold">{hotel.name}</div>
                  <div className="mb-2 text-[12px] text-[rgba(15,17,21,0.55)]">
                    {hotel.stars} · {hotel.distance}
                  </div>
                  <p className="m-0 text-[13px] text-[rgba(15,17,21,0.7)]">{hotel.description}</p>
                </div>
                <div className="text-end">
                  <div className="font-sans text-[20px] font-extrabold text-[var(--color-accent)]">
                    {hotel.priceMru}
                  </div>
                  <div className="mb-2.5 text-[12px] text-[rgba(15,17,21,0.5)]">
                    {hotel.priceEur} {t('perNight')}
                  </div>
                  <Link
                    href={`/booking?type=hotel&name=${encodeURIComponent(hotel.name)}&priceMru=${encodeURIComponent(hotel.priceMru)}&priceEur=${encodeURIComponent(hotel.priceEur)}`}
                    className="inline-block cursor-pointer border-0 bg-[var(--color-accent)] px-4.5 py-2.5 font-sans text-[13px] font-extrabold text-white no-underline"
                  >
                    {t('viewOffer')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="sticky top-[90px] border-2 border-[var(--color-divider)]">
          <div className="h-[260px]">
            <Placeholder label={t('mapTitle')} />
          </div>
          <div className="px-4 py-3.5">
            <div className="mb-1 font-sans text-[15px] font-extrabold">{t('mapTitle')}</div>
            <p className="m-0 text-[13px] text-[rgba(15,17,21,0.6)]">{t('mapCaption')}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
