import prisma from "../../config/database";



// HELPER FUNCTIONS

// Calculate the bill status based on its active/completed payments
const calculateBillStatus = (totalAmount, totalPaid) => {
    if (totalPaid <= 0) {
        return "UNPAID";
    }

    if (totalPaid >= totalAmount) {
        return "PAID";
    }

    return "PARTIALLY_PAID";
};


// Calculate total completed payments for a bill
const calculateTotalPaid = (payments) => {
    return payments
        .filter((payment) => payment.status === "COMPLETED")
        .reduce((sum, payment) => sum + payment.amount, 0);
};


// CREATE PAYMENT
export const createPayment = async (paymentData) => {
    const {
        billId,
        amount,
        method,
        transactionId,
        note,
    } = paymentData;

    // Validate amount
    if (amount === undefined || amount === null || amount <= 0) {
        throw new Error("Payment amount must be greater than 0");
    }

    // Check if bill exists
    const bill = await prisma.bill.findUnique({
        where: {
            id: billId,
        },
        include: {
            payments: true,
        },
    });

    if (!bill) {
        throw new Error("Bill not found");
    }

    // Check bill status
    if (bill.status === "CANCELLED") {
        throw new Error("Cannot make payment for a cancelled bill");
    }

    if (bill.status === "REFUNDED") {
        throw new Error("Cannot make payment for a refunded bill");
    }

    if (bill.status === "PAID") {
        throw new Error("Bill is already paid. Cannot make payment.");
    }

    // Calculate total paid
    const totalPaid = calculateTotalPaid(bill.payments);

    // Calculate remaining amount
    const remainingAmount = bill.totalAmount - totalPaid;

    if (amount > remainingAmount) {
        throw new Error(
            `Payment amount exceeds the remaining bill amount. Remaining amount: ${remainingAmount}`
        );
    }

    // Use transaction so payment + bill update + audit log
    // succeed or fail together
    const payment = await prisma.$transaction(async (tx) => {

        // Create payment
        const newPayment = await tx.payment.create({
            data: {
                billId,
                amount,
                method,
                transactionId,
                note,
                status: "COMPLETED",
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

        // Calculate new paid amount
        const newTotalPaid = totalPaid + amount;

        // Calculate new bill status
        const newStatus = calculateBillStatus(
            bill.totalAmount,
            newTotalPaid
        );

        // Update bill
        await tx.bill.update({
            where: {
                id: billId,
            },
            data: {
                status: newStatus,
                paymentDate:
                    newStatus === "PAID"
                        ? new Date()
                        : bill.paymentDate,
                paymentMethod: method,
            },
        });

        // Audit log
        await tx.auditLog.create({
            data: {
                action: "CREATE_PAYMENT",
                entityId: newPayment.id,
                entityType: "PAYMENT",
                description: `Payment of amount ${amount} created for bill ${billId}`,
            },
        });

        return newPayment;
    });

    return payment;
};


// GET ALL PAYMENTS
// Pagination + Filtering + Search
export const getPayments = async (
    page = 1,
    limit = 10,
    filter = {}
) => {

    const skip = (page - 1) * limit;

    const where = {};

    // Filter by bill
    if (filter.billId) {
        where.billId = filter.billId;
    }

    // Filter by payment status
    if (filter.status) {
        where.status = filter.status;
    }

    // Filter by payment method
    if (filter.method) {
        where.method = filter.method;
    }

    // Filter by date range
    if (filter.fromDate || filter.toDate) {

        where.paymentDate = {};

        if (filter.fromDate) {
            where.paymentDate.gte = new Date(filter.fromDate);
        }

        if (filter.toDate) {

            const toDate = new Date(filter.toDate);

            // Include the complete day
            toDate.setHours(23, 59, 59, 999);

            where.paymentDate.lte = toDate;
        }
    }

    // Filter by patient
    if (filter.patientId) {
        where.bill = {
            patientId: filter.patientId,
        };
    }

    // Search
    if (filter.search) {
        where.OR = [
            {
                transactionId: {
                    contains: filter.search,
                    mode: "insensitive",
                },
            },
            {
                note: {
                    contains: filter.search,
                    mode: "insensitive",
                },
            },
        ];
    }

    const [total, payments] = await Promise.all([

        prisma.payment.count({
            where,
        }),

        prisma.payment.findMany({
            where,
            skip,
            take: limit,

            orderBy: {
                paymentDate: "desc",
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
        }),
    ]);

    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        payments,
    };
};


// GET PAYMENT BY ID
export const getPaymentById = async (paymentId) => {

    const payment = await prisma.payment.findUnique({
        where: {
            id: paymentId,
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

    if (!payment) {
        throw new Error("Payment not found");
    }

    return payment;
};


// GET PAYMENTS BY BILL
export const getPaymentsByBill = async (
    billId,
    page = 1,
    limit = 10
) => {

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([

        prisma.payment.findMany({
            where: {
                billId,
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

            skip,
            take: limit,

            orderBy: {
                paymentDate: "desc",
            },
        }),

        prisma.payment.count({
            where: {
                billId,
            },
        }),
    ]);

    return {
        payments,

        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};



// GET BILL PAYMENT STATUS
export const getBillPaymentStatus = async (billId) => {

    const bill = await prisma.bill.findUnique({
        where: {
            id: billId,
        },

        include: {
            payments: true,

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
    });

    if (!bill) {
        throw new Error("Bill not found");
    }

    // Only COMPLETED payments count
    const totalPaid = calculateTotalPaid(bill.payments);

    const remainingAmount = Math.max(
        bill.totalAmount - totalPaid,
        0
    );

    const calculatedStatus = calculateBillStatus(
        bill.totalAmount,
        totalPaid
    );

    return {
        billId: bill.id,

        patient: bill.patient
            ? {
                  fullName: bill.patient.user?.fullName,
                  email: bill.patient.user?.email,
                  phone: bill.patient.user?.phone,
              }
            : null,

        totalAmount: bill.totalAmount,

        totalPaid,

        remainingAmount,

        status: bill.status,

        calculatedStatus,

        paymentCount: bill.payments.length,

        completedPaymentCount: bill.payments.filter(
            (payment) => payment.status === "COMPLETED"
        ).length,

        refundedPaymentCount: bill.payments.filter(
            (payment) => payment.status === "REFUNDED"
        ).length,

        payments: bill.payments,
    };
};



// UPDATE PAYMENT
export const updatePayment = async (
    paymentId,
    updateData
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

    // Cannot update refunded payment
    if (existingPayment.status === "REFUNDED") {
        throw new Error("Cannot update a refunded payment");
    }

    // Validate new amount
    if (
        updateData.amount !== undefined &&
        updateData.amount !== null &&
        updateData.amount <= 0
    ) {
        throw new Error("Payment amount must be greater than 0");
    }

    // If amount is being updated
    if (
        updateData.amount !== undefined &&
        updateData.amount !== existingPayment.amount
    ) {

        const bill = existingPayment.bill;

        // Current completed payments excluding this payment
        const totalPaidWithoutCurrentPayment =
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

        const remainingAmount =
            bill.totalAmount - totalPaidWithoutCurrentPayment;

        if (updateData.amount > remainingAmount) {
            throw new Error(
                `Updated payment amount exceeds the remaining bill amount. Remaining amount: ${remainingAmount}`
            );
        }

        const newTotalPaid =
            totalPaidWithoutCurrentPayment +
            updateData.amount;

        const newStatus = calculateBillStatus(
            bill.totalAmount,
            newTotalPaid
        );

        const updatedPayment = await prisma.$transaction(
            async (tx) => {

                const payment = await tx.payment.update({
                    where: {
                        id: paymentId,
                    },

                    data: updateData,

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

                await tx.bill.update({
                    where: {
                        id: bill.id,
                    },

                    data: {
                        status: newStatus,

                        paymentDate:
                            newStatus === "PAID"
                                ? new Date()
                                : bill.paymentDate,
                    },
                });

                await tx.auditLog.create({
                    data: {
                        action: "UPDATE_PAYMENT",
                        entityId: payment.id,
                        entityType: "PAYMENT",
                        description: `Payment ${paymentId} updated`,
                    },
                });

                return payment;
            }
        );

        return updatedPayment;
    }

    // Update payment when amount is NOT changed
    const updatedPayment = await prisma.$transaction(
        async (tx) => {

            const payment = await tx.payment.update({
                where: {
                    id: paymentId,
                },

                data: updateData,

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

            await tx.auditLog.create({
                data: {
                    action: "UPDATE_PAYMENT",
                    entityId: payment.id,
                    entityType: "PAYMENT",
                    description: `Payment ${paymentId} updated`,
                },
            });

            return payment;
        }
    );

    return updatedPayment;
};



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