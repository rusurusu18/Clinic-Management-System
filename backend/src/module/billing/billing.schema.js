import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: single bill line-item
// ─────────────────────────────────────────────────────────────────────────────

const billItemSchema = z.object({
    description: z.string().min(1, "Item description is required"),
    quantity: z
        .number({ invalid_type_error: "Quantity must be a number" })
        .int("Quantity must be a whole number")
        .min(1, "Quantity must be at least 1"),
    unitPrice: z
        .number({ invalid_type_error: "Unit price must be a number" })
        .positive("Unit price must be greater than 0"),
    discount: z.number().min(0, "Item discount cannot be negative").default(0),
    total: z
        .number({ invalid_type_error: "Total must be a number" })
        .positive("Item total must be greater than 0"),
});

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE BILL
// ─────────────────────────────────────────────────────────────────────────────

export const generateBillSchema = z.object({
    patientId: z
        .string({ required_error: "Patient ID is required" })
        .min(1, "Patient ID is required"),
    appointmentId: z.string().optional(),
    items: z.array(billItemSchema).min(1, "At least one billing item is required"),
    tax:      z.number().min(0, "Tax cannot be negative").default(0),
    discount: z.number().min(0, "Discount cannot be negative").default(0),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
    generatedBy: z
        .string({ required_error: "generatedBy (user ID) is required" })
        .min(1, "generatedBy is required"),
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE BILL
// ─────────────────────────────────────────────────────────────────────────────

export const updateBillSchema = z
    .object({
        items:    z.array(billItemSchema).optional(),
        tax:      z.number().min(0, "Tax cannot be negative").optional(),
        discount: z.number().min(0, "Discount cannot be negative").optional(),
        status: z
            .enum(["UNPAID", "PAID", "PARTIALLY_PAID", "CANCELLED", "REFUNDED"])
            .optional(),
        notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
    })
    .strict();

// ─────────────────────────────────────────────────────────────────────────────
// CANCEL BILL
// ─────────────────────────────────────────────────────────────────────────────

export const cancelBillSchema = z.object({
    reason: z
        .string({ required_error: "Cancellation reason is required" })
        .min(1, "Cancellation reason is required")
        .max(500, "Reason cannot exceed 500 characters"),
});

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL BILLS QUERY
// ─────────────────────────────────────────────────────────────────────────────

export const getBillsQuerySchema = z.object({
    page:      z.string().optional().transform((v) => (v ? Number(v) : 1)).default("1"),
    limit:     z.string().optional().transform((v) => (v ? Number(v) : 10)).default("10"),
    patientId: z.string().optional(),
    status: z
        .enum(["UNPAID", "PAID", "PARTIALLY_PAID", "CANCELLED", "REFUNDED"])
        .optional(),
    fromDate: z.string().datetime({ offset: true }).optional(),
    toDate:   z.string().datetime({ offset: true }).optional(),
    search:   z.string().optional(),
});