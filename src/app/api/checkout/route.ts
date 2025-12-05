import { Checkout } from '@dodopayments/nextjs';
import { NextRequest, NextResponse } from 'next/server';

const rawHandler = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
  environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode',
  type: 'session',
});

export async function POST(request: NextRequest) {
  try {
    // Delegate to official Checkout handler
    const res = await rawHandler(request as any);
    return res as NextResponse;
  } catch (err) {
    // Surface errors as JSON to aid debugging in dev.
    console.error('[Checkout] Error creating session:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
