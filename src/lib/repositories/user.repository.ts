import { prisma } from '../database';
import { IUser, ICreateUserDTO, IUpdateUserDTO, IUserPublic } from '@/types';
import crypto from 'crypto';

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findByPasswordResetToken(token: string): Promise<IUser | null>;
  findByEmailVerificationToken(token: string): Promise<IUser | null>;
  create(data: ICreateUserDTO & { password: string }): Promise<IUser>;
  update(id: string, data: IUpdateUserDTO): Promise<IUser>;
  updateRefreshToken(id: string, refreshToken: string | null): Promise<void>;
  setPasswordResetToken(id: string): Promise<string>;
  resetPassword(id: string, hashedPassword: string): Promise<void>;
  setEmailVerificationToken(id: string): Promise<string>;
  verifyEmail(id: string): Promise<void>;
  markWelcomeEmailSent(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}

export class UserRepository implements IUserRepository {
  public async findById(id: string): Promise<IUser | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  public async findByEmail(email: string): Promise<IUser | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  public async findByPasswordResetToken(token: string): Promise<IUser | null> {
    return prisma.user.findUnique({
      where: { passwordResetToken: token },
    });
  }

  public async findByEmailVerificationToken(token: string): Promise<IUser | null> {
    return prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });
  }

  public async create(data: ICreateUserDTO & { password: string }): Promise<IUser> {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        company: data.company || null,
      },
    });
  }

  public async update(id: string, data: IUpdateUserDTO): Promise<IUser> {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.company !== undefined && { company: data.company }),
      },
    });
  }

  public async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }

  public async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  public async setPasswordResetToken(id: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id },
      data: {
        passwordResetToken: token,
        passwordResetExpiry: expiry,
      },
    });

    return token;
  }

  public async resetPassword(id: string, hashedPassword: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });
  }

  public async setEmailVerificationToken(id: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpiry: expiry,
      },
    });

    return token;
  }

  public async verifyEmail(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });
  }

  public async markWelcomeEmailSent(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        welcomeEmailSent: true,
      },
    });
  }

  public static toPublic(user: IUser): IUserPublic {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      company: user.company,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
