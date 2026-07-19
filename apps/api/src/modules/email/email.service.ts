import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SmsService } from './sms.service';
import { getOtpTemplate } from './templates/otp.template';
import { getVerificationTemplate } from './templates/verification.template';
import { getWelcomeTemplate } from './templates/welcome.template';
import { getPasswordResetTemplate } from './templates/password-reset.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly smsService: SmsService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Send OTP via email or SMS depending on the target.
   */
  async sendOtp(target: string, otp: string): Promise<{ success: boolean }> {
    const isEmail = target.includes('@');

    if (isEmail) {
      const { subject, html } = getOtpTemplate(otp);
      return this.sendMail(target, subject, html);
    }

    // SMS path
    const message = `Your Solo Advertiser verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;
    return this.smsService.sendSms(target, message);
  }

  /**
   * Send email verification link.
   */
  async sendVerificationEmail(
    email: string,
    token: string,
  ): Promise<{ success: boolean }> {
    const { subject, html } = getVerificationTemplate(token);
    return this.sendMail(email, subject, html);
  }

  /**
   * Send a generic notification email.
   */
  async sendNotification(
    to: string,
    subject: string,
    body: string,
  ): Promise<{ success: boolean }> {
    return this.sendMail(to, subject, body);
  }

  /**
   * Send password reset email.
   */
  async sendPasswordReset(
    email: string,
    token: string,
  ): Promise<{ success: boolean }> {
    const { subject, html } = getPasswordResetTemplate(token);
    return this.sendMail(email, subject, html);
  }

  /**
   * Send welcome email to a newly registered user.
   */
  async sendWelcome(email: string, name: string): Promise<{ success: boolean }> {
    const { subject, html } = getWelcomeTemplate(name);
    return this.sendMail(email, subject, html);
  }

  /**
   * Internal method to send email via SMTP.
   */
  private async sendMail(
    to: string,
    subject: string,
    html: string,
  ): Promise<{ success: boolean }> {
    try {
      const from = process.env.SMTP_FROM || 'Solo Advertiser <noreply@soloadvertiser.com>';

      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent to ${to}: "${subject}"`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`, error.stack);
      return { success: false };
    }
  }
}
