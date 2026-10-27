import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getCleanSupabaseEnv, isLocalPlaceholderMode } from './env';
const LOCAL_SESSION_COOKIE = 'gym_local_session';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { url, key } = getCleanSupabaseEnv();
  const isPlaceholder = isLocalPlaceholderMode();

  if (request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.startsWith('/api')) {
    return supabaseResponse;
  }

  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/callback', '/privacy', '/terms'];
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  // Routes that authenticated users should not access (redirected to dashboard)
  const authEntryRoutes = ['/login', '/register', '/forgot-password'];
  const isAuthEntryRoute = authEntryRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  // Local Development Mode Check (Zero Network Overhead)
  if (isPlaceholder) {
    const localSession = request.cookies.get(LOCAL_SESSION_COOKIE);
    const hasUser = Boolean(localSession?.value);

    if (!hasUser && !isPublicRoute && request.nextUrl.pathname !== '/') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }

    if (hasUser && isAuthEntryRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;
  }

  // Cloud Supabase Mode
  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicRoute && request.nextUrl.pathname !== '/') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthEntryRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
