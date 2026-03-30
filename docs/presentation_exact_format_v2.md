---
marp: true
theme: default
class: lead
paginate: true
backgroundColor: #ffffff
style: |
  section { font-family: 'Segoe UI', system-ui, sans-serif; font-size: 26px; }
  h1 { color: #0f172a; font-size: 1.8rem; }
  h2 { color: #1d4ed8; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3rem; font-size: 1.4rem; }
  li { font-size: 0.95rem; line-height: 1.4; margin-bottom: 0.4rem; }
  p { font-size: 0.95rem; line-height: 1.4; margin-bottom: 0.4rem; }
  table { width: 100%; font-size: 0.5em; border-collapse: collapse; }
  th, td { border: 1px solid #cbd5e1; padding: 2px; text-align: left; }
  th { background-color: #f8fafc; color: #1e293b; }
---

# School Management System for Kyamatu Primary School
**Candidate’s Name:** Mwange Musa Muthami
**Registration Number:** 23/05037
**Submission Date:** February 2026
**Supervisor:** Dr. Kevin Mugoye Sindu / Dr. Simon N. Mwendia
**Course:** Bachelor of Information Technology (BIT 3105)

---

# CHAPTER ONE

## 1. Background

- **Client Business:** Kyamatu Primary School is a public institution in Voo, Kitui County, providing primary education under the Competency-Based Curriculum (CBC).
- **Current Operations:** Core operations including student enrollment, attendance tracking, formative grading, and fee collection are conducted manually.
- **Problem Context:** The manual nature of these operations creates a highly inefficient, paper-intensive environment susceptible to data degradation.

---

## 2. Problem Statement

The reliance on manual administrative systems leads to severe operational bottlenecks.

- **Data Degradation:** Educational reports show a **15% degradation** of student academic records across transition years when using physical files.
- **Time Loss:** Financial reconciliations result in an estimated **30% loss of administrative time** per term.
- **Parental Disconnect:** Parents face a blind spot, requiring physical school visits to track attendance or fee arrears.

---

## 3. Proposed System

A centralized, cloud-hosted **Academic Information Management System**.

**Major Functionality/Features:**
- **Role-Based Web Portals:** Secure dashboards for Staff, Bursars, and Parents.
- **Automated CBC Engine:** Algorithmic computation of formative grades (EE, ME, AE, BE).
- **Digital QR Attendance:** Real-time web-based scanning for instant classroom check-ins.
- **M-Pesa FinTech Integration:** Automated fee reconciliation via Safaricom Daraja API.

---

## 4. Objectives (Part 1/2)

### System Objectives
*What the system is expected to accomplish:*

1. **To automate** the computation of CBC-aligned grades into digital PDF report cards.
2. **To track** and validate daily student classroom attendance instantly using a Web-QR module.
3. **To integrate** a mobile money channel (M-Pesa Daraja API) to process and automatically reconcile school fee payments.
4. **To centralize** student profiling and staff allocations onto a unified, cloud database.

---

## 4. Objectives (Part 2/2)

### Research Objectives
*What will be strictly investigated during the project:*

1. **To investigate** the specific data loss points and administrative delays within Kyamatu's manual systems.
2. **To find out** the digital literacy levels among the teaching staff and parental demographic.
3. **To design** a scalable Entity-Relationship model and systemic architecture.
4. **To develop** a full-stack, cloud-hosted progressive web application.

---

## 5. Significance of the Project

**To the Organization:** 
- Drastically cuts administrative man-hours spent on manual data entry and ledger balancing.
- Provides administrators with real-time dashboards for swift, resource-backed decision making.

**To Society as a whole:** 
- Empowers parents with remote, real-time visibility into their child's academic progress.
- Provides a secure, transparent, and remote avenue for financial fee transactions.

---

# CHAPTER TWO

## Literature Review

**1. ShulePro**
- *Review:* A legacy desktop-based software.
- *Missing Features:* Lacks cloud accessibility for remote parental access. Relies on standard summative grading rather than a natively integrated CBC module. No remote M-Pesa API integration.

**2. Zeraki Analytics**
- *Review:* A cloud-based academic tracking service for secondary schools.
- *Missing Features:* Overly complex and optimized for the 8-4-4 ranking system. Lacks a direct, user-facing M-Pesa STK checkout tailored for small-scale primary school levies.

---

# CHAPTER THREE

## Methodology

### a) Research Methodology
- **Data Collection Methods:** Qualitative semi-structured interviews.
- **Target Population:** Administrative staff and teaching cohorts.
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
| | Backend Hosting (Render PAAS) | 6,000 |
| **Human/Other**| ISP Subscription (High-Speed Access during Dev) | 5,000 |
| | Document Formatting & Defense Binding | 3,000 |
| | **Total Envisaged Budget** | **99,000** |

---

## 7. Project schedule

| Task No. | Description | No. of hrs | Subtask hrs | Planned Start | Actual Start | Planned End | Actual End | Deliverables |
|---|---|---|---|---|---|---|---|---|
| 1 | Proposal | 40 | - | 01/09/2025 | | 15/09/2025 | | Proposal Doc |
| 2 | Srs | 30 | - | 16/09/2025 | | 30/09/2025 | | SRS Document |
| 3 | Design | 45 | - | 01/10/2025 | | 20/10/2025 | | UI Mockups |
| 4 | Test plan | 15 | - | 21/10/2025 | | 30/10/2025 | | Test Plan |
| 5 | Implementation | 120| - | 01/11/2025 | | 30/01/2026 | | System Build |
| 6 | Maintenance | 10 | - | 01/02/2026 | | 05/02/2026 | | Maint. Schedule |
| 7 | User manual | 20 | - | 06/02/2026 | | 15/02/2026 | | User Manual |
| 8 | Final report | 30 | - | 16/02/2026 | | 28/02/2026 | | Final Report |

---

## References

1. Ministry of Education. (2023). *Basic Education Information Management Systems*. Republic of Kenya.
2. Pressman, R. S. (2014). *Software Engineering: A Practitioner's Approach*. McGraw-Hill.
3. ShulePro. (2021). *School Administration Software Overview*. https://www.shulepro.com
4. Sommerville, I. (2015). *Software Engineering*. Pearson.
5. Zeraki Analytics. (2023). *Transforming Education through Data*. https://zeraki.co.ke
