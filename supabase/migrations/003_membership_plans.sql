-- Create membership_plans table
CREATE TABLE membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_value INTEGER NOT NULL CHECK (duration_value > 0),
  duration_unit TEXT NOT NULL CHECK (duration_unit IN ('days', 'months')),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gym plans"
  ON membership_plans FOR SELECT
  USING (gym_id IN (SELECT user_gym_ids()));

CREATE POLICY "Users can insert own gym plans"
  ON membership_plans FOR INSERT
  WITH CHECK (gym_id IN (SELECT user_gym_ids()));

CREATE POLICY "Users can update own gym plans"
  ON membership_plans FOR UPDATE
  USING (gym_id IN (SELECT user_gym_ids()));

-- Indexes
CREATE INDEX idx_plans_gym_active ON membership_plans(gym_id, is_active);

-- Updated_at trigger
CREATE TRIGGER membership_plans_updated_at
  BEFORE UPDATE ON membership_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
