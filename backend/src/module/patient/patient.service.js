import prisma from "../../config/database.js"
import MESSAGES from "../../constants/message.js"

//create Patient
export const createPatient = async (patientData)=>{
    const {userId, ...data}=patientData


    //Check if the patient exists
    const user = await prisma.user.findUnique({
        where:{
            id:userId

        }
    })
    if(!user){
        throw new Error("User not found ")
    }
    //check if user already have the patient profile 
    const existingPatient= await prisma.patient.findUnique({
        where:{id:userId}
    })
    if(existingPatient){
        throw new Error("Patient profile already created or exist with the name of this")
    }

    //check if user is already a doctor 
    const existingDoctor= await prisma.doctor.findUnique({
        where:{userId}
    })
    if(existingDoctor){
        throw new Error("User is already registered as a doctor")
    }
    

    //create patient 
    const patient = await prisma.patient.create({
        data:{userId,...data,
            allergies:data.allergies || [],
            medicalHistory:data.medicalHistory || [],
    
        },
        include :{
            user:{
                select:{
                    id:true,
                    fullName:true,
                    email:true,
                    phone:true,
                    role: true,
                    isActive:true,
                    isEmailVerified:true,


                }
            }
        }
    })

    //update user role if not already patient
    if(user.role!="PATIENT"){
        await prisma.user.update({
            where:{id:userId},
            data:{role:"PATIENT"}
        })
    }

    //create audit log
    await prisma.auditLog.create({
        data:{
            userId:user.id,
            action:"PATIENT_CREATED",
            resource:"PATIENT",
            details:{patientId:patient.id}
        },
    })
 return patient
}


//get all patient
export const getAllPatiet = async (page=1, limit=10, search=null,gender=null,bloodGroup=null)=>{
    const skip=(page-1)*limit;
    const where ={}
    if (search){
        where.OR=[
            {user:{fullname:{contains:search}}},
            {user:{email:{contains:search}}},
            {user:{phone:{contains:search}}}
        ]
    }
    if(gender){
        where.gender=gender;
    }
    if(bloodGroup){
        where.bloodGroup=bloodGroup;
    }

    const[patients,total]=await Promise.all([prisma.patient.findMany({
        where,
        include:{
            user:{
                select:{
                    id:true,
                    fullName: true,
                    email: true,
                    phone: true,
                    role:true,
                    isActive:true,
                    isEmailVerified:true,
                    createdAt:true
                }
            },
            appointments:{
                where:{
                    status:{
                        in:['SCHEDULED','CONFIRMED'],
                    }
                },
                include:{
                    doctor:{
                        include:{
                            user:{
                                select:{
                                    fullName:true
                                }
                            }
                        }
                    }
                }
            }
        },
        skip,
        take:limit,
        orderBy:{createdAt:"desc"}

    }),
prisma.patient.count({where})
])

return {
    patients,pagination:{
        page,limit,total,totalpages:Math.cell(total/limit)
    }
}

}

//get patient by id 
//patient by userid 

//
// Update Patient
export const updatePatient = async (userId, patientData) => {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    if (!user) {
        throw new Error("User not found")
    }

    // Check if patient profile exists
    const existingPatient = await prisma.patient.findUnique({
        where: {
            userId: userId
        }
    })

    if (!existingPatient) {
        throw new Error("Patient profile not found")
    }

    // Update patient
    const patient = await prisma.patient.update({
        where: {
            userId: userId
        },
        data: {
            ...patientData,
            allergies: patientData.allergies || existingPatient.allergies,
            medicalHistory:
                patientData.medicalHistory || existingPatient.medicalHistory
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    role: true,
                    isActive: true,
                    isEmailVerified: true
                }
            }
        }
    })

    // Create audit log
    await prisma.auditLog.create({
        data: {
            userId: user.id,
            action: "PATIENT_UPDATED",
            resource: "PATIENT",
            details: {
                patientId: patient.id
            }
        }
    })

    return patient
}


// Delete Patient
export const deletePatient = async (userId) => {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    if (!user) {
        throw new Error("User not found")
    }

    // Check if patient profile exists
    const existingPatient = await prisma.patient.findUnique({
        where: {
            userId: userId
        }
    })

    if (!existingPatient) {
        throw new Error("Patient profile not found")
    }

    // Delete patient profile
    const patient = await prisma.patient.delete({
        where: {
            userId: userId
        }
    })

    // Changing role back to USER
    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            role: "USER"
        }
    })

    // Create audit log
    await prisma.auditLog.create({
        data: {
            userId: user.id,
            action: "PATIENT_DELETED",
            resource: "PATIENT",
            details: {
                patientId: patient.id
            }
        }
    })

    return {
        message: "Patient deleted successfully",
        patientId: patient.id
    }
}