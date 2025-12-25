import { NextRequest, NextResponse } from 'next/server';
import { IssueService } from '../services';
import { AuthMiddleware } from '../auth';
import { CreateIssueValidator, UpdateIssueValidator } from '../validators';
import { RateLimiterFactory, applyRateLimitHeaders } from '../rate-limiter';
import { ErrorHandler } from '../errors';
import { IApiResponse, IIssue, IPaginatedResponse, IssueType, Status, Priority } from '@/types';

export interface IIssueHandler {
  createIssue(request: NextRequest): Promise<NextResponse>;
  getIssue(request: NextRequest, issueId: string): Promise<NextResponse>;
  getAllIssues(request: NextRequest): Promise<NextResponse>;
  updateIssue(request: NextRequest, issueId: string): Promise<NextResponse>;
  deleteIssue(request: NextRequest, issueId: string): Promise<NextResponse>;
}

export class IssueHandler implements IIssueHandler {
  private issueService: IssueService;
  private authMiddleware: AuthMiddleware;
  private createIssueValidator: CreateIssueValidator;
  private updateIssueValidator: UpdateIssueValidator;
  private rateLimiter = RateLimiterFactory.getDefaultLimiter();

  constructor() {
    this.issueService = new IssueService();
    this.authMiddleware = new AuthMiddleware();
    this.createIssueValidator = new CreateIssueValidator();
    this.updateIssueValidator = new UpdateIssueValidator();
  }

  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    return ip.trim();
  }

  public async createIssue(request: NextRequest): Promise<NextResponse> {
    try {
      const clientIP = this.getClientIP(request);
      const rateLimitInfo = await this.rateLimiter.consume(`issues:${clientIP}`);

      const payload = await this.authMiddleware.authenticate(request);
      const body = await request.json();
      const validatedData = this.createIssueValidator.validate(body);

      const issue = await this.issueService.createIssue(payload.userId, validatedData);

      const response: IApiResponse<IIssue> = {
        success: true,
        message: 'Issue created successfully',
        data: issue,
      };

      const nextResponse = NextResponse.json(response, { status: 201 });
      applyRateLimitHeaders(nextResponse.headers, rateLimitInfo);

      return nextResponse;
    } catch (error) {
      const { status, body } = ErrorHandler.handle(error);
      return NextResponse.json(body, { status });
    }
  }

  public async getIssue(request: NextRequest, issueId: string): Promise<NextResponse> {
    try {
      const clientIP = this.getClientIP(request);
      const rateLimitInfo = await this.rateLimiter.consume(`issues:${clientIP}`);

      const payload = await this.authMiddleware.authenticate(request);
      const issue = await this.issueService.getIssue(payload.userId, issueId);

      const response: IApiResponse<IIssue> = {
        success: true,
        message: 'Issue retrieved successfully',
        data: issue,
      };

      const nextResponse = NextResponse.json(response, { status: 200 });
      applyRateLimitHeaders(nextResponse.headers, rateLimitInfo);

      return nextResponse;
    } catch (error) {
      const { status, body } = ErrorHandler.handle(error);
      return NextResponse.json(body, { status });
    }
  }

  public async getAllIssues(request: NextRequest): Promise<NextResponse> {
    try {
      const clientIP = this.getClientIP(request);
      const rateLimitInfo = await this.rateLimiter.consume(`issues:${clientIP}`);

      const payload = await this.authMiddleware.authenticate(request);

      const { searchParams } = new URL(request.url);
      
      const filters = {
        type: searchParams.get('type') as IssueType | undefined,
        status: searchParams.get('status') as Status | undefined,
        priority: searchParams.get('priority') as Priority | undefined,
        search: searchParams.get('search') || undefined,
      };

      const pagination = {
        page: parseInt(searchParams.get('page') || '1', 10),
        limit: parseInt(searchParams.get('limit') || '10', 10),
      };

      const result = await this.issueService.getAllIssues(payload.userId, filters, pagination);

      const response: IApiResponse<IPaginatedResponse<IIssue>> = {
        success: true,
        message: 'Issues retrieved successfully',
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

  public async updateIssue(request: NextRequest, issueId: string): Promise<NextResponse> {
    try {
      const clientIP = this.getClientIP(request);
      const rateLimitInfo = await this.rateLimiter.consume(`issues:${clientIP}`);

      const payload = await this.authMiddleware.authenticate(request);
      const body = await request.json();
      const validatedData = this.updateIssueValidator.validate(body);

      const issue = await this.issueService.updateIssue(payload.userId, issueId, validatedData);

      const response: IApiResponse<IIssue> = {
        success: true,
        message: 'Issue updated successfully',
        data: issue,
      };

      const nextResponse = NextResponse.json(response, { status: 200 });
      applyRateLimitHeaders(nextResponse.headers, rateLimitInfo);

      return nextResponse;
    } catch (error) {
      const { status, body } = ErrorHandler.handle(error);
      return NextResponse.json(body, { status });
    }
  }

  public async deleteIssue(request: NextRequest, issueId: string): Promise<NextResponse> {
    try {
      const clientIP = this.getClientIP(request);
      const rateLimitInfo = await this.rateLimiter.consume(`issues:${clientIP}`);

      const payload = await this.authMiddleware.authenticate(request);
      await this.issueService.deleteIssue(payload.userId, issueId);

      const response: IApiResponse = {
        success: true,
        message: 'Issue deleted successfully',
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
