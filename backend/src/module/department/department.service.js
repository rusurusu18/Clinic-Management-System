import prisma from "../../config/database.js"
import { Prisma } from "@prisma/client";

// create department 
export const createDepartment = async (deaprtentData) =>{
    const {name, headDoctorId , ... data} = departmentData

    // check if department name already exists
    const existingDpartment = await prisma.department.findUnique({
        where :{name},
    });
     if(existingDpartment){
        throw new Error ("deparment with this name already exists")
     }
     //if headDocotrId is provided , check if doctor exists or not
     if(headDoctorId){

        const doctor = await prisma.doctor.findUnique({
            where:{id:headDoctorId},
            include:{
                user:true
            }
        })

        if(!doctor){
            throw new Error("Head doctor not found")
        
        // check if docotr is already head of another department
        const existinHead = await prisma.department.findFirst({
            where:{
                headDoctorId,
                NOT:{headDoctorId:null}
            }
        })

        if (existinHead){
            throw new Error("This doctor is already head of another department")
        }


     }
     const department = await prisma.department.create({
        data:{
            name,
            headDoctorId,
            ...data
        },
        include:{
            headDoctor:{
                inlcude:{
                    user:{
                        select:{
                            fullName:true,
                            email:true
                        }
                    }
                }
            }
        }
     })
     /// create audit log
     await prisma.auditLog.create({
        data: {
            userId: department.headDoctorId || "system",
            action: 'department_created',
            resource: 'department',
            details: { departmentId:department.id,name:department.name ,
               
            },
          
        },
    });
}
return department
}


// get all department





// get department by Id
export const departmentById = async (departmentId) =>{
    const department = await prisma.department.findUnique({
        where:{id:departmentId},
        include:{
            headDoctor:{
                include:{
                    user:{
                        select:{
                            fullName:true,
                            email:true,
                            phone:true
                        }
                    }
                }
            },
            doctors:{
                include:{
                    user:{
                        select:{
                            fullName:true,
                            email:true,
                            phone:true
                        }
                    }
                }
            },
            _count:{
                select:{
                    docotrs:true
                }

            }

        }
    })
    if(!department){
        throw new Error("Department not found")
    }
    return department
}

// update department
export const updateDepartment = async (departmentId, updateData)=>{
    const{name , headDoctorId, ...data}= updateData

    // check if department exists
    const existingDpartment = await prisma.department.findUnique({
        where :{id:departmentId},
    });
     if(existingDpartment){
        throw new Error ("deparment with this name already exists")
     }
     // check if department name already exists(if name is being updates)
     if(name && name !==existingDpartment.name){
        const nameExists=await prisma.department.findUnique({
            where:{name}
        }),
        if(nameExists){
            throw new Error("department with this name is already taken")
        }
     }
     //if headDocotrId is provided , check if doctor exists or not
     if(headDoctorId){

        const doctor = await prisma.doctor.findUnique({
            where:{id:headDoctorId},
            include:{
                user:true
            }
        })

        if(!doctor){
            throw new Error("Head doctor not found")
        
        // check if docotr is already head of another department
        const existinHead = await prisma.department.findFirst({
            where:{
                headDoctorId,
                NOT:{headDoctorId:null}
            }
        })

        if (existinHead){
            throw new Error("This doctor is already head of another department")
        }

        }
const department = await prisma.department.update({
    where:{id:departmentId},
    data:{
        name,
        headDoctorId,
        ...data
    },
    include:{
        headDoctor:{
            include:{
                user:{
                    select:{
                        fullName:true,
                        email:true
                    }
                }
            }
        },
        doctors:{
                include:{
                    user:{
                        select:{
                            fullName:true,
                            email:true,
                            phone:true
                        }
                    }
                }
            }


    }
     })


    }
    return department
}


// get department doctors
const getDepartmentDocotrs = async(departmentId, page = 1,limit=10)=>{
    const skip = (page-1)*limit;
    const department = await prisma.department.findUnique({
        where:{
            id:departmentId
        }
    })
    if(!department){
        throw new Error("department not found")
    }
    const [doctors,total] = await Promise.all([
        prisma.doctor.findMany({
            where:{departmentId},
            include:{
                user:{
                    select:{
                        fullName:true,
                        email:true,
                        phone:true
                    }
                }
            },
            skip,
            take:limit,
            orderBy:{createdAt:"desc"}
        }),
        prisma.doctor.count({where:departmentId})
    ])
    return{
        doctors,
        pagination:{
            page,
            limit,
            total,
            totalPages:Math.ceil(total/limit)
        }
    }
}

// add  docots to department
//remove from department