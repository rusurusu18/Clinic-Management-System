import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

// Create email transporter
export const createTransporter = () => {
    return nodemailer.createTransport({
        host: ENV.EMAIL_HOST,
        port: ENV.EMAIL_PORT,
        secure: ENV.EMAIL_PORT === 465,
        auth: {
            user: ENV.EMAIL_USER,
            pass: ENV.EMAIL_PASSWORD,
        },
    });
};

// Send email function
export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: ENV.EMAIL_FROM,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email send error:', error);
        throw new Error('Failed to send email');
    }
};

// ==================== EMAIL TEMPLATES ====================

// Verification Email Template
export const getVerificationEmailTemplate = (name, otp) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { padding: 30px; background: #f9f9f9; }
                .otp-code { font-size: 36px; font-weight: bold; color: #4CAF50; text-align: center; padding: 20px; background: white; border-radius: 10px; margin: 20px 0; letter-spacing: 5px; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                .details { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Email Verification</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>Thank you for registering! Please use the following OTP to verify your email address:</p>
                    <div class="otp-code">${otp}</div>
                    <div class="details">
                        <p><strong>⏰ Expires in:</strong> ${ENV.OTP_EXPIRY_MINUTES || 10} minutes</p>
                        <p><strong>📧 Email:</strong> ${ENV.EMAIL_FROM}</p>
                    </div>
                    <p>If you didn't request this, please ignore this email.</p>
                    <div class="footer">
                        <p>This is an automated message, please do not reply.</p>
                        <p>&copy; ${new Date().getFullYear()} Healthcare System. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

// Password Reset Email Template
export const getPasswordResetEmailTemplate = (name, otp) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #f44336; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { padding: 30px; background: #f9f9f9; }
                .otp-code { font-size: 36px; font-weight: bold; color: #f44336; text-align: center; padding: 20px; background: white; border-radius: 10px; margin: 20px 0; letter-spacing: 5px; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                .details { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔑 Reset Your Password</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>We received a request to reset your password. Use the following OTP to proceed:</p>
                    <div class="otp-code">${otp}</div>
                    <div class="details">
                        <p><strong>⏰ Expires in:</strong> ${ENV.OTP_EXPIRY_MINUTES || 10} minutes</p>
                        <p><strong>🔒 Security Tip:</strong> Never share this OTP with anyone</p>
                    </div>
                    <div class="warning">
                        <p><strong>⚠️ Security Notice:</strong> If you didn't request this, please ignore this email and secure your account.</p>
                    </div>
                    <p>Best regards,<br><strong>Healthcare System Team</strong></p>
                    <div class="footer">
                        <p>This is an automated message, please do not reply.</p>
                        <p>&copy; ${new Date().getFullYear()} Healthcare System. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

// ==================== SEND EMAIL FUNCTIONS ====================

// Send Verification Email
export const sendVerificationEmail = async (email, otp, name) => {
    const subject = 'Verify Your Email Address';
    const html = getVerificationEmailTemplate(name, otp);
    return sendEmail({ to: email, subject, html });
};

// Send Password Reset Email
export const sendPasswordResetEmail = async (email, otp, name) => {
    const subject = 'Reset Your Password';
    const html = getPasswordResetEmailTemplate(name, otp);
    return sendEmail({ to: email, subject, html });
};

// Send Welcome Email
export const sendWelcomeEmail = async (email, name) => {
    const subject = 'Welcome to Healthcare System!';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { padding: 30px; background: #f9f9f9; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                .features { display: flex; justify-content: space-around; margin: 20px 0; }
                .feature { text-align: center; padding: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏥 Welcome to Healthcare System!</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name}!</h2>
                    <p>We're excited to have you on board! Your account has been successfully created.</p>
                    <div class="features">
                        <div class="feature">
                            <h3>👨‍⚕️</h3>
                            <p>Book Appointments</p>
                        </div>
                        <div class="feature">
                            <h3>📋</h3>
                            <p>Access Records</p>
                        </div>
                        <div class="feature">
                            <h3>💊</h3>
                            <p>Track Medications</p>
                        </div>
                    </div>
                    <p>If you have any questions, feel free to contact our support team.</p>
                    <p>Best regards,<br><strong>Healthcare System Team</strong></p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Healthcare System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    return sendEmail({ to: email, subject, html });
};

// // Send Notification Email
// export const sendNotificationEmail = async (email, name, title, message) => {
//     const subject = `Notification: ${title}`;
//     const html = `
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <style>
//                 body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//                 .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//                 .header { background: #9C27B0; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
//                 .content { padding: 30px; background: #f9f9f9; }
//                 .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
//             </style>
//         </head>
//         <body>
//             <div class="container">
//                 <div class="header">
//                     <h1>📢 ${title}</h1>
//                 </div>
//                 <div class="content">
//                     <p>Hello <strong>${name}</strong>,</p>
//                     <p>${message}</p>
//                     <p>Best regards,<br><strong>Healthcare System Team</strong></p>
//                 </div>
//                 <div class="footer">
//                     <p>&copy; ${new Date().getFullYear()} Healthcare System. All rights reserved.</p>
//                 </div>
//             </div>
//         </body>
//         </html>
//     `;
//     return sendEmail({ to: email, subject, html });
// };
