import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentCustomer } from '@/lib/auth';
import { resolveCustomer } from '@/lib/customers';

interface InquiryBody {
  kind: 'hotel' | 'service';
  service?: 'cars' | 'visa';
  summary: string;
  contact: { firstName: string; lastName: string; email: string; phone: string };
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<InquiryBody>;
  if (!body.kind || !body.summary?.trim() || !body.contact?.email || !body.contact?.phone) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const sessionCustomer = await getCurrentCustomer();
  const primary = body.contact;

  const message = await prisma.$transaction(async (tx) => {
    const customer = await resolveCustomer(tx, {
      sessionCustomerId: sessionCustomer?.id ?? null,
      firstName: primary.firstName || 'Client',
      lastName: primary.lastName || 'Cherif',
      email: primary.email,
      phone: primary.phone
    });

    return tx.message.create({
      data: {
        customerId: customer.id,
        fromAdmin: false,
        body: `[${body.kind!.toUpperCase()}${body.service ? ` · ${body.service}` : ''}] ${body.summary!.trim()}`
      }
    });
  });

  return NextResponse.json({ ok: true, messageId: message.id });
}
