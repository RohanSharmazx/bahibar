import { z } from 'zod';

export const memberSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  mobile: z
    .string()
    .min(1, 'Mobile number is required')
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number must be less than 15 digits')
    .regex(/^[+]?[0-9\s-]+$/, 'Please enter a valid mobile number'),
  email: z
    .string()
    .email('Please enter a valid email')
    .optional()
    .or(z.literal('')),
  gender: z
    .enum(['male', 'female', 'other'])
    .optional()
    .or(z.literal('')),
  date_of_birth: z
    .string()
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  emergency_contact: z
    .string()
    .max(100, 'Emergency contact must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
});

export const addMemberSchema = memberSchema.extend({
  plan_id: z
    .string()
    .min(1, 'Please select a membership plan'),
  start_date: z
    .string()
    .min(1, 'Start date is required'),
  agreed_price: z
    .number({ required_error: 'Price is required', invalid_type_error: 'Price must be a number' })
    .min(0, 'Price cannot be negative'),
  payment_amount: z
    .number({ invalid_type_error: 'Payment must be a number' })
    .min(0, 'Payment cannot be negative')
    .optional(),
  payment_method: z
    .enum(['cash', 'upi', 'card', 'other'])
    .optional(),
});

export type MemberInput = z.infer<typeof memberSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
