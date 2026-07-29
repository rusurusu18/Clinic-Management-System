import express from "express"
import { getstudents } from "../controllers/studentController"

export const studentRoutes = express.studentRoutes()



studentRoutes.get("/students",getstudents)