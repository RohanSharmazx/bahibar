// ============================================================
// Database row types — mirror the PostgreSQL schema
// ============================================================

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Gym {
  id: string;
  name: string;
  owner_name: string;
  contact_number: string;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface GymStaff {
  id: string;
  gym_id: string;
  user_id: string;
  role: 'owner' | 'staff';
  created_at: string;
}

export interface MembershipPlan {
  id: string;
  gym_id: string;
  name: string;
  duration_value: number;
  duration_unit: 'days' | 'months';
  price: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  gym_id: string;
  full_name: string;
  mobile: string;
  email: string | null;
  gender: 'male' | 'female' | 'other' | null;
  date_of_birth: string | null;
  address: string | null;
  emergency_contact: string | null;
  notes: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemberMembership {
  id: string;
  gym_id: string;
  member_id: string;
  plan_id: string;
  plan_name_snapshot: string;
  plan_price_snapshot: number;
  agreed_price: number;
  discount_amount: number;
  duration_value_snapshot: number;
  duration_unit_snapshot: 'days' | 'months';
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  gym_id: string;
  member_id: string;
  membership_id: string;
  amount: number;
  payment_method: 'cash' | 'upi' | 'card' | 'other';
  payment_date: string;
  transaction_reference: string | null;
  notes: string | null;
  created_at: string;
}

export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'past_due'
  | 'read_only'
  | 'expired'
  | 'cancelled'
  | 'pilot';

export interface SoftwareSubscription {
  id: string;
  gym_id: string;
  plan_name: string;
  status: SubscriptionStatus;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  trial_started_at?: string;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionHistory {
  id: string;
  subscription_id: string;
  action: string;
  old_status: string | null;
  new_status: string;
  notes: string | null;
  created_at: string;
}

export interface SaasSubscriptionOrder {
  id: string;
  gym_id: string;
  plan_id: 'monthly' | 'annual';
  billing_interval: 'month' | 'year';
  amount: number; // in paise
  currency: string;
  gateway: 'razorpay';
  gateway_order_id: string;
  status: 'created' | 'paid' | 'failed' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface SaasSubscriptionPayment {
  id: string;
  order_id: string;
  gym_id: string;
  gateway_payment_id: string;
  amount: number; // in paise
  currency: string;
  status: 'captured' | 'failed' | 'refunded';
  method?: string;
  signature?: string;
  webhook_event_id?: string;
  payload?: Record<string, unknown>;
  created_at: string;
}

// ============================================================
// Extended / joined types for UI
// ============================================================

/** Member with their current active membership and outstanding balance */
export interface MemberWithMembership extends Member {
  current_membership: MemberMembership | null;
  total_paid: number;
  outstanding_balance: number;
}

/** Dashboard statistics */
export interface DashboardStats {
  total_members: number;
  active_memberships: number;
  expired_memberships: number;
  expiring_soon: number;
  members_with_dues: number;
  today_collections: number;
  monthly_collections: number;
}

/** Payment with member name for display in payment history */
export interface PaymentWithMember extends Payment {
  member_name: string;
  plan_name: string;
  member_mobile?: string | null;
  member_email?: string | null;
  agreed_price?: number;
  start_date?: string;
  end_date?: string;
  outstanding_balance?: number;
}
