WORK IN PROGRESS (WIP) DOCUMENT

School Management System for Kyamatu Primary School

________________________________________________________________________________

Student Name: Mwange Musa Muthami
Registration Number: 23/05037
Programme: Bachelor of Information Technology (BIT 3105)
Supervisor: Dr. Simon N. Mwendia
Date: February 2026

________________________________________________________________________________


1. PROJECT OVERVIEW

Project Title:     School Management System for Kyamatu Primary School
Organization:      Kyamatu Primary School, Voo, Kyamatu Ward, Kitui East, Kitui County
Type:              Web-based Application
Tech Stack:        React 18, Node.js/Express.js, PostgreSQL, Prisma ORM
Deployment:        Render (Backend), Cloudflare Pages (Frontend), Supabase (DB)
Repository:        https://github.com/MuthamiM/KYAMATU-SMS


________________________________________________________________________________

2. CURRENT SYSTEM STATUS

2.1 Overall Progress Summary

Module                         Status        Completion
Authentication and RBAC        Complete      100%
Student Management             Complete      100%
Staff Management               Complete      100%
Academic Structure (CBC)       Complete      100%
Attendance Tracking            Complete      100%
Assessment and Grading         Complete      100%
Report Cards                   Complete      100%
Fees Management                Complete      100%
Communication                  Complete      100%
Timetable Management           Complete      100%
Dashboard (Admin)              Complete      100%
Dashboard (Student)            Complete      100%
Deployment                     Complete      100%
Overall                        Done          100%


________________________________________________________________________________

3. COMPLETED WORK

3.1 Backend Development

3.1.1 Database Schema
- Designed and implemented 23 database tables using Prisma ORM on PostgreSQL.
- Implemented UUID-based primary keys for all entities.
- Created proper indexes on frequently queried columns (email, admission number, dates).
- Set up unique constraints to prevent data duplication (e.g., one attendance record per student per day).

3.1.2 Authentication Module
- Implemented JWT-based authentication with access tokens (15 min) and refresh tokens (7 days).
- Password hashing with bcrypt (12 salt rounds).
- Refresh token rotation and database-backed token storage.
- User registration, login, profile retrieval, and password change endpoints.

3.1.3 Role-Based Access Control (RBAC)
- Implemented 6 user roles: Super Admin, Admin, Teacher, Bursar, Student, Parent.
- Created RBAC middleware that enforces per-route permission checks.
- Admin can manage all modules; Teachers access only assigned classes; Students see only their own data.

3.1.4 Student Management Module
- CRUD operations for student profiles with admission number auto-generation.
- Admission status workflow: Pending, Approved, Rejected.
- Student-guardian linking via junction table with primary guardian designation.
- Search and filtering by name, class, grade, and admission status.

3.1.5 Staff Management Module
- CRUD operations for staff profiles with employee number generation.
- Teacher-to-class-subject assignment system.
- Class teacher designation via isClassTeacher flag.

3.1.6 Academic Structure Module
- Academic year management with current year marking.
- Three terms per year with date ranges.
- CBC grade levels: PP1, PP2, Grade 1 through Grade 9.
- Stream management (e.g., East, West streams).
- Automatic class generation from Grade + Stream + Year.
- Subject management with unique subject codes per grade.
- Class-subject mapping via junction table.

3.1.7 Attendance Module
- Daily attendance marking endpoint (bulk submit for entire class).
- Attendance statuses: Present, Absent, Late, Excused.
- Unique constraint per student per date to prevent duplicates.
- Attendance statistics and report generation per student and class.
- Attendance rate calculation.

3.1.8 Assessment and Grading Module
- Assessment creation (CAT, Mid-term, End-term) per subject per term.
- Bulk score entry and update.
- Automatic grade computation using CBC competency ratings (EE, ME, AE, BE).
- Traditional letter grade support (A to E).
- Weighted assessment support for final grade calculation.
- Subject-level competency tracking and scoring.

3.1.9 Report Card Module
- Automated report card generation per student per term.
- Average score, total score, and class rank computation.
- Teacher and principal comment fields.
- Class-wide ranking and mean score calculation.

3.1.10 Fees Management Module
- Fee structure configuration per grade per term.
- Invoice generation with unique invoice numbers.
- Payment recording for Cash, M-Pesa, and Bank Transfer methods.
- Automatic balance calculation after each payment.
- Payment status tracking (Pending, Completed, Failed, Refunded).
- M-Pesa receipt number storage for mobile payments.

3.1.11 Communication Module
- School-wide announcements with role-based targeting.
- Publish/unpublish functionality.
- Direct messaging between users.
- Message read status tracking.

3.1.12 Timetable Module
- Timetable slot configuration (day, start time, end time).
- Subject and teacher assignment to slots.
- Weekly grid view display.

3.1.13 Dashboard Module
- Admin dashboard with enrollment stats, attendance trends, fee summaries.
- Student dashboard with personal attendance rate, fee balance, timetable, and social feed.

3.1.14 Middleware and Security
- JWT authentication middleware.
- RBAC authorization middleware.
- Input validation via express-validator.
- Input sanitization middleware.
- Rate limiting.
- Helmet security headers.
- Audit logging middleware.
- Request ID tracking.
- Centralized error handling.


3.2 Frontend Development

3.2.1 Core Setup
- React 18 SPA with Vite build tool.
- Tailwind CSS for styling.
- Zustand for state management (auth store, UI store).
- Axios-based API service layer with token interceptors.
- React Router for client-side navigation.

3.2.2 Pages Implemented (17 pages)
- Login: Email/password authentication form.
- Dashboard: Role-specific landing page with analytics widgets.
- Students: Student listing with search, filter, and CRUD.
- Student Detail: Individual student profile view.
- Admissions: Admission approval/rejection interface.
- Staff: Staff management with assignment controls.
- Classes: Grade/stream/class management interface.
- Attendance: Attendance marking and reporting interface.
- Assessments: Score entry and grade display.
- Reports: Report card generation and viewing.
- Fees: Fee structure, invoicing, and payment management.
- Timetable: Weekly timetable grid display.
- Announcements: Announcement creation and viewing.
- Profile: User profile management.
- Settings: System configuration.
- System Status: System health monitoring.

3.2.3 UI Components
- Layout: Authenticated shell with collapsible sidebar and header.
- Dashboard Widgets: Cards, charts, and quick-action panels.


3.3 Deployment

- Backend: Deployed on Render with auto-deploy from GitHub.
- Frontend: Deployed on Cloudflare Pages.
- Database: PostgreSQL hosted on Supabase.
- Docker: Docker Compose configuration for local development.


________________________________________________________________________________

4. REMAINING WORK

All major modules have been completed and deployed. The following items are planned for future enhancement but are not part of the current project scope:

- M-Pesa STK Push integration (future enhancement)
- SMS/Email notifications (future enhancement)


________________________________________________________________________________

5. CHALLENGES ENCOUNTERED

5.1 Database Connection Issues
Problem: Intermittent Supabase connection failures during deployment.
Solution: Configured connection pooling and implemented retry logic in Prisma client configuration.

5.2 Data Persistence During Seeding
Problem: Newly added member records disappeared after refresh due to overly aggressive database re-seeding on the login page.
Solution: Removed automatic seeding call from login flow; seeding now only runs explicitly during setup.

5.3 Assessment Grouping by Term
Problem: Student assessments were displaying flat without term grouping.
Solution: Refactored the assessment query to include term relations and group scores by term in the frontend display.

5.4 Student Dashboard Real-Time Data
Problem: Dashboard widgets displayed hardcoded placeholder data instead of live information.
Solution: Replaced all hardcoded values with API calls for actual attendance rate, fee balance, and live school announcements.


________________________________________________________________________________

6. TESTING SUMMARY

Test Type            Status          Notes
Unit Testing         Complete        Key service functions tested
Integration Testing  Complete        All API endpoints tested via Postman
User Acceptance      Complete        Tested with school administrators
Cross-Browser        Complete        Verified on Chrome, Firefox, Edge
Mobile Responsive    Complete        Tested on 320px to 1920px viewports


________________________________________________________________________________

7. SCREENSHOTS

Note: Screenshots of the deployed system can be captured and appended here.

7.1 Login Page
(Insert screenshot)

7.2 Admin Dashboard
(Insert screenshot)

7.3 Student List
(Insert screenshot)

7.4 Attendance Marking
(Insert screenshot)

7.5 Assessment Score Entry
(Insert screenshot)

7.6 Report Card View
(Insert screenshot)

7.7 Fee Management
(Insert screenshot)

7.8 Timetable View
(Insert screenshot)


________________________________________________________________________________

8. CONCLUSION

The School Management System for Kyamatu Primary School is 100% complete. All core modules (Authentication, Student Management, Staff, Academic Structure, Attendance, Assessment and Grading, Report Cards, Fees, Communication, Timetable, and Dashboards) are fully implemented, tested, and deployed.

The system successfully addresses the key problems identified during requirements gathering, namely manual record-keeping, data loss, slow report generation, poor parent communication, and lack of real-time analytics.

User acceptance testing has been completed with school administrators and staff. The system is live and accessible to all stakeholders.
