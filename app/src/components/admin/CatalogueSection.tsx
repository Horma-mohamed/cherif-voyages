'use client';

import { useState } from 'react';
import type { AdminCataloguePackages } from '@/lib/adminData';
import { updatePackageAction } from '@/lib/actions/adminActions';

type TFn = (key: string) => string;

export default function CatalogueSection({
  packages,
  locale,
  t
}: {
  packages: AdminCataloguePackages;
  locale: string;
  t: TFn;
}) {
  const [selectedId, setSelectedId] = useState(packages[0]?.id ?? null);
  const selected = packages.find((p) => p.id === selectedId) ?? null;

  return (
    <div>
      <h2 className="mb-4 text-[22px]">{t('catalogue.title')}</h2>
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <table className="table">
          <thead>
            <tr>
              <th>{t('catalogue.name')}</th>
              <th>{t('catalogue.period')}</th>
              <th>{t('catalogue.price')}</th>
              <th>{t('catalogue.seats')}</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((p) => (
              <tr key={p.id} className="rowlink cursor-pointer" onClick={() => setSelectedId(p.id)}>
                <td>
                  <strong>{locale === 'ar' ? p.titleAr : p.titleFr}</strong>
                  <div className="text-[12px] text-[rgba(15,17,21,0.55)]">{p.durationDays} j</div>
                </td>
                <td>{new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(p.departureDate)}</td>
                <td>{p.priceMru.toLocaleString('fr-FR')} MRU</td>
                <td>
                  {p.seatsBooked} / {p.seatsTotal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selected && (
          <aside className="border-2 border-[var(--color-divider)]">
            <div className="border-b-2 border-[var(--color-divider)] p-4 font-sans text-[15px] font-extrabold">
              {t('catalogue.edit')} — {locale === 'ar' ? selected.titleAr : selected.titleFr}
            </div>
            <form action={updatePackageAction} className="flex flex-col gap-3 p-4">
              <input type="hidden" name="id" value={selected.id} />
              <div className="flex gap-3">
                <div className="field flex-1">
                  <label>{t('catalogue.priceMru')}</label>
                  <input className="input bg-white" name="priceMru" type="number" defaultValue={selected.priceMru} />
                </div>
                <div className="field flex-1">
                  <label>{t('catalogue.priceEur')}</label>
                  <input className="input bg-white" name="priceEur" type="number" defaultValue={selected.priceEur} />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="field flex-1">
                  <label>{t('catalogue.seatsTotal')}</label>
                  <input className="input bg-white" name="seatsTotal" type="number" defaultValue={selected.seatsTotal} />
                </div>
                <div className="field flex-1">
                  <label>{t('catalogue.depositPercent')}</label>
                  <input
                    className="input bg-white"
                    name="depositPercent"
                    type="number"
                    defaultValue={selected.depositPercent}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="cursor-pointer border-0 bg-[var(--color-accent)] p-3 text-start font-sans text-[13px] font-extrabold text-white"
              >
                {t('catalogue.save')}
              </button>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
}
