'use server';

import { pilotRegistrationSchema } from '@/lib/validations/pilot';
import { readLocalDb, writeLocalDb, isLocalPlaceholderMode } from '@/lib/local-db';
import crypto from 'crypto';

export type PilotActionState = {
  success?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function submitPilotInterestAction(
  prevState: PilotActionState | null,
  formData: FormData
): Promise<PilotActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = pilotRegistrationSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        error: 'Please correct the highlighted fields.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    if (isLocalPlaceholderMode()) {
      const db = readLocalDb();
      if (!db.pilot_registrations) {
        db.pilot_registrations = [];
      }

      // Check if this contact phone was already registered
      const cleanPhone = parsed.data.contact_phone.replace(/\D/g, '');
      const existing = db.pilot_registrations.find(
        (r) => r.contact_phone.replace(/\D/g, '') === cleanPhone
      );

      if (existing) {
        return {
          success: true,
          message: `We already have an application for ${existing.gym_name} on file with this phone number. Our team will contact you when the pilot opens!`,
        };
      }

      db.pilot_registrations.push({
        id: crypto.randomUUID(),
        gym_name: parsed.data.gym_name,
        city: parsed.data.city,
        member_count: parsed.data.member_count,
        contact_name: parsed.data.contact_name,
        contact_phone: parsed.data.contact_phone,
        contact_email: parsed.data.contact_email || undefined,
        primary_challenge: parsed.data.primary_challenge || undefined,
        created_at: new Date().toISOString(),
      });

      writeLocalDb(db);
    }

    return {
      success: true,
      message: `Thank you, ${parsed.data.contact_name}! Your pilot application for ${parsed.data.gym_name} in ${parsed.data.city} has been received. We will reach out personally on ${parsed.data.contact_phone}.`,
    };
  } catch (err: any) {
    return {
      error: err.message || 'Unable to submit your registration. Please try again.',
    };
  }
}
