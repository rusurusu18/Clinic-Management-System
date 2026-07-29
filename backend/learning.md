****************Routing*********************
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

*****************response object(res)*********************
=> it contains all the information send by the client 

//make route for all 
- req.body
- req.params: route parameters
- req.query query parameters
- req.headers
- req.method
- req.url

* res(Response object)
=> It is used to send back data to the client 
- res.send() send text or html
- res.json() send JSON
- res.status() send http status code 
- res.redirect() 

*****************RestAPI**************************
=> Representational state transfer 
It is a set of rules(an architectural style) for designing APIs

- Restful
When an APIs follow these rules, it is called a rest APIs

- What is Restful API?
=> A rest api uses:
- HTTP,
- urls,
- http method,
- json

Example :
get /students 
post /createstudents 
put students/1
delete /students/1


frontend
    |
    v
  axios
    |
    v
  rest APIs(express.js)


* Why do we use rest APIs?
- Frontend and Backend seperation
- Easy communication using Http
- Standard url structure 


**************HTTP status code************************
=> An http status code is a 3-digit number returned by the server to tell the client whether the request succeeded or failed.

Status code categories 
100 information
200/201 success 
400 client error
500 server error 

1. 200 = the request completed successfully 
eg: res.status(200).json({
    message:"Doctors data fetched successfully."
})

* uses=> get request 
         successfully updates

2. 201 => used to create new resources successfully 

3. 204 => no content 
res.status(204).send()

4. 400 => (bad request) client send invalid incomplete data 
res.status(400).json({
    message:"FUllname is required"
})

5. 401 => unauthorized access
6. 403 => access denied 
7. 404 => page not found 
8. 500 => internal server error (db failure , code error)


****************Controller(Business logic)********************

