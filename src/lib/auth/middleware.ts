import { NextRequest } from 'next/server';
import { AuthUtils } from './utils';
import { AuthenticationError } from '../errors';
import { ITokenPayload } from '@/types';
import { cookies } from 'next/headers';

export interface IAuthenticatedRequest extends NextRequest {
  user?: ITokenPayload;
}

export class AuthMiddleware {
  private tokenService = AuthUtils.getTokenService();

  public async authenticate(request: NextRequest): Promise<ITokenPayload> {
    const token = this.extractToken(request);

    if (!token) {
      throw new AuthenticationError('No authentication token provided');
    }

    const payload = this.tokenService.verifyAccessToken(token);

    if (!payload) {
      throw new AuthenticationError('Invalid or expired token');
    }

    return payload;
  }

  public async authenticateOptional(request: NextRequest): Promise<ITokenPayload | null> {
    try {
      return await this.authenticate(request);
    } catch {
      return null;
    }
  }

  private extractToken(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const cookieToken = request.cookies.get('accessToken')?.value;
    if (cookieToken) {
      return cookieToken;
    }

    return null;
  }
}

/**
 * CookieManager - Handles authentication cookie operations
 * Provides methods for setting, clearing, and retrieving auth cookies
 */
export class CookieManager {
  private static readonly ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes
  private static readonly REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

  public static async setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
    const cookieStore = await cookies();
    
    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: this.ACCESS_TOKEN_MAX_AGE,
      path: '/',
    });

    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: this.REFRESH_TOKEN_MAX_AGE,
      path: '/',
    });
  }

  public static async clearAuthCookies(): Promise<void> {
    const cookieStore = await cookies();
    
    cookieStore.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    cookieStore.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
  }

  public static async getRefreshToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('refreshToken')?.value || null;
  }

  public static async getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('accessToken')?.value || null;
  }
}

// Legacy function exports for backward compatibility - wrapping class methods
export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
  return CookieManager.setAuthCookies(accessToken, refreshToken);
}

export async function clearAuthCookies(): Promise<void> {
  return CookieManager.clearAuthCookies();
}

export async function getRefreshTokenFromCookie(): Promise<string | null> {
  return CookieManager.getRefreshToken();
}
