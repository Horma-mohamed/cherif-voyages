'use server';

import { prisma } from '@/lib/prisma';
import { verifyPassword, createAdminSession, destroyAdminSession } from '@/lib/auth';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import type { AuthActionState } from './customerAuth';

export async function loginAdminAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    return { error: 'invalid_credentials' };
  }

  await createAdminSession(admin.id);
  return redirect({ href: '/admin', locale: await getLocale() as 'fr' | 'ar' });
}

export async function logoutAdminAction() {
  await destroyAdminSession();
  redirect({ href: '/admin/login', locale: await getLocale() as 'fr' | 'ar' });
}
