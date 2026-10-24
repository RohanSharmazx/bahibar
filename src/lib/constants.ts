export const APP_NAME = 'BahiBar';
export const APP_DESCRIPTION = 'Gym records, sorted.';
export const APP_TAGLINE = 'Gym records, sorted.';

export const CURRENCY = {
  code: 'INR',
  symbol: '₹',
  locale: 'en-IN',
} as const;

export const DATE_FORMAT = {
  display: 'dd/MM/yyyy',
  displayLong: 'dd MMMM yyyy',
  input: 'yyyy-MM-dd', // HTML date input format
} as const;

export const DURATION_UNITS = {
  days: 'days',
  months: 'months',
} as const;

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'other', label: 'Other' },
] as const;

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const;

export const MEMBERSHIP_STATUS = {
  active: 'active',
  expired: 'expired',
  cancelled: 'cancelled',
} as const;

export const SUBSCRIPTION_STATUS = {
  trial: 'trial',
  active: 'active',
  expired: 'expired',
  cancelled: 'cancelled',
} as const;

export const DEFAULT_TRIAL_DAYS = 30;

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Members', href: '/members', icon: 'Users' },
  { label: 'Plans', href: '/plans', icon: 'CreditCard' },
  { label: 'Payments', href: '/payments', icon: 'IndianRupee' },
] as const;

export const MORE_NAV_ITEMS = [
  { label: 'Export Data', href: '/export', icon: 'Download' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
] as const;
