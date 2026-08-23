import prisma from "../../config/database.js"

//generate Bill
export const generateBill = async (billData) =>{
    const{patientId,appointmentId,items,tax,discount,generatedBy} = billData

    //if patient exists
    const patient = await prisma.patient.findUnique({
        where:{id:patientId},
        include:{
            user:{
                select:{
                    fullName:true,
                    email:true
                }
            }
        }
    })
    if(!patient){
        throw new Error("Patient not found")
    }

    //appointment is provided or not 
    if(appointmentId){
        const appointment= await prisma.appointment.findUnique({
            where:{id:appointmentId}
        })
        if(!appointmentId){
            throw new Error ("Appointment not Found")
        }
    }

    //calculate subtotal 
    const subtotal=items.reduce((sum, item)=>  //before adding tax and discount
        sum + item.total,0
    )

    //calculate total amount 
    const totalAmount = subtotal + tax - discount

    //generate bill and invoice numbers
    const billNumber = `BILL-${Date.now()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`  
    const inVoiceNumber = `INVOICE-${Date.now()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`

    //create Bill
    const bill = await prisma.bill.create({
        data:{
            patientId,
            appointmentId,billNumber,inVoiceNumber,
            items,
            subtotal,totalAmount,notes,generatedBy,
            status:"UNPAID"
        },
        include:{
            patient:{
             include:{
                user:{
                    select:{
                        id:true,
                        fullName,email:true,
                        phone:true
                    }
                }
             }
            },
            appointment:{
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
        } 
    })

    await prisma.auditLog.create({
    data: {
      userId: generatedBy,
      action: 'Bill generate',
      resource:"Bill",
      details:{
        billId:bill.id,
        patientId,
        appointmentId,
        totalAmount,
        billNumber
      },
      description: `Bill greated with this number: ${billNumber}`,
    }
    });

    return bill

}

//get all bill 
export const getAllBills = async (page=1,limit=10,filters={})=>{
    const skip = (page-1)*limit //pagination
    const where ={}
    //sorting
    if(filters.patientId)
        where.patientId= filters.patientId   //select patiendId from patient where patientId = "Abb392785"
    if(filters.status)
        where.status=filters.status
    if(filters.fromDate)
        where.generatedAt={gte:new Date(filters.fromDate)}
    if(filters.toDate)
        where.generatedAt={gte:new Date(filters.toDateDate)}   
    
    //sorting for the search box by bill number and patientName
    if(filters.search){
        where.OR =[
            {billNumber:{
                contains:filters.search
            }},
            {patient:{user:{fullName:{
                contains:filters.search
            }}}}
        ]
    }

    const [bills,total]=await Promise.all([
        prisma.bill.findMany({
            where,
            include:{
                patient:{
                    include:{
                        user:{
                            select:{
                                id:true,
                            fullName,email:true,
                            phone:true

                            }

                        }
                    }
                },
                appointment:{
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
            },
            payments:{
                orderBy:{paymentDate:"desc"}
            }


            },
            skip,take:limit,
            orderBy:{generatedAt:'desc'}
        }),
        prisma.bill.count({where})       // count, sum 


    ])
    return {
        bills,pagination:{
            page,limit,total,
            totalPages:Math.ceil(total/limit)
        }
    }


}

//get bill by id
export const getBillById = async (billId) => {

    const bill = await prisma.bill.findUnique({
        where: {
            id: billId
        },

        include: {
            patient: {
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phoneNumber: true
                        }
                    }
                }
            },

            appointment: true,
            payments: {
                orderBy: {
                    paymentDate: "desc"
                }
            }
        }
    });

    if (!bill) {
        throw new Error("Bill not found");
    }

    return bill;
};


 //get bill by invoice number
export const getBillByInvoiceNumber = async (invoiceNumber) => {

    const bill = await prisma.bill.findUnique({
        where: {
            inVoiceNumber: invoiceNumber
        },

        include: {
            patient: {
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phoneNumber: true
                        }
                    }
                }
            },

            appointment: true,
            payments: {
                orderBy: {
                    paymentDate: "desc"
                }
            }
        }
    });

    if (!bill) {
        throw new Error("Bill not found");
    }

    return bill;
};


//update bill
export const updateBill = async (billId, updateData) => {

    const bill = await prisma.bill.update({
        where: {
            id: billId
        },

        data: updateData
    });

    if (!bill) {
        throw new Error("Bill not found");
    }

    return bill;
};


//cancel bill
export const cancelBill = async (billId) => {

    const bill = await prisma.bill.update({
        where: {
            id: billId
        },

        data: {
            status: "CANCELLED"
        }
    });

    if (!bill) {
        throw new Error("Bill not found");
    }

    return bill;
};