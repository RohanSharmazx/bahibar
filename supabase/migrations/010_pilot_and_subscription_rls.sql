-- Create pilot_registrations table for landing page interest capture
CREATE TABLE IF NOT EXISTS pilot_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_name TEXT NOT NULL,
  city TEXT NOT NULL,
  member_count TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  primary_challenge TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE pilot_registrations ENABLE ROW LEVEL SECURITY;

-- Allow public / unauthenticated gym owners to submit pilot registration inquiries
CREATE POLICY "Public can submit pilot registrations"
  ON pilot_registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Updated_at trigger for pilot registrations
CREATE TRIGGER pilot_registrations_updated_at
  BEFORE UPDATE ON pilot_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add missing RLS policies for software subscriptions and SaaS orders
-- 1. Users can update their own gym's software subscription
CREATE POLICY "Users can update own subscription"
  ON software_subscriptions FOR UPDATE
  USING (gym_id IN (SELECT user_gym_ids()))
  WITH CHECK (gym_id IN (SELECT user_gym_ids()));

-- 2. Users can update their own gym's SaaS orders (e.g. status transition from created to paid)
CREATE POLICY "Users can update own gym saas orders"
  ON saas_subscription_orders FOR UPDATE
  USING (gym_id IN (SELECT user_gym_ids()))
  WITH CHECK (gym_id IN (SELECT user_gym_ids()));

-- 3. Users can insert SaaS subscription payment records when verified
CREATE POLICY "Users can insert own gym saas payments"
  ON saas_subscription_payments FOR INSERT
  WITH CHECK (gym_id IN (SELECT user_gym_ids()));
