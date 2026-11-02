'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { updateMemberAction } from '@/actions/members';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import type { Member } from '@/types';

interface EditMemberFormProps {
  member: Member;
}

export function EditMemberForm({ member }: EditMemberFormProps) {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(
    updateMemberAction.bind(null, member.id),
    null
  );

  return (
    <div className="space-y-6">
      <Link
        href={`/members/${member.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.members.backToMemberProfile}
      </Link>

      <Card>
      <CardHeader>
        <CardTitle>{t.members.editMemberTitle}</CardTitle>
        <CardDescription>{t.members.editMemberSubtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {state?.error && (
          <div className="mb-4">
            <Alert variant="danger" title={t.members.validationError}>
              {state.error}
            </Alert>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t.members.fullName}
              id="full_name"
              name="full_name"
              required
              defaultValue={member.full_name}
              error={state?.fieldErrors?.full_name?.[0]}
            />
            <Input
              label={t.members.mobileNumber}
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
              label={t.members.emailAddress}
              id="email"
              name="email"
              type="email"
              defaultValue={member.email || ''}
              error={state?.fieldErrors?.email?.[0]}
            />
            <Select
              label={t.members.gender}
              id="gender"
              name="gender"
              defaultValue={member.gender || ''}
              options={[
                { value: '', label: t.members.selectGenderPlaceholder },
                { value: 'male', label: t.members.male },
                { value: 'female', label: t.members.female },
                { value: 'other', label: t.members.other },
              ]}
            />
            <Input
              label={t.members.dateOfBirth}
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              defaultValue={member.date_of_birth || ''}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t.members.emergencyContact}
              id="emergency_contact"
              name="emergency_contact"
              defaultValue={member.emergency_contact || ''}
            />
            <Input
              label={t.members.address}
              id="address"
              name="address"
              defaultValue={member.address || ''}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
              {t.members.notesLabel}
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={member.notes || ''}
              placeholder={t.members.notesPlaceholder}
              className="flex w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Link href={`/members/${member.id}`}>
              <Button type="button" variant="outline" disabled={isPending}>
                {t.common.cancel}
              </Button>
            </Link>
            <Button type="submit" isLoading={isPending} disabled={isPending}>
              {t.members.saveChangesBtn}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </div>
  );
}
