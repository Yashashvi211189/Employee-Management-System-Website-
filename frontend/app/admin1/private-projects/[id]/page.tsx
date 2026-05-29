"use client";

import { API_URL } from "@/lib/config";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Save, Trash2, Users } from "lucide-react";

const cleanText = (value: unknown) => {
  if (typeof value === "string") return value.trim().replace(/^`+|`+$/g, "").trim();
  if (typeof value === "number") return String(value);
  return "";
};

const resolveId = (value: any) => {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    const v = value?.id ?? value?.pk ?? value?.project_id;
    return v == null ? "" : String(v);
  }
  return "";
};

const getCurrentProjectIdFromEmployee = (emp: any) =>
  resolveId(emp?.current_project_id ?? emp?.current_project?.id ?? emp?.current_project);

const normalizeDailyUpdates = (assignment: any) => {
  const raw =
    assignment?.daily_updates ??
    assignment?.dailyUpdates ??
    assignment?.daily_update ??
    assignment?.updates ??
    assignment?.daily_updates_list ??
    assignment?.dailyUpdatesList;
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const candidates = [raw.results, raw.data, raw.items, raw.list];
    for (const c of candidates) {
      if (Array.isArray(c)) return c;
    }
  }
  return [];
};

type Employee = {
  id: string | number;
  employee_id?: string;
  name?: string;
  designation?: string;
  current_project?: any;
  current_project_id?: any;
};

type WorkAssignment = {
  id?: string | number;
  employee: string;
  employee_id?: string;
  name?: string;
  designation?: string;
  start_date?: string;
  end_date?: string;
  work?: string;
  status?: string;
  admin_comment?: string;
  employee_comment?: string;
  daily_updates?: any[];
};

export default function AdminPrivateProjectPlanPage() {
  const params = useParams();
  const router = useRouter();
  const auth = useAuth();

  const projectId = useMemo(() => {
    const raw = (params as any)?.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectMeta, setProjectMeta] = useState<any | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [savedPlan, setSavedPlan] = useState<any | null>(null);

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("planned");
  const [timeline, setTimeline] = useState("");
  const [details, setDetails] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [assignments, setAssignments] = useState<WorkAssignment[]>([]);
  const [ticketAssignments, setTicketAssignments] = useState<any[]>([]);

  const employeesAssignedToThisProject = useMemo(() => {
    const pid = cleanText(projectId);
    if (!pid) return [];
    return employees.filter((e) => getCurrentProjectIdFromEmployee(e) === pid);
  }, [employees, projectId]);

  const assignedByProject = useMemo(() => {
    const map = new Map<string, Employee>();
    employeesAssignedToThisProject.forEach((e) => map.set(String(e.id), e));
    return { assignedByProject: map };
  }, [employeesAssignedToThisProject]);

  const loadData = useCallback(async () => {
    const pid = cleanText(projectId);
    if (!pid) return;
    setLoading(true);
    try {
      const [empRes, planRes] = await Promise.all([
        auth.authFetch(`${API_URL}/api/employees/`, { method: "GET" }).catch(() => null),
        auth.authFetch(`${API_URL}/api/private-projects/${encodeURIComponent(pid)}/`, { method: "GET" }).catch(() => null),
      ]);

      if (empRes?.ok) {
        const raw = await empRes.json().catch(() => null);
        const list = Array.isArray(raw) ? raw : raw?.results || [];
        setEmployees(Array.isArray(list) ? list : []);
      }

      if (planRes?.ok) {
        const raw = await planRes.json().catch(() => null);
        setProjectMeta(raw);

        const planObj = raw && typeof raw === "object" && raw.plan && typeof raw.plan === "object" ? raw.plan : raw;
        const projectObj = raw && typeof raw === "object" && raw.project && typeof raw.project === "object" ? raw.project : raw;

        setTitle(
          cleanText(planObj?.project_name) ||
            cleanText(projectObj?.title) ||
            cleanText(projectObj?.name) ||
            ""
        );
        setStatus(cleanText(planObj?.status) || cleanText(projectObj?.status) || "planned");
        setTimeline(cleanText(planObj?.timeline) || cleanText(projectObj?.timeline) || "");
        setDetails(
          cleanText(planObj?.project_description) ||
            cleanText(projectObj?.details) ||
            cleanText(projectObj?.description) ||
            ""
        );
        setStartDate(cleanText(planObj?.start_date) || "");
        setEndDate(cleanText(planObj?.end_date) || "");

        const list = Array.isArray(planObj?.assignments)
          ? planObj.assignments
          : Array.isArray(planObj?.employees)
            ? planObj.employees
            : [];
        const normalized = (Array.isArray(list) ? list : []).map((a: any) => ({
          ...a,
          employee: String(a?.employee ?? ""),
          daily_updates: normalizeDailyUpdates(a),
        }));
        setAssignments(normalized);
        setTicketAssignments(Array.isArray(planObj?.ticket_assignments) ? planObj.ticket_assignments : []);
        setSavedPlan(raw);
      } else {
        setProjectMeta(null);
        setSavedPlan(null);
      }
    } finally {
      setLoading(false);
    }
  }, [auth, projectId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const savePlanToStorageAndNotify = useCallback(
    (pid: string, planLike: any) => {
      try {
        const key = "nilaya_current_project_plan_v1";
        const raw = window.localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : {};
        parsed[String(pid)] = planLike;
        window.localStorage.setItem(key, JSON.stringify(parsed));
      } catch {}
      window.dispatchEvent(new CustomEvent("nilaya-current-project-plan-updated", { detail: { projectId: String(pid) } }));
    },
    []
  );

  const savePlan = useCallback(async () => {
    const pid = cleanText(projectId);
    if (!pid) return;
    setSaving(true);
    try {
      const normalizedAssignments = assignments.map((a) => ({
        ...a,
        employee: String(a.employee),
        start_date: a.start_date || undefined,
        end_date: a.end_date || undefined,
        work: (a.work || "").trim(),
        admin_comment: (a.admin_comment || "").trim(),
      }));

      const payload = {
        id: pid,
        project_id: pid,
        status: status || "planned",
        timeline: timeline.trim(),
        project_name: title.trim(),
        project_description: details.trim(),
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        employees: normalizedAssignments,
        assignments: normalizedAssignments,
        ticket_assignments: ticketAssignments,
      };

      const updateUrls = [`${API_URL}/api/private-projects/${encodeURIComponent(pid)}/`];
      const createUrls = [`${API_URL}/api/private-projects/`];
      let ok = false;
      let result: any = null;

      for (const url of updateUrls) {
        for (const method of ["PATCH", "PUT"]) {
          const res = await auth.authFetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) continue;
          ok = true;
          result = await res.json().catch(() => null);
          break;
        }
        if (ok) break;
      }

      if (!ok) {
        for (const url of createUrls) {
          const res = await auth.authFetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) continue;
          ok = true;
          result = await res.json().catch(() => null);
          break;
        }
      }

      const saved = result && typeof result === "object" ? result : payload;
      setSavedPlan(saved);
      savePlanToStorageAndNotify(pid, saved?.plan && typeof saved.plan === "object" ? saved.plan : saved);
      alert(ok ? "Private project plan saved" : "Failed to save private project plan");
    } catch {
      alert("Failed to save private project plan");
    } finally {
      setSaving(false);
    }
  }, [
    assignments,
    auth,
    details,
    endDate,
    projectId,
    savePlanToStorageAndNotify,
    startDate,
    status,
    ticketAssignments,
    timeline,
    title,
  ]);

  const addEmployeeAssignment = useCallback(() => {
    const eid = selectedEmployeeId.trim();
    if (!eid) return;
    if (assignments.some((a) => String(a.employee) === eid)) return;
    const emp = employees.find((e) => String(e.id) === eid) || assignedByProject.assignedByProject.get(eid) || null;
    setAssignments((prev) => [
      ...prev,
      {
        employee: eid,
        employee_id: cleanText(emp?.employee_id),
        name: cleanText(emp?.name),
        designation: cleanText(emp?.designation),
        start_date: "",
        end_date: "",
        work: "",
        status: "assigned",
        admin_comment: "",
        employee_comment: "",
        daily_updates: [],
      },
    ]);
    setSelectedEmployeeId("");
  }, [assignedByProject.assignedByProject, assignments, employees, selectedEmployeeId]);

  if (!cleanText(projectId)) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16 md:pt-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white hover:text-blue-700"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold">Private Project Plan</h2>
                <div className="text-blue-100 text-sm font-mono">{cleanText(projectId)}</div>
              </div>
            </div>
            <Button
              onClick={savePlan}
              disabled={loading || saving}
              className="bg-white text-blue-700 hover:bg-blue-50"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card className="bg-white border-gray-100 shadow-md">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold text-gray-700">Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label className="text-xs">Project Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-9 text-sm mt-1"
                  placeholder={cleanText(projectMeta?.title) || "Title"}
                  disabled={loading}
                />
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <select
                  value={status || "planned"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  disabled={loading}
                >
                  <option value="planned">planned</option>
                  <option value="ongoing">ongoing</option>
                  <option value="completed">completed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 text-sm mt-1"
                  disabled={loading}
                />
              </div>
              <div>
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 text-sm mt-1"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Timeline</Label>
              <Textarea
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="text-sm mt-1"
                rows={4}
                placeholder="Define timeline (milestones, dates, phases)"
                disabled={loading}
              />
            </div>

            <div>
              <Label className="text-xs">Instructions / Work Plan</Label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="text-sm mt-1"
                rows={8}
                placeholder="Write work instructions, scope, deliverables, monitoring rules"
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-md">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Work Assignments ({assignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div className="md:col-span-3">
                <Label className="text-xs">Add Employee</Label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  disabled={loading}
                >
                  <option value="">Select employee</option>
                  {employees.map((e) => (
                    <option key={String(e.id)} value={String(e.id)}>
                      {cleanText(e.name) || "-"} ({cleanText(e.employee_id) || String(e.id)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <Button onClick={addEmployeeAssignment} disabled={!selectedEmployeeId || loading} className="h-9 w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {assignments.length === 0 ? (
              <div className="text-sm text-gray-600">No assignments yet. Add employees to assign work.</div>
            ) : (
              <div className="space-y-3">
                {assignments.map((a, idx) => {
                  const emp = employees.find((e) => String(e.id) === String(a.employee)) || null;
                  const name = cleanText(a.name) || cleanText(emp?.name) || "-";
                  const code = cleanText(a.employee_id) || cleanText(emp?.employee_id) || String(a.employee);
                  const desg = cleanText(a.designation) || cleanText(emp?.designation) || "-";
                  const updatesCount = normalizeDailyUpdates(a).length;
                  return (
                    <div key={`${a.employee}_${idx}`} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">{name}</div>
                          <div className="text-xs text-gray-500 font-mono truncate">{code}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <Badge variant="outline" className="text-xs">
                            {desg}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Updates {updatesCount}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setAssignments((prev) => prev.filter((_, i) => i !== idx))}
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs">Start Date</Label>
                          <Input
                            type="date"
                            value={a.start_date || ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              setAssignments((prev) => prev.map((x, i) => (i === idx ? { ...x, start_date: v } : x)));
                            }}
                            className="h-9 text-sm mt-1"
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">End Date</Label>
                          <Input
                            type="date"
                            value={a.end_date || ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              setAssignments((prev) => prev.map((x, i) => (i === idx ? { ...x, end_date: v } : x)));
                            }}
                            className="h-9 text-sm mt-1"
                            disabled={loading}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-xs">Status</Label>
                          <select
                            value={a.status || "assigned"}
                            onChange={(e) => {
                              const v = e.target.value;
                              setAssignments((prev) => prev.map((x, i) => (i === idx ? { ...x, status: v } : x)));
                            }}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                            disabled={loading}
                          >
                            <option value="assigned">assigned</option>
                            <option value="in_progress">in_progress</option>
                            <option value="review">review</option>
                            <option value="completed">completed</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Assigned Work</Label>
                        <Textarea
                          value={a.work || ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setAssignments((prev) => prev.map((x, i) => (i === idx ? { ...x, work: v } : x)));
                          }}
                          className="text-sm mt-1"
                          rows={4}
                          placeholder="Describe tasks and deliverables for this employee"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Admin Review Comment</Label>
                        <Textarea
                          value={a.admin_comment || ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setAssignments((prev) => prev.map((x, i) => (i === idx ? { ...x, admin_comment: v } : x)));
                          }}
                          className="text-sm mt-1"
                          rows={3}
                          placeholder="Feedback, review notes, requested changes"
                          disabled={loading}
                        />
                      </div>

                      {a.employee_comment ? (
                        <div className="text-sm text-gray-700 bg-gray-50 border rounded-lg p-3">
                          <div className="text-xs font-semibold text-gray-500">Employee Comment</div>
                          <div className="mt-1 whitespace-pre-wrap">{a.employee_comment}</div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
