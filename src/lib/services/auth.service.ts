import { UserRepository } from '../repositories';
import { AuthUtils } from '../auth';
import { EmailServiceFactory, EmailService } from '../email';
import { 
  ICreateUserDTO, 
  ILoginDTO, 
  IAuthResponse, 
  IUserPublic,
  ITokenPayload 
} from '@/types';
import { 
  AuthenticationError, 
  ConflictError, 
  NotFoundError,
  ValidationError 
} from '../errors';

export interface IAuthService {
  register(data: ICreateUserDTO): Promise<IAuthResponse>;
  login(data: ILoginDTO): Promise<IAuthResponse>;
  logout(userId: string): Promise<void>;
  getCurrentUser(userId: string): Promise<IUserPublic>;
  refreshTokens(refreshToken: string): Promise<IAuthResponse>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  sendVerificationEmail(userId: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
}

/**
 * AuthService - Handles all authentication-related business logic
 * Implements user registration, login, logout, and token management
 */
export class AuthService implements IAuthService {
  private userRepository: UserRepository;
  private passwordService = AuthUtils.getPasswordService();
  private tokenService = AuthUtils.getTokenService();
  private _emailService: EmailService | null = null;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Get email service lazily to avoid build-time initialization
   */
  private get emailService(): EmailService {
    if (!this._emailService) {
      this._emailService = EmailServiceFactory.getInstance();
    }
    return this._emailService;
  }

  public async register(data: ICreateUserDTO): Promise<IAuthResponse> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await this.passwordService.hash(data.password);

    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const tokenPayload: ITokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.tokenService.generateAccessToken(tokenPayload);
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);

    await this.userRepository.updateRefreshToken(user.id, refreshToken);

    // Send welcome email asynchronously
    this.emailService.sendWelcomeEmail(user.email, user.firstName);

    // Send verification email asynchronously
    this.sendVerificationEmail(user.id).catch((err) => {
      console.error('Failed to send verification email:', err);
    });

    return {
      user: UserRepository.toPublic(user),
      accessToken,
      refreshToken,
    };
  }

  public async login(data: ILoginDTO): Promise<IAuthResponse> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await this.passwordService.compare(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new AuthenticationError('Please verify your email before logging in. Check your inbox for the verification link.');
    }

    const tokenPayload: ITokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.tokenService.generateAccessToken(tokenPayload);
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);

    await this.userRepository.updateRefreshToken(user.id, refreshToken);

    return {
      user: UserRepository.toPublic(user),
      accessToken,
      refreshToken,
    };
  }

  public async logout(userId: string): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, null);
  }

  public async getCurrentUser(userId: string): Promise<IUserPublic> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    return UserRepository.toPublic(user);
  }

  public async refreshTokens(refreshToken: string): Promise<IAuthResponse> {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const user = await this.userRepository.findById(payload.userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const tokenPayload: ITokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = this.tokenService.generateAccessToken(tokenPayload);
    const newRefreshToken = this.tokenService.generateRefreshToken(tokenPayload);

    await this.userRepository.updateRefreshToken(user.id, newRefreshToken);

    return {
      user: UserRepository.toPublic(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Initiate password reset - sends email with reset link
   */
  public async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    // Don't reveal if user exists or not for security
    if (!user) {
      return;
    }

    const resetToken = await this.userRepository.setPasswordResetToken(user.id);
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(user.email, user.firstName, resetLink);
  }

  /**
   * Reset password using token
   */
  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByPasswordResetToken(token);

    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    if (!user.passwordResetExpiry || new Date() > user.passwordResetExpiry) {
      throw new ValidationError('Reset token has expired');
    }

    const hashedPassword = await this.passwordService.hash(newPassword);
    await this.userRepository.resetPassword(user.id, hashedPassword);
  }

  /**
   * Send email verification link
   */
  public async sendVerificationEmail(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.emailVerified) {
      throw new ValidationError('Email is already verified');
    }

    const verificationToken = await this.userRepository.setEmailVerificationToken(user.id);
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, user.firstName, verificationLink);
  }

  /**
   * Verify email using token
   */
  public async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findByEmailVerificationToken(token);

    if (!user) {
      throw new ValidationError('Invalid or expired verification token');
    }

    if (!user.emailVerificationExpiry || new Date() > user.emailVerificationExpiry) {
      throw new ValidationError('Verification token has expired');
    }

    await this.userRepository.verifyEmail(user.id);
  }
}
