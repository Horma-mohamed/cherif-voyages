import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentCustomer } from '@/lib/auth';

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const alerts = await prisma.priceAlert.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ alerts });
}

export async function POST(request: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const body = (await request.json()) as { origin?: string; destination?: string; targetPriceMru?: number };
  if (!body.origin || !body.destination || !body.targetPriceMru) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const alert = await prisma.priceAlert.create({
    data: {
      customerId: customer.id,
      origin: body.origin,
      destination: body.destination,
      targetPriceMru: body.targetPriceMru
    }
  });

  return NextResponse.json({ alert });
}
