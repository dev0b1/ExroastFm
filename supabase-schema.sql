-- ExRoast.buzz Supabase Database Schema
-- Run this in your Supabase SQL Editor after creating a new project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Templates table for MP3 template library
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  keywords TEXT NOT NULL,
  mode TEXT NOT NULL,
  mood TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table for user pro status
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  dodo_subscription_id TEXT,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'one-time', 'unlimited')),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roasts table for saving user-generated roasts (optional, for pro users)
CREATE TABLE IF NOT EXISTS roasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  story TEXT NOT NULL,
  mode TEXT NOT NULL,
  title TEXT NOT NULL,
  lyrics TEXT,
  audio_url TEXT NOT NULL,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for templates (run this in Supabase Dashboard > Storage)
-- Bucket name: 'templates'
-- Public: true
-- File size limit: 10MB
-- Allowed MIME types: audio/mpeg, audio/mp3

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_templates_mode ON templates(mode);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_roasts_user_id ON roasts(user_id);
CREATE INDEX IF NOT EXISTS idx_roasts_created_at ON roasts(created_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roasts ENABLE ROW LEVEL SECURITY;

-- Templates: Anyone can read, only admins can write (configure admin check as needed)
CREATE POLICY "Templates are viewable by everyone" ON templates
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert templates" ON templates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Subscriptions: Users can only see their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Roasts: Users can see their own roasts
CREATE POLICY "Users can view own roasts" ON roasts
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own roasts" ON roasts
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample template data (optional - for testing)
-- INSERT INTO templates (filename, keywords, mode, mood, storage_url) VALUES
-- ('petty_ghosting.mp3', 'ghost,ghosting,disappeared,vanished,ignored', 'petty', 'savage', 'https://your-bucket-url/petty_ghosting.mp3'),
-- ('savage_cheating.mp3', 'cheat,cheating,cheater,affair,unfaithful', 'savage', 'savage', 'https://your-bucket-url/savage_cheating.mp3');
