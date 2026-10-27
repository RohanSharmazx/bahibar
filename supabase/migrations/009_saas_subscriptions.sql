-- Create SaaS subscription orders table (tracks BahiBar software subscription orders)
CREATE TABLE IF NOT EXISTS saas_subscription_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('monthly', 'annual')),
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('month', 'year')),
  amount INTEGER NOT NULL CHECK (amount > 0), -- in paise (e.g. 24900 = ₹249)
  currency TEXT NOT NULL DEFAULT 'INR',
  gateway TEXT NOT NULL DEFAULT 'razorpay',
  gateway_order_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create SaaS subscription payments table (gateway transaction audit ledger)
CREATE TABLE IF NOT EXISTS saas_subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES saas_subscription_orders(id) ON DELETE SET NULL,
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  gateway_payment_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL CHECK (amount > 0), -- in paise
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'captured' CHECK (status IN ('captured', 'failed', 'refunded')),
  method TEXT,
  signature TEXT,
  webhook_event_id TEXT UNIQUE,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE saas_subscription_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_subscription_payments ENABLE ROW LEVEL SECURITY;

-- Users can only view their gym's SaaS orders and payments
CREATE POLICY "Users can view own gym saas orders"
  ON saas_subscription_orders FOR SELECT
  USING (gym_id IN (SELECT user_gym_ids()));

CREATE POLICY "Users can insert own gym saas orders"
  ON saas_subscription_orders FOR INSERT
  WITH CHECK (gym_id IN (SELECT user_gym_ids()));

CREATE POLICY "Users can view own gym saas payments"
  ON saas_subscription_payments FOR SELECT
  USING (gym_id IN (SELECT user_gym_ids()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saas_orders_gym ON saas_subscription_orders(gym_id);
CREATE INDEX IF NOT EXISTS idx_saas_orders_gateway ON saas_subscription_orders(gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_saas_payments_gym ON saas_subscription_payments(gym_id);
CREATE INDEX IF NOT EXISTS idx_saas_payments_gateway ON saas_subscription_payments(gateway_payment_id);
