-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only view and update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
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

CREATE POLICY "Owners can delete own gyms"
  ON gyms FOR DELETE
  USING (
    id IN (
      SELECT gym_id FROM gym_staff
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Anyone authenticated can create a gym (onboarding)
CREATE POLICY "Authenticated users can create gyms"
  ON gyms FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Gym staff: users can see their own staff entries
CREATE POLICY "Users can view own staff entries"
  ON gym_staff FOR SELECT
  USING (user_id = auth.uid());

-- Only allow initial owner registration on newly created gyms (with no existing staff)
-- or subsequent staff additions by existing gym owners
CREATE POLICY "Users can insert own staff entries"
  ON gym_staff FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND (
      NOT EXISTS (SELECT 1 FROM gym_staff existing WHERE existing.gym_id = gym_staff.gym_id)
      OR gym_id IN (SELECT user_gym_ids())
    )
  );

-- Indexes
CREATE INDEX idx_gym_staff_user_id ON gym_staff(user_id);
CREATE INDEX idx_gym_staff_gym_id ON gym_staff(gym_id);

-- Updated_at trigger for gyms
CREATE TRIGGER gyms_updated_at
  BEFORE UPDATE ON gyms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
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
-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  membership_id UUID NOT NULL REFERENCES member_memberships(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'upi', 'card', 'other')),
  payment_date DATE NOT NULL,
  transaction_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gym payments"
  ON payments FOR SELECT
  USING (gym_id IN (SELECT user_gym_ids()));

CREATE POLICY "Users can insert own gym payments"
  ON payments FOR INSERT
  WITH CHECK (gym_id IN (SELECT user_gym_ids()));

-- No UPDATE or DELETE policy — payments are immutable records

-- Indexes
CREATE INDEX idx_payments_membership ON payments(membership_id);
CREATE INDEX idx_payments_gym_date ON payments(gym_id, payment_date);
CREATE INDEX idx_payments_member ON payments(member_id);
-- Create software_subscriptions table (GymManager SaaS subscription)
CREATE TABLE software_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL UNIQUE REFERENCES gyms(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL DEFAULT 'trial',
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'expired', 'cancelled', 'pilot')),
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

-- Users can view, insert, and update their gym's subscription
CREATE POLICY "Users can view own subscription"
  ON software_subscriptions FOR SELECT
  USING (gym_id IN (SELECT user_gym_ids()));

CREATE POLICY "Users can insert own subscription"
  ON software_subscriptions FOR INSERT
  WITH CHECK (gym_id IN (SELECT user_gym_ids()));

CREATE POLICY "Users can update own subscription"
  ON software_subscriptions FOR UPDATE
  USING (gym_id IN (SELECT user_gym_ids()))
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

-- Users can only view and mutate their gym's SaaS orders and payments
CREATE POLICY "Users can view own gym saas orders"
  ON saas_subscription_orders FOR SELECT
  USING (gym_id IN (SELECT user_gym_ids()));

CREATE POLICY "Users can insert own gym saas orders"
  ON saas_subscription_orders FOR INSERT
  WITH CHECK (gym_id IN (SELECT user_gym_ids()));

CREATE POLICY "Users can update own gym saas orders"
  ON saas_subscription_orders FOR UPDATE
  USING (gym_id IN (SELECT user_gym_ids()))
  WITH CHECK (gym_id IN (SELECT user_gym_ids()));

CREATE POLICY "Users can view own gym saas payments"
  ON saas_subscription_payments FOR SELECT
  USING (gym_id IN (SELECT user_gym_ids()));

CREATE POLICY "Users can insert own gym saas payments"
  ON saas_subscription_payments FOR INSERT
  WITH CHECK (gym_id IN (SELECT user_gym_ids()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saas_orders_gym ON saas_subscription_orders(gym_id);
CREATE INDEX IF NOT EXISTS idx_saas_orders_gateway ON saas_subscription_orders(gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_saas_payments_gym ON saas_subscription_payments(gym_id);
CREATE INDEX IF NOT EXISTS idx_saas_payments_gateway ON saas_subscription_payments(gateway_payment_id);

-- Performance Compound Tenant Indexes
CREATE INDEX IF NOT EXISTS idx_member_memberships_gym_member ON member_memberships(gym_id, member_id);
CREATE INDEX IF NOT EXISTS idx_payments_gym_member ON payments(gym_id, member_id);

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
