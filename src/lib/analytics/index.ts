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
 * Initialize PostHog client script.
 * Only runs once on client if NEXT_PUBLIC_POSTHOG_KEY is present.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;

  if (!POSTHOG_KEY) {
    // Safe no-op when unconfigured
    return;
  }

  // Check Do Not Track
  if (navigator.doNotTrack === '1' || (window as unknown as { doNotTrack?: string }).doNotTrack === '1') {
    return;
  }

  try {
    // PostHog stub initializer
    if (!window.posthog) {
      const ph: any = [];
      const methods = [
        'capture',
        'identify',
        'alias',
        'people.set',
        'people.set_once',
        'set_config',
        'register',
        'register_once',
        'unregister',
        'opt_out_capturing',
        'has_opted_out_capturing',
        'opt_in_capturing',
        'reset',
        'isFeatureEnabled',
        'onFeatureFlags',
        'getFeatureFlag',
        'getFeatureFlagPayload',
        'reloadFeatureFlags',
        'group',
        'updateEarlyAccessFeatureEnrollment',
        'getEarlyAccessFeatures',
        'getActiveMatchingSurveys',
        'getSurveys',
        'onSessionId',
      ];

      for (const method of methods) {
        ph[method] = function (...args: unknown[]) {
          ph.push([method, ...args]);
        };
      }

      ph._i = [];
      ph.init = function (apiKey: string, config?: Record<string, unknown>) {
        ph._apiKey = apiKey;
        ph._config = config;
      };

      window.posthog = ph;

      // Inject official PostHog script tag asynchronously
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `${POSTHOG_HOST}/static/array.js`;
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
        api_host: POSTHOG_HOST,
        capture_pageview: false, // Explicitly manual for Next.js App Router
        autocapture: false, // Strict privacy: do not capture DOM elements or forms
        disable_session_recording: true, // Strict privacy: no screen recording
        respect_dnt: true,
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
