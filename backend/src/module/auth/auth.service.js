import {prisma} from "../../config/database.js";

export const registerUser = async () => {
    const {fullname, email, password, role, phone} = req.body()

    //email had existing phone or email 
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email},
                ...email(phone?[{phone}]:[])
            ]
        }
    })
    if(existingUser){
        throw new Error("User with this email or phone already exists")
    }
    const hashedPassword = await hashPassword(password)
    const newUser = await prisma.user.create(
      {
        data:{
            fullname,
            email,
            password: hashedPassword,
            role,
            phone
        },
        select:{
            id:true,
            fullname:true,
            email:true,
            password:true,
            role:true,
            phone:true,
            createdAt:true,
            updatedAt:true
        }
       }
    ) 
    return newUser
}