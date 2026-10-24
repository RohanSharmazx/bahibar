import { z } from 'zod';

export const planSchema = z.object({
  name: z
    .string()
    .min(1, 'Plan name is required')
    .min(2, 'Plan name must be at least 2 characters')
    .max(100, 'Plan name must be less than 100 characters'),
  duration_value: z
    .number()
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1')
    .max(365, 'Duration must be less than 365'),
  duration_unit: z
    .enum(['days', 'months']),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(999999.99, 'Price is too large'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

export type PlanInput = z.infer<typeof planSchema>;
