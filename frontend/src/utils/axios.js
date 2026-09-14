import axios from "axios"


const API_URL = import.meta.url.BACKEND_URL || "http://localhost:5000/api"

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers:{
        'Content-Type': 'application/json'
    },
    withCredentials:true,
    timeout:3000
})


//request inceptors -- add token
axiosInstance.interceptors.request.use(
    (config)=>{
        const state = 
    }
)