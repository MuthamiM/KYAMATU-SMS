# KYAMATU PRIMARY SCHOOL MANAGEMENT SYSTEM

## IMPLEMENTATION PLAN

---

| **Field**             | **Detail**                                                    |
|-----------------------|---------------------------------------------------------------|
| **Student Name**      | Musa Muthami Mwange                                           |
| **Registration No.**  | 23/05037                                                      |
| **Course**            | STU 4201 — Final Year Project II                              |
| **Supervisor**        | Deborah Mbula                                                 |
| **Institution**       | KCA University                                                |
| **Trimester**         | Trimester 3, 2026                                             |
| **Stream**            | A (PTDL)                                                      |
| **Project Title**     | Kyamatu Primary School Management System (KYAMATU-SMS)        |
| **Document Version**  | 2.0                                                           |
| **Date**              | October 2026                                                  |

---

## TABLE OF CONTENTS

1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [Implementation Strategy](#3-implementation-strategy)
4. [Technology Stack & Justification](#4-technology-stack--justification)
5. [System Architecture](#5-system-architecture)
6. [Database Implementation](#6-database-implementation)
7. [Module Implementation Details](#7-module-implementation-details)
8. [User Interface Implementation](#8-user-interface-implementation)
9. [Security Implementation](#9-security-implementation)
10. [Implementation Schedule](#10-implementation-schedule)
11. [Installation & Conversion Plans](#11-installation--conversion-plans)
    - 11.1 [Hardware Installation Plan](#111-hardware-installation-plan)
    - 11.2 [Software Installation Plan](#112-software-installation-plan)
    - 11.3 [Activities of Conversion](#113-activities-of-conversion)
    - 11.4 [System Conversion Strategy](#114-system-conversion-strategy)
12. [Training Plan](#12-training-plan)
    - 12.1 [Training Objectives](#121-training-objectives)
    - 12.2 [Target Stakeholder Groups](#122-target-stakeholder-groups)
    - 12.3 [Training Methods](#123-training-methods)
    - 12.4 [Training Schedule & Curriculum](#124-training-schedule--curriculum)
    - 12.5 [Training Materials & Evaluation](#125-training-materials--evaluation)
13. [Software Maintenance Plan](#13-software-maintenance-plan)
    - 13.1 [Corrective Maintenance](#131-corrective-maintenance)
    - 13.2 [Adaptive Maintenance](#132-adaptive-maintenance)
    - 13.3 [Perfective Maintenance](#133-perfective-maintenance)
    - 13.4 [Preventive Maintenance](#134-preventive-maintenance)
    - 13.5 [Maintenance Workflow, SLAs & Backup Strategy](#135-maintenance-workflow-slas--backup-strategy)
14. [Change Management Plan](#14-change-management-plan)
    - 14.1 [Change Management Objectives](#141-change-management-objectives)
    - 14.2 [Change Control Board (CCB)](#142-change-control-board-ccb)
    - 14.3 [Change Request Lifecycle](#143-change-request-lifecycle)
    - 14.4 [Stakeholder Transition & Resistance Management](#144-stakeholder-transition--resistance-management)
15. [Deployment & Infrastructure](#15-deployment--infrastructure)
16. [Risk Management](#16-risk-management)
17. [Conclusion](#17-conclusion)
18. [References](#18-references)

---

## 1. INTRODUCTION

### 1.1 Purpose

This Implementation Plan details the technical approach, tools, methodologies, and phased schedule adopted in deploying and operationalizing the **Kyamatu Primary School Management System (KYAMATU-SMS)**. It serves as the authoritative blueprint for translating the Design Specification into a functioning, institutionalized software platform aligned with Kenya's Competency-Based Curriculum (CBC).

### 1.2 Scope

The plan covers the end-to-end operationalization of KYAMATU-SMS:

- Full-stack web application deployment (Node.js/Express API and React 18 frontend)
- Managed PostgreSQL database configuration with Prisma ORM migrations
- Hardware and software installation across school premises and cloud infrastructure
- Complete legacy-to-digital data conversion and migration procedures
- Systematic parallel conversion strategy from manual record books
- Comprehensive stakeholder training covering all six user roles
- 4-tier software maintenance framework (corrective, adaptive, perfective, preventive)
- Formal change management procedures and stakeholder transition strategy

### 1.3 Intended Audience

| Audience              | Responsibility                                             |
|-----------------------|------------------------------------------------------------|
| Project Supervisor    | Deborah Mbula — academic review and milestone evaluation   |
| Academic Examiners    | KCA University — examination of implementation quality     |
| School Administration | Kyamatu Primary School Headteacher and Board of Management |
| System Administrator  | Ongoing infrastructure management and user access control  |

### 1.4 Project Metadata

| Attribute             | Value                                                      |
|-----------------------|------------------------------------------------------------|
| Student Name          | Musa Muthami Mwange                                        |
| Registration Number   | 23/05037                                                   |
| Institution           | KCA University                                             |
| Target School         | Kyamatu Primary School                                     |
| Curriculum Standard   | Kenya Competency-Based Curriculum (PP1–Grade 9)            |

---

## 2. SYSTEM OVERVIEW

### 2.1 Project Summary

KYAMATU-SMS is a production-grade school management platform engineered specifically for the Kenyan primary school ecosystem. It replaces error-prone paper ledgers, fragmented spreadsheets, and manual report card compilation with an integrated web platform that unifies academics, finances, staff assignments, and communication.

### 2.2 Core Modules

The system comprises **13 functional modules**:

| # | Module               | Operational Focus                                      |
|---|----------------------|--------------------------------------------------------|
| 1 | Authentication       | JWT tokens, bcrypt security, role-based authorization  |
| 2 | Student Management   | Admissions, NEMIS UPI, bio-data, class promotion       |
| 3 | Staff Management     | Teacher profiles, subject specializations, workload    |
| 4 | Academic Structure   | Academic years, terms, CBC grades (PP1-9), streams     |
| 5 | Timetable            | Automated weekly lesson schedule per class/teacher     |
| 6 | Attendance           | Daily register marking with statistical aggregations   |
| 7 | Assessments          | CATs, terminal exams, CBC competency scoring           |
| 8 | Report Cards         | Auto-calculated mean, rankings, PDF generation         |
| 9 | Fee Management       | Fee structures, invoice generation, M-Pesa payments   |
| 10| Communication        | Multi-role announcements, direct messaging             |
| 11| AI Assistant         | Student curriculum support powered by Gemini Pro       |
| 12| Calendar Integration | Synchronization with Google Calendar / Microsoft Tasks |
| 13| Analytics Dashboard  | Executive KPI widgets, visual trends with Recharts     |

### 2.3 User Roles & RBAC Matrix

| Role         | Permitted Operations                                         |
|--------------|--------------------------------------------------------------|
| SUPER_ADMIN  | Full system ownership, system settings, global audit logs    |
| ADMIN        | Student admissions, staff registry, academic year management |
| TEACHER      | Attendance entry, assessment scoring, report card comments   |
| BURSAR       | Fee structures, invoice dispatch, payment receipting         |
| STUDENT      | Performance view, timetable, course resources, AI tutor     |
| PARENT       | Child academic progress, attendance reports, fee balance     |

---

## 3. IMPLEMENTATION STRATEGY

### 3.1 Agile-Iterative Delivery Model

The project executes through an **Agile-Iterative Framework** ensuring increments are functional, testable, and reviewed by Kyamatu Primary stakeholders at each sprint milestone.

### 3.2 Architectural Principles

- **Modular Separation:** Features are organized into discrete domain packages (routes, controllers, services, validators).
- **Single Source of Truth:** Database constraints defined in Prisma ORM dictate data validation.
- **Stateless REST Layer:** High availability via stateless JWT authentication.
- **Fail-Safe Design:** Data transactions wrapped in ACID database transactions.

---

## 4. TECHNOLOGY STACK & JUSTIFICATION

| Tier       | Technology           | Version  | Justification                                          |
|------------|----------------------|----------|--------------------------------------------------------|
| Frontend   | React                | 18.3.1   | Component-driven reactive UI; rich ecosystem           |
| Build Tool | Vite                 | 7.3.1    | Sub-second Hot Module Replacement (HMR)                |
| Styling    | Tailwind CSS         | 3.4.15   | Utility styling eliminating CSS bloat                  |
| State      | Zustand              | 5.0.1    | Lightweight, minimal boilerplate state store           |
| Backend    | Node.js + Express.js | 20+ / 4.21| Non-blocking I/O; fast throughput for school requests   |
| ORM        | Prisma               | 5.22.0   | Strict type safety, clean migrations                   |
| Database   | PostgreSQL           | 15+      | Enterprise ACID reliability, relational constraints    |
| Caching    | Redis                | 5.10.0   | Fast rate limiting and session caching                 |
| Security   | Helmet + bcrypt      | Latest   | HTTP security headers and 12-round password hashing    |

---

## 5. SYSTEM ARCHITECTURE

```
[ Client Browser / Tablet ]
           │ (HTTPS / TLS 1.3)
           ▼
[ Cloudflare Pages CDN (Frontend SPA) ]
           │ (Axios REST API Requests)
           ▼
[ Node.js 20 / Express.js 4.21 API (Render.com) ]
  ├── Auth & RBAC Middleware
  ├── Input Sanitizer & express-validator
  ├── 13 Domain Modules (MVC Services)
  └── Audit Logger
           │ (Prisma Client Connection Pool)
           ▼
[ PostgreSQL 15 Relational Database ]
  ├── 24 Relational Models
  ├── 6 Enums & Foreign Key Cascades
  └── Read/Write Optimized Indexes
```

---

## 6. DATABASE IMPLEMENTATION

The database schema is implemented with **24 relational models** managed by Prisma migrations:
- **Core Accounts:** `User`, `RefreshToken`, `AuditLog`
- **Stakeholders:** `Student`, `Staff`, `Guardian`, `StudentGuardian`
- **Academic Entities:** `AcademicYear`, `Term`, `Grade`, `Stream`, `Class`, `Subject`, `ClassSubject`
- **Learning & Scheduling:** `TeacherAssignment`, `TimetableSlot`, `CourseOutline`, `CourseResource`
- **Assessments & Evaluation:** `Attendance`, `Assessment`, `AssessmentScore`, `Competency`, `CompetencyScore`, `ReportCard`
- **Finances:** `FeeStructure`, `StudentInvoice`, `InvoiceItem`, `Payment`
- **Engagement:** `Announcement`, `Message`, `Reminder`, `AiChatMessage`

---

## 7. MODULE IMPLEMENTATION DETAILS

All 13 backend modules located in `backend/src/features/` implement strict validation, error trapping, and role checking. Key logic includes:
- **CBC Assessment Engine:** Automated conversion of numerical percentages into CBC standard ratings:
  - **EE (Exceeding Expectations):** 75% – 100%
  - **ME (Meeting Expectations):** 50% – 74%
  - **AE (Approaching Expectations):** 25% – 49%
  - **BE (Below Expectations):** 0% – 24%
- **Fee Ledger & Payments:** Automatic generation of term invoices upon student enrollment; real-time balance calculations upon recording cash, bank transfers, or M-Pesa STK push callbacks.

---

## 8. USER INTERFACE IMPLEMENTATION

The frontend features **16 specialized pages** (`frontend/src/pages/`):
- `Login.jsx` — Secure credential capture with JWT decoding.
- `Dashboard.jsx` — Role-specific KPIs, enrollment trends, attendance graphs.
- `Students.jsx` & `StudentDetail.jsx` — Student registry, guardian relationships, NEMIS UPI identifiers.
- `Staff.jsx` — Teacher profiles, TSC numbers, subject assignments.
- `Classes.jsx` & `Timetable.jsx` — Class stream organization and weekly schedules.
- `Attendance.jsx` — Daily student presence/absence register.
- `Assessments.jsx` — Score entry grid with automatic grading.
- `Reports.jsx` — PDF-ready student performance profiles with teacher remarks.
- `Fees.jsx` — Invoice creation, fee collection records, receipt issuance.
- `Announcements.jsx` & `Admissions.jsx` — Communication and new student processing.

---

## 9. SECURITY IMPLEMENTATION

- **Password Encryption:** bcrypt with 12 computational rounds.
- **Token Security:** 15-minute access token lifespan; 7-day refresh tokens with automated rotation and database invalidation.
- **SQL Injection Defense:** Strict use of Prisma ORM parameterized queries; raw SQL queries are prohibited.
- **Cross-Site Scripting (XSS):** Request sanitization middleware strips script tags; React escapes HTML by default.
- **Traffic Throttling:** Redis-backed rate limiting restricting authentication attempts to 15 requests per 15-minute window.

---

## 10. IMPLEMENTATION SCHEDULE

The implementation was executed over a structured **16-week timeline**:

| Week | Milestone Name                  | Key Activities & Deliverables                                | Status      |
|------|---------------------------------|--------------------------------------------------------------|-------------|
| 1–2  | Project Initiation & Setup      | Repository setup, Docker Compose, baseline requirements      | ✅ Complete |
| 3–4  | Database & Authentication       | Prisma schema creation, migrations, JWT auth, RBAC           | ✅ Complete |
| 5–6  | Student & Staff Registries      | Student CRUD, admission flow, teacher assignment modules     | ✅ Complete |
| 7–8  | Academic Structure & Timetable  | CBC grades (PP1-9), streams, classes, timetable scheduler   | ✅ Complete |
| 9–10 | Attendance & CBC Assessments    | Daily marking, CAT/Exam scoring, EE/ME/AE/BE rating logic    | ✅ Complete |
| 11   | Report Card Generation          | Class ranking algorithms, mean calculations, PDF generation  | ✅ Complete |
| 12   | Fee Management & Finance        | Fee structure, term invoicing, payment recording, M-Pesa     | ✅ Complete |
| 13   | Communication & AI Assistant    | Announcements, direct messaging, Gemini Pro chatbot          | ✅ Complete |
| 14   | Hardware & Software Setup       | School computer setup, cloud deployment on Render/Cloudflare | ✅ Complete |
| 15   | Data Conversion & Training      | Legacy data entry, staff hands-on workshops, user manual     | 🟡 In Prog  |
| 16   | Pilot Run & System Handover     | Parallel system conversion, UAT sign-off, final handover     | 📋 Scheduled|

---

## 11. INSTALLATION & CONVERSION PLANS

### 11.1 Hardware Installation Plan

The hardware deployment plan specifies the on-premise physical infrastructure required at Kyamatu Primary School alongside cloud servers.

#### 11.1.1 On-Premise School Equipment
- **Administrative Workstations:** 3 desktop computers located in the Headteacher's Office, Deputy's Office, and Accounts/Bursar Office.
  - *Minimum Specification:* Intel Core i3 (10th Gen+), 8 GB DDR4 RAM, 256 GB SSD, 1080p Monitor, Keyboard & Mouse.
- **Staff Room Laptops / Terminals:** 2 shared laptops for class teachers to record attendance and enter examination marks.
- **Local Network Infrastructure:**
  - 1 × 8-Port Gigabit Ethernet Switch connecting office computers.
  - 1 × Dual-Band Wi-Fi 6 Router providing coverage across the administrative block and staff room.
  - 1 × 4G LTE Backup Router with Safaricom data SIM card ensuring uninterrupted internet access during fiber downtime.
- **Power Backup (UPS):** 3 × 650VA Uninterruptible Power Supply (UPS) units protecting office workstations from power surges and outages.
- **Multifunction Heavy-Duty Printer/Scanner:** Dedicated network printer for producing official physical report cards and fee receipts.

#### 11.1.2 Cloud Infrastructure Provisioning
- **Web Application Host:** Render.com web service running Node.js 20 environment with automated health checks.
- **Database Engine:** Managed PostgreSQL 15 on Render.com configured with automated daily snapshots.
- **Caching & Rate Limiter:** Managed Redis instance.
- **Content Delivery Network:** Cloudflare Pages providing global CDN caching and automated SSL/TLS certificates.

### 11.2 Software Installation Plan

The software installation sequence follows a disciplined, automated deployment pipeline:

#### Step 1: Server Runtime Configuration
```bash
# Clone production repository
git clone https://github.com/MuthamiM/KYAMATU-SMS.git /var/www/kyamatu-sms
cd /var/www/kyamatu-sms/backend

# Install production dependencies
npm ci --only=production

# Configure environment variables
cp .env.example .env.production
# Edit production DATABASE_URL, JWT_SECRET, REDIS_URL, PORT
```

#### Step 2: Database Schema Deployment
```bash
# Run database migrations
npx prisma migrate deploy

# Seed core system tables (CBC Grades, Default Subjects, Super Admin)
npm run db:seed
```

#### Step 3: Frontend Deployment
```bash
# Build optimized static distribution
cd /var/www/kyamatu-sms/frontend
npm ci
npm run build
# Deploy 'dist' directory to Cloudflare Pages
```

#### Step 4: Client Workstation Configuration
- Installation of modern web browsers (Google Chrome v120+ or Mozilla Firefox v125+) on all school PCs.
- Configuration of desktop bookmarks pointing to the KYAMATU-SMS web portal (`https://kyamatu.ac.ke`).
- Installation of Adobe Acrobat Reader for viewing and printing generated PDF report cards and fee invoices.

### 11.3 Activities of Conversion

The conversion process transitions Kyamatu Primary School from manual paper ledgers to the digital database:

| Activity Code | Conversion Task                                    | Source Medium         | Target Entity      | Verification Method                 |
|---------------|----------------------------------------------------|-----------------------|--------------------|-------------------------------------|
| CNV-01        | Extraction of active student registry               | Paper Admission Books | `Student` table    | Headcount match against class lists |
| CNV-02        | Guardian contact details compilation               | Paper Admission Forms | `Guardian` table   | Verification phone calls / SMS      |
| CNV-03        | Teaching staff records and TSC numbers              | Staff Registry Files  | `Staff` table      | Verification against TSC letters    |
| CNV-04        | Academic structure setup (PP1 to Grade 9)          | KICD Guidelines       | `Grade`, `Subject` | Curriculum coordinator sign-off     |
| CNV-05        | Opening fee balance computation                    | Paper Ledger / Cashbook| `StudentInvoice`  | Bursar audit reconciliation         |
| CNV-06        | Legacy academic assessment history (Term 1 & 2)     | Mark Sheets           | `AssessmentScore`  | Class teacher spot-checks           |
| CNV-07        | Automated data validation & cleaning scripts       | CSV Ingestion Files   | PostgreSQL DB      | Schema constraint check, zero errors|

### 11.4 System Conversion Strategy

To eliminate operational risk and prevent disruptions to learning, Kyamatu Primary School adopts a **Parallel Conversion Strategy** for a duration of **4 weeks (one month)**, followed by a phased cutover.

```
Week 1 - 4: PARALLEL RUN
┌────────────────────────────────────────────────────────┐
│  Manual System (Paper Registers & Ledgers)            │ ◄─── Continues as Legal Fallback
└────────────────────────────────────────────────────────┘
                           ▲
                           │ Daily Reconciliation & Audit
                           ▼
┌────────────────────────────────────────────────────────┐
│  KYAMATU-SMS Digital Web Platform                      │ ◄─── Primary Data Entry
└────────────────────────────────────────────────────────┘

Week 5 onwards: DIRECT CUTOVER (System Becomes Single Source of Truth)
```

#### Justification for Parallel Strategy:
- **Zero Risk to School Records:** If power or connectivity is interrupted, school operations continue on paper without disruption.
- **Data Cross-Verification:** Mark sheets and fee balances entered in KYAMATU-SMS are cross-referenced weekly against the physical cash book and mark book to prove 100% calculation accuracy.
- **User Confidence Building:** School staff gain hands-on operational confidence while knowing their familiar manual paper backup remains active.

#### Exit Criteria from Parallel Run:
1. Four consecutive weeks of 100% reconciliation between manual fee totals and KYAMATU-SMS fee reports.
2. Zero critical system downtime incidents during normal school operating hours (8:00 AM – 5:00 PM).
3. 100% of teaching staff successfully recording daily attendance and terminal marks without developer assistance.
4. Formal written cutover approval signed by the Headteacher and School Board.

---

## 12. TRAINING PLAN

### 12.1 Training Objectives
- Ensure 100% of administrative and teaching staff are proficient in using KYAMATU-SMS for their daily duties.
- Equip the school bursar with the skills to generate invoices, record payments, and reconcile receipts independently.
- Enable class teachers to input CBC competency ratings and produce standardized report cards.
- Familiarize students and parents with self-service features (viewing results and fee balances).

### 12.2 Target Stakeholder Groups

| Group | Target Audience                | Headcount | Focus Areas                                      |
|-------|--------------------------------|-----------|--------------------------------------------------|
| G-1   | School Administrators & Clerks | 3         | Admissions, student promotion, user accounts     |
| G-2   | Class Teachers & Subject Leads | 14        | Daily attendance, score entry, CBC competencies  |
| G-3   | Bursar & Accounts Staff        | 2         | Fee structures, invoice dispatch, payment entry  |
| G-4   | Students (Grades 6–9)          | 120       | Student portal navigation, timetable, AI tutor   |
| G-5   | Parents & Guardians            | 200+      | Performance checking, fee balance tracking       |

### 12.3 Training Methods

To accommodate different technical proficiencies, a **blended training methodology** is implemented:

```
                  ┌─────────────────────────────────────────┐
                  │      BLENDED TRAINING FRAMEWORK         │
                  └────────────────────┬────────────────────┘
                                       │
     ┌──────────────────┬──────────────┴─────┬──────────────────┐
     ▼                  ▼                    ▼                  ▼
[ Hands-on Labs ]  [ Role Workshops ]  [ Video Tutorials ] [ Printed Manuals ]
Interactive PC     Scenario-based      Self-paced screen   Quick-reference
guided exercises   group sessions      recordings          cheat-sheets
```

1. **Interactive Hands-On Workshops:** Held in the school computer lab where each participant operates a real terminal running simulated test data.
2. **Role-Specific Scenario Training:** Real-life simulation drills (e.g., "Admitting a new Grade 4 pupil", "Recording Term 2 fee payment of KES 5,000", "Compiling terminal report card").
3. **Train-the-Trainer (Champion Model):** Training two tech-savvy teachers to act as on-site First-Line Champions who assist other teachers.
4. **Printed Visual Job Aids & Quick-Reference Cards:** Laminated 1-page step-by-step guides placed at every workstation for frequent workflows.
5. **Video Walkthroughs:** 3-to-5 minute screen recordings hosted on a shared school drive demonstrating key tasks.

### 12.4 Training Schedule & Curriculum

| Session | Target Group | Duration | Module Covered                                       | Delivery Method        |
|---------|--------------|----------|------------------------------------------------------|------------------------|
| Day 1   | Admin (G-1)  | 4 Hours  | System Security, User Creation, Student Admissions    | Hands-on Workshop      |
| Day 2   | Teachers(G-2)| 4 Hours  | Daily Attendance, Class Register, Timetable View     | Hands-on Lab           |
| Day 3   | Teachers(G-2)| 4 Hours  | Assessment Entry, CBC EE/ME/AE/BE Ratings, Remarks    | Hands-on Lab           |
| Day 4   | Bursar (G-3) | 4 Hours  | Invoicing, Fee Categories, Cash/M-Pesa Reconciliation| 1-on-1 Practical Session|
| Day 5   | All Staff    | 3 Hours  | Report Card Generation, PDF Export, Printing         | Joint Demonstration    |
| Day 6   | Students(G-4)| 1 Hour   | Student Portal Login, Timetable, AI Study Assistant  | Lab Orientation        |
| AGM     | Parents (G-5)| 45 Mins  | Accessing student results, understanding CBC ratings | Presentation at Parents Day |

### 12.5 Training Materials & Evaluation
- **Comprehensive User Manual:** Full-color manual provided in both PDF and printed spiral-bound format.
- **Evaluation Assessment:** Practical 15-minute competency test at the end of each workshop. Staff must achieve 100% completion on standard operations before receiving production credentials.

---

## 13. SOFTWARE MAINTENANCE PLAN

To ensure KYAMATU-SMS remains secure, reliable, and compliant with evolving Ministry of Education directives, a structured **Four-Tier Maintenance Model** is established:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SOFTWARE MAINTENANCE FRAMEWORK                       │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ 1. CORRECTIVE      │ 2. ADAPTIVE        │ 3. PERFECTIVE  & PREVENTIVE  │
│ Bug fixes, crash   │ CBC curriculum     │ Speed optimization, database │
│ resolution, data   │ policy changes,    │ index tuning, automated      │
│ repair within SLA  │ browser updates    │ security dependency updates  │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

### 13.1 Corrective Maintenance
Focuses on identifying and resolving software bugs and errors discovered during production use:
- **Severity 1 (Critical):** System crash, inability to log in, data corruption. Fix deployed within **4 hours**.
- **Severity 2 (High):** Major functional defect (e.g., report card generation failing). Fix deployed within **24 hours**.
- **Severity 3 (Medium):** Minor defect with an available workaround (e.g., visual chart glitch). Resolved within **5 business days**.
- **Severity 4 (Low):** Cosmetic UI layout or text typo. Addressed in scheduled monthly patch updates.

### 13.2 Adaptive Maintenance
Ensures the software adapts to environmental and regulatory changes:
- **Ministry of Education / KICD Changes:** Modifications to learning areas, grading boundaries, or national assessment reporting formats.
- **External Integration Updates:** Keeping M-Pesa Daraja API, Google Calendar OAuth, and Gemini AI SDKs updated to their latest API versions.
- **Browser Compatibility:** Accommodating updates in Chromium and Gecko rendering engines.

### 13.3 Perfective Maintenance
Enhances existing features and system efficiency based on user feedback:
- Query optimization on the student grading and report card aggregation pipelines.
- Implementation of additional visual dashboard charts and export options (Excel/CSV).
- Streamlining data entry workflows to minimize the number of clicks required to mark attendance.

### 13.4 Preventive Maintenance
Proactive activities to prevent errors before they occur:
- Automated weekly dependency audits via `npm audit` and GitHub Dependabot to patch known security vulnerabilities.
- Database index defragmentation and unused record cleanup.
- Periodic review of application error logs via Winston logging to catch silent exceptions.

### 13.5 Maintenance Workflow, SLAs & Backup Strategy

#### Maintenance Workflow
```
Issue Discovered ──► Logged in GitHub Issues ──► CCB Triage ──► Dev Branch Fix
                             ▲                                       │
                             │                                       ▼
                       Close Issue ◄── Production Deploy ◄── Staging Test Verification
```

#### Database Backup & Disaster Recovery SLA
- **Automated Daily Backups:** Managed PostgreSQL automated snapshots scheduled every midnight (EAT).
- **Weekly Offsite Dumps:** Encrypted `pg_dump` backups exported to secure cloud storage every Friday.
- **Recovery Point Objective (RPO):** Maximum 24 hours of data loss in a catastrophic failure scenario.
- **Recovery Time Objective (RTO):** Full system restoration within **2 hours** using Docker or cloud automated provisioning.

---

## 14. CHANGE MANAGEMENT PLAN

### 14.1 Change Management Objectives
Implementing KYAMATU-SMS introduces cultural and operational changes within Kyamatu Primary School. The Change Management Plan ensures:
- Structured governance over any new feature requests or system modifications.
- Minimal disruption to ongoing teaching and academic schedules.
- Active mitigation of user resistance through transparent communication and support.

### 14.2 Change Control Board (CCB)

All changes to the software baseline are reviewed and approved by the **Change Control Board (CCB)**:

| CCB Member                     | Role & Perspective                                  |
|--------------------------------|-----------------------------------------------------|
| Headteacher (Chairperson)      | School policy, compliance, strategic approval       |
| Senior Teacher / Curriculum Lead| Academic accuracy, teacher workload assessment     |
| School Bursar                  | Financial integrity, fee collection implications    |
| Lead Developer (System Admin)  | Technical feasibility, security, effort estimation  |

### 14.3 Change Request Lifecycle

```
[ 1. Change Request Submission (CR Form) ]
                    │
                    ▼
[ 2. Technical & Operational Impact Analysis ]
                    │
                    ▼
[ 3. CCB Review Meeting (Approve / Reject / Defer) ]
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
   [ Approved ]            [ Rejected ] ──► Feedback to Requester
        │
        ▼
[ 4. Development in Feature Branch ]
        │
        ▼
[ 5. Testing & User Sign-Off in Staging ]
        │
        ▼
[ 6. Production Release & Updated User Manual ]
```

### 14.4 Stakeholder Transition & Resistance Management

#### Identified Resistance Risks & Countermeasures:
1. **Fear of Technology / Low Computer Literacy:**
   - *Mitigation:* Pair less experienced staff with designated "Teacher Tech Champions"; provide extensive, non-judgmental 1-on-1 coaching.
2. **Perceived Extra Workload During Parallel Run:**
   - *Mitigation:* Clear communication from the Headteacher explaining that the paper run is strictly temporary (4 weeks); provision of dedicated administrative time slots for record entry.
3. **Anxiety Regarding Financial Accountability:**
   - *Mitigation:* Reassure staff that system audit logs protect employees against false accusations by maintaining verifiable proof of every payment recorded.
4. **Continuous Feedback Mechanism:**
   - A physical suggestion box and a digital feedback form in the portal allow teachers to suggest improvements directly to the project team.

---

## 15. DEPLOYMENT & INFRASTRUCTURE

### 15.1 Production Cloud Topology

| Component         | Provider         | Instance Configuration        | Redundancy / Availability |
|-------------------|------------------|-------------------------------|---------------------------|
| Backend API       | Render.com       | Node.js 20 Web Service (Linux)| Auto-restart on failure   |
| Database Engine   | Render.com       | PostgreSQL 15 Managed DB      | Automated daily backups   |
| Application Cache | Render.com       | Redis In-Memory Store         | Persistence enabled       |
| Frontend Host     | Cloudflare Pages | Edge Global CDN               | 99.99% Global Uptime      |
| SSL/TLS Layer     | Cloudflare       | Full (Strict) Universal SSL   | Auto-renewed certificates |

### 15.2 Environment Configuration Checklist
- `NODE_ENV=production` enforced across all backend instances.
- Secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL`) stored securely in encrypted cloud environment settings.
- CORS policies strictly whitelisted to the official school frontend domain.

---

## 16. RISK MANAGEMENT

| # | Risk Description                      | Likelihood | Impact | Mitigation Strategy                                        |
|---|---------------------------------------|------------|--------|------------------------------------------------------------|
| 1 | Power failure during marks entry      | High       | Medium | UPS units on all office PCs; auto-save on form inputs      |
| 2 | Internet connectivity downtime        | Medium     | High   | Dual-SIM 4G fallback router; offline-tolerant data drafts   |
| 3 | Teacher resistance during parallel run| Medium     | Medium | Active leadership backing, champion peer support, job aids |
| 4 | Data entry errors in legacy migration | Medium     | High   | 100% double-entry audit between physical books and DB      |
| 5 | Unauthorized credential sharing       | Low        | High   | Enforced session timeouts; individual named accounts only  |

---

## 17. CONCLUSION

This comprehensive Implementation Plan provides a practical, structured framework for institutionalizing the **Kyamatu Primary School Management System (KYAMATU-SMS)**. By addressing not only the technical installation of software and hardware, but also the critical activities of legacy data conversion, parallel conversion strategy, multi-role training, 4-tier software maintenance, and change management governance, this document ensures the system achieves long-term operational success.

With strict alignment to Kenya's Competency-Based Curriculum and robust safeguards against operational disruptions, KYAMATU-SMS is fully prepared for successful deployment and sustainable ownership by Kyamatu Primary School.

---

## 18. REFERENCES

1. Kenya Institute of Curriculum Development (KICD). (2017). *Basic Education Curriculum Framework.* Nairobi: KICD.
2. Pressman, R. S., & Maxim, B. R. (2020). *Software Engineering: A Practitioner's Approach* (9th ed.). New York: McGraw-Hill.
3. Sommerville, I. (2016). *Software Engineering* (10th ed.). Boston: Pearson.
4. IEEE Computer Society. (2014). *Guide to the Software Engineering Body of Knowledge (SWEBOK Guide v3.0).* IEEE.
5. Prisma Documentation. (2024). *Production Database Migration Best Practices.* https://www.prisma.io/docs
6. Node.js Foundation. (2024). *Node.js Enterprise Application Architecture Guidelines.* https://nodejs.org

---

**Prepared by:** Musa Muthami Mwange (23/05037)  
**Supervised by:** Deborah Mbula  
**Course:** STU 4201 — Final Year Project II (Stream A, PTDL)  
**Institution:** KCA University, School of Technology  
**Date:** October 2026
