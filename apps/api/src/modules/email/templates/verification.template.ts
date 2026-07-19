/**
 * Email verification template for Solo Advertiser.
 */
export function getVerificationTemplate(token: string): { subject: string; html: string } {
  const baseUrl = process.env.APP_URL || 'https://soloadvertiser.com';
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  const subject = 'Verify your Solo Advertiser email address';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f7;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">Solo Advertiser</h1>
    </div>
    <h2 style="color: #333; font-size: 20px; text-align: center; margin-bottom: 10px;">Verify Your Email</h2>
    <p style="color: #555; font-size: 14px; text-align: center; margin-bottom: 30px;">
      Thank you for registering with Solo Advertiser. Please verify your email address by clicking the button below.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" style="display: inline-block; background-color: #1a1a2e; color: #ffffff; text-decoration: none; padding: 14px 36px; font-size: 16px; font-weight: 600; border-radius: 6px;">
        Verify Email Address
      </a>
    </div>
    <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">
      Or copy and paste this link into your browser:
    </p>
    <p style="color: #666; font-size: 11px; text-align: center; word-break: break-all;">
      ${verificationUrl}
    </p>
    <p style="color: #888; font-size: 12px; text-align: center; margin-top: 30px;">
      This link expires in 24 hours. If you did not create an account, you can safely ignore this email.
    </p>
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
