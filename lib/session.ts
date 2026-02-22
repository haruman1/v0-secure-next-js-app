import { cookies } from 'next/headers';
import crypto from 'crypto';
import { query } from './db';

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function createSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await query(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
    [sessionId, userId, expiresAt],
  );

  const cookieStore = await cookies();
  cookieStore.set('sessionId', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  });

  return sessionId;
}

export async function getSession(): Promise<{
  userId: number;
  sessionId: string;
} | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('sessionId')?.value;

  if (!sessionId) return null;

  const results = await query(
    'SELECT user_id, expires_at FROM sessions WHERE id = ? AND expires_at > NOW()',
    [sessionId],
  );

  if (Array.isArray(results) && results.length > 0) {
    return {
      userId: (results[0] as any).user_id,
      sessionId,
    };
  }

  return null;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('sessionId')?.value;

  if (sessionId) {
    await query('DELETE FROM sessions WHERE id = ?', [sessionId]);
  }

  cookieStore.delete('sessionId');
}

export async function validateSession(
  sessionId: string,
): Promise<number | null> {
  const results = await query(
    'SELECT user_id FROM sessions WHERE id = ? AND expires_at > NOW()',
    [sessionId],
  );

  if (Array.isArray(results) && results.length > 0) {
    return (results[0] as any).user_id;
  }

  return null;
}
