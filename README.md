Clinic Management System
MediCare is a full-stack clinic management system for clinics in Nepal. It provides public clinic pages, patient and doctor accounts, appointment management, medical records, billing, invoices, Nepali payment gateways, real-time events, and role-based dashboards.

Current Stack
Frontend: React 19, Vite, Tailwind CSS, React Router, Redux Toolkit, Axios, Lucide icons
Backend: Node.js, Express 5, Socket.IO, Zod, Multer, Helmet, CORS
Database: MySQL with Prisma ORM and Prisma Migrate
Authentication: JWT access tokens, refresh tokens, HTTP-only cookies, email OTP verification, bcrypt
File storage: Cloudinary when available; local backend/uploads fallback in development
Payments: eSewa and Khalti integration
Currency: NPR
Repository Structure
CMSINTERN/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   ├── generated/prisma/       # Generated Prisma client artifacts
│   ├── src/
│   │   ├── app.js              # Express middleware and API setup
│   │   ├── server.js           # HTTP and Socket.IO server startup
│   │   ├── config/              # Database, env, payments, uploads, sockets
│   │   ├── constans/            # Roles, messages, status codes
│   │   ├── middleware/          # Auth, validation, security, upload handling
│   │   ├── module/              # Business modules and route handlers
│   │   ├── routes/index.js      # /api route registration
│   │   └── utils/               # JWT, hashing, OTP, email, responses
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx and main.jsx
│   │   ├── Routes/              # Application router and protected routes
│   │   ├── pages/               # Public pages and role dashboards
│   │   ├── components/          # Layout, sections, doctors, patients, UI
│   │   ├── services/            # Axios API clients
│   │   ├── Redux/               # Store and auth/patient state
│   │   ├── contexts/            # Theme, department, and doctor contexts
│   │   ├── hooks/               # Reusable React hooks
│   │   └── utils/               # Axios instance and shared constants
│   ├── public/
│   ├── index.html
│   └── package.json
├── projectoutline.md            # Product requirements and original scope
└── README.md
Backend Modules
Module	Purpose	Base path
Auth	Registration, login, email OTP, refresh, logout, password reset, profiles	/api/auth
Admin	Admin users, user status, roles, audit logs	/api/admin
Staff	Admin-managed doctor and receptionist accounts	/api/staff
Patient	Patient profiles, documents, search, statistics	/api/patient
Doctor	Public doctor directory, doctor profile, onboarding, availability	/api/doctor
Department	Public department listing and admin CRUD	/api/department
Appointment	Booking, listing, updating, rescheduling, cancellation	/api/appointment
Medical records	Diagnoses, prescriptions, reports, patient history	/api/medical-record
Billing	Bills, totals, statuses, cancellation, summaries	/api/billing
Payments	Payment records and receipts	/api/payments
eSewa	eSewa configuration, checkout, callbacks	/api/esewa
Khalti	Khalti configuration, checkout, callbacks	/api/khalti
Dashboard	Admin, doctor, staff, and operational statistics	/api/dashboard
Main Features
Public Website
Home, about, contact, services, doctors, and department pages
Doctor details and appointment entry points
Department search and detail pages
Responsive layout with light/dark theme support
Authentication
Patient and doctor self-registration
Email OTP verification flow: register -> verify email -> login
Doctor-only professional onboarding after login
Admin login with OTP
JWT access and refresh tokens
Automatic Axios token refresh
Password reset and profile management
Server-side role authorization
Doctor Onboarding
Doctors can submit:

Specialty
Medical license number
Qualifications
Experience
Hospital and department
Consultation fee
Professional bio
Profile image
Certificates and license files
The onboarding endpoint is POST /api/doctor/onboarding. It requires a logged-in doctor. Active departments are loaded into the form so the API submits a valid departmentId relation.

Appointments
Book appointments
Prevent doctor and patient time conflicts
List appointments with filters and pagination
Update or reschedule appointments
Cancel appointments with a reason
Appointment status tracking: scheduled, confirmed, completed, cancelled, rescheduled, and no-show
Socket.IO events for new bookings, status changes, slot changes, and queue updates
Medical Records
Create, read, update, and delete medical records
Diagnosis and clinical notes
Prescription CRUD
Report CRUD with optional file uploads
Patient medical history
Doctor records page with search, filters, record details, prescriptions, reports, and delete actions
Billing and Invoices
Generate itemized bills
Update unpaid bills
Recalculate subtotal, tax, discount, and total
Bill status management
Cancel and delete bills according to role rules
Invoice lookup by ID or invoice number
Invoice JSON, HTML, download, and payment receipt endpoints
Role Dashboards
Admin: overview, doctors, departments, staff, reports, settings
Doctor: overview, appointments, patients, medical records, settings, onboarding
Staff/receptionist: overview, appointments, patients, queue, billing, settings
Patient: appointments and medical history
Frontend Routes
Public
/
/doctors
/doctors/:id
/departments
/departments/:id
/services
/services/:serviceId
/about
/contact
/book
Authentication
/login
/register
/verify-email
/forgot-password
/reset-password
Admin
/admin
/admin/doctors
/admin/departments
/admin/staff
/admin/reports
/admin/settings
Doctor
/doctor
/doctor/onboarding
/doctor/appointments
/doctor/patients
/doctor/records
/doctor/settings
Staff and Patient
/staff
/staff/appointments
/staff/patients
/staff/queue
/staff/billing
/staff/settings
/patient
/patient/history
Database Models
The Prisma schema currently includes:

User
Patient
Doctor
Department
Appointment
MedicalRecord
Prescription
Report
Bill
Payment
ChatMessage
Notification
RefreshToken
Session
OTP
AuditLog
Important constraints include unique user email, unique user-to-doctor and user-to-patient relationships, unique department names, unique doctor license numbers, and unique invoice/bill numbers.

Requirements
Node.js 18 or newer
MySQL 8 or compatible MySQL server
npm
Cloudinary account for production file uploads
SMTP account for email OTPs
Optional eSewa and Khalti sandbox credentials
Setup
1. Install dependencies
cd backend
npm install

cd ../frontend
npm install
2. Configure backend environment
Create or update backend/.env:

DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/cmss"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

JWT_ACCESS_SECRET=replace-with-a-long-secret
JWT_REFRESH_SECRET=replace-with-a-different-long-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@medicare.local
ADMIN_PASSWORD=Admin@12345
ADMIN_PHONE=+9779800000000

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
Use the existing eSewa, Khalti, and email variables in backend/.env when those integrations are enabled. Never commit real secrets.

3. Apply migrations and generate Prisma Client
cd backend
npx prisma migrate dev
npx prisma generate
4. Seed development data
cd backend
npm run seed
The seed is safe to run repeatedly. It creates or updates the development admin and seeds:

Cardiology
Neurology
Dermatology
General Medicine
Pediatrics
Development admin login:

Email: admin@medicare.local
Password: Admin@12345
Admin login uses an OTP flow after the password step.

5. Start the applications
Terminal 1:

cd backend
npm run dev
Backend: http://localhost:5000

Terminal 2:

cd frontend
npm run dev
Frontend: http://localhost:5173

Run only one backend process on port 5000. Starting npm run main and npm run dev together causes EADDRINUSE.

Useful Commands
Backend
npm run dev       # Start Nodemon development server
npm run main      # Start one production-style Node process
npm run seed      # Seed admin and departments
npx prisma studio # Open Prisma database browser
npx prisma migrate dev
npx prisma validate
Frontend
npm run dev       # Start Vite development server
npm run build     # Create production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
File Uploads
Cloudinary is the production storage provider. In development, if Cloudinary rejects an upload, the backend stores the file under backend/uploads and serves it from /uploads/.... This fallback is intentionally disabled in production.

Accepted doctor certificate formats include images and common documents. Upload limits are configured in backend/src/config/multer.js and are currently up to 10 MB per file for certificate/document uploads.

API Conventions
API base URL: http://localhost:5000/api
Success responses use { success, message, data }.
Authenticated requests use the Authorization: Bearer <accessToken> header and HTTP-only cookies.
Pagination responses use { records-or-items, pagination }.
Validation is handled with Zod and returns structured validation errors.
Protected endpoints require a valid access token and role authorization.
Example health check:

curl http://localhost:5000/api/health
Security Notes
Keep .env files out of source control.
Rotate any credentials that have been shared or exposed.
Use long, unique JWT secrets outside local development.
Set COOKIE_SECURE=true behind HTTPS in production.
Replace development local upload fallback with working Cloudinary credentials before production.
Do not trust payment redirect parameters without server-side gateway verification.
Current Validation
The project has been validated during development with:

Frontend Vite production builds
Backend Node syntax checks
Prisma schema validation and migrations
Live health, department, registration, and authentication endpoint checks
The backend package currently does not define an automated test script; add API integration tests before production release.
