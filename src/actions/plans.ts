'use server';

import { createClient } from '@/lib/supabase/server';
import { requireGymAccess } from '@/lib/supabase/auth-helpers';
import { planSchema } from '@/lib/validations/plans';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isLocalPlaceholderMode, readLocalDb, writeLocalDb } from '@/lib/local-db';
import type { MembershipPlan } from '@/types';
import crypto from 'crypto';

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

    if (isLocalPlaceholderMode()) {
      const db = readLocalDb();
      const now = new Date().toISOString();
      const newPlan: MembershipPlan = {
        id: crypto.randomUUID(),
        gym_id: gymId,
        name: parsed.data.name,
        duration_value: parsed.data.duration_value,
        duration_unit: parsed.data.duration_unit,
        price: parsed.data.price,
        description: parsed.data.description || null,
        is_active: true,
        created_at: now,
        updated_at: now,
      };
      db.membership_plans.push(newPlan);
      writeLocalDb(db);
      revalidatePath('/plans');
      revalidatePath('/members/new');
      redirect('/plans');
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

    if (isLocalPlaceholderMode()) {
      const db = readLocalDb();
      const plan = db.membership_plans.find((p) => p.id === planId && p.gym_id === gymId);
      if (plan) {
        plan.name = parsed.data.name;
        plan.duration_value = parsed.data.duration_value;
        plan.duration_unit = parsed.data.duration_unit;
        plan.price = parsed.data.price;
        plan.description = parsed.data.description || null;
        plan.updated_at = new Date().toISOString();
        writeLocalDb(db);
      }
      revalidatePath('/plans');
      redirect('/plans');
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

    if (isLocalPlaceholderMode()) {
      const db = readLocalDb();
      const plan = db.membership_plans.find((p) => p.id === planId && p.gym_id === gymId);
      if (plan) {
        plan.is_active = !currentActive;
        plan.updated_at = new Date().toISOString();
        writeLocalDb(db);
      }
      revalidatePath('/plans');
      return { success: true };
    }

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

    if (isLocalPlaceholderMode()) {
      const db = readLocalDb();
      let plans = db.membership_plans.filter((p) => p.gym_id === gymId);
      if (onlyActive) {
        plans = plans.filter((p) => p.is_active);
      }
      return plans.sort((a, b) => a.price - b.price);
    }

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

export async function getPlanByIdAction(planId: string): Promise<MembershipPlan | null> {
  try {
    const { gymId } = await requireGymAccess();

    if (isLocalPlaceholderMode()) {
      const db = readLocalDb();
      const plan = db.membership_plans.find((p) => p.id === planId && p.gym_id === gymId);
      return plan || null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('id', planId)
      .eq('gym_id', gymId)
      .single();

    if (error || !data) return null;
    return data as MembershipPlan;
  } catch {
    return null;
  }
}

