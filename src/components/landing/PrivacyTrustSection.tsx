'use client';

import { ShieldCheck, Download, Database, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

interface Pillar {
  icon: any;
  colorClass: string;
  iconBgClass: string;
  title: string;
  description: string;
  tag: string;
}

const PILLARS_EN: Pillar[] = [
  {
    icon: Lock,
    colorClass: 'text-sky-600',
    iconBgClass: 'bg-sky-100',
    title: 'Gym Workspace Scoping',
    description: "Every member, plan, and fee entry is partitioned by unique gym ID with PostgreSQL Row-Level Security in cloud mode, ensuring each owner only accesses their own gym's data.",
    tag: 'Partitioned by gym workspace',
  },
  {
    icon: Download,
    colorClass: 'text-emerald-600',
    iconBgClass: 'bg-emerald-100',
    title: '1-Click Spreadsheet Exports',
    description: 'You are never locked in. Download your complete members directory, plan catalog, and payment ledger into clean CSV files compatible with Microsoft Excel and Google Sheets.',
    tag: 'Includes UTF-8 BOM formatting',
  },
  {
    icon: ShieldCheck,
    colorClass: 'text-amber-600',
    iconBgClass: 'bg-amber-100',
    title: 'Permanent Payment History',
    description: 'Recorded payments are saved as sequential transaction entries. Renewing an expired membership never overwrites or erases previous fee receipts or historical records.',
    tag: 'Unbroken historical ledger',
  },
  {
    icon: Database,
    colorClass: 'text-purple-600',
    iconBgClass: 'bg-purple-100',
    title: 'Structured JSON Backup',
    description: "Export a complete, structured JSON backup of your gym's plans, members, and transactions directly from your settings whenever you need independent offline archives.",
    tag: 'Available on-demand',
  },
];

const PILLARS_HI: Pillar[] = [
  {
    icon: Lock,
    colorClass: 'text-sky-600',
    iconBgClass: 'bg-sky-100',
    title: 'जिम वर्कस्पेस सुरक्षा',
    description: 'क्लाउड मोड में PostgreSQL रो-लेवल सिक्योरिटी (RLS) के साथ प्रत्येक सदस्य, प्लान और फीस प्रविष्टि अलग रखी जाती है, जिससे प्रत्येक मालिक केवल अपने जिम का डेटा देख सकता है।',
    tag: 'जिम वर्कस्पेस द्वारा पृथक',
  },
  {
    icon: Download,
    colorClass: 'text-emerald-600',
    iconBgClass: 'bg-emerald-100',
    title: '1-क्लिक स्प्रेडशीट निर्यात',
    description: 'आप कभी भी बंधे नहीं हैं। Microsoft Excel और Google Sheets के अनुकूल स्वच्छ CSV फ़ाइलों में अपनी संपूर्ण सदस्य डायरेक्टरी, प्लान कैटलॉग और भुगतान लेजर डाउनलोड करें।',
    tag: 'UTF-8 BOM फॉर्मेटिंग शामिल',
  },
  {
    icon: ShieldCheck,
    colorClass: 'text-amber-600',
    iconBgClass: 'bg-amber-100',
    title: 'स्थायी भुगतान इतिहास',
    description: 'दर्ज किए गए भुगतान क्रमिक लेन-देन प्रविष्टियों के रूप में सुरक्षित रहते हैं। किसी समाप्त सदस्यता को नवीनीकृत करने से पुरानी रसीदें या ऐतिहासिक रिकॉर्ड कभी नहीं मिटते।',
    tag: 'अखंड ऐतिहासिक लेजर',
  },
  {
    icon: Database,
    colorClass: 'text-purple-600',
    iconBgClass: 'bg-purple-100',
    title: 'संरचित JSON बैकअप',
    description: 'जब भी आपको स्वतंत्र ऑफ़लाइन संग्रह की आवश्यकता हो, अपनी सेटिंग्स से सीधे अपने जिम के प्लान्स, सदस्यों और लेन-देन का एक पूर्ण, संरचित JSON बैकअप निर्यात करें।',
    tag: 'मांग पर उपलब्ध',
  },
];

export function PrivacyTrustSection() {
  const { t, locale } = useI18n();
  const isHi = locale === 'hi';
  const pillars = isHi ? PILLARS_HI : PILLARS_EN;

  return (
    <section id="security" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/80 scroll-mt-16 sm:scroll-mt-20 relative">
      <span id="trust" className="absolute -top-20" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#087FDB] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            {t('landing.securityTitle')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101F33]">
            {t('landing.securityHeadline')}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            {t('landing.securityCopy')}
          </p>
        </div>

        {/* 4 Architecture Pillars */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${pillar.iconBgClass} ${pillar.colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{pillar.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
                <div className={`pt-2 text-[11px] ${pillar.colorClass} font-semibold flex items-center gap-1`}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {pillar.tag}
                </div>
              </div>
            );
          })}
        </div>

        {/* Honest Technical Status Notice */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">
                {isHi ? 'वर्तमान तकनीकी स्थिति एवं आर्किटेक्चर विवरण:' : 'Current Technical Status & Architecture Notes:'}
              </p>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                {isHi
                  ? 'वर्कस्पेस पूर्ण डेटा निर्यात और सुरक्षित विलोपन का समर्थन करते हैं। जहां मांग पर CSV और JSON निर्यात आज पूरी तरह से चालू हैं, वहीं स्वचालित दैनिक ऑफ-साइट बैकअप हमारे प्रोडक्शन क्लाउड रोडमैप पर हैं।'
                  : 'Workspaces support complete export and safe cascade deletion. While on-demand CSV and JSON exports are fully operational today, automated nightly off-site backups remain on our production cloud infrastructure roadmap.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
