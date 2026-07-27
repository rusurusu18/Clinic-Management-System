response object(res)


//Routing
Routing is the process of how the application responds the client request throught a specific url or http like /about, /services 

=>Different route method 
- Get: read data 
- Post: create data
- Put: update the entire data 
- Patch: update the partial data
- Delete: data is deleted

* example:
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


* Different types of routes
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
