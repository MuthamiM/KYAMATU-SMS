---
marp: true
theme: default
class: lead
paginate: true
backgroundColor: #ffffff
style: |
  section { font-family: 'Segoe UI', system-ui, sans-serif; font-size: 20px; }
  h1 { color: #0f172a; font-size: 1.8rem; }
  h2 { color: #1d4ed8; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3rem; font-size: 1.4rem; }
  li { font-size: 0.95rem; line-height: 1.5; margin-bottom: 0.6rem; }
  p { font-size: 0.95rem; line-height: 1.5; margin-bottom: 0.6rem; }
  table { width: 100%; font-size: 0.55em; border-collapse: collapse; }
  th, td { border: 1px solid #cbd5e1; padding: 4px; text-align: left; }
  th { background-color: #f8fafc; color: #1e293b; }
---

# School Management System for Kyamatu Primary School
**Candidate’s Name:** Mwange Musa Muthami
**Registration Number:** 23/05037
**Submission Date:** February 2026
**Name of Supervisor:** Dr. Kevin Mugoye Sindu / Dr. Simon N. Mwendia
**Course/Qualification:** Bachelor of Information Technology (BIT 3105)

---

# CHAPTER ONE

## 1. Background

This project addresses the critical academic and administrative infrastructure gaps at Kyamatu Primary School, a public government-funded institution located in Voo, Kitui County. 

- **Client Business Operations:** The institution's primary mandate is providing foundational education from Pre-Primary 1 (PP1) through Grade 9 under the national Competency-Based Curriculum (CBC) framework.
- **Current Operational Paradigm:** Currently, 100% of the school's core administrative functions—including student admissions, daily class attendance tracking, formative CBC grading, and financial levy collections—are executed using manual, paper-based ledgers, physical receipt books, and handwritten terminal report cards.
- **Emerging Problems:** This archaic setup acts as the catalyst for severe operational bottlenecks, creating an environment highly susceptible to data degradation, arithmetic transcription errors, and absolute parental disconnect from real-time school metrics.

---

## 2. Problem Statement

The continued reliance on manual, paper-based administrative systems at Kyamatu Primary School fundamentally cripples operational efficiency, data integrity, and stakeholder communication. 

- **Data Degradation & Inaccuracy:** According to the Ministry of Education's ICT integration reports (2023), rural public schools relying on physical infrastructure experience up to a 15% rate of student academic data loss or degradation across transition years. 
- **Administrative Time Loss:** The manual computation of complex CBC formative grades (Exceeding, Meeting, Approaching, Below Expectations) and the manual reconciliation of physical fee receipts results in an estimated loss of 30% of total administrative working hours per term for teachers and the bursar.
- **Stakeholder Disconnect:** Parents operate in a complete information blind spot. They possess no remote mechanism to verify their child's daily class attendance, academic trajectory, or current financial arrears, necessitating disruptive physical campus visits.

---

## 3. Proposed System

The proposed solution is a highly modular, cloud-hosted **Academic Information Management System** dynamically tailored to automate operations at Kyamatu Primary School.

**Major System Functionalities & Architecture:**
- **Role-Based Access Control (RBAC):** Hierarchical, secure web portals specifically tailored for School Administrators, Home-room Teachers, the Bursar, Students, and Parents.
- **CBC Formative Assessment Engine:** A native algorithmic module that maps raw student scores directly against national Competency-Based Curriculum parameters, automatically aggregating them into downloadable PDF report cards rendered directly in the browser.
- **Web-QR Digital Attendance:** A novel, real-time classroom check-in module empowering teachers to validate daily student presence via mobile QR scanning, instantly updating the central database.
- **FinTech Ecosystem Integration:** An integrated financial gateway leveraging Safaricom's Daraja API (M-Pesa STK Push). This allows parents to settle school levies remotely via mobile money, triggering automated webhooks that reconcile the school’s digital fee ledgers without human intervention.

---

## 4. Objectives (1/2)

### System Objectives
*Clear, concise "SMART" objectives outlining precisely what the operational software will accomplish to solve the identified client problems:*

1. **To automate** the tedious, manual computation of CBC-aligned student performance scores into natively generated, downloadable digital PDF report cards, thereby eliminating terminal arithmetic errors.
2. **To track** and validate daily classroom student attendance in real-time by deploying a modernized Web-QR biometric scanning module for teaching staff.
3. **To integrate** a secure, remote mobile money payment gateway utilizing the Safaricom Daraja API (M-Pesa STK Push) to process, record, and automatically reconcile school fee settlements.
4. **To centralize** student profiles, staff allocations, and institutional financial records onto a unified, cloud-hosted PostgreSQL database, drastically reducing data retrieval times for the administration.

---

## 4. Objectives (2/2)

### Research Objectives
*The deliberate academic methodologies and investigations intended to be carried out during the project lifecycle:*

1. **To investigate** the specific structural data loss points, archiving bottlenecks, and physical vulnerabilities within Kyamatu Primary School's existing manual registry infrastructure.
2. **To find out** the baseline digital literacy levels, hardware accessibility, and smartphone penetration among the teaching staff and rural parental demographic to ensure system viability.
3. **To design** a scalable, normalized Entity-Relationship database model (ERD) and a robust progressive web application architecture that effectively bridges the communication gap between the school and parents.
4. **To develop** and fully deploy a functional, multi-tenant cloud application utilizing modern full-stack web technologies (React.js, Node.js, Express, and PostgreSQL).
5. **To test** and evaluate the system's payload accuracy, specifically regarding concurrent high-volume M-Pesa webhook callback processing and CBC grading algorithm stability.

---

## 5. Significance of the Project

**Benefits to the Organization (Kyamatu Primary School):** 
- Significantly reduces the exorbitant administrative man-hours traditionally squandered on manual ledger balancing, terminal report writing, and attendance tallying.
- Provides the school administration with comprehensive, real-time graphical data dashboards, enabling swift, quantifiable, and evidence-based decision-making regarding resource allocation and student interventions.
- Eradicates vulnerabilities associated with physical paper storage, guaranteeing absolute digital data integrity.

**Benefits to Society (Parents and Guardians):** 
- Empowers the parental demographic with unprecedented, remote visual access to their child's academic progression and daily attendance metrics.
- Introduces an entirely secure, transparent, and immediate avenue for settling financial fee obligations via mobile money, saving parents from disruptive physical banking or school visits.

---

# CHAPTER TWO

## Literature Review
*Reviewing existing proprietary platforms to map systemic gaps the proposed solution must fill.*

**1. ShulePro**
- *Review:* ShulePro is a prominent, legacy desktop-based school administration software widely utilized across East Africa for examination processing and fee tracking.
- *Missing Features:* As a localized desktop application, it fundamentally lacks a modern, multi-tenant cloud architecture, offering zero remote portal access for parents. Furthermore, it operates primarily on standard summative 8-4-4 grading methodologies, completely lacking a highly customized, automated CBC formative assessment tracking module tailored to the new Kenyan curriculum.

**2. Zeraki Analytics**
- *Review:* A powerful and highly advanced cloud-based academic tracking service, heavily utilized by major secondary schools for data aggregation and SMS communication.
- *Missing Features:* Zeraki's interface is overly intricate, optimized almost entirely for complex secondary school (8-4-4) subject ranking systems, making it unsuitable for a rural primary school's CBC infrastructure. Critically, it lacks an integrated, user-facing M-Pesa STK prompt checkout portal explicitly tailored for reconciling small-scale, direct primary school fee levies.

---

# CHAPTER THREE

## Methodology

### a) Research Methodology
- **Data Collection Methods:** The research will be conducted using qualitative semi-structured interviews and detailed ethnographic observation of administrative workflows.
- **Target Population:** The primary informants include the school's administrative core (Headteacher, Bursar) alongside a representative cadre of homeroom teaching staff and parents.
- **Sampling:** Non-probability purposive sampling will be utilized to exclusively target individuals processing the bulk of the institution’s academic and financial data.

### b) Development Methodology (Model)
- **Model:** The project will be engineered using the **Agile Development Methodology** (specifically the Scrum framework). 
- *Justification:* This model encompasses an all-around iterative developmental pipeline. Slicing the project into functional 'Sprints' (e.g., Sprint 1: RBAC & Database; Sprint 2: CBC Engine & QR Attendance; Sprint 3: Daraja API Webhooks) ensures constant stakeholder feedback, early bug detection, and progressive integration, rather than waiting for a rigid waterfall cycle.

---

## 6. Budget and resources

| Item Description | Quantity / Detail | Estimated Cost (KES) |
|:---|:---|---:|
| **Hardware** | Primary Dev Workstation (i5 Processor, 8GB RAM, SSD minimum) | 65,000 |
| | Android Testing Device (QR Scanning / STK Evaluation validation) | 20,000 |
| **Software** | Frontend Hosting (Cloudflare Pages Commercial CDN ecosystem) | 0 (Free Tier) |
| | Backend Hosting & Managed PostgreSQL (Render PAAS Developer Tier) | 6,000 |
| **Human/Other**| ISP Subscription (Continuous High-Speed Access during Dev) | 5,000 |
| | Document Formatting, University Printing & Formal Defense Binding | 3,000 |
| | **Total Envisaged Budget** | **99,000** |

---

## 7. Project schedule

| Task No. | Description | No. of hrs | Subtask hrs | Planned Start | Actual Start | Planned End | Actual End | Deliverables |
|---|---|---|---|---|---|---|---|---|
| 1 | Proposal | 40 | - | 01/09/2025 | | 15/09/2025 | | Proposal Document |
| 2 | Srs | 30 | - | 16/09/2025 | | 30/09/2025 | | SRS Document |
| 3 | Design | 45 | - | 01/10/2025 | | 20/10/2025 | | UI Mockups & ERDs |
| 4 | Test plan | 15 | - | 21/10/2025 | | 30/10/2025 | | Test Plan Blueprint |
| 5 | Implementation | 120| - | 01/11/2025 | | 30/01/2026 | | Core System Source Code |
| 6 | Maintenance | 10 | - | 01/02/2026 | | 05/02/2026 | | Maint. & Upgrade Schedule |
| 7 | User manual | 20 | - | 06/02/2026 | | 15/02/2026 | | Admin User Manual |
| 8 | Final report | 30 | - | 16/02/2026 | | 28/02/2026 | | Final Signed Report Book |

---

## References

- Ministry of Education. (2023). *National Guidelines on Basic Education Information Management Systems*. Republic of Kenya.
- Pressman, R. S. (2014). *Software Engineering: A Practitioner's Approach* (8th ed.). McGraw-Hill.
- ShulePro. (2021). *School Administration Software Overview*. https://www.shulepro.com
- Sommerville, I. (2015). *Software Engineering* (10th ed.). Pearson.
- Zeraki Analytics. (2023). *Transforming Education through Data*. https://zeraki.co.ke
