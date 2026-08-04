import { prisma } from "../../config/database.js";
import { hashPassword } from "../../utils/hash.js";

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
  id: user.id,
  email: user.email,
  role: user.role,
};

const accesstoken = generateAccessToken(payload);
const refreshtoken = generateRefreshToken(payload);

await prisma.user.update({
  where: {
    id: user.id,
  },
  data: {
    refreshToken: refreshtoken,
  },
});

return {
  newUser: {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
  },
  accessToken: accesstoken,
  refreshToken: refreshtoken,
};
