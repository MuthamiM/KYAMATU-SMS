SYSTEM DESIGN SPECIFICATION

School Management System for Kyamatu Primary School

________________________________________________________________________________

Version: 1.0
Date: February 2026
Prepared by: Mwange Musa Muthami - 23/05037

________________________________________________________________________________


1. INTRODUCTION

1.1 Purpose

This document describes the system architecture, database design, interface design, and component design for the School Management System developed for Kyamatu Primary School.

1.2 Design Overview

The system follows a three-tier client-server architecture with a React SPA frontend, a RESTful Express.js API backend, and a PostgreSQL relational database. Each module is designed as a self-contained feature with its own routes, controller, and service layer.


________________________________________________________________________________

2. SYSTEM ARCHITECTURE

2.1 High-Level Architecture

The system uses a three-tier architecture:

CLIENT TIER (Browser)
   React 18 + Vite + Tailwind CSS
   Components: Pages, Reusable Components, Zustand Stores
   Communication: Axios API Service Layer
   Protocol: HTTPS (REST API)

SERVER TIER (Node.js)
   Express.js Application
   Middleware Pipeline: CORS, Helmet, RateLimit, RequestId, Auth, RBAC, Validate, Sanitize
   Feature Modules: auth, students, staff, academic, attendance, assessments, reports, fees, communication, dashboard, timetable
   Data Access: Prisma ORM

DATABASE TIER (PostgreSQL)
   23 Tables with UUID Primary Keys
   Indexed columns for performance
   Tables: Users, Students, Staff, Attendance, Assessments, Reports, Fees, Invoices, Payments, Timetable, etc.


2.2 Deployment Architecture

Cloudflare Pages (React SPA) ---> Render (Node.js API, Port 3000) ---> Supabase / PostgreSQL (Port 5432)
     Frontend                          Backend                              Database


________________________________________________________________________________

3. DATABASE DESIGN

3.1 Entity-Relationship Overview

The database contains 23 tables with the following key relationships:

User is linked to Student, Staff, and Guardian (one-to-one).
Student belongs to a Class and has many Attendances, AssessmentScores, Payments, and ReportCards.
Staff has many TeacherAssignments and TimetableSlots.
Class belongs to a Grade, Stream, and AcademicYear.
Assessment belongs to a Subject and Term, and has many AssessmentScores.
StudentInvoice has many Payments and InvoiceItems.
Guardian is linked to Students through the StudentGuardian junction table.

3.2 Key Database Tables

Table                Purpose                                     Key Relationships
User                 Authentication accounts                     Links to Student, Staff, Guardian
Student              Learner profiles                            Links to User, Class, Guardians
Staff                Teacher/staff profiles                       Links to User, TeacherAssignments
Class                Grade+Stream+Year combination               Links to Grade, Stream, AcademicYear
Attendance           Daily attendance records                    Links to Student, Class, Term
Assessment           Test/exam definitions                       Links to Subject, Term
AssessmentScore      Individual student scores                   Links to Student, Assessment
ReportCard           Termly report summaries                     Links to Student, Term
FeeStructure         Fee configuration                           Links to Grade, Term
StudentInvoice       Student billing                             Links to Student, Term
Payment              Payment transactions                        Links to Student, Invoice
TimetableSlot        Class timetable entries                     Links to Class, Subject, Teacher
AuditLog             System activity trail                       Links to User

3.3 Indexing Strategy

Performance-critical columns have database indexes:

User.email                            - Login lookups
Student.admissionNumber               - Student search
Attendance.(studentId, date)          - Unique constraint + fast lookups
AssessmentScore.(studentId, assessmentId) - Score retrieval
Payment.transactionRef                - Payment verification
AuditLog.(userId, entity, createdAt)  - Audit queries


________________________________________________________________________________

4. MODULE DESIGN

4.1 Backend Feature Module Structure

Each feature module follows a consistent three-file pattern:

features/
   auth/
      auth.routes.js          - Route definitions + validation
      auth.controller.js      - Request handling + response
      auth.service.js         - Business logic + DB queries
   students/
      students.routes.js
      students.controller.js
      students.service.js
   staff/
   academic/
   attendance/
   assessments/
   reports/
   fees/
   communication/
   dashboard/

4.2 Middleware Pipeline

Request processing follows this order:

1. CORS              - Cross-origin request handling
2. Helmet            - Security headers
3. Rate Limiter      - Request throttling
4. Request ID        - Unique request tracking
5. Body Parser       - JSON body parsing
6. Sanitize          - Input sanitization
7. Auth (JWT)        - Token verification
8. RBAC              - Role permission check
9. Validate          - Request body validation

Then: Controller -> Service -> Prisma -> Database -> Response (JSON)

4.3 Authentication Flow

1. Client sends POST /auth/login with email and password.
2. Server finds user by email in database.
3. Server compares password hash using bcrypt.compare().
4. Server generates JWT access token (15 min) and refresh token (7 days).
5. Server stores refresh token in database.
6. Server returns both tokens to client.
7. Client stores tokens and includes access token in Authorization header for subsequent requests.
8. Server verifies JWT and checks RBAC permissions on each protected request.
9. When access token expires, client uses refresh token to get a new access token.


________________________________________________________________________________

5. FRONTEND DESIGN

5.1 Technology Choices

React 18          - Component-based UI framework
Vite              - Fast development server and build tool
Tailwind CSS      - Utility-first CSS framework
Zustand           - Lightweight state management
Axios             - HTTP client for API calls
React Router      - Client-side routing

5.2 Page Structure

App.jsx (Router)
   Login.jsx                  - Public route
   Layout.jsx                 - Authenticated shell (sidebar + header)
      Dashboard.jsx           - Role-specific landing page
      Students.jsx            - Student list + CRUD
      StudentDetail.jsx       - Individual student profile
      Admissions.jsx          - Admission processing
      Staff.jsx               - Staff management
      Classes.jsx             - Class/grade management
      Attendance.jsx          - Attendance marking
      Assessments.jsx         - Score entry
      Reports.jsx             - Report card generation
      Fees.jsx                - Fee management
      Timetable.jsx           - Weekly timetable grid
      Announcements.jsx       - Communication
      Profile.jsx             - User profile
      Settings.jsx            - System configuration
      SystemStatus.jsx        - System health

5.3 State Management

Zustand Stores:
   authStore      - User session, tokens, role
   uiStore        - Sidebar state, theme, notifications

5.4 Role-Based UI Rendering

Different dashboard views are rendered based on the authenticated user's role:

Admin       - Enrollment stats, attendance trends, fee collection summary
Teacher     - Assigned classes, upcoming assessments, class timetable
Bursar      - Fee collection stats, outstanding balances, recent payments
Student     - Personal attendance rate, fee balance, timetable, social feed
Parent      - Child's performance, attendance, fee status


________________________________________________________________________________

6. SECURITY DESIGN

6.1 Authentication

Algorithm:               JWT (HS256)
Access Token Lifetime:   15 minutes
Refresh Token Lifetime:  7 days
Password Hashing:        bcrypt with 12 salt rounds

6.2 Authorization (RBAC)

Each API route is protected with middleware that checks:

1. Authentication - Valid JWT token present
2. Role Check - User role matches required permissions
3. Resource Ownership - Users can only access their own data (students see only their records)

6.3 Input Security

Validation:        Express-validator on all input fields
Sanitization:      Custom sanitize middleware strips HTML/scripts
Rate Limiting:     Configurable request limits per IP
Security Headers:  Helmet.js for XSS, CSRF, clickjacking protection

6.4 Audit Trail

All critical operations (login, data creation, modification, deletion) are logged in the AuditLog table with:
User ID, action type, entity, old/new values, IP address, timestamp


________________________________________________________________________________

7. API RESPONSE FORMAT

7.1 Success Response

{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

7.2 Error Response

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [...]
  }
}

7.3 Paginated Response

{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}


________________________________________________________________________________

8. DEPLOYMENT DESIGN

8.1 Environment Configuration

All sensitive configuration is stored in environment variables:

DATABASE_URL    - PostgreSQL connection string
JWT_SECRET      - Secret key for JWT signing
PORT            - Server port (default: 3000)
NODE_ENV        - Environment (development/production)
FRONTEND_URL    - Frontend URL for CORS

8.2 Deployment Pipeline

Developer -> GitHub Push -> Render Auto-Deploy (Backend)
                         -> Cloudflare Pages Auto-Deploy (Frontend)

8.3 Database Migrations

Schema changes are managed via Prisma Migrate:

Development:   npx prisma migrate dev --name migration_name
Production:    npx prisma migrate deploy
