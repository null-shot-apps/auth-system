import { NextRequest, NextResponse } from 'next/server';
import { addPhoneToUser, AuthError } from '@/lib/auth';
import { addPhoneSchema } from '@/lib/validation';
import { requireAuth } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const currentUser = await requireAuth();
    
    const body = await request.json();
    
    // Validate input
    const result = addPhoneSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { phoneNumber } = result.data;
    
    // Add phone to user
    const user = await addPhoneToUser(currentUser.id, phoneNumber);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        phoneVerified: user.phoneVerified,
        email: user.email,
        role: user.role,
      },
      message: 'Phone number added. Please verify with OTP.',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.error('Add phone error:', error);
    return NextResponse.json(
      { error: 'Failed to add phone number' },
      { status: 500 }
    );
  }
}

