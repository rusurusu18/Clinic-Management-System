import { ZodError } from "zod";
import { registerUser } from "./auth.service.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { registerSchema } from "./auth.schema.js";

export const register = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await registerUser(data);

    return successResponse(res, "User registered successfully", user, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, "Validation Error", 400);
    }
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
};
