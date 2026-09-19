import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface TravelerInput {
  firstName: string;
  lastName: string;
  birthDate?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
}

interface PackageBookingRequestBody {
  slug: string;
  paymentMethod: 'CARD' | 'BANKILY' | 'MASRVI' | 'AGENCY';
  contact: { phone: string; email: string };
  travelers: TravelerInput[];
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<PackageBookingRequestBody>;

  if (!body.slug || !body.travelers?.length || !body.contact?.email || !body.paymentMethod) {
    return NextResponse.json(
      { error: 'invalid_body', message: 'slug, travelers, contact and paymentMethod are required' },
      { status: 400 }
    );
  }

  const travelersCount = body.travelers.length;
  const primary = body.travelers[0];

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const pkg = await tx.package.findUnique({ where: { slug: body.slug! } });
      if (!pkg) {
        throw new Error('package_not_found');
      }
      if (pkg.seatsTotal - pkg.seatsBooked < travelersCount) {
        throw new Error('not_enough_seats');
      }

      await tx.package.update({
        where: { id: pkg.id },
        data: { seatsBooked: { increment: travelersCount } }
      });

      const totalAmountMru = pkg.priceMru * travelersCount;
      const totalAmountEur = pkg.priceEur * travelersCount;

      const customer = await tx.customer.create({
        data: {
          firstName: primary.firstName,
          lastName: primary.lastName,
          email: body.contact!.email,
          phone: body.contact!.phone,
          nationality: primary.nationality
        }
      });

      return tx.booking.create({
        data: {
          type: 'PACKAGE',
          status: 'PENDING',
          totalAmountMru,
          totalAmountEur,
          customerId: customer.id,
          travelers: {
            create: body.travelers!.map((t) => ({
              firstName: t.firstName,
              lastName: t.lastName,
              birthDate: t.birthDate ? new Date(t.birthDate) : undefined,
              nationality: t.nationality,
              passportNumber: t.passportNumber,
              passportExpiry: t.passportExpiry ? new Date(t.passportExpiry) : undefined
            }))
          },
          packageBooking: {
            create: { packageId: pkg.id, travelersCount }
          },
          payment: {
            create: {
              method: body.paymentMethod!,
              status: 'PENDING',
              amountMru: totalAmountMru,
              amountEur: totalAmountEur
            }
          }
        }
      });
    });

    return NextResponse.json({ bookingId: booking.id, status: booking.status });
  } catch (error) {
    if (error instanceof Error && error.message === 'not_enough_seats') {
      return NextResponse.json({ error: 'not_enough_seats' }, { status: 409 });
    }
    if (error instanceof Error && error.message === 'package_not_found') {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    throw error;
  }
}
