import prisma from "../../config/database.js"


// create payment

export const createPayment = async (paymentData) =>{
    const{ billId, amount, method, transactionId, note } = paymentData; // Destructure the paymentData object to extract the required fields

    // Check if the bill exists
    const bill = await prisma.bill.findUnique({
        where: { id: billId },
        include:{
            payments:true, // Include the payments associated with the bill
        }
    });

    if (!bill) {
        throw new Error("Bill not found");
    }

    // check the amount bill is valid or not for the payment
    if(bill.status === "CANCELLED"){
        throw new Error("Cannot make payment for a cancelled bill");
    }
    if(bill.status === "REFUNDED"){
        throw new Error("Cannot make payment for a refunded bill");
    }

    if(bill.status === "PAID" ){
        throw new Error("Bill is already paid. Cannot make payment.");
}


// calculate the total amount paid for the bill
    const totalPaid = bill.payments.reduce((sum, payment) => sum + payment.amount, 0);  // Calculate the total amount paid for the bill by summing up the amounts of all payments associated with the bill
    const remainingAmount = bill.totalAmount - totalPaid;     2000 -1500

    if(amount > remainingAmount){
        throw new Error(`Payment amount exceeds the remaining bill amount. Remaining amount: ${remainingAmount}`);
    }

    // create the payment
    const payment = await prisma.payment.create({
        data:{
            billId,
            amount,
            method,
            transactionId,
            note,
            status: "COMPLETED", // Set the payment status to "COMPLETED" by default
        },
        include:{
            bill:{
                include:{
                    patient:{
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
            }
        }
        

    })

    //update the bill status
    const newTotalpaid =totalPaid + amount 
    let newStatus = bill.status
    if(newTotalpaid >= bill.totalAmount){
        newStatus ="PAID"
    }
    else if(newTotalpaid>0){
        newStatus = "PARTIALLY_PAID"
    }

    await prisma.bill.update({
        where:{id:billId},
        data:{
            status:newStatus,
            paymentDate:newStatus === "PAID"? new Date() :undefined,
            paymentMethod:method,
        }
    })

    // create audit log
    await prisma.auditLog.create({
        data:{
            action:"CREATE_PAYMENT",
            entityId:payment.id,
            entityType:"PAYMENT",
            description:`Payment of amount ${amount} created for bill ${billId}`,
        }
    })

    return payment;
}


// get all payments with pagination and filtering(dashboard)
export const getPayments = async (page=1, limit=10, filter={}) => {
    const skip = (page-1)* limit;
    const where = {};

    if(filter.billId){
        where.billId = filter.billId;
    }
    if(filters.status) where.status = filter.status;
    if(filters.method) where.method = filter.method;
    if(filters.fromDate ){
        where.paymentDate = where.paymentDate = { gte: new Date(filter.fromDate) };
    }
    if(filters.toDate){
        where.paymentDate = where.paymentDate = { lte: new Date(filter.toDate) };
    }
    if(filters.patientId){
        where.bill = {
            patientId: filter.patientId,
        }
    }
    if(filters.search){
        where.OR = [
            { transactionId: { contains: filters.search, mode: "insensitive" } },
            { note: { contains: filters.search, mode: "insensitive" } },
        ]
    }
    const [total, payments] = await Promise.all([  // it is ued to execute multiple asynchronous operations concurrently and wait for all of them to complete before proceeding. In this case, it is used to fetch the total count of payments and the list of payments based on the provided filters and pagination parameters.
        prisma.payment.count({ where }),
        prisma.payment.findMany({
            where,
            skip,
            take: limit,
            orderBy:{
                paymentDate:"desc"
            },
            include:{
                bill:{
                    include:{
                        patient:{
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
                }
            }
        })
    ])

    return {
        total,
        page,
        limit,
        payments
    }


}

// get payment by id
export const getPaymentById = async (paymentId) => {

    const payment = await prisma.payment.findUnique({
        where:{ id:paymentId },
        include:{
            bill:{
                include:{
                    patient:{
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
            }
        }
    })

    if(!payment){
        throw new Error("Payment not found")
    }

    return payment
}

// get payment by bill
export const getPaymentByBillId = async (billId, page=1, limit=10) => {
    const skip = (page-1)* limit;

    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
            where:{ billId },
            include:{
                bill:{
                    include:{
                        patient:{
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
                }
            },
            skip,
            take:limit,
            orderBy:{
                paymentDate:"desc"
            }
        }),

        prisma.payment.count({
            where:{ billId }
        }),
    ])

    return {
        payments,
        pagination:{
            page,
            limit,
            total,
            totalPages: Math.ceil(total/limit)
        }
    }
}



// update payment
export const updatePayment = async (paymentId, updateData) =>{
    const existingPayment = await prisma.payment.findUnique({
        where:{ id: paymentId },
        include:{
            bill:true
        }
    })

    if(!existingPayment){
        throw new Error("Payment not found");
    }
    // check if payment can be updated 
    if(existingPayment.status === "REFUNDED"){
        throw new Error("Cannot update a refunded payment");
    }

    // if the amount is being updated, check if the new amount is valid
    if(updateData.amount && updateData.amount !== existingPayment.amount){
        const bill = await prisma.bill.findUnique({
            where:{ id: existingPayment.billId },
            include:{
                payments:true
            }
        })
        const totalPaid = bill.payments.reduce((sum, payment) => sum + payment.amount, 0) - existingPayment.amount;  250 
        const remainingAmount = bill.totalAmount - totalPaid;  // baki rahyo 
        if(updateData.amount > remainingAmount){
            throw new Error(`Updated payment amount exceeds the remaining bill amount. Remaining amount: ${remainingAmount}`);
        }

        //update bill status if payment amount chnages 
        let newStatus = bill.status;
        if(totalPaid >= bill.totalAmount){   1000 >= 1000 
            newStatus = "PAID";
        }
        
        else if(totalPaid > 0 ){   // 1000-900 =100
            newStatus = "PARTIALLY_PAID";
        }
        else{
            newStatus = "UNPAID";
        }

        await prisma.bill.update({
            where:{ id: bill.id },
            data:{
                status:newStatus,
            
    }
})
    }


    const updatedPayment = await prisma.payment.update({    
        where:{
            id: paymentId
        },
        data:updataData,
        include:{
            bill:{
                include:{
                    patient:{
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
}}}


})

// create audit log
 await prisma.auditLog.create({
    data:{
        action:"UPDATE_PAYMENT",
        entityId:updatedPayment.id,
        entityType:"PAYMENT",
        description:`Payment ${paymentId} updated`,
    }       
}
)

return updatedPayment;

}

// REFUND PAYMENT
export const refundPayment = async (
    paymentId,
    refundData = {}
) => {

    const existingPayment = await prisma.payment.findUnique({
        where: {
            id: paymentId,
        },

        include: {
            bill: {
                include: {
                    payments: true,
                },
            },
        },
    });

    if (!existingPayment) {
        throw new Error("Payment not found");
    }

    // Already refunded
    if (existingPayment.status === "REFUNDED") {
        throw new Error("Payment is already refunded");
    }

    // Only completed payments can be refunded
    if (existingPayment.status !== "COMPLETED") {
        throw new Error(
            "Only completed payments can be refunded"
        );
    }

    const bill = existingPayment.bill;

    // Calculate remaining completed payments
    const totalPaidAfterRefund =
        bill.payments
            .filter(
                (payment) =>
                    payment.status === "COMPLETED" &&
                    payment.id !== paymentId
            )
            .reduce(
                (sum, payment) => sum + payment.amount,
                0
            );

    // Determine bill status after refund
    let newBillStatus;

    // If bill was cancelled, don't overwrite cancelled state
    if (bill.status === "CANCELLED") {
        newBillStatus = "CANCELLED";
    } else {
        newBillStatus = calculateBillStatus(
            bill.totalAmount,
            totalPaidAfterRefund
        );
    }

    const refundedPayment = await prisma.$transaction(
        async (tx) => {

            // Update payment status
            const payment = await tx.payment.update({
                where: {
                    id: paymentId,
                },

                data: {
                    status: "REFUNDED",

                    // Store refund information in note
                    note: refundData.reason
                        ? `${existingPayment.note || ""} | Refund reason: ${refundData.reason}`
                        : existingPayment.note,
                },

                include: {
                    bill: {
                        include: {
                            patient: {
                                include: {
                                    user: {
                                        select: {
                                            fullName: true,
                                            email: true,
                                            phone: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            // Update bill
            await tx.bill.update({
                where: {
                    id: bill.id,
                },

                data: {
                    status: newBillStatus,

                    paymentDate:
                        newBillStatus === "PAID"
                            ? bill.paymentDate
                            : null,
                },
            });

            // Audit log
            await tx.auditLog.create({
                data: {
                    action: "REFUND_PAYMENT",
                    entityId: payment.id,
                    entityType: "PAYMENT",
                    description:
                        `Payment ${paymentId} of amount ${payment.amount} refunded for bill ${bill.id}` +
                        (
                            refundData.reason
                                ? ` | Reason: ${refundData.reason}`
                                : ""
                        ),
                },
            });

            return payment;
        }
    );

    return refundedPayment;
};


// DELETE PAYMENT

export const deletePayment = async (paymentId) => {

    const existingPayment = await prisma.payment.findUnique({
        where: {
            id: paymentId,
        },

        include: {
            bill: {
                include: {
                    payments: true,
                },
            },
        },
    });

    if (!existingPayment) {
        throw new Error("Payment not found");
    }

    // Don't delete refunded payments
    if (existingPayment.status === "REFUNDED") {
        throw new Error(
            "Cannot delete a refunded payment"
        );
    }

    const bill = existingPayment.bill;

    // Calculate paid amount without deleted payment
    const totalPaidAfterDelete =
        bill.payments
            .filter(
                (payment) =>
                    payment.status === "COMPLETED" &&
                    payment.id !== paymentId
            )
            .reduce(
                (sum, payment) => sum + payment.amount,
                0
            );

    // Calculate new bill status
    let newBillStatus;

    if (bill.status === "CANCELLED") {
        newBillStatus = "CANCELLED";
    } else {
        newBillStatus = calculateBillStatus(
            bill.totalAmount,
            totalPaidAfterDelete
        );
    }

    const deletedPayment = await prisma.$transaction(
        async (tx) => {

            // Delete payment
            const payment = await tx.payment.delete({
                where: {
                    id: paymentId,
                },
            });

            // Update bill
            await tx.bill.update({
                where: {
                    id: bill.id,
                },

                data: {
                    status: newBillStatus,

                    paymentDate:
                        newBillStatus === "PAID"
                            ? bill.paymentDate
                            : null,

                    // Clear payment method when no payment remains
                    paymentMethod:
                        totalPaidAfterDelete > 0
                            ? bill.paymentMethod
                            : null,
                },
            });

            // Audit log
            await tx.auditLog.create({
                data: {
                    action: "DELETE_PAYMENT",
                    entityId: paymentId,
                    entityType: "PAYMENT",
                    description:
                        `Payment ${paymentId} of amount ${payment.amount} deleted from bill ${bill.id}`,
                },
            });

            return payment;
        }
    );

    return deletedPayment;
};


// PAYMENT SUMMARY FOR DASHBOARD

export const getPaymentSummary = async () => {

    const payments = await prisma.payment.findMany({
        select: {
            amount: true,
            status: true,
            method: true,
        },
    });

    const completedPayments = payments.filter(
        (payment) => payment.status === "COMPLETED"
    );

    const refundedPayments = payments.filter(
        (payment) => payment.status === "REFUNDED"
    );

    const totalPayments = payments.length;

    const totalCompletedAmount =
        completedPayments.reduce(
            (sum, payment) => sum + payment.amount,
            0
        );

    const totalRefundedAmount =
        refundedPayments.reduce(
            (sum, payment) => sum + payment.amount,
            0
        );

    // Payment method summary
    const paymentMethodSummary = {};

    completedPayments.forEach((payment) => {

        if (!paymentMethodSummary[payment.method]) {
            paymentMethodSummary[payment.method] = {
                count: 0,
                amount: 0,
            };
        }

        paymentMethodSummary[payment.method].count += 1;

        paymentMethodSummary[payment.method].amount +=
            payment.amount;
    });

    return {
        totalPayments,

        completedPayments: completedPayments.length,

        refundedPayments: refundedPayments.length,

        totalCompletedAmount,

        totalRefundedAmount,

        netAmount:
            totalCompletedAmount -
            totalRefundedAmount,

        paymentMethodSummary,
    };
};