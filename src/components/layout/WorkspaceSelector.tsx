'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { ChevronDown, Building2, Check, Plus, Loader2 } from 'lucide-react';
import { switchWorkspaceAction } from '@/actions/gym';
import type { Gym } from '@/types';

interface WorkspaceSelectorProps {
  currentGym: Gym;
  accessibleGyms: { gym: Gym; role: string }[];
}

export function WorkspaceSelector({ currentGym, accessibleGyms }: WorkspaceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSwitch = (gymId: string) => {
    if (gymId === currentGym.id || isPending) return;
    setIsOpen(false);
    startTransition(async () => {
      try {
        await switchWorkspaceAction(gymId);
      } catch (err) {
        console.error('Failed to switch workspace:', err);
      }
    });
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-left hover:bg-slate-100 transition-colors cursor-pointer group"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Switch gym workspace"
      >
        <span className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate max-w-[140px] sm:max-w-[200px]">
          {currentGym.name}
        </span>
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 text-slate-400 animate-spin shrink-0" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 transition-transform shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white py-2 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            Switch Gym Workspace
          </div>

          <div className="py-1 max-h-56 overflow-y-auto">
            {accessibleGyms.map(({ gym, role }) => {
              const isCurrent = gym.id === currentGym.id;
              return (
                <button
                  key={gym.id}
                  type="button"
                  onClick={() => handleSwitch(gym.id)}
                  disabled={isCurrent || isPending}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-sky-50 font-semibold text-[#087FDB]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className={`h-4 w-4 shrink-0 ${isCurrent ? 'text-[#087FDB]' : 'text-slate-400'}`} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{gym.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{role}</p>
                    </div>
                  </div>
                  {isCurrent && <Check className="h-3.5 w-3.5 text-[#087FDB] shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-1 mt-1 px-1">
            <Link
              href="/onboarding?new_workspace=true"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#087FDB] hover:bg-sky-50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Gym Workspace</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
