export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  STAFF: 'STAFF',
  PATIENT: 'PATIENT',
};

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 4,
  [ROLES.DOCTOR]: 3,
  [ROLES.STAFF]: 2,
  [ROLES.PATIENT]: 1,
};

export const ROLE_PERMISSIONS = {
    ADMIN: ['*'],
    DOCTOR: ['view_patients', 'manage_appointments', 'view_medical_records'],
    PATIENT: ['view_profile', 'manage_appointments', 'view_medical_records'],
    RECEPTIONIST: ['manage_appointments', 'view_patients', 'manage_schedule'],
};