'use server';

import { createClient } from '@/lib/supabase/server';
import { requireGymAccess } from '@/lib/supabase/auth-helpers';
import { generateCsv } from '@/lib/utils/csv';

export async function exportMembersCsvAction(): Promise<string> {
  const { gymId } = await requireGymAccess();
  const supabase = await createClient();

  const { data: members, error } = await supabase
    .from('members')
    .select('*')
    .eq('gym_id', gymId)
    .order('created_at', { ascending: false });

  if (error || !members) throw new Error('Failed to fetch members for export.');

  const columns = [
    { key: 'full_name' as const, header: 'Full Name' },
    { key: 'mobile' as const, header: 'Mobile Number' },
    { key: 'email' as const, header: 'Email' },
    { key: 'gender' as const, header: 'Gender' },
    { key: 'date_of_birth' as const, header: 'Date of Birth' },
    { key: 'emergency_contact' as const, header: 'Emergency Contact' },
    { key: 'address' as const, header: 'Address' },
    { key: 'is_archived' as const, header: 'Archived' },
    { key: 'created_at' as const, header: 'Joined Date' },
  ];

  return generateCsv(members, columns);
}

export async function exportMembershipsCsvAction(): Promise<string> {
  const { gymId } = await requireGymAccess();
  const supabase = await createClient();

  const { data: memberships, error } = await supabase
    .from('member_memberships')
    .select(`
      *,
      members!inner(full_name, mobile)
    `)
    .eq('gym_id', gymId)
    .order('start_date', { ascending: false });

  if (error || !memberships) throw new Error('Failed to fetch memberships for export.');

  const formatted = memberships.map((m: any) => ({
    member_name: m.members?.full_name || '',
    member_mobile: m.members?.mobile || '',
    plan_name: m.plan_name_snapshot,
    plan_price: m.plan_price_snapshot,
    agreed_price: m.agreed_price,
    discount_amount: m.discount_amount,
    duration: `${m.duration_value_snapshot} ${m.duration_unit_snapshot}`,
    start_date: m.start_date,
    end_date: m.end_date,
    status: m.status,
  }));

  const columns = [
    { key: 'member_name' as const, header: 'Member Name' },
    { key: 'member_mobile' as const, header: 'Mobile' },
    { key: 'plan_name' as const, header: 'Plan' },
    { key: 'plan_price' as const, header: 'Standard Price' },
    { key: 'agreed_price' as const, header: 'Agreed Price' },
    { key: 'discount_amount' as const, header: 'Discount' },
    { key: 'duration' as const, header: 'Duration' },
    { key: 'start_date' as const, header: 'Start Date' },
    { key: 'end_date' as const, header: 'Expiry Date' },
    { key: 'status' as const, header: 'Status' },
  ];

  return generateCsv(formatted, columns);
}

export async function exportPaymentsCsvAction(): Promise<string> {
  const { gymId } = await requireGymAccess();
  const supabase = await createClient();

  const { data: payments, error } = await supabase
    .from('payments')
    .select(`
      *,
      members!inner(full_name, mobile),
      member_memberships!inner(plan_name_snapshot)
    `)
    .eq('gym_id', gymId)
    .order('payment_date', { ascending: false });

  if (error || !payments) throw new Error('Failed to fetch payments for export.');

  const formatted = payments.map((p: any) => ({
    member_name: p.members?.full_name || '',
    member_mobile: p.members?.mobile || '',
    plan_name: p.member_memberships?.plan_name_snapshot || '',
    amount: p.amount,
    payment_method: p.payment_method.toUpperCase(),
    payment_date: p.payment_date,
    transaction_reference: p.transaction_reference || '',
    notes: p.notes || '',
  }));

  const columns = [
    { key: 'member_name' as const, header: 'Member Name' },
    { key: 'member_mobile' as const, header: 'Mobile' },
    { key: 'plan_name' as const, header: 'Plan' },
    { key: 'amount' as const, header: 'Amount (₹)' },
    { key: 'payment_method' as const, header: 'Payment Method' },
    { key: 'payment_date' as const, header: 'Payment Date' },
    { key: 'transaction_reference' as const, header: 'Reference / UPI' },
    { key: 'notes' as const, header: 'Notes' },
  ];

  return generateCsv(formatted, columns);
}
