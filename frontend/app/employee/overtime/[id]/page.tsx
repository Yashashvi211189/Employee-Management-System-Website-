"use client";

import { API_URL } from "@/lib/config";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import {
  Clock,
  DollarSign,
  FileText,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit2,
  Save,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

interface OvertimeRequest {
  id: string;
  date: string;
  hours: string | number;
  reason: string;
  work_description_1: string; // First text field (up to 500 words)
  work_description_2: string; // Second text field (up to 500 words)
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  extra_pay?: number;
  extra_pay_per_hour?: number;
  rejection_reason?: string;
}

export default function OvertimeDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const overtimeId = params.id as string;

  const [overtime, setOvertime] = useState<OvertimeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<OvertimeRequest>>({});
  const [submitting, setSubmitting] = useState(false);

  // Word count helper
  const countWords = (text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  // Helper function to get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/employee/login");
      throw new Error("No auth token");
    }
    return { Authorization: `JWT ${token}` };
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/employee/login");
      return;
    }

    const fetchOvertimeData = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/overtime-requests/${overtimeId}/`,
          { headers: getAuthHeader() }
        );

        if (!res.ok) {
          if (res.status === 404) {
            router.push("/employee/dashboard");
            return;
          }
          throw new Error("Failed to fetch overtime");
        }

        const data = await res.json();
        setOvertime(data);
        setEditData(data);
      } catch (error) {
        console.error("Error fetching overtime:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOvertimeData();
  }, [authLoading, user, router, overtimeId]);

  const handleSave = async () => {
    if (!overtime) return;

    // Validate word counts
    const words1 = countWords(editData.work_description_1 || "");
    const words2 = countWords(editData.work_description_2 || "");

    if (words1 > 500 || words2 > 500) {
      alert("Each description must not exceed 500 words");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_URL}/api/overtime-requests/${overtimeId}/`,
        {
          method: "PATCH",
          headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            work_description_1: editData.work_description_1,
            work_description_2: editData.work_description_2,
            reason: editData.reason,
          }),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        setOvertime(updated);
        setEditMode(false);
        alert("Overtime request updated successfully");
      } else {
        alert("Failed to save changes");
      }
    } catch (error) {
      console.error("Error saving overtime:", error);
      alert("Error saving changes");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!overtime || overtime.status !== "pending") return;

    if (
      !confirm(
        "Are you sure you want to cancel this overtime request? This action cannot be undone."
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_URL}/api/overtime-requests/${overtimeId}/`,
        {
          method: "PATCH",
          headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "cancelled" }),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        setOvertime(updated);
        alert("Overtime request cancelled successfully");
      } else {
        alert("Failed to cancel overtime request");
      }
    } catch (error) {
      console.error("Error cancelling overtime:", error);
      alert("Error cancelling overtime request");
    } finally {
      setSubmitting(false);
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
              <p className="text-gray-600">Loading overtime details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!overtime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-red-600">Overtime request not found</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/employee/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white hover:text-purple-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Overtime Request Details</h1>
              <p className="text-purple-100">Extra work compensation request</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Status Alert */}
        <div
          className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            overtime.status === "approved"
              ? "bg-green-50 border border-green-200"
              : overtime.status === "rejected"
              ? "bg-red-50 border border-red-200"
              : "bg-yellow-50 border border-yellow-200"
          }`}
        >
          {overtime.status === "approved" ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
          ) : overtime.status === "rejected" ? (
            <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-semibold capitalize">
              Status: {overtime.status === "pending" ? "Awaiting Approval" : overtime.status}
            </p>
            {overtime.rejection_reason && (
              <p className="text-sm mt-1">{overtime.rejection_reason}</p>
            )}
          </div>
          <Badge
            className={`${
              overtime.status === "approved"
                ? "bg-green-500"
                : overtime.status === "rejected"
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
          >
            {overtime.status}
          </Badge>
        </div>

        {/* Basic Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Overtime Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Date
                </p>
                <p className="text-xl font-bold mt-2">
                  {new Date(overtime.date).toLocaleDateString("en-US", {
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
                  Hours
                </p>
                <p className="text-xl font-bold mt-2 text-purple-600">
                  {overtime.hours} hrs
                </p>
              </div>
              {overtime.extra_pay && (
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Extra Pay
                  </p>
                  <p className="text-xl font-bold mt-2 text-green-600">
                    ₹{overtime.extra_pay}
                  </p>
                </div>
              )}
              {overtime.extra_pay_per_hour && (
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Per Hour
                  </p>
                  <p className="text-xl font-bold mt-2 text-green-600">
                    ₹{overtime.extra_pay_per_hour}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Work Description Fields */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Work Description & Extra Pay Justification</CardTitle>
            {overtime.status === "pending" && !editMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(true)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* First Description Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Work Completed / Work Description</Label>
                <span className="text-xs text-gray-500">
                  {countWords(editData.work_description_1 || "")} / 500 words
                </span>
              </div>
              {editMode ? (
                <Textarea
                  value={editData.work_description_1 || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      work_description_1: e.target.value,
                    })
                  }
                  placeholder="Describe the work you completed or are requesting overtime for. Be specific about tasks, deliverables, and why extra time was needed."
                  rows={5}
                  className="font-mono text-sm"
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-32">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {overtime.work_description_1 || "No description provided"}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Maximum 500 words
              </p>
            </div>

            {/* Second Description Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Additional Details / Justification for Extra Pay</Label>
                <span className="text-xs text-gray-500">
                  {countWords(editData.work_description_2 || "")} / 500 words
                </span>
              </div>
              {editMode ? (
                <Textarea
                  value={editData.work_description_2 || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      work_description_2: e.target.value,
                    })
                  }
                  placeholder="Provide additional context or justification for the extra pay. Include any project urgency, client deadlines, critical issues resolved, or performance metrics."
                  rows={5}
                  className="font-mono text-sm"
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-32">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {overtime.work_description_2 || "No description provided"}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Maximum 500 words
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reason */}
        {!editMode && overtime.reason && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Reason</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{overtime.reason}</p>
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
                    {new Date(overtime.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {overtime.status !== "pending" && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        overtime.status === "approved"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                  </div>
                  <div>
                    <p className="font-medium capitalize text-gray-700">
                      {overtime.status === "approved"
                        ? "Request Approved"
                        : "Request Rejected"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(overtime.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            {editMode ? (
              <div className="flex gap-4">
                <Button
                  onClick={handleSave}
                  disabled={submitting}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditMode(false);
                    setEditData(overtime);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-4">
                {overtime.status === "pending" && (
                  <Button
                    onClick={handleCancel}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Request
                  </Button>
                )}
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/employee/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
