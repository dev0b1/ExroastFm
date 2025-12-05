import { NextResponse } from 'next/server';

export async function GET() {
  // Server-only envs that must be present for Dodo server checkout to work
  const missing: string[] = [];
  if (!process.env.DODO_PAYMENTS_API_KEY) missing.push('DODO_PAYMENTS_API_KEY');
  if (!process.env.DODO_PAYMENTS_RETURN_URL) missing.push('DODO_PAYMENTS_RETURN_URL');
  if (!process.env.DODO_PAYMENTS_ENVIRONMENT) missing.push('DODO_PAYMENTS_ENVIRONMENT');
  if (!process.env.NEXT_PUBLIC_DODO_PRODUCT_ID) missing.push('NEXT_PUBLIC_DODO_PRODUCT_ID');

  return NextResponse.json({ ok: missing.length === 0, missing }, { status: 200 });
}
