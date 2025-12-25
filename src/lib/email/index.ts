import { Resend } from 'resend';

interface IEmailService {
  sendWelcomeEmail(email: string, firstName: string): Promise<void>;
  sendIssueCreatedEmail(email: string, firstName: string, issue: IssueDetails): Promise<void>;
  sendProfileUpdatedEmail(email: string, firstName: string): Promise<void>;
  sendPasswordResetEmail(email: string, firstName: string, resetLink: string): Promise<void>;
  sendVerificationEmail(email: string, firstName: string, verificationLink: string): Promise<void>;
  sendContactFormEmail(name: string, email: string, message: string): Promise<void>;
}

interface IssueDetails {
  type: string;
  title: string;
  description: string;
  priority: string;
}

/**
 * EmailService - Handles all email communications using Resend
 * Uses lazy initialization to avoid build-time errors when API key is not available
 */
export class EmailService implements IEmailService {
  private resend: Resend | null = null;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@apnisec.com';
  }

  /**
   * Get the Resend client lazily
   * Returns null if API key is not configured
   */
  private getResend(): Resend | null {
    if (!this.resend && process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
    return this.resend;
  }

  /**
   * Check if email service is available
   */
  private isAvailable(): boolean {
    return !!this.getResend();
  }

  private formatIssueType(type: string): string {
    const typeMap: Record<string, string> = {
      'CLOUD_SECURITY': 'Cloud Security',
      'RETEAM_ASSESSMENT': 'Reteam Assessment',
      'VAPT': 'VAPT (Vulnerability Assessment and Penetration Testing)',
    };
    return typeMap[type] || type;
  }

  public async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    if (!this.isAvailable()) {
      console.warn('Email service not configured - skipping welcome email');
      return;
    }
    
    try {
      await this.getResend()!.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Welcome to ApniSec - Your Cybersecurity Partner',
        html: this.getWelcomeEmailTemplate(firstName),
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }

  public async sendIssueCreatedEmail(
    email: string,
    firstName: string,
    issue: IssueDetails
  ): Promise<void> {
    if (!this.isAvailable()) {
      console.warn('Email service not configured - skipping issue created email');
      return;
    }
    
    try {
      await this.getResend()!.emails.send({
        from: this.fromEmail,
        to: email,
        subject: `Issue Created: ${issue.title} - ApniSec`,
        html: this.getIssueCreatedEmailTemplate(firstName, issue),
      });
    } catch (error) {
      console.error('Failed to send issue created email:', error);
    }
  }

  public async sendProfileUpdatedEmail(email: string, firstName: string): Promise<void> {
    if (!this.isAvailable()) {
      console.warn('Email service not configured - skipping profile updated email');
      return;
    }
    
    try {
      await this.getResend()!.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Profile Updated - ApniSec',
        html: this.getProfileUpdatedEmailTemplate(firstName),
      });
    } catch (error) {
      console.error('Failed to send profile updated email:', error);
    }
  }

  public async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetLink: string
  ): Promise<void> {
    if (!this.isAvailable()) {
      console.warn('Email service not configured - skipping password reset email');
      return;
    }
    
    try {
      await this.getResend()!.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Password Reset Request - ApniSec',
        html: this.getPasswordResetEmailTemplate(firstName, resetLink),
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }
  }

  public async sendVerificationEmail(
    email: string,
    firstName: string,
    verificationLink: string
  ): Promise<void> {
    if (!this.isAvailable()) {
      console.warn('Email service not configured - skipping verification email');
      return;
    }
    
    try {
      await this.getResend()!.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Verify Your Email - ApniSec',
        html: this.getVerificationEmailTemplate(firstName, verificationLink),
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }
  }

  public async sendContactFormEmail(
    name: string,
    email: string,
    message: string
  ): Promise<void> {
    if (!this.isAvailable()) {
      console.warn('Email service not configured - skipping contact form email');
      return;
    }
    
    const notificationEmail = process.env.CONTACT_EMAIL || 'contact@apnisec.com';
    
    try {
      await this.getResend()!.emails.send({
        from: this.fromEmail,
        to: notificationEmail,
        replyTo: email,
        subject: `New Contact Form Submission from ${name}`,
        html: this.getContactFormEmailTemplate(name, email, message),
      });
    } catch (error) {
      console.error('Failed to send contact form email:', error);
      throw error; // Re-throw to let the API route handle it
    }
  }

  private getWelcomeEmailTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ApniSec</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
          <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <tr>
              <td style="background-color: #1a1a2e; padding: 30px; text-align: center;">
                <h1 style="color: #4ade80; margin: 0; font-size: 28px; font-weight: bold;">ApniSec</h1>
                <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">Your Cybersecurity Partner</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">Welcome, ${firstName}!</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Thank you for joining ApniSec. We're excited to have you on board and help you secure your digital assets.
                </p>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  With ApniSec, you can:
                </p>
                <ul style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
                  <li>Create and manage security issues</li>
                  <li>Track Cloud Security assessments</li>
                  <li>Monitor VAPT progress</li>
                  <li>Collaborate on Reteam assessments</li>
                </ul>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
                   style="display: inline-block; background-color: #4ade80; color: #1a1a2e; text-decoration: none; padding: 14px 28px; border-radius: 0; font-weight: bold; font-size: 16px; border: 3px solid #1a1a2e; box-shadow: 4px 4px 0 #1a1a2e;">
                  Go to Dashboard
                </a>
              </td>
            </tr>
            <tr>
              <td style="background-color: #1a1a2e; padding: 20px 30px; text-align: center;">
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                  © 2025 ApniSec. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private getIssueCreatedEmailTemplate(firstName: string, issue: IssueDetails): string {
    const priorityColors: Record<string, string> = {
      'LOW': '#22c55e',
      'MEDIUM': '#f59e0b',
      'HIGH': '#f97316',
      'CRITICAL': '#ef4444',
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Issue Created - ApniSec</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
          <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <tr>
              <td style="background-color: #1a1a2e; padding: 30px; text-align: center;">
                <h1 style="color: #4ade80; margin: 0; font-size: 28px; font-weight: bold;">ApniSec</h1>
                <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">Issue Created Successfully</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">Hello, ${firstName}!</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Your issue has been created successfully. Here are the details:
                </p>
                <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 3px solid #1a1a2e; margin: 0 0 20px 0;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: bold;">Issue Type</p>
                      <p style="color: #1a1a2e; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">${this.formatIssueType(issue.type)}</p>
                      
                      <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: bold;">Title</p>
                      <p style="color: #1a1a2e; font-size: 16px; margin: 0 0 15px 0;">${issue.title}</p>
                      
                      <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: bold;">Description</p>
                      <p style="color: #1a1a2e; font-size: 16px; margin: 0 0 15px 0;">${issue.description}</p>
                      
                      <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: bold;">Priority</p>
                      <span style="display: inline-block; background-color: ${priorityColors[issue.priority] || '#94a3b8'}; color: #ffffff; padding: 4px 12px; font-size: 14px; font-weight: bold;">${issue.priority}</span>
                    </td>
                  </tr>
                </table>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
                   style="display: inline-block; background-color: #4ade80; color: #1a1a2e; text-decoration: none; padding: 14px 28px; border-radius: 0; font-weight: bold; font-size: 16px; border: 3px solid #1a1a2e; box-shadow: 4px 4px 0 #1a1a2e;">
                  View in Dashboard
                </a>
              </td>
            </tr>
            <tr>
              <td style="background-color: #1a1a2e; padding: 20px 30px; text-align: center;">
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                  © 2025 ApniSec. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private getProfileUpdatedEmailTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Profile Updated - ApniSec</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
          <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <tr>
              <td style="background-color: #1a1a2e; padding: 30px; text-align: center;">
                <h1 style="color: #4ade80; margin: 0; font-size: 28px; font-weight: bold;">ApniSec</h1>
                <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">Profile Update Notification</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">Hello, ${firstName}!</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Your profile has been updated successfully. If you did not make this change, please contact our support team immediately.
                </p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile" 
                   style="display: inline-block; background-color: #4ade80; color: #1a1a2e; text-decoration: none; padding: 14px 28px; border-radius: 0; font-weight: bold; font-size: 16px; border: 3px solid #1a1a2e; box-shadow: 4px 4px 0 #1a1a2e;">
                  View Profile
                </a>
              </td>
            </tr>
            <tr>
              <td style="background-color: #1a1a2e; padding: 20px 30px; text-align: center;">
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                  © 2025 ApniSec. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(firstName: string, resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - ApniSec</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
          <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <tr>
              <td style="background-color: #1a1a2e; padding: 30px; text-align: center;">
                <h1 style="color: #4ade80; margin: 0; font-size: 28px; font-weight: bold;">ApniSec</h1>
                <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">Password Reset Request</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">Hello, ${firstName}!</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  We received a request to reset your password. Click the button below to create a new password:
                </p>
                <a href="${resetLink}" 
                   style="display: inline-block; background-color: #4ade80; color: #1a1a2e; text-decoration: none; padding: 14px 28px; border-radius: 0; font-weight: bold; font-size: 16px; border: 3px solid #1a1a2e; box-shadow: 4px 4px 0 #1a1a2e;">
                  Reset Password
                </a>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                  This link will expire in 1 hour. If you did not request a password reset, please ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #1a1a2e; padding: 20px 30px; text-align: center;">
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                  © 2025 ApniSec. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private getVerificationEmailTemplate(firstName: string, verificationLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - ApniSec</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
          <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <tr>
              <td style="background-color: #1a1a2e; padding: 30px; text-align: center;">
                <h1 style="color: #4ade80; margin: 0; font-size: 28px; font-weight: bold;">ApniSec</h1>
                <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">Email Verification</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px; text-align: center;">
                <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email Address</h2>
                <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                  Hello ${firstName},<br><br>
                  Please click the button below to verify your email address and complete your registration.
                </p>
                <a href="${verificationLink}" 
                   style="display: inline-block; background-color: #4ade80; color: #1a1a2e; text-decoration: none; padding: 14px 28px; border-radius: 0; font-weight: bold; font-size: 16px; border: 3px solid #1a1a2e; box-shadow: 4px 4px 0 #1a1a2e;">
                  Verify Email
                </a>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                  This link will expire in 24 hours. If you did not create an account, please ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #1a1a2e; padding: 20px 30px; text-align: center;">
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                  © 2025 ApniSec. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private getContactFormEmailTemplate(name: string, email: string, message: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
          <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <tr>
              <td style="background-color: #1a1a2e; padding: 30px; text-align: center;">
                <h1 style="color: #4ade80; margin: 0; font-size: 28px; font-weight: bold;">ApniSec</h1>
                <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">New Contact Form Submission</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">New Message Received</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; font-weight: bold; color: #1a1a2e;">Name</td>
                    <td style="padding: 12px; background-color: #ffffff; border: 1px solid #e2e8f0; color: #475569;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; font-weight: bold; color: #1a1a2e;">Email</td>
                    <td style="padding: 12px; background-color: #ffffff; border: 1px solid #e2e8f0; color: #475569;"><a href="mailto:${email}" style="color: #4ade80;">${email}</a></td>
                  </tr>
                </table>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; margin-bottom: 20px;">
                  <p style="color: #1a1a2e; font-weight: bold; margin: 0 0 10px 0;">Message:</p>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
                </div>
                <a href="mailto:${email}" 
                   style="display: inline-block; background-color: #4ade80; color: #1a1a2e; text-decoration: none; padding: 14px 28px; border-radius: 0; font-weight: bold; font-size: 16px; border: 3px solid #1a1a2e; box-shadow: 4px 4px 0 #1a1a2e;">
                  Reply to ${name}
                </a>
              </td>
            </tr>
            <tr>
              <td style="background-color: #1a1a2e; padding: 20px 30px; text-align: center;">
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                  © 2025 ApniSec. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }
}

/**
 * EmailServiceFactory - Factory for creating EmailService instances
 * Uses singleton pattern with lazy initialization
 */
export class EmailServiceFactory {
  private static instance: EmailService | null = null;

  /**
   * Get the singleton EmailService instance
   * Creates the instance lazily on first access
   */
  public static getInstance(): EmailService {
    if (!this.instance) {
      this.instance = new EmailService();
    }
    return this.instance;
  }
}
