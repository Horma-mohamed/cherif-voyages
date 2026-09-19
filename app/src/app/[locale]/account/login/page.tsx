'use client';

import { useActionState, useState } from 'react';
import { useTranslations } from 'next-intl';
import { loginCustomerAction, signupCustomerAction, type AuthActionState } from '@/lib/actions/customerAuth';

function Field({ name, label, type = 'text' }: { name: string; label: string; type?: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input className="input bg-white" name={name} type={type} required />
    </div>
  );
}

export default function AccountLoginPage() {
  const t = useTranslations('Auth');
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [loginState, loginAction, loginPending] = useActionState<AuthActionState, FormData>(loginCustomerAction, null);
  const [signupState, signupAction, signupPending] = useActionState<AuthActionState, FormData>(
    signupCustomerAction,
    null
  );

  return (
    <main className="mx-auto max-w-[480px] px-[28px] py-12">
      <h1 className="mb-6 text-[26px]">{t('customerTitle')}</h1>
      <div className="mb-5 flex border border-[var(--color-divider)]">
        <button
          onClick={() => setTab('login')}
          aria-pressed={tab === 'login'}
          className="seg-btn flex-1 cursor-pointer border-0 bg-transparent px-4 py-2.5 font-sans text-[13px] font-semibold text-[var(--color-ink)]"
        >
          {t('loginTab')}
        </button>
        <button
          onClick={() => setTab('signup')}
          aria-pressed={tab === 'signup'}
          className="seg-btn flex-1 cursor-pointer border-0 border-s border-[var(--color-divider)] bg-transparent px-4 py-2.5 font-sans text-[13px] font-semibold text-[var(--color-ink)]"
        >
          {t('signupTab')}
        </button>
      </div>

      {tab === 'login' ? (
        <form action={loginAction} className="flex flex-col gap-3.5">
          <Field name="email" label={t('email')} type="email" />
          <Field name="password" label={t('password')} type="password" />
          {loginState?.error && (
            <p className="text-[13px] text-[var(--color-clay)]">{t(`errors.${loginState.error}`)}</p>
          )}
          <button
            type="submit"
            disabled={loginPending}
            className="mt-1.5 cursor-pointer border-0 bg-[var(--color-accent)] p-3.5 font-sans text-[14px] font-extrabold text-white disabled:opacity-60"
          >
            {t('loginSubmit')}
          </button>
        </form>
      ) : (
        <form action={signupAction} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3.5">
            <Field name="firstName" label={t('firstName')} />
            <Field name="lastName" label={t('lastName')} />
          </div>
          <Field name="email" label={t('email')} type="email" />
          <Field name="phone" label={t('phone')} />
          <Field name="password" label={t('password')} type="password" />
          {signupState?.error && (
            <p className="text-[13px] text-[var(--color-clay)]">{t(`errors.${signupState.error}`)}</p>
          )}
          <button
            type="submit"
            disabled={signupPending}
            className="mt-1.5 cursor-pointer border-0 bg-[var(--color-accent)] p-3.5 font-sans text-[14px] font-extrabold text-white disabled:opacity-60"
          >
            {t('signupSubmit')}
          </button>
        </form>
      )}
    </main>
  );
}
