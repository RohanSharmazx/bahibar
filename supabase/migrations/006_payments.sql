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
