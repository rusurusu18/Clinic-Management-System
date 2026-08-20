import prisma from "../../config/database.js";

// CREATE DEPARTMENT
export const createDepartment = async (departmentData) => {
    const { name, headDoctorId, ...data } = departmentData;

    // Check if department name already exists
    const existingDepartment = await prisma.department.findUnique({
        where: { name }
    });

    if (existingDepartment) {
        throw new Error("Department with this name already exists");
    }

    // If headDoctorId is provided, check if doctor exists
    if (headDoctorId) {
        const doctor = await prisma.doctor.findUnique({
            where: { id: headDoctorId },
            include: {
                user: true
            }
        });

        if (!doctor) {
            throw new Error("Head doctor not found");
        }

        // Check whether doctor is already head of another department
        const existingHead = await prisma.department.findFirst({
            where: {
                headDoctorId,
                NOT: {
                    headDoctorId: null
                }
            }
        });

        if (existingHead) {
            throw new Error(
                "This doctor is already head of another department"
            );
        }
    }

    const department = await prisma.department.create({
        data: {
            name,
            headDoctorId,
            ...data
        },
        include: {
            headDoctor: {
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true
                        }
                    }
                }
            }
        }
    });

    // Create audit log
    await prisma.auditLog.create({
        data: {
            userId: department.headDoctorId || "system",
            action: "CREATE",
            description: `Department ${department.name} created`
        }
    });

    return department;
};

// GET ALL DEPARTMENTS
export const getAllDepartments = async (query = {}) => {
    const {
        page = 1,
        limit = 10,
        search,
        isActive
    } = query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;

    const where = {};

    // Search by department name
    if (search) {
        where.name = {
            contains: search
        };
    }

    // Filter by active status
    if (isActive !== undefined) {
        where.isActive =
            isActive === true ||
            isActive === "true";
    }

    const [departments, total] = await Promise.all([
        prisma.department.findMany({
            where,

            include: {
                headDoctor: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                }
            },

            skip,
            take: limitNumber,

            orderBy: {
                createdAt: "desc"
            }
        }),

        prisma.department.count({
            where
        })
    ]);

    // Get doctor counts separately
    const departmentsWithDoctorCount = await Promise.all(
        departments.map(async (department) => {
            const doctorCount = await prisma.doctor.count({
                where: {
                    departmentId: department.id
                }
            });

            return {
                ...department,
                doctorCount
            };
        })
    );

    return {
        departments: departmentsWithDoctorCount,

        pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages: Math.ceil(total / limitNumber)
        }
    };
};


// GET DEPARTMENT BY ID
export const getDepartmentById = async (departmentId) => {
    const department = await prisma.department.findUnique({
        where: {
            id: departmentId
        },

        include: {
            headDoctor: {
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            },

            doctors: {
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            }
        }
    });

    if (!department) {
        throw new Error("Department not found");
    }

    // Count doctors separately
    const doctorCount = await prisma.doctor.count({
        where: {
            departmentId
        }
    });

    return {
        ...department,
        doctorCount
    };
};


// UPDATE DEPARTMENT
export const updateDepartment = async (
    departmentId,
    updateData
) => {
    const {
        name,
        headDoctorId,
        ...data
    } = updateData;

    // Check if department exists
    const existingDepartment =
        await prisma.department.findUnique({
            where: {
                id: departmentId
            }
        });

    if (!existingDepartment) {
        throw new Error("Department not found");
    }

    // Check if department name already exists
    if (
        name &&
        name !== existingDepartment.name
    ) {
        const nameExists =
            await prisma.department.findUnique({
                where: {
                    name
                }
            });

        if (nameExists) {
            throw new Error(
                "Department with this name is already taken"
            );
        }
    }

    // If headDoctorId is provided
    if (headDoctorId) {
        const doctor =
            await prisma.doctor.findUnique({
                where: {
                    id: headDoctorId
                },
                include: {
                    user: true
                }
            });

        if (!doctor) {
            throw new Error("Head doctor not found");
        }

        // Check if doctor is already head
        // of another department
        const existingHead =
            await prisma.department.findFirst({
                where: {
                    headDoctorId,
                    id: {
                        not: departmentId
                    }
                }
            });

        if (existingHead) {
            throw new Error(
                "This doctor is already head of another department"
            );
        }
    }

    const department =
        await prisma.department.update({
            where: {
                id: departmentId
            },

            data: {
                ...(name !== undefined && { name }),
                ...(headDoctorId !== undefined && {
                    headDoctorId
                }),
                ...data
            },

            include: {
                headDoctor: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true
                            }
                        }
                    }
                },

                doctors: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                }
            }
        });

    return department;
};


// GET DEPARTMENT DOCTORS
export const getDepartmentDoctors = async (
    departmentId,
    page = 1,
    limit = 10
) => {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip =
        (pageNumber - 1) * limitNumber;

    // Check department
    const department =
        await prisma.department.findUnique({
            where: {
                id: departmentId
            }
        });

    if (!department) {
        throw new Error("Department not found");
    }

    const [doctors, total] =
        await Promise.all([
            prisma.doctor.findMany({
                where: {
                    departmentId
                },

                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                            phone: true
                        }
                    }
                },

                skip,
                take: limitNumber,

                orderBy: {
                    createdAt: "desc"
                }
            }),

            prisma.doctor.count({
                where: {
                    departmentId
                }
            })
        ]);

    return {
        doctors,

        pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages:
                Math.ceil(total / limitNumber)
        }
    };
};


// ADD DOCTOR TO DEPARTMENT
export const addDoctorToDepartment = async (
    departmentId,
    doctorId
) => {
    // Check department
    const department =
        await prisma.department.findUnique({
            where: {
                id: departmentId
            }
        });

    if (!department) {
        throw new Error("Department not found");
    }

    // Check doctor
    const doctor =
        await prisma.doctor.findUnique({
            where: {
                id: doctorId
            }
        });

    if (!doctor) {
        throw new Error("Doctor not found");
    }

    // Check if doctor already belongs
    // to this department
    if (doctor.departmentId === departmentId) {
        throw new Error(
            "Doctor is already in this department"
        );
    }

    const updatedDoctor =
        await prisma.doctor.update({
            where: {
                id: doctorId
            },

            data: {
                departmentId
            },

            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

    return updatedDoctor;
};


// REMOVE DOCTOR FROM DEPARTMENT
export const removeDoctorFromDepartment = async (
    departmentId,
    doctorId
) => {
    // Check department
    const department =
        await prisma.department.findUnique({
            where: {
                id: departmentId
            }
        });

    if (!department) {
        throw new Error("Department not found");
    }

    // Check doctor
    const doctor =
        await prisma.doctor.findUnique({
            where: {
                id: doctorId
            }
        });

    if (!doctor) {
        throw new Error("Doctor not found");
    }

    // Check if doctor belongs to department
    if (doctor.departmentId !== departmentId) {
        throw new Error(
            "Doctor is not in this department"
        );
    }

    const updatedDoctor =
        await prisma.doctor.update({
            where: {
                id: doctorId
            },

            data: {
                departmentId: null
            },

            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

    return updatedDoctor;
};


// DELETE DEPARTMENT
export const deleteDepartment = async (
    departmentId
) => {
    // Check department
    const department =
        await prisma.department.findUnique({
            where: {
                id: departmentId
            }
        });

    if (!department) {
        throw new Error("Department not found");
    }

    // Check whether department has doctors
    const doctorCount =
        await prisma.doctor.count({
            where: {
                departmentId
            }
        });

    if (doctorCount > 0) {
        throw new Error(
            "Cannot delete department while doctors are assigned to it"
        );
    }

    await prisma.department.delete({
        where: {
            id: departmentId
        }
    });

    return {
        message: "Department deleted successfully"
    };
};