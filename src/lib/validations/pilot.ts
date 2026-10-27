import { z } from 'zod';

export const pilotRegistrationSchema = z.object({
  gym_name: z
    .string()
    .min(2, 'Gym name must be at least 2 characters')
    .max(100, 'Gym name must be under 100 characters'),
  city: z
    .string()
    .min(2, 'City is required')
    .max(100, 'City must be under 100 characters'),
  member_count: z
    .string()
    .min(1, 'Please select approximate member count'),
  contact_name: z
    .string()
    .min(2, 'Contact person name is required')
    .max(100, 'Name must be under 100 characters'),
  contact_phone: z
    .string()
    .min(10, 'Contact number must be at least 10 digits')
    .max(15, 'Contact number must be under 15 digits')
    .regex(/^[+]?[0-9\s-]+$/, 'Please enter a valid phone number'),
  contact_email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  primary_challenge: z
    .string()
    .max(500, 'Message must be under 500 characters')
    .optional()
    .or(z.literal('')),
});

export type PilotRegistrationInput = z.infer<typeof pilotRegistrationSchema>;
