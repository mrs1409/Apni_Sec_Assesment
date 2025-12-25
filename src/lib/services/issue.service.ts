import { IssueRepository, UserRepository } from '../repositories';
import { EmailServiceFactory, EmailService } from '../email';
import { 
  IIssue, 
  ICreateIssueDTO, 
  IUpdateIssueDTO, 
  IIssueFilters, 
  IPaginationParams,
  IPaginatedResponse 
} from '@/types';
import { NotFoundError, AuthorizationError } from '../errors';

export interface IIssueService {
  createIssue(userId: string, data: ICreateIssueDTO): Promise<IIssue>;
  getIssue(userId: string, issueId: string): Promise<IIssue>;
  getAllIssues(userId: string, filters?: IIssueFilters, pagination?: IPaginationParams): Promise<IPaginatedResponse<IIssue>>;
  updateIssue(userId: string, issueId: string, data: IUpdateIssueDTO): Promise<IIssue>;
  deleteIssue(userId: string, issueId: string): Promise<void>;
}

/**
 * IssueService - Handles all issue-related business logic
 * Implements CRUD operations for security issues with email notifications
 */
export class IssueService implements IIssueService {
  private issueRepository: IssueRepository;
  private userRepository: UserRepository;
  private _emailService: EmailService | null = null;

  constructor() {
    this.issueRepository = new IssueRepository();
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

  public async createIssue(userId: string, data: ICreateIssueDTO): Promise<IIssue> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    const issue = await this.issueRepository.create(userId, data);

    // Send issue created email asynchronously
    this.emailService.sendIssueCreatedEmail(user.email, user.firstName, {
      type: issue.type,
      title: issue.title,
      description: issue.description,
      priority: issue.priority,
    });

    return issue;
  }

  public async getIssue(userId: string, issueId: string): Promise<IIssue> {
    const issue = await this.issueRepository.findByIdAndUser(issueId, userId);

    if (!issue) {
      throw new NotFoundError('Issue');
    }

    return issue;
  }

  public async getAllIssues(
    userId: string,
    filters?: IIssueFilters,
    pagination?: IPaginationParams
  ): Promise<IPaginatedResponse<IIssue>> {
    return this.issueRepository.findAllByUser(userId, filters, pagination);
  }

  public async updateIssue(
    userId: string,
    issueId: string,
    data: IUpdateIssueDTO
  ): Promise<IIssue> {
    const existingIssue = await this.issueRepository.findByIdAndUser(issueId, userId);

    if (!existingIssue) {
      throw new NotFoundError('Issue');
    }

    return this.issueRepository.update(issueId, data);
  }

  public async deleteIssue(userId: string, issueId: string): Promise<void> {
    const existingIssue = await this.issueRepository.findByIdAndUser(issueId, userId);

    if (!existingIssue) {
      throw new NotFoundError('Issue');
    }

    await this.issueRepository.delete(issueId);
  }
}
