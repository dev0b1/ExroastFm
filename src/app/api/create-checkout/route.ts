import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { songs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getById } from '@/lib/premium-songs';

// Server-side helper to construct a Dodo hosted checkout URL.
// Builds the checkout URL with custom_data for webhook correlation.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { songId, premadeId, guestEmail, amount, method } = body || {};

    // Environment setup
    const environment = (
      process.env.NEXT_PUBLIC_DODO_ENVIRONMENT || 
      process.env.DODO_ENVIRONMENT || 
      'test'
    ).toLowerCase();
    
    const baseUrl = environment === 'production' 
      ? 'https://checkout.dodopayments.com' 
      : 'https://test.checkout.dodopayments.com';

    // Get product ID
    const productId = process.env.DODO_PRODUCT_ID || process.env.NEXT_PUBLIC_DODO_PRODUCT_ID;
    if (!productId) {
      console.error('[create-checkout] Missing DODO_PRODUCT_ID');
      return NextResponse.json({ error: 'Missing DODO product id' }, { status: 500 });
    }

    // Success redirect URL (default to the app domain `exroast.buzz` if no env override)
    let successRedirect = process.env.NEXT_PUBLIC_DODO_PAYMENTS_RETURN_URL ||
      (process.env.NEXT_PUBLIC_URL ? `${process.env.NEXT_PUBLIC_URL}/checkout/success` : 'https://exroast.buzz/checkout/success');

    // If a songId was provided, try to translate template preview song ids
    // to a premade manifest id so the Success page can immediately return
    // the premade mp4 without waiting for webhooks. Fall back to the raw
    // songId when translation isn't possible.
    // prefer explicit premadeId if provided (frontend should send premadeId for premade purchases)
    let redirectSongId: string | null = premadeId ? String(premadeId) : (songId ? String(songId) : null);
    if (premadeId || songId) {
      try {
        // If premadeId is explicitly provided, use as-is. Otherwise attempt to
        // translate a DB template preview songId into a premade manifest id.
        if (!premadeId && songId) {
          try {
            const rows = await db.select().from(songs).where(eq(songs.id, String(songId))).limit(1);
            if (rows && rows.length > 0) {
              const s = rows[0];
              if (s.isTemplate && s.previewUrl) {
                const match = getById(String(s.previewUrl)) || getById(String(s.previewUrl).split('/').pop() || '');
                if (match) {
                  redirectSongId = match.filename || match.id || match.storageUrl || redirectSongId;
                }
              }
            }
          } catch (e) {
            console.warn('[create-checkout] preview->manifest translation failed', e);
          }
        }

        const url = new URL(successRedirect);
        if (redirectSongId) url.searchParams.set('songId', redirectSongId);
        successRedirect = url.toString();
      } catch (e) {
        console.warn('[create-checkout] failed to append songId to redirect URL', e);
      }
    }

    // ✅ FIX: Correct URL construction syntax
    const params = new URL(`${baseUrl}/buy/${productId}`);
    
    params.searchParams.set('quantity', '1');
    params.searchParams.set('redirect_url', successRedirect);

    // Add email if provided
    if (guestEmail) {
      params.searchParams.set('email', guestEmail);
    }

    // ✅ FIX: Add payment method parameter
    if (method) {
      // Map method names to Dodo's expected format
      const methodMap: Record<string, string> = {
        'apple_pay': 'apple_pay',
        'google_pay': 'google_pay',
        'paypal': 'paypal',
        'card': 'card'
      };
      
      const dodoMethod = methodMap[method] || method;
      params.searchParams.set('payment_method', dodoMethod);
    }

    // Add custom data for webhook correlation
    try {
      const customData: any = {};
      
      // Persist premadeId explicitly if provided, otherwise include resolved songId
      if (premadeId) customData.premadeId = String(premadeId);
      else if (songId) customData.songId = redirectSongId || songId;
      if (guestEmail) customData.guestEmail = guestEmail;
      
      if (Object.keys(customData).length > 0) {
        params.searchParams.set('custom_data', JSON.stringify(customData));
      }
    } catch (e) {
      console.error('[create-checkout] Failed to build custom_data', e);
    }

    const checkoutUrl = params.toString();
    
    // Generate session ID for tracking
    const sessionId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('[create-checkout] Created checkout URL:', {
      sessionId,
      productId,
      method,
      hasSongId: !!songId,
    });

    return NextResponse.json({ 
      checkoutUrl, 
      sessionId, 
      redirectSongId: redirectSongId || null,
      amount: amount || null 
    });

  } catch (e: any) {
    console.error('[create-checkout] Error:', e);
    return NextResponse.json({ 
      error: e?.message || 'Failed to create checkout' 
    }, { status: 500 });
  }
}