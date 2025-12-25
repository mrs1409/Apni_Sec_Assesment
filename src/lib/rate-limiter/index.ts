import { prisma } from '../database';
import { RateLimitError } from '../errors';
import { IRateLimitInfo } from '@/types';

interface IRateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface IRateLimiter {
  check(key: string): Promise<IRateLimitInfo>;
  consume(key: string): Promise<IRateLimitInfo>;
  reset(key: string): Promise<void>;
}

export class RateLimiter implements IRateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(config: IRateLimitConfig) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;
  }

  private generateKey(identifier: string): string {
    return `rate_limit:${identifier}`;
  }

  private calculateResetTime(): Date {
    return new Date(Date.now() + this.windowMs);
  }

  public async check(identifier: string): Promise<IRateLimitInfo> {
    const key = this.generateKey(identifier);
    
    await this.cleanupExpired();
    
    const record = await prisma.rateLimitRecord.findUnique({
      where: { key },
    });

    if (!record || record.expiresAt < new Date()) {
      return {
        limit: this.maxRequests,
        remaining: this.maxRequests,
        reset: Math.ceil(this.calculateResetTime().getTime() / 1000),
      };
    }

    const remaining = Math.max(0, this.maxRequests - record.count);
    
    return {
      limit: this.maxRequests,
      remaining,
      reset: Math.ceil(record.expiresAt.getTime() / 1000),
    };
  }

  public async consume(identifier: string): Promise<IRateLimitInfo> {
    const key = this.generateKey(identifier);
    
    await this.cleanupExpired();
    
    const now = new Date();
    let record = await prisma.rateLimitRecord.findUnique({
      where: { key },
    });

    if (!record || record.expiresAt < now) {
      record = await prisma.rateLimitRecord.upsert({
        where: { key },
        update: {
          count: 1,
          expiresAt: this.calculateResetTime(),
        },
        create: {
          key,
          count: 1,
          expiresAt: this.calculateResetTime(),
        },
      });
    } else {
      if (record.count >= this.maxRequests) {
        const retryAfter = Math.ceil((record.expiresAt.getTime() - now.getTime()) / 1000);
        throw new RateLimitError(retryAfter);
      }

      record = await prisma.rateLimitRecord.update({
        where: { key },
        data: { count: { increment: 1 } },
      });
    }

    const remaining = Math.max(0, this.maxRequests - record.count);

    return {
      limit: this.maxRequests,
      remaining,
      reset: Math.ceil(record.expiresAt.getTime() / 1000),
    };
  }

  public async reset(identifier: string): Promise<void> {
    const key = this.generateKey(identifier);
    
    await prisma.rateLimitRecord.deleteMany({
      where: { key },
    });
  }

  private async cleanupExpired(): Promise<void> {
    try {
      await prisma.rateLimitRecord.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });
    } catch {
      // Silently fail cleanup - non-critical operation
    }
  }
}

export class RateLimiterFactory {
  private static instances: Map<string, RateLimiter> = new Map();

  public static getDefaultLimiter(): RateLimiter {
    const key = 'default';
    
    if (!this.instances.has(key)) {
      this.instances.set(key, new RateLimiter({
        maxRequests: 100,
        windowMs: 15 * 60 * 1000, // 15 minutes
      }));
    }
    
    return this.instances.get(key)!;
  }

  public static getAuthLimiter(): RateLimiter {
    const key = 'auth';
    
    if (!this.instances.has(key)) {
      this.instances.set(key, new RateLimiter({
        maxRequests: 20,
        windowMs: 15 * 60 * 1000, // 15 minutes
      }));
    }
    
    return this.instances.get(key)!;
  }

  public static getStrictLimiter(): RateLimiter {
    const key = 'strict';
    
    if (!this.instances.has(key)) {
      this.instances.set(key, new RateLimiter({
        maxRequests: 10,
        windowMs: 60 * 1000, // 1 minute
      }));
    }
    
    return this.instances.get(key)!;
  }

  public static createCustomLimiter(name: string, config: IRateLimitConfig): RateLimiter {
    if (!this.instances.has(name)) {
      this.instances.set(name, new RateLimiter(config));
    }
    
    return this.instances.get(name)!;
  }
}

/**
 * RateLimitHeaderManager - Utility class for managing rate limit response headers
 * Handles the application of X-RateLimit-* headers to HTTP responses
 */
export class RateLimitHeaderManager {
  public static apply(headers: Headers, rateLimitInfo: IRateLimitInfo): void {
    headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString());
    headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
    headers.set('X-RateLimit-Reset', rateLimitInfo.reset.toString());
  }
}

// Legacy function export for backward compatibility - wrapping class method
export function applyRateLimitHeaders(
  headers: Headers,
  rateLimitInfo: IRateLimitInfo
): void {
  RateLimitHeaderManager.apply(headers, rateLimitInfo);
}
