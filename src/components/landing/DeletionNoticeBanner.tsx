'use client';

import { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export function DeletionNoticeBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { locale } = useI18n();

  if (dismissed) return null;

  const message =
    locale === 'hi'
      ? 'जिम वर्कस्पेस को सफलतापूर्वक हटा दिया गया है। आपकी सुरक्षा के लिए आप साइन आउट हो गए हैं।'
      : 'Gym workspace was successfully deleted. For your security, you have been signed out.';

  return (
    <div className="bg-emerald-600 text-white px-4 py-3 shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-emerald-200 shrink-0" />
          <span>{message}</span>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1 text-emerald-100 hover:bg-emerald-700 hover:text-white transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
