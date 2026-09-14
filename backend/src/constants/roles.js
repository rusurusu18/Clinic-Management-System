export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  RECEPTIONIST: 'RECEPTIONIST',
  STAFF: 'RECEPTIONIST',
  PATIENT: 'PATIENT',
};

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 4,
  [ROLES.DOCTOR]: 3,
  [ROLES.RECEPTIONIST]: 2,
  [ROLES.STAFF]: 2,
  [ROLES.PATIENT]: 1,
};

export const ROLE_PERMISSIONS = {
  ADMIN: ['*'],
  DOCTOR: ['view_patients', 'manage_appointments', 'view_medical_records'],
  RECEPTIONIST: ['manage_appointments', 'view_patients', 'manage_schedule'],
  STAFF: ['manage_appointments', 'view_patients', 'manage_schedule'],
  PATIENT: ['view_profile', 'manage_appointments', 'view_medical_records'],
};