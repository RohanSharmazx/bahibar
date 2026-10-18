import { getCurrentGymData, updateGymAction } from '@/actions/gym';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/dates';
import { Building2, Shield, Calendar, Sparkles } from 'lucide-react';

export default async function SettingsPage() {
  const { gym, subscription } = await getCurrentGymData();

  if (!gym) return null;

  async function handleGymUpdate(formData: FormData) {
    'use server';
    await updateGymAction(null, formData);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gym Settings</h1>
        <p className="text-sm text-slate-500">
          Manage gym business profile details and software subscription status
        </p>
      </div>

      {/* Gym Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Gym Business Profile</CardTitle>
          <CardDescription>
            These details appear on your member receipts and reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleGymUpdate} className="space-y-4">
            <Input
              label="Gym Name"
              id="name"
              name="name"
              required
              defaultValue={gym.name}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Owner / Contact Person"
                id="owner_name"
                name="owner_name"
                required
                defaultValue={gym.owner_name}
              />
              <Input
                label="Official Contact Number"
                id="contact_number"
                name="contact_number"
                type="tel"
                required
                defaultValue={gym.contact_number}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="address" className="block text-sm font-medium text-slate-700">
                Gym Location Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                defaultValue={gym.address || ''}
                className="flex w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit">
                Save Profile Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
