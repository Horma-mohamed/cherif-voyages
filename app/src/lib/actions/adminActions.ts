'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function markBookingPaidAction(formData: FormData) {
  await requireAdmin();
  const bookingId = String(formData.get('bookingId') ?? '');
  if (!bookingId) return;

  await prisma.$transaction([
    prisma.payment.updateMany({ where: { bookingId }, data: { status: 'PAID' } }),
    prisma.booking.update({ where: { id: bookingId }, data: { status: 'CONFIRMED' } })
  ]);
}

export async function cancelBookingAction(formData: FormData) {
  await requireAdmin();
  const bookingId = String(formData.get('bookingId') ?? '');
  if (!bookingId) return;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { packageBooking: true }
  });
  if (!booking || booking.status === 'CANCELLED') return;

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED' } });
    if (booking.packageBooking) {
      await tx.package.update({
        where: { id: booking.packageBooking.packageId },
        data: { seatsBooked: { decrement: booking.packageBooking.travelersCount } }
      });
    }
  });
}

export async function updatePackageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  await prisma.package.update({
    where: { id },
    data: {
      priceMru: Number(formData.get('priceMru')),
      priceEur: Number(formData.get('priceEur')),
      seatsTotal: Number(formData.get('seatsTotal')),
      depositPercent: Number(formData.get('depositPercent'))
    }
  });
}
