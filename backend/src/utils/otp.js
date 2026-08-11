import crypto from 'crypto';
import prisma from "../config/database.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.js";

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_MINUTES = 2;

// Generate OTP
const generateOtp = (length = 6) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return crypto.randomInt(min, max + 1).toString();
};

// Generate OTP expiry
const generateOtpExpiry = (minutes = OTP_EXPIRY_MINUTES) => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    return date;
};

// Check if OTP is expired
const isOtpExpired = (expiryDate) => {
    return new Date() > new Date(expiryDate);
};

// Send OTP
export const sendOtp = async (email, type = "EMAIL_VERIFICATION", userId = null) => {
    try {
        // Check existing OTP and cooldown
        const existingOTP = await prisma.oTP.findFirst({
            where: {
                email,
                type,
                isUsed: false,
                expiresAt: {
                    gt: new Date()
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (existingOTP) {
            const cooldownMs = OTP_RESEND_COOLDOWN_MINUTES * 60 * 1000;
            const timeSinceLastOTP = Date.now() - new Date(existingOTP.createdAt).getTime();

            if (timeSinceLastOTP < cooldownMs) {
                const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastOTP) / 1000);
                throw new Error(`Please wait ${remainingSeconds} seconds before requesting another OTP`);
            }

            await prisma.oTP.update({
                where: { id: existingOTP.id },
                data: { isUsed: true }
            });
        }

        const otp = generateOtp();
        const expiresAt = generateOtpExpiry(OTP_EXPIRY_MINUTES);

        await prisma.oTP.create({
            data: {
                email,
                otp,
                expiresAt,
                type,
                userId: userId || undefined,
                isUsed: false
            }
        });

        return otp;
    } catch (error) {
        console.error('Send OTP Error:', error);
        throw error;
    }
};

// Verify OTP
export const verifyOtp = async (email, otp, type = "EMAIL_VERIFICATION") => {
    try {
        const otpRecord = await prisma.oTP.findFirst({
            where: {
                email,
                otp,
                type,
                isUsed: false
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!otpRecord) {
            throw new Error('Invalid OTP');
        }

        if (isOtpExpired(otpRecord.expiresAt)) {
            await prisma.oTP.update({
                where: { id: otpRecord.id },
                data: { isUsed: true }
            });
            throw new Error('OTP has expired');
        }

        await prisma.oTP.update({
            where: { id: otpRecord.id },
            data: { isUsed: true }
        });

        return {
            success: true,
            message: 'OTP verified successfully',
            userId: otpRecord.userId,
            email: otpRecord.email
        };
    } catch (error) {
        console.error('Verify OTP Error:', error);
        throw error;
    }
};

// Resend OTP
export const resendOtp = async (email, type = "EMAIL_VERIFICATION", userId = null) => {
    try {
        const existingOTP = await prisma.oTP.findFirst({
            where: {
                email,
                type,
                isUsed: false,
                expiresAt: {
                    gt: new Date()
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (existingOTP) {
            const cooldownMs = OTP_RESEND_COOLDOWN_MINUTES * 60 * 1000;
            const timeSinceLastOTP = Date.now() - new Date(existingOTP.createdAt).getTime();

            if (timeSinceLastOTP < cooldownMs) {
                const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastOTP) / 1000);
                throw new Error(`Please wait ${remainingSeconds} seconds before requesting another OTP`);
            }

            await prisma.oTP.update({
                where: { id: existingOTP.id },
                data: { isUsed: true }
            });
        }

        const otp = generateOtp();
        const expiresAt = generateOtpExpiry(OTP_EXPIRY_MINUTES);

        await prisma.oTP.create({
            data: {
                email,
                otp,
                expiresAt,
                type,
                userId: userId || undefined,
                isUsed: false
            }
        });

        return otp;
    } catch (error) {
        console.error('Resend OTP Error:', error);
        throw error;
    }
};

export {
    generateOtp,
    generateOtpExpiry,
    isOtpExpired
};