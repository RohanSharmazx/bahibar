'use client';

import { useState } from 'react';
import { BookOpen, Search, IndianRupee, CalendarClock, ArrowRight, CheckCircle2, AlertCircle, FileText, Smartphone } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

interface Scenario {
  id: 'find' | 'payment' | 'expiry' | 'receipts';
  title: string;
  icon: any;
  paperTitle: string;
  paperSteps: string[];
  paperFriction: string;
  digitalTitle: string;
  digitalSteps: string[];
  digitalBenefit: string;
}

const SCENARIOS_EN: Scenario[] = [
  {
    id: 'find',
    title: 'Finding Member Details',
    icon: Search,
    paperTitle: 'Physical Paper Register',
    paperSteps: [
      'Stop spotting a trainee to pull out the front desk ledger book.',
      'Flip through dozens of handwritten pages or binder sheets.',
      'Try reading blurred phone numbers or duplicate entries under common names.',
      'Search for the last monthly receipt slip if the main register line is full.',
    ],
    paperFriction: 'Requires manual page flipping while members wait at the reception counter.',
    digitalTitle: 'BahiBar Quick Search',
    digitalSteps: [
      'Type 2 letters of member name or 4 digits of their phone number.',
      'Instant profile card surfaces with joined date, plan, and emergency contact.',
      'Full membership history and recorded payments visible in one tap.',
    ],
    digitalBenefit: 'Fast keyword search by member name or mobile directly on your phone or laptop.',
  },
  {
    id: 'payment',
    title: 'Tracking Partial Payments & Dues',
    icon: IndianRupee,
    paperTitle: 'Cash Diary & UPI Screenshots',
    paperSteps: [
      'Cross-reference cash diary scribbles against the member enrollment line.',
      'Ask the member to search their personal UPI app history for past transaction IDs.',
      'Deal with awkward disputes when an installment was noted on a loose slip.',
      'Manual calculation of remaining balance for partial payment installments.',
    ],
    paperFriction: 'Uncertainty over who paid what; creates hesitation when asking for dues.',
    digitalTitle: 'BahiBar Audit Ledger',
    digitalSteps: [
      'Chronological payment record with payment mode (Cash, UPI, Card).',
      'Agreed price snapshot minus total collected automatically computed.',
      'Clear, bold balance due indicator; zero guesswork during renewal.',
    ],
    digitalBenefit: 'Unambiguous financial trail with running balances and optional printable vouchers.',
  },
  {
    id: 'expiry',
    title: 'Checking Expired Memberships',
    icon: CalendarClock,
    paperTitle: 'Manual Daily Calendar Scanning',
    paperSteps: [
      'Manually scan all register pages at the start or end of the week.',
      'Count calendar months manually across leap years and 30/31-day months.',
      'Members continue working out for days or weeks after expiry unnoticed.',
      'Ad-hoc reminders made verbally at the gym gate with no advance notice.',
    ],
    paperFriction: 'Members unintentionally train past their paid term; missed renewal cycles.',
    digitalTitle: 'Automated Expiry Calculation',
    digitalSteps: [
      'Automatic calendar-month arithmetic with leap year and month-end clamping.',
      'Dedicated "Expiring in 7 Days" filter surfaces members needing follow-up.',
      'One-tap renewal extension from the day after expiry for seamless continuity.',
    ],
    digitalBenefit: 'Never miss an upcoming expiry; timely, polite renewal conversations.',
  },
  {
    id: 'receipts',
    title: 'Preparing Receipts Manually',
    icon: FileText,
    paperTitle: 'Carbon-Copy Receipt Slips',
    paperSteps: [
      'Find the carbon paper and paper receipt pad during morning rush hour.',
      'Hand-write gym name, date, member name, plan duration, and amount.',
      'Tear off the customer copy and hope the carbon duplicate doesn’t smudge.',
      'Store duplicate books in cupboards where finding an old receipt takes hours.',
    ],
    paperFriction: 'Slow hand-writing during peak hours and lost records when slips fade.',
    digitalTitle: 'One-Click Digital Receipts',
    digitalSteps: [
      'Receipts generate instantly from recorded payments with official gym letterhead.',
      'Download clean PDF vouchers directly or print on standard desk printers.',
      'Instant WhatsApp text slip ready to send to the member in one click.',
    ],
    digitalBenefit: 'Clean, professional vouchers generated in seconds without paper clutter.',
  },
];

const SCENARIOS_HI: Scenario[] = [
  {
    id: 'find',
    title: 'सदस्य विवरण खोजना',
    icon: Search,
    paperTitle: 'कागजी रजिस्टर डायरी',
    paperSteps: [
      'ट्रेनी को स्पॉट करना छोड़कर काउंटर से रजिस्टर निकालना।',
      'दर्जनों हाथ से लिखे पन्नों और फाइलों को उलटना।',
      'धुंधले मोबाइल नंबर या एक जैसे नाम में सदस्य को ढूंढना।',
      'यदि मुख्य लाइन भर गई हो तो पिछली रसीद की पर्ची खोजना।',
    ],
    paperFriction: 'रिसेप्शन पर सदस्य के खड़े रहने के दौरान बार-बार पन्ने पलटने की झंझट।',
    digitalTitle: 'बहीबार त्वरित खोज',
    digitalSteps: [
      'सदस्य के नाम के 2 अक्षर या मोबाइल नंबर के 4 अंक टाइप करें।',
      'ज्वाइनिंग डेट, प्लान और इमरजेंसी फोन के साथ प्रोफाइल तुरंत सामने।',
      'पिछली सभी फीस और रसीदें एक टैप में स्पष्ट दिखाई देती हैं।',
    ],
    digitalBenefit: 'मोबाइल या लैपटॉप पर नाम या फोन नंबर से बिजली जैसी तेज खोज।',
  },
  {
    id: 'payment',
    title: 'किस्त व बकाया फीस ट्रैक करना',
    icon: IndianRupee,
    paperTitle: 'कैश डायरी और UPI स्क्रीनशॉट',
    paperSteps: [
      'कैश डायरी की प्रविष्टियों को मुख्य रजिस्टर के साथ मिलाना।',
      'सदस्य से उसके फोन में पुराने UPI ट्रांजैक्शन खोजने को कहना।',
      'जब किसी ढीली पर्ची पर लिखी किस्त खो जाए तो असमंजस होना।',
      'आंशिक भुगतान के बाद बची हुई बकाया राशि की हाथ से गणना।',
    ],
    paperFriction: 'किसने कितना दिया, इसका पक्का हिसाब न होना; फीस मांगते समय झिझक।',
    digitalTitle: 'बहीबार ऑडिट लेजर',
    digitalSteps: [
      'भुगतान माध्यम (नकद, UPI, कार्ड) के साथ स्पष्ट समयबद्ध रिकॉर्ड।',
      'तय फीस में से कुल प्राप्त राशि घटाकर शेष बकाया अपने आप निकलता है।',
      'नवीनीकरण के समय स्पष्ट बकाया राशि; कोई गलतफहमी नहीं।',
    ],
    digitalBenefit: 'रनिंग बैलेंस और प्रिंट करने योग्य वाउचर के साथ स्पष्ट वित्तीय रिकॉर्ड।',
  },
  {
    id: 'expiry',
    title: 'समाप्त सदस्यता जांचना',
    icon: CalendarClock,
    paperTitle: 'रोज रजिस्टर के पन्ने गिनना',
    paperSteps: [
      'सप्ताह की शुरुआत या अंत में रजिस्टर के सभी पन्ने चेक करना।',
      '30/31 दिन और लीप वर्ष के महीनों की हाथ से गिनती करना।',
      'सदस्य के फीस समाप्त होने के कई दिन बाद तक कसरत करते रहना।',
      'जिम के दरवाजे पर बिना पूर्व सूचना के अचानक टोकना।',
    ],
    paperFriction: 'सदस्य अनजाने में तय समय से आगे ट्रेनिंग करते रहते हैं; फीस का नुकसान।',
    digitalTitle: 'स्वचालित समाप्ति गणना',
    digitalSteps: [
      'महीने के अंत और लीप वर्ष के स्वतः समायोजन के साथ सटीक तारीख गणना।',
      '"7 दिनों में समाप्त" होने वाले सदस्यों की अलग और स्पष्ट सूची।',
      'समाप्ति के अगले दिन से 1-क्लिक में रिन्यूअल आगे बढ़ाएं।',
    ],
    digitalBenefit: 'समय पर और सम्मानजनक तरीके से नवीनीकरण की बातचीत।',
  },
  {
    id: 'receipts',
    title: 'हाथ से रसीद बनाना',
    icon: FileText,
    paperTitle: 'कार्बन-कॉपी रसीद बुक',
    paperSteps: [
      'सुबह की भीड़ के दौरान कार्बन पेपर और रसीद कट्टा खोजना।',
      'हाथ से जिम का नाम, तारीख, सदस्य का नाम, प्लान और फीस लिखना।',
      'ग्राहक की पर्ची फाड़ना और कार्बन कॉपी के धुंधले होने की चिंता।',
      'अलमारी में पुरानी रसीद की कॉपी ढूंढने में घंटों लगाना।',
    ],
    paperFriction: 'भीड़ के समय धीमी लिखावट और पुरानी पर्चियां खोने का डर।',
    digitalTitle: '1-क्लिक डिजिटल रसीद',
    digitalSteps: [
      'जिम के नाम और फोन नंबर के साथ तुरंत रसीद तैयार होती है।',
      'साफ पीडीएफ वाउचर डाउनलोड करें या काउंटर प्रिंटर से निकालें।',
      'एक क्लिक में सदस्य के फोन पर भेजने के लिए व्हाट्सएप स्लिप तैयार।',
    ],
    digitalBenefit: 'कागजों के ढेर के बिना सेकंडों में पेशेवर वाउचर तैयार।',
  },
];

export function PaperProblemSection() {
  const [activeTab, setActiveTab] = useState<'find' | 'payment' | 'expiry' | 'receipts'>('find');
  const { t, locale } = useI18n();
  const isHi = locale === 'hi';
  const scenarios = isHi ? SCENARIOS_HI : SCENARIOS_EN;

  const currentScenario = scenarios.find((s) => s.id === activeTab)!;

  return (
    <section id="problem" className="py-16 sm:py-24 bg-white border-b border-slate-200/80 scroll-mt-16 sm:scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#087FDB] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            {t('landing.problemTitle')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101F33]">
            {t('landing.problemHeadline')}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            {t('landing.problemCopy')}
          </p>

          {/* Visual Concept Transition Banner */}
          <div className="pt-2 flex items-center justify-center gap-3 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
              <BookOpen className="h-3.5 w-3.5" />
              {isHi ? 'कागजी रजिस्टर डायरी' : 'Physical Paper Diary'}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="flex items-center gap-1.5 text-[#087FDB] bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
              <Smartphone className="h-3.5 w-3.5 text-[#087FDB]" />
              {isHi ? 'व्यवस्थित डिजिटल बहीखाता' : 'Sorted Digital Ledger'}
            </span>
          </div>
        </div>

        {/* Scenario Selectors */}
        <div
          role="tablist"
          aria-label={isHi ? 'समस्या परिदृश्य' : 'Problem Scenarios'}
          className="mt-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3"
        >
          {scenarios.map((scenario) => {
            const Icon = scenario.icon;
            const isActive = activeTab === scenario.id;
            return (
              <button
                key={scenario.id}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => setActiveTab(scenario.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] active:scale-[0.98] ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-600/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{scenario.title}</span>
              </button>
            );
          })}
        </div>

        {/* Micro-Interaction Comparison Card */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Paper Side */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/20 p-6 sm:p-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-base">
                  <BookOpen className="h-5 w-5 text-rose-600" />
                  <h3>{currentScenario.paperTitle}</h3>
                </div>
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-100/70 px-2.5 py-0.5 rounded-full">
                  {isHi ? 'कागजी उलझन' : 'Manual Friction'}
                </span>
              </div>

              <ol className="space-y-3 text-sm text-slate-700">
                {currentScenario.paperSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-800 font-bold text-xs mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 pt-4 border-t border-rose-100/80 flex items-start gap-2 text-xs text-rose-800 bg-rose-100/40 p-3 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <p>
                <strong>{isHi ? 'नुकसान:' : 'The Cost:'}</strong> {currentScenario.paperFriction}
              </p>
            </div>
          </div>

          {/* Digital Side */}
          <div className="rounded-2xl border border-sky-200 bg-sky-50/20 p-6 sm:p-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-sky-100">
                <div className="flex items-center gap-2 text-sky-900 font-bold text-base">
                  <Smartphone className="h-5 w-5 text-sky-600" />
                  <h3>{currentScenario.digitalTitle}</h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                  {isHi ? 'बहीबार तरीका' : 'BahiBar Approach'}
                </span>
              </div>

              <ol className="space-y-3 text-sm text-slate-700">
                {currentScenario.digitalSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-800 font-bold text-xs mt-0.5">
                      ✓
                    </span>
                    <span className="leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 pt-4 border-t border-sky-100/80 flex items-start gap-2 text-xs text-sky-900 bg-sky-100/40 p-3 rounded-xl">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
              <p>
                <strong>{isHi ? 'सुलझा हुआ परिणाम:' : 'Intended Outcome:'}</strong> {currentScenario.digitalBenefit}
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer Note */}
        <p className="mt-4 text-center text-xs text-slate-400">
          {isHi
            ? 'परिदृश्य स्वतंत्र पड़ोस के फिटनेस सेंटरों के सामान्य दैनिक कार्यों पर आधारित हैं। केवल तुलनात्मक प्रदर्शन हेतु।'
            : 'Scenarios reflect typical workflow observations from independent neighborhood fitness centers. Demonstration comparison only.'}
        </p>
      </div>
    </section>
  );
}
