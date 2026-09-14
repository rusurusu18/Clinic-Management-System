import express from 'express';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';
import { validate } from '../../middleware/validateMiddleware.js';
import { ROLES } from '../../constants/roles.js';
import {
    generateBillSchema,
    updateBillSchema,
    cancelBillSchema,
} from './billing.schema.js';
import {
    generateBill,
    getAllBills,
    getBillById,
    getBillByInvoiceNumber,
    updateBill,
    cancelBill,
    deleteBill,
    getBillSummary,
} from './billing.controller.js';
import {
    getInvoiceJSON,
    getInvoiceByInvoiceNumberJSON,
    getInvoiceHTML,
    downloadInvoiceHTML,
    getPaymentReceipt,
} from './invoice.controller.js';


const router = express.Router();

// All billing routes require a valid JWT
router.use(verifyToken);

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY  — must be before /:id to avoid route clash
// GET /api/billing/summary?fromDate=&toDate=
// ─────────────────────────────────────────────────────────────────────────────

router.get(
    '/summary',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
    getBillSummary
);

// Invoice by invoice number
router.get(
    '/invoice/:invoiceNumber/json',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT),
    getInvoiceByInvoiceNumberJSON
);

router.get(
    '/invoice/:invoiceNumber/json',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT),
    getInvoiceByInvoiceNumberJSON
);

// Invoice endpoints by bill id
router.get(
    '/:id/invoice',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT),
    getInvoiceHTML
);

router.get(
    '/:id/invoice/json',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT),
    getInvoiceJSON
);

router.get(
    '/:id/invoice/download',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT),
    downloadInvoiceHTML
);

// Receipt by payment id
router.get(
    '/receipt/:paymentId',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT),
    getPaymentReceipt
);

// Bill list / create
router.get(
    '/',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR),
    getAllBills
);

// POST /api/billing
router.post(
    '/',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
    validate(generateBillSchema),
    generateBill
);

// SINGLE BILL
router.get(
    '/:id',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT),
    getBillById
);

// PUT /api/billing/:id
router.put(
    '/:id',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
    validate(updateBillSchema),
    updateBill
);

// DELETE /api/billing/:id  (Admin only — UNPAID/CANCELLED bills only)
router.delete(
    '/:id',
    authorize(ROLES.ADMIN),
    deleteBill
);

// BILL ACTIONS
router.patch(
    '/:id/cancel',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
    validate(cancelBillSchema),
    cancelBill
);

export default router;