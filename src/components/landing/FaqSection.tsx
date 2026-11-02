'use client';

import { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS_EN: FaqItem[] = [
  {
    question: 'How does the 30-day free trial work?',
    answer:
      'When you create an account, BahiBar automatically initializes a 30-day unrestricted free trial for your gym. You get immediate access to all features — member registration, plans, payment tracking, receipts, and data exports. No credit card is required to get started.',
  },
  {
    question: 'Can I use BahiBar from my phone at the gym reception desk?',
    answer:
      'Yes. BahiBar is built as a fast, mobile-first web application. You can open it in Chrome, Safari, or any browser on your Android or iPhone. All buttons, tables, and forms are optimized for single-hand touch interaction.',
  },
  {
    question: 'Do I need special hardware to print receipts?',
    answer:
      'No. You can download clean standalone PDF receipts directly to your phone or laptop with one tap, or print vouchers using any standard desk or thermal counter printer. You can also copy a pre-formatted WhatsApp text slip directly to the trainee.',
  },
  {
    question: 'How does BahiBar calculate membership expiry dates?',
    answer:
      'BahiBar uses automated calendar-month arithmetic with leap-year and month-end clamping (for example, Jan 31 + 1 month = Feb 28 or Feb 29 in leap years). Renewing an active membership automatically extends from the day after the current expiry date for uninterrupted continuity.',
  },
  {
    question: 'What happens to my gym records if my trial or subscription expires?',
    answer:
      'We follow a strict No Hostage Data policy. If your trial ends, your member database and transaction audit trail remain 100% intact. You can view and export your entire dataset to Excel CSV or JSON at any time without fees.',
  },
  {
    question: 'Can I export full backups of my data?',
    answer:
      'Yes. Under the Export tab, you can download UTF-8 BOM CSV files for Members, Plans, and Memberships (ready to open in Excel with ₹ symbols preserved), or generate a complete JSON snapshot backup for offline archiving.',
  },
  {
    question: 'How easy is it to migrate from our paper notebooks?',
    answer:
      'Very straightforward. You can create your pricing packages (e.g. Monthly, Quarterly, Annual) in under 2 minutes, then register existing members as they visit the gym or pay their monthly fee. You do not need to transcribe your entire notebook all at once.',
  },
];

const FAQS_HI: FaqItem[] = [
  {
    question: '30-दिन का निःशुल्क ट्रायल कैसे काम करता है?',
    answer:
      'जब आप खाता बनाते हैं, तो बहीबार आपके जिम के लिए 30-दिन का अप्रतिबंधित निःशुल्क ट्रायल शुरू करता है। आपको सभी सुविधाओं का तत्काल एक्सेस मिलता है — सदस्य पंजीकरण, प्लान्स, फीस ट्रैकिंग, रसीदें और डेटा निर्यात। शुरू करने के लिए किसी क्रेडिट कार्ड की आवश्यकता नहीं है।',
  },
  {
    question: 'क्या मैं जिम रिसेप्शन डेस्क पर अपने फोन से बहीबार का उपयोग कर सकता हूं?',
    answer:
      'हाँ। बहीबार एक तेज़, मोबाइल-फ़र्स्ट वेब ऐप है। आप इसे अपने एंड्रॉइड या आईफोन पर क्रोम, सफारी या किसी भी ब्राउज़र में खोल सकते हैं। सभी बटन, टेबल और फॉर्म एक हाथ से उपयोग के लिए अनुकूलित हैं।',
  },
  {
    question: 'क्या रसीद प्रिंट करने के लिए मुझे विशेष हार्डवेयर की आवश्यकता है?',
    answer:
      'नहीं। आप एक टैप में अपने फोन या लैपटॉप पर साफ पीडीएफ रसीद डाउनलोड कर सकते हैं, या किसी भी सामान्य डेस्क या थर्मल प्रिंटर से वाउचर प्रिंट कर सकते हैं। आप सदस्य को सीधे भेजने के लिए व्हाट्सएप स्लिप भी कॉपी कर सकते हैं।',
  },
  {
    question: 'बहीबार सदस्यता समाप्ति (Expiry) की गणना कैसे करता है?',
    answer:
      'बहीबार लीप-वर्ष और माह-अंत समायोजन के साथ स्वचालित कैलेंडर-माह अंकगणित का उपयोग करता है (उदा. 31 जनवरी + 1 माह = 28 या 29 फरवरी)। सक्रिय सदस्यता का नवीनीकरण समाप्ति के अगले दिन से अपने आप जुड़ जाता है।',
  },
  {
    question: 'यदि मेरा ट्रायल या सब्सक्रिप्शन समाप्त हो जाता है तो मेरे जिम रिकॉर्ड का क्या होगा?',
    answer:
      'हम सख्त "नो होस्टेज डेटा" नीति का पालन करते हैं। यदि आपका ट्रायल समाप्त भी हो जाता है, तो आपका सदस्य डेटाबेस और लेन-देन का रिकॉर्ड 100% सुरक्षित रहता है। आप बिना किसी शुल्क के कभी भी एक्सेल CSV या JSON में अपना पूरा डेटा डाउनलोड कर सकते हैं।',
  },
  {
    question: 'क्या मैं अपने डेटा का पूरा बैकअप निर्यात कर सकता हूं?',
    answer:
      'हाँ। निर्यात (Export) टैब में, आप सदस्यों, प्लान्स और सदस्यताओं के लिए UTF-8 BOM CSV फाइलें डाउनलोड कर सकते हैं (एक्सेल में ₹ सिंबल के साथ), या ऑफ़लाइन सुरक्षित रखने के लिए पूरा JSON स्नैपशॉट बैकअप बना सकते हैं।',
  },
  {
    question: 'हमारे रजिस्टर से बहीबार पर शिफ्ट होना कितना आसान है?',
    answer:
      'बहुत आसान। आप 2 मिनट से भी कम समय में अपने शुल्क पैकेज (जैसे मासिक, त्रैमासिक, वार्षिक) बना सकते हैं, और जैसे-जैसे सदस्य जिम आते हैं या फीस देते हैं, उन्हें दर्ज कर सकते हैं। एक बार में पूरी डायरी टाइप करने की ज़रूरत नहीं है।',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { t, locale } = useI18n();
  const faqs = locale === 'hi' ? FAQS_HI : FAQS_EN;

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white border-b border-slate-200/80 scroll-mt-16 sm:scroll-mt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#087FDB] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            {t('landing.faqTitle')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101F33]">
            {t('landing.faqHeadline')}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {t('landing.faqCopy')}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="py-2 sm:py-3">
                <button
                  type="button"
                  id={`faq-btn-${idx}`}
                  aria-controls={`faq-answer-${idx}`}
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between text-left text-sm sm:text-base font-bold text-slate-900 hover:text-sky-600 transition-colors cursor-pointer py-3 min-h-[48px]"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-sky-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-btn-${idx}`}
                    className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pr-8"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
