// components/admin/EmployeeRequestsManager.tsx
"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  Search,
  Filter,
  Eye,
  Download,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

// Types
interface EmployeeLeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_avatar?: string;
  leave_type: "sick" | "casual" | "earned" | "other";
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  rejection_reason?: string;
}

interface EmployeeOvertimeRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_avatar?: string;
  date: string;
  hours: number | string;
  reason: string;
  work_description_1: string;
  work_description_2: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  rejection_reason?: string;
  extra_pay?: number;
}

interface EmployeeDocument {
  id: string;
  employee_id: string;
  employee_name: string;
  document_type: string;
  title: string;
  description: string;
  file: string;
  file_name: string;
  uploaded_at: string;
  status: "pending" | "verified" | "rejected";
  rejection_reason?: string;
}

interface Props {
  type: "leaves" | "overtime" | "documents";
  requests: any[];
  isLoading?: boolean;
  onApprove?: (id: string, extraData?: any) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
  onGetDetails?: (id: string) => Promise<void>;
}

export function LeaveRequestsManager({
  requests = [],
  isLoading = false,
  onApprove,
  onReject,
}: {
  requests: EmployeeLeaveRequest[];
  isLoading?: boolean;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const leaveTypeColor = {
    sick: "bg-red-100",
    casual: "bg-blue-100",
    earned: "bg-green-100",
    other: "bg-gray-100",
  };

  const leaveTypeLabel = {
    sick: "Sick Leave",
    casual: "Casual Leave",
    earned: "Earned Leave",
    other: "Other",
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    if (onReject) {
      await onReject(id, rejectReason);
      setRejectingId(null);
      setRejectReason("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm">Search by Name or ID</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">Filter by Status</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {filteredRequests.length} of {requests.length} requests
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="pt-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600">No leave requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {request.employee_avatar && (
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={request.employee_avatar}
                          alt={request.employee_name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {request.employee_name}
                      </p>
                      <p className="text-xs text-gray-500">ID: {request.employee_id}</p>
                      <Badge className={`mt-2 ${leaveTypeColor[request.leave_type]}`}>
                        {leaveTypeLabel[request.leave_type]}
                      </Badge>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      request.status === "pending"
                        ? "bg-yellow-500"
                        : request.status === "approved"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {request.status}
                  </Badge>
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600">Start Date</p>
                    <p className="font-semibold">
                      {new Date(request.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">End Date</p>
                    <p className="font-semibold">
                      {new Date(request.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Days</p>
                    <p className="font-semibold text-blue-600">{request.days_count}</p>
                  </div>
                </div>

                {/* Reason */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Reason</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    {request.reason}
                  </p>
                </div>

                {request.status === "rejected" && request.rejection_reason && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-semibold text-red-700 mb-1">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-red-700">{request.rejection_reason}</p>
                  </div>
                )}

                {/* Actions */}
                {request.status === "pending" && (
                  <div className="flex gap-2 pt-4 border-t">
                    {rejectingId === request.id ? (
                      <div className="w-full space-y-2">
                        <Textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Enter rejection reason..."
                          rows={2}
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleReject(request.id)}
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                          >
                            Confirm Rejection
                          </Button>
                          <Button
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason("");
                            }}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={() => onApprove && onApprove(request.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                          disabled={isLoading}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => setRejectingId(request.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                          disabled={isLoading}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {/* Expand button */}
                <button
                  onClick={() =>
                    setExpandedId(expandedId === request.id ? null : request.id)
                  }
                  className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                >
                  {expandedId === request.id ? "Hide Details" : "View Details"}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function OvertimeRequestsManager({
  requests = [],
  isLoading = false,
  onApprove,
  onReject,
}: {
  requests: EmployeeOvertimeRequest[];
  isLoading?: boolean;
  onApprove?: (id: string, extraPay: number) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [extraPay, setExtraPay] = useState("0");

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (id: string) => {
    if (onApprove) {
      await onApprove(id, parseInt(extraPay) || 0);
      setApprovingId(null);
      setExtraPay("0");
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    if (onReject) {
      await onReject(id, rejectReason);
      setRejectingId(null);
      setRejectReason("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm">Search by Name or ID</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">Filter by Status</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {filteredRequests.length} of {requests.length} requests
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="pt-8 text-center">
            <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600">No overtime requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {request.employee_avatar && (
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={request.employee_avatar}
                          alt={request.employee_name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {request.employee_name}
                      </p>
                      <p className="text-xs text-gray-500">ID: {request.employee_id}</p>
                      <Badge className="mt-2 bg-purple-100">
                        {new Date(request.date).toLocaleDateString()} • {request.hours} hrs
                      </Badge>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      request.status === "pending"
                        ? "bg-yellow-500"
                        : request.status === "approved"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {request.status}
                  </Badge>
                </div>

                {/* Work Descriptions */}
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Work Completed / Description
                    </p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded whitespace-pre-wrap">
                      {request.work_description_1 || "No description"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Additional Details / Justification for Extra Pay
                    </p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded whitespace-pre-wrap">
                      {request.work_description_2 || "No description"}
                    </p>
                  </div>
                </div>

                {request.status === "rejected" && request.rejection_reason && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-semibold text-red-700 mb-1">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-red-700">{request.rejection_reason}</p>
                  </div>
                )}

                {/* Actions */}
                {request.status === "pending" && (
                  <div className="flex gap-2 pt-4 border-t">
                    {approvingId === request.id ? (
                      <div className="w-full space-y-2">
                        <div>
                          <Label className="text-xs">Extra Pay Amount (₹)</Label>
                          <Input
                            type="number"
                            value={extraPay}
                            onChange={(e) => setExtraPay(e.target.value)}
                            placeholder="Enter extra pay amount"
                            className="text-sm mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(request.id)}
                            variant="default"
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            Approve with ₹{extraPay}
                          </Button>
                          <Button
                            onClick={() => {
                              setApprovingId(null);
                              setExtraPay("0");
                            }}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : rejectingId === request.id ? (
                      <div className="w-full space-y-2">
                        <Textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Enter rejection reason..."
                          rows={2}
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleReject(request.id)}
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                          >
                            Confirm Rejection
                          </Button>
                          <Button
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason("");
                            }}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={() => setApprovingId(request.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                          disabled={isLoading}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => setRejectingId(request.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                          disabled={isLoading}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function DocumentsManager({
  requests = [],
  isLoading = false,
  onVerify,
  onReject,
}: {
  requests: EmployeeDocument[];
  isLoading?: boolean;
  onVerify?: (id: string) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified" | "rejected">("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const documentTypes = Array.from(new Set(requests.map((r) => r.document_type)));

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || req.document_type === typeFilter;
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    if (onReject) {
      await onReject(id, rejectReason);
      setRejectingId(null);
      setRejectReason("");
    }
  };

  const isFilePreviewable = (file: string) => {
    const ext = file?.split(".")?.pop()?.toLowerCase() || "";
    return ["pdf", "jpg", "jpeg", "png", "gif"].includes(ext);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm">Search</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">Document Type</Label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
              >
                <option value="all">All Types</option>
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm">Status</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                {filteredRequests.length} of {requests.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="pt-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600">No documents found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow flex flex-col h-full">
              <CardContent className="pt-6 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-3 pb-3 border-b">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{doc.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{doc.employee_name}</p>
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

                {/* Type & Date */}
                <div className="space-y-2 mb-4 flex-1">
                  <div>
                    <p className="text-xs text-gray-600">Type</p>
                    <p className="text-sm font-medium">{doc.document_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Uploaded</p>
                    <p className="text-sm">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  {doc.description && (
                    <div>
                      <p className="text-xs text-gray-600">Description</p>
                      <p className="text-xs text-gray-700 line-clamp-2">
                        {doc.description}
                      </p>
                    </div>
                  )}
                </div>

                {doc.status === "rejected" && doc.rejection_reason && (
                  <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-xs">
                    <p className="font-semibold text-red-700 mb-1">Reason:</p>
                    <p className="text-red-700">{doc.rejection_reason}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t flex-wrap">
                  {isFilePreviewable(doc.file) && (
                    <Button
                      onClick={() =>
                        setPreviewId(previewId === doc.id ? null : doc.id)
                      }
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                  )}
                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full text-xs h-8">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </a>
                </div>

                {/* Status Actions */}
                {doc.status === "pending" && (
                  <div className="flex gap-2 pt-2">
                    {rejectingId === doc.id ? (
                      <div className="w-full space-y-2">
                        <Textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Rejection reason..."
                          rows={2}
                          className="text-xs"
                        />
                        <div className="flex gap-1">
                          <Button
                            onClick={() => handleReject(doc.id)}
                            variant="destructive"
                            size="sm"
                            className="flex-1 text-xs h-8"
                          >
                            Confirm
                          </Button>
                          <Button
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason("");
                            }}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs h-8"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={() => onVerify && onVerify(doc.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-green-600 border-green-200 hover:bg-green-50 text-xs h-8"
                          disabled={isLoading}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verify
                        </Button>
                        <Button
                          onClick={() => setRejectingId(doc.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 border-red-200 hover:bg-red-50 text-xs h-8"
                          disabled={isLoading}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>

              {/* File Preview Modal */}
              {previewId === doc.id && isFilePreviewable(doc.file) && (
                <CardContent className="pt-4 border-t">
                  {doc.file.endsWith(".pdf") ? (
                    <iframe
                      src={doc.file}
                      className="w-full h-64 rounded border"
                      title={doc.title}
                    />
                  ) : (
                    <img
                      src={doc.file}
                      alt={doc.title}
                      className="w-full h-64 object-contain rounded border"
                    />
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
