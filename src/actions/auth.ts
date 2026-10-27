'use server';

import { cookies, headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations/auth';
import {
  isLocalPlaceholderMode,
  getCleanSupabaseEnv,
  readLocalDb,
  writeLocalDb,
  type LocalUser,
} from '@/lib/local-db';
import { LOCAL_SESSION_COOKIE, ACTIVE_GYM_COOKIE, LOCAL_WORKSPACES_COOKIE, type LocalSession } from '@/lib/supabase/auth-helpers';
import crypto from 'crypto';

export type ActionState = {
  success?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  devResetUrl?: string;
};

async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  try {
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || 'localhost:3000';
    const proto = headerList.get('x-forwarded-proto') || (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'http');
    return `${proto}://${host}`;
  } catch {
    return 'http://localhost:3000';
  }
}

export async function loginAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = loginSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      error: 'Invalid input. Please check your details.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  // Local Development Fallback Mode
  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { error: 'No account found with this email. Please register first.' };
    }

    // Verify password hash
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password_hash !== hash) {
      return { error: 'Incorrect password. Please try again.' };
    }

    // Set local session cookie
    const cookieStore = await cookies();
    const headerList = await headers();
    const isHttps = headerList.get('x-forwarded-proto') === 'https';
    const sessionData: LocalSession = {
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
    };

    cookieStore.set(LOCAL_SESSION_COOKIE, JSON.stringify(sessionData), {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Check if user has gym onboarded or saved in local workspaces cookie
    const workspacesCookie = cookieStore.get(LOCAL_WORKSPACES_COOKIE)?.value;
    let cookieGyms: any[] = [];
    if (workspacesCookie) {
      try {
        cookieGyms = JSON.parse(workspacesCookie);
      } catch {}
    }

    let staff = db.gym_staff.find((s) => s.user_id === user.id);
    if (!staff && cookieGyms.length > 0) {
      staff = {
        id: crypto.randomUUID(),
        gym_id: cookieGyms[0].id,
        user_id: user.id,
        role: 'owner',
        created_at: new Date().toISOString(),
      };
      db.gym_staff.push(staff);
      for (const cg of cookieGyms) {
        if (!db.gyms.some((g) => g.id === cg.id)) {
          db.gyms.push(cg);
        }
      }
      try {
        writeLocalDb(db);
      } catch {}
    }

    if (!staff) {
      cookieStore.delete(ACTIVE_GYM_COOKIE);
      redirect('/onboarding');
    }

    // Update LOCAL_WORKSPACES_COOKIE from db if user has gym entries
    const userGymIds = new Set(db.gym_staff.filter((s) => s.user_id === user.id).map((s) => s.gym_id));
    const userGyms = db.gyms.filter((g) => userGymIds.has(g.id));
    if (userGyms.length > 0) {
      cookieStore.set(LOCAL_WORKSPACES_COOKIE, JSON.stringify(userGyms), {
        httpOnly: true,
        secure: isHttps,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    // Set or preserve active gym workspace for this user
    const currentActive = cookieStore.get(ACTIVE_GYM_COOKIE)?.value;
    const isAuthorized = currentActive && db.gym_staff.some((s) => s.user_id === user.id && s.gym_id === currentActive);
    if (!isAuthorized) {
      cookieStore.set(ACTIVE_GYM_COOKIE, staff.gym_id, { path: '/', sameSite: 'lax' });
    }

    redirect('/dashboard');
  }

  // Cloud Supabase Mode
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes('invalid api key')) {
      const { urlRef, keyRef } = getCleanSupabaseEnv();
      const mismatch =
        urlRef && keyRef && urlRef !== keyRef
          ? ` (Mismatch: URL project ref is "${urlRef}", but key is for "${keyRef}")`
          : '';
      return {
        error:
          `Supabase API key is invalid or malformed${mismatch}. In Netlify Site Configuration > Environment Variables, please verify NEXT_PUBLIC_SUPABASE_ANON_KEY matches your project's public "anon" key and re-deploy.`,
      };
    }
    return { error: error.message };
  }

  const cookieStore = await cookies();
  const { data: staffList } = await supabase
    .from('gym_staff')
    .select('gym_id')
    .limit(1);

  if (!staffList || staffList.length === 0) {
    cookieStore.delete(ACTIVE_GYM_COOKIE);
    redirect('/onboarding');
  }

  cookieStore.set(ACTIVE_GYM_COOKIE, staffList[0].gym_id, { path: '/', sameSite: 'lax' });
  redirect('/dashboard');
}

export async function registerAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = registerSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      error: 'Invalid input. Please check the form errors.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password, full_name } = parsed.data;

  // Local Development Fallback Mode
  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      return { error: 'An account with this email address already exists. Please sign in.' };
    }

    const userId = crypto.randomUUID();
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const newUser: LocalUser = {
      id: userId,
      email,
      password_hash: passwordHash,
      full_name,
      created_at: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.profiles.push({
      id: userId,
      full_name,
      phone: null,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    writeLocalDb(db);

    // Set local session cookie
    const cookieStore = await cookies();
    const headerList = await headers();
    const isHttps = headerList.get('x-forwarded-proto') === 'https';
    const sessionData: LocalSession = {
      userId,
      email,
      fullName: full_name,
    };

    cookieStore.set(LOCAL_SESSION_COOKIE, JSON.stringify(sessionData), {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    redirect('/onboarding');
  }

  // Cloud Supabase Mode
  const supabase = await createClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
      },
    },
  });

  if (signUpError) {
    if (signUpError.message.toLowerCase().includes('invalid api key')) {
      const { urlRef, keyRef } = getCleanSupabaseEnv();
      const mismatch =
        urlRef && keyRef && urlRef !== keyRef
          ? ` (Mismatch: URL project ref is "${urlRef}", but key is for "${keyRef}")`
          : '';
      return {
        error:
          `Supabase API key is invalid or malformed${mismatch}. In Netlify Site Configuration > Environment Variables, please verify NEXT_PUBLIC_SUPABASE_ANON_KEY matches your project's public "anon" key and re-deploy.`,
      };
    }
    return { error: signUpError.message };
  }

  // If a session was not automatically established, attempt to sign in to set cookies
  if (!signUpData?.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // Email confirmation is required by Supabase project configuration
      return {
        success: true,
        message: 'Account registered successfully! A confirmation link has been sent to your email. Please verify your email, then sign in to complete gym setup.',
      };
    }
  }

  redirect('/onboarding');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  if (isLocalPlaceholderMode()) {
    cookieStore.delete(LOCAL_SESSION_COOKIE);
    cookieStore.delete(LOCAL_WORKSPACES_COOKIE);
  } else {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  cookieStore.delete(ACTIVE_GYM_COOKIE);
  redirect('/login');
}

export async function forgotPasswordAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = forgotPasswordSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      error: 'Please enter a valid email address.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email } = parsed.data;

  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    let devResetUrl: string | undefined = undefined;

    if (user) {
      // Clean up previous tokens for this user
      db.password_reset_tokens = (db.password_reset_tokens || []).filter(
        (t) => t.user_id !== user.id
      );

      // Generate 1-hour secure reset token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      db.password_reset_tokens.push({
        token,
        user_id: user.id,
        email: user.email,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      });

      writeLocalDb(db);

      const baseUrl = await getBaseUrl();
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;
      if (process.env.NODE_ENV !== 'production') {
        console.log('\n======================================================');
        console.log(`[BahiBar Local Auth] Password Reset Link for ${user.email}:`);
        console.log(resetUrl);
        console.log('======================================================\n');
        devResetUrl = resetUrl;
      }
    }

    // Always return generic success to prevent email enumeration
    return { success: true, devResetUrl };
  }

  const supabase = await createClient();
  const siteUrl = await getBaseUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    console.error('Supabase password reset error:', error.message);
  }

  return { success: true };
}

export async function resetPasswordAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = resetPasswordSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      error: 'Please enter matching valid passwords (at least 6 characters).',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { password } = parsed.data;
  const token = formData.get('token') as string | null;

  if (isLocalPlaceholderMode()) {
    if (!token) {
      return {
        error: 'Missing password reset token. Please use the reset link provided in your email.',
      };
    }

    const db = readLocalDb();
    const tokenRecord = (db.password_reset_tokens || []).find((t) => t.token === token);

    if (!tokenRecord) {
      return {
        error: 'This password reset link is invalid or has already been used.',
      };
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      return {
        error: 'This password reset link has expired. Please request a new one.',
      };
    }

    const user = db.users.find((u) => u.id === tokenRecord.user_id);
    if (!user) {
      return { error: 'Account not found. Please register first.' };
    }

    // Update password hash
    const newHash = crypto.createHash('sha256').update(password).digest('hex');
    user.password_hash = newHash;

    // Invalidate used token
    db.password_reset_tokens = db.password_reset_tokens?.filter((t) => t.token !== token);
    writeLocalDb(db);

    redirect('/login?reset=success');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/login?reset=success');
}

export async function validateResetTokenAction(
  token: string | null
): Promise<{ valid: boolean; error?: string }> {
  if (isLocalPlaceholderMode()) {
    if (!token) {
      return {
        valid: false,
        error: 'No password reset token was provided. Please use the link sent in your email.',
      };
    }

    const db = readLocalDb();
    const tokenRecord = (db.password_reset_tokens || []).find((t) => t.token === token);

    if (!tokenRecord) {
      return {
        valid: false,
        error: 'This password reset link is invalid or has already been used.',
      };
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      return {
        valid: false,
        error: 'This password reset link has expired. Please request a new link.',
      };
    }

    return { valid: true };
  }

  // Cloud Supabase Mode: Verify active authenticated recovery session exists
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      valid: false,
      error: 'No active password recovery session found. Please click the reset link in your email.',
    };
  }

  return { valid: true };
}
