import express, { Router } from "express";

const router = express.Router();

router.get("/health",(req,res)=>{
    return res.json({
        message:"clinic management system"
        success:true
    })
})

export default router;