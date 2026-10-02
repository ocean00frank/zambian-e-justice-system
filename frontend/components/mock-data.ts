export type CaseStatus =
  | "Filed"
  | "Registered"
  | "Assigned"
  | "Hearing Scheduled"
  | "Hearing Held"
  | "Judgment Delivered"
  | "Concluded";

export type CaseRecord = {
  id: string;
  title: string;
  court: string;
  caseType: string;
  filingDate: string;
  status: CaseStatus;
  assignedTo: string;
  nextHearing: string;
  lastUpdated: string;
  parties: string[];
  documents: Array<{ name: string; submitted: string; status: string; type: string }>;
  timeline: Array<{ date: string; event: string; actor: string }>;
  hearings: Array<{ date: string; time: string; courtroom: string; purpose: string; status: string }>;
  progress: number;
};

export const justiceCases: CaseRecord[] = [
  {
    id: "HC/123/2026",
    title: "Manda v. Attorney General",
    court: "High Court",
    caseType: "Civil Matter",
    filingDate: "04 Sept 2026",
    status: "Hearing Scheduled",
    assignedTo: "Justice L. Nsakanya",
    nextHearing: "15 Oct 2026",
    lastUpdated: "08 Oct 2026",
    parties: ["Timothy Manda", "Attorney General of Zambia"],
    documents: [
      { name: "Statement of Claim", submitted: "04 Sept 2026", status: "Available", type: "PDF" },
      { name: "Writ of Summons", submitted: "04 Sept 2026", status: "Available", type: "PDF" },
      { name: "Supporting Affidavit", submitted: "05 Sept 2026", status: "Available", type: "PDF" },
    ],
    timeline: [
      { date: "04 Sept 2026", event: "Filing submitted", actor: "Legal Practitioner" },
      { date: "05 Sept 2026", event: "Case registered", actor: "Registry" },
      { date: "06 Sept 2026", event: "Case assigned", actor: "Judicial Officer" },
      { date: "15 Oct 2026", event: "Hearing scheduled", actor: "Registry" },
    ],
    hearings: [
      { date: "15 Oct 2026", time: "09:30", courtroom: "Courtroom 3", purpose: "Case management hearing", status: "Scheduled" },
      { date: "22 Oct 2026", time: "10:00", courtroom: "Courtroom 1", purpose: "Substantive hearing", status: "Pending" },
    ],
    progress: 70,
  },
  {
    id: "SC/245/2026",
    title: "Nambela v. Chisanga",
    court: "Subordinate Court",
    caseType: "Commercial Dispute",
    filingDate: "11 Sept 2026",
    status: "Assigned",
    assignedTo: "Magistrate B. Mulenga",
    nextHearing: "18 Oct 2026",
    lastUpdated: "09 Oct 2026",
    parties: ["J. Nambela", "E. Chisanga"],
    documents: [
      { name: "Originating Summons", submitted: "11 Sept 2026", status: "Available", type: "PDF" },
      { name: "Notice of Appointment", submitted: "12 Sept 2026", status: "Available", type: "PDF" },
    ],
    timeline: [
      { date: "11 Sept 2026", event: "Filing submitted", actor: "Legal Practitioner" },
      { date: "12 Sept 2026", event: "Case registered", actor: "Registry" },
      { date: "14 Sept 2026", event: "Assigned to magistrate", actor: "Judicial Officer" },
    ],
    hearings: [
      { date: "18 Oct 2026", time: "08:30", courtroom: "Courtroom 2", purpose: "Mention", status: "Scheduled" },
    ],
    progress: 45,
  },
  {
    id: "HC/891/2026",
    title: "Kangwa v. Kaoma City Council",
    court: "High Court",
    caseType: "Administrative Review",
    filingDate: "02 Oct 2026",
    status: "Judgment Delivered",
    assignedTo: "Justice C. Phiri",
    nextHearing: "N/A",
    lastUpdated: "05 Oct 2026",
    parties: ["M. Kangwa", "Kaoma City Council"],
    documents: [
      { name: "Notice of Intention to Sue", submitted: "02 Oct 2026", status: "Available", type: "PDF" },
      { name: "Judgment Notice", submitted: "05 Oct 2026", status: "Available", type: "PDF" },
    ],
    timeline: [
      { date: "02 Oct 2026", event: "Filing submitted", actor: "Legal Practitioner" },
      { date: "03 Oct 2026", event: "Case registered", actor: "Registry" },
      { date: "04 Oct 2026", event: "Assigned", actor: "Judicial Officer" },
      { date: "05 Oct 2026", event: "Judgment delivered", actor: "Justice C. Phiri" },
    ],
    hearings: [
      { date: "05 Oct 2026", time: "11:00", courtroom: "Courtroom 4", purpose: "Judgment hearing", status: "Completed" },
    ],
    progress: 100,
  },
];

export const causeList = [
  { day: "Monday, 12 October 2026", entries: [
    { time: "08:30", caseId: "HC/123/2026", purpose: "Hearing", court: "Courtroom 3" },
    { time: "09:30", caseId: "SC/245/2026", purpose: "Mention", court: "Courtroom 2" },
    { time: "10:30", caseId: "HC/891/2026", purpose: "Judgment", court: "Courtroom 1" },
  ]},
  { day: "Tuesday, 13 October 2026", entries: [
    { time: "08:00", caseId: "HC/344/2026", purpose: "Directions", court: "Courtroom 5" },
    { time: "12:00", caseId: "SC/310/2026", purpose: "Hearing", court: "Courtroom 2" },
  ]},
];

export const notificationItems = [
  { id: 1, type: "Filing", title: "New filing received", description: "Statement of Claim has been submitted for HC/123/2026.", time: "10 mins ago" },
  { id: 2, type: "Hearing", title: "Hearing scheduled", description: "HC/123/2026 has a hearing on 15 October 2026.", time: "2 hours ago" },
  { id: 3, type: "Status", title: "Case updated", description: "Case status for SC/245/2026 has been updated to Assigned.", time: "Today" },
  { id: 4, type: "Decision", title: "Decision available", description: "A decision has been recorded for HC/891/2026.", time: "1 day ago" },
];

export const documentList = [
  { name: "Statement of Claim", type: "PDF", submitted: "04 Sept 2026", by: "M. Banda", status: "Available" },
  { name: "Writ of Summons", type: "PDF", submitted: "04 Sept 2026", by: "M. Banda", status: "Available" },
  { name: "Affidavit in Support", type: "PDF", submitted: "05 Sept 2026", by: "M. Banda", status: "Available" },
  { name: "Notice of Hearing", type: "PDF", submitted: "09 Oct 2026", by: "Registry", status: "Available" },
];

export const auditHistory = [
  { date: "04 Sept 2026", action: "Filing submitted", user: "M. Banda", caseId: "HC/123/2026" },
  { date: "05 Sept 2026", action: "Case registered", user: "Registry Clerk", caseId: "HC/123/2026" },
  { date: "06 Sept 2026", action: "Case assigned", user: "Justice L. Nsakanya", caseId: "HC/123/2026" },
  { date: "07 Sept 2026", action: "Hearing scheduled", user: "Registry Clerk", caseId: "HC/123/2026" },
];

export const adminUsers = [
  { name: "M. Banda", role: "Legal Practitioner", status: "Active", lastLogin: "2 hours ago" },
  { name: "L. Nsakanya", role: "Judicial Officer", status: "Active", lastLogin: "15 mins ago" },
  { name: "C. Mwale", role: "Registry Clerk", status: "Pending Review", lastLogin: "1 day ago" },
  { name: "A. Simukoko", role: "Administrator", status: "Active", lastLogin: "Today" },
];

export const publicTrackingSearch = [
  { id: "HC/123/2026", court: "High Court", type: "Civil Matter", filingDate: "04 Sep 2026", status: "Hearing Scheduled" },
  { id: "HC/891/2026", court: "High Court", type: "Administrative Review", filingDate: "02 Oct 2026", status: "Judgment Delivered" },
];

export const filingSteps = [
  "Select Court",
  "Case Information",
  "Upload Documents",
  "Review Submission",
  "Submit",
  "Receipt Generated",
];
