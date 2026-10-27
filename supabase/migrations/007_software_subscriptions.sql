-- Create software_subscriptions table (GymManager SaaS subscription)
CREATE TABLE software_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL UNIQUE REFERENCES gyms(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL DEFAULT 'trial',
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'expired', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscription_history table
CREATE TABLE subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES software_subscriptions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE software_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Users can view and insert their gym's initial trial subscription
CREATE POLICY "Users can view own subscription"
  ON software_subscriptions FOR SELECT
  USING (gym_id IN (SELECT user_gym_ids()));

CREATE POLICY "Users can insert own subscription"
  ON software_subscriptions FOR INSERT
  WITH CHECK (gym_id IN (SELECT user_gym_ids()));

CREATE POLICY "Users can view own subscription history"
  ON subscription_history FOR SELECT
  USING (
    subscription_id IN (
      SELECT id FROM software_subscriptions WHERE gym_id IN (SELECT user_gym_ids())
    )
  );

-- Updated_at trigger
CREATE TRIGGER software_subscriptions_updated_at
  BEFORE UPDATE ON software_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
