import { STATUS_CODES } from "../constants/statusCodes.js";
import { MESSAGES } from "../constants/message.js";
import { errorResponse } from "../utils/response.js";

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(
        res,
        MESSAGES.UNAUTHORIZED_ACCESS,
        null,
        STATUS_CODES.UNAUTHORIZED
      );
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return errorResponse(
        res,
        MESSAGES.FORBIDDEN_ACCESS,
        null,
        STATUS_CODES.FORBIDDEN
      );
    }

    next();
  };
};
