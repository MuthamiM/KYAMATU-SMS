SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

School Management System for Kyamatu Primary School

________________________________________________________________________________

Version: 1.0
Date: February 2026
Prepared by: Mwange Musa Muthami - 23/05037

________________________________________________________________________________


TABLE OF CONTENTS

1. Introduction
2. Overall Description
3. Functional Requirements
4. Non-Functional Requirements
5. System Interfaces
6. Use Case Descriptions
7. Data Dictionary


________________________________________________________________________________

1. INTRODUCTION

1.1 Purpose

This Software Requirements Specification (SRS) document describes the functional and non-functional requirements for the School Management System for Kyamatu Primary School. It serves as the contractual basis between the developer and the school for what the system shall do.

1.2 Scope

The system is a web-based application that manages student records, attendance, assessments, reports, fees, timetabling, and communication for Kyamatu Primary School. It supports Kenya's Competency-Based Curriculum (CBC) framework.

1.3 Definitions and Acronyms

SMS     - School Management System
CBC     - Competency-Based Curriculum
CAT     - Continuous Assessment Test
RBAC    - Role-Based Access Control
JWT     - JSON Web Token
API     - Application Programming Interface
CRUD    - Create, Read, Update, Delete
ORM     - Object-Relational Mapping
SRS     - Software Requirements Specification

1.4 References

- Kenya Institute of Curriculum Development - CBC Framework (2017)
- IEEE Std 830-1998 - Recommended Practice for SRS


________________________________________________________________________________

2. OVERALL DESCRIPTION

2.1 Product Perspective

The SMS is a standalone, web-based system accessed via modern browsers. It has a client-server architecture with:

- Frontend (Client): React 18 Single Page Application (SPA) served via Cloudflare Pages.
- Backend (Server): RESTful API built with Node.js/Express, deployed on Render.
- Database: PostgreSQL 15 managed database with Prisma ORM.

2.2 User Classes and Characteristics

User Role         Description                                                              Access Level
Super Admin       System administrator with full access to all modules and configurations   Full
Admin             School administrator managing students, staff, academic structure          High
Teacher           Marks attendance, records assessment scores, views assigned classes        Medium
Bursar            Manages fee structures, invoices, and payment records                      Medium
Student           Views own dashboard, attendance, assessments, timetable, fee status        Low
Parent            Views linked student's academic performance, attendance, and fee balance    Low

2.3 Operating Environment

- Client: Any modern web browser (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- Server: Node.js 20 runtime environment
- Database: PostgreSQL 15+
- Minimum Internet Speed: 1 Mbps

2.4 Constraints

- Must comply with Kenya's CBC grading framework
- Must be accessible over standard HTTP/HTTPS protocols
- Must be responsive for tablet and mobile use


________________________________________________________________________________

3. FUNCTIONAL REQUIREMENTS

3.1 Authentication and Authorization Module

ID           Requirement                                                                  Priority
FR-AUTH-01   The system shall allow users to register with email and password              High
FR-AUTH-02   The system shall authenticate users via email/password login                  High
FR-AUTH-03   The system shall issue JWT access tokens (15 min) and refresh tokens (7 days) High
FR-AUTH-04   The system shall enforce role-based access control (RBAC) for all endpoints   High
FR-AUTH-05   The system shall allow users to view and update their profile                 Medium
FR-AUTH-06   The system shall hash all passwords using bcrypt (12 rounds)                  High
FR-AUTH-07   The system shall log all authentication events in the audit log               Medium

3.2 Student Management Module

ID           Requirement                                                                  Priority
FR-STU-01    The system shall allow admins to create student profiles with personal details High
FR-STU-02    The system shall generate unique admission numbers automatically              High
FR-STU-03    The system shall support admission status workflow (Pending, Approved, Rejected) High
FR-STU-04    The system shall allow linking students to guardian profiles                  High
FR-STU-05    The system shall allow assigning students to classes                          High
FR-STU-06    The system shall allow searching and filtering students by name, class, grade Medium
FR-STU-07    The system shall display detailed student profiles with academic history      Medium

3.3 Staff Management Module

ID           Requirement                                                                  Priority
FR-STA-01    The system shall allow admins to create staff profiles                        High
FR-STA-02    The system shall generate unique employee numbers                             High
FR-STA-03    The system shall allow assigning teachers to classes and subjects              High
FR-STA-04    The system shall designate class teachers with the isClassTeacher flag         Medium
FR-STA-05    The system shall display teacher workload and assignments                     Medium

3.4 Academic Structure Module

ID           Requirement                                                                  Priority
FR-ACA-01    The system shall manage academic years with start/end dates                   High
FR-ACA-02    The system shall support three terms per academic year                        High
FR-ACA-03    The system shall support CBC grade levels: PP1, PP2, Grade 1 to 9            High
FR-ACA-04    The system shall manage streams (e.g., East, West)                            High
FR-ACA-05    The system shall generate classes from grade + stream + year combinations     High
FR-ACA-06    The system shall manage subjects per grade with unique subject codes           High
FR-ACA-07    The system shall map subjects to classes via a class-subject junction          Medium

3.5 Attendance Tracking Module

ID           Requirement                                                                  Priority
FR-ATT-01    The system shall allow teachers to mark daily attendance per student           High
FR-ATT-02    The system shall support attendance statuses: Present, Absent, Late, Excused  High
FR-ATT-03    The system shall prevent duplicate attendance for same student on same date    High
FR-ATT-04    The system shall generate attendance reports by student, class, and date range Medium
FR-ATT-05    The system shall calculate attendance rate percentages                        Medium

3.6 Assessment and Grading Module

ID           Requirement                                                                  Priority
FR-ASS-01    The system shall allow creating assessments (CAT, Mid-term, End-term) per subject per term High
FR-ASS-02    The system shall record student scores per assessment                         High
FR-ASS-03    The system shall auto-compute grades based on CBC competency ratings           High
FR-ASS-04    The system shall support four CBC ratings: EE, ME, AE, BE                     High
FR-ASS-05    The system shall support traditional letter grades: A, B, C, D, E             Medium
FR-ASS-06    The system shall allow weighted assessments for final grade calculation        Medium
FR-ASS-07    The system shall support subject-specific competency tracking                 Medium

3.7 Report Card Module

ID           Requirement                                                                  Priority
FR-REP-01    The system shall generate termly report cards per student                     High
FR-REP-02    The system shall compute total scores, average scores, and class rankings     High
FR-REP-03    The system shall include teacher and principal comments on report cards        Medium
FR-REP-04    The system shall display class rankings and mean scores                       Medium

3.8 Fees Management Module

ID           Requirement                                                                  Priority
FR-FEE-01    The system shall allow defining fee structures per grade per term              High
FR-FEE-02    The system shall generate student invoices with unique invoice numbers         High
FR-FEE-03    The system shall record payments (Cash, M-Pesa, Bank Transfer)                High
FR-FEE-04    The system shall automatically compute fee balance after each payment          High
FR-FEE-05    The system shall track payment status (Pending, Completed, Failed, Refunded)  Medium
FR-FEE-06    The system shall store M-Pesa receipt numbers for mobile payments              Medium

3.9 Communication Module

ID           Requirement                                                                  Priority
FR-COM-01    The system shall allow admins to create school-wide announcements              High
FR-COM-02    The system shall support targeting announcements to specific roles             Medium
FR-COM-03    The system shall support direct messaging between users                       Medium
FR-COM-04    The system shall track message read status                                    Low

3.10 Timetable Module

ID           Requirement                                                                  Priority
FR-TIM-01    The system shall allow configuring timetable slots per class                   Medium
FR-TIM-02    The system shall assign subjects and teachers to time slots                   Medium
FR-TIM-03    The system shall display the timetable in a weekly grid view                  Medium

3.11 Dashboard Module

ID           Requirement                                                                  Priority
FR-DAS-01    The system shall display role-specific dashboards upon login                  High
FR-DAS-02    Admin dashboard shall show enrollment stats, attendance trends, fee summaries High
FR-DAS-03    Teacher dashboard shall show assigned classes, upcoming assessments            Medium
FR-DAS-04    Student dashboard shall show attendance rate, fee balance, timetable, social feed Medium


________________________________________________________________________________

4. NON-FUNCTIONAL REQUIREMENTS

4.1 Performance

NFR-01   API response time shall be under 500ms for 95% of requests
NFR-02   The system shall support at least 100 concurrent users
NFR-03   Database queries shall use indexed columns for optimal performance

4.2 Security

NFR-04   All passwords shall be hashed with bcrypt (12 salt rounds)
NFR-05   All API endpoints shall require authentication (except login/register)
NFR-06   The system shall use Helmet middleware for HTTP security headers
NFR-07   The system shall implement rate limiting to prevent brute-force attacks
NFR-08   Input validation and sanitization shall be applied to all user inputs
NFR-09   The system shall maintain an audit log of critical operations

4.3 Usability

NFR-10   The interface shall be responsive and usable on screens 320px to 1920px wide
NFR-11   The system shall use modern UI components with intuitive navigation
NFR-12   All forms shall provide client-side and server-side validation feedback

4.4 Reliability

NFR-13   The system shall target 99.5% uptime
NFR-14   The system shall implement graceful error handling with user-friendly messages
NFR-15   Database transactions shall ensure data consistency

4.5 Maintainability

NFR-16   The codebase shall follow a modular, feature-based architecture
NFR-17   The system shall use environment variables for all configurable settings
NFR-18   The database schema shall be version-controlled via Prisma migrations


________________________________________________________________________________

5. SYSTEM INTERFACES

5.1 API Endpoints Summary

Authentication
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - User login
POST   /api/auth/refresh     - Refresh access token
GET    /api/auth/profile     - Get user profile

Students
GET    /api/students               - List all students
POST   /api/students               - Create student
GET    /api/students/:id           - Get student by ID
PUT    /api/students/:id           - Update student
POST   /api/students/:id/approve   - Approve admission

Academic
GET    /api/academic/years    - List academic years
GET    /api/academic/classes  - List classes
GET    /api/academic/subjects - List subjects

Attendance
POST   /api/attendance              - Mark attendance
GET    /api/attendance/class/:id    - Get class attendance
GET    /api/attendance/student/:id  - Get student attendance

Assessments
POST   /api/assessments          - Create assessment
POST   /api/assessments/scores   - Submit scores
GET    /api/assessments/scores   - Get student scores

Reports
POST   /api/reports/generate           - Generate report card
GET    /api/reports/class/:id/rankings - Get class rankings

Fees
GET    /api/fees/structures  - List fee structures
POST   /api/fees/invoices    - Generate invoice
POST   /api/fees/payments    - Record payment

Communication
GET    /api/announcements   - List announcements
POST   /api/announcements   - Create announcement
GET    /api/messages         - List messages
POST   /api/messages         - Send message


________________________________________________________________________________

6. USE CASE DESCRIPTIONS

UC-01: User Login
Actor:          Admin, Teacher, Bursar, Student, Parent
Precondition:   User has a registered account
Main Flow:      1. User enters email and password
                2. System validates credentials
                3. System issues JWT tokens
                4. User is redirected to role-specific dashboard
Postcondition:  User is authenticated with access token stored in browser
Alt Flow:       Invalid credentials - System displays error message

UC-02: Mark Attendance
Actor:          Teacher
Precondition:   Teacher is assigned to a class; term is active
Main Flow:      1. Teacher selects class and date
                2. System displays student list
                3. Teacher marks each student as Present/Absent/Late/Excused
                4. System saves attendance records
Postcondition:  Attendance is recorded for all students in the class
Alt Flow:       Attendance already exists for date - System prompts for update

UC-03: Record Assessment Scores
Actor:          Teacher
Precondition:   Assessment has been created; teacher is assigned to subject
Main Flow:      1. Teacher selects assessment
                2. System shows student list
                3. Teacher enters scores
                4. System auto-computes grades and CBC ratings
                5. Scores are saved
Postcondition:  Student scores are recorded with computed grades

UC-04: Generate Report Card
Actor:          Admin
Precondition:   All assessments for the term have been scored
Main Flow:      1. Admin selects class and term
                2. System computes averages and rankings
                3. Report cards are generated for all students
                4. Teacher/principal can add comments
Postcondition:  Report cards are available for viewing/download

UC-05: Record Fee Payment
Actor:          Bursar
Precondition:   Student has an invoice
Main Flow:      1. Bursar selects student invoice
                2. Enters payment amount and method
                3. System records payment and updates balance
                4. Payment receipt is generated
Postcondition:  Invoice balance is updated; payment record is created


________________________________________________________________________________

7. DATA DICTIONARY

7.1 Core Entities

Entity            Description                          Key Fields
User              System user account                  id, email, password, role, isActive
Student           Student profile                      id, admissionNumber, firstName, lastName, classId, admissionStatus
Staff             Staff/teacher profile                 id, employeeNumber, firstName, lastName, qualification
Guardian          Parent/guardian profile               id, firstName, lastName, relationship
AcademicYear      Academic year period                  id, name, startDate, endDate, isCurrent
Term              Term within academic year             id, name, termNumber, startDate, endDate
Grade             CBC grade level (PP1 to G9)           id, name, level
Class             Specific class instance               id, name, gradeId, streamId, academicYearId
Subject           Academic subject                      id, name, code, gradeId
Attendance        Daily attendance record               id, date, status, studentId, classId, termId
Assessment        Assessment/exam definition            id, name, type, maxScore, weight, subjectId, termId
AssessmentScore   Student score per assessment          id, score, grade, studentId, assessmentId
ReportCard        Termly report card                    id, totalScore, averageScore, rank, studentId, termId
FeeStructure      Fee configuration per grade per term  id, name, amount, gradeId, termId
StudentInvoice    Student billing record                id, invoiceNo, totalAmount, paidAmount, balance
Payment           Payment transaction                   id, amount, method, status, transactionRef
Announcement      School-wide announcement              id, title, content, targetRoles, isPublished
Message           Direct message between users          id, subject, content, isRead, senderId, receiverId
TimetableSlot     Class timetable entry                 id, dayOfWeek, startTime, endTime, classId, subjectId
AuditLog          System audit trail                    id, action, entity, entityId, userId, ipAddress

7.2 Enumerations

Role              - SUPER_ADMIN, ADMIN, TEACHER, STUDENT, PARENT, BURSAR
AdmissionStatus   - PENDING, APPROVED, REJECTED
AttendanceStatus  - PRESENT, ABSENT, LATE, EXCUSED
CompetencyRating  - EXCEEDING, MEETING, APPROACHING, BELOW
PaymentMethod     - CASH, MPESA, BANK_TRANSFER
PaymentStatus     - PENDING, COMPLETED, FAILED, REFUNDED
