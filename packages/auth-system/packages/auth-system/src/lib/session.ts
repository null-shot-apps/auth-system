import { cookies } from 'next/headers';
import { getUserFromSession } from './auth';
import { User } from './types';

const SESSION_COOKIE_NAME = 'session_id';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function getSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  return cookie?.value || null;
}

export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const sessionId = await getSessionCookie();
  if (!sessionId) return null;
  
  return await getUserFromSession(sessionId);
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireVerifiedPhone(): Promise<User> {
  const user = await requireAuth();
  if (!user.phoneVerified) {
    throw new Error('Phone verification required');
  }
  return user;
}

export async function requireRole(): Promise<User> {
  const user = await requireVerifiedPhone();
  if (!user.role) {
    throw new Error('Role selection required');
  }
  return user;
}

