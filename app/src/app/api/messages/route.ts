import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentCustomer, getCurrentAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const customer = await getCurrentCustomer();
  if (customer) {
    const messages = await prisma.message.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json({ messages });
  }

  const admin = await getCurrentAdmin();
  if (admin) {
    const customerId = request.nextUrl.searchParams.get('customerId');
    if (!customerId) return NextResponse.json({ error: 'missing_customer_id' }, { status: 400 });
    const messages = await prisma.message.findMany({ where: { customerId }, orderBy: { createdAt: 'asc' } });
    return NextResponse.json({ messages });
  }

  return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { body?: string; customerId?: string };
  if (!body.body?.trim()) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const customer = await getCurrentCustomer();
  if (customer) {
    const message = await prisma.message.create({
      data: { customerId: customer.id, body: body.body, fromAdmin: false }
    });
    return NextResponse.json({ message });
  }

  const admin = await getCurrentAdmin();
  if (admin) {
    if (!body.customerId) return NextResponse.json({ error: 'missing_customer_id' }, { status: 400 });
    const message = await prisma.message.create({
      data: { customerId: body.customerId, body: body.body, fromAdmin: true }
    });
    return NextResponse.json({ message });
  }

  return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
}
