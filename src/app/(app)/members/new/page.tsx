import { getPlansAction } from '@/actions/plans';
import { AddMemberForm } from '@/components/members/AddMemberForm';

export default async function NewMemberPage() {
  const plans = await getPlansAction(true); // Fetch active plans only

  return <AddMemberForm plans={plans} />;
}
