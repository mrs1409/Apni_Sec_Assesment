import { prisma } from '../database';
import { IIssue, ICreateIssueDTO, IUpdateIssueDTO, IIssueFilters, IPaginationParams, IPaginatedResponse } from '@/types';

export interface IIssueRepository {
  findById(id: string): Promise<IIssue | null>;
  findByIdAndUser(id: string, userId: string): Promise<IIssue | null>;
  findAllByUser(userId: string, filters?: IIssueFilters, pagination?: IPaginationParams): Promise<IPaginatedResponse<IIssue>>;
  create(userId: string, data: ICreateIssueDTO): Promise<IIssue>;
  update(id: string, data: IUpdateIssueDTO): Promise<IIssue>;
  delete(id: string): Promise<void>;
  countByUser(userId: string): Promise<number>;
}

export class IssueRepository implements IIssueRepository {
  public async findById(id: string): Promise<IIssue | null> {
    const issue = await prisma.issue.findUnique({
      where: { id },
    });
    
    return issue as IIssue | null;
  }

  public async findByIdAndUser(id: string, userId: string): Promise<IIssue | null> {
    const issue = await prisma.issue.findFirst({
      where: { id, userId },
    });
    
    return issue as IIssue | null;
  }

  public async findAllByUser(
    userId: string,
    filters?: IIssueFilters,
    pagination?: IPaginationParams
  ): Promise<IPaginatedResponse<IIssue>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.issue.count({ where }),
    ]);

    return {
      data: issues as IIssue[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async create(userId: string, data: ICreateIssueDTO): Promise<IIssue> {
    const issue = await prisma.issue.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        status: data.status || 'OPEN',
      },
    });
    
    return issue as IIssue;
  }

  public async update(id: string, data: IUpdateIssueDTO): Promise<IIssue> {
    const issue = await prisma.issue.update({
      where: { id },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.priority && { priority: data.priority }),
        ...(data.status && { status: data.status }),
      },
    });
    
    return issue as IIssue;
  }

  public async delete(id: string): Promise<void> {
    await prisma.issue.delete({
      where: { id },
    });
  }

  public async countByUser(userId: string): Promise<number> {
    return prisma.issue.count({
      where: { userId },
    });
  }
}
