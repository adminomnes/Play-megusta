-- ============================================
-- Premium News Features - Database Schema
-- ============================================
-- Execute this in Supabase SQL Editor

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT false,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly')) NOT NULL,
  topics TEXT[] NOT NULL,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  unsubscribe_token TEXT UNIQUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(active);
CREATE INDEX IF NOT EXISTS idx_newsletter_frequency ON newsletter_subscribers(frequency, active);

-- Newsletter Logs Table
CREATE TABLE IF NOT EXISTS newsletter_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  frequency TEXT NOT NULL,
  topics TEXT[] NOT NULL,
  status TEXT NOT NULL,
  meta JSONB
);

CREATE INDEX IF NOT EXISTS idx_newsletter_logs_sent ON newsletter_logs(sent_at DESC);

-- Push Subscriptions Table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  topics TEXT[] NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_sent_at TIMESTAMPTZ,
  daily_count INTEGER DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_active ON push_subscriptions(active);

-- Enable Row Level Security (RLS)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies (allow service role full access)
CREATE POLICY "Service role full access" ON newsletter_subscribers FOR ALL USING (true);
CREATE POLICY "Service role full access" ON newsletter_logs FOR ALL USING (true);
CREATE POLICY "Service role full access" ON push_subscriptions FOR ALL USING (true);
