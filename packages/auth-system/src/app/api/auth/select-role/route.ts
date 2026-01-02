import { NextRequest, NextResponse } from 'next/server';
import { selectRole, AuthError } from '@/lib/auth';
import { selectRoleSchema } from '@/lib/validation';
import { requireAuth } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const currentUser = await requireAuth();
    
    const body = await request.json();
    
    // Validate input
    const result = selectRoleSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { role } = result.data;
    
    // Select role
    const user = await selectRole(currentUser.id, role);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        phoneVerified: user.phoneVerified,
        email: user.email,
        role: user.role,
      },
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
    
    console.error('Select role error:', error);
    return NextResponse.json(
      { error: 'Failed to select role' },
      { status: 500 }
    );
  }
}

