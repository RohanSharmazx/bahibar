-- Create member_memberships table
CREATE TABLE member_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES membership_plans(id),
  plan_name_snapshot TEXT NOT NULL,
  plan_price_snapshot NUMERIC(10, 2) NOT NULL,
  agreed_price NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  duration_value_snapshot INTEGER NOT NULL,
  duration_unit_snapshot TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE member_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gym memberships"
  ON member_memberships FOR SELECT
  USING (gym_id IN (SELECT user_gym_ids()));

CREATE POLICY "Users can insert own gym memberships"
  ON member_memberships FOR INSERT
  WITH CHECK (gym_id IN (SELECT user_gym_ids()));

CREATE POLICY "Users can update own gym memberships"
  ON member_memberships FOR UPDATE
  USING (gym_id IN (SELECT user_gym_ids()));

-- Indexes
CREATE INDEX idx_memberships_member_status ON member_memberships(member_id, status);
CREATE INDEX idx_memberships_gym_end_date ON member_memberships(gym_id, end_date);

-- Updated_at trigger
CREATE TRIGGER member_memberships_updated_at
  BEFORE UPDATE ON member_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
