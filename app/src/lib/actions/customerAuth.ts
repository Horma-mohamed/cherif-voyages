'use server';

import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, createCustomerSession, destroyCustomerSession } from '@/lib/auth';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';

export type AuthActionState = { error?: string } | null;

export async function signupCustomerAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const firstName = String(formData.get('firstName') ?? '').trim();
  const lastName = String(formData.get('lastName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const phone = String(formData.get('phone') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!firstName || !lastName || !email || !password) {
    return { error: 'missing_fields' };
  }
  if (password.length < 8) {
    return { error: 'password_too_short' };
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing?.passwordHash) {
    return { error: 'email_taken' };
  }

  const passwordHash = await hashPassword(password);
  const customer = existing
    ? await prisma.customer.update({ where: { id: existing.id }, data: { passwordHash, firstName, lastName, phone } })
    : await prisma.customer.create({ data: { firstName, lastName, email, phone, passwordHash } });

  await createCustomerSession(customer.id);
  return redirect({ href: '/account', locale: await getLocale() as 'fr' | 'ar' });
}

export async function loginCustomerAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer?.passwordHash || !(await verifyPassword(password, customer.passwordHash))) {
    return { error: 'invalid_credentials' };
  }

  await createCustomerSession(customer.id);
  return redirect({ href: '/account', locale: await getLocale() as 'fr' | 'ar' });
}

export async function logoutCustomerAction() {
  await destroyCustomerSession();
  redirect({ href: '/', locale: await getLocale() as 'fr' | 'ar' });
}
