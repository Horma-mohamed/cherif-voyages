export default function Placeholder({
  label,
  className = ''
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-[rgba(127,127,127,0.08)] text-[#6e6c66] ${className}`}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.45">
        <rect x="3" y="3" width="18" height="18" rx="1" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
      <span className="max-w-[90%] text-center text-[12px] font-medium leading-tight">{label}</span>
    </div>
  );
}
