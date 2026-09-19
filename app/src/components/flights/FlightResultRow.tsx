import Placeholder from '@/components/Placeholder';

type Segment = { times: string; route: string; meta: string };
type Layover = { duration: string; title: string; meta: string };
type Details = Partial<Record<'baggage' | 'cabin' | 'meals' | 'zamzam' | 'modification' | 'cancellation', string>>;

export type FlightResult = {
  id: string;
  code: string;
  times: string;
  airline: string;
  routeSummary: string;
  direct: boolean;
  priceMru: string;
  priceEur: string;
  cheapest?: boolean;
  segments: Segment[];
  layover?: Layover;
  details: Details;
};

const detailKeys: (keyof Details)[] = ['baggage', 'cabin', 'meals', 'zamzam', 'modification', 'cancellation'];

export default function FlightResultRow({
  result,
  isLast,
  labels,
  directLabel,
  stopLabel,
  cheapestTag,
  roundTrip,
  select
}: {
  result: FlightResult;
  isLast: boolean;
  labels: Record<string, string>;
  directLabel: string;
  stopLabel: string;
  cheapestTag: string;
  roundTrip: string;
  select: string;
}) {
  return (
    <div
      className={`rowlink flex flex-wrap items-start gap-4.5 p-4 ${isLast ? '' : 'border-b border-[var(--color-divider)]'}`}
    >
      <div className="h-11 w-11 flex-none border border-[var(--color-divider)]">
        <Placeholder label={result.code} />
      </div>

      <div className="min-w-0 flex-[1_1_300px]">
        <div className="flex flex-wrap items-baseline gap-3.5">
          <span className="font-sans text-[18px] font-extrabold">{result.times}</span>
          <span className="text-[13px] text-[rgba(15,17,21,0.6)]">{result.airline}</span>
        </div>
        <div className="text-[13px] text-[rgba(15,17,21,0.6)]">
          {result.routeSummary} ·{' '}
          {result.direct ? (
            <span className="font-semibold text-[var(--color-green)]">{directLabel}</span>
          ) : (
            stopLabel
          )}
        </div>

        <div className="mt-2.5 border-t border-[var(--color-divider)] pt-2.5">
          <div className="mt-2 flex items-start gap-3">
            <div className="w-24 flex-none font-sans text-[12px] font-bold">{result.segments[0].times}</div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold">{result.segments[0].route}</div>
              <div className="text-[12px] text-[rgba(15,17,21,0.55)]">{result.segments[0].meta}</div>
            </div>
          </div>

          {result.layover && (
            <div className="mt-2 flex items-start gap-3">
              <div className="w-24 flex-none font-sans text-[12px] font-bold text-[var(--color-gold)]">
                {result.layover.duration}
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-[var(--color-gold)]">{result.layover.title}</div>
                <div className="text-[12px] text-[rgba(15,17,21,0.55)]">{result.layover.meta}</div>
              </div>
            </div>
          )}

          {result.segments[1] && (
            <div className="mt-2 flex items-start gap-3">
              <div className="w-24 flex-none font-sans text-[12px] font-bold">{result.segments[1].times}</div>
              <div className="min-w-0">
                <div className="text-[12px] font-semibold">{result.segments[1].route}</div>
                <div className="text-[12px] text-[rgba(15,17,21,0.55)]">{result.segments[1].meta}</div>
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--color-divider)] pt-2.5">
            {detailKeys
              .filter((key) => result.details[key])
              .map((key) => (
                <div key={key}>
                  <div className="text-[10px] uppercase tracking-[0.09em] text-[rgba(15,17,21,0.5)]">
                    {labels[key]}
                  </div>
                  <div className="text-[12px] font-semibold">{result.details[key]}</div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {result.cheapest && (
        <span className="tag mt-1.5 border border-[var(--color-gold)] bg-[var(--color-gold-tint)] text-[var(--color-gold)]">
          {cheapestTag}
        </span>
      )}

      <div className="text-end">
        <div className="font-sans text-[20px] font-extrabold text-[var(--color-accent)]">{result.priceMru}</div>
        <div className="text-[12px] text-[rgba(15,17,21,0.5)]">
          {result.priceEur} · {roundTrip}
        </div>
      </div>
      <button className="cursor-pointer border-0 bg-[var(--color-accent)] px-5 py-3 font-sans text-[13px] font-extrabold text-white">
        {select}
      </button>
    </div>
  );
}
