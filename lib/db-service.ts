import { db } from '@/server/db';
import { templates, subscriptions, roasts, users } from '@/src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Template } from './template-matcher';

export async function getAllTemplates(): Promise<Template[]> {
  try {
    const data = await db
      .select()
      .from(templates)
      .orderBy(desc(templates.createdAt));

    return data.map(row => ({
      id: row.id,
      filename: row.filename,
      keywords: row.keywords,
      mode: row.mode,
      mood: row.mood,
      storageUrl: row.storageUrl
    }));
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
}

export async function createTemplate(template: {
  filename: string;
  keywords: string;
  mode: string;
  mood: string;
  storageUrl: string;
}): Promise<boolean> {
  try {
    await db.insert(templates).values({
      filename: template.filename,
      keywords: template.keywords,
      mode: template.mode,
      mood: template.mood,
      storageUrl: template.storageUrl
    });
    return true;
  } catch (error) {
    console.error('Error creating template:', error);
    return false;
  }
}

export async function getUserSubscriptionStatus(userId: string): Promise<{
  isPro: boolean;
  tier: 'free' | 'one-time' | 'unlimited';
  subscriptionId?: string;
}> {
  try {
    const data = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!data || data.length === 0) {
      return { isPro: false, tier: 'free' };
    }

    const subscription = data[0];
    const tier = (subscription.tier || 'free') as 'free' | 'one-time' | 'unlimited';
    
    return {
      isPro: subscription.status === 'active',
      tier,
      subscriptionId: subscription.paddleSubscriptionId || undefined
    };
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return { isPro: false, tier: 'free' };
  }
}

export async function createOrUpdateSubscription(
  userId: string,
  paddleData: {
    subscriptionId?: string;
    tier: 'one-time' | 'unlimited';
    status: string;
  }
): Promise<boolean> {
  try {
    await db
      .insert(subscriptions)
      .values({
        userId,
        paddleSubscriptionId: paddleData.subscriptionId,
        tier: paddleData.tier,
        status: paddleData.status,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: subscriptions.userId,
        set: {
          paddleSubscriptionId: paddleData.subscriptionId,
          tier: paddleData.tier,
          status: paddleData.status,
          updatedAt: new Date()
        }
      });
    return true;
  } catch (error) {
    console.error('Error updating subscription:', error);
    return false;
  }
}

export async function saveRoast(roast: {
  userId?: string;
  story: string;
  mode: string;
  title: string;
  lyrics: string;
  audioUrl: string;
  isTemplate: boolean;
}): Promise<string | null> {
  try {
    const result = await db
      .insert(roasts)
      .values({
        userId: roast.userId,
        story: roast.story,
        mode: roast.mode,
        title: roast.title,
        lyrics: roast.lyrics,
        audioUrl: roast.audioUrl,
        isTemplate: roast.isTemplate
      })
      .returning({ id: roasts.id });

    return result[0]?.id || null;
  } catch (error) {
    console.error('Error saving roast:', error);
    return null;
  }
}

export async function getUserRoasts(userId: string): Promise<any[]> {
  try {
    const data = await db
      .select()
      .from(roasts)
      .where(eq(roasts.userId, userId))
      .orderBy(desc(roasts.createdAt));

    return data || [];
  } catch (error) {
    console.error('Error fetching roasts:', error);
    return [];
  }
}
