import prisma from "../config/database.js";
import jwtService from "../utils/jwt.js";
import responseHandler from "../utils/response.js";

export const verifyToken = async (req, res, next) => {
    try {
        let token = req.cookies?.accessToken;

        if (!token && req.headers.authorization) {
            token = req.headers.authorization.replace('Bearer ', '');
        }

        if (!token) {
            return responseHandler.unauthorized(res, 'Authentication required');
        }

        let decoded;
        try {
            decoded = jwtService.verifyAccessToken(token);
        } catch (error) {
            if (error.message === 'ACCESS_TOKEN_EXPIRED') {
                return responseHandler.unauthorized(res, 'Access token expired');
            }
            return responseHandler.unauthorized(res, 'Invalid access token');
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user) {
            return responseHandler.unauthorized(res, 'User not found');
        }

        if (!user.isActive) {
            return responseHandler.unauthorized(res, 'Account is disabled');
        }

        // Update session last activity
        await prisma.session.updateMany({
            where: {
                userId: user.id,
                token: token,
                isActive: true,
            },
            data: {
                lastActivity: new Date(),
            },
        });

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return responseHandler.serverError(res);
    }
};

export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                return responseHandler.unauthorized(res, 'User not authenticated');
            }

            const hasRole = allowedRoles.some(role =>
                role.toUpperCase() === user.role
            );

            if (!hasRole) {
                return responseHandler.forbidden(res, 'Insufficient permissions');
            }

            next();
        } catch (error) {
            console.error('Authorization error:', error);
            return responseHandler.serverError(res);
        }
    };
};

export const isAdmin = authorize('ADMIN');
export const isDoctorOrAdmin = authorize('DOCTOR', 'ADMIN');