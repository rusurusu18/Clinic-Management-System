import crypto from "crypto";
import prisma from "../config/database.js";

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_MINUTES = 2;
const OTP_MAX_ATTEMPTS = 5;

// ==================== GENERATE OTP ====================

const generateOtp = (length = 6) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;

    return crypto.randomInt(min, max + 1).toString();
};

// ==================== GENERATE OTP EXPIRY ====================

const generateOtpExpiry = (minutes = OTP_EXPIRY_MINUTES) => {
    const date = new Date();

    date.setMinutes(date.getMinutes() + minutes);

    return date;
};

// ==================== CHECK OTP EXPIRY ====================

const isOtpExpired = (expiryDate) => {
    return new Date() > new Date(expiryDate);
};

// ==================== FIND USER ====================

const findUserByEmail = async (email) => {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
        select: {
            id: true,
            email: true,
            fullName: true,
        },
    });

    return user;
};

// ==================== SEND OTP ====================

export const sendOtp = async (
    email,
    type = "EMAIL_VERIFICATION",
    userId = null
) => {
    try {
        // If userId wasn't supplied, find it using email
        if (!userId) {
            const user = await findUserByEmail(email);

            if (!user) {
                throw new Error("User not found");
            }

            userId = user.id;
        }

        // Check latest active OTP
        const existingOTP = await prisma.oTP.findFirst({
            where: {
                userId,
                type,
                verified: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Enforce resend cooldown
        if (existingOTP) {
            const cooldownMs =
                OTP_RESEND_COOLDOWN_MINUTES * 60 * 1000;

            const timeSinceLastOTP =
                Date.now() -
                new Date(existingOTP.createdAt).getTime();

            if (timeSinceLastOTP < cooldownMs) {
                const remainingSeconds = Math.ceil(
                    (cooldownMs - timeSinceLastOTP) / 1000
                );

                throw new Error(
                    `Please wait ${remainingSeconds} seconds before requesting another OTP`
                );
            }

            // Invalidate old OTP
            await prisma.oTP.update({
                where: {
                    id: existingOTP.id,
                },
                data: {
                    verified: true,
                },
            });
        }

        // Generate new OTP
        const otp = generateOtp();

        const expiresAt = generateOtpExpiry(
            OTP_EXPIRY_MINUTES
        );

        // Save OTP
        await prisma.oTP.create({
            data: {
                code: otp,
                type,
                expiresAt,
                verified: false,
                attempts: 0,
                userId,
            },
        });

        return otp;
    } catch (error) {
        console.error("Send OTP Error:", error);

        throw error;
    }
};

// ==================== VERIFY OTP ====================

export const verifyOtp = async (
    email,
    otp,
    type = "EMAIL_VERIFICATION"
) => {
    try {
        // Find user from email
        const user = await findUserByEmail(email);

        if (!user) {
            return {
                success: false,
                message: "User not found",
            };
        }

        // Find latest valid OTP
        const otpRecord = await prisma.oTP.findFirst({
            where: {
                userId: user.id,
                type,
                verified: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        if (!otpRecord) {
            return {
                success: false,
                message: "Invalid or expired OTP",
            };
        }

        // Check attempts
        if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
            return {
                success: false,
                message: "Maximum OTP attempts exceeded",
            };
        }

        // Check OTP
        if (otpRecord.code !== otp) {
            await prisma.oTP.update({
                where: {
                    id: otpRecord.id,
                },
                data: {
                    attempts: {
                        increment: 1,
                    },
                },
            });

            return {
                success: false,
                message: "Invalid OTP",
            };
        }

        // Mark OTP as verified
        await prisma.oTP.update({
            where: {
                id: otpRecord.id,
            },
            data: {
                verified: true,
            },
        });

        return {
            success: true,
            message: "OTP verified successfully",
            userId: user.id,
            email: user.email,
        };
    } catch (error) {
        console.error("Verify OTP Error:", error);

        throw error;
    }
};

// ==================== RESEND OTP ====================

export const resendOtp = async (
    email,
    type = "EMAIL_VERIFICATION",
    userId = null
) => {
    try {
        // Find user if userId wasn't provided
        if (!userId) {
            const user = await findUserByEmail(email);

            if (!user) {
                throw new Error("User not found");
            }

            userId = user.id;
        }

        // Find latest active OTP
        const existingOTP = await prisma.oTP.findFirst({
            where: {
                userId,
                type,
                verified: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Cooldown check
        if (existingOTP) {
            const cooldownMs =
                OTP_RESEND_COOLDOWN_MINUTES * 60 * 1000;

            const timeSinceLastOTP =
                Date.now() -
                new Date(existingOTP.createdAt).getTime();

            if (timeSinceLastOTP < cooldownMs) {
                const remainingSeconds = Math.ceil(
                    (cooldownMs - timeSinceLastOTP) / 1000
                );

                throw new Error(
                    `Please wait ${remainingSeconds} seconds before requesting another OTP`
                );
            }

            // Invalidate old OTP
            await prisma.oTP.update({
                where: {
                    id: existingOTP.id,
                },
                data: {
                    verified: true,
                },
            });
        }

        // Generate new OTP
        const otp = generateOtp();

        const expiresAt = generateOtpExpiry(
            OTP_EXPIRY_MINUTES
        );

        // Save new OTP
        await prisma.oTP.create({
            data: {
                code: otp,
                type,
                expiresAt,
                verified: false,
                attempts: 0,
                userId,
            },
        });

        return otp;
    } catch (error) {
        console.error("Resend OTP Error:", error);

        throw error;
    }
};

// ==================== EXPORT HELPERS ====================

export {
    generateOtp,
    generateOtpExpiry,
    isOtpExpired,
};