export function getCleanSupabaseEnv(): { url: string; key: string } {
  let url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  let key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  // Strip wrapping single or double quotes
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }

  // Remove any trailing slashes from URL
  url = url.replace(/\/+$/, '');

  return { url, key };
}

export function isLocalPlaceholderMode(): boolean {
  const { url, key } = getCleanSupabaseEnv();
  return (
    !url ||
    !key ||
    url.includes('placeholder') ||
    key.includes('placeholder') ||
    url.includes('your_supabase') ||
    key.includes('your_supabase') ||
    !url.startsWith('https://') ||
    key.split('.').length !== 3
  );
}
