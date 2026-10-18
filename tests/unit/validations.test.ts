import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '@/lib/validations/auth';
import { gymSchema } from '@/lib/validations/gym';
import { planSchema } from '@/lib/validations/plans';
import { addMemberSchema } from '@/lib/validations/members';
import { paymentSchema, renewalSchema } from '@/lib/validations/payments';

describe('Validation Schemas (Zod)', () => {
  it('validates registration passwords matching', () => {
    const valid = registerSchema.safeParse({
      full_name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirm_password: 'password123',
    });
    expect(valid.success).toBe(true);

    const mismatch = registerSchema.safeParse({
      full_name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirm_password: 'different123',
    });
    expect(mismatch.success).toBe(false);
  });

  it('validates gym required fields and phone number', () => {
    const valid = gymSchema.safeParse({
      name: 'Power Gym',
      owner_name: 'Vikram Singh',
      contact_number: '9876543210',
      address: 'Shop 4, Market Road',
    });
    expect(valid.success).toBe(true);

    const invalidPhone = gymSchema.safeParse({
      name: 'Power Gym',
      owner_name: 'Vikram Singh',
      contact_number: '123', // too short
    });
    expect(invalidPhone.success).toBe(false);
  });

  it('validates membership plan constraints', () => {
    const valid = planSchema.safeParse({
      name: 'Quarterly',
      duration_value: 3,
      duration_unit: 'months',
      price: 2000,
      description: 'Standard 3-month plan',
    });
    expect(valid.success).toBe(true);

    const negativePrice = planSchema.safeParse({
      name: 'Invalid',
      duration_value: 3,
      duration_unit: 'months',
      price: -100,
    });
    expect(negativePrice.success).toBe(false);
  });

  it('validates add member schema', () => {
    const valid = addMemberSchema.safeParse({
      full_name: 'Rahul Sharma',
      mobile: '9876543210',
      plan_id: 'plan-uuid-123',
      start_date: '2026-10-17',
      agreed_price: 2000,
      payment_amount: 1000,
      payment_method: 'cash',
    });
    expect(valid.success).toBe(true);
  });

  it('validates payment schema requires positive amount', () => {
    const valid = paymentSchema.safeParse({
      membership_id: 'mem-uuid-123',
      amount: 500,
      payment_method: 'upi',
      payment_date: '2026-10-17',
    });
    expect(valid.success).toBe(true);

    const zeroAmount = paymentSchema.safeParse({
      membership_id: 'mem-uuid-123',
      amount: 0,
      payment_method: 'upi',
      payment_date: '2026-10-17',
    });
    expect(zeroAmount.success).toBe(false);
  });
});
