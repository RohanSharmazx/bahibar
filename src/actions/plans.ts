'use server';

import { createClient } from '@/lib/supabase/server';
import { requireGymAccess } from '@/lib/supabase/auth-helpers';
import { planSchema } from '@/lib/validations/plans';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { MembershipPlan } from '@/types';

export type PlanActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createPlanAction(
  prevState: PlanActionState | null,
  formData: FormData
): Promise<PlanActionState> {
  try {
    const { gymId } = await requireGymAccess();

    const rawData = {
      name: formData.get('name'),
      duration_value: Number(formData.get('duration_value')),
      duration_unit: formData.get('duration_unit'),
      price: Number(formData.get('price')),
      description: formData.get('description'),
    };

    const parsed = planSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        error: 'Please correct the plan form errors.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.from('membership_plans').insert({
      gym_id: gymId,
      name: parsed.data.name,
      duration_value: parsed.data.duration_value,
      duration_unit: parsed.data.duration_unit,
      price: parsed.data.price,
      description: parsed.data.description || null,
      is_active: true,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/plans');
    revalidatePath('/members/new');
    redirect('/plans');
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return { error: err.message || 'Failed to create plan.' };
  }
}

export async function updatePlanAction(
  planId: string,
  prevState: PlanActionState | null,
  formData: FormData
): Promise<PlanActionState> {
  try {
    const { gymId } = await requireGymAccess();

    const rawData = {
      name: formData.get('name'),
      duration_value: Number(formData.get('duration_value')),
      duration_unit: formData.get('duration_unit'),
      price: Number(formData.get('price')),
      description: formData.get('description'),
    };

    const parsed = planSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        error: 'Please correct the plan form errors.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('membership_plans')
      .update({
        name: parsed.data.name,
        duration_value: parsed.data.duration_value,
        duration_unit: parsed.data.duration_unit,
        price: parsed.data.price,
        description: parsed.data.description || null,
      })
      .eq('id', planId)
      .eq('gym_id', gymId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/plans');
    redirect('/plans');
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return { error: err.message || 'Failed to update plan.' };
  }
}

export async function togglePlanActiveAction(planId: string, currentActive: boolean) {
  try {
    const { gymId } = await requireGymAccess();
    const supabase = await createClient();

    const { error } = await supabase
      .from('membership_plans')
      .update({ is_active: !currentActive })
      .eq('id', planId)
      .eq('gym_id', gymId);

    if (error) throw new Error(error.message);

    revalidatePath('/plans');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to toggle plan.' };
  }
}

export async function getPlansAction(onlyActive: boolean = false): Promise<MembershipPlan[]> {
  try {
    const { gymId } = await requireGymAccess();
    const supabase = await createClient();

    let query = supabase
      .from('membership_plans')
      .select('*')
      .eq('gym_id', gymId)
      .order('price', { ascending: true });

    if (onlyActive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as MembershipPlan[];
  } catch {
    return [];
  }
}
