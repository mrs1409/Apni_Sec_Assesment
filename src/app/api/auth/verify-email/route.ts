import { NextRequest, NextResponse } from 'next/server';
import { AuthHandler } from '@/lib/handlers';
import { RateLimiterFactory, applyRateLimitHeaders } from '@/lib/rate-limiter';
import { ValidationError, RateLimitError } from '@/lib/errors';
import { Logger } from '@/lib/logger';

const authHandler = new AuthHandler();
const rateLimiter = RateLimiterFactory.getDefaultLimiter();
const logger = Logger.getInstance();

/**
 * POST /api/auth/verify-email
 * Verify email using token from verification email
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimitInfo = await rateLimiter.consume(`verify-email:${clientIP}`);

    const body = await request.json();
    const { token } = body;

    if (!token) {
      throw new ValidationError('Verification token is required');
    }

    await authHandler.verifyEmail(token);

    logger.info('Email verified successfully');

    const response = NextResponse.json(
      {
        success: true,
        message: 'Email has been verified successfully.',
      }
    );
    applyRateLimitHeaders(response.headers, rateLimitInfo);
    return response;
  } catch (error) {
    logger.error('Email verification error', { error });

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
      { success: false, message: 'Failed to verify email. The link may have expired.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/verify-email?token=xxx
 * Verify email using token from URL
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      throw new ValidationError('Verification token is required');
    }

    await authHandler.verifyEmail(token);

    logger.info('Email verified successfully via GET');

    // Redirect to login page with success message
    return NextResponse.redirect(
      new URL('/login?verified=true', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    );
  } catch (error) {
    logger.error('Email verification error (GET)', { error });

    // Redirect to login page with error
    return NextResponse.redirect(
      new URL('/login?verifyError=true', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    );
  }
}
