'use client';

import { useState } from 'react';

export default function FaqAccordion({ items }: { items: string[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="grid gap-x-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
      {items.map((question, i) => (
        <button
          key={i}
          onClick={() => setOpen(open === i ? null : i)}
          className={`flex cursor-pointer items-start justify-between gap-3 border-0 bg-transparent px-0 py-3.5 text-start text-[14px] ${
            i < 2 ? 'border-t-2' : 'border-t'
          } border-[var(--color-divider)]`}
        >
          <span>{question}</span>
          <span className="text-[var(--color-sky)]">{open === i ? '−' : '+'}</span>
        </button>
      ))}
    </div>
  );
}
