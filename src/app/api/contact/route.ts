import { NextRequest, NextResponse } from 'next/server';
import { EmailServiceFactory } from '@/lib/email';
import { RateLimiterFactory, applyRateLimitHeaders } from '@/lib/rate-limiter';
import { ValidationError, RateLimitError } from '@/lib/errors';
import { Logger } from '@/lib/logger';

const rateLimiter = RateLimiterFactory.getStrictLimiter();
const logger = Logger.getInstance();

/**
 * POST /api/contact
 * Handle contact form submissions
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimitInfo = await rateLimiter.consume(`contact:${clientIP}`);

    const body = await request.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      throw new ValidationError('Please provide your full name');
    }

    if (!email || typeof email !== 'string') {
      throw new ValidationError('Please provide a valid email address');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Please provide a valid email address');
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      throw new ValidationError('Please provide a message (at least 10 characters)');
    }

    // Get email service
    const emailService = EmailServiceFactory.getInstance();

    // Send notification email to ApniSec team
    await emailService.sendContactFormEmail(
      name.trim(),
      email.trim().toLowerCase(),
      message.trim()
    );

    logger.info('Contact form submitted', { name, email });

    const response = NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
    });
    applyRateLimitHeaders(response.headers, rateLimitInfo);
    return response;
  } catch (error) {
    logger.error('Contact form error', { error });

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
      { success: false, message: 'Failed to send message. Please try again or email us directly at contact@apnisec.com' },
      { status: 500 }
    );
  }
}
