'use client';

import Link from 'next/link';
import { BahiBarLogo } from '@/components/ui/logo';
import { useI18n } from '@/lib/i18n/context';

export function LandingFooter() {
  const { t, locale } = useI18n();
  const isHi = locale === 'hi';

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
              {t('landing.navHowItWorks')}
            </a>
            <a href="#benefits" className="hover:text-[#12BBDD] transition-colors py-2 min-h-[44px] inline-flex items-center">
              {t('landing.navFeatures')}
            </a>
            <a href="#security" className="hover:text-[#12BBDD] transition-colors py-2 min-h-[44px] inline-flex items-center">
              {t('landing.navDataPrivacy')}
            </a>
            <a href="#faq" className="hover:text-[#12BBDD] transition-colors py-2 min-h-[44px] inline-flex items-center">
              {t('landing.navFaq')}
            </a>
            <Link href="/login" className="hover:text-[#12BBDD] transition-colors py-2 min-h-[44px] inline-flex items-center">
              {t('common.signIn')}
            </Link>
            <Link href="/register" className="text-[#12BBDD] hover:underline font-bold py-2 min-h-[44px] inline-flex items-center">
              {isHi ? 'फ्री एक्सेस प्राप्त करें →' : 'Get Free Access →'}
            </Link>
          </div>
        </div>

        {/* Legal, Support & Copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center sm:text-left">
          <p>
            {isHi
              ? `© ${new Date().getFullYear()} बहीबार (BahiBar) • जिम रिकॉर्ड्स, व्यवस्थित। भारत भर के स्वतंत्र जिम मालिकों के लिए निर्मित।`
              : `© ${new Date().getFullYear()} BahiBar. Gym records, sorted. Built for independent gym owners across India.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <Link href="/privacy" className="hover:text-white transition-colors">
              {isHi ? 'गोपनीयता नीति' : 'Privacy Policy'}
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              {isHi ? 'सेवा की शर्तें' : 'Terms of Service'}
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
