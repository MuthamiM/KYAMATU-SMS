---
header-includes:
  - \usepackage{setspace}
  - \doublespacing
---

<div align="center">
  <br><br><br><br>
  
  **SCHOOL MANAGEMENT SYSTEM FOR KYAMATU PRIMARY SCHOOL**
  
  <br><br><br>
  
  **MWANGE MUSA MUTHAMI**
  
  **REGISTRATION NUMBER: 23/05037**
  
  <br><br><br>
  
  **SUBMISSION DATE: FEBRUARY 2026**
  
  <br><br><br>
  
  **SUPERVISOR: DR. KEVIN MUGOYE SINDU / DR. SIMON N. MWENDIA**
  
  <br><br><br>
  
  **A PROJECT PROPOSAL SUBMITTED IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF THE DEGREE OF BACHELOR OF INFORMATION TECHNOLOGY (BIT 3105)**
  
</div>

\newpage

## DECLARATION
This project proposal is my original work and has not been presented for a degree in any other University.

**Signature:** ___________________________       **Date:** ________________________
Mwange Musa Muthami (23/05037)

**Approval:**
This proposal has been submitted for examination with my approval as the University supervisor.

**Signature:** ___________________________       **Date:** ________________________
Dr. Simon N. Mwendia / Dr. Kevin Mugoye Sindu 

\newpage

## TABLE OF CONTENTS
1. CHAPTER ONE
   1. Background
   2. Problem Statement
   3. Proposed System
   4. Objectives
   5. Significance of the Project
2. CHAPTER TWO
   1. Literature Review
3. CHAPTER THREE
   1. Methodology
   2. Budget and Resources
   3. Project Schedule
4. REFERENCES

\newpage

# CHAPTER ONE

## 1. Background
Kyamatu Primary School, situated in Voo, Kitui County, provides foundational education under Kenya’s Competency-Based Curriculum (CBC) framework. The institution's daily operations—ranging from student enrollment and curriculum tracking to financial management—are highly data-intensive. Currently, the administration relies exclusively on conventional paper-based registries. Student admission records, attendance sheets, and academic grading matrices are curated in physical files, while the bursar's office manages school levies via manual ledgers and receipt books. This traditional paradigm significantly impacts the speed and transparency of administrative workflows, limiting the school's ability to provide timely academic and financial feedback to parents.

## 2. Problem Statement
The continued use of manual, paper-based administrative systems at Kyamatu Primary School creates severe operational bottlenecks and data vulnerabilities. Physical records are highly susceptible to loss, damage, and illicit alteration. Administrators and teaching staff spend an estimated 30% of their working hours manually transcribing attendance sheets, computing CBC competency grades (Exceeding, Meeting, Approaching, or Below Expectations), and reconciling fee balances. 

Furthermore, this manual ecosystem isolates parents from real-time student profiling. Parents currently have no mechanism to remotely verify their child’s daily attendance, academic progress, or fee arrears, requiring physical school visits that disrupt their daily socioeconomic activities. According to recent educational ICT frameworks, reliance on fragmented physical records results in a 15% rate of data inconsistency across term transitions (Ministry of Education, 2023), severely hindering evidence-based academic interventions.

## 3. Proposed System
The proposed solution is a robust, modular, web-based Academic Information Management System tailored explicitly for Kyamatu Primary School. This cloud-hosted platform will digitize and integrate core school workflows, moving beyond simple data entry to provide intelligent automation. Key features include:
*   **Role-Based Portals:** Secure, hierarchical dashboards for Administrators, Teachers, Bursars, Students, and Parents.
*   **CBC Assessment Engine:** An automated grading algorithm that evaluates internal formative scores against CBC competency parameters, instantly generating comprehensive, downloadable PDF report cards natively in the browser.
*   **Real-time QR Attendance Validation:** A novel web-based QR scanning module enabling teachers to digitally record and validate student attendance instantly using standard mobile devices.
*   **FinTech Ecosystem Integration:** An integrated M-Pesa STK (Sim Toolkit) push module leveraging the Safaricom Daraja API. This allows parents to settle fee balances remotely, triggering automated webhooks that reconcile the school’s digital ledgers in real-time without human intervention.

## 4. Objectives

**System Objectives**
1. To develop a centralized cloud architecture that unifies student profiles, staff allocations, and academic records.
2. To automate the computation of terminal grades into compliant CBC PDF report cards, reducing compilation time by over 80%.
3. To implement an instant Web-QR attendance tracking module that records and aggregates daily student presence.
4. To integrate a digital payment gateway (M-Pesa Daraja API) to process and automatically reconcile school fee settlements.

**Research Objectives**
1. To investigate the specific data loss points and administrative delays in the current manual systems at Kyamatu Primary School.
2. To evaluate the digital literacy and hardware accessibility of the school's teaching staff and parental demographic.
3. To design a scalable Entity-Relationship framework that accurately models the complex hierarchy of CBC academic tracking.
4. To implement and test a full-stack progressive web application utilizing React.js, Express, and PostgreSQL.

## 5. Significance of the Project
**To the Organization:** The platform guarantees absolute data integrity, significantly curbing the man-hours lost to manual computation and ledger balancing. It equips administrators with high-level analytical dashboards to make swift, resource-backed decisions regarding school performance and financial health.
**To the Society (Parents/Students):** It establishes an unprecedented communication bridge. Parents are empowered with real-time, remote visibility into their children’s academic milestones and institutional attendance, while the digital payment framework offers a secure, transparent avenue for financial transactions.

\newpage

# CHAPTER TWO

## Literature Review
The necessity for localized, cloud-based School Management Systems is paramount for developing rural educational infrastructure. While several proprietary platforms exist in the Kenyan market, their monolithic architectures often fail to cater to specific institutional requirements like CBC grading and integrated mobile payments. Two prominent systems were reviewed:

**1. ShulePro**
ShulePro is a legacy desktop-based school administration software widely utilized in East Africa for exam processing and fee tracking (ShulePro, 2021). 
*   *Missing Features to be Incorporated:* As a predominantly localized desktop application, ShulePro lacks a cloud-native architecture. Consequently, it offers no remote parental access portal. Furthermore, it operates on standard summative grading metrics, lacking a dedicated, automated CBC formative assessment tracking module. The proposed system resolves this via a multi-tenant cloud architecture with native CBC algorithms.

**2. Zeraki Analytics**
Zeraki Analytics is an advanced, cloud-based academic tracking service primarily serving the secondary school sector (8-4-4 ranking systems) across Kenya. It focuses heavily on aggregating high-level exam data and disseminating it via SMS (Zeraki Analytics, 2023).
*   *Missing Features to be Incorporated:* Zeraki’s complex interface is optimized for extensive secondary school ranking structures, making it overly intricate for primary school infrastructure. Critically, it lacks an integrated, user-facing M-Pesa STK prompt checkout portal for direct fee levy settlements. The proposed Kyamatu system incorporates this precise financial mechanism directly into the parent/student dashboard.

\newpage

# CHAPTER THREE

## Methodology

**a) Research Methodology**
*   **Data Collection Methods:** The research will utilize qualitative semi-structured interviews and ethnographic observation. Primary focus groups will include the Headteacher, the Bursar, and a selected cadre of homeroom teachers to map out the current manual reporting workflows.
*   **Target Population:** The population encompasses the entire administrative and teaching corpus of Kyamatu Primary School, alongside a representative subset of the guardian body.
*   **Sampling:** Non-probability purposive sampling will be employed to select key informants who process the bulk of the school’s academic and financial data.

**b) Development Methodology**
The software engineering phase will be governed by the **Agile Development Methodology** (Scrum framework). This iterative model is chosen because it allows for continuous stakeholder feedback and progressive enhancement. The development is divided into functional Sprints:
*   *Sprint 1:* User Authentication and Database Architecting (Prisma/PostgreSQL).
*   *Sprint 2:* Student Registration, Attendance (QR mapping), and CBC Grading engines.
*   *Sprint 3:* FinTech Integration (Daraja API webhooks) and PDF Document Generation.

## 6. Budget and Resources

| Item Description | Quantity / Detail | Estimated Cost (KES) |
| :--- | :--- | :--- |
| **Hardware Resources** | | |
| Primary Development Workstation | 1 (Min 8GB RAM, i5 Processor, SSD) | 65,000 |
| Testing Device (Mobile Interface/QR) | 1 (Android Smartphone) | 20,000 |
| **Software Resources** | | |
| Frontend Hosting (Cloudflare Pages) | Commercial Cloud Ecosystem | 0 (Free Tier) |
| Backend Hosting & Managed PostgreSQL | PAAS Provider (e.g., Render) | 6,000 |
| **Other Resources** | | |
| High-Speed Internet Access | Monthly ISP Subscription | 5,000 |
| Academic Presentation & Binding | Proposal and Final Report Printing | 3,000 |
| **Total Envisaged Budget** | | **99,000** |

## 7. Project Schedule

| Task No. | Task Description | Planned No. of hrs | Planned Start Date | Actual Start Date | Planned Completion Date | Actual Completion date | Deliverables |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Proposal | 40 | 01/09/2025 | | 15/09/2025 | | Proposal Document |
| 2 | SRS | 30 | 16/09/2025 | | 30/09/2025 | | SRS Document |
| 3 | Design | 45 | 01/10/2025 | | 20/10/2025 | | Design Docs & UI Mockups |
| 4 | Test plan | 15 | 21/10/2025 | | 30/10/2025 | | Test Plan |
| 5 | Implementation Plan | 120| 01/11/2025 | | 30/01/2026 | | Software Source Code |
| 6 | Maintenance plan | 10 | 01/02/2026 | | 05/02/2026 | | Maintenance Schedule |
| 7 | User manual | 20 | 06/02/2026 | | 15/02/2026 | | User Manual |
| 8 | Final report | 30 | 16/02/2026 | | 28/02/2026 | | Final Signed Report |

\newpage

# REFERENCES

Ministry of Education. (2023). *National Guidelines on Basic Education Information Management Systems*. Republic of Kenya.

Pressman, R. S. (2014). *Software Engineering: A Practitioner's Approach* (8th ed.). McGraw-Hill.

ShulePro. (2021). *School Administration Software Overview*. Retrieved from https://www.shulepro.com

Sommerville, I. (2015). *Software Engineering* (10th ed.). Pearson.

Zeraki Analytics. (2023). *Transforming Education through Data*. Retrieved from https://zeraki.co.ke
