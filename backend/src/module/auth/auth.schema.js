import {optional, z} from 'zod';
import { Roles } from '../../constants/role.js';

export const registerSchema = z.object({
    fullName:z.string().trim().min(3,"Fullname must be at least 3 characters"),
    email:z.string().trim().email("Invalid email address"),
    phone:z.string().trim().min(10,"Phone number must be at least 10 digits").max(15,"Phone number cannot exceed 15 digits").optional(),
    password:z.string().min(8,"Password must be of 8 characters"),
     role: z
  .enum([
    Roles.ADMIN,
    Roles.DOCTOR,
    Roles.PATIENT,
    Roles.STAFF,
  ])
  .optional()

})

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters same as used during registration"),
  rememberMe: z.boolean().default(false).optional(),
})
  