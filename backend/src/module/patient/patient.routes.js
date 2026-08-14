import express from "express";

import * as patientController from "./patient.controller.js";
import { authorize, verifyToken } from "../../middleware/authMiddleware.js";
import {createPatientSchema, updatePatientSchema} from "./patient.schema.js";
import { ROLES } from "../../constants/role.js";
import { validate } from "../../middleware/validateMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Create patient
router.post(
    "/",
    validate(createPatientSchema),
    authorize(ROLES.PATIENT, ROLES.RECEPTIONIST),
    patientController.createPatient
);

// Get all patients with pagination
router.get(
    "/",
    authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
    patientController.getAllPatients
);

// Get current user's profile
router.get(
    "/me",
    patientController.getPatientByUserId
);

// Get patient by ID
router.get(
    "/:id",
    authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
    patientController.getPatientById
);

// Update patient
router.put(
    "/:id",
    validate(updatePatientSchema),
    authorize(ROLES.RECEPTIONIST, ROLES.PATIENT),
    patientController.updatePatient
);

// Delete patient
router.delete(
    "/:id",
    authorize(ROLES.ADMIN),
    patientController.deletePatient
);

// Get patient statistics
router.get(
    "/:id/statistics",
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR),
    patientController.getPatientStatistics
);

export default router;