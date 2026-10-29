import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getMemberByIdAction } from '@/actions/members';
import { EditMemberForm } from '@/components/members/EditMemberForm';
import { ArrowLeft } from 'lucide-react';

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
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href={`/members/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Member Profile
      </Link>

      <EditMemberForm member={member} />
    </div>
  );
}
