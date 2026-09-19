import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from '@/i18n/navigation';
import { prisma } from '@/lib/prisma';

const CUSTOMER_COOKIE = 'cv_session_customer';
const ADMIN_COOKIE = 'cv_session_admin';
const SESSION_DAYS = 30;

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt);
  return `${salt.toString('hex')}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scryptAsync(password, salt);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

function expiryDate(): Date {
  return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
}

export async function createCustomerSession(customerId: string) {
  const session = await prisma.session.create({
    data: { customerId, expiresAt: expiryDate() }
  });
  const store = await cookies();
  store.set(CUSTOMER_COOKIE, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: session.expiresAt
  });
}

export async function createAdminSession(adminId: string) {
  const session = await prisma.session.create({
    data: { adminId, expiresAt: expiryDate() }
  });
  const store = await cookies();
  store.set(ADMIN_COOKIE, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: session.expiresAt
  });
}

export async function destroyCustomerSession() {
  const store = await cookies();
  const sessionId = store.get(CUSTOMER_COOKIE)?.value;
  if (sessionId) {
    await prisma.session.deleteMany({ where: { id: sessionId } });
    store.delete(CUSTOMER_COOKIE);
  }
}

export async function destroyAdminSession() {
  const store = await cookies();
  const sessionId = store.get(ADMIN_COOKIE)?.value;
  if (sessionId) {
    await prisma.session.deleteMany({ where: { id: sessionId } });
    store.delete(ADMIN_COOKIE);
  }
}

export async function getCurrentCustomer() {
  const store = await cookies();
  const sessionId = store.get(CUSTOMER_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { customer: true }
  });

  if (!session || !session.customer || session.expiresAt < new Date()) return null;
  return session.customer;
}

export async function getCurrentAdmin() {
  const store = await cookies();
  const sessionId = store.get(ADMIN_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { admin: true }
  });

  if (!session || !session.admin || session.expiresAt < new Date()) return null;
  return session.admin;
}

export async function requireCustomer() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect({ href: '/account/login', locale: await currentLocaleForRedirect() });
  return customer!;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect({ href: '/admin/login', locale: await currentLocaleForRedirect() });
  return admin!;
}

async function currentLocaleForRedirect(): Promise<'fr' | 'ar'> {
  const { getLocale } = await import('next-intl/server');
  const locale = await getLocale();
  return locale === 'ar' ? 'ar' : 'fr';
}
