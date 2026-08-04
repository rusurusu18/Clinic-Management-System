import {Router} from "express"
import authRoutes from "./auth/auth.route.js"

const router = Router()

router.post("/login",(req,res)=>{
    return res.status(200).json({
        success:true,
        message:"Clinic Management System "
    })  
})
router.use("/auth",authRoutes)


export default router 