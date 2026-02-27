import nodemailer from 'nodemailer';

const DEV_MODE = process.env.DEV_MODE === 'true' || process.env.NODE_ENV === 'development';
const APP_URL = process.env.APP_URL || 'http://localhost:3456';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

function getEmailConfig(): EmailConfig | null {
  if (DEV_MODE) {
    return null;
  }

  return {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || '',
    },
  };
}

async function sendEmail(to: string, subject: string, text: string, html: string) {
  if (DEV_MODE) {
    console.log('📧 [DEV MODE] Email not sent, logging to console:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Content:', text);
    return;
  }

  const config = getEmailConfig();
  if (!config || !config.host || !config.auth.user) {
    console.error('Email configuration missing. Set SMTP environment variables.');
    throw new Error('Email service not configured');
  }

  const transporter = nodemailer.createTransport(config);

  try {
    await transporter.sendMail({
      from: config.auth.user,
      to,
      subject,
      text,
      html,
    });
    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendRegistrationCode(email: string, fullName: string, code: string) {
  const subject = 'Welcome to Multi-Lingua - Verify Your Account';
  const text = `
Hello ${fullName},

Welcome to Multi-Lingua! Your verification code is:

${code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
Multi-Lingua Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Welcome to Multi-Lingua!</h2>
    <p>Hello ${fullName},</p>
    <p>Thank you for registering. Your verification code is:</p>
    <div class="code">${code}</div>
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't request this code, please ignore this email.</p>
    <div class="footer">
      <p>Best regards,<br>Multi-Lingua Team</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  await sendEmail(email, subject, text, html);
}

export async function sendLoginCode(email: string, fullName: string, code: string) {
  const subject = 'Multi-Lingua Login Code';
  const text = `
Hello ${fullName},

Your login code is:

${code}

This code will expire in 10 minutes.

If you didn't request this code, please secure your account immediately.

Best regards,
Multi-Lingua Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px; margin: 20px 0; }
    .warning { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Multi-Lingua Login Code</h2>
    <p>Hello ${fullName},</p>
    <p>Your login code is:</p>
    <div class="code">${code}</div>
    <p>This code will expire in 10 minutes.</p>
    <div class="warning">
      <strong>⚠️ Security Notice:</strong> If you didn't request this code, someone may be trying to access your account. Please contact support immediately.
    </div>
    <div class="footer">
      <p>Best regards,<br>Multi-Lingua Team</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  await sendEmail(email, subject, text, html);
}

export async function sendWelcomeEmail(email: string, fullName: string) {
  const subject = 'Welcome to Multi-Lingua!';
  const text = `
Hello ${fullName},

Welcome to Multi-Lingua! Your account has been successfully created.

You can now log in and start using our translation services.

Visit: ${APP_URL}

Best regards,
Multi-Lingua Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Welcome to Multi-Lingua!</h2>
    <p>Hello ${fullName},</p>
    <p>Your account has been successfully created. You can now log in and start using our translation services.</p>
    <a href="${APP_URL}/login" class="button">Go to Login</a>
    <div class="footer">
      <p>Best regards,<br>Multi-Lingua Team</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  await sendEmail(email, subject, text, html);
}
