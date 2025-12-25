import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services';
import { RateLimiterFactory, applyRateLimitHeaders } from '@/lib/rate-limiter';
import { ValidationError, RateLimitError, NotFoundError } from '@/lib/errors';
import { Logger } from '@/lib/logger';
import { UserRepository } from '@/lib/repositories';

const authService = new AuthService();
const userRepository = new UserRepository();
const rateLimiter = RateLimiterFactory.getStrictLimiter();
const logger = Logger.getInstance();

/**
 * POST /api/auth/resend-verification
 * Resend email verification link (public endpoint, accepts email)
 * This is used when user is not logged in (after registration)
 */
export async function POST(request: NextRequest) {
  try {
    // Apply strict rate limiting to prevent abuse
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimitInfo = await rateLimiter.consume(`resend-verification:${clientIP}`);

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      throw new ValidationError('Email is required');
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await userRepository.findByEmail(normalizedEmail);

    if (!user) {
      // Don't reveal if email exists or not - always show success message
      logger.info('Resend verification requested for non-existent email', { email: normalizedEmail });
      const response = NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent.',
      });
      applyRateLimitHeaders(response.headers, rateLimitInfo);
      return response;
    }

    // Check if already verified
    if (user.emailVerified) {
      logger.info('Resend verification requested for already verified email', { email: normalizedEmail });
      const response = NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent.',
      });
      applyRateLimitHeaders(response.headers, rateLimitInfo);
      return response;
    }

    // Send verification email
    await authService.sendVerificationEmail(user.id);

    logger.info('Verification email resent', { userId: user.id, email: normalizedEmail });

    const response = NextResponse.json({
      success: true,
      message: 'Verification email has been sent. Please check your inbox.',
    });
    applyRateLimitHeaders(response.headers, rateLimitInfo);
    return response;
  } catch (error) {
    logger.error('Resend verification email error', { error });

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

    // Generic error - don't expose details
    return NextResponse.json(
      { success: false, message: 'Failed to send verification email. Please try again.' },
      { status: 500 }
    );
  }
}
