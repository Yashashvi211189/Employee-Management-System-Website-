"use client";

import { API_URL } from "@/lib/config";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Activity, ChartColumn, ExternalLink, Save, Search, X } from "lucide-react";

const cleanText = (value: unknown) => {
  if (typeof value === "string") return value.trim().replace(/^`+|`+$/g, "").trim();
  if (typeof value === "number") return String(value);
  return "";
};

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

const getAssignmentsFromPlanLike = (planLike: any) => {
  const a = Array.isArray(planLike?.assignments) ? planLike.assignments : [];
  const e = Array.isArray(planLike?.employees) ? planLike.employees : [];
  const list = a.length ? a : e;
  return list.map((x: any) => ({
    ...x,
    id: x?.id ?? x?.assignment_id ?? x?.assignmentId,
    daily_updates: normalizeDailyUpdates(x),
  }));
};

export default function AdminPrivateProjectsMonitoringPage() {
  const router = useRouter();
  const auth = useAuth();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [planByProjectId, setPlanByProjectId] = useState<Record<string, any>>({});
  const [employeeNameById, setEmployeeNameById] = useState<Record<string, string>>({});
  const [employeeNameByCode, setEmployeeNameByCode] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [statsProjectId, setStatsProjectId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const [projectsRes, employeesRes] = await Promise.all([
          auth.authFetch(`${API_URL}/api/private-projects/`, { method: "GET" }).catch(() => null),
          auth.authFetch(`${API_URL}/api/employees/`, { method: "GET" }).catch(() => null),
        ]);

        let list: any[] = [];
        if (projectsRes?.ok) {
          const raw = await projectsRes.json().catch(() => null);
          const arr = Array.isArray(raw) ? raw : raw?.results || [];
          list = Array.isArray(arr) ? arr : [];
        }

        if (employeesRes?.ok) {
          const raw = await employeesRes.json().catch(() => null);
          const arr = Array.isArray(raw) ? raw : raw?.results || [];
          const mapById: Record<string, string> = {};
          const mapByCode: Record<string, string> = {};
          (Array.isArray(arr) ? arr : []).forEach((e: any) => {
            const id = cleanText(String(e?.id ?? ""));
            const code = cleanText(String(e?.employee_id ?? ""));
            const name = cleanText(e?.name);
            if (id && name) mapById[id] = name;
            if (code && name) mapByCode[code] = name;
          });
          if (!cancelled) {
            setEmployeeNameById(mapById);
            setEmployeeNameByCode(mapByCode);
          }
        }

        const details = await Promise.all(
          list.map(async (p) => {
            const pid = cleanText(p?.id);
            if (!pid) return null;
            const res = await auth.authFetch(`${API_URL}/api/private-projects/${encodeURIComponent(pid)}/`, { method: "GET" }).catch(() => null);
            if (!res?.ok) return { id: pid, plan: null };
            const raw = await res.json().catch(() => null);
            return { id: pid, plan: raw };
          })
        );

        const byId: Record<string, any> = {};
        details.forEach((d: any) => {
          if (!d?.id) return;
          const raw = d.plan;
          const planObj = raw && typeof raw === "object" && raw.plan && typeof raw.plan === "object" ? raw.plan : raw;
          const assignments = getAssignmentsFromPlanLike(planObj);
          byId[String(d.id)] = { ...(planObj || {}), employees: assignments, assignments };
        });

        if (cancelled) return;
        setProjects(list);
        setPlanByProjectId(byId);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [auth]);

  const resolveEmployeeName = useMemo(() => {
    return (a: any) => {
      const direct = cleanText(a?.name);
      if (direct) return direct;
      const id = cleanText(String(a?.employee ?? ""));
      const code = cleanText(String(a?.employee_id ?? ""));
      return employeeNameById[id] || employeeNameByCode[code] || code || id || "-";
    };
  }, [employeeNameByCode, employeeNameById]);

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => {
      const pid = String(p.id);
      const plan = planByProjectId[pid];
      const lines = getAssignmentsFromPlanLike(plan).map((a: any) => {
        return `${resolveEmployeeName(a)} ${cleanText(a?.employee_id)} ${cleanText(a?.work)} ${cleanText(a?.status)}`;
      });
      return (
        pid.toLowerCase().includes(q) ||
        cleanText(p.title).toLowerCase().includes(q) ||
        cleanText(p.status).toLowerCase().includes(q) ||
        lines.join(" ").toLowerCase().includes(q)
      );
    });
  }, [planByProjectId, projects, resolveEmployeeName, search]);

  const statsModalData = useMemo(() => {
    if (!statsProjectId) return null;
    const project = projects.find((p) => String(p.id) === String(statsProjectId)) || null;
    const plan = project ? planByProjectId[String(project.id)] : null;
    if (!project) return null;
    const assignments = getAssignmentsFromPlanLike(plan);
    const employeeStats = assignments.map((a: any, idx: number) => {
      const updatesCount = Array.isArray(a.daily_updates) ? a.daily_updates.length : 0;
      const status = cleanText(a.status) || "assigned";
      const completion =
        status === "completed"
          ? 100
          : status === "review"
            ? 80
            : status === "in_progress"
              ? Math.min(70, 20 * updatesCount + 20)
              : Math.min(30, 10 * updatesCount);
      return {
        key: `${statsProjectId}_${a.employee}_${idx}`,
        name: resolveEmployeeName(a),
        employeeId: cleanText(a.employee_id),
        status,
        updatesCount,
        completion,
        start: cleanText(a.start_date) || "-",
        end: cleanText(a.end_date) || "-",
        work: cleanText(a.work) || "-",
      };
    });
    const overallCompletion =
      employeeStats.length > 0
        ? Math.round(employeeStats.reduce((sum: number, x: any) => sum + x.completion, 0) / employeeStats.length)
        : 0;
    return {
      id: String(project.id),
      title: cleanText(plan?.project_name) || cleanText(project.title) || `Project ${project.id}`,
      overallCompletion,
      employeeStats,
    };
  }, [planByProjectId, projects, resolveEmployeeName, statsProjectId]);

  const updateAdminRemark = (projectId: string, assignmentIndex: number, text: string) => {
    setPlanByProjectId((prev) => {
      const plan = prev[projectId];
      if (!plan) return prev;
      const current = getAssignmentsFromPlanLike(plan);
      const updated = current.map((a: any, idx: number) => (idx === assignmentIndex ? { ...a, admin_comment: text } : a));
      return { ...prev, [projectId]: { ...plan, employees: updated, assignments: updated } };
    });
  };

  const saveRemark = async (projectId: string) => {
    const plan = planByProjectId[projectId];
    if (!plan) return;
    const payload = { ...plan, employees: getAssignmentsFromPlanLike(plan), assignments: getAssignmentsFromPlanLike(plan) };
    setSavingKey(projectId);
    try {
      for (const method of ["PATCH", "PUT"]) {
        const res = await auth.authFetch(`${API_URL}/api/private-projects/${encodeURIComponent(projectId)}/`, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          alert("Remark saved");
          return;
        }
      }
      alert("Failed to save remark");
    } catch {
      alert("Failed to save remark");
    } finally {
      setSavingKey(null);
    }
  };

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
                <h2 className="text-2xl font-bold">Work Monitoring</h2>
                <p className="text-blue-100 text-sm">Running projects, team work, remarks and replies</p>
              </div>
            </div>
            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => router.push("/admin1/private-projects/new")}
            >
              <Activity className="w-4 h-4 mr-2" />
              New Private Project
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card className="bg-white border-gray-100 shadow-md">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by project, employee, work, status..."
                className="h-9 text-sm pl-9 border-gray-200"
              />
              {search ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearch("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card className="bg-white border-gray-100 shadow-md">
            <CardContent className="py-10 text-sm text-gray-600">Loading monitoring data...</CardContent>
          </Card>
        ) : filteredProjects.length === 0 ? (
          <Card className="bg-white border-gray-100 shadow-md">
            <CardContent className="py-10 text-sm text-gray-600">No projects found.</CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((p) => {
              const pid = String(p.id);
              const plan = planByProjectId[pid];
              const assignments = getAssignmentsFromPlanLike(plan);
              return (
                <Card key={pid} className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-semibold text-gray-800 truncate">
                          {cleanText(plan?.project_name) || cleanText(p.title) || `Project ${pid}`}
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-1">
                          Start: {cleanText(plan?.start_date) || "-"} • End: {cleanText(plan?.end_date) || "-"} • Team:{" "}
                          {assignments.length}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {cleanText(p.status) || "active"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => setStatsProjectId(pid)}
                        >
                          <ChartColumn className="w-3 h-3 mr-1" />
                          Employee Stats
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => router.push(`/admin1/private-projects/${encodeURIComponent(pid)}`)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {assignments.length === 0 ? (
                      <div className="text-sm text-gray-600">No employee work assigned yet.</div>
                    ) : (
                      <div className="space-y-3">
                        {assignments.map((a: any, idx: number) => {
                          const name = resolveEmployeeName(a);
                          const code = cleanText(a.employee_id);
                          const updates = Array.isArray(a.daily_updates) ? a.daily_updates : [];
                          return (
                            <div key={`${pid}_${a.employee}_${idx}`} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-semibold truncate">{name}</div>
                                    {code && code !== name ? (
                                      <Badge variant="secondary" className="text-xs font-mono">
                                        {code}
                                      </Badge>
                                    ) : null}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {cleanText(a.start_date) || "-"} → {cleanText(a.end_date) || "-"}
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {cleanText(a.status) || "assigned"}
                                </Badge>
                              </div>

                              <div className="text-sm text-gray-700 whitespace-pre-wrap">{cleanText(a.work) || "-"}</div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <div className="text-xs font-semibold text-gray-600 mb-1">Admin Remark</div>
                                  <Textarea
                                    value={cleanText(a.admin_comment)}
                                    onChange={(e) => updateAdminRemark(pid, idx, e.target.value)}
                                    rows={3}
                                    className="text-sm"
                                    placeholder="Add review remark for this employee"
                                  />
                                  <Button
                                    size="sm"
                                    className="h-8 text-xs mt-2"
                                    disabled={savingKey === pid}
                                    onClick={() => void saveRemark(pid)}
                                  >
                                    <Save className="w-3 h-3 mr-1" />
                                    Save Remark
                                  </Button>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-gray-600 mb-1">Employee Reply</div>
                                  <div className="border rounded-lg p-3 bg-gray-50 text-sm text-gray-700 whitespace-pre-wrap min-h-[92px]">
                                    {cleanText(a.employee_comment) || "-"}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div className="text-xs font-semibold text-gray-600 mb-1">Daily Updates</div>
                                {updates.length > 0 ? (
                                  <div className="space-y-2">
                                    {updates.slice(0, 5).map((u: any, uidx: number) => (
                                      <div key={`${pid}_${idx}_${uidx}`} className="border rounded-lg p-3">
                                        <div className="text-xs text-gray-500">
                                          {cleanText(u?.date) || "-"} •{" "}
                                          {u?.created_at ? new Date(u.created_at).toLocaleString() : "-"}
                                        </div>
                                        <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                                          {cleanText(u?.text) || "-"}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500">No updates yet.</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {statsModalData ? (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[88vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Employee Work Stats</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {statsModalData.title} • Completion {statsModalData.overallCompletion}%
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setStatsProjectId(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-3">
                {statsModalData.employeeStats.length === 0 ? (
                  <div className="text-sm text-gray-600">No employees assigned for this project.</div>
                ) : (
                  statsModalData.employeeStats.map((s: any) => (
                    <div key={s.key} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold text-gray-900 truncate">{s.name}</div>
                            {s.employeeId && s.employeeId !== s.name ? (
                              <Badge variant="secondary" className="text-xs font-mono">
                                {s.employeeId}
                              </Badge>
                            ) : null}
                          </div>
                          <div className="text-xs text-gray-500">
                            {s.start} → {s.end}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {s.status}
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Work Completion</span>
                          <span>{s.completion}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-2 bg-gradient-to-r from-primary to-blue-600" style={{ width: `${s.completion}%` }} />
                        </div>
                        <div className="text-xs text-gray-600">Daily Updates: {s.updatesCount}</div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap border rounded-lg p-3 bg-gray-50">
                          {s.work}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
