/**
 * BahiBar SaaS Subscription Plans Configuration
 * Controlled server-side plan definitions and billing parameters.
 */

export interface SaasPlan {
  id: 'monthly' | 'annual';
  name: string;
  nameHindi: string;
  billingInterval: 'month' | 'year';
  intervalMonths: number;
  pricePaise: number; // In paise for payment gateway (e.g., 24900 = ₹249)
  priceRupees: number;
  savingsPercent?: number;
  description: string;
  descriptionHindi: string;
  features: string[];
}

export const SAAS_CONFIG = {
  currency: 'INR',
  currencySymbol: '₹',
  defaultTrialDays: 30,
  trialReminderThresholdDays: 7,
  gracePeriodDays: 3, // Grace period after expiry before hard read-only lockdown
  supportEmail: 'support@bahibar.com',
  companyName: 'BahiBar Technologies',
} as const;

export const SAAS_PLANS: Record<'monthly' | 'annual', SaasPlan> = {
  monthly: {
    id: 'monthly',
    name: 'Standard Monthly',
    nameHindi: 'मासिक योजना',
    billingInterval: 'month',
    intervalMonths: 1,
    pricePaise: 24900, // ₹249
    priceRupees: 249,
    description: 'Billed monthly. Complete gym management for single facility.',
    descriptionHindi: 'प्रति माह बिल किया गया। पूर्ण जिम रिकॉर्ड प्रबंधन।',
    features: [
      'Unlimited gym members & records',
      'Automated expiry alerts & dues tracking',
      'Instant WhatsApp payment receipts & slips',
      'Offline-capable PDF receipts & exports',
      'Complete data ownership & local backups',
      'Priority support on WhatsApp & Email',
    ],
  },
  annual: {
    id: 'annual',
    name: 'Annual Best Value',
    nameHindi: 'वार्षिक सर्वश्रेष्ठ योजना',
    billingInterval: 'year',
    intervalMonths: 12,
    pricePaise: 249900, // ₹2,499 (~₹208/mo, ~17% savings)
    priceRupees: 2499,
    savingsPercent: 17,
    description: 'Billed annually. Full 12 months with 2 months free.',
    descriptionHindi: 'वार्षिक बिल किया गया। 2 महीने मुफ्त के साथ 12 महीने।',
    features: [
      'Everything in Monthly plan',
      'Full 12 months access (Save ₹489)',
      'Guaranteed pricing lock for 1 year',
      'Free historical data import assistance',
      'Priority feature requests',
    ],
  },
};

export function getSaasPlan(planId: string): SaasPlan | null {
  if (planId === 'monthly') return SAAS_PLANS.monthly;
  if (planId === 'annual') return SAAS_PLANS.annual;
  return null;
}
