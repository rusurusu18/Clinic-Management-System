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
      Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
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

const loginUser = async (email, password,rememberMe=false) => {
  // const {email,password} = loginData;

  //find user 
  const user = await prisma.user.findUnique({ 
    where:{email}
  })
  if(!user){
    throw new Error(MESSAGES.USER_NOT_FOUND);
  }
  if(!user.isActive){
    throw new Error(MESSAGES.ACCOUNT_INACTIVE);

    //verify password
    const isvalidPassword = await comparePassword(password,user.password);
    if(!isvalidPassword){
      throw new Error(MESSAGES.INVALID_PASSWORD);
    }

    const {accessToken,refreshToken} = generateAccessToken(user);
    //last login update and refresh token 
    await prisma.user.update({
      where:{id:user.id},
      data:{
        lastLogin:new Date(),
        refreshToken:refreshToken,
      }
    });

    //remove sensitive data
    const {password:_,refreshToken:__,...userWithoutSensitiveData} = user;
    return {
      user:userWithoutSensitiveData,
      accessToken,
      refreshToken
    }
  }
};

export const logoutUser = async (userId) => {
  //delete refresh token from database
  await prisma.user.update({
    where:{id:userId},
    data:{
      refreshToken:null
    }
  })
  return true;  
}