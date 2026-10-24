'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import { BahiBarLogo } from '@/components/ui/logo';
import { LanguageToggle, useI18n } from '@/lib/i18n/context';

interface LandingHeaderProps {
  userLoggedIn?: boolean;
}

export function LandingHeader({ userLoggedIn }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useI18n();

  const navLinks = [
    { label: t('landing.navHowItWorks'), href: '#story' },
    { label: t('landing.navFeatures'), href: '#benefits' },
    { label: t('landing.navDataPrivacy'), href: '#security' },
    { label: t('landing.navFaq'), href: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2" aria-label="BahiBar Home">
          <BahiBarLogo size="sm" />
          <span className="hidden sm:inline-block rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#087FDB] border border-sky-100">
            {t('landing.heroPill').split('•')[0].trim()}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-600">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-[#087FDB] transition-colors py-1"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#087FDB] transition-colors py-1 inline-flex items-center gap-1 text-slate-500 hover:text-slate-900"
          >
            GitHub
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <LanguageToggle />

          {userLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#087FDB] px-4 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-[#0669b6] transition-colors"
            >
              {t('common.dashboard')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                {t('common.signIn')}
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#087FDB] px-4 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-[#0669b6] active:bg-[#055393] transition-colors"
              >
                {t('common.freeTrial')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Header Actions (Visible on small screens) */}
        <div className="flex sm:hidden items-center gap-2">
          <LanguageToggle />

          {userLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-[#087FDB] px-3 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-[#0669b6] active:bg-[#055393] transition-colors"
            >
              {t('common.dashboard')}
              <ArrowRight className="h-3 w-3" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              {t('common.signIn')}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 cursor-pointer min-h-[44px] min-w-[44px]"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown & Backdrop */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay: tapping outside dismisses the menu */}
          <div
            className="fixed inset-0 top-16 bg-slate-900/40 backdrop-blur-xs z-30 sm:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="relative z-40 border-b border-slate-200 bg-white px-4 py-4 sm:hidden space-y-3 shadow-xl">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#087FDB] active:bg-slate-100 transition-colors min-h-[44px] flex items-center"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {userLoggedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-11 items-center justify-center rounded-lg bg-[#087FDB] text-sm font-semibold text-white shadow-xs hover:bg-[#0669b6] active:bg-[#055393] min-h-[44px]"
                >
                  {t('common.dashboard')}
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-11 items-center justify-center rounded-lg bg-[#087FDB] text-sm font-semibold text-white shadow-xs hover:bg-[#0669b6] active:bg-[#055393] min-h-[44px]"
                  >
                    {t('common.freeTrial')}
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 min-h-[44px]"
                  >
                    {t('landing.signInLink')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
