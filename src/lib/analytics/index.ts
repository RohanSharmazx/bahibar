/**
 * Privacy-Conscious Product Usage Analytics
 * 
 * DESIGN PRINCIPLES:
 * 1. Disabled by default for all self-hosted instances (NEXT_PUBLIC_ENABLE_ANALYTICS=false).
 * 2. Strict Zero-PII policy: NEVER collect or transmit member names, phone numbers, emails,
 *    payment amounts (INR), receipt details, passwords, or gym customer data.
 * 3. Transparent: Open source users can inspect all event payloads here.
 * 4. Pluggable: Works with PostHog, Umami, or falls back to silent no-op.
 */

export type AnalyticsEventType =
  | 'landing_view'
  | 'signup_started'
  | 'signup_completed'
  | 'workspace_created'
  | 'first_member_registered'
  | 'first_payment_recorded'
  | 'receipt_downloaded'
  | 'export_completed'
  | 'workspace_active';

export interface AnalyticsEventProps {
  [key: string]: string | number | boolean | undefined;
}

const IS_ANALYTICS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' &&
  typeof window !== 'undefined';

/**
 * Tracks an aggregate, anonymous usage event.
 * Strips any accidental PII before dispatching.
 */
export function trackEvent(
  eventName: AnalyticsEventType,
  properties?: AnalyticsEventProps
): void {
  if (!IS_ANALYTICS_ENABLED) {
    if (process.env.NODE_ENV === 'development') {
      // Local dev debugging only
      // console.debug(`[Analytics (Disabled)] Event: ${eventName}`, properties);
    }
    return;
  }

  // Sanitize properties to prevent accidental PII leakage
  const sanitizedProps: Record<string, string | number | boolean> = {};
  if (properties) {
    for (const [key, val] of Object.entries(properties)) {
      if (val === undefined || val === null) continue;
      // Prohibit common PII keys
      const lower = key.toLowerCase();
      if (
        lower.includes('name') ||
        lower.includes('email') ||
        lower.includes('phone') ||
        lower.includes('mobile') ||
        lower.includes('amount') ||
        lower.includes('token') ||
        lower.includes('password')
      ) {
        continue;
      }
      sanitizedProps[key] = val;
    }
  }

  try {
    // 1. PostHog integration if available on window
    const win = window as unknown as { posthog?: { capture: (name: string, props?: unknown) => void } };
    if (win.posthog && typeof win.posthog.capture === 'function') {
      win.posthog.capture(eventName, sanitizedProps);
      return;
    }

    // 2. Umami integration if available on window
    const umamiWin = window as unknown as { umami?: { track: (name: string, props?: unknown) => void } };
    if (umamiWin.umami && typeof umamiWin.umami.track === 'function') {
      umamiWin.umami.track(eventName, sanitizedProps);
      return;
    }
  } catch {
    // Fail silently without disrupting application workflow
  }
}
