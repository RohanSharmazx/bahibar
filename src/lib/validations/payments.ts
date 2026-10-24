import { z } from 'zod';

export const paymentSchema = z.object({
  membership_id: z
    .string()
    .min(1, 'Membership is required'),
  amount: z
    .number()
    .positive('Amount must be greater than zero')
    .max(999999.99, 'Amount is too large'),
  payment_method: z
    .enum(['cash', 'upi', 'card', 'other']),
  payment_date: z
    .string()
    .min(1, 'Payment date is required'),
  transaction_reference: z
    .string()
    .max(100, 'Reference must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

export const renewalSchema = z.object({
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
    .optional(),
  payment_date: z
    .string()
    .optional(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
export type RenewalInput = z.infer<typeof renewalSchema>;
