% School Management System for Kyamatu Primary School
% Mwange Musa Muthami (23/05037)
% February 2026

## Introduction
- **Student:** Mwange Musa Muthami (23/05037)
- **Programme:** Bachelor of Information Technology (BIT 3105)
- **Supervisor:** Dr. Kevin Mugoye Sindu / Dr. Simon N. Mwendia
- **Submission Date:** February 2026

## CHAPTER ONE: Background & Problem Statement
- **Setting:** Kyamatu Primary School, Voo, Kitui County.
- **The Core Problem:** The institution relies entirely on manual, paper-based workflows for daily administration, attendance, CBC grading, and financial tracking.
- **Academic & Financial Impact:**
  - Up to 15% rate of data degradation and inconsistency across grade transitions (Ministry of Education, 2023).
  - Bursars spend ~30% of their working hours manually reconciling fee ledgers and paper receipts.
  - Parents are completely isolated from real-time academic profiling and fee awareness.

## CHAPTER ONE: Proposed System
A shift from localized software to a multi-tenant, cloud-hosted **Academic Information Management Platform**.
**Key Differentiators:**
- Role-Based Hierarchical Web Portals (Admin, Teacher, Parent, Bursar).
- A native CBC Formative Grading Algorithm generating instant PDF report documents.
- An integrated FinTech ecosystem allowing remote mobile money (M-Pesa) settlements.

## CHAPTER ONE: Precise Objectives
**System Objectives (What it does):**
1. Track and compute daily attendance via a Web-QR module.
2. Automate CBC-aligned grade compilation into downloadable PDFs, cutting compilation time by 80%.
3. Process and automatically reconcile remote school fee settlements via Daraja API webhooks.

**Research Objectives (What I am verifying):**
1. Investigate data loss points in Kyamatu's existing manual system.
2. Assess the digital literacies and hardware accessibility of the target user base (Staff & Parents).
3. Design and test a full-stack, scalable academic progressive web app.

## CHAPTER TWO: Literature Review
*Bridging the gap in existing proprietary systems.*

**1. ShulePro**
- *Gaps identified:* A localized desktop architecture offering no remote parental access. Relies on standard summative grading rather than a natively integrated CBC competency algorithm.

**2. Zeraki Analytics**
- *Gaps identified:* Highly tuned for complex secondary 8-4-4 ranking structures. Lacks a direct, user-facing M-Pesa STK prompt checkout portal tailored for primary school levies.

## CHAPTER THREE: Methodology
**Research Approach:**
- Qualitative semi-structured interviews and ethnographic observation with key informants (Headteacher, Bursar).
- Non-probability purposive sampling.

**Software Development Methodology:**
- **Agile (Scrum Framework):** Development via functional Sprints.
  - *Sprint 1:* Auth & PostgeSQL Architecting.
  - *Sprint 2:* CBC Grading Engine & Web-QR.
  - *Sprint 3:* Node.js M-Pesa FinTech Integration.

## Budget & Schedule Highlights
- **Envisaged Hardware/Software Budget:** KES 99,000.
  - Accounts for development workstations, testing smartphones, Cloudflare/Render Node.js hosting, and ISP subscriptions.
- **Project Schedule (Agile Roadmap):**
  - Requirements & System Design (Sept - Oct 2025)
  - Sprint Implementation (Nov 2025 - Jan 2026)
  - Maintenance, Handover, & Final Documentation (Feb 2026)

## Expected System Outcomes
*(Focus on mitigating the observed bottlenecks)*

1. Analytics visualization across Role-Specific Dashboards.
2. Formative Grading computation and native Browser PDF rendering.
3. The Web-QR Digital Attendance validation scanner.
4. Remote financial settlement via M-Pesa Daraja Integration.

## Conclusion & Significance
- Replaces disjointed paper registries with a consolidated, secure digital ledger.
- Provides school administration with real-time empirical data for decisive action.
- Creates an unprecedented remote communication bridge between rural parents and academic institutions through integrated mobile payment and grading portals.

**Thank you.**
*Any Questions?*
