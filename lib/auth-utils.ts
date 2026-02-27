import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

export interface JWTPayload {
  userId: number;
  email: string;
  role: 'admin' | 'user';
}

export function generateAuthCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function generateToken(payload: JWTPayload, expiresIn?: string): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn || JWT_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return headers.get('x-real-ip') || null;
}

export function getDeviceInfo(headers: Headers): string | null {
  return headers.get('user-agent') || null;
}
