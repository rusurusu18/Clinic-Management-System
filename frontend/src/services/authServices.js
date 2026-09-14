import axios from "../utils/axios.js"

const API_URL = '/auth' //localhost:5000/api/auth

//auth endpoints
//Register User
export const register = async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData)
}