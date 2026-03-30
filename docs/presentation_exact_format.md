---
marp: true
theme: default
class: lead
paginate: true
backgroundColor: #ffffff
style: |
  section { font-family: 'Segoe UI', system-ui, sans-serif; }
  h1 { color: #0f172a; font-size: 2.2rem; }
  h2 { color: #1d4ed8; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
  li { font-size: 1.1rem; line-height: 1.5; margin-bottom: 0.5rem; }
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
<!-- class: default -->

# CHAPTER ONE

## 1. Background

- **Client Business:** Kyamatu Primary School is a public institution in Voo, Kitui County, providing primary education under the Competency-Based Curriculum (CBC).
- **Current Operations:** Core operations including student enrollment, attendance tracking, formative grading, and fee collection are conducted manually using physical ledgers, paper receipts, and physical record books.
- **Stage for Problems:** The manual nature of these operations creates a highly inefficient, paper-intensive environment susceptible to data degradation.

---

## 2. Problem Statement

The reliance on manual administrative systems leads to severe operational bottlenecks, data vulnerability, and parental disconnect.

- **Impact & Extent:** 
  - Educational ICT reports indicate a **15% degradation** of student academic records across transition years when using fragmented physical files.
  - Financial reconciliations and terminal report generation result in an estimated **30% loss of administrative time** per term.
  - Parents face an information blind spot, requiring physical school visits to track attendance or fee arrears.

---

## 3. Proposed System

A centralized, cloud-hosted **Academic Information Management System** tailored for Kyamatu Primary.

**Major Functionality/Features:**
- **Role-Based Web Portals:** Secure dashboards for Staff, Bursars, and Parents.
- **Automated CBC Engine:** Algorithmic computation of formative grades (EE, ME, AE, BE) into natively generated PDFs.
- **Digital QR Attendance:** Real-time web-based scanning for instant classroom check-ins.
- **M-Pesa FinTech Integration:** Automated fee reconciliation via Safaricom Daraja API webhooks.

*(Note: This is an intelligent automation system, not merely a digital filing cabinet).*

---

## 4. Objectives (1/2)

### System Objectives
*Clear, concise "SMART" objectives the system is expected to accomplish:*

1. **To automate** the computation of CBC-aligned grades into digital PDF report cards, reducing terminal reporting time.
2. **To track** and validate daily student classroom attendance instantly using a Web-QR scanning module.
3. **To integrate** a mobile money channel (M-Pesa Daraja API) to process and automatically reconcile school fee payments.
4. **To centralize** student profiling and staff allocations onto a unified, cloud-hosted database.

---

## 4. Objectives (2/2)

### Research Objectives
*What will be intended/done in the course of the project:*

1. **To investigate** the specific data loss points and administrative delays within Kyamatu's existing manual systems.
2. **To find out** the digital literacy levels and hardware accessibility among the teaching staff and parental demographic.
3. **To design** a scalable Entity-Relationship model and systemic architecture that bridges parent-school communication.
4. **To develop** and deploy a full-stack, cloud-hosted progressive web application.
5. **To test** the system's accuracy in processing concurrent M-Pesa payments and CBC grading algorithms.

---

## 5. Significance of the Project

- **To the Organization:** 
  - Drastically cuts administrative man-hours spent on manual data entry and ledger balancing.
  - Provides administrators with real-time empirical data (dashboards) for swift, resource-backed decision making.
- **To Society as a whole:** 
  - Empowers parents with remote, real-time visibility into their child's academic progress and attendance.
  - Provides a secure, transparent, and remote avenue for financial fee transactions.

---

# CHAPTER TWO

## Literature Review

**1. ShulePro**
- *Overview:* A legacy desktop-based school administration software for exam processing.
- *Missing Features:* Lacks cloud accessibility for remote parental access. Relies on standard summative grading rather than a natively integrated CBC formative assessment module. Has no remote M-Pesa API integration.

**2. Zeraki Analytics**
- *Overview:* A comprehensive cloud-based academic tracking service for secondary schools.
- *Missing Features:* Overly complex and optimized for the 8-4-4 secondary ranking system. Lacks a direct, user-facing M-Pesa STK prompt checkout portal tailored for small-scale primary school fee levies.

---

# CHAPTER THREE

## Methodology

### a) Research Methodology
- **Data Collection Methods:** Qualitative semi-structured interviews and ethnographic observation.
- **Target Population:** Administrative staff (Headteacher, Bursar) and teaching cohorts.
- **Sampling:** Non-probability purposive sampling.

### b) Development Methodology
- **Model:** Agile Development Methodology (Scrum model). 
- *Justification:* Iterative sprints enable continuous stakeholder feedback, progressive feature integration, and early functionality testing.

---

## 6. Budget and resources

| Item Description | Quantity / Detail | Estimated Cost (KES) |
|:---|:---|---:|
| **Hardware** | Primary Dev Workstation (i5 Processor, 8GB RAM, SSD) | 65,000 |
| | Android Testing Device (QR Scanning / STK Evaluation) | 20,000 |
| **Software** | Frontend Hosting (Cloudflare Pages) | 0 (Free Tier) |
| | Backend Hosting & Managed PostgreSQL (Render PAAS) | 6,000 |
| **Human/Other**| ISP Subscription (High-Speed Access during Dev) | 5,000 |
| | Document Formatting, Printing & Defense Binding | 3,000 |
| | **Total Envisaged Budget** | **99,000** |

---

## 7. Project schedule

| Task No. | Description | No. of hrs | Subtask No. of hrs | Planned Start Date | Actual Start Date | Planned Completion Date | Actual Completion Date | Deliverables |
|---|---|---|---|---|---|---|---|---|
| 1 | Proposal | 40 | - | 01/09/2025 | | 15/09/2025 | | Proposal Document |
| 2 | Srs | 30 | - | 16/09/2025 | | 30/09/2025 | | SRS Document |
| 3 | Design | 45 | - | 01/10/2025 | | 20/10/2025 | | UI Mockups & ERDs |
| 4 | Test plan | 15 | - | 21/10/2025 | | 30/10/2025 | | Test Plan |
| 5 | Implementation Plan | 120| - | 01/11/2025 | | 30/01/2026 | | System Build |
| 6 | Maintenance plan | 10 | - | 01/02/2026 | | 05/02/2026 | | Maintenance Schedule |
| 7 | User manual | 20 | - | 06/02/2026 | | 15/02/2026 | | User Manual |
| 8 | Final report | 30 | - | 16/02/2026 | | 28/02/2026 | | Final Signed Report |

---

## References

1. Ministry of Education. (2023). *Basic Education Information Management Systems*. Republic of Kenya.
2. Pressman, R. S. (2014). *Software Engineering: A Practitioner's Approach*. McGraw-Hill.
3. ShulePro. (2021). *School Administration Software Overview*. https://www.shulepro.com
4. Sommerville, I. (2015). *Software Engineering*. Pearson.
5. Zeraki Analytics. (2023). *Transforming Education through Data*. https://zeraki.co.ke
