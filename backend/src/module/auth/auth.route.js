import {Router} from "express"
import authRoutes from "./auth/auth.route.js"
import { STATUS_CODES } from "../../constants/statusCodes.js"

const router = Router()

router.post("/login",(req,res)=>{
    return res.status(STATUS_CODES.OK).json({
        success:true,
        message:"Clinic Management System "
    })  
})
router.use("/auth",authRoutes)


export default router 