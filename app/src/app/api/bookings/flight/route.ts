import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHoldOrder, DuffelPassengerInput } from '@/lib/duffel';

interface TravelerInput {
  offerPassengerId: string;
  title: 'mr' | 'mrs' | 'ms' | 'miss' | 'dr';
  gender: 'm' | 'f';
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
}

interface FlightBookingRequestBody {
  offerId: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  cabinClass: string;
  priceMru: number;
  priceEur: number;
  paymentMethod: 'CARD' | 'BANKILY' | 'MASRVI' | 'AGENCY';
  contact: { phone: string; email: string };
  travelers: TravelerInput[];
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<FlightBookingRequestBody>;

  if (!body.offerId || !body.travelers?.length || !body.contact?.email || !body.paymentMethod) {
    return NextResponse.json(
      { error: 'invalid_body', message: 'offerId, travelers, contact and paymentMethod are required' },
      { status: 400 }
    );
  }

  const primary = body.travelers[0];

  const booking = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.create({
      data: {
        firstName: primary.firstName,
        lastName: primary.lastName,
        email: body.contact!.email,
        phone: body.contact!.phone,
        nationality: primary.nationality
      }
    });

    const created = await tx.booking.create({
      data: {
        type: 'FLIGHT',
        status: 'PENDING',
        totalAmountMru: body.priceMru ?? 0,
        totalAmountEur: body.priceEur ?? 0,
        customerId: customer.id,
        travelers: {
          create: body.travelers!.map((t) => ({
            title: t.title,
            gender: t.gender,
            firstName: t.firstName,
            lastName: t.lastName,
            birthDate: t.birthDate ? new Date(t.birthDate) : undefined,
            nationality: t.nationality,
            passportNumber: t.passportNumber,
            passportExpiry: t.passportExpiry ? new Date(t.passportExpiry) : undefined
          }))
        },
        flightBooking: {
          create: {
            duffelOfferId: body.offerId!,
            origin: body.origin!,
            destination: body.destination!,
            departureDate: new Date(body.departureDate!),
            returnDate: body.returnDate ? new Date(body.returnDate) : undefined,
            cabinClass: body.cabinClass ?? 'economy',
            priceMru: body.priceMru ?? 0,
            priceEur: body.priceEur ?? 0
          }
        },
        payment: {
          create: {
            method: body.paymentMethod!,
            status: 'PENDING',
            amountMru: body.priceMru ?? 0,
            amountEur: body.priceEur ?? 0
          }
        }
      },
      include: { flightBooking: true, payment: true }
    });

    return created;
  });

  let duffelWarning: string | null = null;
  try {
    const passengers: DuffelPassengerInput[] = body.travelers.map((t) => ({
      offerPassengerId: t.offerPassengerId,
      title: t.title,
      gender: t.gender,
      givenName: t.firstName,
      familyName: t.lastName,
      bornOn: t.birthDate,
      email: body.contact!.email,
      phoneNumber: body.contact!.phone
    }));

    const order = await createHoldOrder({ offerId: body.offerId, passengers });

    await prisma.flightBooking.update({
      where: { bookingId: booking.id },
      data: { duffelOrderId: order.orderId }
    });
  } catch (error) {
    // The Duffel order couldn't be created (offer expired, network issue, etc).
    // The booking is still recorded so the agency can complete it manually —
    // we don't want to lose the customer's request over a Duffel-side failure.
    duffelWarning = error instanceof Error ? error.message : 'Unknown Duffel error';
  }

  return NextResponse.json({
    bookingId: booking.id,
    status: booking.status,
    duffelWarning
  });
}
