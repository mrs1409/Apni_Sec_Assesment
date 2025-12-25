import { UserRepository } from '../repositories';
import { EmailServiceFactory, EmailService } from '../email';
import { IUpdateUserDTO, IUserPublic } from '@/types';
import { NotFoundError } from '../errors';

export interface IUserService {
  getProfile(userId: string): Promise<IUserPublic>;
  updateProfile(userId: string, data: IUpdateUserDTO): Promise<IUserPublic>;
}

/**
 * UserService - Handles user profile-related business logic
 * Implements profile retrieval and update functionality
 */
export class UserService implements IUserService {
  private userRepository: UserRepository;
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

  public async getProfile(userId: string): Promise<IUserPublic> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    return UserRepository.toPublic(user);
  }

  public async updateProfile(userId: string, data: IUpdateUserDTO): Promise<IUserPublic> {
    const existingUser = await this.userRepository.findById(userId);

    if (!existingUser) {
      throw new NotFoundError('User');
    }

    const updatedUser = await this.userRepository.update(userId, data);

    // Send profile updated email asynchronously (fire-and-forget)
    this.emailService.sendProfileUpdatedEmail(updatedUser.email, updatedUser.firstName).catch((err) => {
      console.error('Failed to send profile updated email:', err);
    });

    return UserRepository.toPublic(updatedUser);
  }
}
