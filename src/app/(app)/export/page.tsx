import { ExportClient } from '@/components/export/ExportClient';

export default function ExportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Export Gym Records</h1>
        <p className="text-sm text-slate-500">
          Download complete data backups and spreadsheets of your members, plans, and payments
        </p>
      </div>

      <ExportClient />
    </div>
  );
}
