'use client';

import { useState, useTransition } from 'react';
import {
  exportMembersCsvAction,
  exportMembershipsCsvAction,
  exportPaymentsCsvAction,
  exportPlansCsvAction,
  exportFullBackupAction,
} from '@/actions/export';
import { downloadCsv, downloadJson } from '@/lib/utils/csv';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Download, Users, CreditCard, IndianRupee, ShieldCheck, Database, CheckCircle2, Layers } from 'lucide-react';
import { format } from 'date-fns';

export function ExportClient() {
  const [isPending, startTransition] = useTransition();
  const [activeExport, setActiveExport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
          setSuccessMessage('Members directory CSV downloaded successfully.');
        } else if (type === 'plans') {
          const csvContent = await exportPlansCsvAction();
          downloadCsv(csvContent, `gym_plans_${timestamp}.csv`);
          setSuccessMessage('Membership plans CSV downloaded successfully.');
        } else if (type === 'memberships') {
          const csvContent = await exportMembershipsCsvAction();
          downloadCsv(csvContent, `gym_membership_periods_${timestamp}.csv`);
          setSuccessMessage('Membership periods history CSV downloaded successfully.');
        } else if (type === 'payments') {
          const csvContent = await exportPaymentsCsvAction();
          downloadCsv(csvContent, `gym_payments_${timestamp}.csv`);
          setSuccessMessage('Payment ledger CSV downloaded successfully.');
        } else if (type === 'backup') {
          const jsonContent = await exportFullBackupAction();
          downloadJson(jsonContent, `gym_full_backup_${timestamp}.json`);
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

        {/* Complete Database Backup */}
        <Card className="flex flex-col justify-between md:col-span-2 lg:col-span-2 border-sky-200 bg-sky-50/30">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 mb-2">
              <Database className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Complete Database Backup (JSON)</CardTitle>
            <CardDescription>
              Full offline data backup combining gym settings, plans, members, enrollment histories, and payment transactions into a single structured file for disaster recovery.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              className="w-full sm:w-auto gap-2 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
              isLoading={isPending && activeExport === 'backup'}
              onClick={() => handleExport('backup')}
            >
              <Download className="h-4 w-4" />
              Download Full Backup JSON
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
