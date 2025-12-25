import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../services';
import { AuthMiddleware, setAuthCookies, clearAuthCookies, getRefreshTokenFromCookie } from '../auth';
import { RegisterValidator, LoginValidator } from '../validators';
import { RateLimiterFactory, applyRateLimitHeaders } from '../rate-limiter';
import { ErrorHandler } from '../errors';
import { IApiResponse, IAuthResponse, IUserPublic } from '@/types';

export interface IAuthHandler {
  register(request: NextRequest): Promise<NextResponse>;
  login(request: NextRequest): Promise<NextResponse>;
  logout(request: NextRequest): Promise<NextResponse>;
  getCurrentUser(request: NextRequest): Promise<NextResponse>;
  refreshToken(request: NextRequest): Promise<NextResponse>;
  verifyEmail(request: NextRequest): Promise<NextResponse>;
  resendVerificationEmail(request: NextRequest): Promise<NextResponse>;
  forgotPassword(request: NextRequest): Promise<NextResponse>;
  resetPassword(request: NextRequest): Promise<NextResponse>;
}

export class AuthHandler implements IAuthHandler {
  private authService: AuthService;
  private authMiddleware: AuthMiddleware;
  private registerValidator: RegisterValidator;
  private loginValidator: LoginValidator;
  private rateLimiter = RateLimiterFactory.getAuthLimiter();

  constructor() {
    this.authService = new AuthService();
    this.authMiddleware = new AuthMiddleware();
    this.registerValidator = new RegisterValidator();
    this.loginValidator = new LoginValidator();
  }

  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    return ip.trim();
  }

  public async register(request: NextRequest): Promise<NextResponse> {
    try {
      const clientIP = this.getClientIP(request);
      const rateLimitInfo = await this.rateLimiter.consume(`register:${clientIP}`);

      const body = await request.json();
      const validatedData = this.registerValidator.validate(body);
      
      const result = await this.authService.register(validatedData);

      const response: IApiResponse<{ user: IUserPublic }> = {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: result,
      };

      const nextResponse = NextResponse.json(response, { status: 201 });
      applyRateLimitHeaders(nextResponse.headers, rateLimitInfo);

      return nextResponse;
    } catch (error) {
      const { status, body } = ErrorHandler.handle(error);
      return NextResponse.json(body, { status });
    }
  }

  public async login(request: NextRequest): Promise<NextResponse> {
    try {
      const clientIP = this.getClientIP(request);
      const rateLimitInfo = await this.rateLimiter.consume(`login:${clientIP}`);

      const body = await request.json();
      const validatedData = this.loginValidator.validate(body);

      const result = await this.authService.login(validatedData);

      await setAuthCookies(result.accessToken, result.refreshToken!);

      const response: IApiResponse<IAuthResponse> = {
        success: true,
        message: 'Login successful',
        data: result,
      };

      const nextResponse = NextResponse.json(response, { status: 200 });
      applyRateLimitHeaders(nextResponse.headers, rateLimitInfo);

      return nextResponse;
    } catch (error) {
      const { status, body } = ErrorHandler.handle(error);
      return NextResponse.json(body, { status });
    }
  }

  public async logout(request: NextRequest): Promise<NextResponse> {
    try {
      const payload = await this.authMiddleware.authenticate(request);
      
      await this.authService.logout(payload.userId);
      await clearAuthCookies();

      const response: IApiResponse = {
        success: true,
        message: 'Logout successful',
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      const { status, body } = ErrorHandler.handle(error);
      return NextResponse.json(body, { status });
    }
  }

  public async getCurrentUser(request: NextRequest): Promise<NextResponse> {
    try {
      const clientIP = this.getClientIP(request);
      const rateLimitInfo = await this.rateLimiter.consume(`me:${clientIP}`);

      const payload = await this.authMiddleware.authenticate(request);
      const user = await this.authService.getCurrentUser(payload.userId);

      const response: IApiResponse<IUserPublic> = {
        success: true,
        message: 'User retrieved successfully',
        data: user,
      };

      const nextResponse = NextResponse.json(response, { status: 200 });
      applyRateLimitHeaders(nextResponse.headers, rateLimitInfo);

      return nextResponse;
    } catch (error) {
      const { status, body } = ErrorHandler.handle(error);
      return NextResponse.json(body, { status });
    }
  }

  public async refreshToken(request: NextRequest): Promise<NextResponse> {
    try {
      const refreshToken = await getRefreshTokenFromCookie();

      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const result = await this.authService.refreshTokens(refreshToken);

      await setAuthCookies(result.accessToken, result.refreshToken!);

      const response: IApiResponse<IAuthResponse> = {
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      const { status, body } = ErrorHandler.handle(error);
      return NextResponse.json(body, { status });
    }
  }

  public async verifyEmail(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const token = searchParams.get('token');

      if (!token) {
        throw new Error('Verification token is required');
      }

      await this.authService.verifyEmail(token);

      const response: IApiResponse = {
        success: true,
        message: 'Email verified successfully. You can now login.',
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      const { status, body } = ErrorHandler.handle(error);
      return NextResponse.json(body, { status });
    }
  }

  public async resendVerificationEmail(request: NextRequest): Promise<NextResponse> {
    try {
      const clientIP = this.getClientIP(request);
      const rateLimitInfo = await this.rateLimiter.consume(`resend-verification:${clientIP}`);

      const body = await request.json();
      const { email } = body;

      if (!email) {
        throw new Error('Email is required');
      }

      await this.authService.resendVerificationEmail(email);

      const response: IApiResponse = {
        success: true,
        message: 'Verification email sent successfully',
      };

      const nextResponse = NextResponse.json(response, { status: 200 });
      applyRateLimitHeaders(nextResponse.headers, rateLimitInfo);

      return nextResponse;
    } catch (error) {
      const { status, body } = ErrorHandler.handle(error);
      return NextResponse.json(body, { status });
    }
  }

  public async forgotPassword(request: NextRequest): Promise<NextResponse> {
    try {
      const clientIP = this.getClientIP(request);
      const rateLimitInfo = await this.rateLimiter.consume(`forgot-password:${clientIP}`);

      const body = await request.json();
      const { email } = body;

      if (!email) {
        throw new Error('Email is required');
      }

      await this.authService.forgotPassword(email);

      const response: IApiResponse = {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      };

      const nextResponse = NextResponse.json(response, { status: 200 });
      applyRateLimitHeaders(nextResponse.headers, rateLimitInfo);

      return nextResponse;
    } catch (error) {
      const { status, body } = ErrorHandler.handle(error);
      return NextResponse.json(body, { status });
    }
  }

  public async resetPassword(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { token, password } = body;

      if (!token || !password) {
        throw new Error('Token and password are required');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      await this.authService.resetPassword(token, password);

      const response: IApiResponse = {
        success: true,
        message: 'Password reset successfully. You can now login with your new password.',
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      const { status, body } = ErrorHandler.handle(error);
      return NextResponse.json(body, { status });
    }
  }
}
