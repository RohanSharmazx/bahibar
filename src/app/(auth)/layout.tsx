import * as React from 'react';
import Link from 'next/link';
import { BahiBarLogo } from '@/components/ui/logo';
import { LanguageToggle } from '@/lib/i18n/context';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex items-center justify-between px-4 mb-6">
        <Link href="/" className="inline-flex items-center group" aria-label="BahiBar Home">
          <BahiBarLogo size="md" showTagline={false} />
        </Link>
        <LanguageToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200 sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
