import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscriptionStatus } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({
        success: true,
        isPro: false,
        tier: 'free'
      });
    }

    const subscription = await getUserSubscriptionStatus(userId);
    
    return NextResponse.json({
      success: true,
      isPro: subscription.isPro,
      tier: subscription.tier,
      userId
    });
  } catch (error) {
    console.error('Error checking pro status:', error);
    return NextResponse.json({
      success: true,
      isPro: false,
      tier: 'free'
    });
  }
}
