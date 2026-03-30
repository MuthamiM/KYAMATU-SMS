---
marp: true
theme: default
class: lead
paginate: true
backgroundColor: #ffffff
style: |
  section {
    font-family: 'Segoe UI', system-ui, sans-serif;
  }
  h1 {
    color: #0f172a;
    font-size: 2.5rem;
  }
  h2 {
    color: #1d4ed8;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 0.5rem;
  }
  li {
    font-size: 1.2rem;
    line-height: 1.6;
    margin-bottom: 0.8rem;
  }
  .highlight {
    color: #2563eb;
    font-weight: bold;
  }
---

# School Management System
### Kyamatu Primary School
**Student:** Mwange Musa Muthami (23/05037)
**Degree:** Bachelor of Information Technology
**Supervisors:** Dr. Kevin Mugoye Sindu / Dr. Simon N. Mwendia

---
<!-- class: default -->

## 1. The Core Problem

Kyamatu Primary School relies entirely on **manual, paper-based records**.

- **Time-Consuming:** Teachers spend hours computing grades and drawing attendance sheets. The Bursar manually balances fee ledgers.
- **Data Insecurity:** Paper records get lost, damaged, or suffer from miscalculations.
- **Parental Disconnect:** Parents have no way to check their child's daily attendance or fee balance remotely.

---

## 2. The Proposed Solution

A fully cloud-hosted **Web Application** to digitize the entire school.

- **Role-Based Portals:** Custom dashboards for Administrators, Teachers, Bursars, and Parents.
- **Real-Time Data:** Everything from student files to school levies managed in one secure database.

---

## 3. Main System Features 

Instead of just storing data, the system actively computes it:

1. **Digital CBC Assessment Engine:** Teachers input raw scores, and the system automatically calculates exactly whether a student is "Exceeding" or "Meeting" Expectations.
2. **Instant PDF Generation:** Automated report cards and fee receipts generated natively in the browser.
3. **Web-QR Attendance Scanner:** Teachers can scan a student ID to mark them present instantly.
4. **M-Pesa FinTech Integration:** Parents pay fees via an STK push directly on their portal, updating the school database automatically.

---

## 4. Project Objectives

- **System Objective 1:** Automate CBC grading and PDF report compilation.
- **System Objective 2:** Implement a real-time QR-code attendance tracker.
- **System Objective 3:** Integrate Safaricom Daraja API for automated M-Pesa fee collection.
- **Research Objective:** Design and develop a scalable web architecture that bridges the gap between rural primary schools and modern cloud infrastructure.

---

## 5. Existing Systems (Literature Review)

Why not use existing software?

- **ShulePro:** A legacy desktop app. It has no web portal for parents and lacks a specific CBC formative grading tracker.
- **Zeraki Analytics:** Built primarily for secondary school 8-4-4 rankings rather than primary school structures, and lacks direct M-Pesa sandbox checkout for small fee levies.

---

## 6. Methodology & Tech Stack

- **Methodology:** Agile (Scrum)
  - Sprint 1: Users & Database
  - Sprint 2: CBC Engine & QR Attendance
  - Sprint 3: M-Pesa Integrations

- **Technology Stack:**
  - **Frontend:** React.js, Vite, Tailwind CSS (Cloudflare Pages)
  - **Backend:** Node.js, Express (Render)
  - **Database:** PostgreSQL (Prisma ORM)

---

## 7. Budget & Timeline

- **Estimated Budget:** KES 99,000
  - (Covers development workstation, testing smartphones, cloud hosting environments, and ISPs).

- **Project Timeline:**
  - September 2025: Analysis & Design
  - Nov 2025 - Jan 2026: Agile Sprints Implementation
  - February 2026: Final Deployment & System Defense

---

## 8. Summary of Impact

- **To the School:** Eliminates physical record keeping, secures financial ledgers, and halves administrative workload.
- **To the Parents:** Delivers complete transparency into a child’s daily location (QR attendance), academic performance, and financial fee standing via remote payment portals.

---
<!-- class: lead -->

# Expected Outcomes

1. Real-Time QR Code Attendance
2. CBC Grading & PDF Downloads
3. Safaricom M-Pesa Sandbox Integration

*Thank You.*
*Questions?*
