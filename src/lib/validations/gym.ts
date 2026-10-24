import { z } from 'zod';

export const gymSchema = z.object({
  name: z
    .string()
    .min(1, 'Gym name is required')
    .min(2, 'Gym name must be at least 2 characters')
    .max(100, 'Gym name must be less than 100 characters'),
  owner_name: z
    .string()
    .min(1, 'Owner name is required')
    .min(2, 'Owner name must be at least 2 characters')
    .max(100, 'Owner name must be less than 100 characters'),
  contact_number: z
    .string()
    .min(1, 'Contact number is required')
    .min(10, 'Contact number must be at least 10 digits')
    .max(15, 'Contact number must be less than 15 digits')
    .regex(/^[+]?[0-9\s-]+$/, 'Please enter a valid phone number'),
  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

export type GymInput = z.infer<typeof gymSchema>;
