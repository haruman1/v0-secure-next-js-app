import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, logAuditEvent } from '@/lib/auth';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, phone, role } = await request.json();

    // Validate input
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }
    if (role == 'admin' || role == 'superadmin' || role === 'admin') {
      return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 });
    }
    // Validate role
    if (role !== 'user') {
      return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 });
    }

    // Check if email already exists
    const existingUsers = await query('SELECT id FROM users WHERE email = ?', [
      email,
    ]);

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 },
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    // Insert user
    await query(
      `INSERT INTO users 
       (id, email, password_hash, full_name, phone, role, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, email, passwordHash, fullName, phone || null, role, true],
    );

    // Log audit event
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    await logAuditEvent(
      userId,
      'USER_REGISTERED',
      'users',
      userId,
      { email, role },
      ipAddress,
      userAgent,
    );

    // Create session
    const sessionId = await createSession(userId);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: userId,
          email,
          fullName,
          role,
        },
        sessionId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Registration error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
