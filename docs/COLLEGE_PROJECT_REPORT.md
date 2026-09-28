# CampusPulse — Smart College Notice Board & Instant Alert System
## Comprehensive University Engineering Project Report & System Documentation

---

## 1. ABSTRACT
In contemporary collegiate environments, timely communication remains the backbone of academic and operational success. Traditional notice boards rely on physical foot traffic and manual paper pinning, leading to delayed information dissemination, zero delivery telemetry, and catastrophic communication lag during weather or security emergencies. Instant messaging applications, while prevalent, cause excessive notification fatigue, lack audience-targeted delivery, and blur the boundaries between official directives and unverified chat spam.

**CampusPulse** is an enterprise-grade digital communication platform architected specifically for higher education institutions. Operating on the guiding principle *"The right notice → the right students → instantly"*, CampusPulse features a 5-tier Role-Based Access Control (RBAC) hierarchy (Super Admin, Department Admin, Faculty, Class Representative, and Student), audience-granular filtering (College-wide, Department, Year, Semester, and individual Class sections), a gated CR approval workflow, isolated private student study notepads, and an instant dual-channel push alert engine combining Web Push Notifications and Android/Flutter Mobile Push via Firebase Cloud Messaging (FCM).

---

## 2. PROBLEM STATEMENT
Higher education campuses encounter severe operational friction using current communication mediums:
1. **Notice Invisibility:** Students physically miss vital paper circulars posted on department notice boards.
2. **Notification Fatigue & Clutter:** Class messaging groups intermix casual chat with critical exam schedules, resulting in missed deadlines.
3. **Emergency Lag:** During flash floods, severe weather, or campus safety issues, there is no high-priority audible siren broadcast to warn all students immediately.
4. **Lack of Granular Targeting:** Circulars intended solely for 2nd Year IT-A students are often blasted to all 3,000 campus students or lost in general channels.
5. **No Verification for Student Reps:** Class Representatives (CRs) currently post unverified announcements without faculty oversight, causing misinformation regarding room allocations or test schedules.

---

## 3. OBJECTIVES
The primary objectives of the CampusPulse system are:
1. **Instant Targeted Delivery:** Ensure notices reach only relevant students based on department, semester, and section.
2. **High-Priority Emergency Broadcast:** Deliver instant browser and mobile push alerts with distinct audio chimes and non-dismissible read receipts.
3. **Structured CR Workflow:** Allow Class Representatives to draft class notices while enforcing mandatory Faculty/Admin review before broadcast.
4. **Student Privacy & Productivity:** Provide a secure personal notepad for student study schedules that is strictly isolated from college administration.
5. **Cross-Platform Single Source of Truth:** Unify Web and Flutter mobile applications under a single Django REST API backend.

---

## 4. SYSTEM ARCHITECTURE

```
                                 CAMPUSPULSE
                                      │
                         Role-Based Authentication
                         (Session / Google OAuth)
                                      │
             ┌──────────┬─────────────┼─────────────┬──────────┐
             ↓          ↓             ↓             ↓          ↓
       Super Admin  Dept Admin     Faculty         CR       Student
             │          │             │             │          │
             └──────────┴─────────────┴─────────────┴──────────┘
                                      │
                           Django REST Framework
                     (Permissions, ViewSets, Audit Logs)
                                      │
                ┌─────────────────────┼─────────────────────┐
                ↓                     ↓                     ↓
        PostgreSQL DB         Local File Storage          FCM Engine
       (Relational Data)      (PDF, PNG, DOCX)       (Token Dispatcher)
                                      │
                       ┌──────────────┴──────────────┐
                       ↓                             ↓
               CampusPulse Web              CampusPulse Flutter
               (SPA Interface)               (Mobile Native)
                       ↓                             ↓
             🔔 Web Push Alerts            🔔 Android Push Alerts
```

---

## 5. 5-TIER USER ROLES & ACCESS CONTROL (RBAC)

| Role | Domain Scope | Primary Permissions |
| :--- | :--- | :--- |
| **Super Admin** | Entire Institution | Manages all users, departments, classes, database-driven categories, emergency alerts, audit logs, and delivery telemetry. |
| **Department Admin**| Single Department (e.g. IT) | Manages department classes, approves CR applications, creates department circulars, and moderates faculty notices. |
| **Faculty** | Assigned Classes & Dept | Publishes academic notices, evaluates and approves/rejects CR notice drafts with feedback, and reviews CR candidates. |
| **Class Representative (CR)** | Single Assigned Class (e.g. IT-A) | Drafts class notices. Cannot publish directly; submissions are held in `PENDING_APPROVAL` status until faculty sign-off. Cannot post emergency alerts. |
| **Student** | Enrolled Class & Dept | Receives targeted notices and urgent sirens, bookmarks circulars, and maintains private encrypted personal study notes. |

---

## 6. CR APPROVAL WORKFLOW
```
Student applies for CR
        ↓
Department Faculty reviews application statement
        ↓
  ┌───────────┴───────────┐
  ↓                       ↓
Approved               Rejected
  ↓                       ↓
User gets CR role      Remains Student
Assigned to Class IT-A
        ↓
CR drafts Class Notice (IT-A only)
        ↓
Status: PENDING_APPROVAL
        ↓
Faculty Reviews Notice
        ↓
  ┌───────────┴───────────┐
  ↓                       ↓
Approve                 Reject
  ↓                       ↓
Status: PUBLISHED       CR receives feedback
Push to IT-A Students   CR edits & resubmits
```

---

## 7. ENTITY-RELATIONSHIP (ER) SCHEMA

```
[ User ] ──────── 1:N ────────< [ Notice ]
   │                               │
   ├────── 1:1 ──< [ CRApplication]├───── 1:N ────< [ NoticeAttachment ]
   │                               ├───── 1:1 ────< [ NoticeAudience ]
   ├────── 1:N ──< [ Notification ]└───── 1:N ────< [ SavedNotice ]
   │
   ├────── 1:N ──< [ PersonalNote ] (Strict user_id isolation)
   │
   ├────── N:1 ──> [ CollegeClass ] ────── N:1 ──> [ Department ]
   └────── N:1 ──> [ Role ]
```

---

## 8. DATA FLOW DIAGRAMS (DFD)

### DFD Level 0 (Context Diagram)
```
[ Students / CR / Faculty ] ── Credentials & Notice Drafts ──> ( CampusPulse )
( CampusPulse System ) ── Filtered Feeds & Instant Siren Alerts ──> [ Students ]
```

### DFD Level 1
1. **1.0 Authentication & Session Management:** Authenticates user email/password or Google OAuth; resolves institution role.
2. **2.0 Notice Authoring & Validation:** Validates priority permissions (CRs blocked from emergency priority).
3. **3.0 CR Moderation Queue:** Holds student drafts until Faculty or Dept Admin approves.
4. **4.0 Targeting & Audience Resolution:** Maps notice scope to matching enrolled student records.
5. **5.0 Multi-Channel Notification Engine:** Invokes FCM service worker to fire browser push and mobile notifications.
6. **6.0 Personal Notepad Store:** Handles private CRUD operations isolated strictly to the requesting user ID.

---

## 9. TESTING MATRIX & VERIFICATION

| Test Case ID | Test Description | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | Student registers via portal | Role defaulted to STUDENT; cannot choose ADMIN/FACULTY | PASSED |
| **TC-AUTH-02** | Google OAuth linking | Maps university email to student record | PASSED |
| **TC-SEC-01** | Student attempts direct notice creation | Request rejected with HTTP 400 | PASSED |
| **TC-CR-01** | CR creates class notice | Placed in PENDING_APPROVAL; restricted to assigned class | PASSED |
| **TC-CR-02** | CR attempts emergency broadcast | Blocked with permission error | PASSED |
| **TC-FAC-01** | Faculty approves CR submission | Notice published; instant alerts fired to class students | PASSED |
| **TC-NOTE-01** | Student A accesses Student B's notes | HTTP 200 returns only Student A's records (zero cross-leak) | PASSED |
| **TC-NOTIF-01** | Emergency Alert broadcasted | Audio siren chimes; push notification triggers across web & mobile | PASSED |

---

## 10. CONCLUSION & FUTURE SCOPE
CampusPulse successfully solves the challenge of fractured college communications through role-governed workflows, precision audience targeting, and instant emergency broadcasts.

### Future Scope:
- WhatsApp Business API & SMS fallback for students with low network connectivity.
- Automated optical character recognition (OCR) on uploaded PDF syllabus files for searchability.
- Multi-campus college federation and timetable integration.
