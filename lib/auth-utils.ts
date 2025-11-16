import { getUserSubscriptionStatus } from './db-service';

export async function checkProStatus(userId?: string): Promise<{
  isPro: boolean;
  tier: 'free' | 'one-time' | 'unlimited';
  userId?: string;
}> {
  try {
    if (!userId) {
      return { isPro: false, tier: 'free' };
    }

    const subscription = await getUserSubscriptionStatus(userId);
    
    return {
      isPro: subscription.isPro,
      tier: subscription.tier,
      userId
    };
  } catch (error) {
    console.error('Error checking pro status:', error);
    return { isPro: false, tier: 'free' };
  }
}
