import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ITokenPayload } from '@/types';

interface IPasswordService {
  hash(password: string): Promise<string>;
  compare(password: string, hashedPassword: string): Promise<boolean>;
}

interface ITokenService {
  generateAccessToken(payload: ITokenPayload): string;
  generateRefreshToken(payload: ITokenPayload): string;
  verifyAccessToken(token: string): ITokenPayload | null;
  verifyRefreshToken(token: string): ITokenPayload | null;
}

export class PasswordService implements IPasswordService {
  private readonly saltRounds: number;

  constructor(saltRounds = 12) {
    this.saltRounds = saltRounds;
  }

  public async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  public async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

export class TokenService implements ITokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'access-secret-key-change-in-production';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-change-in-production';
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  }

  public generateAccessToken(payload: ITokenPayload): string {
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      },
      this.accessTokenSecret,
      { expiresIn: this.accessTokenExpiry as jwt.SignOptions['expiresIn'] }
    );
  }

  public generateRefreshToken(payload: ITokenPayload): string {
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      },
      this.refreshTokenSecret,
      { expiresIn: this.refreshTokenExpiry as jwt.SignOptions['expiresIn'] }
    );
  }

  public verifyAccessToken(token: string): ITokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as ITokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  public verifyRefreshToken(token: string): ITokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret) as ITokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }
}

export class AuthUtils {
  private static passwordService: PasswordService = new PasswordService();
  private static tokenService: TokenService = new TokenService();

  public static getPasswordService(): PasswordService {
    return this.passwordService;
  }

  public static getTokenService(): TokenService {
    return this.tokenService;
  }
}
