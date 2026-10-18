'use server';

import { cookies } from 'next/headers';
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
  readLocalDb,
  writeLocalDb,
  type LocalUser,
} from '@/lib/local-db';
import { LOCAL_SESSION_COOKIE, type LocalSession } from '@/lib/supabase/auth-helpers';
import crypto from 'crypto';

export type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

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
    const sessionData: LocalSession = {
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
    };

    cookieStore.set(LOCAL_SESSION_COOKIE, JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Check if user has gym onboarded
    const staff = db.gym_staff.find((s) => s.user_id === user.id);
    if (!staff) {
      redirect('/onboarding');
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
    return { error: error.message };
  }

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
    const sessionData: LocalSession = {
      userId,
      email,
      fullName: full_name,
    };

    cookieStore.set(LOCAL_SESSION_COOKIE, JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    redirect('/onboarding');
  }

  // Cloud Supabase Mode
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/onboarding');
}

export async function logoutAction(): Promise<void> {
  if (isLocalPlaceholderMode()) {
    const cookieStore = await cookies();
    cookieStore.delete(LOCAL_SESSION_COOKIE);
    redirect('/login');
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
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
    // In local mode, confirm immediately
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
  });

  if (error) {
    return { error: error.message };
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
      error: 'Please enter matching valid passwords.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { password } = parsed.data;

  if (isLocalPlaceholderMode()) {
    redirect('/login');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/login');
}
