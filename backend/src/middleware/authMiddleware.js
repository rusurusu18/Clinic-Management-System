import { errorResponse } from '../utils/response.js';
import { STATUS_CODES } from '../constants/statusCodes.js';
import { verifyACCESSTOKEN } from '../utils/jwt.js';
import { MESSAGES } from '../constants/message.js';
import { ROLE_PERMISSIONS, ROLE_HIERARCHY, ROLES } from '../constants/role.js';
import prisma from '../config/database.js';


// AUTHENTICATION MIDDLEWARE

export const authenticate = async (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Check Authorization header
    if (!authHeader) {
      return errorResponse(
        res,
        new Error(MESSAGES.TOKEN_REQUIRED),
        STATUS_CODES.UNAUTHORIZED
      );
    }

    // Expected format:
    // Authorization: Bearer <token>

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return errorResponse(
        res,
        new Error(MESSAGES.TOKEN_REQUIRED),
        STATUS_CODES.UNAUTHORIZED
      );
    }

    // Verify access token
    const decoded = verifyACCESSTOKEN(token);

    if (!decoded || !decoded.id) {
      return errorResponse(
        res,
        new Error(MESSAGES.INVALID_TOKEN),
        STATUS_CODES.UNAUTHORIZED
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    // User does not exist
    if (!user) {
      return errorResponse(
        res,
        new Error(MESSAGES.USER_NOT_FOUND),
        STATUS_CODES.UNAUTHORIZED
      );
    }

    // User account disabled
    if (!user.isActive) {
      return errorResponse(
        res,
        new Error(MESSAGES.ACCOUNT_DEACTIVATED),
        STATUS_CODES.FORBIDDEN
      );
    }

    // Attach user to request
    req.user = user;

    return next();
  } catch (error) {
    console.error("Authentication error:", error);

    return errorResponse(
      res,
      new Error(MESSAGES.INVALID_TOKEN),
      STATUS_CODES.UNAUTHORIZED
    );
  }
};


// PERMISSION AUTHORIZATION


export const authorize = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      // authenticate middleware must run before authorize
      if (!req.user) {
        return errorResponse(
          res,
          new Error('User not authenticated'),
          STATUS_CODES.UNAUTHORIZED
        );
      }

      const user = req.user;

      // Check active status
      if (!user.isActive) {
        return errorResponse(
          res,
          new Error('Access denied'),
          STATUS_CODES.FORBIDDEN
        );
      }

      // ADMIN has all permissions
      if (user.role === ROLES.ADMIN) {
        return next();
      }

      // Get permissions for user's role
      const userPermissions = ROLE_PERMISSIONS[user.role] || [];

      // Check whether user has all required permissions
      const hasAllPermissions = requiredPermissions.every(
        (permission) => userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return errorResponse(
          res,
          new Error('Insufficient permissions'),
          STATUS_CODES.FORBIDDEN
        );
      }

      return next();
    } catch (error) {
      console.error("Authorization error:", error);

      return errorResponse(
        res,
        new Error('Authorization failed'),
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  };
};


// ROLE AUTHORIZATION


export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // authenticate middleware must run first
      if (!req.user) {
        return errorResponse(
          res,
          new Error('User not authenticated'),
          STATUS_CODES.UNAUTHORIZED
        );
      }

      const user = req.user;

      // Check active status
      if (!user.isActive) {
        return errorResponse(
          res,
          new Error('Access denied'),
          STATUS_CODES.FORBIDDEN
        );
      }

      // ADMIN bypasses role restriction
      if (user.role === ROLES.ADMIN) {
        return next();
      }

      // Check allowed roles
      if (!allowedRoles.includes(user.role)) {
        return errorResponse(
          res,
          new Error('Insufficient role permissions'),
          STATUS_CODES.FORBIDDEN
        );
      }

      return next();
    } catch (error) {
      console.error("Role authorization error:", error);

      return errorResponse(
        res,
        new Error('Authorization failed'),
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  };
};



// ROLE HIERARCHY AUTHORIZATION


export const requireRoleLevel = (minRole) => {
  return async (req, res, next) => {
    try {
      // authenticate middleware must run first
      if (!req.user) {
        return errorResponse(
          res,
          new Error('User not authenticated'),
          STATUS_CODES.UNAUTHORIZED
        );
      }

      const user = req.user;

      // Check active status
      if (!user.isActive) {
        return errorResponse(
          res,
          new Error('Access denied'),
          STATUS_CODES.FORBIDDEN
        );
      }

      // ADMIN has highest access
      if (user.role === ROLES.ADMIN) {
        return next();
      }

      // Get role levels
      const userRoleLevel = ROLE_HIERARCHY[user.role] || 0;
      const requiredRoleLevel = ROLE_HIERARCHY[minRole] || 0;

      // Invalid requested role
      if (!ROLE_HIERARCHY[minRole]) {
        return errorResponse(
          res,
          new Error('Invalid required role'),
          STATUS_CODES.INTERNAL_SERVER_ERROR
        );
      }

      // Check hierarchy
      if (userRoleLevel < requiredRoleLevel) {
        return errorResponse(
          res,
          new Error('Insufficient role level'),
          STATUS_CODES.FORBIDDEN
        );
      }

      return next();
    } catch (error) {
      console.error("Role level authorization error:", error);

      return errorResponse(
        res,
        new Error('Authorization failed'),
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  };
};