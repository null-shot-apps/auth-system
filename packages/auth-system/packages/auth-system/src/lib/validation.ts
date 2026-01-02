import { z } from 'zod';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

// Nigerian phone number validation
export const phoneNumberSchema = z.string().refine(
  (phone) => {
    try {
      // Accept Nigerian numbers with or without country code
      const normalized = phone.startsWith('+') ? phone : `+234${phone.replace(/^0/, '')}`;
      return isValidPhoneNumber(normalized, 'NG');
    } catch {
      return false;
    }
  },
  { message: 'Invalid Nigerian phone number' }
);

export const emailSchema = z.string().email('Invalid email address');

export const otpSchema = z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only digits');

export const roleSchema = z.enum(['tenant', 'landlord', 'agent']);

export const signupSchema = z.object({
  phoneNumber: phoneNumberSchema,
});

export const verifyOTPSchema = z.object({
  phoneNumber: phoneNumberSchema,
  code: otpSchema,
});

export const selectRoleSchema = z.object({
  role: roleSchema,
});

export const googleAuthSchema = z.object({
  email: emailSchema,
  googleId: z.string().min(1),
});

export const addPhoneSchema = z.object({
  phoneNumber: phoneNumberSchema,
});

// Normalize phone number to E.164 format
export function normalizePhoneNumber(phone: string): string {
  try {
    const normalized = phone.startsWith('+') ? phone : `+234${phone.replace(/^0/, '')}`;
    const parsed = parsePhoneNumber(normalized, 'NG');
    return parsed.number;
  } catch {
    throw new Error('Invalid phone number');
  }
}

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate session ID
export function generateSessionId(): string {
  return crypto.randomUUID();
}

// Generate user ID
export function generateUserId(): string {
  return crypto.randomUUID();
}

