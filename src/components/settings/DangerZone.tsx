'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { AlertTriangle, Download, Trash2, ShieldAlert } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { deleteGymAction, type DeleteGymActionState } from '@/actions/gym';
import type { Gym } from '@/types';

interface DangerZoneProps {
  gym: Gym;
}

export function DangerZone({ gym }: DangerZoneProps) {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typedGymName, setTypedGymName] = useState('');
  const [password, setPassword] = useState('');

  const [state, formAction, isPending] = useActionState<DeleteGymActionState | null, FormData>(
    deleteGymAction,
    null
  );

  const isNameMatched = typedGymName.trim() === gym.name.trim();
  const canSubmit = isNameMatched && password.length >= 6 && !isPending;

  return (
    <>
      <Card className="border-rose-200 bg-rose-50/20">
        <CardHeader className="pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="text-rose-900 text-base font-bold">
                {t.settings.dangerZoneTitle}
              </CardTitle>
              <CardDescription className="text-rose-700 text-xs">
                {t.settings.dangerZoneSubtitle}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {t.settings.deleteGymActionTitle}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {t.settings.deleteGymWarning}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Workspace Isolation: Deletion is strictly scoped to &quot;{gym.name}&quot;. Your login credentials and any other registered gym facilities remain completely safe and active.
            </p>
          </div>

          {/* Backup prompt recommendation before deletion */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-start gap-2.5">
              <Download className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
              <span>{t.settings.backupReminder}</span>
            </div>
            <Link
              href="/export"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-amber-300 font-semibold text-amber-900 hover:bg-amber-100/50 transition-colors shrink-0 min-h-[44px]"
            >
              <Download className="h-4 w-4" />
              <span>{t.settings.backupNowButton}</span>
            </Link>
          </div>

          <div className="pt-2 flex justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTypedGymName('');
                setPassword('');
                setIsModalOpen(true);
              }}
              className="border-rose-300 text-rose-700 hover:bg-rose-100/60 hover:text-rose-800 font-semibold min-h-[44px] flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4 text-rose-600" />
              <span>{t.settings.deleteGymButton}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isPending) {
            setIsModalOpen(false);
          }
        }}
        title={t.settings.confirmModalTitle}
      >
        <form action={formAction} className="space-y-4 pt-1">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800 leading-relaxed">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900">{t.settings.confirmModalWarning}</p>
              <p className="mt-1 text-rose-700">
                Gym: <strong className="font-bold underline">{gym.name}</strong>
              </p>
            </div>
          </div>

          {state?.error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-slate-700">
              {t.settings.typeGymNameToConfirm}
            </label>
            <Input
              type="text"
              name="confirm_name"
              value={typedGymName}
              onChange={(e) => setTypedGymName(e.target.value)}
              placeholder={gym.name}
              autoComplete="off"
              className="font-mono text-sm"
              required
            />
            {!isNameMatched && typedGymName.length > 0 && (
              <p className="text-[11px] text-rose-600 font-medium">
                Name does not match &quot;{gym.name}&quot;
              </p>
            )}
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-slate-700">
              {t.settings.enterPasswordToConfirm}
            </label>
            <Input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="text-sm"
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto min-h-[44px] text-xs sm:text-sm font-medium px-4 py-2.5 whitespace-normal break-words cursor-pointer"
            >
              {t.settings.cancelButton}
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isPending}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-semibold min-h-[44px] text-xs sm:text-sm px-4 py-2.5 flex items-center justify-center gap-2 whitespace-normal break-words cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  <span>{t.settings.deletingButton}</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 shrink-0" />
                  <span>{t.settings.confirmDeleteButton}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
