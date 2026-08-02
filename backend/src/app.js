import express from "express";
import routes from "./routes/index.js";

const app = express();

app.use(express.json()); //(it is express inbuilt middleware function) it is used to convert http payload json into javascript object to understand the req.body 

//api routes 
app.use("/api",routes)

export default app;