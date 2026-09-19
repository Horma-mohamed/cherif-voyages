import { prisma } from '@/lib/prisma';

export async function getOverviewStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthBookings, pendingPayments, packages, allBookingsThisMonth] = await Promise.all([
    prisma.booking.findMany({ where: { createdAt: { gte: monthStart } } }),
    prisma.payment.count({ where: { status: 'PENDING' } }),
    prisma.package.findMany(),
    prisma.booking.findMany({ where: { createdAt: { gte: monthStart } }, select: { type: true, totalAmountMru: true } })
  ]);

  const salesThisMonthMru = monthBookings.reduce((sum, b) => sum + b.totalAmountMru, 0);
  const ticketsIssued = monthBookings.filter((b) => b.type === 'FLIGHT' && b.status === 'CONFIRMED').length;
  const pilgrimsRegistered = packages.reduce((sum, p) => sum + p.seatsBooked, 0);

  const mixByType = new Map<string, number>();
  for (const b of allBookingsThisMonth) {
    mixByType.set(b.type, (mixByType.get(b.type) ?? 0) + b.totalAmountMru);
  }
  const mixTotal = Array.from(mixByType.values()).reduce((a, b) => a + b, 0);
  const productMix = Array.from(mixByType.entries()).map(([type, amount]) => ({
    type,
    amount,
    percent: mixTotal > 0 ? Math.round((amount / mixTotal) * 100) : 0
  }));

  const sixWeeksAgo = new Date(now.getTime() - 6 * 7 * 24 * 60 * 60 * 1000);
  const recentBookings = await prisma.booking.findMany({
    where: { createdAt: { gte: sixWeeksAgo } },
    select: { createdAt: true, totalAmountMru: true }
  });

  const weeklyRevenue: { weekStart: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    const amount = recentBookings
      .filter((b) => b.createdAt >= start && b.createdAt < end)
      .reduce((sum, b) => sum + b.totalAmountMru, 0);
    weeklyRevenue.push({ weekStart: start.toISOString().slice(0, 10), amount });
  }

  return {
    salesThisMonthMru,
    ticketsIssued,
    pendingPayments,
    pilgrimsRegistered,
    productMix,
    weeklyRevenue
  };
}

export async function getBookingsList() {
  return prisma.booking.findMany({
    include: {
      customer: true,
      payment: true,
      flightBooking: true,
      packageBooking: { include: { package: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getGroupsList() {
  const packages = await prisma.package.findMany({
    include: {
      bookings: {
        include: {
          booking: {
            include: { customer: true, payment: true, travelers: true }
          }
        }
      }
    },
    orderBy: { departureDate: 'asc' }
  });
  return packages;
}

export async function getPaymentsList() {
  return prisma.payment.findMany({
    include: { booking: { include: { customer: true } } },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getCustomersList() {
  const customers = await prisma.customer.findMany({
    include: { bookings: true },
    orderBy: { createdAt: 'desc' }
  });
  return customers.map((c) => ({
    ...c,
    bookingCount: c.bookings.length,
    totalValueMru: c.bookings.reduce((sum, b) => sum + b.totalAmountMru, 0)
  }));
}

export async function getCataloguePackages() {
  return prisma.package.findMany({ orderBy: { departureDate: 'asc' } });
}

export type OverviewStats = Awaited<ReturnType<typeof getOverviewStats>>;
export type AdminBookingsList = Awaited<ReturnType<typeof getBookingsList>>;
export type AdminGroupsList = Awaited<ReturnType<typeof getGroupsList>>;
export type AdminPaymentsList = Awaited<ReturnType<typeof getPaymentsList>>;
export type AdminCustomersList = Awaited<ReturnType<typeof getCustomersList>>;
export type AdminCataloguePackages = Awaited<ReturnType<typeof getCataloguePackages>>;
