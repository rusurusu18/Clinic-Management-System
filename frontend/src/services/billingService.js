import axios from '../utils/axios.js';

const API_URL = '/billing';

const unwrap = (response) => response.data.data;

export const getBills = async (params = {}) => unwrap(await axios.get(API_URL, { params }));
export const getBill = async (id) => unwrap(await axios.get(`${API_URL}/${id}`));
export const generateBill = async (data) => unwrap(await axios.post(API_URL, data));
export const updateBill = async (id, data) => unwrap(await axios.put(`${API_URL}/${id}`, data));
export const cancelBill = async (id, reason) => unwrap(await axios.patch(`${API_URL}/${id}/cancel`, { reason }));
export const getInvoice = async (id) => unwrap(await axios.get(`${API_URL}/${id}/invoice/json`));
export const getInvoiceByNumber = async (invoiceNumber) => unwrap(await axios.get(`${API_URL}/invoice/${invoiceNumber}/json`));
export const getInvoiceDownloadUrl = (id) => `${API_URL}/${id}/invoice/download`;