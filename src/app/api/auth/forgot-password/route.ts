import { NextRequest, NextResponse } from 'next/server';
import { AuthHandler } from '@/lib/handlers';
import { RateLimiterFactory, applyRateLimitHeaders } from '@/lib/rate-limiter';
import { ValidationError, RateLimitError } from '@/lib/errors';
import { Logger } from '@/lib/logger';

const authHandler = new AuthHandler();
const rateLimiter = RateLimiterFactory.getStrictLimiter();
const logger = Logger.getInstance();

/**
 * POST /api/auth/forgot-password
 * Initiate password reset - sends email with reset link
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimitInfo = await rateLimiter.consume(`forgot-password:${clientIP}`);

    const body = await request.json();
    const { email } = body;

    if (!email) {
      throw new ValidationError('Email is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    await authHandler.forgotPassword(email);

    logger.info('Password reset requested', { email });

    // Always return success to prevent email enumeration
    const response = NextResponse.json(
      {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      }
    );
    applyRateLimitHeaders(response.headers, rateLimitInfo);
    return response;
  } catch (error) {
    logger.error('Forgot password error', { error });

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
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
