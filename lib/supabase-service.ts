import { createClient } from '@supabase/supabase-js';
import { Template } from './template-matcher';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const getServiceClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey);
};

export async function getAllTemplates(): Promise<Template[]> {
  const supabase = getServiceClient();
  
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    filename: row.filename,
    keywords: row.keywords,
    mode: row.mode,
    mood: row.mood,
    storageUrl: row.storage_url
  }));
}

export async function uploadTemplateAudio(
  file: Buffer,
  filename: string
): Promise<string | null> {
  const supabase = getServiceClient();
  
  const { data, error } = await supabase.storage
    .from('templates')
    .upload(`audio/${filename}`, file, {
      contentType: 'audio/mpeg',
      upsert: false
    });

  if (error) {
    console.error('Error uploading template:', error);
    return null;
  }

  const { data: publicData } = supabase.storage
    .from('templates')
    .getPublicUrl(`audio/${filename}`);

  return publicData.publicUrl;
}

export async function createTemplate(template: {
  filename: string;
  keywords: string;
  mode: string;
  mood: string;
  storageUrl: string;
}): Promise<boolean> {
  const supabase = getServiceClient();
  
  const { error } = await supabase.from('templates').insert({
    filename: template.filename,
    keywords: template.keywords,
    mode: template.mode,
    mood: template.mood,
    storage_url: template.storageUrl
  });

  if (error) {
    console.error('Error creating template:', error);
    return false;
  }

  return true;
}

export async function getUserSubscriptionStatus(userId: string): Promise<{
  isPro: boolean;
  tier: 'free' | 'one-time' | 'unlimited';
  subscriptionId?: string;
}> {
  const supabase = getServiceClient();
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error || !data) {
    return { isPro: false, tier: 'free' };
  }

  const tier = data.tier || 'free';
  return {
    isPro: true,
    tier,
    subscriptionId: data.paddle_subscription_id
  };
}

export async function createOrUpdateSubscription(
  userId: string,
  paddleData: {
    subscriptionId?: string;
    tier: 'one-time' | 'unlimited';
    status: string;
  }
): Promise<boolean> {
  const supabase = getServiceClient();
  
  const { error } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    paddle_subscription_id: paddleData.subscriptionId,
    tier: paddleData.tier,
    status: paddleData.status,
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'user_id'
  });

  if (error) {
    console.error('Error updating subscription:', error);
    return false;
  }

  return true;
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
  const supabase = getServiceClient();
  
  const { data, error } = await supabase.from('roasts').insert({
    user_id: roast.userId,
    story: roast.story,
    mode: roast.mode,
    title: roast.title,
    lyrics: roast.lyrics,
    audio_url: roast.audioUrl,
    is_template: roast.isTemplate,
    created_at: new Date().toISOString()
  }).select('id').single();

  if (error) {
    console.error('Error saving roast:', error);
    return null;
  }

  return data?.id || null;
}

export async function getUserRoasts(userId: string): Promise<any[]> {
  const supabase = getServiceClient();
  
  const { data, error } = await supabase
    .from('roasts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching roasts:', error);
    return [];
  }

  return data || [];
}
