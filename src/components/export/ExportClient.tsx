'use client';

import { useState, useTransition } from 'react';
import {
  exportMembersCsvAction,
  exportMembershipsCsvAction,
  exportPaymentsCsvAction,
  exportPlansCsvAction,
  exportFullBackupAction,
  validateAndPreviewBackupAction,
  restoreFullBackupAction,
  type BackupPreviewResult,
} from '@/actions/export';
import { downloadCsv, downloadJson } from '@/lib/utils/csv';
import { trackDataExported } from '@/lib/analytics';
import { formatCurrency } from '@/lib/utils/currency';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { Download, Upload, Users, CreditCard, IndianRupee, ShieldCheck, Database, CheckCircle2, Layers } from 'lucide-react';
import { format } from 'date-fns';

export function ExportClient() {
  const [isPending, startTransition] = useTransition();
  const [activeExport, setActiveExport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Restore states
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<NonNullable<BackupPreviewResult['preview']> | null>(null);
  const [restoreFileContent, setRestoreFileContent] = useState<string | null>(null);
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [confirmText, setConfirmText] = useState('');

  const handleFileSelectedForRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          setError('Selected file is empty.');
          return;
        }

        const preview = await validateAndPreviewBackupAction(text);
        if (!preview.valid || !preview.preview) {
          setError(preview.error || 'The selected backup file is not valid.');
          return;
        }

        setRestoreFileContent(text);
        setPreviewData(preview.preview);
        setRestoreMode('merge');
        setConfirmText('');
        setIsRestoreModalOpen(true);
      } catch (err: any) {
        setError(err.message || 'Failed to read backup file.');
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = () => {
    if (!restoreFileContent || confirmText.trim().toUpperCase() !== 'RESTORE') return;

    setError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const res = await restoreFullBackupAction(restoreFileContent, restoreMode);
        if (!res.success) {
          setError(res.error || 'Failed to restore backup.');
          return;
        }

        setIsRestoreModalOpen(false);
        setRestoreFileContent(null);
        setPreviewData(null);
        setConfirmText('');
        setSuccessMessage(res.message || 'Backup restored successfully!');
      } catch (err: any) {
        setError(err.message || 'An error occurred during restoration.');
      }
    });
  };

  const handleExport = (type: 'members' | 'plans' | 'memberships' | 'payments' | 'backup') => {
    setActiveExport(type);
    setError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');

        if (type === 'members') {
          const csvContent = await exportMembersCsvAction();
          downloadCsv(csvContent, `gym_members_${timestamp}.csv`);
          trackDataExported('members_csv');
          setSuccessMessage('Members directory CSV downloaded successfully.');
        } else if (type === 'plans') {
          const csvContent = await exportPlansCsvAction();
          downloadCsv(csvContent, `gym_plans_${timestamp}.csv`);
          trackDataExported('plans_csv');
          setSuccessMessage('Membership plans CSV downloaded successfully.');
        } else if (type === 'memberships') {
          const csvContent = await exportMembershipsCsvAction();
          downloadCsv(csvContent, `gym_membership_periods_${timestamp}.csv`);
          trackDataExported('memberships_csv');
          setSuccessMessage('Membership periods history CSV downloaded successfully.');
        } else if (type === 'payments') {
          const csvContent = await exportPaymentsCsvAction();
          downloadCsv(csvContent, `gym_payments_${timestamp}.csv`);
          trackDataExported('payments_csv');
          setSuccessMessage('Payment ledger CSV downloaded successfully.');
        } else if (type === 'backup') {
          const jsonContent = await exportFullBackupAction();
          downloadJson(jsonContent, `gym_full_backup_${timestamp}.json`);
          trackDataExported('full_backup_json');
          setSuccessMessage('Complete JSON database backup downloaded successfully.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to generate export file.');
      } finally {
        setActiveExport(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="danger" title="Export Error">
          {error}
        </Alert>
      )}

      {successMessage && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="rounded-xl bg-sky-50 border border-sky-100 p-4 text-sm text-sky-800 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Sanitized & Excel-Ready Exports</p>
          <p className="text-xs text-sky-700 mt-0.5">
            All CSV exports are protected against spreadsheet formula injection and formatted with UTF-8
            BOM so Indian Rupee (₹) symbols open correctly in Microsoft Excel, Google Sheets, and LibreOffice.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Export Members */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 mb-2">
              <Users className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Members Directory</CardTitle>
            <CardDescription>
              Complete list of all registered and archived members with phone, email, and joined dates.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              className="w-full gap-2 cursor-pointer"
              isLoading={isPending && activeExport === 'members'}
              onClick={() => handleExport('members')}
            >
              <Download className="h-4 w-4" />
              Download Members CSV
            </Button>
          </CardContent>
        </Card>

        {/* Export Plans */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-2">
              <Layers className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Membership Plans</CardTitle>
            <CardDescription>
              Pricing catalog including plan durations, prices (₹), active status, and descriptions.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              className="w-full gap-2 cursor-pointer"
              variant="outline"
              isLoading={isPending && activeExport === 'plans'}
              onClick={() => handleExport('plans')}
            >
              <Download className="h-4 w-4" />
              Download Plans CSV
            </Button>
          </CardContent>
        </Card>

        {/* Export Memberships Periods */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-2">
              <CreditCard className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Membership Periods</CardTitle>
            <CardDescription>
              All historical enrollments, renewal terms, snapshots of agreed prices, and expiry dates.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              className="w-full gap-2 cursor-pointer"
              variant="outline"
              isLoading={isPending && activeExport === 'memberships'}
              onClick={() => handleExport('memberships')}
            >
              <Download className="h-4 w-4" />
              Download Periods CSV
            </Button>
          </CardContent>
        </Card>

        {/* Export Payments */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 mb-2">
              <IndianRupee className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Payment Ledger</CardTitle>
            <CardDescription>
              Chronological register of every cash, UPI, and card fee collection with transaction IDs.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              className="w-full gap-2 cursor-pointer"
              variant="outline"
              isLoading={isPending && activeExport === 'payments'}
              onClick={() => handleExport('payments')}
            >
              <Download className="h-4 w-4" />
              Download Payments CSV
            </Button>
          </CardContent>
        </Card>

        {/* Complete Database Backup & Disaster Recovery */}
        <Card className="flex flex-col justify-between md:col-span-2 lg:col-span-3 border-sky-200 bg-sky-50/20">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 mb-2">
              <Database className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Data Backup & Recovery Center</CardTitle>
            <CardDescription>
              Export a complete snapshot of all gym records or safely restore from a previous JSON backup file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Button
                className="gap-2 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                isLoading={isPending && activeExport === 'backup'}
                onClick={() => handleExport('backup')}
              >
                <Download className="h-4 w-4" />
                Download Full Backup JSON
              </Button>

              <label className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-purple-300 bg-white px-4 text-sm font-medium text-purple-700 shadow-xs hover:bg-purple-50 transition-colors cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>Restore Backup File...</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileSelectedForRestore}
                  disabled={isPending}
                />
              </label>
            </div>

            <p className="text-xs text-slate-500">
              Backups contain your gym business profile, membership plans, registered members, past enrollment terms, and payment ledgers. Note: Automated browser restore is enabled for pilot and standalone instances; production cloud databases restore via secure migration snapshots.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Restore Preview & Confirmation Modal */}
      {previewData && (
        <Modal
          isOpen={isRestoreModalOpen}
          onClose={() => {
            setIsRestoreModalOpen(false);
            setRestoreFileContent(null);
            setPreviewData(null);
            setConfirmText('');
          }}
          title="Inspect & Restore Backup"
          description="Review the contents of your backup before applying changes."
          maxWidth="lg"
        >
          <div className="space-y-5 py-2">
            {/* Stats summary table */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400">Source Gym</span>
                <p className="font-bold text-slate-900 mt-0.5">{previewData.gymName}</p>
              </div>
              <div>
                <span className="text-slate-400">Exported At</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {previewData.exportedAt.split('T')[0]}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Plans Included</span>
                <p className="font-bold text-slate-900 mt-0.5">{previewData.plansCount}</p>
              </div>
              <div>
                <span className="text-slate-400">Total Members</span>
                <p className="font-bold text-slate-900 mt-0.5">{previewData.membersCount}</p>
              </div>
              <div>
                <span className="text-slate-400">Membership Terms</span>
                <p className="font-bold text-slate-900 mt-0.5">{previewData.membershipsCount}</p>
              </div>
              <div>
                <span className="text-slate-400">Total Collections</span>
                <p className="font-bold text-emerald-700 mt-0.5">
                  {formatCurrency(previewData.totalAmountCollected)}
                </p>
              </div>
            </div>

            {/* Mode selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Restoration Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    restoreMode === 'merge'
                      ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="restoreMode"
                      value="merge"
                      checked={restoreMode === 'merge'}
                      onChange={() => setRestoreMode('merge')}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm font-semibold text-slate-900">Merge (Recommended)</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 pl-5">
                    Adds non-duplicate records without modifying or deleting existing records.
                  </p>
                </label>

                <label
                  className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    restoreMode === 'replace'
                      ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="restoreMode"
                      value="replace"
                      checked={restoreMode === 'replace'}
                      onChange={() => setRestoreMode('replace')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-sm font-semibold text-rose-900">Replace Exact Snapshot</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 pl-5">
                    Replaces current gym records with this backup. Safety rollback copy is saved first.
                  </p>
                </label>
              </div>
            </div>

            {/* Explicit confirmation safety check */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label htmlFor="confirmText" className="text-xs font-medium text-slate-700 block">
                Type <span className="font-bold text-slate-900">RESTORE</span> to confirm:
              </label>
              <input
                id="confirmText"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="RESTORE"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase placeholder:normal-case font-mono focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setRestoreFileContent(null);
                  setPreviewData(null);
                  setConfirmText('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                disabled={confirmText.trim().toUpperCase() !== 'RESTORE' || isPending}
                isLoading={isPending}
                onClick={handleConfirmRestore}
              >
                Apply Restoration
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
