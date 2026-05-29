"use client";

import { API_URL } from "@/lib/config";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import {
  Calendar,
  Clock,
  User,
  FileText,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Share2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface LeaveRequest {
  id: string;
  leave_type: "sick" | "casual" | "earned" | "other";
  start_date: string;
  end_date: string;
  days_count?: number;
  total_days?: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
}

interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
}

export default function LeaveDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const leaveId = params.id as string;

  const [leave, setLeave] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);

  // Helper function to get auth header
  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem("access") || localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      throw new Error("No auth token");
    }
    return { Authorization: `JWT ${token}` };
  }, [router]);

  const calcInclusiveDays = useCallback((start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0;
    const diff = Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
    return diff > 0 ? diff : 0;
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const fetchLeaveData = async () => {
      try {
        // Fetch leave request details
        const leaveRes = await fetch(
          `${API_URL}/api/leave-requests/${leaveId}/`,
          { headers: getAuthHeader() }
        );

        if (!leaveRes.ok) {
          if (leaveRes.status === 404) {
            router.push("/employee/dashboard");
            return;
          }
          throw new Error("Failed to fetch leave");
        }

        const leaveData = await leaveRes.json();
        setLeave(leaveData);

        // Fetch leave balances
        const balRes = await fetch(`${API_URL}/api/leave-balance/`, {
          headers: getAuthHeader(),
        });
        if (balRes.ok) {
          const balances = await balRes.json();
          setLeaveBalances(balances);
        }
      } catch (error) {
        console.error("Error fetching leave:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveData();
  }, [authLoading, user, router, leaveId, getAuthHeader]);

  const handleCancel = async () => {
    if (!leave || leave.status !== "pending") return;

    if (
      !confirm(
        "Are you sure you want to cancel this leave request? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/leave-requests/${leaveId}/`, {
        method: "PATCH",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res.ok) {
        const updated = await res.json();
        setLeave(updated);
        alert("Leave request cancelled successfully");
      } else {
        alert("Failed to cancel leave request");
      }
    } catch (error) {
      console.error("Error cancelling leave:", error);
      alert("Error cancelling leave");
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading leave details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-red-600">Leave not found</p>
              <Button onClick={handleRetry} variant="outline" className="w-full mt-4">
                Retry
              </Button>
              <Button
                onClick={() => router.push("/employee/dashboard")}
                variant="outline"
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const leaveTypeLabel = {
    sick: "Sick Leave",
    casual: "Casual Leave",
    earned: "Earned Leave",
    other: "Other Leave",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/employee/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white hover:text-blue-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Leave Request Details</h1>
              <p className="text-blue-100">{leaveTypeLabel[leave.leave_type]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Status Alert */}
        <div
          className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            leave.status === "approved"
              ? "bg-green-50 border border-green-200"
              : leave.status === "rejected"
              ? "bg-red-50 border border-red-200"
              : "bg-yellow-50 border border-yellow-200"
          }`}
        >
          {leave.status === "approved" ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
          ) : leave.status === "rejected" ? (
            <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-semibold capitalize">
              Status: {leave.status === "pending" ? "Awaiting Approval" : leave.status}
            </p>
            {leave.rejection_reason && (
              <p className="text-sm mt-1">{leave.rejection_reason}</p>
            )}
          </div>
          <Badge
            className={`${
              leave.status === "approved"
                ? "bg-green-500"
                : leave.status === "rejected"
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
          >
            {leave.status}
          </Badge>
        </div>

        {/* Main Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Leave Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </p>
                <p className="text-2xl font-bold mt-2">
                  {new Date(leave.start_date).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  End Date
                </p>
                <p className="text-2xl font-bold mt-2">
                  {new Date(leave.end_date).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Total Days
                </p>
                <p className="text-2xl font-bold mt-2 text-blue-600">
                  {leave.total_days || leave.days_count || calcInclusiveDays(leave.start_date, leave.end_date) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reason */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Reason for Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{leave.reason}</p>
          </CardContent>
        </Card>

        {/* Leave Balance */}
        {leaveBalances.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Leave Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {leaveBalances.map((balance) => (
                  <div key={balance.type} className="border rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-600">{balance.type}</p>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Used</span>
                        <span className="font-bold text-red-600">{balance.used}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Remaining</span>
                        <span className="font-bold text-green-600">
                          {balance.remaining}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${
                              ((balance.total - balance.used) / balance.total) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Request Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="w-0.5 h-12 bg-gray-300 flex-1"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Request Submitted</p>
                  <p className="text-sm text-gray-500">
                    {new Date(leave.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {leave.status !== "pending" && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        leave.status === "approved"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                  </div>
                  <div>
                    <p className="font-medium capitalize text-gray-700">
                      {leave.status === "approved"
                        ? "Request Approved"
                        : "Request Rejected"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(leave.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {leave.status === "pending" && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Button
                  onClick={handleCancel}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Request
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/employee/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {leave.status !== "pending" && (
          <Card>
            <CardContent className="pt-6">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/employee/dashboard">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
