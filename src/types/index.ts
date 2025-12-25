export interface IUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  company: string | null;
  role: string;
  isVerified: boolean;
  emailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationExpiry: Date | null;
  passwordResetToken: string | null;
  passwordResetExpiry: Date | null;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPublic {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  company: string | null;
  role: string;
  isVerified: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
}

export interface IUpdateUserDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
}

export interface ILoginDTO {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: IUserPublic;
  accessToken: string;
  refreshToken?: string;
}

export interface ITokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export type IssueType = 'CLOUD_SECURITY' | 'RETEAM_ASSESSMENT' | 'VAPT';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface IIssue {
  id: string;
  type: IssueType;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateIssueDTO {
  type: IssueType;
  title: string;
  description: string;
  priority?: Priority;
  status?: Status;
}

export interface IUpdateIssueDTO {
  type?: IssueType;
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
}

export interface IIssueFilters {
  type?: IssueType;
  status?: Status;
  priority?: Priority;
  search?: string;
}

export interface IPaginationParams {
  page?: number;
  limit?: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface IRateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}
