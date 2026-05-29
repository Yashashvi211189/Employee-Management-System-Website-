"use client";

import { API_URL } from "@/lib/config";
import useAuth from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Activity,
  ArrowLeft,
  CheckCircle,
  Database,
  ExternalLink,
  FileJson,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type CheckState = "idle" | "checking" | "ok" | "warn" | "error";

type EndpointCheck = {
  key: string;
  label: string;
  path: string;
  secure?: boolean;
  state: CheckState;
  status?: number;
  detail?: string;
  sample?: string;
};

const initialChecks: EndpointCheck[] = [
  { key: "docs", label: "API Docs", path: "/api/docs/" },
  { key: "schema", label: "OpenAPI Schema", path: "/api/schema/" },
  { key: "django-admin", label: "Django Admin", path: "/admin/" },
  { key: "admin-dashboard", label: "Admin Dashboard API", path: "/api/admin/dashboard/", secure: true },
  { key: "employees", label: "Employee API", path: "/api/employees/", secure: true },
  { key: "employee-me", label: "Employee Profile API", path: "/api/employee/me/", secure: true },
  { key: "leave", label: "Leave Requests", path: "/api/leave-requests/", secure: true },
  { key: "overtime", label: "Overtime Requests", path: "/api/overtime-requests/", secure: true },
  { key: "documents", label: "Employee Documents", path: "/api/employee-documents/", secure: true },
  { key: "tickets", label: "Employee Tickets", path: "/api/employee-tickets/", secure: true },
];

const endpointGroups = [
  {
    label: "Employee Operations",
    paths: [
      "/api/employees/",
      "/api/employees/{id}/",
      "/api/employees/{id}/set-password/",
      "/api/employee/me/",
      "/api/employee/login/",
      "/api/employee/onboarding/request/",
      "/api/employee/onboarding/verify/",
      "/api/employee/onboarding/set-password/",
    ],
  },
  {
    label: "Requests & Documents",
    paths: [
      "/api/leave-balance/",
      "/api/leave-requests/",
      "/api/overtime-requests/",
      "/api/employee-documents/",
      "/api/employees/{id}/documents/{doc_id}/",
    ],
  },
  {
    label: "Tickets & Work",
    paths: [
      "/api/employee-tickets/",
      "/api/employee-tickets/stats/",
      "/api/employee-tickets/bulk-assign/",
      "/api/employee-tickets/{id}/comments/",
      "/api/private-projects/",
      "/api/private-projects/{id}/plan/",
      "/api/private-projects/{id}/plan/assignments/",
    ],
  },
  {
    label: "Website Content",
    paths: [
      "/api/team/",
      "/api/projects/",
      "/api/gallery/",
      "/api/products/",
      "/api/services/",
      "/api/gis-services/",
      "/api/testimonials/",
      "/api/blogs/",
      "/api/admin/blogs/",
    ],
  },
  {
    label: "Platform",
    paths: ["/api/admin/dashboard/", "/api/dashboard/summary/", "/api/token/", "/api/token/refresh/", "/admin/", "/api/docs/", "/api/schema/"],
  },
];

const asArray = (value: any) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const formatSample = (value: unknown) => {
  if (typeof value === "string") return value.replace(/\s+/g, " ").slice(0, 220);
  try {
    return JSON.stringify(value, null, 2).slice(0, 360);
  } catch {
    return "";
  }
};

export default function AdminApiCenterPage() {
  const router = useRouter();
  const auth = useAuth();
  const [checks, setChecks] = useState<EndpointCheck[]>(initialChecks);
  const [schemaPaths, setSchemaPaths] = useState<string[]>([]);
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [schemaError, setSchemaError] = useState("");
  const [search, setSearch] = useState("");
  const [lastChecked, setLastChecked] = useState("");

  useEffect(() => {
    if (auth.loading) return;
    const token = localStorage.getItem("access") || localStorage.getItem("access_token");
    if (!token) router.replace("/login");
  }, [auth.loading, router]);

  const runCheck = async (item: EndpointCheck) => {
    setChecks((prev) => prev.map((x) => (x.key === item.key ? { ...x, state: "checking", detail: "", sample: "" } : x)));

    try {
      const fetcher = item.secure ? auth.authFetch : fetch;
      const response = await fetcher(`${API_URL}${item.path}`, {
        method: "GET",
        headers: { Accept: "application/json, text/html;q=0.8, text/plain;q=0.7" },
      });

      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json") ? await response.json().catch(() => null) : await response.text().catch(() => "");
      const rows = asArray(payload);
      const sampleDetail = rows.length ? `${rows.length} records visible` : response.ok ? "Endpoint responded" : response.statusText;

      setChecks((prev) =>
        prev.map((x) =>
          x.key === item.key
            ? {
                ...x,
                status: response.status,
                state: response.ok ? "ok" : response.status === 401 || response.status === 403 ? "warn" : "error",
                detail: sampleDetail,
                sample: formatSample(rows[0] || payload),
              }
            : x,
        ),
      );
    } catch (error: any) {
      setChecks((prev) =>
        prev.map((x) =>
          x.key === item.key
            ? {
                ...x,
                state: "error",
                detail: error?.message || "Request failed",
              }
            : x,
        ),
      );
    }
  };

  const runAllChecks = async () => {
    for (const item of initialChecks) {
      await runCheck(item);
    }
    setLastChecked(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    let cancelled = false;

    const loadSchema = async () => {
      setSchemaLoading(true);
      setSchemaError("");
      try {
        const response = await fetch(`${API_URL}/api/schema/`, {
          headers: { Accept: "application/yaml, text/yaml, text/plain, application/json" },
        });
        const text = await response.text();
        const paths = Array.from(text.matchAll(/^\s{2}(\/[^:]+):/gm))
          .map((match) => match[1])
          .filter((path, index, arr) => path.startsWith("/api") && arr.indexOf(path) === index);

        if (!cancelled) setSchemaPaths(paths);
      } catch (error: any) {
        if (!cancelled) setSchemaError(error?.message || "Unable to load schema");
      } finally {
        if (!cancelled) setSchemaLoading(false);
      }
    };

    loadSchema();
    runAllChecks();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPaths = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return schemaPaths;
    return schemaPaths.filter((path) => path.toLowerCase().includes(term));
  }, [schemaPaths, search]);

  const availableFrontendGroups = endpointGroups.map((group) => ({
    ...group,
    availableCount: group.paths.filter((path) =>
      [
        "employees",
        "employee",
        "leave",
        "overtime",
        "document",
        "ticket",
        "private-project",
        "team",
        "projects",
        "gallery",
        "products",
        "services",
        "gis-services",
        "testimonials",
        "blogs",
        "admin/dashboard",
      ].some((keyword) => path.includes(keyword)),
    ).length,
  }));

  const healthyCount = checks.filter((item) => item.state === "ok").length;
  const warningCount = checks.filter((item) => item.state === "warn").length;
  const failingCount = checks.filter((item) => item.state === "error").length;

  const statusBadge = (item: EndpointCheck) => {
    if (item.state === "checking") return <Badge className="bg-blue-100 text-blue-700">Checking</Badge>;
    if (item.state === "ok") return <Badge className="bg-emerald-100 text-emerald-700">Online</Badge>;
    if (item.state === "warn") return <Badge className="bg-amber-100 text-amber-700">Protected</Badge>;
    if (item.state === "error") return <Badge className="bg-red-100 text-red-700">Issue</Badge>;
    return <Badge variant="outline">Idle</Badge>;
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Button variant="ghost" className="mb-3 h-9 px-2 text-slate-600" onClick={() => router.push("/admin1/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-normal text-slate-950">API Center</h1>
                <p className="text-sm text-slate-600">{API_URL}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => window.open(`${API_URL}/api/docs/`, "_blank", "noopener,noreferrer")}>
              <FileJson className="h-4 w-4" />
              API Docs
            </Button>
            <Button variant="outline" onClick={() => window.open(`${API_URL}/admin/`, "_blank", "noopener,noreferrer")}>
              <ShieldCheck className="h-4 w-4" />
              Django Admin
            </Button>
            <Button onClick={runAllChecks} className="bg-blue-600 text-white hover:bg-blue-700">
              <RefreshCw className="h-4 w-4" />
              Refresh Checks
            </Button>
          </div>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Healthy</p>
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{healthyCount}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Protected</p>
                <ShieldCheck className="h-4 w-4 text-amber-600" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{warningCount}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Issues</p>
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{failingCount}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Schema Paths</p>
                <Database className="h-4 w-4 text-blue-600" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{schemaPaths.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2 text-base text-slate-950">
                  <Activity className="h-4 w-4 text-blue-600" />
                  Live Backend Checks
                </CardTitle>
                {lastChecked && <p className="text-xs text-slate-500">Last checked {lastChecked}</p>}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {checks.map((item) => (
                  <div key={item.key} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-950">{item.label}</p>
                        {statusBadge(item)}
                        {item.status && <span className="text-xs text-slate-500">HTTP {item.status}</span>}
                      </div>
                      <p className="mt-1 font-mono text-xs text-slate-500">{item.path}</p>
                      {item.detail && <p className="mt-2 text-sm text-slate-600">{item.detail}</p>}
                      {item.sample && (
                        <pre className="mt-2 max-h-24 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">{item.sample}</pre>
                      )}
                    </div>
                    <div className="flex gap-2 md:justify-end">
                      <Button variant="outline" size="sm" onClick={() => runCheck(item)}>
                        <RefreshCw className="h-3.5 w-3.5" />
                        Check
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => window.open(`${API_URL}${item.path}`, "_blank", "noopener,noreferrer")}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-base text-slate-950">
                  <Users className="h-4 w-4 text-blue-600" />
                  Frontend Coverage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {availableFrontendGroups.map((group) => (
                  <div key={group.label} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-950">{group.label}</p>
                      <Badge className="bg-blue-100 text-blue-700">{group.availableCount}/{group.paths.length}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.paths.map((path) => (
                        <span key={path} className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-600">
                          {path}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-base text-slate-950">
                  <FileJson className="h-4 w-4 text-blue-600" />
                  OpenAPI Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search endpoints" className="pl-9" />
                </div>
                {schemaLoading ? (
                  <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600">Loading schema...</div>
                ) : schemaError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{schemaError}</div>
                ) : (
                  <div className="max-h-[520px] overflow-auto rounded-lg border border-slate-200">
                    {filteredPaths.map((path) => (
                      <div key={path} className="border-b border-slate-100 px-3 py-2 font-mono text-xs text-slate-700 last:border-b-0">
                        {path}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
