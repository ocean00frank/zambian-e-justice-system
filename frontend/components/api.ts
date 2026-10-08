export type ApiCase = {
  id: number;
  case_number: string;
  title: string;
  case_type: string;
  court: string;
  filing_date: string;
  status: string;
  next_hearing: {
    date: string;
    time: string;
    courtroom: string;
  } | null;
  updated_at: string;
};

export type ApiNotification = {
  id: number;
  title: string;
  message: string;
  channel: string;
  is_read: boolean;
  created_at: string;
};

export type ApiHearing = {
  id: number;
  case: number;
  case_number: string;
  hearing_date: string;
  hearing_time: string;
  courtroom: string;
  purpose: string;
  status: "Scheduled" | "Completed" | "Cancelled";
};

export type ApiPublicCase = {
  case_number: string;
  court: string;
  case_type: string;
  filing_date: string;
  status: string;
  updated_at: string;
  next_hearing: { date: string; time: string } | null;
  public_timeline: { action: string; date: string }[];
};

export type DashboardSummary = {
  active_cases: number;
  pending_filings: number;
  upcoming_hearings: number;
  unread_notifications: number;
  incoming_filings?: number;
};

export type UserRole =
  | "legal_practitioner"
  | "judicial_officer"
  | "court_registry"
  | "litigant";

export type ApiUser = {
  id: number;
  username: string;
  full_name: string;
  role: UserRole;
  role_label: string;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export const dashboardPathByRole: Record<UserRole, string> = {
  legal_practitioner: "/dashboards/lawyer",
  judicial_officer: "/dashboards/judge",
  court_registry: "/dashboards/registry",
  litigant: "/dashboards/litigant",
};

export const roleLabelByRole: Record<UserRole, string> = {
  legal_practitioner: "Lawyer",
  judicial_officer: "Judge",
  court_registry: "Registry",
  litigant: "Litigant",
};

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000"
).replace(/\/+$/, "");

export function getSessionToken() {
  return window.sessionStorage.getItem("ejustice_token");
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Token ${token}`);
  }
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/${path.replace(/^\/+/, "")}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new Error("Could not reach the E-Justice service. Check your connection and try again.");
  }

  if (!response.ok) {
    let detail =
      response.status === 401
        ? "Your session has expired. Please sign in again."
        : response.status === 403
          ? "You do not have permission to access this information."
          : `The request failed (${response.status}). Please try again.`;
    try {
      const body: unknown = await response.json();
      if (typeof body === "object" && body !== null && "detail" in body && typeof body.detail === "string") {
        detail = body.detail;
      }
    } catch {
      // Use the status-based message when the server returns no JSON error body.
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-ZM", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatRelativeDate(value: string) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "";
  const differenceInHours = Math.max(0, Math.floor((Date.now() - timestamp) / 3_600_000));
  if (differenceInHours < 1) return "Just now";
  if (differenceInHours < 24) return `${differenceInHours}h ago`;
  const differenceInDays = Math.floor(differenceInHours / 24);
  if (differenceInDays < 7) return `${differenceInDays}d ago`;
  return formatDate(value);
}
