-- Receipt Scanner Database Schema
-- Run this in your Supabase SQL editor

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  receipts_this_month INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipts table
CREATE TABLE receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT,
  vendor VARCHAR(255),
  date DATE,
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table  
CREATE TABLE subscriptions (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due')),
  current_period_end TIMESTAMP WITH TIME ZONE
);

-- Indexes for better performance
CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_date ON receipts(date DESC);
CREATE INDEX idx_receipts_vendor ON receipts(vendor);
CREATE INDEX idx_users_email ON users(email);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Users can only see their own receipts
CREATE POLICY "Users can view own receipts" ON receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own receipts" ON receipts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own receipts" ON receipts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own receipts" ON receipts FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Function to reset monthly receipt count (run monthly via cron)
CREATE OR REPLACE FUNCTION reset_monthly_receipt_count()
RETURNS void AS $$
BEGIN
  UPDATE users SET receipts_this_month = 0 WHERE subscription_tier = 'free';
END;
$$ LANGUAGE plpgsql;

-- Example data for development (optional)
-- INSERT INTO users (email, password_hash, subscription_tier) VALUES 
-- ('test@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewRuWVH.L0fGCq.2', 'free'); -- password: 'password123'
