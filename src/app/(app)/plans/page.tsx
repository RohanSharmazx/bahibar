import { getPlansAction } from '@/actions/plans';
import { PlansListClient } from '@/components/plans/PlansListClient';

export default async function PlansPage() {
  const plans = await getPlansAction(false);

  return <PlansListClient plans={plans} />;
}
