"use client";

import { API_URL } from "@/lib/config";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  LogOut,
  Edit2,
  Save,
  TrendingUp,
  Users,
  Plus,
  MessageSquare,
  Search,
  Link as LinkIcon,
  Paperclip,
  X,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ----------------------------------------------------------------------
// Types – keep all original types + new private project types
// ----------------------------------------------------------------------
interface Employee {
  id: string;
  login_id?: string;
  email?: string;
  phone?: string;
  employee_id: string;
  name: string;
  designation: string;
  profile_pic: string | null;
  location: string;
  employment_type: string;
  qualification: string;
  status: "active" | "inactive" | "on_leave";
  role: "employee" | "project_manager" | "director" | "founder";
  current_project?: any;
  current_project_title?: string;
  requires_password_change?: boolean;
}

interface LeaveRequest {
  id: string;
  leave_type: "sick" | "casual" | "earned" | "other";
  start_date: string;
  end_date: string;
  days_count?: number;
  total_days?: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

interface OvertimeRequest {
  id: string;
  date: string;
  hours: string | number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  extra_pay?: number;
  extra_pay_per_hour?: number;
  rejection_reason?: string;
}

interface EmployeeDocument {
  id: string;
  title: string;
  description: string;
  file: string;
  document_type: string;
  uploaded_at: string;
  status: "pending" | "verified" | "rejected";
  rejection_reason?: string;
}

interface EmployeeTicket {
  id?: string | number;
  ticket_id?: string | number;
  ticketId?: string | number;
  employee?: string | number | { id?: string | number; name?: string };
  employee_id?: string | number;
  employeeId?: string | number;
  employee_name?: string;
  title?: string;
  ticket_title?: string;
  Ticket_Title?: string;
  subject?: string;
  description?: string;
  details?: string;
  status?: "pending" | "in-progress" | "resolved" | "closed";
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  Reassigned_to?: string | number | null;
  reassigned_to?: string | number | null;
  assigned_to?: string | number | null;
}

interface TicketNotification {
  id: number;
  kind: string;
  title: string;
  message: string;
  ticket?: number | string;
  ticket_title?: string;
  is_read: boolean;
  created_at: string;
}

interface DashboardStats {
  total_leaves_taken: number;
  leaves_remaining: number;
  pending_requests: number;
  approved_overtime_hours: number;
  verified_documents: number;
}

type Project = {
  id: string;
  image?: string;
  title?: string;
  name?: string;
  status?: string;
  details?: string;
  description?: string;
  shortDescription?: string;
  client?: string;
  team?: string;
  timeline?: string;
  technologies?: string[] | string;
  stats?: Record<string, string>;
  challenges?: string[] | string;
  outcomes?: string[] | string;
};

type TeamMember = {
  id: string | number;
  name: string;
  role?: string;
  status?: string;
};

// ----------------------------------------------------------------------
// NEW TYPES – exactly matching the provided private project API response
// ----------------------------------------------------------------------
interface PrivateProjectAssignment {
  id: number;
  employee: number;           // employee profile ID
  employee_id: string;        // DI10001
  name: string;
  designation: string;
  start_date: string | null;
  end_date: string | null;
  work: string;
  status: "assigned" | "in_progress" | "review" | "completed";
  admin_comment: string;
  employee_comment: string;
  daily_updates: { date: string; text: string; created_at: string }[];
}

interface PrivateProjectPlan {
  id: number;
  project: number;
  start_date: string | null;
  end_date: string | null;
  timeline: string;
  project_name: string;
  project_description: string;
  employees: PrivateProjectAssignment[];
  assignments: PrivateProjectAssignment[];
  ticket_assignments: any[];
  updated_at: string;
}

interface PrivateProjectResponse {
  id: number;
  title: string;
  description: string;
  shortDescription: string;
  status: string;
  timeline: string;
  start_date: string | null;
  end_date: string | null;
  image: string | null;
  image_url: string;
  project_manager: number | null;
  project_manager_name: string | null;
  updated_at: string;
  created_at: string;
  color: string;
  project: {
    id: number;
    title: string;
    description: string;
    shortDescription: string;
    status: string;
    timeline: string;
    start_date: string | null;
    end_date: string | null;
    image: string | null;
    image_url: string;
    project_manager: number | null;
    project_manager_name: string | null;
    updated_at: string;
    created_at: string;
    color: string;
  };
  plan: PrivateProjectPlan;
  project_name: string;
  project_description: string;
}
// ----------------------------------------------------------------------

const cleanText = (value: unknown) =>
  typeof value === "string" ? value.trim().replace(/^`+|`+$/g, "").trim() : "";

const parseTicketLinks = (value: unknown) =>
  cleanText(value)
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => {
      const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      return { url: normalized, label: url };
    });

const resolveMediaUrl = (value: unknown) => {
  const v = cleanText(value);
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("/")) return `${API_URL}${v}`;
  return `${API_URL}/${v}`;
};

const resolveId = (value: any) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const id = value?.id ?? value?.pk ?? value?.project_id;
    if (id === undefined || id === null) return "";
    return String(id);
  }
  return "";
};

const normalizeApiList = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const candidates = [
      (value as any).results,
      (value as any).data,
      (value as any).items,
      (value as any).list,
    ];
    for (const c of candidates) {
      if (Array.isArray(c)) return c;
    }
  }
  return [];
};

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 12000) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
};

const getCurrentProjectIdFromEmployee = (emp: any) =>
  resolveId(emp?.current_project_id ?? emp?.current_project?.id ?? emp?.current_project);

const getCurrentProjectTitleFromEmployee = (emp: any) =>
  cleanText(emp?.current_project_title) ||
  cleanText(emp?.current_project?.title) ||
  cleanText(emp?.current_project?.name) ||
  "";

const ticketStatusOptions = [
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In progress" },
  { value: "resolved", label: "Done" },
  { value: "closed", label: "Closed" },
];

const formatPersonLabel = (value: any) => {
  if (value === undefined || value === null || value === "") return "";
  if (Array.isArray(value)) return value.map(formatPersonLabel).filter(Boolean).join(", ");
  if (typeof value === "object") {
    return (
      cleanText(value.name) ||
      cleanText(value.employee_name) ||
      cleanText(value.full_name) ||
      cleanText(value.email) ||
      cleanText(value.employee_code) ||
      cleanText(value.employee_id) ||
      cleanText(value.id)
    );
  }
  return cleanText(value);
};

const mentionToken = (label: string) => `@${label.trim().replace(/\s+/g, "_")}`;

export default function EmployeeDashboard() {
  const { loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const lastTabRef = useRef("profile");
  const [stats, setStats] = useState<DashboardStats>({
    total_leaves_taken: 0,
    leaves_remaining: 20,
    pending_requests: 0,
    approved_overtime_hours: 0,
    verified_documents: 0,
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [employeeTickets, setEmployeeTickets] = useState<EmployeeTicket[]>([]);
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketExpandedById, setTicketExpandedById] = useState<Record<string, boolean>>({});
  const [ticketCommentDraftById, setTicketCommentDraftById] = useState<Record<string, string>>({});
  const [ticketCommentsById, setTicketCommentsById] = useState<Record<string, any[]>>({});
  const [ticketCommentsLoadingById, setTicketCommentsLoadingById] = useState<Record<string, boolean>>({});
  const [ticketCommentSavingById, setTicketCommentSavingById] = useState<Record<string, boolean>>({});
  const [ticketStatusSavingById, setTicketStatusSavingById] = useState<Record<string, boolean>>({});
  const [mentionQueryByTicketId, setMentionQueryByTicketId] = useState<Record<string, string>>({});
  const [ticketLinkDraftById, setTicketLinkDraftById] = useState<Record<string, string>>({});
  const [ticketFileDraftById, setTicketFileDraftById] = useState<Record<string, File[]>>({});
  const [ticketNotifications, setTicketNotifications] = useState<TicketNotification[]>([]);
  const safeLeaveRequests = Array.isArray(leaveRequests) ? leaveRequests : [];
  const safeOvertimeRequests = Array.isArray(overtimeRequests) ? overtimeRequests : [];
  const safeDocuments = Array.isArray(documents) ? documents : [];
  const safeEmployeeTickets = Array.isArray(employeeTickets) ? employeeTickets : [];

  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState<Partial<Employee>>({});

  const [submittingAction, setSubmittingAction] = useState<
    null | "leave" | "overtime" | "document" | "project"
  >(null);

  const [leaveForm, setLeaveForm] = useState({
    leave_type: "sick" as LeaveRequest["leave_type"],
    start_date: "",
    end_date: "",
    reason: "",
  });

  const [overtimeForm, setOvertimeForm] = useState({
    date: "",
    hours: "",
    reason: "",
    work_description_1: "",
    work_description_2: "",
  });

  const [docTitle, setDocTitle] = useState("");
  const [docDescription, setDocDescription] = useState("");
  const [docType, setDocType] = useState("Other");
  const [docFile, setDocFile] = useState<File | null>(null);

  // --- State needed for project editing (from original) ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedPrivateProjectId, setSelectedPrivateProjectId] = useState<string>("");
  const [projectDetails, setProjectDetails] = useState<Project | null>(null);
  const [memberProjects, setMemberProjects] = useState<Project[]>([]);
  const [memberProjectsLoading, setMemberProjectsLoading] = useState(false);
  const [memberProjectsError, setMemberProjectsError] = useState<string | null>(null);
  const [selectedProjectMembership, setSelectedProjectMembership] = useState<any | null>(null);
  const [selectedProjectMembershipLoading, setSelectedProjectMembershipLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [mentionEmployees, setMentionEmployees] = useState<any[]>([]);
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState<(string | number)[]>([]);
  const [projectEdit, setProjectEdit] = useState({
    title: "",
    shortDescription: "",
    description: "",
    image: "",
    details: "",
    timeline: "",
    team: "",
    technologies: "",
    working_days: "",
    spare_till_date: "",
    rejoin_note: "",
  });

  // --- NEW STATE for private project data ---
  const [privateProjectData, setPrivateProjectData] = useState<PrivateProjectResponse | null>(null);
  const [myAssignment, setMyAssignment] = useState<PrivateProjectAssignment | null>(null);
  const [workLoading, setWorkLoading] = useState(false);
  const [workPlanFetchError, setWorkPlanFetchError] = useState<string | null>(null);
  const [dailyUpdateDraft, setDailyUpdateDraft] = useState("");
  const [dailyUpdateDate, setDailyUpdateDate] = useState("");
  const [dailyUpdateSaving, setDailyUpdateSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Helper function to get auth header
  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem("access") || localStorage.getItem("access_token");
    if (!token) {
      router.push("/employee/login");
      throw new Error("No auth token");
    }
    return { Authorization: `JWT ${token}` };
  }, [router]);

  const fetchProjectDetailsById = useCallback(
    async (projectId: string) => {
      if (!projectId) return null;
      try {
        const res = await fetchWithTimeout(`${API_URL}/api/employees/projects/${encodeURIComponent(projectId)}/`, {
          headers: getAuthHeader(),
        });
        if (!res.ok) return null;
        const data = await res.json().catch(() => null);
        if (data && typeof data === "object") {
          setProjectDetails(data);
          return data;
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
      return null;
    },
    [getAuthHeader]
  );

  const canEditProject = useCallback(
    (role?: string, designation?: string) => {
      if (role === "project_manager" || role === "director" || role === "founder") return true;
      const d = (designation || "").toLowerCase();
      return d.includes("project manager") || d === "pm";
    },
    []
  );

  const canEditSelectedProject = useMemo(
    () =>
      Boolean(
        employee &&
          (canEditProject(employee.role, employee.designation) ||
            memberProjects.some((p) => String(p.id) === String(selectedProjectId)))
      ),
    [employee, memberProjects, selectedProjectId, canEditProject]
  );

  const resolveTicketId = useCallback((t: any): string => {
    const raw = t?.id ?? t?.ticket_id ?? t?.ticketId ?? t?.ticket?.id;
    return String(raw ?? "").trim();
  }, []);

  const normalizeTicketComments = useCallback((raw: any): any[] => {
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.results)
        ? raw.results
        : Array.isArray(raw?.comments)
          ? raw.comments
          : Array.isArray(raw?.data)
            ? raw.data
            : [];

    if (!Array.isArray(list)) return [];

    return list
      .map((c: any, idx: number) => {
        if (!c || typeof c !== "object") return null;
        const text =
          cleanText(c.text) ||
          cleanText(c.comment) ||
          cleanText(c.message) ||
          cleanText(c.body) ||
          "";
        if (!text) return null;
        const author =
          cleanText(c.created_by?.name) ||
          cleanText(c.created_by?.username) ||
          cleanText(c.author?.name) ||
          cleanText(c.author?.username) ||
          cleanText(c.author?.email) ||
          cleanText(c.employee_name) ||
          cleanText(c.user_name) ||
          cleanText(c.user?.username) ||
          "";
        const authorNormalized = author.trim().toLowerCase() === "admin" ? "Admin" : author;
        const createdAt = c.created_at ?? c.createdAt ?? c.created_on ?? c.createdOn ?? null;
        const id = c.id ?? c.pk ?? `${idx}`;
        const links = Array.isArray(c.links) ? c.links : [];
        const attachments = Array.isArray(c.attachments) ? c.attachments : [];
        return { id, text, author: authorNormalized, created_at: createdAt, links, attachments };
      })
      .filter(Boolean);
  }, []);

  const fetchTicketComments = useCallback(
    async (ticketId: string) => {
      const id = cleanText(ticketId);
      if (!id) return;
      if (ticketCommentsLoadingById[id]) return;
      setTicketCommentsLoadingById((p) => ({ ...p, [id]: true }));
      try {
        const urls = [
          `${API_URL}/api/employee-tickets/${encodeURIComponent(id)}/comments/`,
          `${API_URL}/api/employee-ticket-comments/?ticket=${encodeURIComponent(id)}`,
          `${API_URL}/api/ticket-comments/?ticket=${encodeURIComponent(id)}`,
          `${API_URL}/api/employee-tickets/${encodeURIComponent(id)}/`,
        ];

        for (const url of urls) {
          const res = await fetchWithTimeout(url, { headers: getAuthHeader() });
          if (!res.ok) continue;
          const data = await res.json().catch(() => null);
          const maybeTicket = data && typeof data === "object" && (data as any).ticket ? (data as any).ticket : data;

          if (maybeTicket && typeof maybeTicket === "object") {
            const embedded =
              (maybeTicket as any).comments ??
              (maybeTicket as any).comment_threads ??
              (maybeTicket as any).ticket_comments;
            const fieldComments: any[] = [];
            const employeeComment = cleanText((maybeTicket as any).employee_comment);
            if (employeeComment) fieldComments.push({ id: "employee_comment", text: employeeComment, author: "Me", created_at: null });
            const adminComment = cleanText((maybeTicket as any).admin_comment);
            if (adminComment) fieldComments.push({ id: "admin_comment", text: adminComment, author: "Admin", created_at: null });

            if (embedded) {
              const normalized = normalizeTicketComments(embedded);
              setTicketCommentsById((p) => ({ ...p, [id]: [...normalized, ...fieldComments] }));
              return;
            }

            if (fieldComments.length > 0) {
              setTicketCommentsById((p) => ({ ...p, [id]: fieldComments }));
              return;
            }
          }

          const normalized = normalizeTicketComments(data);
          setTicketCommentsById((p) => ({ ...p, [id]: normalized }));
          return;
        }

        setTicketCommentsById((p) => ({ ...p, [id]: [] }));
      } finally {
        setTicketCommentsLoadingById((p) => ({ ...p, [id]: false }));
      }
    },
    [getAuthHeader, normalizeTicketComments, ticketCommentsLoadingById]
  );

  const postTicketComment = useCallback(
    async (ticketId: string, text: string, links: Array<{ url: string; label: string }> = [], files: File[] = []) => {
      const id = cleanText(ticketId);
      const message = cleanText(text);
      if (!id || (!message && links.length === 0 && files.length === 0)) return;
      if (ticketCommentSavingById[id]) return;

      setTicketCommentSavingById((p) => ({ ...p, [id]: true }));
      try {
        if (links.length > 0 || files.length > 0) {
          const formData = new FormData();
          formData.append("text", message || "Shared files and links.");
          formData.append("links", JSON.stringify(links));
          files.forEach((file) => formData.append("files", file));
          const res = await fetchWithTimeout(`${API_URL}/api/employee-tickets/${encodeURIComponent(id)}/comments/`, {
            method: "POST",
            headers: getAuthHeader(),
            body: formData,
          });
          if (res.ok) {
            setTicketCommentDraftById((p) => ({ ...p, [id]: "" }));
            setTicketLinkDraftById((p) => ({ ...p, [id]: "" }));
            setTicketFileDraftById((p) => ({ ...p, [id]: [] }));
            await fetchTicketComments(id);
            return;
          }
        }

        const endpoints: { url: string; method: "POST" | "PATCH"; bodies: any[] }[] = [
          {
            url: `${API_URL}/api/employee-tickets/${encodeURIComponent(id)}/comments/`,
            method: "POST",
            bodies: [{ text: message }, { comment: message }, { message }],
          },
          {
            url: `${API_URL}/api/employee-ticket-comments/`,
            method: "POST",
            bodies: [{ ticket: Number(id), text: message }, { ticket_id: Number(id), text: message }, { ticket: id, text: message }],
          },
          {
            url: `${API_URL}/api/employee-tickets/${encodeURIComponent(id)}/`,
            method: "PATCH",
            bodies: [{ employee_comment: message }, { comment: message }, { notes: message }],
          },
        ];

        for (const ep of endpoints) {
          for (const body of ep.bodies) {
            const res = await fetchWithTimeout(ep.url, {
              method: ep.method,
              headers: { ...getAuthHeader(), "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            if (!res.ok) continue;
            const data = await res.json().catch(() => null);
            const normalized = normalizeTicketComments(data);
            if (normalized.length > 0) {
              setTicketCommentsById((p) => ({ ...p, [id]: [...(p[id] || []), ...normalized] }));
            } else {
              await fetchTicketComments(id);
            }
            setTicketCommentDraftById((p) => ({ ...p, [id]: "" }));
            return;
          }
        }

        alert("Failed to post comment");
      } finally {
        setTicketCommentSavingById((p) => ({ ...p, [id]: false }));
      }
    },
    [fetchTicketComments, getAuthHeader, normalizeTicketComments, ticketCommentSavingById]
  );

  const insertTicketMention = useCallback((ticketId: string, label: string) => {
    const id = cleanText(ticketId);
    const token = mentionToken(label);
    if (!id || !token || token === "@") return;
    setTicketCommentDraftById((prev) => {
      const current = prev[id] || "";
      const next = current.endsWith(" ") || !current ? `${current}${token} ` : `${current} ${token} `;
      return { ...prev, [id]: next };
    });
    setMentionQueryByTicketId((prev) => ({ ...prev, [id]: "" }));
  }, []);

  const updateTicketStatus = useCallback(
    async (ticketId: string, nextStatus: string) => {
      const id = cleanText(ticketId);
      const status = cleanText(nextStatus);
      if (!id || !status || ticketStatusSavingById[id]) return;

      setTicketStatusSavingById((prev) => ({ ...prev, [id]: true }));
      try {
        const res = await fetchWithTimeout(`${API_URL}/api/employee-tickets/${encodeURIComponent(id)}/`, {
          method: "PATCH",
          headers: { ...getAuthHeader(), "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          alert(data?.detail || "Failed to update ticket status");
          return;
        }

        const updatedTicket = data && typeof data === "object" && data.ticket ? data.ticket : data;
        setEmployeeTickets((prev) =>
          prev.map((ticket: any) => {
            const currentId = resolveTicketId(ticket);
            if (currentId !== id) return ticket;
            return updatedTicket && typeof updatedTicket === "object"
              ? { ...ticket, ...updatedTicket, status: updatedTicket.status || status }
              : { ...ticket, status };
          }),
        );
      } catch (error) {
        console.error(error);
        alert("Failed to update ticket status");
      } finally {
        setTicketStatusSavingById((prev) => ({ ...prev, [id]: false }));
      }
    },
    [getAuthHeader, resolveTicketId, ticketStatusSavingById],
  );

  const loadTicketNotifications = useCallback(async () => {
    try {
      const res = await fetchWithTimeout(`${API_URL}/api/employee-ticket-notifications/?unread=1&limit=10`, {
        headers: getAuthHeader(),
      });
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      setTicketNotifications(Array.isArray(data) ? data : []);
    } catch {}
  }, [getAuthHeader]);

  const markTicketNotificationsRead = useCallback(async () => {
    try {
      await fetchWithTimeout(`${API_URL}/api/employee-ticket-notifications/`, {
        method: "POST",
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ ids: "all" }),
      });
      setTicketNotifications([]);
    } catch {}
  }, [getAuthHeader]);

  const completeTicketWithComment = useCallback(
    async (ticketId: string, text: string) => {
      const id = cleanText(ticketId);
      const message = cleanText(text);
      const links = parseTicketLinks(ticketLinkDraftById[id] || "");
      const files = ticketFileDraftById[id] || [];
      if (!id || (!message && links.length === 0 && files.length === 0) || ticketCommentSavingById[id]) return;

      setTicketCommentSavingById((prev) => ({ ...prev, [id]: true }));
      try {
        const formData = new FormData();
        formData.append("status", "resolved");
        formData.append("employee_comment", message || "Shared files and links.");
        formData.append("links", JSON.stringify(links));
        files.forEach((file) => formData.append("files", file));
        const res = await fetchWithTimeout(`${API_URL}/api/employee-tickets/${encodeURIComponent(id)}/`, {
          method: "PATCH",
          headers: getAuthHeader(),
          body: formData,
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          alert(data?.detail || "Failed to mark ticket done");
          return;
        }
        const updatedTicket = data && typeof data === "object" && data.ticket ? data.ticket : data;
        setEmployeeTickets((prev) =>
          prev.map((ticket: any) => {
            const currentId = resolveTicketId(ticket);
            if (currentId !== id) return ticket;
            return updatedTicket && typeof updatedTicket === "object"
              ? { ...ticket, ...updatedTicket, status: updatedTicket.status || "resolved" }
              : { ...ticket, status: "resolved" };
          }),
        );
        setTicketCommentDraftById((prev) => ({ ...prev, [id]: "" }));
        setTicketLinkDraftById((prev) => ({ ...prev, [id]: "" }));
        setTicketFileDraftById((prev) => ({ ...prev, [id]: [] }));
        await fetchTicketComments(id);
        await loadTicketNotifications();
      } catch (error) {
        console.error(error);
        alert("Failed to mark ticket done");
      } finally {
        setTicketCommentSavingById((prev) => ({ ...prev, [id]: false }));
      }
    },
    [fetchTicketComments, getAuthHeader, loadTicketNotifications, resolveTicketId, ticketCommentSavingById, ticketFileDraftById, ticketLinkDraftById],
  );

  const calcInclusiveDays = useCallback((start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0;
    const diff = Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
    return diff > 0 ? diff : 0;
  }, []);

  // --------------------------------------------------------------------
  // NEW: fetch private project details
  // --------------------------------------------------------------------
  const fetchPrivateProject = useCallback(
    async (projectId: string): Promise<PrivateProjectResponse | null> => {
      if (!projectId) return null;
      setWorkPlanFetchError(null);
      try {
        const url = `${API_URL}/api/private-projects/${projectId}/`;
        const res = await fetchWithTimeout(url, { headers: getAuthHeader() });
        if (!res.ok) {
          if (res.status === 403) {
            setWorkPlanFetchError("403");
          } else {
            setWorkPlanFetchError(String(res.status));
          }
          return null;
        }
        const data: PrivateProjectResponse = await res.json();
        return data;
      } catch (error) {
        console.error("Error fetching private project:", error);
        setWorkPlanFetchError("network");
        return null;
      }
    },
    [getAuthHeader]
  );

  const loadWorkPlanForProject = useCallback(
    async (projectId: string, emp: any) => {
      const pid = cleanText(projectId);
      if (!pid) {
        setPrivateProjectData(null);
        setMyAssignment(null);
        return;
      }
      setWorkLoading(true);
      try {
        const data = await fetchPrivateProject(pid);
        setPrivateProjectData(data);

        if (data && emp?.id) {
          const empId = String(emp.id);
          const assignments = data.plan?.assignments || [];
          const found = assignments.find((a) => String(a.employee) === empId);
          setMyAssignment(found || null);
        } else {
          setMyAssignment(null);
        }
      } finally {
        setWorkLoading(false);
      }
    },
    [fetchPrivateProject]
  );

  // --------------------------------------------------------------------
  // Main fetch – uses private-projects only
  // --------------------------------------------------------------------
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const empRes = await fetchWithTimeout(`${API_URL}/api/employees/me/`, {
        headers: getAuthHeader(),
      });

      let empData = await empRes.json().catch(() => null);
      const originalStatus = Number((empData as any)?.original_status || 0);
      const authFailed =
        empRes.status === 401 ||
        empRes.status === 403 ||
        originalStatus === 401 ||
        originalStatus === 403 ||
        Boolean((empData as any)?.detail && !((empData as any)?.employee_id || (empData as any)?.employee));

      if (!empRes.ok || authFailed) {
        if (authFailed) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          router.push("/employee/login");
          return;
        }
        throw new Error("Failed to fetch employee");
      }

      if (empData && typeof empData === "object" && (empData as any).employee) {
        empData = (empData as any).employee;
      }

      const hasName = (d: any) =>
        typeof d?.name === "string" && d.name.trim().length > 0;
      const employeeCodeRaw = (empData as any)?.employee_id;
      const employeeCode =
        typeof employeeCodeRaw === "string"
          ? employeeCodeRaw.trim()
          : String(employeeCodeRaw || "").trim();

      const empId = (empData as any)?.id;
      if (empId !== undefined && empId !== null && String(empId).trim()) {
        try {
          const detailRes = await fetchWithTimeout(
            `${API_URL}/api/employees/${encodeURIComponent(String(empId))}/`,
            {
              headers: getAuthHeader(),
            }
          );
          if (detailRes.ok) {
            let details: any = await detailRes.json().catch(() => null);
            if (details && typeof details === "object" && (details as any).employee && typeof (details as any).employee === "object") {
              details = (details as any).employee;
            }
            if (details && typeof details === "object") {
              empData = { ...empData, ...details };
            }
          }
        } catch {}
      }

      if (!hasName(empData)) {
        if (!hasName(empData) && employeeCode) {
          try {
            const code = encodeURIComponent(employeeCode);
            const urls = [
              `${API_URL}/api/employees/?employee_id=${code}`,
              `${API_URL}/api/employees/?search=${code}`,
              `${API_URL}/api/employees/?q=${code}`,
            ];
            for (const url of urls) {
              const res = await fetchWithTimeout(url, { headers: getAuthHeader() });
              if (!res.ok) continue;
              const data = await res.json();
              const arr = Array.isArray(data) ? data : data.results || [];
              if (!Array.isArray(arr) || arr.length === 0) continue;
              const exact = arr.find((x: any) => String(x?.employee_id || "").trim() === employeeCode);
              empData = { ...empData, ...(exact || arr[0]) };
              break;
            }
          } catch {}
        }
      }

      const normalizedEmpData = {
        ...empData,
        name:
          cleanText((empData as any)?.name) ||
          cleanText((empData as any)?.employee_name) ||
          cleanText((empData as any)?.full_name) ||
          cleanText((empData as any)?.user_name) ||
          "",
        email:
          cleanText((empData as any)?.email) ||
          cleanText((empData as any)?.user_email) ||
          cleanText((empData as any)?.user?.email) ||
          cleanText((empData as any)?.account?.email) ||
          cleanText((empData as any)?.profile?.email) ||
          cleanText((empData as any)?.employee_email) ||
          "",
        phone:
          cleanText((empData as any)?.phone) ||
          cleanText((empData as any)?.mobile) ||
          cleanText((empData as any)?.contact_number) ||
          "",
      };

      setEmployee(normalizedEmpData);
      setEditProfile(normalizedEmpData);

      try {
        const peopleRes = await fetchWithTimeout(`${API_URL}/api/employees/?active=true&nopaginate=1`, {
          headers: getAuthHeader(),
        });
        if (peopleRes.ok) {
          const peopleRaw = await peopleRes.json().catch(() => null);
          setMentionEmployees(normalizeApiList(peopleRaw));
        }
      } catch {}

      // Determine the private project ID for the current employee
      let effectivePrivateProjectId = getCurrentProjectIdFromEmployee(normalizedEmpData) || "";
      const employeeIdNum = (normalizedEmpData as any)?.id;

      // If not set via current_project, try to find it from the private projects list
      if (!effectivePrivateProjectId && employeeIdNum) {
        try {
          const listRes = await fetchWithTimeout(`${API_URL}/api/private-projects/`, {
            headers: getAuthHeader(),
          });
          if (listRes.ok) {
            const listData = await listRes.json();
            const projectsList = Array.isArray(listData) ? listData : listData.results || [];
            const foundProject = projectsList.find((proj: any) => {
              const assignments = proj.plan?.assignments || proj.plan?.employees || [];
              return assignments.some((a: any) => String(a.employee) === String(employeeIdNum));
            });
            if (foundProject) {
              effectivePrivateProjectId = String(foundProject.id);
            }
          }
        } catch (err) {
          console.error("Error fetching private projects list", err);
        }
      }

      setSelectedPrivateProjectId(effectivePrivateProjectId);
      if (effectivePrivateProjectId) {
        await loadWorkPlanForProject(effectivePrivateProjectId, normalizedEmpData);
      } else {
        setPrivateProjectData(null);
        setMyAssignment(null);
      }

      // Fetch leaves, overtime, documents, tickets – unchanged
      let leavesData: any[] = [];
      let overtimeData: any[] = [];
      let docsData: any[] = [];

      const effectiveEmpId = (normalizedEmpData as any)?.id;
      if (effectiveEmpId !== undefined && effectiveEmpId !== null && String(effectiveEmpId).trim()) {
        const leaveRes = await fetchWithTimeout(`${API_URL}/api/leave-requests/?employee=${encodeURIComponent(String(effectiveEmpId))}`, {
          headers: getAuthHeader(),
        });
        if (leaveRes.ok) {
          const result = await leaveRes.json().catch(() => null);
          leavesData = normalizeApiList(result);
          setLeaveRequests(leavesData);
        } else {
          setLeaveRequests([]);
        }

        const otRes = await fetchWithTimeout(`${API_URL}/api/overtime-requests/?employee=${encodeURIComponent(String(effectiveEmpId))}`, {
          headers: getAuthHeader(),
        });
        if (otRes.ok) {
          const result = await otRes.json().catch(() => null);
          overtimeData = normalizeApiList(result);
          setOvertimeRequests(overtimeData);
        } else {
          setOvertimeRequests([]);
        }

        const docRes = await fetchWithTimeout(`${API_URL}/api/employee-documents/?employee=${encodeURIComponent(String(effectiveEmpId))}`, {
          headers: getAuthHeader(),
        });
        if (docRes.ok) {
          const result = await docRes.json().catch(() => null);
          docsData = normalizeApiList(result);
          setDocuments(docsData);
        } else {
          setDocuments([]);
        }

        // Fetch employee tickets (history) – unchanged
        try {
          const ticketUrls = [
            `${API_URL}/api/employee-tickets/?employee=${encodeURIComponent(String(effectiveEmpId))}`,
            `${API_URL}/api/employee-tickets/?employee_id=${encodeURIComponent(String(effectiveEmpId))}`,
            `${API_URL}/api/employee-tickets/?assigned_to=${encodeURIComponent(String(effectiveEmpId))}`,
            `${API_URL}/api/employee-tickets/?assigned_to_id=${encodeURIComponent(String(effectiveEmpId))}`,
            `${API_URL}/api/employee-tickets/?assignee=${encodeURIComponent(String(effectiveEmpId))}`,
            `${API_URL}/api/employee-tickets/?assignees=${encodeURIComponent(String(effectiveEmpId))}`,
            `${API_URL}/api/employee-tickets/`,
          ];

          let loadedTickets: any[] = [];
          for (const url of ticketUrls) {
            const tRes = await fetchWithTimeout(url, { headers: getAuthHeader() });
            if (!tRes.ok) continue;
            const raw = await tRes.json().catch(() => null);
            const arr = Array.isArray(raw) ? raw : raw?.results || [];
            if (!Array.isArray(arr)) continue;
            loadedTickets = arr;
            break;
          }

          const normalizedTickets = loadedTickets
            .map((item: any) =>
              item && typeof item === "object" && item.ticket && typeof item.ticket === "object" ? item.ticket : item
            )
            .filter(Boolean);

          const toScalarId = (value: any) => {
            if (value === undefined || value === null) return "";
            if (typeof value === "string" || typeof value === "number") return String(value);
            if (typeof value === "object") {
              const id = (value as any)?.id ?? (value as any)?.employee_id ?? (value as any)?.employeeId ?? (value as any)?.pk;
              return id === undefined || id === null ? "" : String(id);
            }
            return "";
          };

          const toIdList = (value: any): string[] => {
            const out: string[] = [];
            const push = (v: any) => {
              const s = toScalarId(v).trim();
              if (s) out.push(s);
            };

            if (value == null) return out;
            if (Array.isArray(value)) {
              value.forEach((v) => push(v));
            } else {
              push(value);
            }

            return Array.from(new Set(out));
          };

          const myId = String(effectiveEmpId);
          const myCode = String(employeeCode || "");
          const filtered = normalizedTickets.filter((t: any) => {
            const ownerId = toScalarId((t as any)?.employee?.id ?? (t as any)?.employee_id ?? (t as any)?.employeeId ?? (t as any)?.employee);
            const ownerCode = toScalarId((t as any)?.employee?.employee_id ?? (t as any)?.employee_id);

            const assignedIds = toIdList(
              (t as any)?.assigned_to_ids ??
                (t as any)?.assignees ??
                (t as any)?.assigned_to_id ??
                (t as any)?.assigned_to
            );

            return (
              (ownerId && ownerId === myId) ||
              (myCode && (ownerId === myCode || ownerCode === myCode)) ||
              assignedIds.includes(myId) ||
              (myCode && assignedIds.includes(myCode))
            );
          });
          setEmployeeTickets(filtered);
        } catch {
          setEmployeeTickets([]);
        }
      }

      const approvedLeaves = leavesData.filter((l) => l.status === "approved");
      const pendingCount =
        leavesData.filter((l) => l.status === "pending").length +
        overtimeData.filter((o) => o.status === "pending").length;
      const approvedOT = overtimeData
        .filter((o) => o.status === "approved")
        .reduce(
          (sum: number, o: any) => sum + (typeof o.hours === "string" ? parseInt(o.hours) : o.hours),
          0
        );
      const verifiedDocs = docsData.filter((d) => d.status === "verified");

      setStats({
        total_leaves_taken: approvedLeaves.length,
        leaves_remaining: 20 - approvedLeaves.length,
        pending_requests: pendingCount,
        approved_overtime_hours: approvedOT,
        verified_documents: verifiedDocs.length,
      });
      await loadTicketNotifications();
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [
    getAuthHeader,
    loadTicketNotifications,
    loadWorkPlanForProject,
    router,
  ]);

  // --------------------------------------------------------------------
  // useEffect calls
  // --------------------------------------------------------------------
  useEffect(() => {
    if (authLoading) return;

    const token = localStorage.getItem("access") || localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      router.push("/employee/login");
      return;
    }

    fetchDashboardData();
  }, [authLoading, fetchDashboardData, router]);

  useEffect(() => {
    if (dailyUpdateDate) return;
    setDailyUpdateDate(new Date().toISOString().slice(0, 10));
  }, [dailyUpdateDate]);

  // --------------------------------------------------------------------
  // Form handlers restored from original
  // --------------------------------------------------------------------
  const submitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setSubmittingAction("leave");
    try {
      const res = await fetch(`${API_URL}/api/leave-requests/`, {
        method: "POST",
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leaveForm,
          employee: employee.id,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.detail || "Failed to submit leave request");
        return;
      }
      setLeaveForm({ leave_type: "sick", start_date: "", end_date: "", reason: "" });
      await fetchDashboardData();
    } catch (error) {
      console.error(error);
      alert("Failed to submit leave request");
    } finally {
      setSubmittingAction(null);
    }
  };

  const submitOvertime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setSubmittingAction("overtime");
    try {
      const payload: any = {
        date: overtimeForm.date,
        hours: parseInt(overtimeForm.hours) || 0,
        reason: overtimeForm.reason,
        employee: employee.id,
      };
      if (overtimeForm.work_description_1.trim()) {
        payload.work_description_1 = overtimeForm.work_description_1.trim();
      }
      if (overtimeForm.work_description_2.trim()) {
        payload.work_description_2 = overtimeForm.work_description_2.trim();
      }

      const res = await fetch(`${API_URL}/api/overtime-requests/`, {
        method: "POST",
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.detail || "Failed to submit overtime request");
        return;
      }
      setOvertimeForm({ date: "", hours: "", reason: "", work_description_1: "", work_description_2: "" });
      await fetchDashboardData();
    } catch (error) {
      console.error(error);
      alert("Failed to submit overtime request");
    } finally {
      setSubmittingAction(null);
    }
  };

  const uploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    if (!docFile) {
      alert("Please select a file");
      return;
    }
    setSubmittingAction("document");
    try {
      const formData = new FormData();
      formData.append("title", docTitle);
      formData.append("description", docDescription);
      formData.append("file", docFile);
      formData.append("employee", employee.id);
      if (docType) formData.append("document_type", docType);

      const res = await fetch(`${API_URL}/api/employee-documents/`, {
        method: "POST",
        headers: getAuthHeader(),
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.detail || "Failed to upload document");
        return;
      }
      setDocTitle("");
      setDocDescription("");
      setDocType("Other");
      setDocFile(null);
      await fetchDashboardData();
    } catch (error) {
      console.error(error);
      alert("Failed to upload document");
    } finally {
      setSubmittingAction(null);
    }
  };

  const updateProject = async () => {
    if (!employee) return;
    const allowed =
      canEditProject(employee.role, employee.designation) ||
      memberProjects.some((p) => String(p.id) === String(selectedProjectId));
    if (!allowed) return;
    setSubmittingAction("project");
    try {
      const projectValue =
        selectedProjectId && String(selectedProjectId).trim()
          ? /^\d+$/.test(String(selectedProjectId).trim())
            ? Number(String(selectedProjectId).trim())
            : String(selectedProjectId).trim()
          : null;
      const res = await fetch(`${API_URL}/api/employees/${employee.id}/`, {
        method: "PATCH",
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ current_project: projectValue }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.detail || "Failed to update project");
        return;
      }
      await fetchDashboardData();
    } catch (error) {
      console.error(error);
      alert("Failed to update project");
    } finally {
      setSubmittingAction(null);
    }
  };

  const saveProjectDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    if (!canEditSelectedProject) return;
    const projectId = selectedProjectId || getCurrentProjectIdFromEmployee(employee) || "";
    if (!projectId) return;

    setSubmittingAction("project");
    try {
      const stats: Record<string, string> = {
        ...(projectDetails?.stats || {}),
        working_days: projectEdit.working_days || "",
        spare_till_date: projectEdit.spare_till_date || "",
        rejoin_note: projectEdit.rejoin_note || "",
        team_member_ids: selectedTeamMemberIds.join(","),
      };

      const techArr = (projectEdit.technologies || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const formData = new FormData();
      formData.append("title", projectEdit.title || "");
      formData.append("shortDescription", projectEdit.shortDescription || "");
      formData.append("description", projectEdit.description || "");
      formData.append("details", projectEdit.details || "");
      formData.append("timeline", projectEdit.timeline || "");
      formData.append("team", projectEdit.team || "");
      formData.append("technologies", JSON.stringify(techArr));
      formData.append("stats", JSON.stringify(stats));
      if (projectEdit.image) {
        formData.append("image", projectEdit.image);
      }

      const urls = [
        `${API_URL}/api/employees/projects/${projectId}/`,
      ];
      let res: Response | null = null;
      for (const url of urls) {
        const r = await fetch(url, {
          method: "PATCH",
          headers: getAuthHeader(),
          body: formData,
        });
        if (r.status === 404) continue;
        res = r;
        break;
      }
      if (!res) {
        alert("Failed to update project details");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.detail || "Failed to update project details");
        return;
      }
      await fetchProjectDetailsById(projectId);
      await fetchDashboardData();
    } catch (error) {
      console.error(error);
      alert("Failed to update project details");
    } finally {
      setSubmittingAction(null);
    }
  };

  const postDailyUpdate = async () => {
    if (!employee) return;
    const projectId = privateProjectData?.id;
    if (!projectId) return;
    const text = dailyUpdateDraft.trim();
    if (!text) return;

    if (!myAssignment?.id) {
      alert("You are not assigned to this project plan, so you cannot post updates.");
      return;
    }

    const date = cleanText(dailyUpdateDate) || new Date().toISOString().slice(0, 10);

    setDailyUpdateSaving(true);
    try {
      const res = await fetch(
        `${API_URL}/api/private-projects/${encodeURIComponent(String(projectId))}/plan/assignments/${encodeURIComponent(String(myAssignment.id))}/daily-updates/`,
        {
          method: "POST",
          headers: { ...getAuthHeader(), "Content-Type": "application/json" },
          body: JSON.stringify({ text, date }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.detail || "Failed to post daily update");
        return;
      }
      setDailyUpdateDraft("");
      // Refresh project data to see the new update
      await loadWorkPlanForProject(String(projectId), employee);
    } catch (e) {
      console.error(e);
      alert("Failed to post daily update");
    } finally {
      setDailyUpdateSaving(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const res = await fetch(`${API_URL}/api/employees/${employee?.id}/`, {
        method: "PATCH",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editProfile),
      });

      if (res.ok) {
        const updated = await res.json();
        setEmployee(updated);
        setEditMode(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    }
  };

  const handleLogout = () => {
    logout();
  };

  const changeTemporaryPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordChanging(true);
    try {
      const res = await fetch(`${API_URL}/api/employee/password/change/`, {
        method: "POST",
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success === false || Number(data?.original_status || 0) >= 400) {
        const payload = data?.error || data;
        setPasswordError(payload?.detail || "Failed to change password");
        return;
      }

      if (typeof data?.access === "string" && data.access) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("access_token", data.access);
      }
      if (typeof data?.refresh === "string" && data.refresh) {
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("refresh_token", data.refresh);
      }
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      await fetchDashboardData();
    } catch (error) {
      console.error(error);
      setPasswordError("Network error. Please try again.");
    } finally {
      setPasswordChanging(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Failed to load employee data</p>
            <Button onClick={() => router.push("/employee/login")} className="w-full mt-4">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (employee.requires_password_change) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-24 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Change Temporary Password</CardTitle>
            <p className="text-sm text-gray-600">
              Your admin-created password worked. Set your own password before opening the dashboard.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={changeTemporaryPassword} className="space-y-4">
              {passwordError ? <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{passwordError}</div> : null}
              <div className="space-y-2">
                <Label>Temporary password</Label>
                <Input
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>New password</Label>
                <Input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))}
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm new password</Label>
                <Input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirm_password: e.target.value }))}
                  minLength={8}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={passwordChanging}>
                {passwordChanging ? "Saving..." : "Save Password"}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={handleLogout} disabled={passwordChanging}>
                Logout
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const authEmail = "";
  const resolvedEmail =
    cleanText(employee.email) ||
    cleanText((employee as any)?.user_email) ||
    cleanText((employee as any)?.user?.email) ||
    cleanText((employee as any)?.account?.email) ||
    cleanText((employee as any)?.profile?.email) ||
    cleanText((employee as any)?.employee_email) ||
    (employee.login_id && employee.login_id.includes("@") ? cleanText(employee.login_id) : "") ||
    authEmail;
  const resolvedPhone =
    employee.phone || (employee.login_id && !employee.login_id.includes("@") ? employee.login_id : "");
  const resolvedName =
    (typeof (employee as any)?.name === "string" && (employee as any).name.trim()) ||
    (typeof (employee as any)?.employee_name === "string" && (employee as any).employee_name.trim()) ||
    (typeof (employee as any)?.full_name === "string" && (employee as any).full_name.trim()) ||
    (typeof (employee as any)?.user_name === "string" && (employee as any).user_name.trim()) ||
    (typeof resolvedEmail === "string" && resolvedEmail.trim()) ||
    "Employee";
  const profilePicUrl = resolveMediaUrl(employee.profile_pic);

  return (
    <div className="h-screen overflow-y-auto pt-16 md:pt-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {profilePicUrl && (
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-white">
                  <Image
                    src={profilePicUrl}
                    alt={resolvedName}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h2 className="text-3xl font-bold">{resolvedName}</h2>
                <h3 className="text-blue-100">{employee.designation || "Employee"}</h3>
                {employee.employee_id && (
                  <div className="text-blue-100/90 text-sm mt-0.5 font-mono">{employee.employee_id}</div>
                )}
                {resolvedEmail && <div className="text-blue-100/90 text-sm mt-0.5">{resolvedEmail}</div>}
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="rounded-full bg-white/10 text-white border border-white/20 hover:bg-white hover:text-blue-700 h-10 px-5"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            {
              label: "Leaves Taken",
              value: stats.total_leaves_taken,
              icon: Calendar,
              color: "bg-green-500",
            },
            {
              label: "Remaining Leaves",
              value: stats.leaves_remaining,
              icon: CheckCircle,
              color: "bg-blue-500",
            },
            {
              label: "Pending Requests",
              value: stats.pending_requests,
              icon: AlertCircle,
              color: "bg-yellow-500",
            },
            {
              label: "Overtime Hours",
              value: stats.approved_overtime_hours,
              icon: Clock,
              color: "bg-purple-500",
            },
            {
              label: "Verified Docs",
              value: stats.verified_documents,
              icon: FileText,
              color: "bg-pink-500",
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.color} rounded-lg p-3 text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full overflow-x-auto">
            <TabsList className="grid w-full min-w-[780px] grid-cols-7 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="leaves">Leaves</TabsTrigger>
              <TabsTrigger value="overtime">Overtime</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
              <TabsTrigger value="projects">Private Project Details</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Employee Profile</CardTitle>
                {!editMode ? (
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditMode(false);
                        setEditProfile(employee);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleProfileUpdate}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      label: "Employee ID",
                      key: "employee_id",
                      editable: false,
                    },
                    {
                      label: "Name",
                      key: "name",
                      editable: editMode,
                    },
                    {
                      label: "Email",
                      key: "email",
                      editable: false,
                      value: resolvedEmail || "-",
                    },
                    {
                      label: "Phone",
                      key: "phone",
                      editable: false,
                      value: resolvedPhone || "-",
                    },
                    {
                      label: "Designation",
                      key: "designation",
                      editable: false,
                    },
                    {
                      label: "Location",
                      key: "location",
                      editable: editMode,
                    },
                    {
                      label: "Employment Type",
                      key: "employment_type",
                      editable: false,
                    },
                    {
                      label: "Qualification",
                      key: "qualification",
                      editable: editMode,
                    },
                    {
                      label: "Status",
                      key: "status",
                      editable: false,
                    },
                  ].map((field) => (
                    <div key={field.key}>
                      <Label className="text-sm font-medium text-gray-600">
                        {field.label}
                      </Label>
                      {field.editable ? (
                        <Input
                          value={editProfile[field.key as keyof Employee] as string}
                          onChange={(e) =>
                            setEditProfile({
                              ...editProfile,
                              [field.key]: e.target.value,
                            })
                          }
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium mt-1">
                          {("value" in field ? (field as any).value : (employee[field.key as keyof Employee] as string)) || "-"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaves Tab */}
          <TabsContent value="leaves">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Leave</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitLeave} className="space-y-4">
                    <div>
                      <Label>Leave Type</Label>
                      <select
                        value={leaveForm.leave_type}
                        onChange={(e) =>
                          setLeaveForm((prev) => ({
                            ...prev,
                            leave_type: e.target.value as any,
                          }))
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                      >
                        <option value="sick">Sick</option>
                        <option value="casual">Casual</option>
                        <option value="earned">Earned</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={leaveForm.start_date}
                          onChange={(e) =>
                            setLeaveForm((prev) => ({ ...prev, start_date: e.target.value }))
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={leaveForm.end_date}
                          onChange={(e) =>
                            setLeaveForm((prev) => ({ ...prev, end_date: e.target.value }))
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Days:{" "}
                      <span className="font-semibold text-gray-900">
                        {calcInclusiveDays(leaveForm.start_date, leaveForm.end_date) || "-"}
                      </span>
                    </div>
                    <div>
                      <Label>Reason</Label>
                      <Textarea
                        value={leaveForm.reason}
                        onChange={(e) => setLeaveForm((prev) => ({ ...prev, reason: e.target.value }))}
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submittingAction === "leave"}
                      className="w-full"
                    >
                      {submittingAction === "leave" ? "Submitting..." : "Submit Leave Request"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Leave Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {safeLeaveRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No leave requests yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {safeLeaveRequests.map((request) => (
                        <Link key={request.id} href={`/employee/leaves/${request.id}`} className="block">
                          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold capitalize">{request.leave_type} Leave</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {new Date(request.start_date).toLocaleDateString()} to{" "}
                                  {new Date(request.end_date).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">{request.reason}</p>
                                {request.status === "rejected" && request.rejection_reason && (
                                  <p className="text-xs text-red-600 mt-2">{request.rejection_reason}</p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge
                                  className={`${
                                    request.status === "approved"
                                      ? "bg-green-500"
                                      : request.status === "rejected"
                                        ? "bg-red-500"
                                        : "bg-yellow-500"
                                  }`}
                                >
                                  {request.status}
                                </Badge>
                                <span className="text-sm font-medium text-gray-600">
                                  {(request.total_days ||
                                    request.days_count ||
                                    calcInclusiveDays(request.start_date, request.end_date) ||
                                    0)}{" "}
                                  days
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Private Project Plan card */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Private Project Plan</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    disabled={!employee || !privateProjectData || workLoading}
                    onClick={() => {
                      if (!employee || !privateProjectData) return;
                      void loadWorkPlanForProject(String(privateProjectData.id), employee);
                    }}
                  >
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  {!employee ? (
                    <div className="text-center py-8 text-gray-500">No private project plan available.</div>
                  ) : workLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading private project plan...</div>
                  ) : !privateProjectData ? (
                    <div className="text-center py-8 text-gray-500">
                      {workPlanFetchError === "403"
                        ? "You are not assigned to this project."
                        : workPlanFetchError
                        ? `Failed to load project (HTTP ${workPlanFetchError}).`
                        : "No project assigned yet."}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xl font-semibold truncate">
                            {privateProjectData.project_name || privateProjectData.title}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {myAssignment?.start_date || privateProjectData.start_date || "-"} →{" "}
                            {myAssignment?.end_date || privateProjectData.end_date || "-"}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {myAssignment?.status || "assigned"}
                        </Badge>
                      </div>

                      {myAssignment ? (
                        <>
                          <div className="border rounded-lg p-4 bg-gray-50">
                            <div className="text-sm font-semibold text-gray-800 mb-2">Assigned Work</div>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                              {myAssignment.work || "-"}
                            </div>
                          </div>

                          <div className="border rounded-lg p-4">
                            <div className="text-sm font-semibold text-gray-800 mb-2">Admin Review Comment</div>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                              {myAssignment.admin_comment || "-"}
                            </div>
                          </div>

                          <div className="border rounded-lg p-4">
                            <div className="text-sm font-semibold text-gray-800 mb-2">Post Daily Update</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <Label>Date</Label>
                                <Input
                                  type="date"
                                  value={dailyUpdateDate}
                                  onChange={(e) => setDailyUpdateDate(e.target.value)}
                                  className="mt-1"
                                  disabled={dailyUpdateSaving}
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Label>Update</Label>
                                <Textarea
                                  value={dailyUpdateDraft}
                                  onChange={(e) => setDailyUpdateDraft(e.target.value)}
                                  className="mt-1"
                                  rows={3}
                                  placeholder="What did you do today? blockers? next steps?"
                                  disabled={dailyUpdateSaving}
                                />
                              </div>
                            </div>
                            <Button
                              onClick={postDailyUpdate}
                              disabled={!myAssignment || dailyUpdateSaving || !dailyUpdateDraft.trim()}
                              className="w-full mt-3"
                            >
                              {dailyUpdateSaving ? "Posting..." : "Post Update"}
                            </Button>
                          </div>

                          {myAssignment.daily_updates && myAssignment.daily_updates.length > 0 ? (
                            <div className="border rounded-lg p-4">
                              <div className="text-sm font-semibold text-gray-800 mb-2">Recent Updates</div>
                              <div className="space-y-2">
                                {myAssignment.daily_updates.slice(0, 5).map((u, idx) => (
                                  <div key={`${u?.created_at || idx}`} className="border rounded-lg p-3">
                                    <div className="text-xs text-gray-500">
                                      {u.date || "-"} • {u.created_at ? new Date(u.created_at).toLocaleString() : "-"}
                                    </div>
                                    <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                                      {u.text || "-"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <div className="text-sm text-gray-600">No assignment found for you yet.</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Overtime Tab */}
          <TabsContent value="overtime">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Overtime</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitOvertime} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={overtimeForm.date}
                          onChange={(e) => setOvertimeForm((p) => ({ ...p, date: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Hours</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={overtimeForm.hours}
                          onChange={(e) => setOvertimeForm((p) => ({ ...p, hours: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Reason</Label>
                      <Textarea
                        value={overtimeForm.reason}
                        onChange={(e) => setOvertimeForm((p) => ({ ...p, reason: e.target.value }))}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Work Description 1</Label>
                      <Textarea
                        value={overtimeForm.work_description_1}
                        onChange={(e) =>
                          setOvertimeForm((p) => ({ ...p, work_description_1: e.target.value }))
                        }
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label>Work Description 2</Label>
                      <Textarea
                        value={overtimeForm.work_description_2}
                        onChange={(e) =>
                          setOvertimeForm((p) => ({ ...p, work_description_2: e.target.value }))
                        }
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submittingAction === "overtime"}
                      className="w-full"
                    >
                      {submittingAction === "overtime" ? "Submitting..." : "Submit Overtime Request"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overtime Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {safeOvertimeRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No overtime requests yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {safeOvertimeRequests.map((request) => (
                        <Link key={request.id} href={`/employee/overtime/${request.id}`} className="block">
                          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">
                                  {new Date(request.date).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">{request.hours} hours</p>
                                <p className="text-xs text-gray-500 mt-2">{request.reason}</p>
                                {request.status === "rejected" && request.rejection_reason && (
                                  <p className="text-xs text-red-600 mt-2">{request.rejection_reason}</p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge
                                  className={`${
                                    request.status === "approved"
                                      ? "bg-green-500"
                                      : request.status === "rejected"
                                        ? "bg-red-500"
                                        : "bg-yellow-500"
                                  }`}
                                >
                                  {request.status}
                                </Badge>
                                {request.extra_pay && (
                                  <span className="text-sm font-medium text-gray-600">
                                    ₹{request.extra_pay}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Ticket History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticketNotifications.length > 0 ? (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-blue-900">Ticket alerts</div>
                        <div className="mt-2 space-y-2">
                          {ticketNotifications.slice(0, 3).map((notification) => (
                            <div key={notification.id} className="text-sm text-blue-800">
                              <span className="font-medium">{notification.title}</span>
                              {notification.message ? <span className="text-blue-700"> - {notification.message}</span> : null}
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="bg-white" onClick={markTicketNotificationsRead}>
                        Mark read
                      </Button>
                    </div>
                  </div>
                ) : null}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    placeholder="Search by ticket id, title, status..."
                    className="pl-9"
                  />
                </div>

                {safeEmployeeTickets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No tickets found</div>
                ) : (
                  <div className="space-y-3">
                    {safeEmployeeTickets
                      .filter((t) => {
                        const q = ticketSearch.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          String(t.id).toLowerCase().includes(q) ||
                          String(t.title || "").toLowerCase().includes(q) ||
                          String(t.description || "").toLowerCase().includes(q) ||
                          String(t.status || "").toLowerCase().includes(q)
                        );
                      })
                      .map((t, idx) => {
                        const ticketId = resolveTicketId(t);
                        const title =
                          String((t as any)?.title ?? "") ||
                          String((t as any)?.ticket_title ?? "") ||
                          String((t as any)?.Ticket_Title ?? "") ||
                          String((t as any)?.subject ?? "") ||
                          (ticketId ? `Ticket #${ticketId}` : "Ticket");
                        const status = String((t as any)?.status ?? "pending");
                        const statusKey = String(status || "").toLowerCase().replace(/_/g, "-");
                        const createdAt = (t as any)?.created_at ?? (t as any)?.createdAt;
                        const assigneesRaw =
                          (t as any)?.assigned_to_ids ?? (t as any)?.assignees ?? (t as any)?.assigned_to ?? (t as any)?.Reassigned_to ?? (t as any)?.reassigned_to;
                        const assigneeLabel = formatPersonLabel(assigneesRaw);
                        const description = String((t as any)?.description ?? (t as any)?.details ?? "");
                        const isExpanded = Boolean(ticketId && ticketExpandedById[ticketId]);
                        const comments = ticketId ? ticketCommentsById[ticketId] || [] : [];
                        const loadingComments = Boolean(ticketId && ticketCommentsLoadingById[ticketId]);
                        const draft = ticketId ? ticketCommentDraftById[ticketId] || "" : "";
                        const linkDraft = ticketId ? ticketLinkDraftById[ticketId] || "" : "";
                        const fileDraft = ticketId ? ticketFileDraftById[ticketId] || [] : [];
                        const savingComment = Boolean(ticketId && ticketCommentSavingById[ticketId]);
                        const savingStatus = Boolean(ticketId && ticketStatusSavingById[ticketId]);
                        const mentionQuery = ticketId ? mentionQueryByTicketId[ticketId] || "" : "";
                        const clientMention =
                          cleanText((t as any)?.client_name) ||
                          cleanText((t as any)?.client) ||
                          cleanText(projectDetails?.client) ||
                          cleanText(privateProjectData?.project?.title) ||
                          cleanText(privateProjectData?.title) ||
                          getCurrentProjectTitleFromEmployee(employee);
                        const mentionChoices = [
                          { label: "Admin", hint: "admin" },
                          ...(clientMention ? [{ label: clientMention, hint: "client/project" }] : []),
                          ...mentionEmployees.map((person: any) => ({
                            label:
                              cleanText(person?.name) ||
                              cleanText(person?.employee_name) ||
                              cleanText(person?.user_name) ||
                              cleanText(person?.email) ||
                              cleanText(person?.employee_id),
                            hint: cleanText(person?.designation) || cleanText(person?.employee_id) || "employee",
                          })),
                        ]
                          .filter((x) => x.label)
                          .filter((x, choiceIndex, arr) => arr.findIndex((y) => y.label.toLowerCase() === x.label.toLowerCase()) === choiceIndex)
                          .filter((x) => {
                            const q = mentionQuery.trim().toLowerCase();
                            if (!q) return true;
                            return x.label.toLowerCase().includes(q) || x.hint.toLowerCase().includes(q);
                          })
                          .slice(0, 8);
                        return (
                        <div key={ticketId || `${idx}`} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold truncate">
                                <span className="font-mono text-gray-500 mr-2">#{ticketId || "-"}</span>
                                {title}
                              </div>
                              <div className="mt-1 flex items-center gap-2">
                                <div className="text-xs text-gray-500">Status:</div>
                                <Badge
                                  className={`text-xs ${
                                    statusKey === "resolved"
                                      ? "bg-green-500"
                                      : statusKey === "closed"
                                        ? "bg-gray-500"
                                        : statusKey === "in-progress"
                                          ? "bg-blue-500"
                                          : "bg-yellow-500"
                                  }`}
                                >
                                  {statusKey || "pending"}
                                </Badge>
                                {savingStatus ? <span className="text-xs text-blue-600">Saving...</span> : null}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Assigned to: {assigneeLabel || "Unassigned"}
                              </div>
                              {createdAt ? (
                                <div className="text-xs text-gray-400 mt-1">
                                  {new Date(createdAt as any).toLocaleString()}
                                </div>
                              ) : null}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <select
                                value={statusKey === "pending" ? "open" : statusKey || "open"}
                                disabled={!ticketId || savingStatus}
                                onChange={(e) => {
                                  if (!ticketId) return;
                                  updateTicketStatus(ticketId, e.target.value);
                                }}
                                className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700"
                              >
                                {ticketStatusOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                disabled={!ticketId}
                                onClick={() => {
                                  if (!ticketId) return;
                                  const nextOpen = !Boolean(ticketExpandedById[ticketId]);
                                  setTicketExpandedById((p) => ({ ...p, [ticketId]: nextOpen }));
                                  if (nextOpen) {
                                    fetchTicketComments(ticketId);
                                  }
                                }}
                              >
                                {isExpanded ? "Hide comments" : "Comments"}
                              </Button>
                            </div>
                          </div>
                          {description ? (
                            <div className="text-xs text-gray-600 mt-3 whitespace-pre-wrap">{description}</div>
                          ) : null}
                          {isExpanded ? (
                            <div className="mt-4 border-t pt-4 space-y-3">
                              {loadingComments ? (
                                <div className="text-xs text-gray-500">Loading comments...</div>
                              ) : comments.length === 0 ? (
                                <div className="text-xs text-gray-500">No comments yet</div>
                              ) : (
                                <div className="space-y-2">
                                  {comments.map((c: any, cidx: number) => {
                                    const author = cleanText(c?.author) || "Unknown";
                                    const when = c?.created_at ? new Date(c.created_at).toLocaleString() : "";
                                    return (
                                      <div
                                        key={String(c?.id ?? `${ticketId}:${cidx}`)}
                                        className="bg-gray-50 border rounded-lg p-3"
                                      >
                                        <div className="flex items-center justify-between gap-3">
                                          <div className="text-xs font-medium text-gray-700 truncate">{author}</div>
                                          {when ? <div className="text-[11px] text-gray-400">{when}</div> : <div />}
                                        </div>
                                        <div className="text-xs text-gray-700 mt-1 whitespace-pre-wrap">{String(c?.text ?? "")}</div>
                                        {Array.isArray(c?.links) && c.links.length > 0 ? (
                                          <div className="mt-2 flex flex-wrap gap-2">
                                            {c.links.map((link: any, lidx: number) => {
                                              const url = cleanText(link?.url ?? link);
                                              if (!url) return null;
                                              return (
                                                <a
                                                  key={`${ticketId}:${cidx}:link:${lidx}`}
                                                  href={url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100"
                                                >
                                                  <LinkIcon className="h-3 w-3" />
                                                  {cleanText(link?.label) || url}
                                                </a>
                                              );
                                            })}
                                          </div>
                                        ) : null}
                                        {Array.isArray(c?.attachments) && c.attachments.length > 0 ? (
                                          <div className="mt-2 flex flex-wrap gap-2">
                                            {c.attachments.map((file: any, fidx: number) => {
                                              const url = resolveMediaUrl(file?.file_url ?? file?.file ?? file?.url);
                                              if (!url) return null;
                                              return (
                                                <a
                                                  key={`${ticketId}:${cidx}:file:${fidx}`}
                                                  href={url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                                                >
                                                  <Paperclip className="h-3 w-3" />
                                                  {cleanText(file?.file_name) || `Attachment ${fidx + 1}`}
                                                </a>
                                              );
                                            })}
                                          </div>
                                        ) : null}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              <div className="space-y-2">
                                <Textarea
                                  value={draft}
                                  onChange={(e) => {
                                    if (!ticketId) return;
                                    const value = e.target.value;
                                    setTicketCommentDraftById((p) => ({ ...p, [ticketId]: value }));
                                    const match = value.match(/@([A-Za-z0-9_.-]*)$/);
                                    setMentionQueryByTicketId((p) => ({ ...p, [ticketId]: match ? match[1] : "" }));
                                  }}
                                  rows={3}
                                  placeholder="Write your work update/comment... Use @ to tag Admin, employees, or clients."
                                />
                                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                                  <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                      value={linkDraft}
                                      onChange={(e) => ticketId && setTicketLinkDraftById((p) => ({ ...p, [ticketId]: e.target.value }))}
                                      placeholder="Add proof links, comma or new line separated"
                                      className="pl-9"
                                    />
                                  </div>
                                  <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    <Paperclip className="h-4 w-4" />
                                    Upload files
                                    <input
                                      type="file"
                                      multiple
                                      className="hidden"
                                      onChange={(e) => {
                                        if (!ticketId) return;
                                        const files = Array.from(e.target.files || []);
                                        setTicketFileDraftById((p) => ({ ...p, [ticketId]: [...(p[ticketId] || []), ...files].slice(0, 10) }));
                                        e.currentTarget.value = "";
                                      }}
                                    />
                                  </label>
                                </div>
                                {fileDraft.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {fileDraft.map((file, fidx) => (
                                      <span key={`${ticketId}:draft-file:${fidx}`} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                        <Paperclip className="h-3 w-3" />
                                        {file.name}
                                        <button
                                          type="button"
                                          className="text-gray-400 hover:text-red-500"
                                          onClick={() => ticketId && setTicketFileDraftById((p) => ({ ...p, [ticketId]: (p[ticketId] || []).filter((_, i) => i !== fidx) }))}
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                ) : null}
                                <div className="flex flex-wrap gap-2">
                                  {mentionChoices.map((choice) => (
                                    <button
                                      key={`${ticketId}:${choice.label}`}
                                      type="button"
                                      className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                      onClick={() => ticketId && insertTicketMention(ticketId, choice.label)}
                                    >
                                      {mentionToken(choice.label)}
                                      <span className="ml-1 text-blue-500">({choice.hint})</span>
                                    </button>
                                  ))}
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={!ticketId || savingComment || (!cleanText(draft) && !cleanText(linkDraft) && fileDraft.length === 0)}
                                    onClick={() => {
                                      if (!ticketId) return;
                                      setTicketCommentDraftById((p) => ({ ...p, [ticketId]: "" }));
                                      setTicketLinkDraftById((p) => ({ ...p, [ticketId]: "" }));
                                      setTicketFileDraftById((p) => ({ ...p, [ticketId]: [] }));
                                    }}
                                  >
                                    Clear
                                  </Button>
                                  <Button
                                    size="sm"
                                    disabled={!ticketId || savingComment || (!cleanText(draft) && !cleanText(linkDraft) && fileDraft.length === 0)}
                                    onClick={() => {
                                      if (!ticketId) return;
                                      completeTicketWithComment(ticketId, draft);
                                    }}
                                  >
                                    {savingComment ? "Saving..." : "Done"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                        );
                      })}

                    {safeEmployeeTickets.filter((t) => {
                      const q = ticketSearch.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        String(t.id).toLowerCase().includes(q) ||
                        String(t.title || "").toLowerCase().includes(q) ||
                        String(t.description || "").toLowerCase().includes(q) ||
                        String(t.status || "").toLowerCase().includes(q)
                      );
                    }).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No tickets found</div>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Document</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={uploadDocument} className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label>Document Type</Label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                      >
                        <option value="ID Proof">ID Proof</option>
                        <option value="Address Proof">Address Proof</option>
                        <option value="Qualification Certificate">Qualification Certificate</option>
                        <option value="Experience Certificate">Experience Certificate</option>
                        <option value="Joining Document">Joining Document</option>
                        <option value="Resume">Resume</option>
                        <option value="Professional License">Professional License</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={docDescription}
                        onChange={(e) => setDocDescription(e.target.value)}
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label>File</Label>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                        className="mt-1"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submittingAction === "document"}
                      className="w-full"
                    >
                      {submittingAction === "document" ? "Uploading..." : "Upload Document"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Submitted Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {safeDocuments.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No documents submitted yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {safeDocuments.map((doc) => (
                        <Link key={doc.id} href={`/employee/documents/${doc.id}`} className="block">
                          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{doc.title}</p>
                                {doc.description && (
                                  <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">Type: {doc.document_type}</p>
                                {doc.status === "rejected" && doc.rejection_reason && (
                                  <p className="text-xs text-red-600 mt-2">{doc.rejection_reason}</p>
                                )}
                              </div>
                              <Badge
                                className={`${
                                  doc.status === "verified"
                                    ? "bg-green-500"
                                    : doc.status === "rejected"
                                      ? "bg-red-500"
                                      : "bg-yellow-500"
                                }`}
                              >
                                {doc.status}
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Private Project Details</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    disabled={!employee || !privateProjectData || workLoading}
                    onClick={() => {
                      if (!employee || !privateProjectData) return;
                      void loadWorkPlanForProject(String(privateProjectData.id), employee);
                    }}
                  >
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  {!employee ? (
                    <div className="text-center py-8 text-gray-500">No private project plan available.</div>
                  ) : workLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading private project plan...</div>
                  ) : !privateProjectData ? (
                    <div className="text-center py-8 text-gray-500">
                      {workPlanFetchError === "403"
                        ? "You are not assigned to this project."
                        : workPlanFetchError
                        ? `Failed to load project (HTTP ${workPlanFetchError}).`
                        : "No project assigned yet."}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xl font-semibold truncate">
                            {privateProjectData.project_name || privateProjectData.title}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {myAssignment?.start_date || privateProjectData.start_date || "-"} →{" "}
                            {myAssignment?.end_date || privateProjectData.end_date || "-"}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {myAssignment?.status || "assigned"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="border rounded-lg p-4">
                          <div className="text-sm font-semibold text-gray-800">Project Status</div>
                          <div className="text-sm text-gray-700 mt-1">
                            {privateProjectData.status || "-"}
                          </div>
                        </div>
                        <div className="border rounded-lg p-4">
                          <div className="text-sm font-semibold text-gray-800">Timeline</div>
                          <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                            {privateProjectData.timeline || "-"}
                          </div>
                        </div>
                      </div>

                      {(privateProjectData.shortDescription || privateProjectData.description) && (
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <div className="text-sm font-semibold text-gray-800 mb-2">Project Description</div>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {privateProjectData.shortDescription || privateProjectData.description || "-"}
                          </div>
                        </div>
                      )}

                      {myAssignment ? (
                        <>
                          <div className="border rounded-lg p-4 bg-gray-50">
                            <div className="text-sm font-semibold text-gray-800 mb-2">Assigned Work</div>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                              {myAssignment.work || "-"}
                            </div>
                          </div>

                          <div className="border rounded-lg p-4">
                            <div className="text-sm font-semibold text-gray-800 mb-2">Admin Review Comment</div>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                              {myAssignment.admin_comment || "-"}
                            </div>
                          </div>

                          <div className="border rounded-lg p-4">
                            <div className="text-sm font-semibold text-gray-800 mb-2">Post Daily Update</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <Label>Date</Label>
                                <Input
                                  type="date"
                                  value={dailyUpdateDate}
                                  onChange={(e) => setDailyUpdateDate(e.target.value)}
                                  className="mt-1"
                                  disabled={dailyUpdateSaving}
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Label>Update</Label>
                                <Textarea
                                  value={dailyUpdateDraft}
                                  onChange={(e) => setDailyUpdateDraft(e.target.value)}
                                  className="mt-1"
                                  rows={3}
                                  placeholder="What did you do today? blockers? next steps?"
                                  disabled={dailyUpdateSaving}
                                />
                              </div>
                            </div>
                            <Button
                              onClick={postDailyUpdate}
                              disabled={!myAssignment || dailyUpdateSaving || !dailyUpdateDraft.trim()}
                              className="w-full mt-3"
                            >
                              {dailyUpdateSaving ? "Posting..." : "Post Update"}
                            </Button>
                          </div>

                          {myAssignment.daily_updates && myAssignment.daily_updates.length > 0 ? (
                            <div className="border rounded-lg p-4">
                              <div className="text-sm font-semibold text-gray-800 mb-2">Recent Updates</div>
                              <div className="space-y-2">
                                {myAssignment.daily_updates.slice(0, 5).map((u, idx) => (
                                  <div key={`${u?.created_at || idx}`} className="border rounded-lg p-3">
                                    <div className="text-xs text-gray-500">
                                      {u.date || "-"} •{" "}
                                      {u.created_at ? new Date(u.created_at).toLocaleString() : "-"}
                                    </div>
                                    <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                                      {u.text || "-"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <div className="text-sm text-gray-600">No assignment found for you yet.</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right column – optional, kept for symmetry */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {privateProjectData ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Project ID</p>
                        <p className="text-sm font-mono">{privateProjectData.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Team Members</p>
                        <p className="text-sm">{(privateProjectData.plan?.assignments?.length || 0)} assigned</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No project loaded.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Leave Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">Total Leaves Available</span>
                      <span className="font-bold text-lg">20</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">Approved Leaves</span>
                      <span className="font-bold text-lg text-green-600">
                        {stats.total_leaves_taken}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">Pending Requests</span>
                      <span className="font-bold text-lg text-yellow-600">
                        {leaveRequests.filter((l) => l.status === "pending").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Leaves Balance</span>
                      <span className="font-bold text-lg text-blue-600">
                        {stats.leaves_remaining}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overtime Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">Total Requests</span>
                      <span className="font-bold text-lg">{overtimeRequests.length}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">Approved Hours</span>
                      <span className="font-bold text-lg text-green-600">
                        {stats.approved_overtime_hours}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">Pending Hours</span>
                      <span className="font-bold text-lg text-yellow-600">
                        {overtimeRequests
                          .filter((o) => o.status === "pending")
                          .reduce((sum, o) => sum + (parseInt(String(o.hours)) || 0), 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Rejected</span>
                      <span className="font-bold text-lg text-red-600">
                        {overtimeRequests.filter((o) => o.status === "rejected").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
