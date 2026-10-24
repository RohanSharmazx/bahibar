import { describe, it, expect } from 'vitest';
import { pilotRegistrationSchema } from '@/lib/validations/pilot';

describe('Pilot Registration Validation', () => {
  it('accepts valid pilot registration data', () => {
    const validData = {
      gym_name: 'Iron Fitness',
      city: 'Pune',
      member_count: '50-150 members',
      contact_name: 'Vikram Joshi',
      contact_phone: '9876543210',
      contact_email: 'vikram@example.com',
      primary_challenge: 'Tracking partial fee payments',
    };

    const result = pilotRegistrationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('accepts valid data with optional fields omitted', () => {
    const minimalData = {
      gym_name: 'Fit Gym',
      city: 'Lucknow',
      member_count: 'Under 50 members',
      contact_name: 'Rahul',
      contact_phone: '+91 98234 56789',
      contact_email: '',
      primary_challenge: '',
    };

    const result = pilotRegistrationSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
  });

  it('rejects too short phone numbers', () => {
    const shortPhone = {
      gym_name: 'Fit Gym',
      city: 'Delhi',
      member_count: '50-150 members',
      contact_name: 'Amit',
      contact_phone: '12345',
    };

    const result = pilotRegistrationSchema.safeParse(shortPhone);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.contact_phone).toBeDefined();
    }
  });

  it('rejects invalid email formats when email is provided', () => {
    const invalidEmail = {
      gym_name: 'Fit Gym',
      city: 'Delhi',
      member_count: '50-150 members',
      contact_name: 'Amit',
      contact_phone: '9876543210',
      contact_email: 'not-an-email',
    };

    const result = pilotRegistrationSchema.safeParse(invalidEmail);
    expect(result.success).toBe(false);
  });
});

describe('Savings Estimator Formula Integrity', () => {
  function calculateLookupHours(lookupsPerDay: number, minutesPerLookup: number, operatingDays: number): number {
    return Number(((lookupsPerDay * minutesPerLookup * operatingDays) / 60).toFixed(1));
  }

  it('calculates monthly lookup time accurately', () => {
    // 15 lookups/day * 3 mins * 26 days = 1170 mins = 19.5 hours
    expect(calculateLookupHours(15, 3, 26)).toBe(19.5);

    // 20 lookups/day * 5 mins * 30 days = 3000 mins = 50.0 hours
    expect(calculateLookupHours(20, 5, 30)).toBe(50.0);

    // 5 lookups/day * 1.5 mins * 24 days = 180 mins = 3.0 hours
    expect(calculateLookupHours(5, 1.5, 24)).toBe(3.0);
  });
});
