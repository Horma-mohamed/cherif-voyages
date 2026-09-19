import { getTranslations } from 'next-intl/server';
import { getPackageBySlug } from '@/lib/packages';
import BookingForm, { type BookingContext } from '@/components/booking/BookingForm';

export default async function BookingPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const t = await getTranslations('Booking');
  const steps = [t('steps.travelers'), t('steps.options'), t('steps.payment')];

  let context: BookingContext = { kind: 'mock' };

  if (params.type === 'package' && params.slug) {
    const pkg = await getPackageBySlug(params.slug);
    if (pkg) {
      context = {
        kind: 'package',
        slug: pkg.slug,
        title: pkg.titleFr,
        priceMru: pkg.priceMru,
        priceEur: pkg.priceEur,
        departureDate: pkg.departureDate.toISOString()
      };
    }
  } else if (
    params.type === 'flight' &&
    params.offerId &&
    params.origin &&
    params.destination &&
    params.departureDate
  ) {
    context = {
      kind: 'flight',
      offerId: params.offerId,
      passengerId: params.passengerId ?? '',
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      cabinClass: params.cabinClass ?? 'economy',
      priceMru: Number(params.priceMru ?? '0'),
      priceEur: Number(params.priceEur ?? '0')
    };
  } else if (params.type === 'hotel' && params.name) {
    context = {
      kind: 'hotel',
      name: params.name,
      priceMru: params.priceMru ?? '',
      priceEur: params.priceEur ?? ''
    };
  }

  return (
    <main className="mx-auto max-w-[1080px] px-[28px] py-7 pb-16">
      <div className="mb-6.5 flex border-2 border-[var(--color-divider)]">
        {steps.map((label, i) => (
          <div
            key={label}
            className={`flex-1 px-4 py-3 ${i > 0 ? 'border-s border-[var(--color-divider)]' : ''} ${
              i === 0 ? 'bg-[var(--color-accent)] text-white' : ''
            }`}
          >
            <div className={`text-[11px] ${i === 0 ? 'text-[#8fb4e0]' : 'text-[rgba(15,17,21,0.5)]'}`}>0{i + 1}</div>
            <div className="font-sans text-[14px] font-extrabold">{label}</div>
          </div>
        ))}
      </div>

      <BookingForm context={context} />
    </main>
  );
}
