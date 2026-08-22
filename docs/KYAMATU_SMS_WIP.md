# MATUNDU PRIMARY SCHOOL MANAGEMENT SYSTEM
## WORK IN PROGRESS DOCUMENT

**Project:** Matundu Primary School Management System (MATUNDU-SMS)  
**Status:** 🟡 In Active Development  
**Document Type:** Work In Progress (WIP)  
**Version:** 1.0  
**Last Updated:** August 3, 2026  
**Repository:** MuthamiM/MATUNDU-SMS  

---

## TABLE OF CONTENTS

1. Project Overview
2. Technology Stack
3. Project Structure
4. Database Schema Summary
5. Backend Architecture
6. Frontend Architecture
7. Feature Modules — Status
8. API Endpoints Inventory
9. Deployment Configuration
10. Known Issues & Blockers
11. Pending Features
12. Development Progress Tracker
13. Environment Variables
14. Test Credentials
15. Next Steps

---

## 1. PROJECT OVERVIEW

Matundu Primary School Management System (MATUNDU-SMS) is a **production-grade, full-stack web application** designed to digitize and streamline operations at Matundu Primary School. The system is fully aligned with **Kenya's Competency-Based Curriculum (CBC)** and handles the entire lifecycle of school operations — from student admissions through to report card generation and fee collection.

### Mission
To provide a centralized, role-aware platform accessible by administrators, teachers, bursars, parents, and students — reducing manual paperwork and improving transparency in school operations.

### Core Goals
- Digitize student records from admission to graduation
- Automate CBC-aligned assessment tracking and report generation
- Streamline fee invoicing and M-Pesa payment collection
- Enable real-time communication between school stakeholders
- Provide AI-assisted support for students via an embedded chat assistant
- Support third-party integrations (Google Calendar, Microsoft Tasks)

---

## 2. TECHNOLOGY STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 18.3.1 |
| Frontend Bundler | Vite | 7.3.1 |
| Frontend Styling | Tailwind CSS | 3.4.15 |
| Frontend State | Zustand | 5.0.1 |
| Frontend Charts | Recharts | 2.13.3 |
| Frontend Icons | Lucide React | 0.460.0 |
| PDF Generation (FE) | jsPDF + AutoTable | 4.1.0 / 5.0.7 |
| Form Handling | React Hook Form | 7.53.2 |
| HTTP Client | Axios | 1.7.7 |
| Router | React Router DOM | 6.28.0 |
| Backend Runtime | Node.js | 20+ |
| Backend Framework | Express.js | 4.21.1 |
| ORM | Prisma | 5.22.0 |
| Database | PostgreSQL | 15+ |
| Cache / Rate Limit | Redis | 5.10.0 |
| Authentication | JWT + bcrypt | — |
| PDF Generation (BE) | PDFKit | 0.15.0 |
| Logging | Winston | 3.15.0 |
| API Docs | Swagger (jsdoc) | 6.2.8 |
| Security | Helmet | 8.0.0 |
| File Uploads | Multer | 1.4.5-lts.1 |
| Integrations | Google APIs, MS Graph | — |
| Containerization | Docker + Docker Compose | — |
| Deployment | Render (backend), Cloudflare Pages (frontend) | — |

---

## 3. PROJECT STRUCTURE

```
matundu-sms/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Express app entry point
│   │   ├── config/                 # DB, Redis, environment config
│   │   ├── middleware/             # Auth, RBAC, validation, audit log, sanitize
│   │   ├── utils/                  # Helpers and error utilities
│   │   └── features/               # Feature-based modules
│   │       ├── academic/           # Grades, classes, subjects, timetable, outlines, resources
│   │       ├── ai/                 # AI chat assistant
│   │       ├── assessments/        # CATs, exams, scoring
│   │       ├── attendance/         # Daily attendance + QR code check-in
│   │       ├── auth/               # Login, register, JWT refresh, profile
│   │       ├── communication/      # Announcements, messaging
│   │       ├── dashboard/          # Dashboard metrics and stats
│   │       ├── fees/               # Fee structures, invoices, payments, M-Pesa
│   │       ├── integrations/       # Google Calendar, Microsoft Tasks
│   │       ├── reminders/          # Student reminders
│   │       ├── reports/            # Report cards, class rankings
│   │       ├── staff/              # Staff management
│   │       └── students/           # Student management + admissions
│   ├── prisma/
│   │   ├── schema.prisma           # Full database schema (594 lines)
│   │   ├── seed.js                 # Database seeding script
│   │   └── migrations/             # Prisma migration history
│   ├── scripts/                    # Utility scripts
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Root app with routing
│   │   ├── main.jsx                # React entry point
│   │   ├── index.css               # Global styles
│   │   ├── assets/                 # Static assets
│   │   ├── components/
│   │   │   ├── Layout.jsx          # App shell / sidebar layout
│   │   │   ├── common/             # Shared reusable components
│   │   │   └── dashboard/          # Dashboard-specific widgets
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx       # 40KB — main analytics hub
│   │   │   ├── Students.jsx
│   │   │   ├── StudentDetail.jsx
│   │   │   ├── Staff.jsx
│   │   │   ├── Classes.jsx
│   │   │   ├── Assessments.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── Fees.jsx
│   │   │   ├── Reports.jsx         # 50KB — most complex page
│   │   │   ├── Timetable.jsx
│   │   │   ├── Announcements.jsx
│   │   │   ├── Admissions.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── SystemStatus.jsx
│   │   ├── services/               # API layer (Axios)
│   │   ├── stores/                 # Zustand global stores
│   │   └── utils/                  # Helper functions
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── wrangler.toml               # Cloudflare Pages config
│
├── docs/                           # Project documentation
├── backups/                        # DB backups
├── docker-compose.yml              # Full stack local dev
├── render.yaml                     # Render deployment config
└── README.md
```

---

## 4. DATABASE SCHEMA SUMMARY

The Prisma schema defines **24 models** across all functional domains.

### Core Models

| Model | Description |
|-------|-------------|
| `User` | Base auth entity — email, phone, password, role |
| `RefreshToken` | JWT refresh token store |
| `Student` | Admission number, class, guardian links, prefect role |
| `Staff` | Employee number, qualification, specialization |
| `Guardian` | Parent/guardian linked to students |
| `StudentGuardian` | Many-to-many: Student ↔ Guardian |

### Academic Models

| Model | Description |
|-------|-------------|
| `AcademicYear` | Year with start/end dates, isCurrent flag |
| `Term` | Term 1/2/3 within an academic year |
| `Grade` | CBC grades: PP1, PP2, Grade 1–9 |
| `Stream` | Class streams (A, B, etc.) |
| `Class` | Grade + Stream + AcademicYear combination |
| `Subject` | Subject with code, linked to Grade |
| `ClassSubject` | Many-to-many: Class ↔ Subject |
| `TeacherAssignment` | Staff → Class → Subject mapping |
| `TimetableSlot` | Day, time, class, subject, teacher |
| `CourseOutline` | JSON-based weekly course plan per subject/class/term |
| `CourseResource` | Uploaded files/links per subject (PDF, DOCX, LINK) |

### Assessment Models

| Model | Description |
|-------|-------------|
| `Assessment` | CAT, Exam, Assignment with maxScore and weight |
| `AssessmentScore` | Student score per assessment |
| `Competency` | CBC competency linked to subject |
| `CompetencyScore` | EE / ME / AE / BE rating per student |
| `ReportCard` | Term report with rank, average, teacher/principal comments |

### Fee Models

| Model | Description |
|-------|-------------|
| `FeeStructure` | Fee amounts per grade per term |
| `StudentInvoice` | Invoice per student per term with balance |
| `InvoiceItem` | Line items on an invoice |
| `Payment` | Payments via Cash, M-Pesa, or Bank Transfer |

### Communication & Other Models

| Model | Description |
|-------|-------------|
| `Announcement` | School-wide announcements with role targeting |
| `Message` | Direct user-to-user messaging |
| `Reminder` | Student reminders with Google/Microsoft integration |
| `AiChatMessage` | AI chat history per student |
| `AuditLog` | Full system audit trail with old/new values |

### Enums

| Enum | Values |
|------|--------|
| `Role` | SUPER_ADMIN, ADMIN, TEACHER, STUDENT, PARENT, BURSAR |
| `AdmissionStatus` | PENDING, APPROVED, REJECTED |
| `AttendanceStatus` | PRESENT, ABSENT, LATE, EXCUSED |
| `CompetencyRating` | EXCEEDING, MEETING, APPROACHING, BELOW |
| `PaymentMethod` | CASH, MPESA, BANK_TRANSFER |
| `PaymentStatus` | PENDING, COMPLETED, FAILED, REFUNDED |

---

## 5. BACKEND ARCHITECTURE

### Entry Point
`backend/src/app.js` — Express application (~32KB) wiring all routes, middleware, and error handlers.

### Middleware Stack

| Middleware | File | Purpose |
|-----------|------|---------|
| Auth | `auth.js` | JWT verification, user extraction |
| RBAC | `rbac.js` | Role-based access control |
| Access Control | `accessControl.js` | Fine-grained resource access |
| Audit Log | `auditLog.js` | Records all mutations to DB |
| Sanitize | `sanitize.js` | Input sanitization |
| Validate | `validate.js` | Express-validator result handler |
| Error Handler | `errorHandler.js` | Global error formatting |
| Request ID | `requestId.js` | Unique request ID injection |

### Feature Module Pattern
Each feature follows a clean MVC pattern:
```
feature/
├── feature.routes.js      # Route definitions + middleware guards
├── feature.controller.js  # Request/Response handling
├── feature.service.js     # Business logic + Prisma queries
└── feature.validator.js   # (where applicable) Input validation rules
```

### Feature Modules

| Module | Files | Notes |
|--------|-------|-------|
| `auth` | 4 files | Login, register, refresh token, profile, password reset |
| `students` | 4 files | CRUD, admissions workflow, guardian linking |
| `staff` | 3 files | Staff CRUD, teacher assignments |
| `academic` | 12 files | Years, terms, grades, classes, subjects, timetable, outlines, resources |
| `assessments` | 3 files | Create assessments, record scores, CBC competencies |
| `attendance` | 5 files | Daily attendance + QR code attendance service |
| `reports` | 3 files | Report cards, class rankings, PDF generation |
| `fees` | 4 files | Fee structures, invoices, payments + M-Pesa STK Push service |
| `communication` | 3 files | Announcements, direct messaging |
| `ai` | 3 files | AI chat assistant service |
| `reminders` | 3 files | Student reminder CRUD |
| `integrations` | 3 files | Google Calendar + Microsoft Tasks integration |
| `dashboard` | — | Dashboard stats aggregation |

---

## 6. FRONTEND ARCHITECTURE

### App Shell
- **`App.jsx`** — React Router v6 route definitions, protected route logic
- **`Layout.jsx`** (10KB) — Sidebar navigation, topbar, responsive shell

### Pages (All Implemented)

| Page | File Size | Role Access | Notes |
|------|-----------|-------------|-------|
| Login | 3.9KB | Public | JWT login form |
| Dashboard | 40.2KB | All roles | Analytics, charts (Recharts), KPI cards |
| Students | 11.9KB | Admin, Teacher | Student list, search, filter |
| StudentDetail | 20.3KB | Admin, Teacher | Full student profile view |
| Staff | 11.8KB | Admin | Staff management |
| Classes | 14.7KB | Admin, Teacher | Class management |
| Assessments | 21.6KB | Teacher | Create/score assessments |
| Attendance | 10.8KB | Teacher | Daily attendance marking |
| Fees | 21.3KB | Bursar, Admin | Invoicing and payments |
| Reports | 50.4KB | Admin, Teacher | Report cards, PDF export |
| Timetable | 22.1KB | Admin, Teacher | Visual timetable grid |
| Announcements | 12.9KB | All | Create and view announcements |
| Admissions | 10.2KB | Admin | Admission approval workflow |
| Settings | 22.7KB | Admin | System configuration |
| Profile | 3.7KB | All | User profile page |
| SystemStatus | 6.7KB | Admin | Backend health monitor |

### State Management (Zustand Stores)
Located in `frontend/src/stores/`

### API Services
Located in `frontend/src/services/` — Axios-based API wrappers per feature module.

---

## 7. FEATURE MODULES — STATUS

| Feature | Backend | Frontend | Notes |
|---------|---------|----------|-------|
| Authentication | ✅ Done | ✅ Done | JWT + refresh tokens |
| Student Management | ✅ Done | ✅ Done | Full CRUD + admissions |
| Staff Management | ✅ Done | ✅ Done | — |
| Academic Structure | ✅ Done | ✅ Done | Grades, classes, subjects |
| Timetable | ✅ Done | ✅ Done | Visual grid |
| Course Outlines | ✅ Done | 🟡 Partial | Backend done; frontend in academic pages |
| Course Resources | ✅ Done | 🟡 Partial | File upload backend done |
| Attendance | ✅ Done | ✅ Done | Daily + QR code modes |
| Assessments | ✅ Done | ✅ Done | CATs, exams, CBC scoring |
| Report Cards | ✅ Done | ✅ Done | PDF export available |
| Fee Management | ✅ Done | ✅ Done | Invoices + payments |
| M-Pesa STK Push | ✅ Done | 🟡 Partial | Backend M-Pesa service ready |
| Announcements | ✅ Done | ✅ Done | Role-targeted |
| Messaging | ✅ Done | 🟡 Partial | Backend done; UI basic |
| AI Chat Assistant | ✅ Done | 🟡 Partial | Backend service ready |
| Reminders | ✅ Done | 🟡 Partial | Linked to Google/MS |
| Google Calendar Integration | ✅ Done | 🟡 Partial | OAuth + event creation |
| Microsoft Tasks Integration | ✅ Done | 🟡 Partial | MS Graph API wired |
| Audit Logging | ✅ Done | — | Backend-only, admin visible |
| Dashboard Analytics | ✅ Done | ✅ Done | KPIs, charts |
| QR Code Attendance | ✅ Done | 🟡 Partial | Backend QR service ready |
| PDF Report Cards | ✅ Done | ✅ Done | PDFKit + jsPDF |
| Role-Based Access | ✅ Done | ✅ Done | 6 roles enforced |
| System Status Page | — | ✅ Done | Monitors API health |
| Flutter Parent App | ❌ Not Started | ❌ Not Started | Future milestone |
| Multi-School Support | ❌ Not Started | ❌ Not Started | Future milestone |
| SMS Notifications | ❌ Not Started | ❌ Not Started | Future milestone |

---

## 8. API ENDPOINTS INVENTORY

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login, get JWT tokens |
| POST | `/refresh` | Refresh access token |
| GET | `/profile` | Get current user profile |
| PATCH | `/profile` | Update profile |
| POST | `/change-password` | Change password |

### Students (`/api/students`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all students (paginated) |
| POST | `/` | Create student + user |
| GET | `/:id` | Get student detail |
| PUT | `/:id` | Update student |
| DELETE | `/:id` | Delete student |
| POST | `/:id/approve` | Approve admission |
| POST | `/:id/reject` | Reject admission |
| POST | `/:id/promote` | Promote to next grade |

### Academic (`/api/academic`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/years` | List academic years |
| POST | `/years` | Create academic year |
| GET | `/terms` | List terms |
| GET | `/grades` | List grades (PP1-Grade 9) |
| GET | `/classes` | List classes |
| POST | `/classes` | Create class |
| GET | `/subjects` | List subjects |
| POST | `/subjects` | Create subject |
| GET | `/timetable` | Get timetable slots |
| POST | `/timetable` | Create timetable slot |

### Assessments (`/api/assessments`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List assessments |
| POST | `/` | Create assessment |
| POST | `/:id/scores` | Record student scores |
| GET | `/competencies` | List CBC competencies |
| POST | `/competencies/scores` | Record competency scores |

### Attendance (`/api/attendance`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Mark attendance |
| GET | `/class/:classId` | Get class attendance |
| GET | `/student/:studentId` | Get student attendance |
| POST | `/qr/generate` | Generate QR code |
| POST | `/qr/scan` | Process QR scan |

### Reports (`/api/reports`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate` | Generate report card |
| GET | `/student/:id` | Get student report cards |
| GET | `/class/:id/rankings` | Get class rankings |
| GET | `/:id/pdf` | Download report card PDF |

### Fees (`/api/fees`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/structures` | List fee structures |
| POST | `/structures` | Create fee structure |
| POST | `/invoices` | Generate invoice |
| GET | `/invoices/:studentId` | Get student invoices |
| POST | `/payments` | Record payment |
| POST | `/mpesa/initiate` | Initiate M-Pesa STK push |
| POST | `/mpesa/callback` | M-Pesa payment callback |

### Communication (`/api/communication`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/announcements` | List announcements |
| POST | `/announcements` | Create announcement |
| GET | `/messages` | Get user messages |
| POST | `/messages` | Send message |

### Staff (`/api/staff`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List staff members |
| POST | `/` | Create staff |
| GET | `/:id` | Get staff detail |
| PUT | `/:id` | Update staff |
| POST | `/:id/assignments` | Assign teacher to class/subject |

### AI (`/api/ai`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Send message to AI assistant |
| GET | `/chat/history` | Get chat history |

### Integrations (`/api/integrations`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/google/auth` | Google OAuth initiation |
| GET | `/google/callback` | Google OAuth callback |
| GET | `/microsoft/auth` | Microsoft OAuth initiation |
| GET | `/microsoft/callback` | Microsoft OAuth callback |

---

## 9. DEPLOYMENT CONFIGURATION

### Backend — Render.com
- **Service:** `matundu-sms-backend` (Web Service, Node)
- **Region:** Oregon (us-west)
- **Build Command:** `npm install && npx prisma generate`
- **Start Command:** `npx prisma migrate deploy && npm start`
- **Database:** PostgreSQL (`matundu-db`, free tier)
- **Cache:** Redis (`matundu-redis`, free tier)
- **Auto-generated secrets:** `JWT_SECRET`, `JWT_REFRESH_SECRET`
- **CORS Origin:** `https://matundu-frontend.pages.dev`
- **Auth Rate Limit:** 15 requests max

### Frontend — Cloudflare Pages
- **Config:** `frontend/wrangler.toml`
- **Build:** `vite build`
- **Target URL:** `https://matundu-frontend.pages.dev`

### Docker (Local Dev)
```bash
docker-compose up -d
# PostgreSQL → port 5432
# Backend API → port 3000
# Frontend → port 5173
```

---

## 10. KNOWN ISSUES & BLOCKERS

| # | Issue | Area | Priority | Status |
|---|-------|------|----------|--------|
| 1 | M-Pesa STK Push not tested in production | Fees | HIGH | 🟡 Pending |
| 2 | AI chat service needs API key configuration | AI | HIGH | 🟡 Pending |
| 3 | Google/Microsoft OAuth redirect URIs need updating for prod | Integrations | HIGH | 🟡 Pending |
| 4 | QR Code attendance frontend UI incomplete | Attendance | MEDIUM | 🟡 In Progress |
| 5 | Course Resources file upload needs cloud storage (R2/S3) | Academic | MEDIUM | 🟡 Pending |
| 6 | Timetable.jsx_snippet file — leftover debug artifact | Frontend | LOW | 🔴 Cleanup Needed |
| 7 | PDF report card layout needs design polish | Reports | LOW | 🟡 Pending |
| 8 | SMS notifications not implemented | Communication | LOW | ❌ Not Started |
| 9 | Redis rate limiting needs validation in prod | Security | MEDIUM | 🟡 Pending |
| 10 | No automated test coverage (vitest configured but no tests written) | Testing | HIGH | ❌ Not Started |

---

## 11. PENDING FEATURES (README Future Enhancements)

| Feature | Priority | Notes |
|---------|----------|-------|
| Flutter Parent App | HIGH | Mobile app for parents to track fees, attendance, report cards |
| PDF Report Card — Polish | HIGH | Improve layout and branding |
| M-Pesa STK Push — End-to-end | HIGH | Needs sandbox testing |
| SMS/Email Notifications | MEDIUM | On fee due dates, attendance alerts |
| Timetable Auto-Generator | MEDIUM | Algorithm to auto-schedule lessons |
| Multi-School Support | LOW | Tenant model for multiple schools |
| Student Self-Service Portal | MEDIUM | Students view own records |
| Parent Portal | MEDIUM | Guardian-facing dashboard |
| Bulk Student Import (CSV) | MEDIUM | Admin productivity feature |
| Automated Test Suite | HIGH | Unit + integration tests with Vitest |
| Swagger Docs Completion | MEDIUM | Full OpenAPI documentation |

---

## 12. DEVELOPMENT PROGRESS TRACKER

### Phase 1 — Foundation ✅ COMPLETE
- [x] Database schema design (Prisma)
- [x] Express app setup with middleware
- [x] Authentication system (JWT + refresh)
- [x] Role-based access control (6 roles)
- [x] Student management module
- [x] Staff management module
- [x] Academic structure (grades, classes, subjects)

### Phase 2 — Core Academic ✅ COMPLETE
- [x] Timetable management
- [x] Attendance tracking (daily)
- [x] Assessment and grading module
- [x] CBC competency scoring
- [x] Report card generation
- [x] Course outlines
- [x] Course resources

### Phase 3 — Finance & Communication ✅ COMPLETE
- [x] Fee structures management
- [x] Invoice generation
- [x] Payment recording
- [x] M-Pesa service (backend ready)
- [x] Announcements system
- [x] Direct messaging

### Phase 4 — Advanced Features 🟡 IN PROGRESS
- [x] AI chat assistant (backend)
- [x] QR code attendance (backend)
- [x] Google Calendar integration
- [x] Microsoft Tasks integration
- [x] Audit logging
- [ ] AI chat frontend polish
- [ ] QR attendance frontend
- [ ] Cloud file storage for resources
- [ ] Full M-Pesa end-to-end testing

### Phase 5 — Testing & Deployment 🟡 IN PROGRESS
- [x] Docker Compose setup
- [x] Render deployment config
- [x] Cloudflare Pages config
- [ ] Automated test suite
- [ ] CI/CD pipeline (.github/workflows)
- [ ] Production environment validation
- [ ] Load testing

### Phase 6 — Mobile & Expansion ❌ NOT STARTED
- [ ] Flutter parent mobile app
- [ ] SMS notification service
- [ ] Multi-school tenancy
- [ ] Advanced analytics dashboard

---

## 13. ENVIRONMENT VARIABLES

### Backend (`backend/.env`)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/matundu_sms

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# M-Pesa
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Microsoft OAuth
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=

# AI Service
AI_API_KEY=
AI_MODEL=gemini-pro

# Rate Limiting
AUTH_RATE_LIMIT_MAX=15
FORCE_RESEED=false
```

---

## 14. TEST CREDENTIALS

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin | admin@matundu.ac.ke | Admin@123 | Full system access |
| Teacher | teacher@matundu.ac.ke | Admin@123 | Academic features |
| Bursar | bursar@matundu.ac.ke | Admin@123 | Fees module |
| Student | student1@matundu.ac.ke | Admin@123 | Student view |

> ⚠️ **WARNING:** These are development credentials only. Change all passwords before production deployment.

---

## 15. NEXT STEPS (Immediate Priorities)

### Week 1 (Immediate)
1. **Write automated tests** — Vitest unit tests for all service modules
2. **Complete QR attendance frontend** — UI for scanning and displaying QR codes
3. **Polish AI chat UI** — Student-facing chat interface
4. **Set up CI/CD** — GitHub Actions workflow for auto-deploy on push

### Week 2
5. **M-Pesa sandbox testing** — Full STK Push flow end-to-end
6. **Cloud file storage** — Integrate Cloudflare R2 for course resources
7. **Swagger documentation** — Complete all API endpoint docs
8. **Production environment test** — Full smoke test on Render + Cloudflare Pages

### Week 3+
9. **Flutter parent app** — Begin mobile app development
10. **SMS notifications** — Integrate Africa's Talking or similar SMS gateway
11. **Performance audit** — Database query optimization, API response times
12. **Security audit** — Penetration testing, dependency vulnerability scan

---

## DOCUMENT REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | August 3, 2026 | Dev Team | Initial WIP document created |

---

*This is a living document. Update this file whenever significant progress is made, blockers are resolved, or new features are added.*
