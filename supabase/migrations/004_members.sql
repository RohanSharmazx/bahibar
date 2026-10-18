-- Create members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other') OR gender IS NULL),
  date_of_birth DATE,
  address TEXT,
  emergency_contact TEXT,
  notes TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (gym_id, mobile)
);

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gym members"
  ON members FOR SELECT
  USING (gym_id IN (SELECT user_gym_ids()));

CREATE POLICY "Users can insert own gym members"
  ON members FOR INSERT
  WITH CHECK (gym_id IN (SELECT user_gym_ids()));

CREATE POLICY "Users can update own gym members"
  ON members FOR UPDATE
  USING (gym_id IN (SELECT user_gym_ids()));

-- Indexes
CREATE INDEX idx_members_gym_archived ON members(gym_id, is_archived);
CREATE INDEX idx_members_gym_mobile ON members(gym_id, mobile);
CREATE INDEX idx_members_gym_name ON members(gym_id, full_name);

-- Updated_at trigger
CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
