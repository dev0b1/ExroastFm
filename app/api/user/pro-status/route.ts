import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserSubscriptionStatus } from '@/lib/supabase-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({
        success: true,
        isPro: false,
        tier: 'free'
      });
    }

    const subscription = await getUserSubscriptionStatus(user.id);
    
    return NextResponse.json({
      success: true,
      isPro: subscription.isPro,
      tier: subscription.tier,
      userId: user.id
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
