import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/auth';
import { getSessionCookie, deleteSessionCookie } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const sessionId = await getSessionCookie();
    
    if (sessionId) {
      await logout(sessionId);
      await deleteSessionCookie();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}

