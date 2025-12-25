import { NextRequest, NextResponse } from 'next/server';
import { AuthHandler } from '@/lib/handlers';
import { RateLimiterFactory, applyRateLimitHeaders } from '@/lib/rate-limiter';
import { ValidationError, RateLimitError } from '@/lib/errors';
import { Logger } from '@/lib/logger';

const authHandler = new AuthHandler();
const rateLimiter = RateLimiterFactory.getStrictLimiter();
const logger = Logger.getInstance();

/**
 * POST /api/auth/reset-password
 * Reset password using token from email
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimitInfo = await rateLimiter.consume(`reset-password:${clientIP}`);

    const body = await request.json();
    const { token, password } = body;

    if (!token) {
      throw new ValidationError('Reset token is required');
    }

    if (!password) {
      throw new ValidationError('New password is required');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    await authHandler.resetPassword(token, password);

    logger.info('Password reset successful');

    const response = NextResponse.json(
      {
        success: true,
        message: 'Password has been reset successfully. You can now login with your new password.',
      }
    );
    applyRateLimitHeaders(response.headers, rateLimitInfo);
    return response;
  } catch (error) {
    logger.error('Reset password error', { error });

    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to reset password. The link may have expired.' },
      { status: 500 }
    );
  }
}
