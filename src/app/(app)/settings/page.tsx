import { getCurrentGymData } from '@/actions/gym';
import { getSubscriptionBillingDetailsAction } from '@/actions/subscription';
import { SettingsClient } from '@/components/settings/SettingsClient';

export default async function SettingsPage() {
  const { gym, subscription, role } = await getCurrentGymData();

  if (!gym) return null;

  const billingDetails = await getSubscriptionBillingDetailsAction();

  return (
    <SettingsClient
      gym={gym}
      subscription={subscription}
      role={role}
      billingDetails={billingDetails}
    />
  );
}
