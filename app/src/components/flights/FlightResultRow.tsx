import Placeholder from '@/components/Placeholder';
import { cityFor } from '@/lib/airports';
import type { FlightSearchResult } from '@/lib/flightSearch';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function minutesLabel(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} h ${String(minutes).padStart(2, '0')}`;
}

function layoverMinutes(arrivingAt: string, departingAt: string) {
  return Math.round((new Date(departingAt).getTime() - new Date(arrivingAt).getTime()) / 60000);
}

export default function FlightResultRow({
  result,
  isLast,
  directLabel,
  stopLabel,
  cheapestTag,
  roundTrip,
  select,
  onSelect
}: {
  result: FlightSearchResult;
  isLast: boolean;
  directLabel: string;
  stopLabel: string;
  cheapestTag: string | null;
  roundTrip: string;
  select: string;
  onSelect: () => void;
}) {
  const firstSlice = result.slices[0];
  const firstSegment = firstSlice.segments[0];
  const lastSegment = firstSlice.segments[firstSlice.segments.length - 1];

  return (
    <div
      className={`rowlink flex flex-wrap items-start gap-4.5 p-4 ${isLast ? '' : 'border-b border-[var(--color-divider)]'}`}
    >
      <div className="h-11 w-11 flex-none border border-[var(--color-divider)]">
        <Placeholder label={result.ownerAirline.slice(0, 3).toUpperCase()} />
      </div>

      <div className="min-w-0 flex-[1_1_300px]">
        <div className="flex flex-wrap items-baseline gap-3.5">
          <span className="font-sans text-[18px] font-extrabold">
            {formatTime(firstSegment.departingAt)} — {formatTime(lastSegment.arrivingAt)}
          </span>
          <span className="text-[13px] text-[rgba(15,17,21,0.6)]">
            {result.ownerAirline} · {firstSegment.flightNumber}
          </span>
        </div>
        <div className="text-[13px] text-[rgba(15,17,21,0.6)]">
          {firstSlice.origin} — {firstSlice.segments.length > 1 ? '… — ' : ''}
          {firstSlice.destination} · {minutesLabel(result.totalDurationMinutes)} ·{' '}
          {result.direct ? (
            <span className="font-semibold text-[var(--color-green)]">{directLabel}</span>
          ) : (
            stopLabel
          )}
        </div>

        {result.slices.map((slice, sliceIndex) => (
          <div key={sliceIndex} className="mt-2.5 border-t border-[var(--color-divider)] pt-2.5">
            {slice.segments.map((segment, segmentIndex) => (
              <div key={segmentIndex}>
                <div className="mt-2 flex items-start gap-3">
                  <div className="w-24 flex-none font-sans text-[12px] font-bold">
                    {formatTime(segment.departingAt)} — {formatTime(segment.arrivingAt)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold">
                      {cityFor(segment.origin)} {segment.origin} → {cityFor(segment.destination)} {segment.destination}
                    </div>
                    <div className="text-[12px] text-[rgba(15,17,21,0.55)]">
                      {segment.flightNumber} · {segment.carrierName}
                      {segment.aircraft ? ` · ${segment.aircraft}` : ''}
                    </div>
                  </div>
                </div>
                {segmentIndex < slice.segments.length - 1 && (
                  <div className="mt-2 flex items-start gap-3">
                    <div className="w-24 flex-none font-sans text-[12px] font-bold text-[var(--color-gold)]">
                      {minutesLabel(layoverMinutes(segment.arrivingAt, slice.segments[segmentIndex + 1].departingAt))}
                    </div>
                    <div className="min-w-0 text-[12px] font-semibold text-[var(--color-gold)]">
                      {cityFor(segment.destination)} {segment.destination}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {cheapestTag && (
        <span className="tag mt-1.5 border border-[var(--color-gold)] bg-[var(--color-gold-tint)] text-[var(--color-gold)]">
          {cheapestTag}
        </span>
      )}

      <div className="text-end">
        <div className="font-sans text-[20px] font-extrabold text-[var(--color-accent)]">
          {result.priceMru.toLocaleString('fr-FR')} MRU
        </div>
        <div className="text-[12px] text-[rgba(15,17,21,0.5)]">
          {result.priceEur.toLocaleString('fr-FR')} € · {roundTrip}
        </div>
      </div>
      <button
        onClick={onSelect}
        className="cursor-pointer border-0 bg-[var(--color-accent)] px-5 py-3 font-sans text-[13px] font-extrabold text-white"
      >
        {select}
      </button>
    </div>
  );
}
