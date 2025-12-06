import { NextResponse } from 'next/server';

// Simple server-side helper to construct a Dodo hosted checkout URL.
// We intentionally avoid calling a proprietary Dodo REST shape here so the
// route is resilient: it builds the same hosted checkout URL pattern used
// by the client and attaches `custom_data` (encoded JSON) so webhooks can
// correlate using `purchaseId` and `songId`.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { purchaseId, songId, guestEmail, amount } = body || {};

    const environment = (process.env.NEXT_PUBLIC_DODO_ENVIRONMENT || process.env.DODO_ENVIRONMENT || 'test').toLowerCase();
    const baseUrl = environment === 'production' ? 'https://checkout.dodopayments.com' : 'https://test.checkout.dodopayments.com';

    const productId = process.env.DODO_PRODUCT_ID || process.env.NEXT_PUBLIC_DODO_PRODUCT_ID;
    if (!productId) return NextResponse.json({ error: 'Missing DODO product id' }, { status: 500 });

    const successRedirect = process.env.NEXT_PUBLIC_DODO_PAYMENTS_RETURN_URL || (process.env.NEXT_PUBLIC_URL ? `${process.env.NEXT_PUBLIC_URL}/checkout/success` : '/checkout/success');

    const params = new URL(`${baseUrl}/buy/${productId}`);
    params.searchParams.set('quantity', '1');
    params.searchParams.set('redirect_url', successRedirect);

    try {
      const customData: any = {
        ...(purchaseId ? { purchaseId } : {}),
        ...(songId ? { songId } : {}),
      };
      if (Object.keys(customData).length > 0) {
        params.searchParams.set('custom_data', encodeURIComponent(JSON.stringify(customData)));
      }
    } catch (e) {
      console.debug('[create-checkout] failed to build custom_data', e);
    }

    const checkoutUrl = params.toString();
    const sessionId = typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : String(Date.now());

    return NextResponse.json({ checkoutUrl, sessionId, amount: amount || null });
  } catch (e: any) {
    console.error('[create-checkout] error', e);
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
