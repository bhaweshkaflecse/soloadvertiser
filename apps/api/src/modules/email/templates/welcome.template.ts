/**
 * Welcome email template for Solo Advertiser.
 */
export function getWelcomeTemplate(name: string): { subject: string; html: string } {
  const subject = 'Welcome to Solo Advertiser!';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f7;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">Solo Advertiser</h1>
    </div>
    <h2 style="color: #333; font-size: 20px; text-align: center; margin-bottom: 10px;">Welcome, ${name}!</h2>
    <p style="color: #555; font-size: 14px; text-align: center; margin-bottom: 20px;">
      Thank you for joining Solo Advertiser — Nepal's premier helmet advertising platform.
    </p>
    <div style="background: #f8f8fc; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #1a1a2e; font-size: 16px; margin: 0 0 12px 0;">What's Next?</h3>
      <ul style="color: #555; font-size: 13px; padding-left: 20px; line-height: 1.8;">
        <li>Complete your profile with required documents</li>
        <li>Get verified by our team (usually within 24-48 hours)</li>
        <li>Start earning with helmet advertisement campaigns</li>
      </ul>
    </div>
    <p style="color: #555; font-size: 14px; text-align: center; margin-top: 20px;">
      If you have any questions, our support team is here to help. Just reply to this email or contact us through the app.
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
    <p style="color: #aaa; font-size: 11px; text-align: center;">
      &copy; ${new Date().getFullYear()} Solo Advertiser. All rights reserved.<br/>
      Kathmandu, Nepal
    </p>
  </div>
</body>
</html>
  `.trim();

  return { subject, html };
}
