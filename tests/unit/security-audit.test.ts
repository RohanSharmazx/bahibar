import { describe, it, expect } from 'vitest';
import { gymSchema } from '@/lib/validations/gym';
import { paymentSchema, renewalSchema } from '@/lib/validations/payments';
import { addMemberSchema } from '@/lib/validations/members';

describe('Pre-Launch Security & Onboarding Validations', () => {
  it('validates required gym onboarding profile attributes', () => {
    const validOnboarding = gymSchema.safeParse({
      name: 'BahiBar Fitness Club',
      owner_name: 'Harpreet Singh',
      contact_number: '9812345678',
      address: 'Plot 12, Commercial Complex, Sector 21',
    });
    expect(validOnboarding.success).toBe(true);

    const missingGymName = gymSchema.safeParse({
      name: '',
      owner_name: 'Harpreet Singh',
      contact_number: '9812345678',
    });
    expect(missingGymName.success).toBe(false);

    const invalidContactNumber = gymSchema.safeParse({
      name: 'Iron Gym',
      owner_name: 'Harpreet Singh',
      contact_number: 'abc9876543',
    });
    expect(invalidContactNumber.success).toBe(false);
  });

  it('validates payment input constraints and positive amounts', () => {
    const validPayment = paymentSchema.safeParse({
      membership_id: '123e4567-e89b-12d3-a456-426614174000',
      amount: 1500,
      payment_method: 'upi',
      payment_date: '2026-10-18',
      transaction_reference: 'UPI-987654321',
    });
    expect(validPayment.success).toBe(true);

    const zeroAmount = paymentSchema.safeParse({
      membership_id: '123e4567-e89b-12d3-a456-426614174000',
      amount: 0,
      payment_method: 'cash',
      payment_date: '2026-10-18',
    });
    expect(zeroAmount.success).toBe(false);
  });

  it('validates membership renewal inputs', () => {
    const validRenewal = renewalSchema.safeParse({
      plan_id: 'plan-123',
      start_date: '2026-10-18',
      agreed_price: 3000,
      payment_amount: 1500,
      payment_method: 'cash',
    });
    expect(validRenewal.success).toBe(true);

    const negativeAgreed = renewalSchema.safeParse({
      plan_id: 'plan-123',
      start_date: '2026-10-18',
      agreed_price: -500,
    });
    expect(negativeAgreed.success).toBe(false);
  });

  it('validates add member schema', () => {
    const validMember = addMemberSchema.safeParse({
      full_name: 'Rajesh Kumar',
      mobile: '9876543210',
      plan_id: 'plan-abc',
      start_date: '2026-10-18',
      agreed_price: 2500,
      payment_amount: 2500,
      payment_method: 'upi',
    });
    expect(validMember.success).toBe(true);
  });
});
