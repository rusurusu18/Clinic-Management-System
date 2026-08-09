import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: ENV.EMAIL_HOST,
  port: ENV.EMAIL_PORT,
  secure: ENV.EMAIL_SECURE,
  auth: {
    user: ENV.EMAIL_USER,
    pass: ENV.EMAIL_PASSWORD,
  },
});

export const sendEmail = async (to, subject, html, text = '') => {
  try {
    const emailOptions = {
      from: `"Clinic Management System" <${ENV.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text,
    };

    return await transporter.sendMail(emailOptions);
  } catch (error) {
    console.log('email sending error:', error);
    throw error;
  }
};

export const vsendVerificationOtp = async (email, otp, name = 'USER') => {
  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #eaf4ff, #f5f7fb);
        font-family: Arial, Helvetica, sans-serif;
        color: #1f2937;
      }
      .container {
        max-width: 620px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 18px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #1d4ed8, #2563eb);
        color: #ffffff;
        padding: 28px 32px;
        text-align: center;
      }
      .header h2 {
        margin: 0;
        font-size: 28px;
        letter-spacing: 0.5px;
      }
      .content {
        padding: 32px;
      }
      .content p {
        font-size: 16px;
        line-height: 1.7;
        margin: 0 0 18px;
      }
      .otp-box {
        display: inline-block;
        margin: 18px 0 20px;
        padding: 18px 26px;
        border-radius: 12px;
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        color: #1e3a8a;
        font-weight: bold;
        letter-spacing: 5px;
        font-size: 30px;
        text-align: center;
      }
      .footer {
        padding: 0 32px 28px;
        color: #6b7280;
        font-size: 14px;
      }
      .badge {
        display: inline-block;
        margin-bottom: 12px;
        color: #2563eb;
        background: #dbeafe;
        border-radius: 999px;
        padding: 6px 12px;
        font-weight: bold;
        font-size: 12px;
        text-transform: uppercase;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Email Verification</h2>
      </div>
      <div class="content">
        <div class="badge">Clinic Management System</div>
        <p>Hello ${name},</p>
        <p>Thank you for registering with CMS. Please use the OTP below to verify your email address and activate your account.</p>
        <div class="otp-box">${otp}</div>
        <p>This code will expire in 10 minutes. If you did not create this account, you can safely ignore this message.</p>
      </div>
      <div class="footer">
        Need help? Contact our support team.
      </div>
    </div>
  </body>
  </html>`;

  return await sendEmail(email, 'Verify your email - CMS', html);
};

export const sendPasswordOTPEmail = async (email, otp, name = 'User') => {
  const recipient = ENV.EMAIL_USER;
  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #f3f6fb;
        font-family: Arial, Helvetica, sans-serif;
        color: #1f2937;
      }
      .container {
        max-width: 620px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 18px;
        border: 1px solid #e5e7eb;
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #111827, #374151);
        padding: 30px 32px;
        text-align: center;
        color: #ffffff;
      }
      .header h2 {
        margin: 0;
        font-size: 28px;
      }
      .content {
        padding: 32px;
      }
      .content p {
        font-size: 16px;
        line-height: 1.7;
        margin: 0 0 18px;
      }
      .otp-box {
        display: block;
        width: fit-content;
        margin: 18px auto 20px;
        background: #fef3c7;
        color: #92400e;
        border: 1px solid #fcd34d;
        padding: 18px 26px;
        border-radius: 12px;
        font-size: 30px;
        font-weight: 700;
        letter-spacing: 5px;
      }
      .button-row {
        text-align: center;
        margin: 24px 0;
      }
      .button {
        display: inline-block;
        background: #dc2626;
        color: #ffffff;
        padding: 14px 28px;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 700;
      }
      .footer {
        padding: 0 32px 30px;
        color: #6b7280;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Password Reset</h2>
      </div>
      <div class="content">
        <p>Hello ${name},</p>
        <p>We received a request to reset your password for the Clinic Management System account. Use the OTP below to continue with the reset.</p>
        <div class="otp-box">${otp}</div>
        <div class="button-row">
          <a class="button" href="${ENV.RESET_PASSWORD_URL}">Reset Password</a>
        </div>
        <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this message and keep your account secure.</p>
      </div>
      <div class="footer">
        For security reasons, do not share this code with anyone.
      </div>
    </div>
  </body>
  </html>`;

  return await sendEmail(recipient, 'Password reset OTP - CMS', html);
};