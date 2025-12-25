import { NextRequest, NextResponse } from 'next/server';
import { AuthHandler } from '@/lib/handlers';
import { AuthMiddleware } from '@/lib/auth';
import { RateLimiterFactory, applyRateLimitHeaders } from '@/lib/rate-limiter';
import { ValidationError, AuthenticationError, RateLimitError } from '@/lib/errors';
import { Logger } from '@/lib/logger';

const authHandler = new AuthHandler();
const authMiddleware = new AuthMiddleware();
const rateLimiter = RateLimiterFactory.getStrictLimiter();
const logger = Logger.getInstance();

/**
 * POST /api/auth/send-verification
 * Send email verification link (requires authentication)
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimitInfo = await rateLimiter.consume(`send-verification:${clientIP}`);

    // Verify authentication
    const payload = await authMiddleware.authenticate(request);

    await authHandler.sendVerificationEmail(payload.userId);

    logger.info('Verification email sent', { userId: payload.userId });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Verification email has been sent. Please check your inbox.',
      }
    );
    applyRateLimitHeaders(response.headers, rateLimitInfo);
    return response;
  } catch (error) {
    logger.error('Send verification email error', { error });

    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to send verification email.' },
      { status: 500 }
    );
  }
}
