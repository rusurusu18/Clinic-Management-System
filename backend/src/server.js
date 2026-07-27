import express from "express"
import dotenv from "dotenv"

const app = express();

app.get("/",(req,res)=>{
    res.send("Welcome to Server")
})


app.get("/about",(req,res)=>{
    res.send("Welcome to about us page")
})

app.get("/employee",(req,res)=>{
    res.json({
        id:1,
        name:"Ram",
        Role: "Full-Stack Developer",
        Salary: "80000"
    })
})

//data post garnu xa vane (POST)
app.post("/create",(req,res)=>{
    res.send("Post create vayo")
})


//PUT
app.put("/appointments/:ID",(req,res)=>{
    res.send("appointment is completed")
})


//For Delete
app.delete("/appointments/:ID",(req,res)=>{
    res.send("Appointments deleted")
})

//to access single value 
app.get("/doctors/:id",(req,res)=>{ 
    res.send(req.params.id)
})


//multiple parameters (/student/id/rushu)
app.get("/appointments/:id/:name",(req,res)=>{ 
    res.json(req.params)
})

//query parameter (used in filterization)
app.get("/doctors",(req,res)=>{
    res.json(req.query)
})

const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log('our server is running')
})