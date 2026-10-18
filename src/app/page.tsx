import Link from 'next/link';
import { Dumbbell, Users, IndianRupee, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { getUser } from '@/lib/supabase/auth-helpers';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getUser();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xs sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Gym<span className="text-sky-600">Manager</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white shadow-xs hover:bg-sky-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center justify-center rounded-lg px-3.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white shadow-xs hover:bg-sky-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3.5 py-1 text-xs font-semibold text-sky-700 border border-sky-200 mb-6">
          <ShieldCheck className="h-4 w-4" /> Built for Local Gym Owners in India
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 max-w-3xl leading-tight">
          Say goodbye to physical registers. Manage your gym{' '}
          <span className="text-sky-600">safely & digitally</span>.
        </h1>

        <p className="mt-4 text-lg text-slate-600 max-w-2xl">
          Track members, calculate subscription expiry dates automatically, record cash & UPI fees,
          and see outstanding dues at a glance.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href={user ? '/dashboard' : '/register'}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-sky-600 px-8 text-base font-semibold text-white shadow-md hover:bg-sky-700 transition-colors"
          >
            {user ? 'Open Gym Dashboard' : 'Start 30-Day Free Trial'}
            <ArrowRight className="h-4 w-4" />
          </Link>
          {!user && (
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-8 text-base font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
            >
              Sign In Existing Gym
            </Link>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 mb-4">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Member Registrations</h3>
            <p className="mt-2 text-sm text-slate-500">
              Select standard or custom plans. Expiry dates calculate automatically with proper
              calendar month-end logic.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-4">
              <IndianRupee className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Fees & Outstanding Dues</h3>
            <p className="mt-2 text-sm text-slate-500">
              Track full & partial payments. See exactly who owes fees and audit daily cash and UPI
              collections.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Your Data Stays Yours</h3>
            <p className="mt-2 text-sm text-slate-500">
              Strict database isolation prevents cross-gym leaks. Export sanitized CSV backups
              anytime.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>GymManager — Digital gym management made simple and safe.</p>
      </footer>
    </div>
  );
}
