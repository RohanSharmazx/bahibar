export function extractJwtRef(key: string): string | null {
  try {
    const parts = key.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const jsonStr = typeof atob === 'function' ? atob(padded) : Buffer.from(padded, 'base64').toString('utf-8');
    const parsed = JSON.parse(jsonStr);
    return typeof parsed.ref === 'string' ? parsed.ref : null;
  } catch {
    return null;
  }
}

export function getCleanSupabaseEnv(): { url: string; key: string; keyRef: string | null; urlRef: string | null } {
  let url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  let key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  // Strip wrapping single or double quotes, whitespace, and invisible unicode control characters
  url = url.replace(/[\r\n\t​]/g, '').trim().replace(/^["']+|["']+$/g, '').trim().replace(/\/+$/, '');
  key = key.replace(/[\r\n\t​]/g, '').trim().replace(/^["']+|["']+$/g, '').trim();

  const keyRef = extractJwtRef(key);
  const match = url.match(/https:\/\/([a-zA-Z0-9_-]+)\.supabase\.co/);
  const urlRef = match ? match[1] : null;

  return { url, key, keyRef, urlRef };
}

export function isLocalPlaceholderMode(): boolean {
  const { url, key, keyRef, urlRef } = getCleanSupabaseEnv();
  if (
    !url ||
    !key ||
    url.includes('placeholder') ||
    key.includes('placeholder') ||
    url.includes('your_supabase') ||
    key.includes('your_supabase') ||
    !url.startsWith('https://') ||
    key.split('.').length !== 3
  ) {
    return true;
  }

  // If both refs exist but do not match, the key cannot authenticate with this Supabase project
  if (urlRef && keyRef && urlRef !== keyRef) {
    return true;
  }

  return false;
}
