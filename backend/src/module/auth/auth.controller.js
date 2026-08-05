import { ZodError } from "zod";
import { registerUser } from "./auth.service.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { registerSchema } from "./auth.schema.js";
import { MESSAGES } from "../../constants/message.js";
import { STATUS_CODES } from "../../constants/statusCodes.js";
import { setRefreshTokenCookie } from "../../utils/cookie.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";


export const register = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await registerUser(data);

    setRefreshTokenCookie(res, result.refreshToken);

    return successResponse(res, MESSAGES.REGISTER_SUCCESS,
      {
        accessToken: result.accessToken,
        user:result.user
      },
      STATUS_CODES.CREATED
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, MESSAGES.VALIDATION_FAILED,
      BAD_REQUEST);
    }
    return errorResponse(res, error.message, STATUS_CODES.BAD_REQUEST);
  }
};
