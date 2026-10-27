import { z } from 'zod';

export const memberSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  mobile: z
    .string()
    .trim()
    .min(1, 'Mobile number is required')
    .refine((val) => {
      const digits = val.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 15;
    }, 'Mobile number must contain at least 10 digits'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .optional()
    .nullable()
    .or(z.literal('')),
  gender: z
    .enum(['male', 'female', 'other'])
    .optional()
    .nullable()
    .or(z.literal('')),
  date_of_birth: z
    .string()
    .optional()
    .nullable()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  emergency_contact: z
    .string()
    .max(100, 'Emergency contact must be less than 100 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
});

export const addMemberSchema = memberSchema
  .extend({
    plan_id: z
      .string()
      .min(1, 'Please select a membership plan'),
    start_date: z
      .string()
      .min(1, 'Start date is required'),
    agreed_price: z
      .number()
      .min(0, 'Price cannot be negative'),
    payment_amount: z
      .number()
      .min(0, 'Payment cannot be negative')
      .optional(),
    payment_method: z
      .enum(['cash', 'upi', 'card', 'other'])
      .optional()
      .nullable()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.payment_amount && data.payment_amount > 0) {
        return Boolean(data.payment_method && data.payment_method.length > 0);
      }
      return true;
    },
    {
      message: 'Payment method is required when a payment amount is entered',
      path: ['payment_method'],
    }
  );

export type MemberInput = z.infer<typeof memberSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
