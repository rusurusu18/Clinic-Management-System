# 🏥 MediCare — Clinic Management System

> A modern full-stack **Clinic Management System** built for clinics in Nepal, providing digital management of patients, doctors, appointments, medical records, billing, payments, and role-based clinic operations.

---

<p align="center">
  <strong>🩺 Manage Patients • 👨‍⚕️ Manage Doctors • 📅 Book Appointments • 📋 Medical Records • 💳 Billing • 🇳🇵 Nepal Payments</strong>
</p>

<p align="center">
  Built with the MERN-style modern JavaScript ecosystem, Prisma, MySQL, and real-time communication.
</p>

---

## 📖 About the Project

**MediCare** is a full-stack clinic management platform designed to simplify and digitize everyday clinic operations.

The system provides separate experiences for:

- 👑 Administrators
- 👨‍⚕️ Doctors
- 🧑‍💼 Receptionists / Staff
- 🧑‍🦽 Patients

It combines a public-facing clinic website with authenticated dashboards and backend APIs for managing the complete clinic workflow.

### 🎯 Main Goals

- Digitize clinic operations
- Reduce manual patient and appointment management
- Provide role-based access to clinic resources
- Maintain organized patient medical records
- Simplify billing and invoice management
- Support digital payments in Nepal
- Provide real-time appointment and queue updates
- Provide a responsive and user-friendly interface

---

# ✨ Key Features

## 🌐 Public Website

- 🏠 Home page
- ℹ️ About page
- 📞 Contact page
- 🩺 Services
- 👨‍⚕️ Doctor directory
- 🏥 Department listing
- 👨‍⚕️ Doctor details
- 🏥 Department details
- 📅 Appointment entry points
- 🌙 Light / Dark theme
- 📱 Responsive design

---

## 🔐 Authentication & Authorization

MediCare provides secure authentication and role-based authorization.

### Authentication Features

- Patient registration
- Doctor registration
- Email OTP verification
- Login
- JWT access tokens
- Refresh tokens
- HTTP-only cookies
- Automatic Axios token refresh
- Password reset
- Profile management
- Admin OTP login
- Server-side role authorization

### Authentication Flow

```text
Register
   ↓
Email Verification
   ↓
Login
   ↓
Access Token + Refresh Token
   ↓
Role-Based Dashboard
