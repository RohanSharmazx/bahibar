-- Create gyms table
CREATE TABLE gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create gym_staff junction table
CREATE TABLE gym_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (gym_id, user_id)
);

-- Helper function: get gym IDs the current user belongs to
CREATE OR REPLACE FUNCTION user_gym_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT gym_id FROM gym_staff WHERE user_id = auth.uid();
$$;

-- Enable RLS
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_staff ENABLE ROW LEVEL SECURITY;

-- Gyms: users can only see/edit gyms they belong to
CREATE POLICY "Users can view own gyms"
  ON gyms FOR SELECT
  USING (id IN (SELECT user_gym_ids()));

CREATE POLICY "Users can update own gyms"
  ON gyms FOR UPDATE
  USING (id IN (SELECT user_gym_ids()));

-- Anyone authenticated can create a gym (onboarding)
CREATE POLICY "Authenticated users can create gyms"
  ON gyms FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Gym staff: users can see their own staff entries
CREATE POLICY "Users can view own staff entries"
  ON gym_staff FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own staff entries"
  ON gym_staff FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_gym_staff_user_id ON gym_staff(user_id);
CREATE INDEX idx_gym_staff_gym_id ON gym_staff(gym_id);

-- Updated_at trigger for gyms
CREATE TRIGGER gyms_updated_at
  BEFORE UPDATE ON gyms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
