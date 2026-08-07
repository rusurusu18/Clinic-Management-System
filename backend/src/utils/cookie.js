import {env} from "../../config/env.js";
import { REFRESH_TOKEN_COOKIE_NAME,COOKIE_OPTIONS } from "../config/constants.js"

export const setRefreshTokenCookie = (res, token) => {
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
    })
}

//clear cookie 
export const clearRefreshTokenCookie = (res) => {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, COOKIE_OPTIONS)
}

//get rerfesh token from the cookies 
export const getRefreshTokenFromCookie=(req)=>{
    return req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] || null
}