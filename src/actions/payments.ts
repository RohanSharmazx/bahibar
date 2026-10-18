'use server';

import { createClient } from '@/lib/supabase/server';
import { requireGymAccess } from '@/lib/supabase/auth-helpers';
import { paymentSchema } from '@/lib/validations/payments';
import { revalidatePath } from 'next/cache';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { DATE_FORMAT } from '@/lib/constants';
import type { Payment, PaymentWithMember } from '@/types';

export type PaymentActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function recordPaymentAction(
  memberId: string,
  prevState: PaymentActionState | null,
  formData: FormData
): Promise<PaymentActionState> {
  try {
    const { gymId } = await requireGymAccess();

    const rawData = {
      membership_id: formData.get('membership_id'),
      amount: Number(formData.get('amount')),
      payment_method: formData.get('payment_method'),
      payment_date: formData.get('payment_date'),
      transaction_reference: formData.get('transaction_reference') || undefined,
      notes: formData.get('notes') || undefined,
    };

    const parsed = paymentSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        error: 'Please correct payment input errors.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();

    // 1. Verify membership belongs to this gym and fetch agreed price
    const { data: membership, error: memError } = await supabase
      .from('member_memberships')
      .select('agreed_price')
      .eq('id', parsed.data.membership_id)
      .eq('gym_id', gymId)
      .single();

    if (memError || !membership) {
      return { error: 'Invalid membership period specified.' };
    }

    // 2. Calculate existing payments for this membership
    const { data: existingPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('membership_id', parsed.data.membership_id);

    const totalPaidSoFar = (existingPayments || []).reduce(
      (acc, p) => acc + Number(p.amount),
      0
    );

    const agreed = Number(membership.agreed_price);
    const outstanding = Math.max(0, agreed - totalPaidSoFar);

    if (parsed.data.amount > outstanding + 0.01) {
      return {
        error: `Payment amount (₹${parsed.data.amount}) exceeds outstanding balance (₹${outstanding}).`,
      };
    }

    // 3. Record payment transaction (immutable)
    const { error: insertError } = await supabase.from('payments').insert({
      gym_id: gymId,
      member_id: memberId,
      membership_id: parsed.data.membership_id,
      amount: parsed.data.amount,
      payment_method: parsed.data.payment_method,
      payment_date: parsed.data.payment_date,
      transaction_reference: parsed.data.transaction_reference || null,
      notes: parsed.data.notes || null,
    });

    if (insertError) {
      return { error: insertError.message };
    }

    revalidatePath(`/members/${memberId}`);
    revalidatePath('/payments');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to record payment.' };
  }
}

export async function getPaymentsHistoryAction(memberId?: string): Promise<PaymentWithMember[]> {
  try {
    const { gymId } = await requireGymAccess();
    const supabase = await createClient();

    let query = supabase
      .from('payments')
      .select(`
        *,
        members!inner(full_name),
        member_memberships!inner(plan_name_snapshot)
      `)
      .eq('gym_id', gymId)
      .order('payment_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (memberId) {
      query = query.eq('member_id', memberId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((item: any) => ({
      id: item.id,
      gym_id: item.gym_id,
      member_id: item.member_id,
      membership_id: item.membership_id,
      amount: Number(item.amount),
      payment_method: item.payment_method,
      payment_date: item.payment_date,
      transaction_reference: item.transaction_reference,
      notes: item.notes,
      created_at: item.created_at,
      member_name: item.members?.full_name || 'Member',
      plan_name: item.member_memberships?.plan_name_snapshot || 'Plan',
    }));
  } catch {
    return [];
  }
}

export async function getCollectionSummaryAction(): Promise<{
  today: number;
  thisMonth: number;
}> {
  try {
    const { gymId } = await requireGymAccess();
    const supabase = await createClient();

    const now = new Date();
    const todayStr = format(now, DATE_FORMAT.input);
    const monthStart = format(startOfMonth(now), DATE_FORMAT.input);
    const monthEnd = format(endOfMonth(now), DATE_FORMAT.input);

    const [{ data: todayPayments }, { data: monthPayments }] = await Promise.all([
      supabase
        .from('payments')
        .select('amount')
        .eq('gym_id', gymId)
        .eq('payment_date', todayStr),
      supabase
        .from('payments')
        .select('amount')
        .eq('gym_id', gymId)
        .gte('payment_date', monthStart)
        .lte('payment_date', monthEnd),
    ]);

    const todayTotal = (todayPayments || []).reduce((acc, p) => acc + Number(p.amount), 0);
    const monthTotal = (monthPayments || []).reduce((acc, p) => acc + Number(p.amount), 0);

    return { today: todayTotal, thisMonth: monthTotal };
  } catch {
    return { today: 0, thisMonth: 0 };
  }
}
