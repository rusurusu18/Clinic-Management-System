import { EsewaClient } from "esewa-pay";
import { ENV } from "./env.js";

export const esewa = new EsewaClient({
	secretKey: ENV.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q",
	productCode: ENV.ESEWA_PRODUCT_CODE || "EPAYTEST",
	successUrl: ENV.ESEWA_SUCCESS_URL || `${ENV.FRONTEND_URL}/api/payments/esewa/success`,
	failureUrl: ENV.ESEWA_FAILURE_URL || `${ENV.FRONTEND_URL}/api/payments/esewa/failure`,
	env: ENV.ESEWA_ENVIRONMENT,
});

export default esewa;
