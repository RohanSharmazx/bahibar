import { createClient } from '@/lib/supabase/server';
import { requireGymAccess } from '@/lib/supabase/auth-helpers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { updateMemberAction } from '@/actions/members';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import type { Member } from '@/types';

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { gymId } = await requireGymAccess();
  const supabase = await createClient();

  const { data: memberData, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .eq('gym_id', gymId)
    .single();

  if (error || !memberData) {
    notFound();
  }

  const member = memberData as Member;

  async function handleUpdate(formData: FormData) {
    'use server';
    await updateMemberAction(id, null, formData);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href={`/members/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Member Profile
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Member Profile</CardTitle>
          <CardDescription>Update member contact and demographic details</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                id="full_name"
                name="full_name"
                required
                defaultValue={member.full_name}
              />
              <Input
                label="Mobile Number"
                id="mobile"
                name="mobile"
                type="tel"
                required
                defaultValue={member.mobile}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Email"
                id="email"
                name="email"
                type="email"
                defaultValue={member.email || ''}
              />
              <Select
                label="Gender"
                id="gender"
                name="gender"
                defaultValue={member.gender || ''}
                options={[
                  { value: '', label: 'Select gender...' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />
              <Input
                label="Date of Birth"
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                defaultValue={member.date_of_birth || ''}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Emergency Contact"
                id="emergency_contact"
                name="emergency_contact"
                defaultValue={member.emergency_contact || ''}
              />
              <Input
                label="Address / Area"
                id="address"
                name="address"
                defaultValue={member.address || ''}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={member.notes || ''}
                placeholder="Health notes, trainer preferences, locker number..."
                className="flex w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <Link href={`/members/${id}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
