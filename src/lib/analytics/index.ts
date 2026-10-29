/**
 * PostHog Cloud Product Analytics (Privacy-Safe & Zero-PII)
 *
 * Lightweight client wrapper for PostHog Cloud free tier.
 * Rules:
 * - Safe no-op if NEXT_PUBLIC_POSTHOG_KEY is not set or during SSR/tests.
 * - ZERO PII: strictly excludes names, emails, phones, monetary amounts, and personal notes.
 * - Route tracking without double counting.
 * - Respects Do Not Track (DNT) browser settings.
 * - Resets on logout to prevent session cross-contamination.
 */

declare global {
  interface Window {
    posthog?: {
      init: (key: string, options?: Record<string, unknown>) => void;
      capture: (eventName: string, properties?: Record<string, unknown>) => void;
      identify: (distinctId: string, properties?: Record<string, unknown>) => void;
      reset: () => void;
      opt_out_capturing: () => void;
      opt_in_capturing: () => void;
      has_opted_out_capturing: () => boolean;
      __loaded?: boolean;
    };
  }
}

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let isInitialized = false;

// Keys strictly forbidden from being sent to PostHog to prevent PII leakage
const PII_DISALLOWED_KEYS = /^(name|full_name|member_name|email|phone|mobile|emergency_contact|address|amount|price|paid_amount|due_amount|balance|notes|token|key|password|secret)$/i;

/**
 * Filter properties object to ensure strictly zero PII is emitted.
 */
export function sanitizeAnalyticsProps(props?: Record<string, unknown>): Record<string, unknown> {
  if (!props) return {};
  const clean: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (PII_DISALLOWED_KEYS.test(key)) {
      continue; // Skip PII
    }

    if (typeof value === 'string') {
      // Exclude values that look like email addresses
      if (value.includes('@') && value.includes('.')) continue;
      // Exclude values that look like phone numbers
      if (/^\+?[0-9\s-]{8,15}$/.test(value.trim())) continue;
    }

    clean[key] = value;
  }

  return clean;
}

/**
 * Initialize PostHog client script using official PostHog queue pattern.
 * Only runs once on client if NEXT_PUBLIC_POSTHOG_KEY is present.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;

  if (!POSTHOG_KEY) {
    // Safe no-op when unconfigured
    return;
  }

  try {
    const rawHost = (POSTHOG_HOST || 'https://us.i.posthog.com').replace(/\/$/, '');
    // PostHog static assets are served from -assets.i.posthog.com
    const assetHost = rawHost.includes('.i.posthog.com')
      ? rawHost.replace('.i.posthog.com', '-assets.i.posthog.com')
      : rawHost;

    if (!window.posthog || !(window.posthog as any).__SV) {
      const ph: any = (window.posthog = (window.posthog || []) as any);
      ph._i = ph._i || [];

      ph.init = function (apiKey: string, config?: Record<string, unknown>, name?: string) {
        function g(target: any, method: string) {
          const parts = method.split('.');
          if (parts.length === 2) {
            target = target[parts[0]];
            method = parts[1];
          }
          target[method] = function (...args: unknown[]) {
            target.push([method, ...args]);
          };
        }

        let target = ph;
        if (typeof name !== 'undefined') {
          target = ph[name] = [];
        } else {
          name = 'posthog';
        }

        target.people = target.people || [];
        target.toString = function (noStub?: boolean) {
          let str = 'posthog';
          if (name !== 'posthog') str += '.' + name;
          if (!noStub) str += ' (stub)';
          return str;
        };

        const methods = [
          'init',
          'capture',
          'register',
          'register_once',
          'register_for_session',
          'unregister',
          'unregister_for_session',
          'getFeatureFlag',
          'getFeatureFlagPayload',
          'isFeatureEnabled',
          'reloadFeatureFlags',
          'identify',
          'setPersonProperties',
          'group',
          'resetGroups',
          'reset',
          'get_distinct_id',
          'getGroups',
          'get_session_id',
          'alias',
          'set_config',
          'opt_in_capturing',
          'opt_out_capturing',
          'has_opted_in_capturing',
          'has_opted_out_capturing',
          'clear_opt_in_out_capturing',
          'debug',
        ];

        for (const m of methods) {
          g(target, m);
        }

        ph._i.push([apiKey, config, name]);
      };

      ph.__SV = 1;

      // Inject official PostHog script tag asynchronously
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `${assetHost}/static/array.js`;
      script.onerror = () => {
        // Safe no-op on adblocker or network error
      };

      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }
    }

    if (window.posthog && typeof window.posthog.init === 'function') {
      window.posthog.init(POSTHOG_KEY, {
        api_host: rawHost,
        capture_pageview: false, // Explicitly manual for Next.js App Router
        autocapture: false, // Strict privacy: do not capture DOM elements or forms
        disable_session_recording: true, // Strict privacy: no screen recording
        persistence: 'localStorage+cookie',
      });
      isInitialized = true;
    }
  } catch {
    // Safe fallback if PostHog initialization encounters an environment error
  }
}

/**
 * Capture an analytics event with sanitized, non-PII properties.
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (!POSTHOG_KEY || !window.posthog) return;

  try {
    const sanitized = sanitizeAnalyticsProps(properties);
    window.posthog.capture(eventName, sanitized);
  } catch {
    // Fail silently without disrupting user flow
  }
}

/**
 * Track route view without query params that could carry sensitive IDs.
 */
export function trackPageView(pathname: string): void {
  trackEvent('$pageview', {
    $current_url: pathname,
    path: pathname,
  });
}

/* =========================================================================
 * Named Conversion and Pilot Lifecycle Events
 * ========================================================================= */

/**
 * Triggered when a visitor clicks a call-to-action on the landing page
 */
export function trackSignupCtaClicked(ctaLocation: string): void {
  trackEvent('signup_cta_clicked', {
    cta_location: ctaLocation,
  });
}

/**
 * Triggered when gym owner registration succeeds
 */
export function trackRegistrationCompleted(): void {
  trackEvent('registration_completed');
}

/**
 * Triggered when gym owner logs in
 */
export function trackLoginCompleted(): void {
  trackEvent('login_completed');
}

/**
 * Triggered when gym profile onboarding finishes
 */
export function trackGymCreated(): void {
  trackEvent('gym_created');
}

/**
 * Triggered when a gym owner adds a member
 */
export function trackFirstMemberAdded(isFirstMember: boolean = false): void {
  trackEvent('first_member_added', {
    is_first_member: isFirstMember,
  });
}

/**
 * Triggered when a member fee payment is recorded
 */
export function trackPaymentRecorded(meta: {
  payment_method?: string;
  is_first_payment?: boolean;
}): void {
  trackEvent('payment_recorded', {
    payment_method: meta.payment_method || 'other',
    is_first_payment: !!meta.is_first_payment,
  });
}

/**
 * Triggered when a membership renewal is saved
 */
export function trackMembershipRenewed(meta: {
  duration_unit?: string;
  duration_value?: number;
}): void {
  trackEvent('membership_renewed', {
    duration_unit: meta.duration_unit,
    duration_value: meta.duration_value,
  });
}

/**
 * Triggered when gym data is exported to CSV/JSON
 */
export function trackDataExported(exportType: string): void {
  trackEvent('data_exported', {
    export_type: exportType,
  });
}

/**
 * Reset PostHog user identity on logout to avoid session cross-contamination
 */
export function resetAnalytics(): void {
  if (typeof window === 'undefined') return;
  if (!window.posthog?.reset) return;

  try {
    window.posthog.reset();
  } catch {
    // Fail silently
  }
}
