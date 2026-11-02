import { notFound } from 'next/navigation';
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
    <div className="max-w-2xl mx-auto">
      <EditPlanForm plan={plan} />
    </div>
  );
}
