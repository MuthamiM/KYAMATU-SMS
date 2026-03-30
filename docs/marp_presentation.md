---
marp: true
theme: default
class: lead
paginate: true
backgroundColor: #f9fafb
style: |
  section {
    font-family: 'Segoe UI', system-ui, sans-serif;
  }
  h1 {
    color: #1e3a8a;
    font-size: 2.2rem;
  }
  h2 {
    color: #2563eb;
    border-bottom: 3px solid #bfdbfe;
    padding-bottom: 0.5rem;
    font-size: 1.8rem;
  }
  h3 {
    color: #1d4ed8;
  }
  .columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem;
  }
  .box {
    background-color: #eff6ff;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border-left: 6px solid #3b82f6;
    margin-top: 1rem;
    font-size: 0.9em;
  }
  li {
    margin-bottom: 0.5rem;
  }
  table {
    width: 100%;
    font-size: 0.8em;
  }
  th {
    background-color: #dbeafe;
    color: #1e3a8a;
  }
---

# School Management System for Kyamatu Primary School
### Project Proposal Defense

<br>

**Student:** Mwange Musa Muthami
**Reg. No:** 23/05037
**Programme:** Bachelor of Information Technology (BIT 3105)
**Supervisors:** Dr. Kevin Mugoye Sindu / Dr. Simon N. Mwendia
**Date:** February 21, 2026

---
<!-- class: default -->

## 1. Background

**Kyamatu Primary School (Kitui County)**
- A public institution providing foundational education under Kenya's **Competency-Based Curriculum (CBC)**.
- **Current Paradigm:** Near 100% reliance on physical registries, paper receipts, and manual ledgers for core operations.
- **The Challenge:** Intensive administrative workflows—such as admissions, daily attendance, formative grading, and fee collection—are critically hindered by inefficient paper-based mechanisms.

---

## 2. Problem Statement

<div class="columns">
<div>

### Administrative Bottlenecks
- **Significant Time Loss:** Bursars and teachers lose up to **30%** of their working hours to manual transcription and ledger reconciliation.
- **Data Degradation:** A documented **15%** rate of data inconsistency and loss across term transitions due to physical record deterioration (MoE, 2023).

</div>
<div>

### Information Blind Spots
- **Parental Isolation:** Parents are isolated from real-time academic profiling.
- **Lack of Visibility:** Total inability to remotely verify fee arrears or track daily student attendance without conducting a physical school visit.

</div>
</div>

<div class="box">
<b>Core Institutional Issue:</b> Reliance on fragmented physical records is unsustainable, insecure, and directly impedes the school's ability to conduct evidence-based academic intervention.
</div>

---

## 3. Proposed Academic Solution

A robust, cloud-hosted **Academic Information Management Platform** that moves the institution beyond simple record-keeping toward intelligent automation:

- **Hierarchical Web Portals:** Secure, role-based dashboards tailored for Administrators, Teachers, Bursars, and Parents.
- **Native CBC Assessment Engine:** Automated algorithmic evaluation aligned perfectly with MoE expectations (EE, ME, AE, BE grades).
- **FinTech Ecosystem Integration:** Automated fee reconciliation directly integrated with Safaricom Daraja API (M-Pesa STK Push).
- **Web-QR Validation:** Real-time digital classroom attendance capture via mobile scanning.

---

## 4. Project Objectives

<div class="columns">
<div>

### System Objectives
1. **Automate CBC Compilation** into downloadable, compliant PDF report cards.
2. **Implement Web-QR** attendance tracking for immediate classroom validation.
3. **Process M-Pesa Settlements** via automated secure Daraja API webhooks to eliminate manual ledgers.

</div>
<div>

### Research Objectives
1. **Investigate Data Loss Points** within Kyamatu's existing physical registry framework.
2. **Evaluate Digital Literacies** and smartphone accessibility among the teaching staff and parental demographic.
3. **Architect & Test** a scalable full-stack progressive web application bridging school-home communication.

</div>
</div>

---

## 5. Significance & Impact

**To Kyamatu Primary School (The Institution):**
- **Absolute Data Integrity:** Eliminates arithmetic errors in ledger balancing and ensures secure, cloud-backed archival.
- **Definitive Analytics:** Equips administrators with empirical data via high-level analytical dashboards for rapid, resource-backed decision making.

**To Society (Parents & Guardians):**
- **Closes the Communication Gap:** Empowers parents with unprecedented remote visibility into academic progression and milestone achievements.
- **Secure Financial Channels:** Offers a transparent, remote avenue for digital fee transactions that auto-updates their child's school balance.

---

## 6. Literature Review: Existing Platforms

*Proprietary systems often fail to cater to localized, rural infrastructures effectively.*

**1. ShulePro**
- *Gaps Identified:* Built on a legacy desktop architecture, offering zero remote cloud access for parents. It relies heavily on summative grading methodologies and lacks a natively integrated CBC competency algorithm.

**2. Zeraki Analytics**
- *Gaps Identified:* Exclusively optimized for complex secondary school (8-4-4) ranking systems. It is overly advanced for primary structures and critically lacks a direct, user-facing M-Pesa prompt checkout portal tailored for small-scale physical levy settlements.

---

## 7. Methodology

<div class="columns">
<div>

### Research Methodology
- **Data Collection:** Qualitative semi-structured interviews and ethnographic observation mapping current workflows.
- **Target Population:** Key informants including the Headteacher, Bursar, and teaching cadres.
- **Sampling Strategy:** Non-probability purposive sampling.

</div>
<div>

### Development Methodology
- **Framework:** Agile (Scrum Model).
- **Sprint 1 (Backend):** PostgreSQL Architecting & Node/Express Authentication.
- **Sprint 2 (Academic):** Native CBC Engine & React Web-QR Attendance.
- **Sprint 3 (Financial):** Safaricom Daraja Webhook & M-Pesa Integration.

</div>
</div>

---

## 8. Development Budget Estimate

| Budget Category | Item Description | Estimated Cost (KES) |
|:---|:---|---:|
| **Hardware** | Primary Dev Workstation (i5 Processor, 8GB RAM, SSD) | 65,000 |
| | Android Testing Device (QR Scanning / STK Evaluation) | 20,000 |
| **Hosting & PAAS** | Frontend: Cloudflare Pages (Commercial CDN) | 0 (Free Tier) |
| | Backend: Managed PostgreSQL Database & Node.js Server | 6,000 |
| **Operational** | ISP Subscription (High-Speed Access during Dev Phase) | 5,000 |
| | Document Formatting, Printing & Defense Binding | 3,000 |
| | **Total Envisaged Budget** | **99,000** |

---

## 9. Strategic Implementation Roadmap

| Agile Milestone | Project Phase Description | Timeline Target |
|:---|:---|:---|
| **Phase I** | Requirements Elicitation, SRS Formulation, & System Design | Sept - Oct 2025 |
| **Phase II** | Implementation Sprints 1 & 2 (CBC Algorithms, Auth) | Nov - Dec 2025 |
| **Phase III** | Implementation Sprint 3 (Safaricom M-Pesa Integration) | Jan 2026 |
| **Phase IV** | Integration Testing, Final Deployment, & Handover Reports | Feb 2026 |

---

## 10. Expected System Outcomes

*Practical showcase mapping solutions back to the identified problem statement:*

1. **Analytical Interface:** Navigating multi-tenant Role-Specific Dashboards.
2. **Digital Validation:** Displaying the Web-QR Digital Attendance validation scanner capabilities.
3. **Academic Automation:** Processing Formative (CBC) Grading and executing native Browser PDF document generation.
4. **Financial Settlement:** Initiating the remote M-Pesa Daraja Integration pipeline (STK Push execution).

---
<!-- class: lead -->
# Thank You
## School Management System for Kyamatu Primary School
**Presenter:** Mwange Musa Muthami
*Questions & Feedback*

<br><br>
<small>Proposed Stack: React, Express, PostgreSQL, Prisma, and Cloudflare Pages</small>
