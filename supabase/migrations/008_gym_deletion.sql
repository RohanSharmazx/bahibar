-- Migration 008: Add Row Level Security policy for Gym Workspace Deletion
-- Allows authenticated owners to delete only their own gym workspace.
-- All child tables (gym_staff, members, member_memberships, payments, membership_plans, software_subscriptions)
-- will cascade delete automatically due to ON DELETE CASCADE foreign key constraints.

CREATE POLICY "Owners can delete own gyms"
  ON gyms FOR DELETE
  USING (
    id IN (
      SELECT gym_id FROM gym_staff
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );
