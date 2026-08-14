import * as patientService from "./patient.service.js"
import {conflictResponse, createdResponse, notFoundResponse, successResponse} from "../../utils/response.js"
import { MESSAGES } from "../../constants/message.js"

export const createPatient = async (req, res)=>{
    try{
        const patient = await patientService.createPatient(req.body)

        return createdResponse(res,patient,'Patient successfully cretaed')
    }
    catch (error){
        console.error('Create patient error',error)
        if(error.message==="User not found"){
            return notFoundResponse(res,error.message)
        }
        if(error.message==='Patient Profile is already created'){
            return conflictResponse(res,error.message)
        }
        if(error.message==='User is already registered as a doctor'){
            return conflictResponse(res,error.message)
        }
    }
    return errroResponse(res,error.message || "Failed to create Patient")
}


//get all patient 
export const getAllPatients = async (req,res)=>{
    try{
        const page = parseInt(req.query.page || 1)
        const limit = parseInt(req.query.limit || 10)
        const search = req.query.search;
        const gender = req.query.gender;
        const bloodGroup= req.query.bloodGroup;


        const result = await patientService.getAllPatients(page,limit,search,gender,bloodGroup)
        return successResponse(res,result, 'patient fetched successfully')
    }
    catch (error){
        console.log("Get all patients error:",error)
        return errorResponse(res,error.message || 'Failed to get all patients')
    }
}

//get patients by id 
export const getPatientById = async (req, res)=>{
    try{
        const patient = await patientService.getPatientById(id)
        return successResponse(res,patient,'Patient featched successfully')
    }
    catch(error){
        console.log("Get all patients error:", error)
        if(error.message === 'Patient not found'){
            return notFoundResponse(res, error.message)
        }
    }
    return errorResponse(res,error.message || 'Failed to get patient')
}


//get patients by userId
export const getPatientByUserId = async (req,res)=>{
    try{
        const userId =  req.user.id;
        const patient = await patientService.getPatientByUserId(userId)
        return successResponse(res,patient,'Patient featched successfully')
    }
    catch(error){
        console.log("Get all patients by userId error:", error)
        if(error.message === 'Patient not found for this user'){
            return notFoundResponse(res, error.message)
        } 
    }
     return errorResponse(res,error.message || 'Failed to get patient')
}

//update patient 
export const updatePatient = async (req,res)=>{
    try{
        const {id}=req.params;
        const patient = await patientService.updatePatient(id,req.body)
        return successResponse(res, patient,'Patient updated successfully')
    }
    catch(error){
        console.log("Updated patient error:", error)
        if(error.message === 'Patient not found'){
            return notFoundResponse(res, error.message)
        }  
        
    }
     return errorResponse(res,error.message || 'Failed to update patient')
}

//delete patient 
export const deletePatient =async (req,res)=>{
    try{
        const {id}=req.params
        const result = await patientService.deletePatient(id)
        return successResponse(res,null,"Successfully deleted")

    }
    catch(error){
        console.log("Delete patient error:", error)
        if(error.message === 'Patient not found'){
            return notFoundResponse(res, error.message)
        }  
    }
     return errorResponse(res,error.message || 'Failed to delete patient')
}

//get patient statistics 
export const getPatientStatistics = async(req,res)=>{
    try{
        const {id}=req.params
        const result = await patientService.getPatientStatistics(id);
        return successResponse(res,statusbar,"Patient Statistics fetched successfully")
    }
    catch(error){
         console.log("Get patient statistics error:", error)
        if(error.message === 'Patient not found'){
            return notFoundResponse(res, error.message)
        } 
    }
    return errorResponse(res,error.message || 'Failed to get patient statistics')
}