/**
 * Safe Base URL Resolver
 * Ensures password recovery and auth callbacks use verified, allowlisted domains
 * without trusting arbitrary attacker headers or suffering from compile-time inlining traps.
 */

export interface ResolveBaseUrlParams {
  origin?: string | null;
  host?: string | null;
  proto?: string | null;
  siteUrlEnv?: string | null;
}

export function resolveSafeBaseUrl(params: ResolveBaseUrlParams): string {
  const { origin, host, proto, siteUrlEnv } = params;

  // 1. Clean configured site URL from environment if provided
  const configured = (siteUrlEnv || '').trim().replace(/\/+$/, '');

  // 2. Validate request host if available from HTTP request headers
  const candidateHost = host || (origin ? parseHostFromUrl(origin) : null);

  if (candidateHost) {
    const [rawHostname, port] = candidateHost.split(':');
    const cleanHostname = rawHostname.toLowerCase();
    const portSuffix = port ? `:${port}` : '';

    // Localhost development loopback
    if (cleanHostname === 'localhost' || cleanHostname === '127.0.0.1') {
      return `http://${cleanHostname}${portSuffix || ':3000'}`;
    }

    // Allowlisted deployed environments:
    // - Cloudflare Workers staging/preview: *.workers.dev
    // - Production domain: bahibar.com or *.bahibar.com
    // - Configured site domain if valid URL provided
    const configuredHost = configured ? parseHostFromUrl(configured)?.toLowerCase().split(':')[0] : null;

    const isAllowedDomain =
      cleanHostname.endsWith('.workers.dev') ||
      cleanHostname === 'bahibar.com' ||
      cleanHostname.endsWith('.bahibar.com') ||
      (configuredHost && cleanHostname === configuredHost);

    if (isAllowedDomain) {
      const protocol = proto === 'http' && (cleanHostname === 'localhost' || cleanHostname === '127.0.0.1')
        ? 'http'
        : 'https';
      return `${protocol}://${candidateHost}`.replace(/\/+$/, '');
    }
  }

  // 3. Fall back to validated configured environment variable
  if (configured && (configured.startsWith('http://') || configured.startsWith('https://'))) {
    return configured;
  }

  // 4. Default fallback for local environment
  return 'http://localhost:3000';
}

function parseHostFromUrl(urlString: string): string | null {
  try {
    const url = new URL(urlString);
    return url.host;
  } catch {
    return null;
  }
}
