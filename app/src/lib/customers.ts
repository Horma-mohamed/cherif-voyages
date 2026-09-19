import type { Prisma } from '@prisma/client';

/**
 * Resolves the Customer row a new booking should attach to: the logged-in
 * customer if there's a session, otherwise an upsert by email so repeat
 * guest bookings accumulate under one record instead of creating a fresh
 * Customer every time (which is what let a signed-up account see its past
 * guest bookings, since they share the same email).
 */
export async function resolveCustomer(
  tx: Prisma.TransactionClient,
  params: {
    sessionCustomerId: string | null;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality?: string;
  }
) {
  if (params.sessionCustomerId) {
    return tx.customer.findUniqueOrThrow({ where: { id: params.sessionCustomerId } });
  }

  const email = params.email.trim().toLowerCase();
  const existing = await tx.customer.findUnique({ where: { email } });
  if (existing) return existing;

  return tx.customer.create({
    data: {
      firstName: params.firstName,
      lastName: params.lastName,
      email,
      phone: params.phone,
      nationality: params.nationality
    }
  });
}
