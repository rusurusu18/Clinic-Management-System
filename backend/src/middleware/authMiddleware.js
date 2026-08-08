import { STATUS_CODES } from "../constants/statusCodes.js";
import { MESSAGES } from "../constants/message.js";
import { errorResponse } from "../utils/response.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { prisma } from "../config/database.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return errorResponse(
        res,
        MESSAGES.ACCESS_TOKEN_REQUIRED,
        null,
        STATUS_CODES.UNAUTHORIZED
      );
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return errorResponse(
        res,
        MESSAGES.INVALID_ACCESS_TOKEN,
        null,
        STATUS_CODES.UNAUTHORIZED
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return errorResponse(
        res,
        MESSAGES.USER_NOT_FOUND,
        null,
        STATUS_CODES.UNAUTHORIZED
      );
    }

    if (!user.isActive) {
      return errorResponse(
        res,
        MESSAGES.USER_INACTIVE,
        null,
        STATUS_CODES.FORBIDDEN
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(
      res,
      error.message || MESSAGES.INTERNAL_SERVER_ERROR,
      null,
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};