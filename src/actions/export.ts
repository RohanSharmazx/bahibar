'use server';

import { createClient } from '@/lib/supabase/server';
import { requireGymAccess } from '@/lib/supabase/auth-helpers';
import { generateCsv } from '@/lib/utils/csv';
import { isLocalPlaceholderMode, readLocalDb } from '@/lib/local-db';

export async function exportMembersCsvAction(): Promise<string> {
  const { gymId } = await requireGymAccess();

  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    const members = db.members.filter((m) => m.gym_id === gymId);
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
    return generateCsv(members as any, columns as any);
  }

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

  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    const memberships = db.member_memberships.filter((m) => m.gym_id === gymId);
    const formatted = memberships.map((m) => {
      const member = db.members.find((mem) => mem.id === m.member_id);
      return {
        member_name: member?.full_name || '',
        member_mobile: member?.mobile || '',
        plan_name: m.plan_name_snapshot,
        plan_price: m.plan_price_snapshot,
        agreed_price: m.agreed_price,
        discount_amount: m.discount_amount,
        duration: `${m.duration_value_snapshot} ${m.duration_unit_snapshot}`,
        start_date: m.start_date,
        end_date: m.end_date,
        status: m.status,
      };
    });

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

  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    const payments = db.payments.filter((p) => p.gym_id === gymId);
    const formatted = payments.map((p) => {
      const member = db.members.find((m) => m.id === p.member_id);
      const membership = db.member_memberships.find((m) => m.id === p.membership_id);
      return {
        member_name: member?.full_name || '',
        member_mobile: member?.mobile || '',
        plan_name: membership?.plan_name_snapshot || '',
        amount: p.amount,
        payment_method: p.payment_method.toUpperCase(),
        payment_date: p.payment_date,
        transaction_reference: p.transaction_reference || '',
        notes: p.notes || '',
      };
    });

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

export async function exportPlansCsvAction(): Promise<string> {
  const { gymId } = await requireGymAccess();

  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    const plans = db.membership_plans.filter((p) => p.gym_id === gymId);
    const formatted = plans.map((p) => ({
      name: p.name,
      duration: `${p.duration_value} ${p.duration_unit}`,
      price: p.price,
      status: p.is_active ? 'Active' : 'Deactivated',
      description: p.description || '',
      created_at: p.created_at,
    }));

    const columns = [
      { key: 'name' as const, header: 'Plan Name' },
      { key: 'duration' as const, header: 'Duration' },
      { key: 'price' as const, header: 'Price (₹)' },
      { key: 'status' as const, header: 'Status' },
      { key: 'description' as const, header: 'Description' },
      { key: 'created_at' as const, header: 'Created Date' },
    ];

    return generateCsv(formatted, columns);
  }

  const supabase = await createClient();
  const { data: plans, error } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('gym_id', gymId)
    .order('created_at', { ascending: false });

  if (error || !plans) throw new Error('Failed to fetch membership plans for export.');

  const formatted = plans.map((p) => ({
    name: p.name,
    duration: `${p.duration_value} ${p.duration_unit}`,
    price: p.price,
    status: p.is_active ? 'Active' : 'Deactivated',
    description: p.description || '',
    created_at: p.created_at,
  }));

  const columns = [
    { key: 'name' as const, header: 'Plan Name' },
    { key: 'duration' as const, header: 'Duration' },
    { key: 'price' as const, header: 'Price (₹)' },
    { key: 'status' as const, header: 'Status' },
    { key: 'description' as const, header: 'Description' },
    { key: 'created_at' as const, header: 'Created Date' },
  ];

  return generateCsv(formatted, columns);
}

export async function exportFullBackupAction(): Promise<string> {
  const { gymId } = await requireGymAccess();

  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    const backup = {
      app: 'GymManager',
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      gym: db.gyms.find((g) => g.id === gymId) || null,
      plans: db.membership_plans.filter((p) => p.gym_id === gymId),
      members: db.members.filter((m) => m.gym_id === gymId),
      memberships: db.member_memberships.filter((m) => m.gym_id === gymId),
      payments: db.payments.filter((p) => p.gym_id === gymId),
      subscription: db.software_subscriptions.find((s) => s.gym_id === gymId) || null,
    };
    return JSON.stringify(backup, null, 2);
  }

  const supabase = await createClient();
  const [gymRes, plansRes, membersRes, membershipsRes, paymentsRes, subRes] = await Promise.all([
    supabase.from('gyms').select('*').eq('id', gymId).single(),
    supabase.from('membership_plans').select('*').eq('gym_id', gymId),
    supabase.from('members').select('*').eq('gym_id', gymId),
    supabase.from('member_memberships').select('*').eq('gym_id', gymId),
    supabase.from('payments').select('*').eq('gym_id', gymId),
    supabase.from('software_subscriptions').select('*').eq('gym_id', gymId).single(),
  ]);

  const backup = {
    app: 'GymManager',
    version: '1.0.0',
    exported_at: new Date().toISOString(),
    gym: gymRes.data || null,
    plans: plansRes.data || [],
    members: membersRes.data || [],
    memberships: membershipsRes.data || [],
    payments: paymentsRes.data || [],
    subscription: subRes.data || null,
  };

  return JSON.stringify(backup, null, 2);
}
