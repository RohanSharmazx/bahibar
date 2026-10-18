'use server';

import { createClient } from '@/lib/supabase/server';
import { requireGymAccess } from '@/lib/supabase/auth-helpers';
import { memberSchema, addMemberSchema } from '@/lib/validations/members';
import { calculateEndDate } from '@/lib/utils/dates';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Member, MemberWithMembership, MembershipPlan } from '@/types';

export type MemberActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  memberId?: string;
};

export async function createMemberAction(
  prevState: MemberActionState | null,
  formData: FormData
): Promise<MemberActionState> {
  try {
    const { gymId } = await requireGymAccess();

    const rawData = {
      full_name: formData.get('full_name'),
      mobile: formData.get('mobile'),
      email: formData.get('email') || undefined,
      gender: formData.get('gender') || undefined,
      date_of_birth: formData.get('date_of_birth') || undefined,
      address: formData.get('address') || undefined,
      emergency_contact: formData.get('emergency_contact') || undefined,
      notes: formData.get('notes') || undefined,
      plan_id: formData.get('plan_id'),
      start_date: formData.get('start_date'),
      agreed_price: Number(formData.get('agreed_price')),
      payment_amount: formData.get('payment_amount') ? Number(formData.get('payment_amount')) : 0,
      payment_method: formData.get('payment_method') || undefined,
    };

    const parsed = addMemberSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        error: 'Please correct the member registration errors.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();

    // 1. Fetch selected plan for snapshots
    const { data: plan, error: planError } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('id', parsed.data.plan_id)
      .eq('gym_id', gymId)
      .single();

    if (planError || !plan) {
      return { error: 'Selected plan was not found or is invalid.' };
    }

    // 2. Insert member
    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert({
        gym_id: gymId,
        full_name: parsed.data.full_name,
        mobile: parsed.data.mobile,
        email: parsed.data.email || null,
        gender: parsed.data.gender || null,
        date_of_birth: parsed.data.date_of_birth || null,
        address: parsed.data.address || null,
        emergency_contact: parsed.data.emergency_contact || null,
        notes: parsed.data.notes || null,
        is_archived: false,
      })
      .select('id')
      .single();

    if (memberError || !member) {
      if (memberError?.code === '23505') {
        return { error: 'A member with this mobile number already exists in your gym.' };
      }
      return { error: memberError?.message || 'Failed to save member.' };
    }

    // 3. Calculate expiry date
    const endDate = calculateEndDate(
      parsed.data.start_date,
      plan.duration_value,
      plan.duration_unit
    );

    const discountAmount = Math.max(0, plan.price - parsed.data.agreed_price);

    // 4. Insert membership period with snapshots
    const { data: membership, error: membershipError } = await supabase
      .from('member_memberships')
      .insert({
        gym_id: gymId,
        member_id: member.id,
        plan_id: plan.id,
        plan_name_snapshot: plan.name,
        plan_price_snapshot: plan.price,
        agreed_price: parsed.data.agreed_price,
        discount_amount: discountAmount,
        duration_value_snapshot: plan.duration_value,
        duration_unit_snapshot: plan.duration_unit,
        start_date: parsed.data.start_date,
        end_date: endDate.toISOString().split('T')[0],
        status: 'active',
      })
      .select('id')
      .single();

    if (membershipError || !membership) {
      return { error: 'Member was created, but failed to assign membership period.' };
    }

    // 5. If initial payment provided, record it
    if (parsed.data.payment_amount && parsed.data.payment_amount > 0 && parsed.data.payment_method) {
      await supabase.from('payments').insert({
        gym_id: gymId,
        member_id: member.id,
        membership_id: membership.id,
        amount: parsed.data.payment_amount,
        payment_method: parsed.data.payment_method,
        payment_date: parsed.data.start_date,
        notes: 'Initial enrollment payment',
      });
    }

    revalidatePath('/members');
    revalidatePath('/dashboard');
    redirect(`/members/${member.id}`);
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return { error: err.message || 'Failed to add member.' };
  }
}

export async function updateMemberAction(
  memberId: string,
  prevState: MemberActionState | null,
  formData: FormData
): Promise<MemberActionState> {
  try {
    const { gymId } = await requireGymAccess();

    const rawData = {
      full_name: formData.get('full_name'),
      mobile: formData.get('mobile'),
      email: formData.get('email') || undefined,
      gender: formData.get('gender') || undefined,
      date_of_birth: formData.get('date_of_birth') || undefined,
      address: formData.get('address') || undefined,
      emergency_contact: formData.get('emergency_contact') || undefined,
      notes: formData.get('notes') || undefined,
    };

    const parsed = memberSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        error: 'Please correct the member details.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('members')
      .update({
        full_name: parsed.data.full_name,
        mobile: parsed.data.mobile,
        email: parsed.data.email || null,
        gender: parsed.data.gender || null,
        date_of_birth: parsed.data.date_of_birth || null,
        address: parsed.data.address || null,
        emergency_contact: parsed.data.emergency_contact || null,
        notes: parsed.data.notes || null,
      })
      .eq('id', memberId)
      .eq('gym_id', gymId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/members/${memberId}`);
    revalidatePath('/members');
    redirect(`/members/${memberId}`);
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return { error: err.message || 'Failed to update member.' };
  }
}

export async function archiveMemberAction(memberId: string) {
  try {
    const { gymId } = await requireGymAccess();
    const supabase = await createClient();

    const { error } = await supabase
      .from('members')
      .update({ is_archived: true })
      .eq('id', memberId)
      .eq('gym_id', gymId);

    if (error) throw new Error(error.message);

    revalidatePath('/members');
    revalidatePath(`/members/${memberId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to archive member.' };
  }
}

export async function restoreMemberAction(memberId: string) {
  try {
    const { gymId } = await requireGymAccess();
    const supabase = await createClient();

    const { error } = await supabase
      .from('members')
      .update({ is_archived: false })
      .eq('id', memberId)
      .eq('gym_id', gymId);

    if (error) throw new Error(error.message);

    revalidatePath('/members');
    revalidatePath(`/members/${memberId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to restore member.' };
  }
}

export async function getMembersWithDetailsAction(options?: {
  search?: string;
  status?: 'all' | 'active' | 'expiring' | 'expired' | 'dues' | 'archived';
}): Promise<MemberWithMembership[]> {
  try {
    const { gymId } = await requireGymAccess();
    const supabase = await createClient();

    let memberQuery = supabase
      .from('members')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false });

    if (options?.status === 'archived') {
      memberQuery = memberQuery.eq('is_archived', true);
    } else {
      memberQuery = memberQuery.eq('is_archived', false);
    }

    if (options?.search) {
      const q = options.search.trim();
      memberQuery = memberQuery.or(`full_name.ilike.%${q}%,mobile.ilike.%${q}%`);
    }

    const { data: members, error } = await memberQuery;
    if (error || !members) return [];

    // For each member, retrieve latest membership and total payments
    const memberIds = members.map((m) => m.id);
    if (memberIds.length === 0) return [];

    const [{ data: memberships }, { data: payments }] = await Promise.all([
      supabase
        .from('member_memberships')
        .select('*')
        .in('member_id', memberIds)
        .order('end_date', { ascending: false }),
      supabase
        .from('payments')
        .select('membership_id, amount')
        .in('member_id', memberIds),
    ]);

    const results: MemberWithMembership[] = members.map((member) => {
      // Find latest membership
      const memberPeriods = (memberships || []).filter((m) => m.member_id === member.id);
      const latestPeriod = memberPeriods[0] || null;

      let totalPaid = 0;
      let agreedPrice = latestPeriod ? Number(latestPeriod.agreed_price) : 0;

      if (latestPeriod) {
        const periodPayments = (payments || []).filter((p) => p.membership_id === latestPeriod.id);
        totalPaid = periodPayments.reduce((acc, p) => acc + Number(p.amount), 0);
      }

      const outstanding = Math.max(0, agreedPrice - totalPaid);

      return {
        ...member,
        current_membership: latestPeriod,
        total_paid: totalPaid,
        outstanding_balance: outstanding,
      };
    });

    // Apply status filter if specified
    if (options?.status === 'dues') {
      return results.filter((m) => m.outstanding_balance > 0);
    }

    return results;
  } catch {
    return [];
  }
}
