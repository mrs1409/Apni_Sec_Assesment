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
  NotFoundError
} from '../errors';

export interface IAuthService {
  register(data: ICreateUserDTO): Promise<IAuthResponse>;
  login(data: ILoginDTO): Promise<IAuthResponse>;
  logout(userId: string): Promise<void>;
  getCurrentUser(userId: string): Promise<IUserPublic>;
  refreshTokens(refreshToken: string): Promise<IAuthResponse>;
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

    // Send welcome email asynchronously (don't block registration)
    this.emailService.sendWelcomeEmail(user.email, user.firstName).catch((err) => {
      console.error('Failed to send welcome email:', err);
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
}
