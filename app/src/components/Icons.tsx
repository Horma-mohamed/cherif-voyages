const common = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: '#0d2a56',
  strokeWidth: 1.8
} as const;

export function FlightIcon() {
  return (
    <svg {...common}>
      <path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a.5.5 0 0 0-.5.8l3.2 4-2.4 2.4-2-.5-1 1 3 1.8L7 19l1-1-.5-2 2.4-2.4 4 3.2a.5.5 0 0 0 .8-.5Z" />
    </svg>
  );
}

export function HotelIcon() {
  return (
    <svg {...common}>
      <path d="M2 20V8M2 14h20v6M22 14v-2a3 3 0 0 0-3-3h-9v5" />
      <circle cx="6.5" cy="11.5" r="2" />
    </svg>
  );
}

export function OmraIcon() {
  return (
    <svg {...common}>
      <path d="M4 21V8l8-5 8 5v13z" />
      <path d="M4 11h16" />
    </svg>
  );
}

export function HajjIcon() {
  return (
    <svg {...common}>
      <path d="M12 3a7 7 0 1 0 6.5 9.5A5.5 5.5 0 0 1 12 3Z" />
    </svg>
  );
}

export function CarIcon() {
  return (
    <svg {...common}>
      <path d="M5 17h14M3 17v-4l2-5h14l2 5v4" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

export function VisaIcon() {
  return (
    <svg {...common}>
      <path d="M5 3h14v18H5z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#0d2a56" strokeWidth={2}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    </svg>
  );
}
