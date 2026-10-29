'use server';

import { createClient } from '@/lib/supabase/server';
import { requireGymAccess, requireActiveSubscription } from '@/lib/supabase/auth-helpers';
import { paymentSchema } from '@/lib/validations/payments';
import { revalidatePath } from 'next/cache';
import { format, startOfMonth, endOfMonth, isToday } from 'date-fns';
import { DATE_FORMAT } from '@/lib/constants';
import { isLocalPlaceholderMode, readLocalDb, writeLocalDb } from '@/lib/local-db';
import type { Payment, PaymentWithMember } from '@/types';
import { comparePaymentsDesc } from '@/lib/utils/memberships';
import { getCurrentMonthRange, formatDateLong } from '@/lib/utils/dates';
import crypto from 'crypto';

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
    await requireActiveSubscription(gymId);

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

    if (isLocalPlaceholderMode()) {
      const db = readLocalDb();
      const member = db.members.find((m) => m.id === memberId && m.gym_id === gymId);
      if (!member) {
        return { error: 'Member not found or does not belong to your gym.' };
      }

      const membership = db.member_memberships.find(
        (m) =>
          m.id === parsed.data.membership_id &&
          m.gym_id === gymId &&
          m.member_id === memberId
      );

      if (!membership) {
        return { error: 'Invalid membership period specified for this member.' };
      }

      const existingPayments = db.payments.filter(
        (p) => p.membership_id === parsed.data.membership_id
      );
      const totalPaidSoFar = existingPayments.reduce((acc, p) => acc + Number(p.amount), 0);
      const agreed = Number(membership.agreed_price);
      const outstanding = Math.max(0, agreed - totalPaidSoFar);

      if (parsed.data.amount > outstanding + 0.01) {
        return {
          error: `Payment amount (₹${parsed.data.amount}) exceeds outstanding balance (₹${outstanding}).`,
        };
      }

      // Check for rapid duplicate submission (within 3 seconds)
      const recentDuplicatePayment = db.payments.find(
        (p) =>
          p.member_id === memberId &&
          p.membership_id === parsed.data.membership_id &&
          Number(p.amount) === parsed.data.amount &&
          p.payment_method === parsed.data.payment_method &&
          Date.now() - new Date(p.created_at).getTime() < 3000
      );
      if (recentDuplicatePayment) {
        return { success: true };
      }

      const newPayment: Payment = {
        id: crypto.randomUUID(),
        gym_id: gymId,
        member_id: memberId,
        membership_id: parsed.data.membership_id,
        amount: parsed.data.amount,
        payment_method: parsed.data.payment_method as any,
        payment_date: parsed.data.payment_date,
        transaction_reference: parsed.data.transaction_reference || null,
        notes: parsed.data.notes || null,
        created_at: new Date().toISOString(),
      };

      db.payments.push(newPayment);
      writeLocalDb(db);

      revalidatePath(`/members/${memberId}`);
      revalidatePath('/members');
      revalidatePath('/payments');
      revalidatePath('/dashboard');
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

    const { data: membership, error: memError } = await supabase
      .from('member_memberships')
      .select('agreed_price')
      .eq('id', parsed.data.membership_id)
      .eq('member_id', memberId)
      .eq('gym_id', gymId)
      .single();

    if (memError || !membership) {
      return { error: 'Invalid membership period specified for this member.' };
    }

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

    // Check for rapid duplicate submission (within 3 seconds)
    const threeSecondsAgo = new Date(Date.now() - 3000).toISOString();
    const { data: recentDuplicatePayment } = await supabase
      .from('payments')
      .select('id')
      .eq('gym_id', gymId)
      .eq('member_id', memberId)
      .eq('membership_id', parsed.data.membership_id)
      .eq('amount', parsed.data.amount)
      .eq('payment_method', parsed.data.payment_method)
      .gte('created_at', threeSecondsAgo)
      .maybeSingle();

    if (recentDuplicatePayment) {
      return { success: true };
    }

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
    revalidatePath('/members');
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

    if (isLocalPlaceholderMode()) {
      const db = readLocalDb();
      let payments = db.payments.filter((p) => p.gym_id === gymId);
      if (memberId) {
        payments = payments.filter((p) => p.member_id === memberId);
      }

      return payments
        .map((p) => {
          const member = db.members.find((m) => m.id === p.member_id);
          const membership = db.member_memberships.find((m) => m.id === p.membership_id);
          const membershipPayments = db.payments.filter((item) => item.membership_id === p.membership_id);
          const totalPaid = membershipPayments.reduce((acc, item) => acc + Number(item.amount), 0);
          const agreed = Number(membership?.agreed_price || 0);
          const outstanding = Math.max(0, agreed - totalPaid);

          return {
            ...p,
            member_name: member?.full_name || 'Member',
            plan_name: membership?.plan_name_snapshot || 'Plan',
            member_mobile: member?.mobile || null,
            member_email: member?.email || null,
            agreed_price: agreed,
            start_date: membership?.start_date,
            end_date: membership?.end_date,
            outstanding_balance: outstanding,
          };
        })
        .sort(comparePaymentsDesc);
    }

    const supabase = await createClient();

    let query = supabase
      .from('payments')
      .select(`
        *,
        members(full_name, mobile, email),
        member_memberships(plan_name_snapshot, agreed_price, start_date, end_date)
      `)
      .eq('gym_id', gymId)
      .order('payment_date', { ascending: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false });

    if (memberId) {
      query = query.eq('member_id', memberId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    const membershipIds = Array.from(
      new Set(data.map((item: any) => item.membership_id).filter(Boolean))
    );
    const { data: allMembershipPayments } =
      membershipIds.length > 0
        ? await supabase
            .from('payments')
            .select('membership_id, amount')
            .eq('gym_id', gymId)
            .in('membership_id', membershipIds)
        : { data: [] };

    const paymentsByMembership = new Map<string, number>();
    for (const p of allMembershipPayments || []) {
      const current = paymentsByMembership.get(p.membership_id) || 0;
      paymentsByMembership.set(p.membership_id, current + Number(p.amount));
    }

    return data
      .map((item: any) => {
        const agreed = Number(item.member_memberships?.agreed_price || 0);
        const totalPaid = paymentsByMembership.get(item.membership_id) || Number(item.amount);
        const outstanding = Math.max(0, agreed - totalPaid);

        return {
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
          member_mobile: item.members?.mobile || null,
          member_email: item.members?.email || null,
          agreed_price: agreed,
          start_date: item.member_memberships?.start_date,
          end_date: item.member_memberships?.end_date,
          outstanding_balance: outstanding,
        };
      })
      .sort(comparePaymentsDesc);
  } catch {
    return [];
  }
}

export async function getCollectionSummaryAction(): Promise<{
  today: number;
  thisMonth: number;
  todayCount: number;
  thisMonthCount: number;
  todayDateFormatted: string;
  monthLabel: string;
}> {
  try {
    const { gymId } = await requireGymAccess();
    const { todayStr, monthStart, monthEnd, monthLabel } = getCurrentMonthRange();
    const todayDateFormatted = formatDateLong(todayStr);

    if (isLocalPlaceholderMode()) {
      const db = readLocalDb();
      const gymPayments = db.payments.filter((p) => p.gym_id === gymId);

      const todayList = gymPayments.filter((p) => {
        if (p.payment_date === todayStr) return true;
        if (p.created_at) {
          try {
            const createdAtIst = new Intl.DateTimeFormat('en-CA', {
              timeZone: 'Asia/Kolkata',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }).format(new Date(p.created_at));
            if (createdAtIst === todayStr) return true;
          } catch {}
        }
        return false;
      });

      const monthList = gymPayments.filter(
        (p) => p.payment_date >= monthStart && p.payment_date <= monthEnd
      );

      const todayTotal = todayList.reduce((acc, p) => acc + Number(p.amount), 0);
      const monthTotal = monthList.reduce((acc, p) => acc + Number(p.amount), 0);

      return {
        today: todayTotal,
        thisMonth: monthTotal,
        todayCount: todayList.length,
        thisMonthCount: monthList.length,
        todayDateFormatted,
        monthLabel,
      };
    }

    const supabase = await createClient();

    const { data: monthPayments } = await supabase
      .from('payments')
      .select('amount, payment_date, created_at')
      .eq('gym_id', gymId)
      .gte('payment_date', monthStart)
      .lte('payment_date', monthEnd);

    const payments = monthPayments || [];
    const todayList = payments.filter((p) => {
      if (p.payment_date === todayStr) return true;
      if (p.created_at) {
        try {
          const createdAtIst = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(new Date(p.created_at));
          if (createdAtIst === todayStr) return true;
        } catch {}
      }
      return false;
    });

    const todayTotal = todayList.reduce((acc, p) => acc + Number(p.amount), 0);
    const monthTotal = payments.reduce((acc, p) => acc + Number(p.amount), 0);

    return {
      today: todayTotal,
      thisMonth: monthTotal,
      todayCount: todayList.length,
      thisMonthCount: payments.length,
      todayDateFormatted,
      monthLabel,
    };
  } catch {
    const { todayStr, monthLabel } = getCurrentMonthRange();
    return {
      today: 0,
      thisMonth: 0,
      todayCount: 0,
      thisMonthCount: 0,
      todayDateFormatted: formatDateLong(todayStr),
      monthLabel,
    };
  }
}
