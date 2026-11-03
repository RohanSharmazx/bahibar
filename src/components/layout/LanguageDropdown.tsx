'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import type { Locale } from '@/lib/i18n/types';

interface LanguageDropdownProps {
  className?: string;
  variant?: 'default' | 'compact' | 'nav';
  showLabel?: boolean;
}

export function LanguageDropdown({
  className = '',
  variant = 'default',
  showLabel = true,
}: LanguageDropdownProps) {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation & accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
      }
    },
    [isOpen]
  );

  const handleSelect = useCallback(
    (newLocale: Locale) => {
      setLocale(newLocale);
      setIsOpen(false);
      buttonRef.current?.focus();
    },
    [setLocale]
  );

  const isHindi = locale === 'hi';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087FDB]/20 focus:border-[#087FDB] transition-all cursor-pointer min-h-[44px] tap-feedback ${
          isOpen ? 'ring-2 ring-[#087FDB]/20 border-[#087FDB]' : ''
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Language / भाषा selector"
        title="Change language / भाषा बदलें"
      >
        <Globe className="h-4 w-4 text-[#087FDB] shrink-0" aria-hidden="true" />
        {showLabel && (
          <span className="hidden xs:inline text-slate-500 font-medium">Language:</span>
        )}
        <span className="font-bold text-[#101F33]">
          {isHindi ? 'हिंदी' : 'English'}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#087FDB]' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 mt-1.5 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            Language / भाषा
          </div>

          <button
            type="button"
            role="option"
            aria-selected={locale === 'en'}
            onClick={() => handleSelect('en')}
            className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer min-h-[40px] text-left ${
              locale === 'en'
                ? 'bg-sky-50 text-[#087FDB] font-bold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">🇬🇧</span>
              <span>English</span>
            </div>
            {locale === 'en' && <Check className="h-4 w-4 text-[#087FDB] shrink-0" />}
          </button>

          <button
            type="button"
            role="option"
            aria-selected={locale === 'hi'}
            onClick={() => handleSelect('hi')}
            className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer min-h-[40px] text-left ${
              locale === 'hi'
                ? 'bg-sky-50 text-[#087FDB] font-bold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">🇮🇳</span>
              <span className="font-semibold">हिंदी</span>
            </div>
            {locale === 'hi' && <Check className="h-4 w-4 text-[#087FDB] shrink-0" />}
          </button>
        </div>
      )}
    </div>
  );
}

// Backward-compatible alias
export const LanguageToggle = LanguageDropdown;
