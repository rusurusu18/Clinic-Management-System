import 'dotenv/config';
import prisma from '../src/config/database.js';
import { hashPassword } from '../src/utils/hash.js';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@medicare.local').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '+9779800000000';
const ADMIN_NAME = process.env.ADMIN_NAME || 'System Administrator';

const DEPARTMENTS = [
  {
    name: 'Cardiology',
    description: 'Diagnosis and treatment of heart and cardiovascular conditions.',
    hospital: 'MediCare Hospital',
    location: 'First floor',
  },
  {
    name: 'Neurology',
    description: 'Care for the brain, spine, nerves, and related conditions.',
    hospital: 'MediCare Hospital',
    location: 'First floor',
  },
  {
    name: 'Dermatology',
    description: 'Medical and surgical care for skin, hair, and nail conditions.',
    hospital: 'MediCare Hospital',
    location: 'Second floor',
  },
  {
    name: 'General Medicine',
    description: 'Primary care, preventive medicine, and general adult health services.',
    hospital: 'MediCare Hospital',
    location: 'Ground floor',
  },
  {
    name: 'Pediatrics',
    description: 'Healthcare for infants, children, and adolescents.',
    hospital: 'MediCare Hospital',
    location: 'Ground floor',
  },
];

const DOCTORS = [
  {
    email: 'sarah.sharma@medicare.local',
    fullName: 'Dr. Sarah Sharma',
    phone: '+9779800000011',
    specialization: 'Cardiology',
    licenseNumber: 'DOC-CARD-001',
    department: 'Cardiology',
    experience: 12,
    consultationFee: 1500,
    bio: 'Cardiologist focused on preventive heart care and cardiovascular wellness.',
  },
  {
    email: 'arjun.thapa@medicare.local',
    fullName: 'Dr. Arjun Thapa',
    phone: '+9779800000012',
    specialization: 'Neurology',
    licenseNumber: 'DOC-NEUR-001',
    department: 'Neurology',
    experience: 10,
    consultationFee: 1400,
    bio: 'Neurologist providing evidence-based care for brain, spine, and nerve conditions.',
  },
  {
    email: 'maya.gurung@medicare.local',
    fullName: 'Dr. Maya Gurung',
    phone: '+9779800000013',
    specialization: 'Dermatology',
    licenseNumber: 'DOC-DERM-001',
    department: 'Dermatology',
    experience: 8,
    consultationFee: 1200,
    bio: 'Dermatologist specializing in medical, surgical, and cosmetic skin care.',
  },
  {
    email: 'binod.adhikari@medicare.local',
    fullName: 'Dr. Binod Adhikari',
    phone: '+9779800000014',
    specialization: 'General Medicine',
    licenseNumber: 'DOC-GEN-001',
    department: 'General Medicine',
    experience: 15,
    consultationFee: 1000,
    bio: 'General physician delivering comprehensive primary and preventive care.',
  },
  {
    email: 'nisha.karki@medicare.local',
    fullName: 'Dr. Nisha Karki',
    phone: '+9779800000015',
    specialization: 'Pediatrics',
    licenseNumber: 'DOC-PED-001',
    department: 'Pediatrics',
    experience: 9,
    consultationFee: 1100,
    bio: 'Pediatrician providing compassionate care for infants, children, and adolescents.',
  },
];

async function seedAdmin() {
  const hashedPassword = await hashPassword(ADMIN_PASSWORD);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      fullName: ADMIN_NAME,
      phone: ADMIN_PHONE,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
    },
    create: {
      fullName: ADMIN_NAME,
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
    },
  });

  console.log(`Seeded admin login: ${admin.email}`);
}

async function seedDepartments() {
  for (const department of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { name: department.name },
      update: department,
      create: department,
    });
  }

  console.log(`Seeded departments: ${DEPARTMENTS.map(({ name }) => name).join(', ')}`);
}

async function seedDoctors() {
  const password = await hashPassword(process.env.DOCTOR_PASSWORD || 'Doctor@12345');

  for (const doctorData of DOCTORS) {
    const department = await prisma.department.findUnique({
      where: { name: doctorData.department },
    });

    const user = await prisma.user.upsert({
      where: { email: doctorData.email },
      update: {
        fullName: doctorData.fullName,
        phone: doctorData.phone,
        password,
        role: 'DOCTOR',
        isActive: true,
        isEmailVerified: true,
      },
      create: {
        fullName: doctorData.fullName,
        email: doctorData.email,
        phone: doctorData.phone,
        password,
        role: 'DOCTOR',
        isActive: true,
        isEmailVerified: true,
      },
    });

    await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {
        departmentId: department?.id,
        specialization: doctorData.specialization,
        licenseNumber: doctorData.licenseNumber,
        experience: doctorData.experience,
        consultationFee: doctorData.consultationFee,
        bio: doctorData.bio,
        qualifications: ['MBBS', 'MD'],
        availableDays: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '17:00' },
        ],
      },
      create: {
        userId: user.id,
        departmentId: department?.id,
        specialization: doctorData.specialization,
        licenseNumber: doctorData.licenseNumber,
        experience: doctorData.experience,
        consultationFee: doctorData.consultationFee,
        bio: doctorData.bio,
        qualifications: ['MBBS', 'MD'],
        availableDays: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '17:00' },
        ],
      },
    });
  }

  console.log(`Seeded doctors: ${DOCTORS.map(({ fullName }) => fullName).join(', ')}`);
}

async function main() {
  await seedAdmin();
  await seedDepartments();
  await seedDoctors();
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });