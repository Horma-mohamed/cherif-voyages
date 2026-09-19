import { NextResponse } from 'next/server';
import { listPackages } from '@/lib/packages';

export async function GET() {
  return NextResponse.json({ packages: await listPackages() });
}
