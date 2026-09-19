'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { loginAdminAction } from '@/lib/actions/adminAuth';
import type { AuthActionState } from '@/lib/actions/customerAuth';

export default function AdminLoginPage() {
  const t = useTranslations('Auth');
  const [state, action, pending] = useActionState<AuthActionState, FormData>(loginAdminAction, null);

  return (
    <main className="mx-auto max-w-[480px] px-[28px] py-12">
      <h1 className="mb-6 text-[26px]">{t('adminTitle')}</h1>
      <form action={action} className="flex flex-col gap-3.5">
        <div className="field">
          <label>{t('email')}</label>
          <input className="input bg-white" name="email" type="email" required />
        </div>
        <div className="field">
          <label>{t('password')}</label>
          <input className="input bg-white" name="password" type="password" required />
        </div>
        {state?.error && <p className="text-[13px] text-[var(--color-clay)]">{t(`errors.${state.error}`)}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-1.5 cursor-pointer border-0 bg-[var(--color-accent)] p-3.5 font-sans text-[14px] font-extrabold text-white disabled:opacity-60"
        >
          {t('loginSubmit')}
        </button>
      </form>
    </main>
  );
}
