'use client';

import { useActionState } from 'react';
import { submitPilotInterestAction, type PilotActionState } from '@/actions/pilot';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { CheckCircle2, Building, MapPin, Users, Phone, Mail, HelpCircle, Send } from 'lucide-react';

export function EarlyAccessSection() {
  const [state, formAction, isPending] = useActionState(submitPilotInterestAction, null);

  return (
    <section id="early-access" className="py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden scroll-mt-16 sm:scroll-mt-20">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-800">
            Limited Pilot Enrollment
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Join the early-access pilot
          </h2>
          <p className="text-base text-slate-300 leading-relaxed">
            We are partnering with select independent gyms across India to refine BahiBar. Pilot gyms
            receive free software access and direct developer onboarding.
          </p>
        </div>

        {/* Registration Form Card */}
        <div className="mt-12 max-w-2xl mx-auto bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-xs">
          {state?.success ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Application Received!</h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                {state.message}
              </p>
              <div className="pt-4 border-t border-slate-700/60 text-xs text-slate-400">
                Have questions in the meantime? You can explore the interactive demo above or check our FAQ below.
              </div>
            </div>
          ) : (
            <form action={formAction} className="space-y-5 text-left">
              {state?.error && (
                <div className="rounded-xl bg-rose-950/60 border border-rose-800 p-3.5 text-xs text-rose-300">
                  {state.error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gym Name */}
                <div className="space-y-1.5">
                  <label htmlFor="gym_name" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-sky-400" />
                    Gym Name *
                  </label>
                  <input
                    id="gym_name"
                    name="gym_name"
                    type="text"
                    required
                    placeholder="e.g. Iron Fitness"
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                  />
                  {state?.fieldErrors?.gym_name && (
                    <p className="text-[11px] text-rose-400">{state.fieldErrors.gym_name[0]}</p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label htmlFor="city" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-sky-400" />
                    City *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    placeholder="e.g. Pune, Jaipur, Lucknow"
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                  />
                  {state?.fieldErrors?.city && (
                    <p className="text-[11px] text-rose-400">{state.fieldErrors.city[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contact Name */}
                <div className="space-y-1.5">
                  <label htmlFor="contact_name" className="text-xs font-semibold text-slate-200">
                    Owner / Manager Name *
                  </label>
                  <input
                    id="contact_name"
                    name="contact_name"
                    type="text"
                    required
                    placeholder="Your name"
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                  />
                  {state?.fieldErrors?.contact_name && (
                    <p className="text-[11px] text-rose-400">{state.fieldErrors.contact_name[0]}</p>
                  )}
                </div>

                {/* Active Member Count */}
                <div className="space-y-1.5">
                  <label htmlFor="member_count" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-sky-400" />
                    Approximate Member Count *
                  </label>
                  <select
                    id="member_count"
                    name="member_count"
                    required
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                    defaultValue="50-150 members"
                  >
                    <option value="Under 50 members">Under 50 members</option>
                    <option value="50-150 members">50 - 150 members</option>
                    <option value="150-300 members">150 - 300 members</option>
                    <option value="300+ members">300+ members</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contact Phone (Essential for WhatsApp / Call) */}
                <div className="space-y-1.5">
                  <label htmlFor="contact_phone" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-sky-400" />
                    Mobile Number (WhatsApp) *
                  </label>
                  <input
                    id="contact_phone"
                    name="contact_phone"
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none font-mono"
                  />
                  {state?.fieldErrors?.contact_phone && (
                    <p className="text-[11px] text-rose-400">{state.fieldErrors.contact_phone[0]}</p>
                  )}
                </div>

                {/* Contact Email (Optional) */}
                <div className="space-y-1.5">
                  <label htmlFor="contact_email" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    Email Address (Optional)
                  </label>
                  <input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    placeholder="name@example.com"
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                  />
                  {state?.fieldErrors?.contact_email && (
                    <p className="text-[11px] text-rose-400">{state.fieldErrors.contact_email[0]}</p>
                  )}
                </div>
              </div>

              {/* Optional Problem Statement */}
              <div className="space-y-1.5">
                <label htmlFor="primary_challenge" className="text-xs font-semibold text-slate-200">
                  What is your biggest daily register problem? (Optional)
                </label>
                <textarea
                  id="primary_challenge"
                  name="primary_challenge"
                  rows={2}
                  placeholder="e.g. Tracking fee installments, remembering upcoming expiries, or member phone lookups..."
                  className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  isLoading={isPending}
                  className="w-full h-12 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Pilot Application
                </Button>
              </div>

              <p className="text-center text-[11px] text-slate-400">
                Your contact information is only used to coordinate pilot testing. We do not spam or share your details.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
