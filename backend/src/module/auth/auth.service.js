import { prisma } from "../../config/database.js";
import { hashPassword } from "../../utils/hash.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { error } from "node:console";
import { MESSAGES } from "../../constans/messages.js";

export const registerUser = async (userData) => {
  const { fullName, email, phone, password, role } = userData;

  //email had existing phone or email
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, ...email(phone ? [{ phone }] : [])],
    },
  });
  if (existingUser) {
    throw new Error("User with this email or phone already exists");
  }
  const hashedPassword = await hashPassword(password);
  const newUser = await prisma.user.create({
    data: {
      fullName,
      email,
      phone,
      password: hashPassword,
      role,
    },
  });

  // select:{
  //     id:true,
  //     fullName:true,
  //     email:true,
  //     phone:true,
  //     password:true,
  //     role:true,
  //     createdAt:true,
  //     updatedAt:true
  // }
};
const payload = {
  id: newuser.id,
  email: newuser.email,
  role: newuser.role,
};

const accesstoken = generateAccessToken(payload);
const refreshtoken = generateRefreshToken(payload);

   await prisma.refreshToken.create({
  data: {
    token: refreshToken,
    userId: newUser.id,
    expiresAt: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    ),
  },
});

return {
  newUser: {
    id: newuser.id,
    fullName: newuser.fullName,
    email: newuser.email,
    phone: newuser.phone,
    role: newuser.role,
    isActive: newuser.isActive,
  },
  accessToken,
   refreshToken,
};
