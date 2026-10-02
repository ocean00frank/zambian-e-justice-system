# Zambian E-Justice System — Complete Frontend/UI/UX Development Prompt

You are an expert **Full-Stack Frontend Engineer, UI/UX Designer, and Legal-Tech Product Designer**.

Your task is to design and implement a **complete, production-quality frontend** for a proposed **Zambian E-Justice System for Case Management, e-Filing, and Real-Time Case Tracking**.

The frontend must be built with:

- Next.js
- App Router
- TypeScript
- Tailwind CSS
- `frontend/app/` structure
- No `src/` directory

The frontend must be designed strictly around the project's:

1. Problem Statement
2. Aim
3. Research Objectives
4. Scope
5. Functional Requirements
6. Non-Functional Requirements
7. Proposed Zambian Judiciary workflow
8. Identified system stakeholders

Do **not** turn this into a generic "court management system" containing features that are outside the proposal.

---

# 1. IMPORTANT PROJECT RULE

This is an **E-Justice System for the Zambian Judiciary**, specifically focusing on:

- High Court
- Subordinate Courts

The purpose of the system is to address the problems identified in the proposal:

- Dependence on physical/paper-based court files
- Misplacement or loss of physical files
- Slow retrieval of case documents
- Manual registry processes
- Physical visits to courts to file documents
- Physical visits to check case progress
- Lack of convenient case-status visibility
- Manual scheduling and registry delays
- Lack of proper digital audit trails
- Increased travel and operational costs
- Lack of transparency caused by limited case-status visibility

The system should therefore provide a digital workflow around:

**e-Filing → Case Registration/Management → Case Tracking → Scheduling → Notifications → Search**

Do not introduce unrelated judicial features.

---

# 2. DO NOT INVENT JUDICIARY PROCEDURES

The interface must reflect a realistic and understandable Zambian Judiciary workflow.

However, do NOT invent detailed legal procedures, court rules, approval processes, legal decisions, or judicial powers that have not been established by the project proposal or verified research.

Use the following high-level workflow as the foundation:

```text
Legal Practitioner / Authorized User
        ↓
Electronic Filing
        ↓
Court Registry Review / Processing
        ↓
Case Registration
        ↓
Case Assigned / Allocated
        ↓
Judicial Officer
        ↓
Hearing Scheduled
        ↓
Case Proceedings
        ↓
Case Status Updates
        ↓
Judgment / Decision
        ↓
Case Concluded

This is a system workflow, not a claim that every Zambian case follows exactly these steps.

Where the exact judicial procedure is not defined, design the UI in a flexible way rather than inventing additional legal processes.

For example, do NOT invent:

Bail management
Prison management
Police case management
Prosecutor management
Appeals management
Sentencing management
Warrants
Evidence management
Land registry
Probate management
Judicial financial management
Lawyer billing
Legal aid management
Courtroom video conferencing
AI legal advice
AI judgment generation
Automated legal decision-making

unless these are explicitly added to the project scope later.

3. PROJECT OBJECTIVES

The frontend must directly support these three objectives.

Objective 1 — Electronic Filing

Design a centralized digital portal that allows authorized legal practitioners to electronically submit court documents.

The UI must make the filing process simple, clear, and traceable.

The frontend should support the concept of submitting documents such as:

Writ of Summons
Statement of Claim
Originating Summons
Other permitted legal documents

Documents should be represented as standardized PDF submissions.

Objective 2 — Real-Time Case Tracking

Design a case-tracking experience that allows authorized users and the public, where appropriate, to see the current status/progress of a case.

Use clear case milestones such as:

Filed
Processing / Registered
Assigned
Hearing Scheduled
Hearing Held
Judgment Delivered
Concluded

Do not create dozens of artificial statuses.

The tracking interface should clearly communicate:

Case ID
Case title/parties where permitted
Court
Filing date
Current status
Important dates
Case progress/timeline

Privacy must be considered when displaying public case information.

Objective 3 — Automated Case Management and Scheduling

Design an internal case-management interface for authorized judicial/court personnel.

The interface should support:

Reviewing incoming cases
Viewing submitted documents
Managing case records
Assigning/allocating cases where authorized
Scheduling hearings
Updating case status
Viewing court schedules/cause lists
Managing case-related dates
Monitoring active cases

The UI must reduce dependence on manual registry processes.

Do not create judicial decision-making functionality.

The system assists with case administration and workflow, not judicial judgment.

4. PROJECT SCOPE

The system is a web-based E-Justice portal.

The frontend must focus on these three core components:

A. e-Filing

Authorized legal practitioners can submit court documents electronically.

B. Internal Case Management

Authorized court/judicial users can manage electronic case records, documents, assignments, scheduling, and statuses.

C. Public Case Tracking

Citizens, litigants, and other permitted users can search for case information/status without needing access to confidential internal information.

5. OUT OF SCOPE

The frontend must NOT expand the project beyond the proposal.

Do not build interfaces for:

Historical paper-file digitization
Full archival migration
Police systems
Prison systems
Prosecutor systems
Law enforcement systems
Legal research databases
Legal advice
AI-generated legal decisions
Automated judicial decisions
Financial accounting systems
Lawyer payment/billing systems
Human resources
Payroll
Court administration unrelated to case management
Criminal investigation
Evidence laboratory systems
National identity systems

The proposal specifically excludes digitization of historical/archived paper records.

Therefore, do not create a massive "document archive migration" module.

6. USERS AND ROLE BOUNDARIES

The frontend must reflect the stakeholders identified by the project.

Primary users include:

Legal Practitioner

Can:

Log in
Submit cases/documents
View submitted filings
View filing receipts
Track cases associated with their account
View case status
View relevant hearing dates
Receive notifications
Judge / Judicial Officer

Can:

View assigned/incoming cases
View case information
Review submitted documents
View case history
View scheduled hearings
Update permitted case statuses
View cause lists/calendar

The interface should support both judges and magistrates/judicial officers without unnecessarily creating separate systems.

Court Clerk / Registry User

Can:

Review incoming filings
View case records
Process/register cases
Manage case information
Assist with case allocation/assignment where authorized
Schedule/manage hearings
Update permitted statuses
View cause lists
Maintain administrative case information
Public / Litigant

Can:

Search for publicly available case information
Search using Case ID/Case Number
View permitted case status information
View publicly available case milestones

The public must NOT see confidential internal documents or restricted information.

System Administrator

The proposal identifies IT administrators as technical stakeholders.

The frontend may include an administrative area for:

User account provisioning
Role assignment
User activation/deactivation
Basic system administration
Security/audit monitoring

Do not turn the administrator dashboard into a completely separate enterprise management system.

7. AUTHENTICATION MODEL

There must be a single secure login portal.

Do not create separate login pages for:

Lawyers
Judges
Clerks
Administrators

Use one login interface.

Example:

/login

After authentication, the system determines the user's role and provides access to the appropriate dashboard.

Example:

Legal Practitioner → /dashboards/lawyer

Judicial Officer → /dashboards/judge

Court Clerk/Registry → /dashboards/registry

Administrator → /dashboards/admin

Public → public tracking interface

Do not expose role names unnecessarily in URLs if the existing project architecture has a better protected routing structure.

Most importantly:

RBAC must be treated as a security boundary, not simply a visual difference between dashboards.

A user must only see actions and information permitted for their role.

8. ACCOUNT PROVISIONING

There must NOT be open public registration for sensitive judicial roles.

Do not create:

"Register as Judge"
"Register as Lawyer"
"Register as Court Clerk"

Instead, sensitive accounts should be provisioned by authorized administration.

The login page should communicate this appropriately, for example:

"Authorized users should use their provisioned credentials to access the system."

Do not invent a complicated identity-verification system.

9. INFORMATION ARCHITECTURE

Create a clean information architecture around the actual project objectives.

Suggested authenticated navigation:

Dashboard
Cases
e-Filing
Case Tracking
Cause List / Schedule
Documents
Notifications
Profile

For internal court users:

Dashboard
Incoming Cases
Active Cases
Case Management
Cause List
Documents
Notifications

For administrators:

Dashboard
Users
Roles & Access
Audit Log
System Overview

Do not overload the sidebar with unnecessary modules.

10. LANDING PAGE

Create:

frontend/app/page.tsx

The landing page should look like an official modern judicial technology portal.

It should communicate:

Hero

Title:

Zambian E-Justice System

Subtitle explaining that the platform supports:

Electronic filing
Digital case management
Case tracking
Improved access to court information

Avoid exaggerated claims such as:

"We have eliminated all court delays."

The system is designed to address identified bottlenecks; do not claim results that have not been measured.

Public Case Tracking

Place a prominent tracking component on the landing page.

Example:

Track a Case

Enter Case Number

[________________________]

[ Search Case ]

After searching, display only information that is appropriate for public access.

Example:

Case Number
Court
Case Type
Filing Date
Current Status

Case Progress
✓ Filed
✓ Registered
✓ Assigned
● Hearing Scheduled
○ Judgment

Do not expose confidential documents.

11. PUBLIC CASE TRACKING

Create a dedicated public tracking interface.

Suggested route:

frontend/app/dashboards/public/page.tsx

The interface should support searching using appropriate case identifiers.

The proposal mentions:

Case number
Party names
Filing dates

However, the primary tracking mechanism should be the unique Case ID/Case Number.

Use privacy-by-design principles.

For example, do not display:

Confidential documents
Private contact information
Internal judicial notes
Restricted case information
Internal staff comments
12. LAWYER DASHBOARD

Create:

frontend/app/dashboards/lawyer/page.tsx

The dashboard should immediately answer:

How many active cases do I have?
Are there recent filing updates?
Are there upcoming hearings?
Have my submitted documents been processed?
Are there notifications requiring attention?

Example dashboard cards:

Active Cases
12

Pending Filings
3

Upcoming Hearings
4

Notifications
5

Keep these cards meaningful.

Do not create decorative statistics that do not support the workflow.

13. e-FILING EXPERIENCE

The e-Filing interface is one of the most important parts of the application.

Create a clear step-by-step filing process.

Example:

Step 1
Select Court

High Court
Subordinate Court

↓

Step 2
Case / Filing Information

↓

Step 3
Upload Documents

↓

Step 4
Review Submission

↓

Step 5
Submit

↓

Step 6
Receipt Generated

The upload interface should clearly show:

Required document
File format
File name
Upload status
Validation status

Use PDF as the primary document format specified in the proposal.

Do not create complicated multi-document workflows that are not supported by the proposal.

14. FILING RECEIPT

After a successful submission, display an electronic filing receipt.

The receipt should contain information such as:

E-FILING RECEIPT

Receipt Number
Case ID
Date and Time Submitted
Court
Document Type
Submitted By
Submission Status

Clearly communicate that the receipt provides evidence of electronic submission.

Provide:

View Receipt
Download Receipt
Print Receipt

Do not invent a legal certification mechanism unless it is actually part of the backend/legal requirements.

15. CASE TRACKING INTERFACE

Create a strong visual case timeline.

Example:

CASE: HC/123/2026

Filed
        ✓

Registered
        ✓

Assigned
        ✓

Hearing Scheduled
        ●

Judgment Delivered
        ○

The current stage should be visually obvious.

Also display:

Court
Case Number
Filing Date
Current Status
Next Hearing
Last Updated

The user should not need to read a large amount of text to understand the case state.

16. CASE MANAGEMENT

Create a centralized internal case-management interface.

The case details page should contain:

Case Summary
Case Number
Case Type
Court
Filing Date
Current Status
Assigned Judicial Officer
Next Hearing
Parties

Show permitted party information.

Documents

Display submitted documents and their status.

Example:

Statement of Claim     Submitted
Writ of Summons        Submitted
Supporting Document    Available
Case Timeline

Show important case events.

Hearings

Display:

Date
Time
Courtroom
Purpose/Status

Do not invent detailed legal proceedings.

17. CAUSE LIST / SCHEDULING

Create a scheduling interface that supports the proposal's objective of reducing manual scheduling delays.

The interface should allow authorized users to:

View scheduled hearings
Create/update hearing dates where authorized
View daily/weekly schedules
Identify scheduling conflicts
View cases associated with a date
View cause lists

Example:

CAUSE LIST
Monday, 12 October 2026

08:30
HC/123/2026
Hearing

09:30
SC/245/2026
Mention

10:30
HC/891/2026
Hearing

Do not create advanced courtroom resource-management functionality unless required later.

18. NOTIFICATIONS

Create an in-app notification center.

Notifications should focus on the functional requirements:

Filing submitted
Filing processed
Case status updated
Hearing scheduled
Hearing date changed
Decision/judgment available

Example:

New Case Update
Case HC/123/2026 has been assigned.

Hearing Scheduled
HC/123/2026 has a hearing on 15 October 2026.

Decision Available
A decision has been recorded for HC/456/2026.

The proposal mentions SMS/email notifications.

Design the frontend so the notification architecture can later support:

In-app notifications
Email
SMS

Do not pretend SMS/email has been implemented if the frontend is only a UI prototype.

19. SEARCH

Implement a clean search experience.

Authorized users should be able to search using appropriate fields such as:

Case Number
Party Name
Filing Date

Search results should display only information the authenticated role is allowed to access.

Example:

Search Results

HC/123/2026
Civil Matter
High Court
Filed: 04/09/2026
Status: Hearing Scheduled
20. DOCUMENT MANAGEMENT

Documents are central to the problem statement.

The UI should make digital documents easier to manage than physical paper files.

Create:

Document list
Document type
Submission date
Submitted by
Status
View/download action where permitted

Example:

DOCUMENTS

Statement of Claim
PDF
Submitted 04 Sept 2026
✓ Available

Writ of Summons
PDF
Submitted 04 Sept 2026
✓ Available

Do not create a historical archive migration system.

21. AUDIT TRAIL

The proposal identifies lack of proper audit trails as one of the problems.

Therefore, the frontend should include an appropriate audit-history view for authorized internal users.

Example:

AUDIT HISTORY

04 Sept 2026 — Filing submitted
04 Sept 2026 — Case registered
05 Sept 2026 — Case assigned
07 Sept 2026 — Hearing scheduled

Where appropriate, display:

Action
User/Role
Date & Time
Case

Do not expose internal audit information to the public.

22. ROLE-BASED ACCESS CONTROL

Design the UI around RBAC.

For example:

Legal Practitioner

Can see:

My Cases
My Filings
My Documents
My Notifications
Judicial Officer

Can see:

Assigned Cases
Case Management
Hearings
Cause List
Documents
Registry / Clerk

Can see:

Incoming Filings
Case Registration
Case Records
Scheduling
Cause Lists
Public

Can see:

Public Case Tracking

Do not simply hide buttons visually.

The frontend should be structured so backend authorization can enforce the same boundaries.

23. SECURITY UI

The system handles sensitive legal information.

The UI should communicate security without making the application intimidating.

Include appropriate elements such as:

Secure login
Password visibility toggle
Session state
Role indicator
Confirmation dialogs for important actions
Unauthorized access states
Error handling
File validation feedback
Secure document access states

Do not display sensitive technical information to normal users.

24. ERROR AND EMPTY STATES

Every important module must have professional states for:

Loading
Loading case information...
Empty
No active cases found.
Error
We could not load this information.
Please try again.
Unauthorized
You do not have permission to access this information.
Successful submission
Filing submitted successfully.

These states are important because this is a production-style application.

25. RESPONSIVE DESIGN

The system must work on:

Desktop
Laptop
Tablet
Mobile

However, this is primarily a professional court/legal workflow application.

Desktop should receive the strongest dashboard experience.

Mobile should prioritize:

Case tracking
Notifications
Basic case information
Responsive navigation
Filing status

Do not simply shrink the desktop UI.

Create proper responsive layouts.

26. UI/UX DESIGN LANGUAGE

Use a professional judicial/legal technology visual identity.

Primary colors

Use deep judicial/forest green:

#1B4D3E
#0F382B

Supporting colors:

White
Light grey
Neutral grey
Dark text
Subtle borders
Restrained success/warning/error colors

The application must use light mode.

Do not create dark mode unless specifically requested later.

27. TYPOGRAPHY

Use a clean modern font system.

Typography should communicate:

Authority
Professionalism
Trust
Clarity

Avoid:

Gaming-style UI
Excessive gradients
Neon colors
Excessive animations
Huge decorative illustrations
Consumer social-media styling

This should feel like a serious government/legal technology platform.

28. DASHBOARD LAYOUT

Authenticated dashboards should generally use:

┌─────────────────────────────────────────────┐
│ Top Header                                  │
├──────────────┬──────────────────────────────┤
│              │                              │
│ Sidebar      │ Main Content                 │
│              │                              │
│ Dashboard    │                              │
│ Cases        │                              │
│ e-Filing     │                              │
│ Schedule     │                              │
│ Documents    │                              │
│ Notifications│                              │
│              │                              │
└──────────────┴──────────────────────────────┘

The sidebar should remain persistent on desktop.

On mobile, convert it into an appropriate drawer/navigation system.

29. COMPONENT ARCHITECTURE

Create reusable components.

Suggested structure:

frontend/
├── app/
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── dashboards/
│   │   ├── lawyer/
│   │   │   └── page.tsx
│   │   ├── judge/
│   │   │   └── page.tsx
│   │   ├── registry/
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   └── public/
│   │       └── page.tsx
│   │
│   ├── cases/
│   ├── e-filing/
│   ├── tracking/
│   ├── cause-list/
│   ├── documents/
│   ├── notifications/
│   └── components/
│
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── cases/
│   ├── filing/
│   ├── documents/
│   ├── notifications/
│   ├── tables/
│   ├── forms/
│   ├── modals/
│   └── ui/
│
└── ...

Adapt the structure if necessary, but maintain the frontend/app/ App Router requirement.

30. REUSABLE COMPONENTS

Create reusable components such as:

Sidebar
TopNavbar
DashboardHeader
StatCard
CaseCard
CaseTable
CaseStatusBadge
CaseTimeline
CaseSearch
FileUpload
FilingStepper
FilingReceipt
DocumentTable
NotificationItem
NotificationPanel
CauseList
Calendar
SearchInput
DataTable
Modal
ConfirmationDialog
EmptyState
ErrorState
LoadingState
Pagination

Do not duplicate the same UI code across dashboards.

31. CASE STATUS DESIGN

Create one consistent case-status system throughout the frontend.

Suggested statuses:

Filed
Registered
Assigned
Hearing Scheduled
Hearing Held
Judgment Delivered
Concluded

Use consistent colors, labels, icons, and timeline behavior.

Do not create different status terminology on different pages.

32. MOCK DATA

If the backend API is not currently connected, use realistic mock data only for demonstrating the UI.

Mock data should resemble:

HC/123/2026
SC/245/2026
HC/891/2026

Use realistic but fictional names.

Clearly structure mock data so it can later be replaced with API responses.

Do NOT hard-code fake information into components everywhere.

Create a centralized mock-data layer.

33. BACKEND INTEGRATION READINESS

The frontend should be prepared for API integration.

Use clear interfaces/types such as:

Case
CaseStatus
Court
Document
Filing
Hearing
Notification
User
Role
AuditEvent

The frontend must not assume that mock data is the final data source.

Keep API-related code organized so it can later connect to the actual backend.

34. IMPORTANT: DO NOT CHANGE BACKEND LOGIC

If an existing backend/API already exists:

DO NOT modify it.

Do not change:

Authentication logic
API endpoints
Database
JWT implementation
Business logic
Permissions
Backend routes
Django models
Backend serializers
Backend views

The task is to create/improve the frontend and UI/UX.

If an API endpoint is missing, create a clean frontend abstraction/mock interface rather than silently changing the backend.

35. FUNCTIONAL REQUIREMENT TRACEABILITY

Every major frontend feature must correspond to an actual project requirement.

Use this mapping:

Project Requirement	Frontend
e-Filing	Filing workflow
Electronic receipts	Filing receipt
Case Tracking	Case timeline
Case IDs	Case search/details
Automated notifications	Notification center
Search	Case/document search
Case management	Internal case dashboard
Scheduling	Cause list/calendar
Document management	Document interface
Audit trail	Case history/audit view
RBAC	Role-specific interfaces

Do not create major features that have no relationship to the project requirements.

36. NON-FUNCTIONAL REQUIREMENTS

The frontend must support the project's non-functional requirements.

Security

Design for:

RBAC
Secure authentication
Protected routes
Controlled document access
Privacy-by-design
Clear unauthorized states
Secure form handling

Do not expose sensitive information in the UI.

Integrity

Submitted documents and important case events must appear immutable unless the authorized workflow explicitly permits an update.

Use clear status/history indicators.

Usability

The system must be understandable to users with different levels of digital literacy.

Use:

Clear labels
Simple language
Consistent navigation
Helpful validation
Clear progress indicators
Minimal unnecessary steps

Avoid legal jargon where it is not necessary.

Reliability

Design loading, error, retry, and empty states properly.

The application should not appear broken when data is temporarily unavailable.

Responsiveness

The application must adapt to:

Desktop
Laptop
Tablet
Mobile
37. ACCESSIBILITY

Follow good accessibility practices:

Semantic HTML
Keyboard navigation
Proper labels
Accessible forms
Sufficient contrast
Focus states
Accessible dialogs
Meaningful error messages
Screen-reader-friendly controls

Do not rely only on color to communicate status.

38. UX PRINCIPLE — REDUCE PHYSICAL REGISTRY DEPENDENCE

The frontend should visibly solve the problems identified in the proposal.

For example:

Old problem

User physically visits registry to submit documents.

System response
e-Filing
→ Upload
→ Submit
→ Electronic Receipt
Old problem

User physically visits court to check case progress.

System response
Case ID
→ Search
→ Case Timeline
→ Current Status
Old problem

Physical files are difficult to locate.

System response
Case Search
→ Digital Case Record
→ Documents
→ Case History
Old problem

Manual scheduling causes delays.

System response
Case
→ Schedule Hearing
→ Cause List
→ Notification

The UI should make these improvements obvious.

39. DO NOT OVERDESIGN

This is extremely important.

Do not turn the project into a huge enterprise judicial platform.

The frontend must remain focused on:

e-Filing
+
Case Management
+
Case Tracking
+
Scheduling
+
Notifications
+
Search
+
Document Management
+
Audit Trail
+
RBAC

Everything else should be excluded unless explicitly required.

40. PAGES TO IMPLEMENT

At minimum, create polished UI/UX for:

/
Landing Page

/login
Unified Login

/dashboards/lawyer
Legal Practitioner Dashboard

/dashboards/judge
Judicial Officer Dashboard

/dashboards/registry
Court Registry Dashboard

/dashboards/public
Public Case Tracking

/cases
Case Management

/cases/[caseId]
Case Details

/e-filing
Electronic Filing

/e-filing/receipt/[id]
Electronic Filing Receipt

/tracking
Case Tracking

/cause-list
Cause List / Scheduling

/documents
Documents

/notifications
Notifications

/admin
Administrative User Management

Only implement routes that are consistent with the existing application architecture.

41. LANDING PAGE CONTENT STRUCTURE

Use approximately this structure:

Header
↓
Hero
↓
Public Case Tracking
↓
How the System Helps
↓
Core Services
↓
e-Filing
Case Management
Case Tracking
↓
Benefits
↓
Simple Workflow
↓
Security & Privacy
↓
Footer

Avoid excessive marketing language.

This is a judicial/public-service system, not an e-commerce website.

42. HOW THE SYSTEM WORKS SECTION

Create a simple visual workflow:

1. File Documents
        ↓
2. Case Registered
        ↓
3. Case Managed
        ↓
4. Hearing Scheduled
        ↓
5. Case Tracked
        ↓
6. Judgment / Conclusion

Keep it simple.

43. CASE DETAILS PAGE

The case details page should be one of the most important screens.

Use tabs or clearly separated sections:

Overview
Documents
Hearings
Timeline
Notifications

Only display tabs/actions permitted for the current role.

Example:

CASE HC/123/2026

High Court
Filed: 04 September 2026

Status
Hearing Scheduled

Next Hearing
15 October 2026

Then:

Case Timeline
Documents
Hearings
44. FILING VALIDATION

The frontend should validate:

Required fields
Supported document type
PDF format
File size where appropriate
Missing information
Submission confirmation

Use clear messages.

Example:

Please upload the Statement of Claim before continuing.

Do not allow a user to unknowingly submit an incomplete filing.

45. CONFIRMATION BEFORE IMPORTANT ACTIONS

For important actions such as:

Submit Filing
Update Hearing Date
Change Case Status
Assign Case

show an appropriate confirmation dialog.

Example:

Confirm Submission
Please review the information before submitting this filing.

This helps prevent accidental actions.

46. VISUAL HIERARCHY

Every page must make the most important information immediately visible.

For case management:

Case Number
↓
Current Status
↓
Next Important Date
↓
Case Information
↓
Documents
↓
Timeline

For e-Filing:

What are you filing?
↓
Which court?
↓
Upload documents
↓
Review
↓
Submit

For public tracking:

Enter Case Number
↓
Current Status
↓
Timeline
47. DESIGN QUALITY

The final frontend must look like a real production application.

Avoid:

Generic template appearance
Excessive rounded cards
Random gradients
Excessive shadows
Unnecessary animations
Placeholder lorem ipsum
Broken layouts
Empty screens
Inconsistent buttons
Different styles for the same function

Use:

Strong spacing system
Consistent cards
Professional tables
Clear typography
Consistent status badges
Clean forms
Professional navigation
Responsive layouts
48. IMPLEMENTATION QUALITY

Write clean, maintainable TypeScript/React code.

Requirements:

Strong component reuse
TypeScript types
No unnecessary duplication
No dead components
No TODO placeholders
No broken imports
No fake unfinished sections
No console errors
No unnecessary dependencies
Proper responsive behavior

Do not produce a superficial mockup.

The application should feel complete.

49. FINAL VALIDATION

Before considering the frontend complete, verify:

Problem Statement

Does the UI directly address:

Paper files?
Physical registry dependency?
Difficult document retrieval?
Case tracking limitations?
Manual scheduling?
Lack of transparency?
Lack of audit trail?
Objective 1

Does the system provide a complete e-Filing experience?

Objective 2

Does the system provide clear real-time case tracking?

Objective 3

Does the system provide case management and scheduling?

Functional Requirements

Verify:

e-Filing
Electronic receipt
Case tracking
Case IDs
Notifications
Search
Case management
Scheduling
Documents
Audit trail
Non-Functional Requirements

Verify:

Security
RBAC
Integrity
Usability
Reliability
Responsiveness
Accessibility
Scope

Confirm that the frontend has NOT expanded into unrelated judicial systems.

50. FINAL INSTRUCTION

Build the frontend as a coherent E-Justice platform, not as a collection of unrelated dashboard pages.

The entire user experience should communicate one clear workflow:

DIGITAL FILING
      ↓
CASE REGISTRATION
      ↓
CASE MANAGEMENT
      ↓
HEARING SCHEDULING
      ↓
CASE TRACKING
      ↓
NOTIFICATIONS
      ↓
JUDGMENT / CONCLUSION

The system must remain faithful to the project proposal.

Do not invent unsupported Zambian Judiciary procedures.

Do not add features simply because they are common in other court-management systems.

Do not expand the scope.

Do not make legal decisions through the system.

The application is intended to digitize and improve the identified administrative case-management, filing, scheduling, document, and tracking processes, while keeping judicial decision-making with authorized judicial officers.

First inspect the existing frontend structure and existing components.

Then:

Identify what already exists.
Preserve reusable components and existing functionality.
Build the missing UI/UX.
Maintain the existing backend/API/authentication if present.
Implement the complete frontend experience.
Ensure every major screen maps back to the project proposal.
Test all routes and interactions.
Fix responsive and accessibility issues.
Remove broken/placeholder UI.
Deliver a polished, consistent, production-ready frontend.