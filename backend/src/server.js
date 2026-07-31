// import express from "express"
// import dotenv from "dotenv"
// import { studentRoutes } from "./routes/studentRoutes";

// const app = express();

// app.use(express.json());


// app.get("/",(req,res)=>{
//     res.status(200).send("Welcome to Server")
// })


// app.get("/about",(req,res)=>{
//     res.send("Welcome to about us page")
// })

// app.get("/employee",(req,res)=>{
//     res.json({
//         id:1,
//         name:"Ram",
//         Role: "Full-Stack Developer",
//         Salary: "80000"
//     })
// })

// //data post garnu xa vane (POST)
// app.post("/create",(req,res)=>{
//     res.send("Post create vayo")
// })


// //PUT
// app.put("/appointments/:id",(req,res)=>{
//     res.send("appointment is completed")
// })


// //For Delete
// app.delete("/appointments/:id",(req,res)=>{
//     res.send("Appointments deleted")
// })

// //to access single value 
// app.get("/doctors/:id",(req,res)=>{ 
//     res.send(req.params.id)
// })


// //multiple parameters (/student/id/rushu)
// app.get("/appointments/:id/:name",(req,res)=>{ 
//     res.json(req.params)
// })

// //query parameter (used in pagination)
// app.get("/doctors",(req,res)=>{
//     res.json(req.query)
// })


// //Assignment
// // req.body
// app.post("/users", (req, res) => {
//     console.log(req.body);

//     res.json({
//         message: "User created",
//         data: req.body
//     });
// });


// // req.params (route parameters)
// app.get("/users/:id", (req, res) => {
//     res.json({
//         id: req.params.id
//     });
// });


// // Multiple route parameters
// // Example: /appointment/10/Ram
// app.get("/appointment/:id/:name", (req, res) => {
//     res.json(req.params);
// });


// // req.query (query parameters)
// app.get("/patients", (req, res) => {
//     res.json(req.query);
// });


// // req.headers
// app.get("/headers", (req, res) => {
//     res.json(req.headers);
// });


// // req.method
// app.get("/method", (req, res) => {
//     res.json({
//         method: req.method
//     });
// });


// // req.url
// app.get("/url", (req, res) => {
//     res.json({
//         url: req.url
//     });
// });


// // res.send()
// app.get("/send", (req, res) => {
//     res.send("Sending text response");
// });


// // res.json()
// app.get("/json", (req, res) => {
//     res.json({
//         message: "Sending JSON response"
//     });
// });


// // res.status()
// app.get("/status", (req, res) => {
//     res.status(201).json({
//         message: "Created successfully"
//     });
// });


// // res.redirect()
// app.get("/old-page", (req, res) => {
//     res.redirect("/new-page");
// });


// const PORT=process.env.PORT || 3000;

// app.listen(PORT,()=>{
//     console.log('our server is running')
// })



// app.use("/api",studentRoutes)



//Without error handling 
// const num= undefined;
// console.log(num.name)  //typeerror cannot read name property

// //with error handling
// try{
// //logic 
// const num = undefined;
// console.log(num.name)
// }
// catch(error){
//     console.log(error.message)
// }


// //express with catch try and catch 
// app.get("/students",(req,res)=>{
//     try{
//         throw new Error("undefined name") //custom error 
// const student = undefined
// res.json(student.name);
//     }
//     catch(error){
//         res.status(500).json({
//                success:false,
//                message:error.message
//         })
//     }
// })


//-------------------CRUD operations---------------------//

//create students 
app.post("/students",(req,res)=>{
    db.query(
        "INSERT INTO students(name, email, age) VALUES (?,?,?)",
        [
            req.body.name,
            req.body.email,
            req.body.age
        ]
    )
    res.status(200).json({
        messsage:"Student Created"
    })
})


//get students 
app.get("/students",(req,res)=>{
    const [students] = db.query(
        "SELECT * FROM students"
    )
    res.json(students)
})

//Update 
app.put("/students/:id",(req,res)=>{
    db.query(
        "UPDATE students SET name=? WHERE id=? ",
        [
            req.body.name,
            req.params.id
        ]
    )
})

//delete
app.delete("/students/:id",(req,res)=>{
    db.query(
        "DEETE FROM students WHERE id=?",
        [
            req.params.id
        ]
    )
})


//crud example using prisma
prisma.user.create({
    data:{
        name:"Rushu",
        age: 21,
        address: "ITH",
        email:"rushu123@gmail.com"
    }
})
const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log('our server is running')
})
