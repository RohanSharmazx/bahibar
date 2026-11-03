'use client';

import React from 'react';
import {
  Search,
  CalendarClock,
  IndianRupee,
  Receipt,
  DownloadCloud,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';

interface BenefitItem {
  icon: any;
  title: string;
  badge: string;
  description: string;
  details: string[];
  storyStepHref: string;
  storyStepLabel: string;
}

const BENEFITS_EN: BenefitItem[] = [
  {
    icon: Search,
    title: 'Find member records quickly',
    badge: 'Live in App',
    description: 'Instant search across member names or 10-digit mobile numbers without flipping paper pages.',
    details: [
      'Filters instantly from the 2nd character typed',
      'Emergency contacts, medical notes, and active plan details at a glance',
      'Zero risk of torn pages or misplaced index tabs',
    ],
    storyStepHref: '#story',
    storyStepLabel: 'See Member Search in Demo →',
  },
  {
    icon: CalendarClock,
    title: 'Track expiry and renewals',
    badge: 'Live in App',
    description: 'Automated calendar-month anniversary calculation with month-end and leap-year clamping.',
    details: [
      'Clear status indicators: Active, Expiring in 7 Days, and Expired',
      'Accurate anniversary math (e.g. 18 Oct + 3 Months = 18 Jan)',
      '1-click renewal continuation from the day after expiry',
    ],
    storyStepHref: '#story',
    storyStepLabel: 'See Expiry Logic in Demo →',
  },
  {
    icon: IndianRupee,
    title: 'Understand payments and outstanding dues',
    badge: 'Live in App',
    description: 'Clear financial tracking between collected revenue and unpaid installment dues across all members.',
    details: [
      'Live mathematical tracking: Agreed Fee − Total Paid = Balance Due',
      'Supports UPI, Cash, and Card with transaction reference tags',
      'Immutable payment audit log that protects historical records',
    ],
    storyStepHref: '#story',
    storyStepLabel: 'See Payment Recording in Demo →',
  },
  {
    icon: Receipt,
    title: 'Create receipts and export records',
    badge: 'Live in App',
    description: 'Produce clean fee receipts in 1 tap and export your entire database anytime with zero lock-in.',
    details: [
      'Client-side PDF vouchers and pre-formatted WhatsApp slips',
      'Direct browser printing formatted for desk & thermal printers',
      '1-click UTF-8 BOM CSV exports safe from formula injection',
    ],
    storyStepHref: '#story',
    storyStepLabel: 'See Receipt Voucher in Demo →',
  },
];

const BENEFITS_HI: BenefitItem[] = [
  {
    icon: Search,
    title: 'सदस्य रिकॉर्ड तेजी से खोजें',
    badge: 'उपलब्ध',
    description: 'कागजी रजिस्टर पलटे बिना सदस्य के नाम या 10 अंकों के मोबाइल नंबर से तुरंत खोजें।',
    details: [
      'टाइप किए गए दूसरे अक्षर से तुरंत फ़िल्टर होता है',
      'इमरजेंसी संपर्क, मेडिकल नोट्स और एक्टिव प्लान एक नज़र में',
      'पन्ने फटने या रजिस्टर खोने का कोई जोखिम नहीं',
    ],
    storyStepHref: '#story',
    storyStepLabel: 'डेमो में सदस्य खोज देखें →',
  },
  {
    icon: CalendarClock,
    title: 'समाप्ति और नवीनीकरण ट्रैक करें',
    badge: 'उपलब्ध',
    description: 'महीने के अंत और लीप-वर्ष समायोजन के साथ स्वचालित कैलेंडर-माह वर्षगांठ गणना।',
    details: [
      'स्पष्ट स्थिति संकेतक: सक्रिय, 7 दिनों में समाप्त, और समाप्त',
      'सटीक तारीख गणना (जैसे 18 अक्टूबर + 3 माह = 18 जनवरी)',
      'समाप्ति के अगले दिन से 1-क्लिक नवीनीकरण जारी रखें',
    ],
    storyStepHref: '#story',
    storyStepLabel: 'डेमो में समाप्ति लॉजिक देखें →',
  },
  {
    icon: IndianRupee,
    title: 'भुगतान और बकाया फीस समझें',
    badge: 'उपलब्ध',
    description: 'सभी सदस्यों के बीच एकत्रित राजस्व और बकाया किस्तों का स्पष्ट वित्तीय हिसाब।',
    details: [
      'लाइव गणितीय गणना: तय शुल्क − कुल भुगतान = शेष बकाया',
      'लेन-देन संदर्भ टैग के साथ UPI, नकद और कार्ड समर्थित',
      'अपरिवर्तनीय भुगतान रिकॉर्ड जो पुराने डेटा की सुरक्षा करता है',
    ],
    storyStepHref: '#story',
    storyStepLabel: 'डेमो में भुगतान प्रविष्टि देखें →',
  },
  {
    icon: Receipt,
    title: 'रसीद बनाएं और रिकॉर्ड निर्यात करें',
    badge: 'उपलब्ध',
    description: '1 टैप में साफ रसीद बनाएं और बिना किसी लॉक-इन के कभी भी अपना पूरा डेटाबेस डाउनलोड करें।',
    details: [
      'क्लाइंट-साइड पीडीएफ वाउचर और पहले से स्वरूपित व्हाट्सएप स्लिप',
      'डेस्क और थर्मल प्रिंटर के लिए सीधा ब्राउज़र प्रिंटिंग',
      '1-क्लिक UTF-8 BOM CSV एक्सेल निर्यात',
    ],
    storyStepHref: '#story',
    storyStepLabel: 'डेमो में रसीद वाउचर देखें →',
  },
];

export function BenefitsSection() {
  const { t, locale } = useI18n();
  const benefits = locale === 'hi' ? BENEFITS_HI : BENEFITS_EN;

  return (
    <section id="benefits" className="py-16 sm:py-24 bg-white border-b border-slate-200/80 scroll-mt-16 sm:scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#087FDB] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            {t('landing.benefitsTitle')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101F33]">
            {t('landing.benefitsHeadline')}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {t('landing.benefitsCopy')}
          </p>
        </div>

        {/* 4 Core Implemented Benefits Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-[#087FDB]/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-[#087FDB] border border-sky-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      {b.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#101F33] leading-snug">{b.title}</h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {b.description}
                    </p>
                  </div>

                  <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                    {b.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100">
                  <a
                    href={b.storyStepHref}
                    className="text-xs font-bold text-[#087FDB] hover:text-[#0669b6] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>{b.storyStepLabel}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Honest Pilot Scope Distinction Banner */}
        <div className="mt-12 rounded-2xl border border-sky-100 bg-sky-50/60 p-5 sm:p-6 text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087FDB] uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            {locale === 'hi' ? 'पारदर्शी उत्पाद रोडमैप' : 'Transparent Product Roadmap'}
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {locale === 'hi'
              ? 'ऊपर दी गई सभी 4 मुख्य सुविधाएं ऐप में पूरी तरह से सक्रिय और चालू हैं। अतिरिक्त सुविधाएं (जैसे बायोमेट्रिक टर्नस्टाइल और स्वचालित एसएमएस गेटवे) भविष्य के रोडमैप पर हैं और अभी शामिल नहीं हैं।'
              : 'All 4 core capabilities above reflect live, functional workflows in the application. Additional capabilities (such as biometric turnstiles and automated SMS gateways) remain on the design roadmap and are not advertised as available.'}
          </p>
        </div>
      </div>
    </section>
  );
}
