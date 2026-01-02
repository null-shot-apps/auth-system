import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, AuthError } from '@/lib/auth';
import { verifyOTPSchema } from '@/lib/validation';
import { setSessionCookie } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = verifyOTPSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { phoneNumber, code } = result.data;
    
    // Verify OTP
    const { user, session } = await verifyOTP(phoneNumber, code);
    
    // Set session cookie
    await setSessionCookie(session.id);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        phoneVerified: user.phoneVerified,
        email: user.email,
        role: user.role,
      },
      needsRole: !user.role,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }
    
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}

