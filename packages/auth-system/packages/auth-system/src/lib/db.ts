import { User, OTPRecord, Session, RateLimitRecord } from './types';

// In-memory storage (replace with Cloudflare D1 or KV in production)
const users: Map<string, User> = new Map();
const otps: Map<string, OTPRecord> = new Map();
const sessions: Map<string, Session> = new Map();
const rateLimits: Map<string, RateLimitRecord> = new Map();

export const db = {
  // User operations
  async getUserByPhone(phoneNumber: string): Promise<User | null> {
    return users.get(phoneNumber) || null;
  },

  async getUserById(id: string): Promise<User | null> {
    for (const user of users.values()) {
      if (user.id === id) return user;
    }
    return null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of users.values()) {
      if (user.email === email) return user;
    }
    return null;
  },

  async createUser(user: User): Promise<User> {
    users.set(user.phoneNumber, user);
    return user;
  },

  async updateUser(phoneNumber: string, updates: Partial<User>): Promise<User | null> {
    const user = users.get(phoneNumber);
    if (!user) return null;
    
    const updated = { ...user, ...updates, updatedAt: new Date() };
    users.set(phoneNumber, updated);
    return updated;
  },

  // OTP operations
  async getOTP(phoneNumber: string): Promise<OTPRecord | null> {
    const otp = otps.get(phoneNumber);
    if (!otp) return null;
    
    // Clean up expired OTPs
    if (otp.expiresAt < new Date()) {
      otps.delete(phoneNumber);
      return null;
    }
    
    return otp;
  },

  async createOTP(otp: OTPRecord): Promise<OTPRecord> {
    otps.set(otp.phoneNumber, otp);
    return otp;
  },

  async deleteOTP(phoneNumber: string): Promise<void> {
    otps.delete(phoneNumber);
  },

  async incrementOTPAttempts(phoneNumber: string): Promise<void> {
    const otp = otps.get(phoneNumber);
    if (otp) {
      otp.attempts += 1;
      otps.set(phoneNumber, otp);
    }
  },

  // Session operations
  async getSession(sessionId: string): Promise<Session | null> {
    const session = sessions.get(sessionId);
    if (!session) return null;
    
    // Clean up expired sessions
    if (session.expiresAt < new Date()) {
      sessions.delete(sessionId);
      return null;
    }
    
    return session;
  },

  async createSession(session: Session): Promise<Session> {
    sessions.set(session.id, session);
    return session;
  },

  async deleteSession(sessionId: string): Promise<void> {
    sessions.delete(sessionId);
  },

  // Rate limiting operations
  async getRateLimit(identifier: string): Promise<RateLimitRecord | null> {
    const record = rateLimits.get(identifier);
    if (!record) return null;
    
    // Clean up old windows (15 minutes)
    const windowDuration = 15 * 60 * 1000;
    if (new Date().getTime() - record.windowStart.getTime() > windowDuration) {
      rateLimits.delete(identifier);
      return null;
    }
    
    return record;
  },

  async incrementRateLimit(identifier: string): Promise<RateLimitRecord> {
    const existing = await this.getRateLimit(identifier);
    
    if (existing) {
      existing.attempts += 1;
      rateLimits.set(identifier, existing);
      return existing;
    }
    
    const newRecord: RateLimitRecord = {
      identifier,
      attempts: 1,
      windowStart: new Date(),
    };
    rateLimits.set(identifier, newRecord);
    return newRecord;
  },

  async resetRateLimit(identifier: string): Promise<void> {
    rateLimits.delete(identifier);
  },
};

