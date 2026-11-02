import { getPaymentsHistoryAction, getCollectionSummaryAction } from '@/actions/payments';
import { getCurrentGymData } from '@/actions/gym';
import { PaymentsViewClient } from '@/components/payments/PaymentsViewClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PaymentsPage() {
  const [payments, collections, gymData] = await Promise.all([
    getPaymentsHistoryAction(),
    getCollectionSummaryAction(),
    getCurrentGymData(),
  ]);

  return (
    <PaymentsViewClient
      payments={payments}
      collections={collections}
      gymData={gymData}
    />
  );
}
