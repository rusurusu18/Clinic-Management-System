import { prisma } from '../../config/database.js';
import { hashPassword, comparePassword } from '../../utils/hash.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.js';
import { MESSAGES } from '../../constants/message.js';

export const registerUser = async (userData) => {
  const { fullName, email, phoneNumber, password, role } = userData;

  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw new Error(MESSAGES.USER_EXISTS || 'User with this email already exists');
  }

  if (phoneNumber) {
    const existingPhone = await prisma.user.findFirst({
      where: { phoneNumber },
    });

    if (existingPhone) {
      throw new Error('Phone number already exists');
    }
  }

  const hashedPassword = await hashPassword(password);
  const newUser = await prisma.user.create({
    data: {
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role: role || 'PATIENT',
    },
  });

  const payload = {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: newUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    newUser: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      role: newUser.role,
      isActive: newUser.isActive,
    },
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error(MESSAGES.INVALID_CREDENTIALS);
  }

  if (!user.isActive) {
    throw new Error(MESSAGES.ACCOUNT_DEACTIVATED);
  }

  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw new Error(MESSAGES.INVALID_CREDENTIALS);
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
    },
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const { password: _, ...userWithoutSensitive } = user;

  return {
    user: userWithoutSensitive,
    accessToken,
    refreshToken,
  };
};

export const logoutUser = async (userId) => {
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { revoked: true, revokedAt: new Date() },
  });

  return true;
};

export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true, phoneNumber: true, role: true, isActive: true, lastLoginAt: true, lastLoginIP: true, createdAt: true, updatedAt: true },
  });

  if (!user) throw new Error(MESSAGES.USER_NOT_FOUND);
  if (!user.isActive) throw new Error(MESSAGES.ACCOUNT_DEACTIVATED);
  return user;
};

export const updateUserProfile = async (userId, updateData) => {
  const { fullName, phoneNumber, newPassword } = updateData;
  const data = {};
  if (fullName) data.fullName = fullName;
  if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
  if (newPassword) data.password = await hashPassword(newPassword);

  return await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, fullName: true, phoneNumber: true, role: true, isActive: true, createdAt: true, updatedAt: true },
  });
};

export const getAllUsers = async (filters = {}) => {
  const { role, isActive, search } = filters;
  const where = {};
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive;
  if (search) where.OR = [{ email: { contains: search } }, { fullName: { contains: search } }];

  return await prisma.user.findMany({
    where,
    select: { id: true, email: true, fullName: true, phoneNumber: true, role: true, isActive: true, lastLoginAt: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true, phoneNumber: true, role: true, isActive: true, lastLoginAt: true, lastLoginIP: true, createdAt: true, updatedAt: true },
  });
  if (!user) throw new Error(MESSAGES.USER_NOT_FOUND);
  return user;
};

export const regiserUser = registerUser;