import { db } from './db';
import { User, Session } from './types';
import { normalizePhoneNumber, generateOTP, generateSessionId, generateUserId } from './validation';

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 3;
const RATE_LIMIT_MAX_ATTEMPTS = 5; // Max OTP requests per 15 minutes
const SESSION_EXPIRY_DAYS = 30;

export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Rate limiting
export async function checkRateLimit(identifier: string): Promise<void> {
  const record = await db.getRateLimit(identifier);
  
  if (record && record.attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    throw new AuthError(
      'Too many requests. Please try again in 15 minutes.',
      'RATE_LIMIT_EXCEEDED'
    );
  }
}

// Send OTP (mock implementation - integrate with SMS provider like Termii, Africa's Talking)
export async function sendOTP(phoneNumber: string): Promise<void> {
  const normalized = normalizePhoneNumber(phoneNumber);
  
  // Check rate limit
  await checkRateLimit(normalized);
  await db.incrementRateLimit(normalized);
  
  // Generate OTP
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  
  // Store OTP
  await db.createOTP({
    phoneNumber: normalized,
    code,
    expiresAt,
    attempts: 0,
    createdAt: new Date(),
  });
  
  // TODO: Integrate with SMS provider (Termii, Africa's Talking, etc.)
  console.log(`[SMS] Sending OTP ${code} to ${normalized}`);
  
  // For development, log the OTP
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔐 OTP for ${normalized}: ${code}`);
  }
}

// Verify OTP and create/login user
export async function verifyOTP(phoneNumber: string, code: string): Promise<{ user: User; session: Session }> {
  const normalized = normalizePhoneNumber(phoneNumber);
  
  // Get OTP record
  const otpRecord = await db.getOTP(normalized);
  
  if (!otpRecord) {
    throw new AuthError('OTP expired or not found. Please request a new one.', 'OTP_NOT_FOUND');
  }
  
  // Check attempts
  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    await db.deleteOTP(normalized);
    throw new AuthError('Too many failed attempts. Please request a new OTP.', 'MAX_ATTEMPTS_EXCEEDED');
  }
  
  // Verify code
  if (otpRecord.code !== code) {
    await db.incrementOTPAttempts(normalized);
    throw new AuthError('Invalid OTP code.', 'INVALID_OTP');
  }
  
  // Delete OTP after successful verification
  await db.deleteOTP(normalized);
  
  // Get or create user
  let user = await db.getUserByPhone(normalized);
  
  if (!user) {
    // Create new user
    user = await db.createUser({
      id: generateUserId(),
      phoneNumber: normalized,
      phoneVerified: true,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    // Update phone verification status
    user = await db.updateUser(normalized, { phoneVerified: true }) || user;
  }
  
  // Create session
  const session = await createSession(user.id);
  
  return { user, session };
}

// Create session
export async function createSession(userId: string): Promise<Session> {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt,
    createdAt: new Date(),
  };
  
  await db.createSession(session);
  return session;
}

// Get user from session
export async function getUserFromSession(sessionId: string): Promise<User | null> {
  const session = await db.getSession(sessionId);
  if (!session) return null;
  
  return await db.getUserById(session.userId);
}

// Logout
export async function logout(sessionId: string): Promise<void> {
  await db.deleteSession(sessionId);
}

// Google OAuth (mock implementation)
export async function handleGoogleAuth(email: string, googleId: string): Promise<{ user: User; session: Session; needsPhone: boolean }> {
  // Check if user exists with this email
  let user = await db.getUserByEmail(email);
  
  if (!user) {
    // Create new user without phone number
    user = await db.createUser({
      id: generateUserId(),
      phoneNumber: '', // Will be added later
      phoneVerified: false,
      email,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  // Create session
  const session = await createSession(user.id);
  
  // Check if user needs to add phone number
  const needsPhone = !user.phoneVerified;
  
  return { user, session, needsPhone };
}

// Add phone number to Google user
export async function addPhoneToUser(userId: string, phoneNumber: string): Promise<User> {
  const normalized = normalizePhoneNumber(phoneNumber);
  
  // Check if phone is already used
  const existingUser = await db.getUserByPhone(normalized);
  if (existingUser && existingUser.id !== userId) {
    throw new AuthError('This phone number is already registered.', 'PHONE_EXISTS');
  }
  
  // Get user
  const user = await db.getUserById(userId);
  if (!user) {
    throw new AuthError('User not found.', 'USER_NOT_FOUND');
  }
  
  // Update user with phone number
  const updated = await db.updateUser(user.phoneNumber || normalized, {
    phoneNumber: normalized,
  });
  
  if (!updated) {
    throw new AuthError('Failed to update user.', 'UPDATE_FAILED');
  }
  
  return updated;
}

// Select role
export async function selectRole(userId: string, role: 'tenant' | 'landlord' | 'agent'): Promise<User> {
  const user = await db.getUserById(userId);
  if (!user) {
    throw new AuthError('User not found.', 'USER_NOT_FOUND');
  }
  
  const updated = await db.updateUser(user.phoneNumber, { role });
  if (!updated) {
    throw new AuthError('Failed to update role.', 'UPDATE_FAILED');
  }
  
  return updated;
}

// Check if user can perform actions (has phone verified and role selected)
export function canPerformActions(user: User): boolean {
  return user.phoneVerified && !!user.role;
}

