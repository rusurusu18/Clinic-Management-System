import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export const generateAccessToken = (payload) =>
  jwt.sign(payload, ENV.JWT_ACCESS_SECRET, { expiresIn: ENV.JWT_ACCESS_EXPIRES_IN });

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, ENV.JWT_REFRESH_SECRET, { expiresIn: ENV.JWT_REFRESH_EXPIRES_IN });

export const generateTokens = (payload) => ({
  accessToken: generateAccessToken(payload),
  refreshToken: generateRefreshToken(payload),
});

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ENV.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, ENV.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyACCESSTOKEN = verifyAccessToken;
export const verifyREFRESHTOKEN = verifyRefreshToken;