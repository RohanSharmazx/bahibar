import { getCurrentGymData } from '@/actions/gym';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/dates';
import { Shield } from 'lucide-react';

export default async function SettingsPage() {
  const { gym, subscription } = await getCurrentGymData();

  if (!gym) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gym Settings</h1>
        <p className="text-sm text-slate-500">
          Manage gym business profile details and software subscription status
        </p>
      </div>

      {/* Gym Profile Form with Feedback */}
      <SettingsForm gym={gym} />

      {/* Software Subscription Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>GymManager Software Subscription</CardTitle>
              <CardDescription>
                Application access license (separate from your gym member packages)
              </CardDescription>
            </div>
            {subscription?.status === 'trial' ? (
              <Badge variant="warning">Free Trial</Badge>
            ) : subscription?.status === 'active' ? (
              <Badge variant="success">Active</Badge>
            ) : (
              <Badge variant="danger">Expired</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
            <div>
              <span className="text-xs text-slate-500 uppercase">License Plan</span>
              <p className="font-bold text-slate-900 capitalize mt-0.5">
                {subscription?.plan_name || 'Trial'}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase">Started On</span>
              <p className="font-semibold text-slate-900 mt-0.5">
                {subscription?.start_date ? formatDate(subscription.start_date) : '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase">Valid Until</span>
              <p className="font-semibold text-slate-900 mt-0.5">
                {subscription?.end_date ? formatDate(subscription.end_date) : '—'}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Shield className="h-4 w-4 text-sky-600" />
              <span>Safety Guarantee</span>
            </div>
            <p>
              Even if a software subscription period expires, your data is never silently deleted or
              locked away. You will always be able to log in, view your members, and export all your
              records to CSV spreadsheets at any time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
