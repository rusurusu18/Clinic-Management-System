import { ZodError } from "zod";
import { STATUS_CODES } from "../constants/statusCodes.js";
import { MESSAGES } from "../constants/message.js";
import { errorResponse } from "../utils/response.js";

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return errorResponse(
          res,
          MESSAGES.VALIDATION_ERROR,
          STATUS_CODES.BAD_REQUEST,
          error.errors.map((err) => err.message)
        );
      }
      return errorResponse(res, error.message, STATUS_CODES.BAD_REQUEST);
    }
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return errorResponse(
          res,
          MESSAGES.VALIDATION_ERROR,
          STATUS_CODES.BAD_REQUEST,
          error.errors.map((err) => err.message)
        );
      }
      return errorResponse(res, error.message, STATUS_CODES.BAD_REQUEST);
    }
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return errorResponse(
          res,
          MESSAGES.VALIDATION_ERROR,
          STATUS_CODES.BAD_REQUEST,
          error.errors.map((err) => err.message)
        );
      }
      return errorResponse(res, error.message, STATUS_CODES.BAD_REQUEST);
    }
  };
};