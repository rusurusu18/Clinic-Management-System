import { ZodError } from 'zod';
import { errorResponse, successResponse } from '../../utils/response.js';
import { registerUser, loginUser } from './auth.service.js';
import { setRefreshTokenCookie } from '../../utils/cookie.js';
import { MESSAGES } from '../../constants/message.js';
import { STATUS_CODES } from '../../constants/statusCodes.js';

export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);

    setRefreshTokenCookie(res, result.refreshToken);

    return successResponse(
      res,
      {
        accessToken: result.accessToken,
        user: result.newUser,
      },
      MESSAGES.USER_REGISTERED,
      STATUS_CODES.CREATED
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        res,
        MESSAGES.VALIDATION_ERROR,
        STATUS_CODES.BAD_REQUEST,
        error.flatten()
      );
    }
    return errorResponse(res, error.message, STATUS_CODES.BAD_REQUEST);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    setRefreshTokenCookie(res, result.refreshToken);

    delete result.refreshToken;

    return successResponse(res, result, MESSAGES.LOGIN_SUCCESS, STATUS_CODES.OK);
  } catch (error) {
    return errorResponse(res, error.message, STATUS_CODES.BAD_REQUEST);
  }
};
