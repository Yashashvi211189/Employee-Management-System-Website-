"use client";

import { API_URL } from "@/lib/config";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import {
  FileText,
  Download,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

interface EmployeeDocument {
  id: string;
  title: string;
  description: string;
  document_type: string; // e.g., "ID Proof", "Address Proof", "Qualification", "Experience Certificate", etc.
  file: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
  status: "pending" | "verified" | "rejected";
  rejection_reason?: string;
  verified_at?: string;
  verified_by?: string;
}

const DOCUMENT_TYPES = [
  "ID Proof",
  "Address Proof",
  "Qualification Certificate",
  "Experience Certificate",
  "Joining Document",
  "Resume",
  "Professional License",
  "Other",
];

export default function DocumentDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const [document, setDocument] = useState<EmployeeDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<EmployeeDocument>>({});
  const [submitting, setSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Helper function to get auth header
  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem("access") || localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      throw new Error("No auth token");
    }
    return { Authorization: `JWT ${token}` };
  }, [router]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/employee/login");
      return;
    }

    const fetchDocumentData = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/employee-documents/${documentId}/`,
          { headers: getAuthHeader() }
        );

        if (!res.ok) {
          if (res.status === 404) {
            router.push("/employee/dashboard");
            return;
          }
          throw new Error("Failed to fetch document");
        }

        const data = await res.json();
        setDocument(data);
        setEditData(data);
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentData();
  }, [authLoading, user, router, documentId, getAuthHeader]);

  const handleSave = async () => {
    if (!document) return;

    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_URL}/api/employee-documents/${documentId}/`,
        {
          method: "PATCH",
          headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editData.title,
            description: editData.description,
            document_type: editData.document_type,
          }),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        setDocument(updated);
        setEditMode(false);
        alert("Document information updated successfully");
      } else {
        alert("Failed to save changes");
      }
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Error saving changes");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!document || document.status !== "pending") {
      alert("Cannot delete verified or rejected documents");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this document? This action cannot be undone."
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_URL}/api/employee-documents/${documentId}/`,
        {
          method: "DELETE",
          headers: getAuthHeader(),
        }
      );

      if (res.ok) {
        alert("Document deleted successfully");
        router.push("/employee/dashboard");
      } else {
        alert("Failed to delete document");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Error deleting document");
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
              <p className="text-gray-600">Loading document details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-red-600">Document not found</p>
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

  const isFileVisible = (file: string) => {
    const extension = file?.split(".")?.pop()?.toLowerCase() || "";
    return ["pdf", "jpg", "jpeg", "png", "gif"].includes(extension);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/employee/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white hover:text-cyan-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Document Details</h1>
              <p className="text-cyan-100">Manage and track your documents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Status Alert */}
        <div
          className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            document.status === "verified"
              ? "bg-green-50 border border-green-200"
              : document.status === "rejected"
              ? "bg-red-50 border border-red-200"
              : "bg-yellow-50 border border-yellow-200"
          }`}
        >
          {document.status === "verified" ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
          ) : document.status === "rejected" ? (
            <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-semibold capitalize">
              Status: {document.status === "pending" ? "Under Review" : document.status}
            </p>
            {document.rejection_reason && (
              <p className="text-sm mt-1">Reason: {document.rejection_reason}</p>
            )}
            {document.verified_at && (
              <p className="text-sm mt-1">
                Verified on {new Date(document.verified_at).toLocaleDateString()}
              </p>
            )}
          </div>
          <Badge
            className={`${
              document.status === "verified"
                ? "bg-green-500"
                : document.status === "rejected"
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
          >
            {document.status}
          </Badge>
        </div>

        {/* Document Information */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Document Information</CardTitle>
            {document.status === "pending" && !editMode && (
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
            {/* Title */}
            <div>
              <Label>Document Title</Label>
              {editMode ? (
                <Input
                  value={editData.title || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="mt-2"
                  placeholder="e.g., Aadhar Card, PAN Card, etc."
                />
              ) : (
                <p className="text-gray-900 font-medium mt-2">{document.title}</p>
              )}
            </div>

            {/* Document Type */}
            <div>
              <Label>Document Type</Label>
              {editMode ? (
                <select
                  value={editData.document_type || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, document_type: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
                >
                  <option value="">Select a type</option>
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900 font-medium mt-2">
                  {document.document_type || "Not specified"}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              {editMode ? (
                <Textarea
                  value={editData.description || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  placeholder="Add any additional information about this document"
                  rows={4}
                  className="mt-2"
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap mt-2">
                  {document.description || "No description provided"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* File Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>File Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">{document.file_name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(document.file_size)}
                  </p>
                </div>
                <a
                  href={document.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>

              <div className="text-xs text-gray-500">
                Uploaded on{" "}
                {new Date(document.uploaded_at).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Preview */}
        {isFileVisible(document.file) && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>File Preview</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Show
                  </>
                )}
              </Button>
            </CardHeader>
            {previewMode && (
              <CardContent>
                {document.file.endsWith(".pdf") ? (
                  <iframe
                    src={document.file}
                    className="w-full h-96 rounded-lg border"
                    title="Document preview"
                  />
                ) : (
                  <img
                    src={document.file}
                    alt="Document preview"
                    className="max-w-full h-auto rounded-lg border"
                  />
                )}
              </CardContent>
            )}
          </Card>
        )}

        {/* Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Document Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="w-0.5 h-12 bg-gray-300 flex-1"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Uploaded</p>
                  <p className="text-sm text-gray-500">
                    {new Date(document.uploaded_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {document.status !== "pending" && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        document.status === "verified"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                  </div>
                  <div>
                    <p className="font-medium capitalize text-gray-700">
                      {document.status === "verified"
                        ? "Document Verified"
                        : "Document Rejected"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {document.verified_at
                        ? new Date(document.verified_at).toLocaleString()
                        : "N/A"}
                    </p>
                    {document.verified_by && (
                      <p className="text-xs text-gray-400 mt-1">
                        Verified by: {document.verified_by}
                      </p>
                    )}
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
                    setEditData(document);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-4">
                {document.status === "pending" && (
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    className="flex-1"
                  >
                    Delete
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
