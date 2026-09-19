import { prisma } from '@/lib/prisma';

export async function getAccountData(customerId: string) {
  const [customer, bookings, priceAlerts, messages] = await Promise.all([
    prisma.customer.findUniqueOrThrow({ where: { id: customerId } }),
    prisma.booking.findMany({
      where: { customerId },
      include: {
        flightBooking: true,
        packageBooking: { include: { package: true } },
        payment: true,
        travelers: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.priceAlert.findMany({ where: { customerId }, orderBy: { createdAt: 'desc' } }),
    prisma.message.findMany({ where: { customerId }, orderBy: { createdAt: 'asc' } })
  ]);

  const now = new Date();

  const upcoming = bookings
    .filter((b) => b.status !== 'CANCELLED')
    .map((b) => ({
      booking: b,
      departureDate: b.flightBooking?.departureDate ?? b.packageBooking?.package.departureDate ?? null
    }))
    .filter((x) => x.departureDate && x.departureDate >= now)
    .sort((a, b) => a.departureDate!.getTime() - b.departureDate!.getTime())[0]?.booking ?? null;

  const travelers = bookings.flatMap((b) =>
    b.travelers.map((t) => ({ ...t, bookingId: b.id, bookingType: b.type }))
  );

  const renewalThreshold = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
  const documentsToRenew = travelers.filter((t) => t.passportExpiry && t.passportExpiry < renewalThreshold);

  const loyaltyPoints = Math.floor(
    bookings.filter((b) => b.status === 'CONFIRMED').reduce((sum, b) => sum + b.totalAmountMru, 0) / 1000
  );

  const activeOmra =
    bookings.find(
      (b) =>
        b.type === 'PACKAGE' &&
        b.status !== 'CANCELLED' &&
        !!b.packageBooking &&
        b.packageBooking.package.departureDate >= now
    ) ?? null;

  return { customer, bookings, priceAlerts, messages, upcoming, travelers, documentsToRenew, loyaltyPoints, activeOmra };
}

export type AccountData = Awaited<ReturnType<typeof getAccountData>>;
