import { errorResponse } from "../utils/response.js";
import {UNAUTHORIZED,FORBIDDEN} from "../constants/statusCodes.js"
import { verifyACCESSTOKEN } from "../utils/hash.js";
import {INVALID_ACCESS_TOKEN, USER_NOT_FOUND} from "../constants/message.js"


export const authenticate = async (req, res, next)=>{
    try{
        //get token from authorization header 
        const token = req.headers.authorization?.split(" ")[1];


        if (!token){
            return errorResponse(
                res,new Error(Error.ACCESS_TOKEN_REQUIRED),
                UNAUTHORIZED
            )
        }
        const decoded = verifyACCESSTOKEN(token)
        if (!decoded){
            return errorResponse(
                res, new Error (MESSAGES.INVALID_ACCESS_TOKEN)
            )
        }
        //get user from database
        const user = await prisma.user.findUnique({
            where:{
                id:decoded.id
            }
        })
        if (!user){
            return errorResponse(res,new Error (MESSAGES.USER_NOT_FOUND),
            UNAUTHORIZED
        )
        }
        if (!user.isActive){
            return errorResponse(res,new Error(MESSAGES.USER_INACTIVE),
            FORBIDDEN
        )
        }
        req.user =user;
        next()
    }
    catch(error){
        console.log("error")
    }
}

//authorization middleware 
// validation  middleware 