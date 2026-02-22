import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, logAuditEvent } from '@/lib/auth';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 },
      );
    }

    // Find user
    const results = await query(
      'SELECT id, password_hash, full_name, role, is_active FROM users WHERE email = ?',
      [email],
    );

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials', message: 'loginFailedDesc' },
        { status: 401 },
      );
    }

    const user = results[0] as any;

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is inactive', message: 'loginFailedDesc' },
        { status: 403 },
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
      const userAgent = request.headers.get('user-agent') || '';

      await logAuditEvent(
        null,
        'FAILED_LOGIN_ATTEMPT',
        'users',
        null,
        { email, reason: 'invalid_password' },
        ipAddress,
        userAgent,
      );

      return NextResponse.json(
        { error: 'Invalid credentials', message: 'loginFailedDesc' },
        { status: 401 },
      );
    }

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Log audit event
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    await logAuditEvent(
      user.id,
      'USER_LOGIN',
      'users',
      user.id,
      {},
      ipAddress,
      userAgent,
    );

    // Create session
    const sessionId = await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email,
        fullName: user.full_name,
        role: user.role,
      },
      sessionId,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
