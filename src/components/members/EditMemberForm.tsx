'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { updateMemberAction } from '@/actions/members';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import type { Member } from '@/types';

interface EditMemberFormProps {
  member: Member;
}

export function EditMemberForm({ member }: EditMemberFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateMemberAction.bind(null, member.id),
    null
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Member Profile</CardTitle>
        <CardDescription>Update member contact and demographic details</CardDescription>
      </CardHeader>
      <CardContent>
        {state?.error && (
          <div className="mb-4">
            <Alert variant="danger" title="Validation Error">
              {state.error}
            </Alert>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              id="full_name"
              name="full_name"
              required
              defaultValue={member.full_name}
              error={state?.fieldErrors?.full_name?.[0]}
            />
            <Input
              label="Mobile Number"
              id="mobile"
              name="mobile"
              type="tel"
              required
              defaultValue={member.mobile}
              error={state?.fieldErrors?.mobile?.[0]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              defaultValue={member.email || ''}
              error={state?.fieldErrors?.email?.[0]}
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
            <Link href={`/members/${member.id}`}>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={isPending} disabled={isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
