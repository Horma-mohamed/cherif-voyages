import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentCustomer } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as { active?: boolean };

  const alert = await prisma.priceAlert.findUnique({ where: { id } });
  if (!alert || alert.customerId !== customer.id) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const updated = await prisma.priceAlert.update({
    where: { id },
    data: { active: body.active ?? alert.active }
  });

  return NextResponse.json({ alert: updated });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { id } = await params;
  const alert = await prisma.priceAlert.findUnique({ where: { id } });
  if (!alert || alert.customerId !== customer.id) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  await prisma.priceAlert.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
