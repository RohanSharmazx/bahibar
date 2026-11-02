import { notFound } from 'next/navigation';
import { getMemberByIdAction } from '@/actions/members';
import { EditMemberForm } from '@/components/members/EditMemberForm';

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const member = await getMemberByIdAction(id);

  if (!member) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <EditMemberForm member={member} />
    </div>
  );
}
