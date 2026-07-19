/**
 * OTP email/SMS template for Solo Advertiser.
 */
export function getOtpTemplate(otp: string): { subject: string; html: string } {
  const subject = `Your Solo Advertiser Verification Code: ${otp}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f7;">
  <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">Solo Advertiser</h1>
    </div>
    <h2 style="color: #333; font-size: 20px; text-align: center; margin-bottom: 10px;">Verification Code</h2>
    <p style="color: #555; font-size: 14px; text-align: center; margin-bottom: 30px;">
      Use the code below to verify your identity. This code is valid for <strong>5 minutes</strong>.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="display: inline-block; background: #f0f0f5; border: 2px dashed #1a1a2e; padding: 16px 32px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e; border-radius: 8px;">
        ${otp}
      </span>
    </div>
    <p style="color: #888; font-size: 12px; text-align: center; margin-top: 30px;">
      If you did not request this code, please ignore this email. Do not share this code with anyone.
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

/**
 * OTP SMS text template (plain text for SMS delivery).
 */
export function getOtpSmsText(otp: string): string {
  return `Your Solo Advertiser verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;
}
