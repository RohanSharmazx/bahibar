import Link from 'next/link';
import { BahiBarLogo } from '@/components/ui/logo';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-800 bg-[#101F33] py-12 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
            <BahiBarLogo size="sm" showTagline={true} theme="dark" />
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-300">
            <a href="#story" className="hover:text-[#12BBDD] transition-colors py-2 min-h-[44px] inline-flex items-center">
              How It Works
            </a>
            <a href="#benefits" className="hover:text-[#12BBDD] transition-colors py-2 min-h-[44px] inline-flex items-center">
              Features
            </a>
            <a href="#security" className="hover:text-[#12BBDD] transition-colors py-2 min-h-[44px] inline-flex items-center">
              Data & Privacy
            </a>
            <a href="#faq" className="hover:text-[#12BBDD] transition-colors py-2 min-h-[44px] inline-flex items-center">
              FAQ
            </a>
            <Link href="/login" className="hover:text-[#12BBDD] transition-colors py-2 min-h-[44px] inline-flex items-center">
              Sign In
            </Link>
            <Link href="/register" className="text-[#12BBDD] hover:underline font-bold py-2 min-h-[44px] inline-flex items-center">
              Start Free Trial →
            </Link>
          </div>
        </div>

        {/* Legal, Support & Copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} BahiBar. Gym records, sorted. Built for independent gym owners across India.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <a href="mailto:support@bahibar.com" className="hover:text-white transition-colors">
              support@bahibar.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
