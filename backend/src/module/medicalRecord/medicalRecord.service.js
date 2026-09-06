import prisma from '../../config/database.js';
import { deleteFromCloudinaryFn, uploadToCloudinarySingle } from '../../config/multer.js';

const recordInclude = {
  patient: { include: { user: { select: { id: true, fullName: true, email: true, phone: true } } } },
  doctor: { include: { user: { select: { id: true, fullName: true, email: true, phone: true } } } },
  appointment: true,
  prescriptions: true,
  reports: true,
};

const toDate = (value) => (value ? new Date(value) : undefined);

export const createMedicalRecord = async (data) => {
  const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
  if (!patient) throw new Error('patient not found');
  const doctor = await prisma.doctor.findUnique({ where: { id: data.doctorId } });
  if (!doctor) throw new Error('doctor not found');

  return prisma.medicalRecord.create({
    data: {
      patientId: data.patientId,
      doctorId: data.doctorId,
      appointmentId: data.appointmentId || undefined,
      diagnosis: data.diagnosis,
      diagnosisDate: toDate(data.diagnosisDate),
      symptoms: data.symptoms || [],
      notes: data.notes,
    },
    include: recordInclude,
  });
};

export const getMedicalRecordById = async (id) => {
  const record = await prisma.medicalRecord.findUnique({ where: { id }, include: recordInclude });
  if (!record) throw new Error('medical record not found');
  return record;
};

export const getAllMedicalRecords = async (page = 1, limit = 10, filters = {}) => {
  const skip = (page - 1) * limit;
  const where = {};
  if (filters.patientId) where.patientId = filters.patientId;
  if (filters.doctorId) where.doctorId = filters.doctorId;
  if (filters.fromDate || filters.toDate) {
    where.createdAt = {
      ...(filters.fromDate ? { gte: new Date(filters.fromDate) } : {}),
      ...(filters.toDate ? { lte: new Date(filters.toDate) } : {}),
    };
  }
  if (filters.search) {
    where.OR = [
      { diagnosis: { contains: filters.search } },
      { notes: { contains: filters.search } },
      { patient: { user: { fullName: { contains: filters.search } } } },
      { doctor: { user: { fullName: { contains: filters.search } } } },
    ];
  }

  const [records, total] = await Promise.all([
    prisma.medicalRecord.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' }, include: recordInclude }),
    prisma.medicalRecord.count({ where }),
  ]);
  return { records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const updateMedicalRecordById = async (id, data) => {
  await getMedicalRecordById(id);
  return prisma.medicalRecord.update({
    where: { id },
    data: {
      diagnosis: data.diagnosis,
      diagnosisDate: toDate(data.diagnosisDate),
      symptoms: data.symptoms,
      notes: data.notes,
    },
    include: recordInclude,
  });
};

export const deleteMedicalRecordById = async (id) => {
  await getMedicalRecordById(id);
  await prisma.medicalRecord.delete({ where: { id } });
};

export const createPrescription = async (data) => {
  const record = await prisma.medicalRecord.findUnique({ where: { id: data.medicalRecordId } });
  if (!record) throw new Error('medical record not found');
  return prisma.prescription.create({
    data: { ...data, expiryDate: toDate(data.expiryDate) },
    include: { medicalRecord: true },
  });
};

export const getPrescriptionById = async (id) => {
  const prescription = await prisma.prescription.findUnique({ where: { id }, include: { medicalRecord: true } });
  if (!prescription) throw new Error('prescription not found');
  return prescription;
};

export const updatePrescription = async (id, data) => {
  await getPrescriptionById(id);
  return prisma.prescription.update({
    where: { id },
    data: { ...data, expiryDate: toDate(data.expiryDate) },
    include: { medicalRecord: true },
  });
};

export const prescriptiondelete = async (id) => {
  await getPrescriptionById(id);
  await prisma.prescription.delete({ where: { id } });
  return { message: 'Prescription deleted successfully' };
};

export const createReport = async (data, file = null) => {
  const record = await prisma.medicalRecord.findUnique({ where: { id: data.medicalRecordId } });
  if (!record) throw new Error('medical record not found');
  const uploadedFile = file ? await uploadToCloudinarySingle(file, 'healthcare/medical-reports') : null;
  return prisma.report.create({
    data: {
      ...data,
      date: toDate(data.date),
      fileUrl: uploadedFile?.url || data.fileUrl,
    },
    include: { medicalRecord: true },
  });
};

export const getReportById = async (id) => {
  const report = await prisma.report.findUnique({ where: { id }, include: { medicalRecord: true } });
  if (!report) throw new Error('Report not found');
  return report;
};

export const updateReport = async (id, data, file = null) => {
  const existingReport = await getReportById(id);
  let fileUrl = data.fileUrl;
  if (file) {
    const uploadedFile = await uploadToCloudinarySingle(file, 'healthcare/medical-reports');
    fileUrl = uploadedFile.url;
    if (existingReport.fileUrl?.includes('cloudinary.com')) await deleteFromCloudinaryFn(existingReport.fileUrl);
  }
  return prisma.report.update({
    where: { id },
    data: { ...data, date: toDate(data.date), ...(fileUrl !== undefined ? { fileUrl } : {}) },
    include: { medicalRecord: true },
  });
};

export const deleteReport = async (id) => {
  const report = await getReportById(id);
  if (report.fileUrl?.includes('cloudinary.com')) await deleteFromCloudinaryFn(report.fileUrl);
  await prisma.report.delete({ where: { id } });
  return { message: 'Report deleted successfully' };
};

export const getPatientMedicalHistory = async (patientId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const where = { patientId };
  const [records, total] = await Promise.all([
    prisma.medicalRecord.findMany({ where, skip, take: Number(limit), orderBy: { diagnosisDate: 'desc' }, include: recordInclude }),
    prisma.medicalRecord.count({ where }),
  ]);
  return { records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};