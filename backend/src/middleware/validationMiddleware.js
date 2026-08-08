import { ZodError } from "zod";
import { STATUS_CODES } from "../constants/statusCodes.js";
import { MESSAGES } from "../constants/message.js";
import { errorResponse } from "../utils/response.js";

export const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        res,
        MESSAGES.VALIDATION_FAILED,
        error.flatten(),
        STATUS_CODES.BAD_REQUEST
      );
    }

    return errorResponse(
      res,
      error.message || MESSAGES.VALIDATION_FAILED,
      null,
      STATUS_CODES.BAD_REQUEST
    );
  }
};
