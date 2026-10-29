-- Migration 011: Add compound indexes for multi-tenant query performance
-- Speeds up tenant-scoped queries filtering memberships and payments by gym_id and member_id

CREATE INDEX IF NOT EXISTS idx_member_memberships_gym_member ON member_memberships(gym_id, member_id);
CREATE INDEX IF NOT EXISTS idx_payments_gym_member ON payments(gym_id, member_id);
