import { getIO } from "../config/socket.js";

const emit = (event, payload, rooms = []) => {
  const io = getIO();
  if (!io) return;

  const targets = [...new Set(rooms.filter(Boolean))];
  if (targets.length === 0) {
    io.emit(event, payload);
    return;
  }

  for (const room of targets) {
    io.to(room).emit(event, payload);
  }
};

const appointmentRooms = (appointment) => [
  appointment?.patientId && `patient_${appointment.patientId}`,
  appointment?.doctorId && `doctor_${appointment.doctorId}`,
  "staff",
];

const paymentRooms = (payment) => [
  payment?.bill?.patientId && `patient_${payment.bill.patientId}`,
  payment?.patientId && `patient_${payment.patientId}`,
  "staff",
];

const socketEmitter = {
  emitBookingCreated(appointment) {
    emit("appointment:created", appointment, appointmentRooms(appointment));
  },

  emitAppointmentStatusChanged(appointment, previousStatus) {
    emit(
      "appointment:statusChanged",
      { appointment, previousStatus },
      appointmentRooms(appointment),
    );
  },

  emitAppointmentSlotsChanged(doctorId, date, slots) {
    emit("appointment:slotsChanged", { doctorId, date, slots }, [
      `doctor_${doctorId}`,
      "staff",
    ]);
  },

  emitQueueUpdate(doctorId, tokenNumber, queue, waiting) {
    emit("appointment:queueUpdated", { doctorId, tokenNumber, queue, waiting }, [
      `doctor_${doctorId}`,
      "staff",
    ]);
  },

  emitPaymentReceived(payment) {
    emit("payment:received", payment, paymentRooms(payment));
  },

  emitPaymentFailed(paymentOrBillId, amount, method, reason) {
    const payment = typeof paymentOrBillId === "object" ? paymentOrBillId : null;
    emit(
      "payment:failed",
      payment || { billId: paymentOrBillId, amount, method, reason },
      payment ? paymentRooms(payment) : ["staff"],
    );
  },
};

export default socketEmitter;
