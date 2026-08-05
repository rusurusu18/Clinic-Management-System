import { STATUS_CODES } from "../constants/statusCodes.js"
import { BAD_REQUEST } from "../constants/statusCodes.js"
import { z } from "zod"
import { INTERNAL_SERVER_ERROR } from "../constants/statusCodes.js"

export const successResponse = (res, message, data =null, statusCode = STATUS_CODES.OK) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    })
}

export const errorResponse =(res, message, errors=null,statusCode = INTERNAL_SERVER_ERROR) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors
    })
}