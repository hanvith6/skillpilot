-- SkillMate AI - Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor to set up the database

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  credits INTEGER NOT NULL DEFAULT 100,
  picture TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES profiles(id),
  total_referrals INTEGER DEFAULT 0,
  referral_credits_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup via database trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'SKILLMATE-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Generation history
CREATE TABLE IF NOT EXISTS generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  credits_used INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_user ON generation_history(user_id, created_at DESC);

-- Payment transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  payment_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL,
  package_id TEXT NOT NULL,
  credits INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'initiated',
  provider TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_session ON payment_transactions(session_id);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES profiles(id),
  referred_user_name TEXT,
  referral_code TEXT NOT NULL,
  credits_awarded INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can read their own data
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users read own history"
  ON generation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users read own payments"
  ON payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users read own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id);

-- Service role (used by backend) bypasses RLS automatically
-- No additional policies needed for backend operations
