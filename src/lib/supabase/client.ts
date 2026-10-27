import { createBrowserClient } from '@supabase/ssr';
import { getCleanSupabaseEnv } from './env';

export function createClient() {
  const { url, key } = getCleanSupabaseEnv();
  return createBrowserClient(url, key);
}

