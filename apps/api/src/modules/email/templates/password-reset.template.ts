/**
 * Password reset email template for Solo Advertiser.
 */
export function getPasswordResetTemplate(token: string): { subject: string; html: string } {
  const baseUrl = process.env.APP_URL || 'https://soloadvertiser.com';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const subject = 'Reset your Solo Advertiser password';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f7;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">Solo Advertiser</h1>
    </div>
    <h2 style="color: #333; font-size: 20px; text-align: center; margin-bottom: 10px;">Password Reset</h2>
    <p style="color: #555; font-size: 14px; text-align: center; margin-bottom: 30px;">
      We received a request to reset your password. Click the button below to choose a new password.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="display: inline-block; background-color: #e74c3c; color: #ffffff; text-decoration: none; padding: 14px 36px; font-size: 16px; font-weight: 600; border-radius: 6px;">
        Reset Password
      </a>
    </div>
    <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">
      Or copy and paste this link into your browser:
    </p>
    <p style="color: #666; font-size: 11px; text-align: center; word-break: break-all;">
      ${resetUrl}
    </p>
    <div style="background: #fff5f5; border-left: 4px solid #e74c3c; padding: 12px 16px; margin: 24px 0; border-radius: 4px;">
      <p style="color: #c0392b; font-size: 12px; margin: 0;">
        <strong>Important:</strong> This link expires in 1 hour. If you did not request a password reset, please ignore this email or contact support immediately.
      </p>
    </div>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
    <p style="color: #aaa; font-size: 11px; text-align: center;">
      &copy; ${new Date().getFullYear()} Solo Advertiser. All rights reserved.
    </p>
  </div>
</body>
</html>
  `.trim();

  return { subject, html };
}
