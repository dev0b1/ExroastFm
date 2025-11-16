import { createClient } from './supabase/client';
import { getUserSubscriptionStatus } from './supabase-service';

export async function checkProStatus(): Promise<{
  isPro: boolean;
  tier: 'free' | 'one-time' | 'unlimited';
  userId?: string;
}> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { isPro: false, tier: 'free' };
    }

    const subscription = await getUserSubscriptionStatus(user.id);
    
    return {
      isPro: subscription.isPro,
      tier: subscription.tier,
      userId: user.id
    };
  } catch (error) {
    console.error('Error checking pro status:', error);
    return { isPro: false, tier: 'free' };
  }
}
