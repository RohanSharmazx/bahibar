import * as React from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import type { Gym, SoftwareSubscription } from '@/types';

interface AppShellProps {
  gym: Gym | null;
  subscription: SoftwareSubscription | null;
  userName?: string;
  children: React.ReactNode;
}

export function AppShell({ gym, subscription, userName, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopBar gym={gym} subscription={subscription} userName={userName} />
      
      <div className="flex flex-1">
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 pb-20 lg:pb-8 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
