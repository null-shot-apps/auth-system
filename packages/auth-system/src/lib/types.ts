export type UserRole = 'tenant' | 'landlord' | 'agent';

export interface User {
  id: string;
  phoneNumber: string;
  phoneVerified: boolean;
  email?: string;
  emailVerified: boolean;
  role?: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface OTPRecord {
  phoneNumber: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface RateLimitRecord {
  identifier: string; // phone number or IP
  attempts: number;
  windowStart: Date;
}

