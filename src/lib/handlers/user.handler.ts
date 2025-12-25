import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../services';
import { AuthMiddleware } from '../auth';
import { UpdateProfileValidator } from '../validators';
import { RateLimiterFactory, applyRateLimitHeaders } from '../rate-limiter';
import { ErrorHandler } from '../errors';
import { IApiResponse, IUserPublic } from '@/types';

export interface IUserHandler {
  getProfile(request: NextRequest): Promise<NextResponse>;
  updateProfile(request: NextRequest): Promise<NextResponse>;
}

export class UserHandler implements IUserHandler {
  private userService: UserService;
  private authMiddleware: AuthMiddleware;
  private updateProfileValidator: UpdateProfileValidator;
  private rateLimiter = RateLimiterFactory.getDefaultLimiter();

  constructor() {
    this.userService = new UserService();
    this.authMiddleware = new AuthMiddleware();
    this.updateProfileValidator = new UpdateProfileValidator();
  }

  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    return ip.trim();
  }

  public async getProfile(request: NextRequest): Promise<NextResponse> {
    try {
      const clientIP = this.getClientIP(request);
      const rateLimitInfo = await this.rateLimiter.consume(`profile:${clientIP}`);

      const payload = await this.authMiddleware.authenticate(request);
      const user = await this.userService.getProfile(payload.userId);

      const response: IApiResponse<IUserPublic> = {
        success: true,
        message: 'Profile retrieved successfully',
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

  public async updateProfile(request: NextRequest): Promise<NextResponse> {
    try {
      const clientIP = this.getClientIP(request);
      const rateLimitInfo = await this.rateLimiter.consume(`profile:${clientIP}`);

      const payload = await this.authMiddleware.authenticate(request);
      const body = await request.json();
      const validatedData = this.updateProfileValidator.validate(body);

      const user = await this.userService.updateProfile(payload.userId, validatedData);

      const response: IApiResponse<IUserPublic> = {
        success: true,
        message: 'Profile updated successfully',
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
}
