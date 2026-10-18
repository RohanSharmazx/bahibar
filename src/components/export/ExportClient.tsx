'use client';

import { useState, useTransition } from 'react';
import {
  exportMembersCsvAction,
  exportMembershipsCsvAction,
  exportPaymentsCsvAction,
} from '@/actions/export';
import { downloadCsv } from '@/lib/utils/csv';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Download, Users, CreditCard, IndianRupee, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

export function ExportClient() {
  const [isPending, startTransition] = useTransition();
  const [activeExport, setActiveExport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = (type: 'members' | 'memberships' | 'payments') => {
    setActiveExport(type);
    setError(null);

    startTransition(async () => {
      try {
        let csvContent = '';
        const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
        let filename = '';

        if (type === 'members') {
          csvContent = await exportMembersCsvAction();
          filename = `gym_members_${timestamp}.csv`;
        } else if (type === 'memberships') {
          csvContent = await exportMembershipsCsvAction();
          filename = `gym_memberships_${timestamp}.csv`;
        } else if (type === 'payments') {
          csvContent = await exportPaymentsCsvAction();
          filename = `gym_payments_${timestamp}.csv`;
        }

        downloadCsv(csvContent, filename);
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

      <div className="rounded-xl bg-sky-50 border border-sky-100 p-4 text-sm text-sky-800 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Sanitized & Excel-Ready Exports</p>
          <p className="text-xs text-sky-700 mt-0.5">
            All CSV exports are protected against spreadsheet formula injection and formatted in UTF-8
            BOM so Indian Rupee (₹) symbols open correctly in Microsoft Excel, Google Sheets, and LibreOffice.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              className="w-full gap-2"
              isLoading={isPending && activeExport === 'members'}
              onClick={() => handleExport('members')}
            >
              <Download className="h-4 w-4" />
              Download Members CSV
            </Button>
          </CardContent>
        </Card>

        {/* Export Memberships */}
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
              className="w-full gap-2"
              variant="outline"
              isLoading={isPending && activeExport === 'memberships'}
              onClick={() => handleExport('memberships')}
            >
              <Download className="h-4 w-4" />
              Download Plans CSV
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
              className="w-full gap-2"
              variant="outline"
              isLoading={isPending && activeExport === 'payments'}
              onClick={() => handleExport('payments')}
            >
              <Download className="h-4 w-4" />
              Download Payments CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
