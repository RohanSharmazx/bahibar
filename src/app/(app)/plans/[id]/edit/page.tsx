import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getPlanByIdAction } from '@/actions/plans';
import { EditPlanForm } from '@/components/plans/EditPlanForm';

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const plan = await getPlanByIdAction(id);

  if (!plan) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/plans"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Plans
      </Link>

      <EditPlanForm plan={plan} />
    </div>
  );
}
