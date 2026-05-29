"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { API_URL } from "@/lib/config";
import useAuth from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const auth = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access") || localStorage.getItem("access_token");
    if (token) router.replace("/employee/dashboard");
  }, [router]);

  const safeJson = async (res: Response) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const getErrorMessage = (data: any, fallback: string) => {
    const payload = data?.error || data?.errors || data;
    if (typeof payload?.detail === "string") return payload.detail;
    if (Array.isArray(payload?.non_field_errors)) return payload.non_field_errors.join(", ");
    if (payload && typeof payload === "object") {
      const text = Object.values(payload).flat().filter(Boolean).join(", ");
      if (text) return text;
    }
    return fallback;
  };

  const extractTokens = (data: any) => {
    const candidates = [data, data?.tokens, data?.token, data?.data, data?.auth, data?.result].filter(Boolean);

    for (const candidate of candidates) {
      const access = candidate?.access || candidate?.access_token;
      const refresh = candidate?.refresh || candidate?.refresh_token;
      if (typeof access === "string" && access.trim()) {
        return {
          access: access.trim(),
          refresh: typeof refresh === "string" && refresh.trim() ? refresh.trim() : "",
        };
      }
    }

    return { access: "", refresh: "" };
  };

  const finishLogin = async (data: any) => {
    const { access, refresh } = extractTokens(data);
    if (!access) {
      setError(getErrorMessage(data, "Login did not return a usable session token."));
      return;
    }

    localStorage.setItem("access", access);
    localStorage.setItem("access_token", access);
    if (refresh) {
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("refresh_token", refresh);
    }
    await auth.login(access);
    router.push("/employee/dashboard");
  };

  const employeeLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/employee/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_id: loginId.trim(), password }),
      });
      const data = await safeJson(res);
      if (!res.ok || data?.success === false || Number(data?.original_status || 0) >= 400) {
        setError(getErrorMessage(data, "Login failed"));
        return;
      }

      await finishLogin(data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md rounded-3xl shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="flex items-center justify-center">
            <Image src="/brand/nilaya-icon.svg" width={56} height={56} alt="Nilaya AI" className="rounded-xl shadow" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Employee Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

          <form onSubmit={employeeLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                autoComplete="email"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => router.push("/login")} disabled={loading}>
              Back to Main Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
