'use server';

import { createClient } from '@/lib/supabase/server';
import { requireGymAccess, requireActiveSubscription } from '@/lib/supabase/auth-helpers';
import { renewalSchema } from '@/lib/validations/payments';
import { calculateEndDate, formatDateToISO, getTodayISO } from '@/lib/utils/dates';
import { revalidatePath } from 'next/cache';
import { isLocalPlaceholderMode, readLocalDb, writeLocalDb } from '@/lib/local-db';
import type { MemberMembership, Payment } from '@/types';
import crypto from 'crypto';

export type RenewalActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function renewMembershipAction(
  memberId: string,
  prevState: RenewalActionState | null,
  formData: FormData
): Promise<RenewalActionState> {
  try {
    const { gymId } = await requireGymAccess();
    await requireActiveSubscription(gymId);

    const rawData = {
      plan_id: formData.get('plan_id'),
      start_date: formData.get('start_date'),
      agreed_price: Number(formData.get('agreed_price')),
      payment_amount: formData.get('payment_amount') ? Number(formData.get('payment_amount')) : 0,
      payment_method: formData.get('payment_method') || undefined,
      payment_date: formData.get('payment_date') || undefined,
    };

    const parsed = renewalSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        error: 'Please correct the renewal form errors.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    if (parsed.data.payment_amount && parsed.data.payment_amount > parsed.data.agreed_price + 0.01) {
      return {
        error: `Payment amount (₹${parsed.data.payment_amount}) cannot exceed agreed price (₹${parsed.data.agreed_price}).`,
        fieldErrors: {
          payment_amount: [`Payment cannot exceed agreed price of ₹${parsed.data.agreed_price}`],
        },
      };
    }

    if (isLocalPlaceholderMode()) {
      const db = readLocalDb();
      const member = db.members.find((m) => m.id === memberId && m.gym_id === gymId);
      if (!member) {
        return { error: 'Member not found or does not belong to your gym.' };
      }

      const plan = db.membership_plans.find(
        (p) => p.id === parsed.data.plan_id && p.gym_id === gymId
      );
      if (!plan) {
        return { error: 'Selected plan was not found.' };
      }

      // Check for rapid duplicate submission (within 3 seconds)
      const recentDuplicate = db.member_memberships.find(
        (m) =>
          m.member_id === memberId &&
          m.plan_id === parsed.data.plan_id &&
          m.start_date === parsed.data.start_date &&
          Number(m.agreed_price) === parsed.data.agreed_price &&
          Date.now() - new Date(m.created_at).getTime() < 3000
      );
      if (recentDuplicate) {
        return { success: true };
      }

      // Mark previous active as expired
      db.member_memberships.forEach((m) => {
        if (m.member_id === memberId && m.gym_id === gymId && m.status === 'active') {
          m.status = 'expired';
          m.updated_at = new Date().toISOString();
        }
      });

      const endDate = calculateEndDate(
        parsed.data.start_date,
        plan.duration_value,
        plan.duration_unit
      );

      const discountAmount = Math.max(0, plan.price - parsed.data.agreed_price);
      const membershipId = crypto.randomUUID();
      const now = new Date().toISOString();

      const newMembership: MemberMembership = {
        id: membershipId,
        gym_id: gymId,
        member_id: memberId,
        plan_id: plan.id,
        plan_name_snapshot: plan.name,
        plan_price_snapshot: plan.price,
        agreed_price: parsed.data.agreed_price,
        discount_amount: discountAmount,
        duration_value_snapshot: plan.duration_value,
        duration_unit_snapshot: plan.duration_unit,
        start_date: parsed.data.start_date,
        end_date: formatDateToISO(endDate),
        status: 'active',
        created_at: now,
        updated_at: now,
      };

      db.member_memberships.push(newMembership);

      if (parsed.data.payment_amount && parsed.data.payment_amount > 0 && parsed.data.payment_method) {
        const paymentDate = parsed.data.payment_date || getTodayISO();
        const newPayment: Payment = {
          id: crypto.randomUUID(),
          gym_id: gymId,
          member_id: memberId,
          membership_id: membershipId,
          amount: parsed.data.payment_amount,
          payment_method: parsed.data.payment_method as any,
          payment_date: paymentDate,
          transaction_reference: null,
          notes: 'Renewal payment',
          created_at: now,
        };
        db.payments.push(newPayment);
      }

      writeLocalDb(db);
      revalidatePath(`/members/${memberId}`);
      revalidatePath('/members');
      revalidatePath('/dashboard');
      revalidatePath('/payments');
      return { success: true };
    }

    // Cloud Supabase Mode
    const supabase = await createClient();

    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id')
      .eq('id', memberId)
      .eq('gym_id', gymId)
      .single();

    if (memberError || !member) {
      return { error: 'Member not found or does not belong to your gym.' };
    }

    const { data: plan, error: planError } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('id', parsed.data.plan_id)
      .eq('gym_id', gymId)
      .single();

    if (planError || !plan) {
      return { error: 'Selected plan was not found.' };
    }

    // Check for rapid duplicate submission (within 3 seconds)
    const threeSecondsAgo = new Date(Date.now() - 3000).toISOString();
    const { data: recentDuplicate } = await supabase
      .from('member_memberships')
      .select('id')
      .eq('member_id', memberId)
      .eq('gym_id', gymId)
      .eq('plan_id', parsed.data.plan_id)
      .eq('start_date', parsed.data.start_date)
      .eq('agreed_price', parsed.data.agreed_price)
      .gte('created_at', threeSecondsAgo)
      .maybeSingle();

    if (recentDuplicate) {
      return { success: true };
    }

    await supabase
      .from('member_memberships')
      .update({ status: 'expired' })
      .eq('member_id', memberId)
      .eq('gym_id', gymId)
      .eq('status', 'active');

    const endDate = calculateEndDate(
      parsed.data.start_date,
      plan.duration_value,
      plan.duration_unit
    );

    const discountAmount = Math.max(0, plan.price - parsed.data.agreed_price);

    const { data: newMembership, error: membershipError } = await supabase
      .from('member_memberships')
      .insert({
        gym_id: gymId,
        member_id: memberId,
        plan_id: plan.id,
        plan_name_snapshot: plan.name,
        plan_price_snapshot: plan.price,
        agreed_price: parsed.data.agreed_price,
        discount_amount: discountAmount,
        duration_value_snapshot: plan.duration_value,
        duration_unit_snapshot: plan.duration_unit,
        start_date: parsed.data.start_date,
        end_date: formatDateToISO(endDate),
        status: 'active',
      })
      .select('id')
      .single();

    if (membershipError || !newMembership) {
      return { error: membershipError?.message || 'Failed to renew membership.' };
    }

    if (parsed.data.payment_amount && parsed.data.payment_amount > 0 && parsed.data.payment_method) {
      const paymentDate = parsed.data.payment_date || getTodayISO();
      await supabase.from('payments').insert({
        gym_id: gymId,
        member_id: memberId,
        membership_id: newMembership.id,
        amount: parsed.data.payment_amount,
        payment_method: parsed.data.payment_method,
        payment_date: paymentDate,
        notes: 'Renewal payment',
      });
    }

    revalidatePath(`/members/${memberId}`);
    revalidatePath('/members');
    revalidatePath('/dashboard');
    revalidatePath('/payments');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to process renewal.' };
  }
}

export async function getMemberMembershipsHistoryAction(memberId: string): Promise<MemberMembership[]> {
  try {
    const { gymId } = await requireGymAccess();

    if (isLocalPlaceholderMode()) {
      const db = readLocalDb();
      return db.member_memberships
        .filter((m) => m.member_id === memberId && m.gym_id === gymId)
        .sort((a, b) => {
          const startDiff = new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
          if (startDiff !== 0) return startDiff;
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('member_memberships')
      .select('*')
      .eq('member_id', memberId)
      .eq('gym_id', gymId)
      .order('start_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as MemberMembership[];
  } catch {
    return [];
  }
}
