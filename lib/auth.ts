import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { query } from './db';
import nodemailer from 'nodemailer';

const BCRYPT_ROUNDS = 10;
const OTP_LENGTH = 6;

// Initialize email transporter (configure with your email service)
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
});

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  resetType: 'email_verification' | 'otp',
  otp?: string,
) {
  const resetLink = `${process.env.APP_URL}/auth/reset-password?token=${resetToken}`;

  if (resetType === 'email_verification') {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@medical-evacuation.com',
      to: email,
      subject: 'Reset Your Password - MEDIVAC BBKK Soekarno Hatta',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
        <a href="${resetLink}">Reset Password</a>
        <p>Or copy this link: ${resetLink}</p>
      `,
    });
  } else if (resetType === 'otp' && otp) {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@medical-evacuation.com',
      to: email,
      subject: 'Your Password Reset Code - MEDIVAC BBKK Soekarno Hatta',
      html: `
        <h2>Password Reset Code</h2>
        <p>Your password reset code is: <strong>${otp}</strong></p>
        <p>This code will expire in 5 minutes.</p>
      `,
    });
  }
}

export async function createPasswordResetToken(
  userId: number,
  type: 'email_verification' | 'otp',
): Promise<{ token: string; otp?: string }> {
  const token = generateToken();
  const otp = type === 'otp' ? generateOTP() : undefined;
  const expiresAt = new Date(
    Date.now() + (type === 'otp' ? 5 * 60 * 1000 : 60 * 60 * 1000),
  );

  await query(
    'INSERT INTO password_reset_tokens (user_id, token, token_type, otp_code, expires_at) VALUES (?, ?, ?, ?, ?)',
    [userId, token, type, otp || null, expiresAt],
  );

  return { token, otp };
}

export async function validateResetToken(token: string) {
  const results = await query(
    'SELECT * FROM password_reset_tokens WHERE token = ? AND used = FALSE AND expires_at > NOW()',
    [token],
  );

  if (Array.isArray(results) && results.length > 0) {
    return results[0];
  }
  return null;
}

export async function resetPassword(token: string, newPassword: string) {
  const resetRecord = await validateResetToken(token);
  if (!resetRecord) return false;

  // Type assertion to RowDataPacket for correct property access
  const record = resetRecord as import('mysql2').RowDataPacket;

  const passwordHash = await hashPassword(newPassword);
  const conn = await require('./db').getConnection();

  try {
    await conn.beginTransaction();

    await conn.execute('UPDATE users SET password_hash = ? WHERE id = ?', [
      passwordHash,
      record.user_id,
    ]);

    await conn.execute(
      'UPDATE password_reset_tokens SET used = TRUE WHERE id = ?',
      [record.id],
    );

    await conn.commit();
    return true;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function logAuditEvent(
  userId: string | null,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string,
) {
  await query(
    'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      userId,
      action,
      entityType || null,
      entityId || null,
      details ? JSON.stringify(details) : null,
      ipAddress || null,
      userAgent || null,
    ],
  );
}
