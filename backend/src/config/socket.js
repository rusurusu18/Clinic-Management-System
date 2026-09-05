import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";
import { ENV } from "./env.js";

let io = null;


// ============================================
// JWT TOKEN VERIFICATION
// ============================================

const verifyToken = (token) => {
    const decoded = jwt.verify(token, ENV.JWT_ACCESS_SECRET);

    // Supports common JWT payload structures
    return decoded.userId || decoded.id || decoded.sub;
};


// ============================================
// INITIALIZE SOCKET.IO
// ============================================

export const initializeSocket = (server) => {

    io = new Server(server, {
        cors: {
            origin: ENV.FRONTEND_URL || "http://localhost:5173",
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE"],
        },

        pingTimeout: 60000,
        pingInterval: 25000,
    });


    // ============================================
    // SOCKET AUTHENTICATION MIDDLEWARE
    // ============================================

    io.use(async (socket, next) => {

        try {

            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("No token provided"));
            }


            // Verify JWT
            const userId = verifyToken(token);

            if (!userId) {
                return next(new Error("Invalid token"));
            }


            // Get user
            const user = await prisma.user.findUnique({
                where: {
                    id: userId,
                },

                include: {
                    patient: true,
                    doctor: true,
                },
            });


            if (!user) {
                return next(new Error("User not found"));
            }


            if (!user.isActive) {
                return next(new Error("User is not active"));
            }


            // Attach user information to socket
            socket.user = user;
            socket.userId = user.id;
            socket.role = user.role;


            next();

        } catch (error) {

            console.error("Socket authentication error:", error.message);

            next(new Error("Authentication error"));
        }
    });


    // ============================================
    // CONNECTION HANDLER
    // ============================================

    io.on("connection", (socket) => {

        console.log(
            `User connected: ${socket.user.fullName} (${socket.user.role})`
        );


        // User-specific room
        socket.join(`${socket.user.role}-${socket.user.id}`);


        // Patient room
        if (
            socket.user.role === "PATIENT" &&
            socket.user.patient
        ) {
            socket.join(`patient_${socket.user.patient.id}`);
        }


        // Doctor room
        if (
            socket.user.role === "DOCTOR" &&
            socket.user.doctor
        ) {
            socket.join(`doctor_${socket.user.doctor.id}`);
        }


        // Staff room
        if (
            ["ADMIN", "RECEPTIONIST"].includes(socket.user.role)
        ) {
            socket.join("staff");
        }


        // Notify other connected users
        socket.broadcast.emit("userStatusChanged", {
            userId: socket.user.id,
            status: "online",
        });


        // Setup events
        setupEventHandlers(socket);


        // ============================================
        // DISCONNECT
        // ============================================

        socket.on("disconnect", () => {

            console.log(
                `User disconnected: ${socket.user.fullName} (${socket.user.role})`
            );


            socket.broadcast.emit("userStatusChanged", {
                userId: socket.user.id,
                status: "offline",
            });

        });

    });


    // ============================================
    // SOCKET.IO SERVER ERROR
    // ============================================

    io.engine.on("connection_error", (error) => {
        console.error("Socket connection error:", error);
    });


    return io;
};


// ============================================
// SOCKET EVENT HANDLERS
// ============================================

const setupEventHandlers = (socket) => {


    // ============================================
    // BOOK APPOINTMENT
    // ============================================

    socket.on("bookAppointment", async (data) => {

        try {

            const eventData = {
                ...data,
                bookedBy: socket.userId,
                fullName: socket.user.fullName,
                timestamp: new Date(),
            };


            // Notify doctor
            io.to(`doctor_${data.doctorId}`)
                .emit("newAppointment", eventData);


            // Notify admin/receptionist
            io.to("staff")
                .emit("newAppointment", eventData);


            // Confirm to user who booked appointment
            socket.emit("appointmentBooked", eventData);


        } catch (error) {

            console.error(
                "Error booking appointment:",
                error
            );


            socket.emit("bookAppointmentError", {
                message: "Error booking appointment",
            });
        }

    });


    // ============================================
    // UPDATE APPOINTMENT
    // ============================================

    socket.on("updateAppointment", async (data) => {

        try {

            const {
                appointmentId,
                ...updateData
            } = data;


            if (!appointmentId) {

                return socket.emit(
                    "updateAppointmentError",
                    {
                        message: "Appointment ID is required",
                    }
                );
            }


            const appointment =
                await prisma.appointment.update({

                    where: {
                        id: appointmentId,
                    },

                    data: updateData,

                    include: {
                        patient: true,
                        doctor: true,
                    },
                });


            const eventData = {
                ...appointment,
                timestamp: new Date(),
            };


            // Notify doctor
            io.to(
                `doctor_${appointment.doctorId}`
            ).emit(
                "appointmentUpdated",
                eventData
            );


            // Notify staff
            io.to("staff")
                .emit(
                    "appointmentUpdated",
                    eventData
                );


            // Notify patient
            io.to(
                `patient_${appointment.patientId}`
            ).emit(
                "appointmentUpdated",
                eventData
            );


            // Confirm to current socket
            socket.emit(
                "appointmentUpdateSuccess",
                eventData
            );


        } catch (error) {

            console.error(
                "Error updating appointment:",
                error
            );


            socket.emit(
                "updateAppointmentError",
                {
                    message:
                        "Error updating appointment",
                }
            );
        }

    });


    // ============================================
    // CANCEL APPOINTMENT
    // ============================================

    socket.on(
        "appointment:cancel",
        async (data) => {

            try {

                const {
                    appointmentId,
                    reason,
                } = data;


                if (!appointmentId) {

                    return socket.emit(
                        "cancelAppointmentError",
                        {
                            message:
                                "Appointment ID is required",
                        }
                    );
                }


                const appointment =
                    await prisma.appointment.findUnique({

                        where: {
                            id: appointmentId,
                        },

                        include: {
                            patient: true,
                            doctor: true,
                        },
                    });


                if (!appointment) {

                    return socket.emit(
                        "cancelAppointmentError",
                        {
                            message:
                                "Appointment not found",
                        }
                    );
                }


                const cancelData = {
                    appointmentId,
                    reason:
                        reason ||
                        "No reason provided",
                    timestamp: new Date(),
                };


                // Notify patient
                io.to(
                    `patient_${appointment.patientId}`
                ).emit(
                    "appointment:cancelled",
                    cancelData
                );


                // Notify doctor
                io.to(
                    `doctor_${appointment.doctorId}`
                ).emit(
                    "appointment:cancelled",
                    cancelData
                );


                // Notify staff
                io.to("staff")
                    .emit(
                        "appointment:cancelled",
                        cancelData
                    );


                // Confirm to current socket
                socket.emit(
                    "appointment:cancelSuccess",
                    cancelData
                );


            } catch (error) {

                console.error(
                    "Error cancelling appointment:",
                    error
                );


                socket.emit(
                    "cancelAppointmentError",
                    {
                        message:
                            "Error cancelling appointment",
                    }
                );
            }

        }
    );


    // ============================================
    // CHAT MESSAGE
    // ============================================

    socket.on("chat:message", async (data) => {

        try {

            const {
                recipientId,
                message,
                type = "text",
            } = data;


            if (!recipientId || !message) {

                return socket.emit(
                    "chat:error",
                    {
                        message:
                            "Recipient ID and message are required",
                    }
                );
            }


            /*
             * IMPORTANT:
             *
             * Change these field names according
             * to your ChatMessage Prisma model.
             *
             * Expected fields:
             *
             * senderId
             * recipientId
             * message
             * type
             */

            const chatMessage =
                await prisma.chatMessage.create({

                    data: {
                        senderId: socket.userId,
                        recipientId,
                        message,
                        type,
                    },
                });


            // Send message to recipient
            io.to(
                `${recipientId}`
            ).emit(
                "chat:newMessage",
                chatMessage
            );


            // Confirm message to sender
            socket.emit(
                "chat:messageSent",
                chatMessage
            );


        } catch (error) {

            console.error(
                "Chat message error:",
                error
            );


            socket.emit(
                "chat:error",
                {
                    message:
                        "Error sending message",
                }
            );
        }

    });

};


// ============================================
// GET SOCKET INSTANCE
// ============================================

export const getIO = () => {

    if (!io) {
        throw new Error(
            "Socket.IO has not been initialized"
        );
    }

    return io;
};