'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initAnalytics, trackPageView } from '@/lib/analytics';

/**
 * Route change tracker for Next.js App Router.
 * Uses a ref to ensure route transitions are not double-counted.
 */
function PostHogRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedRef = React.useRef<string | null>(null);

  // Initialize once on mount
  React.useEffect(() => {
    initAnalytics();
  }, []);

  // Track pageviews on route change without double-counting
  React.useEffect(() => {
    if (!pathname) return;

    // Avoid recording query params which could leak tokens or search terms
    if (lastTrackedRef.current !== pathname) {
      lastTrackedRef.current = pathname;
      trackPageView(pathname);
    }
  }, [pathname, searchParams]);

  return null;
}

/**
 * Client-only PostHog analytics wrapper wrapped in Suspense
 * to prevent de-optimizing Next.js App Router static generation.
 */
export function PostHogAnalytics() {
  return (
    <React.Suspense fallback={null}>
      <PostHogRouteTracker />
    </React.Suspense>
  );
}
