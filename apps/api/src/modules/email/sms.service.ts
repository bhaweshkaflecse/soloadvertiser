import { Injectable, Logger } from '@nestjs/common';

/**
 * SMS sending service via HTTP API.
 * Placeholder implementation for Sparrow SMS / Aakash SMS Nepal.
 *
 * Configure via environment variables:
 * - SMS_API_URL: The SMS gateway endpoint
 * - SMS_API_TOKEN: API authentication token
 * - SMS_SENDER_ID: Registered sender identity
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  private readonly apiUrl: string;
  private readonly apiToken: string;
  private readonly senderId: string;

  constructor() {
    this.apiUrl = process.env.SMS_API_URL || 'https://api.sparrowsms.com/v2/sms';
    this.apiToken = process.env.SMS_API_TOKEN || '';
    this.senderId = process.env.SMS_SENDER_ID || 'SoloAd';
  }

  /**
   * Send an SMS message to a phone number.
   * Uses the configured HTTP SMS gateway (Sparrow SMS / Aakash SMS).
   */
  async sendSms(phone: string, message: string): Promise<{ success: boolean }> {
    try {
      if (!this.apiToken) {
        this.logger.warn(
          `[SMS] No SMS_API_TOKEN configured. Skipping SMS to ${phone}: "${message}"`,
        );
        return { success: false };
      }

      const payload = {
        token: this.apiToken,
        from: this.senderId,
        to: this.normalizePhone(phone),
        text: message,
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(
          `[SMS] Failed to send SMS to ${phone}: HTTP ${response.status} — ${errorBody}`,
        );
        return { success: false };
      }

      const result = await response.json();
      this.logger.log(`[SMS] Sent to ${phone}: messageId=${result.message_id || 'N/A'}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`[SMS] Error sending to ${phone}: ${error.message}`, error.stack);
      return { success: false };
    }
  }

  /**
   * Send OTP via SMS.
   */
  async sendOtp(phone: string, otp: string): Promise<{ success: boolean }> {
    const message = `Your Solo Advertiser code is: ${otp}. Valid for 5 minutes.`;
    return this.sendSms(phone, message);
  }

  /**
   * Normalize Nepal phone numbers to include country code.
   */
  private normalizePhone(phone: string): string {
    // Remove any spaces or dashes
    const cleaned = phone.replace(/[\s-]/g, '');

    // If already has country code
    if (cleaned.startsWith('+977')) return cleaned;
    if (cleaned.startsWith('977')) return `+${cleaned}`;

    // Assume Nepal number
    if (cleaned.startsWith('9') && cleaned.length === 10) {
      return `+977${cleaned}`;
    }

    return cleaned;
  }
}
