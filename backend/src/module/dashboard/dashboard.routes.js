import express from 'express';
import * as dashboardController from './dashboard.controller.js';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();
// All dashboard routes require authentication
router.use(verifyToken);

// ==================== DASHBOARD ROUTES ====================

// Doctor self dashboard (DOCTOR only)
router.get(
  '/doctor-me',
  authorize(ROLES.DOCTOR),
  dashboardController.getDoctorSelfDashboard
);

// Full statistics summary (Admin + Doctor for own view if doctorId passed)
router.get(
  '/statistics',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
  dashboardController.getDashboardStats
);

// Daily summary report (Admin + Receptionist + Doctor)
router.get(
  '/daily-summary',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR),
  dashboardController.getDailySummary
);

// Revenue report (Admin only)
router.get(
  '/revenue',
  authorize(ROLES.ADMIN),
  dashboardController.getRevenueReport
);

// Doctor-wise load (Admin + Receptionist + Doctor)
router.get(
  '/doctor-load',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR),
  dashboardController.getDoctorLoad
);

export default router;