"use client";

import { API_URL } from "@/lib/config";
import { useState, useRef, useEffect, useMemo } from "react";
import "react-easy-crop/react-easy-crop.css";
import Cropper, { Area } from "react-easy-crop";
import { motion } from "framer-motion";
import { useCallback } from "react";
import BlogAdmin from "@/components/admin/BlogAdmin";

import {
  Users,
  Briefcase,
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Save,
  Check,
  LayoutDashboard,
  Calendar,
  MapPin,
  Filter,
  TrendingUp,
  Award,
  Activity,
  Download,
  Upload,
  Star,
  ExternalLink,
  Play,
  Package,
  Tag,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Globe,
  Cpu,
  Target,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  ExternalLinkIcon,
  PenLine,
  MessageSquare,
  User,
  UserPlus,
  FileText,
  XCircle,
  Link as LinkIcon,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { loadAdminBlogs, BLOGS_UPDATED_EVENT } from "@/lib/admin-blog-store";

// Add this after the other interfaces (after Product interface)
interface Testimonial {
  id: number;
  name: string;
  company: string;
  role: string;
  text: string;
  image: string | null;
  linkedin: string;
  status: 'active' | 'inactive';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

type TestimonialForm = Omit<Testimonial, 'image'> & { image: string | File | null };

// Employee Interface
interface Employee {
  id: string;
  login_id?: string;           // phone or email (legacy)
  email?: string;
  phone?: string;
  is_active?: boolean;
  current_project?: any;
  current_project_id?: string | number | null;
  current_project_title?: string;
  employee_id: string;         // unique ID (e.g., DI10001)
  name: string;
  designation: string;         // from dropdown list
  profile_pic: string | File | null;
  location: string;
  employment_type: string;     // e.g., Full-time, Intern
  qualification: string;
  documents: string | File | null;
  joining_documents: string | File | null;
  documents_submitted_to_admin: string | File | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

type EmployeeForm = Omit<Employee, "profile_pic" | "documents"> & {
  profile_pic: string | File | null;
  documents: string | File | null;
  joining_documents: string | File | null;
  documents_submitted_to_admin: string | File | null;
  password?: string; // optional field for admin-set password
};

const cleanText = (value: unknown) => {
  if (typeof value === "string") return value.trim().replace(/^`+|`+$/g, "").trim();
  if (typeof value === "number") return String(value);
  return "";
};

const resolveMediaUrl = (value: unknown) => {
  const v = cleanText(value);
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("/")) return `${API_URL}${v}`;
  return `${API_URL}/${v}`;
};

const parseTicketLinks = (value: unknown) =>
  cleanText(value)
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => {
      const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      return { url: normalized, label: url };
    });

const withCacheBuster = (url: string, key: unknown) => {
  if (!url) return "";
  const k = cleanText(key);
  if (!k) return url;
  return url.includes("?") ? `${url}&v=${encodeURIComponent(k)}` : `${url}?v=${encodeURIComponent(k)}`;
};

const downloadCsv = (filename: string, rows: Record<string, unknown>[]) => {
  if (!rows.length) {
    alert("No data to export for this section.");
    return;
  }
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// Types
interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  image: string | File;
  bio: string;
  location: string;
  joinDate: string;
  memberID?: string;
  skills: string[];
  status: "Active" | "Alumni";
  member_type: "founder" | "executive" | "employee" | "alumni";
  education?: string;
  achievements?: string[];
  experience?: string;
}

interface Project {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  image: string;
  gallery: string[];
  icon: string;
  category: string;
  technologies: string[] | string;
  color: string;
  stats: Record<string, string>;
  details: string;
  challenges: string[] | string;
  outcomes: string[] | string;
  timeline: string;
  team: string;
  client: string;
  liveUrl?: string;
  videoUrl?: string;
  status: "completed" | "ongoing" | "planned";
  featured?: boolean;
  testimonial?: {
    name?: string;
    role?: string;
    image?: string;
    quote?: string;
    rating?: number;
  };
  testimonial_name?: string;
  testimonial_role?: string;
  testimonial_image?: string;
  testimonial_quote?: string;
  testimonial_rating?: number;
  sortOrder?: number;
}

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  created_at: string;
  tags?: string[];
}

interface Product {
  id: string;
  name: string;
  tagline: string;
  iconText: string;
  cover: string;
  gallery: string[];
  description: string;
  fullDescription: string;
  features: string[];
  outcomes: string[];
  challenges: string[];
  technologies: string[];
  stats: { label: string; value: string }[];
  liveUrl?: string;
  status: "Live" | "In Development" | "Coming Soon";
  category: string;
  platforms: string[];
  integrations: string[];
  support: string[];
  documentationUrl?: string;
  demoUrl?: string;
  featured: boolean;
  sortOrder: number;
  color?: string;
  pricing?: string;
  
  createdAt: string;
  updatedAt: string;
}
type ExploreUseCase = {
  title: string;
  description: string;
  image: string | File;
  layout?: "image_left" | "image_right";
};

type ExploreSubsection = {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  images: (string | File)[];
  technologies: string[];
  developers: number[];
  use_cases: ExploreUseCase[];
};

type ExploreSection = {
  title: string;
  subsections: ExploreSubsection[];
};

// GIS Services Interface
interface GisService {
  id: string;
  title: string;
  description: string;
  image: string | File;
  long_description: string;
  features: string[];
  benefits: string[];
  technologies: string[];
  developers: number[]; // IDs of TeamMember
  demo_video_url?: string;
  status: "active" | "inactive";
  sort_order: number;
  created_at: string;
  updated_at: string;
  use_cases?: ExploreUseCase[];
  explore?: ExploreSection;
}

// IT Services Interface
interface Service {
  id: string;
  title: string;
  description: string;
  image: string | File;
  long_description: string;
  features: string[];
  benefits: string[];
  technologies: string[];
  developers: number[]; // IDs of TeamMember
  demo_video_url?: string;
  status: "active" | "inactive";
  sort_order: number;
  created_at: string;
  updated_at: string;
  use_cases?: ExploreUseCase[];
  explore?: ExploreSection;
}

type ServiceForm = Omit<Service, "image"> & { image: string | File };

const isFile = (value: unknown): value is File =>
  typeof value === "object" && value instanceof File;

type TeamMemberForm = Omit<TeamMember, "image"> & { image: string | File };
type ProjectForm = Omit<Project, "image" | "technologies" | "challenges" | "outcomes"> & {
  image: string | File;
  technologies: string[] | string;
  challenges: string[] | string;
  outcomes: string[] | string;
  testimonial_name?: string;
  testimonial_role?: string;
  testimonial_image?: string;
  testimonial_quote?: string;
  testimonial_rating?: number;
  sortOrder?: number;
};
type GalleryItemForm = Omit<GalleryItem, "image"> & { image: string | File | null };
type ProductForm = Omit<Product, "cover"> & { cover: string | File };

// Initial Data
const initialTeam: TeamMember[] = [];
const initialProjects: Project[] = [];
const initialGallery: GalleryItem[] = [];
const initialProducts: Product[] = [];
const initialGisServices: GisService[] = [];
const initialServices: Service[] = [];
const initialTestimonials: Testimonial[] = [];
const initialEmployees: Employee[] = [];

// Leave Request Interface
interface LeaveRequest {
  id: number;
  employee: number;
  employee_name?: string;
  leave_type: 'sick' | 'casual' | 'earned' | 'other';
  start_date: string;
  end_date: string;
  days_count?: number;
  total_days?: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  documents?: string;
  created_at: string;
}

// Overtime Request Interface
interface OvertimeRequest {
  id: number;
  employee: number;
  employee_name?: string;
  date: string;
  hours: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  work_description_1?: string;
  work_description_2?: string;
  rejection_reason?: string;
  extra_pay?: number;
  extra_pay_per_hour?: number;
  created_at: string;
}

// Employee Document Interface
interface EmployeeDocument {
  id: number;
  employee: number;
  employee_name?: string;
  title: string;
  file: string;
  uploaded_at: string;
  description?: string;
  document_type?: string;
  status?: 'pending' | 'verified' | 'rejected';
  rejection_reason?: string;
}

// Employee Ticket Interface
interface EmployeeTicket {
  id?: number;
  ticket_id?: number | string;
  ticketId?: number | string;
  employee?: number | string | { id?: number | string; name?: string };
  employee_id?: number | string;
  employeeId?: number | string;
  employee_name?: string;
  title?: string;
  ticket_title?: string;
  Ticket_Title?: string;
  subject?: string;
  description?: string;
  details?: string;
  status?: 'pending' | 'in-progress' | 'resolved' | 'closed';
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  closed_at?: string;
  Reassigned_to?: number | string | null;
  reassigned_to?: number | string | null;
  assigned_to?: number | string | null;
  Reassigned_to_name?: string;
}

// Project constants
const projectCategories = [
  "mobile",
  "fintech",
  "saas",
  "edtech",
  "ai",
  "blockchain",
  "devops",
  "ecommerce",
  "govtech",
  "enterprise",
];

const productCategories = [
  "education",
  "business",
  "productivity",
  "analytics",
  "communication",
  "development",
  "design",
  "marketing",
  "finance",
  "healthcare",
];

const colorOptions = [
  "from-blue-500 to-purple-600",
  "from-green-500 to-emerald-600",
  "from-orange-500 to-red-600",
  "from-purple-500 to-pink-600",
  "from-indigo-500 to-blue-600",
  "from-gray-600 to-gray-800",
  "from-cyan-500 to-blue-600",
  "from-yellow-500 to-orange-600",
  "from-teal-500 to-green-600",
  "from-pink-500 to-rose-600",
  "from-violet-500 to-purple-600",
];

const platformOptions = [
  "web",
  "mobile",
  "desktop",
  "cloud",
  "self-hosted",
  "api",
  "browser-extension",
];

const integrationOptions = [
  "google-workspace",
  "microsoft-365",
  "slack",
  "zoom",
  "stripe",
  "paypal",
  "github",
  "gitlab",
  "jira",
  "notion",
  "salesforce",
  "hubspot",
];

const supportOptions = [
  "email",
  "phone",
  "chat",
  "documentation",
  "tutorials",
  "community-forum",
  "dedicated-support",
  "training-sessions",
];

// Employee designations
const employeeDesignations = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Blockchain Developer",
  "Mobile App Developer",
  "DevOps Engineer",
  "Data Scientist",
  "ML/AI Engineer",
  "UI/UX Designer",
  "QA Engineer",
  "Support Staff",
  "HR",
  "Accountant",
  "Intern",
  "ML/AI Intern",
  "Software Developer Intern",
  "GIS Intern",
  "GIS Project Manager",
  "Project Manager",
  "Director",
  "Founder",
];


// Helper function for status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
    case "Live":
      return "bg-green-500";
    case "ongoing":
    case "In Development":
      return "bg-blue-500";
    case "planned":
    case "Coming Soon":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "ongoing":
      return "Ongoing";
    case "planned":
      return "Planned";
    case "Live":
      return "Live";
    case "In Development":
      return "In Development";
    case "Coming Soon":
      return "Coming Soon";
    default:
      return status;
  }
};

const getPricingTypeColor = (type: string) => {
  switch (type) {
    case "free":
      return "bg-green-100 text-green-800";
    case "paid":
      return "bg-blue-100 text-blue-800";
    case "freemium":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Team Modal Component
const TeamModal = ({
  isOpen,
  onClose,
  member,
  onSave,
  isEdit = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  member: Partial<TeamMember> | null;
  onSave: (member: Partial<TeamMemberForm>) => void;
  isEdit?: boolean;
}) => {
  const [localMember, setLocalMember] = useState<Partial<TeamMemberForm>>(() => ({
    name: "",
    role: "",
    department: "",
    image: "",
    bio: "",
    location: "",
    joinDate: "",
    memberID: "",
    skills: [],
    status: "Active",
    member_type: "employee",
    education: "",
    achievements: [],
    experience: "",
  }));

  const [imagePreview, setImagePreview] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Crop state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // Define the crop ratio (397:287)
  const CROP_RATIO = 397 / 287; // approximately 1.383

  // Initialize only once when modal opens
  useEffect(() => {
    if (isOpen && !isInitialized) {
      if (member) {
        setLocalMember({
          name: member.name || "",
          role: member.role || "",
          department: member.department || "",
          image: member.image || "",
          bio: member.bio || "",
          location: member.location || "",
          joinDate: member.joinDate || "",
          memberID: member.memberID || "",
          skills: member.skills || [],
          status: member.status || "Active",
          member_type: member.member_type || "employee",
          education: member.education || "",
          achievements: member.achievements || [],
          experience: member.experience || "",
        });

        if (!member.image) {
          setImagePreview("");
        } else if (typeof member.image === "string") {
          if (member.image.startsWith("http")) {
            setImagePreview(member.image);
          } else {
            setImagePreview(`${API_URL}${member.image}`);
          }
        } else {
          setImagePreview(URL.createObjectURL(member.image));
        }
      } else {
        setLocalMember({
          name: "",
          role: "",
          department: "",
          image: "",
          bio: "",
          location: "",
          joinDate: "",
          skills: [],
          status: "Active",
          member_type: "employee",
          education: "",
          achievements: [],
          experience: "",
        });
        setImagePreview("");
      }
      setIsInitialized(true);
    }
  }, [isOpen, member, isInitialized]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false);
    }
  }, [isOpen]);

  // Handle image upload - opens crop modal
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCropImageSrc(event.target.result as string);
          setCropModalOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle crop completion
  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Create cropped image
  const createCroppedImage = useCallback(async () => {
    if (!cropImageSrc || !croppedAreaPixels) {
      console.error('Missing crop data');
      return;
    }

    try {
      setIsCropping(true);

      const image = new window.Image();
      image.crossOrigin = 'anonymous';

      const imageLoaded = new Promise((resolve, reject) => {
        image.onload = () => resolve(true);
        image.onerror = () => reject(new Error('Failed to load image'));
      });

      image.src = cropImageSrc;
      await imageLoaded;

      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.95);
      });

      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      const fileName = `cropped-${Date.now()}.jpg`;
      const croppedFile = new File([blob], fileName, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      setLocalMember(prev => ({
        ...prev,
        image: croppedFile,
      }));

      const previewUrl = URL.createObjectURL(blob);
      setImagePreview(previewUrl);

      setIsCropping(false);
      setCropModalOpen(false);
      setCropImageSrc('');

    } catch (error) {
      console.error('Error cropping image:', error);
      setIsCropping(false);
      alert('Failed to crop image. Please try again.');
    }
  }, [cropImageSrc, croppedAreaPixels]);

  const handleSave = () => {
    onSave(localMember);
  };

  const addSkill = () => {
    setLocalMember((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), ""],
    }));
  };

  const updateSkill = (index: number, value: string) => {
    const updatedSkills = [...(localMember.skills || [])];
    updatedSkills[index] = value;
    setLocalMember((prev) => ({
      ...prev,
      skills: updatedSkills,
    }));
  };

  const removeSkill = (index: number) => {
    setLocalMember((prev) => ({
      ...prev,
      skills: prev.skills?.filter((_, i) => i !== index) || [],
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Team Modal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {isEdit ? "Edit Team Member" : "Add Team Member"}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6 space-y-4">
            {/* Profile Image Section with Crop Option */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-32 h-32 mb-4">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Profile preview"
                    fill
                    className="rounded-full object-cover border-4 border-white shadow-lg"
                    sizes="128px"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {localMember.image ? "Change Photo" : "Upload Photo"}
                    </span>
                  </Button>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Recommended: Upload any image <br />
                  You can crop to 397:287 ratio after uploading
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Member Type *</Label>
                <select
                  value={localMember.member_type}
                  onChange={(e) =>
                    setLocalMember({
                      ...localMember,
                      member_type: e.target.value as any,
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="employee">Employee</option>
                  <option value="executive">Executive</option>
                  <option value="founder">Founder</option>
                  <option value="alumni">Alumni</option>
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium">Status</Label>
                <select
                  value={localMember.status}
                  onChange={(e) =>
                    setLocalMember({
                      ...localMember,
                      status: e.target.value as any,
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="Active">Active</option>
                  <option value="Alumni">Alumni</option>
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium">Full Name *</Label>
                <Input
                  value={localMember.name}
                  onChange={(e) =>
                    setLocalMember({ ...localMember, name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Role *</Label>
                <Input
                  value={localMember.role}
                  onChange={(e) =>
                    setLocalMember({ ...localMember, role: e.target.value })
                  }
                  placeholder="Software Engineer"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Department</Label>
                <Input
                  value={localMember.department}
                  onChange={(e) =>
                    setLocalMember({
                      ...localMember,
                      department: e.target.value,
                    })
                  }
                  placeholder="Engineering"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Location</Label>
                <Input
                  value={localMember.location}
                  onChange={(e) =>
                    setLocalMember({
                      ...localMember,
                      location: e.target.value,
                    })
                  }
                  placeholder="San Francisco, CA"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Member ID</Label>
                <Input
                  value={localMember.memberID || ""}
                  onChange={(e) =>
                    setLocalMember({
                      ...localMember,
                      memberID: e.target.value,
                    })
                  }
                  placeholder="DI10001"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Join Date</Label>
                <Input
                  type="date"
                  value={localMember.joinDate || ""}
                  onChange={(e) =>
                    setLocalMember({
                      ...localMember,
                      joinDate: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Education</Label>
                <Input
                  value={localMember.education}
                  onChange={(e) =>
                    setLocalMember({
                      ...localMember,
                      education: e.target.value,
                    })
                  }
                  placeholder="B.S. Computer Science"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Skills Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Skills</Label>
                <Button
                  type="button"
                  onClick={addSkill}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Skill
                </Button>
              </div>
              <div className="space-y-2">
                {localMember.skills?.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      placeholder={`Skill ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSkill(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <Label className="text-sm font-medium">Bio *</Label>
              <Textarea
                value={localMember.bio}
                onChange={(e) =>
                  setLocalMember({ ...localMember, bio: e.target.value })
                }
                placeholder="Tell us about this team member..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!localMember.name || !localMember.role || !localMember.bio}
              className="bg-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEdit ? "Update Member" : "Add Member"}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Crop Modal */}
      {cropModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Crop Image</h2>
              <p className="text-sm text-gray-500">Adjust crop to 397:287 ratio</p>
              <Button variant="ghost" size="icon" onClick={() => setCropModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6">
              <div className="relative h-[400px] w-full bg-black rounded-lg overflow-hidden">
                {cropImageSrc && (
                  <Cropper
                    image={cropImageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={CROP_RATIO}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    cropShape="rect"
                    showGrid={true}
                    restrictPosition={false}
                    style={{
                      containerStyle: {
                        width: "100%",
                        height: "100%",
                      },
                    }}
                  />
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Zoom</Label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1x</span>
                    <span>{zoom.toFixed(1)}x</span>
                    <span>3x</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCropModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={createCroppedImage}
                disabled={isCropping}
                className="bg-primary"
              >
                {isCropping ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cropping...
                  </div>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Apply Crop
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

// Service Modal Component
const ServiceModal = ({
  isOpen,
  onClose,
  service,
  onSave,
  isEdit = false,
  teamMembers = [],
  entityName = "Service",
  isGis = false,
  enableExplore = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  service: Partial<ServiceForm> & { explore?: ExploreSection };
  onSave: (service: Partial<ServiceForm> & { explore?: ExploreSection }) => void;
  isEdit?: boolean;
  teamMembers?: TeamMember[];
  entityName?: string;
  isGis?: boolean;
  enableExplore?: boolean;
}) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [exploreImageUrlDrafts, setExploreImageUrlDrafts] = useState<
    Record<number, string>
  >({});
  const [exploreTechnologiesDrafts, setExploreTechnologiesDrafts] = useState<
    Record<number, string>
  >({});

  const slugifyTitle = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const [localService, setLocalService] = useState<Partial<ServiceForm>>(() => ({
    id: "",
    title: "",
    description: "",
    image: "",
    long_description: "",
    features: [],
    benefits: [],
    technologies: [],
    developers: [],
    demo_video_url: "",
    status: "active",
    sort_order: 0,
    use_cases: [],
    ...(enableExplore
      ? {
          explore: {
            title: "",
            subsections: [],
          } as ExploreSection,
        }
      : {}),
    ...service,
  }));

  useEffect(() => {
    setLocalService((prev) => ({
      ...prev,
      ...service,
      use_cases: service.use_cases ?? prev.use_cases ?? [],
      ...(enableExplore
        ? {
            explore:
              (service as any).explore ??
              (prev as any).explore ??
              ({ title: "", subsections: [] } as ExploreSection),
          }
        : { explore: undefined }),
    }));
  }, [service, enableExplore]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localService);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLocalService((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const addListItem = (field: "features" | "benefits" | "technologies") => {
    setLocalService((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }));
  };

  const updateListItem = (field: "features" | "benefits" | "technologies", index: number, value: string) => {
    const updatedList = [...(localService[field] || [])];
    updatedList[index] = value;
    setLocalService((prev) => ({
      ...prev,
      [field]: updatedList,
    }));
  };

  const removeListItem = (field: "features" | "benefits" | "technologies", index: number) => {
    setLocalService((prev) => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || [],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {isEdit ? `Edit ${entityName}` : `Add New ${entityName}`}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList
              className={`grid w-full ${enableExplore ? "grid-cols-5" : "grid-cols-4"} mb-6 gap-1`}
            >
              <TabsTrigger value="basic" className="text-xs py-2 px-1 truncate">
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="details" className="text-xs py-2 px-1 truncate">
                Details
              </TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs py-2 px-1 truncate">
                Advanced
              </TabsTrigger>
              <TabsTrigger value="useCases" className="text-xs py-2 px-1 truncate">
                Use Cases
              </TabsTrigger>
              {enableExplore && (
                <TabsTrigger value="explore" className="text-xs py-2 px-1 truncate">
                  Explore
                </TabsTrigger>
              )}
            </TabsList>

            {/* BASIC TAB */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="id">Service ID *</Label>
                  <Input
                    id="id"
                    value={localService.id || ""}
                    onChange={(e) =>
                      setLocalService({
                        ...localService,
                        id: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                      })
                    }
                    placeholder="fullstack-development"
                    disabled={isEdit}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Unique identifier (lowercase with hyphens)
                  </p>
                </div>
                <div>
                  <Label htmlFor="title">Service Title *</Label>
                  <Input
                    id="title"
                    value={localService.title || ""}
                    onChange={(e) =>
                      setLocalService({
                        ...localService,
                        title: e.target.value,
                      })
                    }
                    placeholder="Fullstack Development"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  value={localService.description || ""}
                  onChange={(e) =>
                    setLocalService({
                      ...localService,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description for cards..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="demo_video_url">Demo Video URL</Label>
                  <Input
                    id="demo_video_url"
                    value={localService.demo_video_url || ""}
                    onChange={(e) =>
                      setLocalService({
                        ...localService,
                        demo_video_url: e.target.value,
                      })
                    }
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={localService.status}
                    onChange={(e) =>
                      setLocalService({
                        ...localService,
                        status: e.target.value as "active" | "inactive",
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </TabsContent>

            {/* DETAILS TAB */}
            <TabsContent value="details" className="space-y-4">
              <div>
                <Label htmlFor="long_description">Long Description</Label>
                <Textarea
                  id="long_description"
                  value={localService.long_description || ""}
                  onChange={(e) =>
                    setLocalService({
                      ...localService,
                      long_description: e.target.value,
                    })
                  }
                  placeholder="Detailed service description with HTML support..."
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can use HTML tags for formatting
                </p>
              </div>

              {/* Features */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Features</Label>
                  <Button type="button" onClick={() => addListItem("features")} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Feature
                  </Button>
                </div>
                <div className="space-y-2">
                  {localService.features?.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateListItem("features", index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeListItem("features", index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Benefits</Label>
                  <Button type="button" onClick={() => addListItem("benefits")} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Benefit
                  </Button>
                </div>
                <div className="space-y-2">
                  {localService.benefits?.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={benefit}
                        onChange={(e) => updateListItem("benefits", index, e.target.value)}
                        placeholder={`Benefit ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeListItem("benefits", index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technologies */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Technologies</Label>
                  <Button type="button" onClick={() => addListItem("technologies")} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Technology
                  </Button>
                </div>
                <div className="space-y-2">
                  {localService.technologies?.map((tech, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={tech}
                        onChange={(e) => updateListItem("technologies", index, e.target.value)}
                        placeholder={`Technology ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeListItem("technologies", index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ADVANCED TAB */}
            <TabsContent value="advanced" className="space-y-4">
              {/* Image Upload */}
              <div>
                <Label htmlFor="image">Service Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="h-10"
                />
                {isFile(localService.image) && (
                  <p className="text-xs text-green-600 mt-1">
                    Selected: {(localService.image as File).name}
                  </p>
                )}
                {typeof localService.image === "string" && localService.image && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">Current image:</p>
                    <img
                      src={
                        typeof service.image === "string" && service.image
                          ? service.image.startsWith("http")
                            ? service.image
                            : `${API_URL}${service.image}`
                          : "/brand/abstract-grid.svg"
                      }
                      alt="Service preview"
                      className="w-60 h-32 object-cover rounded-lg mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Developers */}
              <div>
                <Label>Developers (Team Members)</Label>
                <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        id={`dev-${member.id}`}
                        checked={localService.developers?.includes(Number(member.id))}
                        onChange={(e) => {
                          const currentDevs = [...(localService.developers || [])];
                          if (e.target.checked) {
                            currentDevs.push(Number(member.id));
                          } else {
                            const index = currentDevs.indexOf(Number(member.id));
                            if (index > -1) currentDevs.splice(index, 1);
                          }
                          setLocalService({
                            ...localService,
                            developers: currentDevs,
                          });
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`dev-${member.id}`} className="text-sm cursor-pointer flex-1">
                        {member.name} - {member.role}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select team members involved in this service
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={localService.sort_order || 0}
                    onChange={(e) =>
                      setLocalService({
                        ...localService,
                        sort_order: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lower numbers appear first
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* USE CASES TAB */}
            <TabsContent value="useCases" className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Use Cases</Label>
                <Button
                  type="button"
                  onClick={() => {
                    setLocalService((prev) => ({
                      ...prev,
                      use_cases: [
                        ...(prev.use_cases || []),
                        {
                          title: "",
                          description: "",
                          image: "",
                          layout:
                            (prev.use_cases?.length || 0) % 2 === 0
                              ? "image_left"
                              : "image_right",
                        },
                      ],
                    }));
                  }}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Use Case
                </Button>
              </div>

              <div className="space-y-6">
                {(localService.use_cases || []).map((uc, index) => {
                  const imageValue = uc.image;
                  const previewSrc =
                    imageValue instanceof File
                      ? URL.createObjectURL(imageValue)
                      : typeof imageValue === "string" && imageValue
                        ? imageValue.startsWith("http")
                          ? imageValue
                          : `${API_URL}${imageValue.startsWith("/") ? "" : "/"}${imageValue}`
                        : "";

                  return (
                    <Card key={index} className="p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Use Case #{index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = [...(localService.use_cases || [])];
                            updated.splice(index, 1);
                            setLocalService((prev) => ({ ...prev, use_cases: updated }));
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Title</Label>
                            <Input
                              value={uc.title}
                              onChange={(e) => {
                                const updated = [...(localService.use_cases || [])];
                                updated[index] = {
                                  ...updated[index],
                                  title: e.target.value,
                                };
                                setLocalService((prev) => ({ ...prev, use_cases: updated }));
                              }}
                              placeholder="e.g., Urban Planning"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Layout</Label>
                            <select
                              value={uc.layout || "image_left"}
                              onChange={(e) => {
                                const updated = [...(localService.use_cases || [])];
                                updated[index] = {
                                  ...updated[index],
                                  layout: e.target.value as "image_left" | "image_right",
                                };
                                setLocalService((prev) => ({ ...prev, use_cases: updated }));
                              }}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="image_left">Left Image | Right Text</option>
                              <option value="image_right">Right Image | Left Text</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            value={uc.description}
                            onChange={(e) => {
                              const updated = [...(localService.use_cases || [])];
                              updated[index] = {
                                ...updated[index],
                                description: e.target.value,
                              };
                              setLocalService((prev) => ({ ...prev, use_cases: updated }));
                            }}
                            placeholder="Describe how this applies..."
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Image Upload</Label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const updated = [...(localService.use_cases || [])];
                                updated[index] = { ...updated[index], image: file };
                                setLocalService((prev) => ({ ...prev, use_cases: updated }));
                              }}
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Image URL</Label>
                            <Input
                              value={typeof uc.image === "string" ? uc.image : ""}
                              onChange={(e) => {
                                const updated = [...(localService.use_cases || [])];
                                updated[index] = { ...updated[index], image: e.target.value };
                                setLocalService((prev) => ({ ...prev, use_cases: updated }));
                              }}
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                        </div>

                        {previewSrc && (
                          <div className="mt-2">
                            <img
                              src={previewSrc}
                              alt="Preview"
                              className="w-40 h-24 object-cover rounded"
                              onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              {(!localService.use_cases || localService.use_cases.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-8 border border-dashed rounded-lg">
                  No use cases added yet. Click "Add Use Case" to start.
                </p>
              )}
            </TabsContent>

            {enableExplore && (
              <TabsContent value="explore" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Explore Box Title (optional)</Label>
                  <Input
                    value={(localService as any).explore?.title || ""}
                    onChange={(e) => {
                      setLocalService((prev) => ({
                        ...prev,
                        explore: {
                          title: e.target.value,
                          subsections: (prev as any).explore?.subsections || [],
                        },
                      }));
                    }}
                    placeholder={`Explore ${localService.title || ""}`}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <Label>Explore Subsections</Label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setLocalService((prev) => ({
                        ...prev,
                        explore: {
                          title: (prev as any).explore?.title || "",
                          subsections: [
                            ...(((prev as any).explore?.subsections as ExploreSubsection[]) || []),
                            {
                              title: "",
                              slug: "",
                              short_description: "",
                              description: "",
                              images: [],
                              technologies: [],
                              developers: [],
                              use_cases: [],
                            },
                          ],
                        },
                      }));
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Subsection
                  </Button>
                </div>

                <div className="space-y-6">
                  {(((localService as any).explore?.subsections as ExploreSubsection[]) || []).map(
                    (sub, index) => (
                      <Card key={index} className="p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium">Subsection #{index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => {
                              setLocalService((prev) => ({
                                ...prev,
                                explore: {
                                  title: (prev as any).explore?.title || "",
                                  subsections: (
                                    (((prev as any).explore?.subsections as ExploreSubsection[]) || []).filter(
                                      (_, i) => i !== index
                                    )
                                  ),
                                },
                              }));
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Title</Label>
                              <Input
                                value={sub.title}
                                onChange={(e) => {
                                  const title = e.target.value;
                                  const slug = slugifyTitle(title);
                                  setLocalService((prev) => {
                                    const current =
                                      (((prev as any).explore?.subsections as ExploreSubsection[]) || []).slice();
                                    current[index] = { ...current[index], title, slug };
                                    return {
                                      ...prev,
                                      explore: {
                                        title: (prev as any).explore?.title || "",
                                        subsections: current,
                                      },
                                    };
                                  });
                                }}
                                placeholder="Advanced DSM Classification"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Slug (auto)</Label>
                              <Input value={sub.slug} disabled placeholder="advanced-dsm-classification" />
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs">Short Description</Label>
                            <Textarea
                              value={sub.short_description}
                              onChange={(e) => {
                                const value = e.target.value;
                                setLocalService((prev) => {
                                  const current =
                                    (((prev as any).explore?.subsections as ExploreSubsection[]) || []).slice();
                                  current[index] = { ...current[index], short_description: value };
                                  return {
                                    ...prev,
                                    explore: {
                                      title: (prev as any).explore?.title || "",
                                      subsections: current,
                                    },
                                  };
                                });
                              }}
                              rows={2}
                              placeholder="Short summary shown under the subsection title"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Description</Label>
                            <Textarea
                              value={sub.description}
                              onChange={(e) => {
                                const value = e.target.value;
                                setLocalService((prev) => {
                                  const current =
                                    (((prev as any).explore?.subsections as ExploreSubsection[]) || []).slice();
                                  current[index] = { ...current[index], description: value };
                                  return {
                                    ...prev,
                                    explore: {
                                      title: (prev as any).explore?.title || "",
                                      subsections: current,
                                    },
                                  };
                                });
                              }}
                              rows={4}
                              placeholder="Full subsection description"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Images Upload (multiple)</Label>
                              <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  if (files.length === 0) return;
                                  setLocalService((prev) => {
                                    const current =
                                      (((prev as any).explore?.subsections as ExploreSubsection[]) || []).slice();
                                    const prevImages = current[index]?.images || [];
                                    current[index] = {
                                      ...current[index],
                                      images: [...prevImages, ...files],
                                    };
                                    return {
                                      ...prev,
                                      explore: {
                                        title: (prev as any).explore?.title || "",
                                        subsections: current,
                                      },
                                    };
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Add Image URL (optional)</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={exploreImageUrlDrafts[index] || ""}
                                  onChange={(e) =>
                                    setExploreImageUrlDrafts((prev) => ({
                                      ...prev,
                                      [index]: e.target.value,
                                    }))
                                  }
                                  placeholder="https://example.com/image.jpg"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    const url = (exploreImageUrlDrafts[index] || "").trim();
                                    if (!url) return;
                                    setLocalService((prev) => {
                                      const current =
                                        (((prev as any).explore?.subsections as ExploreSubsection[]) || []).slice();
                                      const prevImages = current[index]?.images || [];
                                      current[index] = {
                                        ...current[index],
                                        images: [...prevImages, url],
                                      };
                                      return {
                                        ...prev,
                                        explore: {
                                          title: (prev as any).explore?.title || "",
                                          subsections: current,
                                        },
                                      };
                                    });
                                    setExploreImageUrlDrafts((prev) => ({ ...prev, [index]: "" }));
                                  }}
                                >
                                  Add
                                </Button>
                              </div>
                            </div>
                          </div>

                          {(sub.images?.length || 0) > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {sub.images.map((img, imgIdx) => {
                                const src =
                                  img instanceof File
                                    ? URL.createObjectURL(img)
                                    : typeof img === "string" && img
                                      ? img
                                      : "";
                                return (
                                  <div key={imgIdx} className="relative">
                                    <img
                                      src={src}
                                      alt="Preview"
                                      className="w-24 h-16 object-cover rounded border"
                                      onError={(e) => (e.currentTarget.style.display = "none")}
                                    />
                                    <button
                                      type="button"
                                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white text-xs"
                                      onClick={() => {
                                        setLocalService((prev) => {
                                          const current =
                                            (((prev as any).explore?.subsections as ExploreSubsection[]) || []).slice();
                                          const images = (current[index]?.images || []).filter(
                                            (_, i) => i !== imgIdx
                                          );
                                          current[index] = { ...current[index], images };
                                          return {
                                            ...prev,
                                            explore: {
                                              title: (prev as any).explore?.title || "",
                                              subsections: current,
                                            },
                                          };
                                        });
                                      }}
                                    >
                                      ×
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div>
                            <Label className="text-xs">Technicals (comma-separated)</Label>
                            <Input
                              value={
                                exploreTechnologiesDrafts[index] ??
                                (sub.technologies || []).join(", ")
                              }
                              onChange={(e) => {
                                const raw = e.target.value;
                                setExploreTechnologiesDrafts((prev) => ({
                                  ...prev,
                                  [index]: raw,
                                }));

                                const list = raw
                                  .split(",")
                                  .map((v) => v.trim())
                                  .filter(Boolean);

                                setLocalService((prev) => {
                                  const current =
                                    (((prev as any).explore?.subsections as ExploreSubsection[]) || []).slice();
                                  current[index] = { ...current[index], technologies: list };
                                  return {
                                    ...prev,
                                    explore: {
                                      title: (prev as any).explore?.title || "",
                                      subsections: current,
                                    },
                                  };
                                });
                              }}
                              placeholder="Point Cloud, Classification, QA"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Team Members (optional)</Label>
                            <div className="max-h-40 overflow-auto border rounded-md p-2 space-y-2">
                              {teamMembers.map((member) => {
                                const checked = (sub.developers || []).includes(Number(member.id));
                                return (
                                  <div key={member.id} className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) => {
                                        const next = new Set(sub.developers || []);
                                        if (e.target.checked) next.add(Number(member.id));
                                        else next.delete(Number(member.id));

                                        setLocalService((prev) => {
                                          const current =
                                            (((prev as any).explore?.subsections as ExploreSubsection[]) || []).slice();
                                          current[index] = {
                                            ...current[index],
                                            developers: Array.from(next),
                                          };
                                          return {
                                            ...prev,
                                            explore: {
                                              title: (prev as any).explore?.title || "",
                                              subsections: current,
                                            },
                                          };
                                        });
                                      }}
                                      className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">{member.name} - {member.role}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Subsection Use Cases (optional)</Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setLocalService((prev) => {
                                    const current =
                                      (((prev as any).explore?.subsections as ExploreSubsection[]) || []).slice();
                                    const prevUC = current[index]?.use_cases || [];
                                    current[index] = {
                                      ...current[index],
                                      use_cases: [
                                        ...prevUC,
                                        {
                                          title: "",
                                          description: "",
                                          image: "",
                                          layout:
                                            (prevUC.length || 0) % 2 === 0 ? "image_left" : "image_right",
                                        },
                                      ],
                                    };
                                    return {
                                      ...prev,
                                      explore: {
                                        title: (prev as any).explore?.title || "",
                                        subsections: current,
                                      },
                                    };
                                  });
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" /> Add
                              </Button>
                            </div>

                            {(sub.use_cases || []).length > 0 && (
                              <div className="space-y-3 mt-2">
                                {(sub.use_cases || []).map((uc, ucIdx) => (
                                  <Card key={ucIdx} className="p-3 border border-gray-200">
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="text-sm font-medium">Use Case #{ucIdx + 1}</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600"
                                        onClick={() => {
                                          setLocalService((prev) => {
                                            const current =
                                              (((prev as any).explore?.subsections as ExploreSubsection[]) || []).slice();
                                            const ucList = (current[index]?.use_cases || []).filter(
                                              (_, i) => i !== ucIdx
                                            );
                                            current[index] = { ...current[index], use_cases: ucList };
                                            return {
                                              ...prev,
                                              explore: {
                                                title: (prev as any).explore?.title || "",
                                                subsections: current,
                                              },
                                            };
                                          });
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      <div>
                                        <Label className="text-[11px]">Title</Label>
                                        <Input
                                          value={uc.title}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            setLocalService((prev) => {
                                              const current =
                                                (((prev as any).explore?.subsections as ExploreSubsection[]) || []).slice();
                                              const ucList = (current[index]?.use_cases || []).slice();
                                              ucList[ucIdx] = { ...ucList[ucIdx], title: value };
                                              current[index] = { ...current[index], use_cases: ucList };
                                              return {
                                                ...prev,
                                                explore: {
                                                  title: (prev as any).explore?.title || "",
                                                  subsections: current,
                                                },
                                              };
                                            });
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-[11px]">Layout</Label>
                                        <select
                                          value={uc.layout || "image_left"}
                                          onChange={(e) => {
                                            const value = e.target.value as "image_left" | "image_right";
                                            setLocalService((prev) => {
                                              const current =
                                                (((prev as any).explore?.subsections as ExploreSubsection[]) || []).slice();
                                              const ucList = (current[index]?.use_cases || []).slice();
                                              ucList[ucIdx] = { ...ucList[ucIdx], layout: value };
                                              current[index] = { ...current[index], use_cases: ucList };
                                              return {
                                                ...prev,
                                                explore: {
                                                  title: (prev as any).explore?.title || "",
                                                  subsections: current,
                                                },
                                              };
                                            });
                                          }}
                                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                          <option value="image_left">Left Image | Right Text</option>
                                          <option value="image_right">Right Image | Left Text</option>
                                        </select>
                                      </div>
                                    </div>

                                    <div className="mt-2">
                                      <Label className="text-[11px]">Description</Label>
                                      <Textarea
                                        rows={2}
                                        value={uc.description}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setLocalService((prev) => {
                                            const current =
                                              (((prev as any).explore?.subsections as ExploreSubsection[]) || []).slice();
                                            const ucList = (current[index]?.use_cases || []).slice();
                                            ucList[ucIdx] = { ...ucList[ucIdx], description: value };
                                            current[index] = { ...current[index], use_cases: ucList };
                                            return {
                                              ...prev,
                                              explore: {
                                                title: (prev as any).explore?.title || "",
                                                subsections: current,
                                              },
                                            };
                                          });
                                        }}
                                      />
                                    </div>

                                    <div className="mt-2">
                                      <Label className="text-[11px]">Image URL</Label>
                                      <Input
                                        value={typeof uc.image === "string" ? uc.image : ""}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setLocalService((prev) => {
                                            const current =
                                              (((prev as any).explore?.subsections as ExploreSubsection[]) || []).slice();
                                            const ucList = (current[index]?.use_cases || []).slice();
                                            ucList[ucIdx] = { ...ucList[ucIdx], image: value };
                                            current[index] = { ...current[index], use_cases: ucList };
                                            return {
                                              ...prev,
                                              explore: {
                                                title: (prev as any).explore?.title || "",
                                                subsections: current,
                                              },
                                            };
                                          });
                                        }}
                                        placeholder="https://example.com/image.jpg"
                                      />
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  )}

                  {((((localService as any).explore?.subsections as ExploreSubsection[]) || []).length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-8 border border-dashed rounded-lg">
                      Explore is optional. Add a subsection to enable the Explore box on the GIS service page.
                    </p>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>

          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!localService.id || !localService.title || !localService.description}
              className="bg-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEdit ? `Update ${entityName}` : `Add ${entityName}`}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Employee Modal Component
const EmployeeModal = ({
  isOpen,
  onClose,
  employee,
  onSave,
  isEdit = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  employee: Partial<EmployeeForm>;
  onSave: (employee: Partial<EmployeeForm>) => void;
  isEdit?: boolean;
}) => {
  const [localEmployee, setLocalEmployee] = useState<Partial<EmployeeForm>>(() => ({
    login_id: "",
    email: "",
    phone: "",
    employee_id: "",
    name: "",
    designation: "",
    password: "", // admin can assign password
    profile_pic: null,
    location: "",
    employment_type: "",
    qualification: "",
    documents: null,
    status: "active",
    ...employee,
  }));

  // toggle visibility of the password field
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loginId = typeof employee.login_id === "string" ? employee.login_id : "";
    const email =
      typeof employee.email === "string"
        ? employee.email
        : loginId.includes("@")
          ? loginId
          : "";
    const phone =
      typeof employee.phone === "string"
        ? employee.phone
        : loginId && !loginId.includes("@")
          ? loginId
          : "";

    setLocalEmployee({
      login_id: loginId || email || phone,
      email,
      phone,
      employee_id: "",
      name: "",
      designation: "",
      password: "",
      profile_pic: null,
      location: "",
      employment_type: "",
      qualification: "",
      documents: null,
      status: "active",
      ...employee,
    });
  }, [employee]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localEmployee);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "profile_pic" | "documents"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setLocalEmployee((prev) => ({
        ...prev,
        [field]: file,
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {isEdit ? "Edit Employee" : "Add Employee"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-24 h-24 mb-4">
              {localEmployee.profile_pic ? (
                <img
                  src={
                    localEmployee.profile_pic instanceof File
                      ? URL.createObjectURL(localEmployee.profile_pic)
                      : resolveMediaUrl(localEmployee.profile_pic) || "/brand/avatar.svg"
                  }
                  alt="Profile preview"
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="profile-pic-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {localEmployee.profile_pic ? "Change Photo" : "Upload Photo"}
                  </span>
                </Button>
              </Label>
              <Input
                id="profile-pic-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "profile_pic")}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <Input
                value={localEmployee.email || ""}
                onChange={(e) => {
                  const email = e.target.value;
                  setLocalEmployee({
                    ...localEmployee,
                    email,
                    login_id: email || localEmployee.phone || localEmployee.login_id,
                  });
                }}
                placeholder="name@company.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Phone *</Label>
              <Input
                value={localEmployee.phone || ""}
                onChange={(e) => {
                  const phone = e.target.value;
                  setLocalEmployee({
                    ...localEmployee,
                    phone,
                    login_id: localEmployee.email || phone || localEmployee.login_id,
                  });
                }}
                placeholder="+91 9876543210"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Employee ID *</Label>
              <Input
                value={localEmployee.employee_id || ""}
                onChange={(e) =>
                  setLocalEmployee({ ...localEmployee, employee_id: e.target.value })
                }
                placeholder="DI10001"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Full Name *</Label>
              <Input
                value={localEmployee.name || ""}
                onChange={(e) =>
                  setLocalEmployee({ ...localEmployee, name: e.target.value })
                }
                placeholder="John Doe"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Designation *</Label>
              <div>
                <input
                  list="designation-options"
                  value={localEmployee.designation || ""}
                  onChange={(e) =>
                    setLocalEmployee({ ...localEmployee, designation: e.target.value })
                  }
                  placeholder="Type or select designation"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                />
                <datalist id="designation-options">
                  {employeeDesignations.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* password input for admin to set/override */}
            <div>
              <Label className="text-sm font-medium">Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={localEmployee.password || ""}
                  onChange={(e) =>
                    setLocalEmployee({ ...localEmployee, password: e.target.value })
                  }
                  placeholder="Set employee password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to keep unchanged when editing
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Location</Label>
              <Input
                value={localEmployee.location || ""}
                onChange={(e) =>
                  setLocalEmployee({ ...localEmployee, location: e.target.value })
                }
                placeholder="Remote-first"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Employment Type</Label>
              <select
                value={localEmployee.employment_type || ""}
                onChange={(e) =>
                  setLocalEmployee({ ...localEmployee, employment_type: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              >
                <option value="">Select type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Intern">Intern</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <select
                value={localEmployee.status}
                onChange={(e) =>
                  setLocalEmployee({ ...localEmployee, status: e.target.value as "active" | "inactive" })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Qualification</Label>
            <Textarea
              value={localEmployee.qualification || ""}
              onChange={(e) =>
                setLocalEmployee({ ...localEmployee, qualification: e.target.value })
              }
              placeholder="B.Tech in Computer Science, MBA, etc."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Documents (Resume, ID proof, etc.)</Label>
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={(e) => handleFileUpload(e, "documents")}
              className="h-10 mt-1"
            />
            {localEmployee.documents instanceof File && (
              <p className="text-xs text-green-600 mt-1">
                Selected: {localEmployee.documents.name}
              </p>
            )}
            {typeof localEmployee.documents === "string" && localEmployee.documents && (
              <p className="text-xs text-gray-600 mt-1">
                Current file: {localEmployee.documents}
              </p>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!localEmployee.login_id || !localEmployee.employee_id || !localEmployee.name || !localEmployee.designation}
            className="bg-primary"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? "Update Employee" : "Add Employee"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const EmployeeDetailsModal = ({
  isOpen,
  onClose,
  employee,
  leaveRequests,
  overtimeRequests,
  employeeDocuments,
  projects,
  onFetchProjectById,
  onResetPassword,
}: {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  leaveRequests: LeaveRequest[];
  overtimeRequests: OvertimeRequest[];
  employeeDocuments: EmployeeDocument[];
  projects: Project[];
  onFetchProjectById: (projectId: string) => Promise<Project | null>;
  onResetPassword: (employeeId: string, newPassword: string) => Promise<void>;
}) => {
  const [tab, setTab] = useState<"profile" | "leaves" | "overtime" | "documents" | "project" | "security">(
    "profile"
  );
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(false);
  const [tickets, setTickets] = useState<
    { id: string; title: string; description: string; priority: "low" | "medium" | "high"; status: "open" | "in_progress" | "closed"; created_at: string }[]
  >([]);
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketPriority, setTicketPriority] = useState<"low" | "medium" | "high">("medium");

  useEffect(() => {
    if (!isOpen) return;
    setTab("profile");
    setNewPassword("");
    setShowNewPassword(false);
    setResettingPassword(false);
    setCurrentProject(null);
    setIsProjectLoading(false);
    setTickets([]);
    setTicketTitle("");
    setTicketDescription("");
    setTicketPriority("medium");
  }, [isOpen, employee?.id]);

  useEffect(() => {
    const rawProject =
      (employee as any)?.current_project_id ??
      (employee as any)?.current_project?.id ??
      (employee as any)?.current_project;
    const projectId = rawProject ? String(rawProject) : "";
    if (!isOpen || !projectId) return;

    const existing = projects.find((p) => String(p.id) === projectId) || null;
    if (existing) setCurrentProject(existing);

    let cancelled = false;
    setIsProjectLoading(true);
    onFetchProjectById(projectId)
      .then((p) => {
        if (cancelled) return;
        if (p) setCurrentProject(p);
      })
      .finally(() => {
        if (cancelled) return;
        setIsProjectLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [employee, isOpen, onFetchProjectById, projects]);

  const empKey = employee ? String(employee.id) : "";
  const rawProject =
    (employee as any)?.current_project_id ??
    (employee as any)?.current_project?.id ??
    (employee as any)?.current_project;
  const projectId = rawProject ? String(rawProject) : "";
  const ticketsStorageKey = "nilaya_admin_project_tickets_v1";
  const ticketsKey = `${empKey}:${projectId || "none"}`;

  useEffect(() => {
    if (!isOpen || !employee) return;
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(ticketsStorageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      const list = Array.isArray(parsed?.[ticketsKey]) ? parsed[ticketsKey] : [];
      setTickets(list);
    } catch {
      setTickets([]);
    }
  }, [isOpen, employee?.id, ticketsKey]);

  if (!isOpen || !employee) return null;
  const empLeaves = leaveRequests
    .filter((l) => String(l.employee) === empKey)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  const empOvertime = overtimeRequests
    .filter((o) => String(o.employee) === empKey)
    .filter((o) => String(o.employee) === empKey)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  const empDocs = employeeDocuments
    .filter((d) => String(d.employee) === empKey)
    .sort((a, b) => (a.uploaded_at < b.uploaded_at ? 1 : -1));

  const resolvedEmail =
    employee.email || (employee.login_id && employee.login_id.includes("@") ? employee.login_id : "");
  const resolvedPhone =
    employee.phone || (employee.login_id && !employee.login_id.includes("@") ? employee.login_id : "");

  const persistTickets = (
    nextTickets: { id: string; title: string; description: string; priority: "low" | "medium" | "high"; status: "open" | "in_progress" | "closed"; created_at: string }[]
  ) => {
    setTickets(nextTickets);
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(ticketsStorageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed[ticketsKey] = nextTickets;
      window.localStorage.setItem(ticketsStorageKey, JSON.stringify(parsed));
    } catch {}
  };

  const addTicket = () => {
    if (!ticketTitle.trim()) return;
    const id =
      typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function"
        ? (crypto as any).randomUUID()
        : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const next = [
      {
        id,
        title: ticketTitle.trim(),
        description: ticketDescription.trim(),
        priority: ticketPriority,
        status: "open" as const,
        created_at: new Date().toISOString(),
      },
      ...tickets,
    ];
    persistTickets(next);
    setTicketTitle("");
    setTicketDescription("");
    setTicketPriority("medium");
  };

  const doResetPassword = async () => {
    if (!newPassword.trim()) return;
    setResettingPassword(true);
    try {
      await onResetPassword(employee.id, newPassword.trim());
      setNewPassword("");
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate">{employee.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="text-xs font-mono">
                {employee.employee_id}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {employee.designation}
              </Badge>
              <Badge
                className={`text-xs ${employee.status === "active" ? "bg-green-500" : "bg-gray-500"}`}
              >
                {employee.status}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Leaves: {empLeaves.length}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Overtime: {empOvertime.length}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Docs: {empDocs.length}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="leaves">Leaves</TabsTrigger>
              <TabsTrigger value="overtime">Overtime</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="project">Project</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <div className="relative w-28 h-28">
                        {employee.profile_pic ? (
                          <img
                            src={
                              withCacheBuster(
                                resolveMediaUrl(employee.profile_pic) || "/brand/avatar.svg",
                                employee.updated_at || employee.id
                              )
                            }
                            alt={employee.name}
                            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                          />
                        ) : (
                          <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <p className="text-lg font-semibold mt-4">{employee.name}</p>
                      <p className="text-sm text-gray-600">{employee.designation}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Employee Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Employee ID</p>
                        <p className="text-sm font-semibold mt-1">{employee.employee_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Login ID</p>
                        <p className="text-sm font-semibold mt-1">{employee.login_id || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-semibold mt-1">{resolvedEmail || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-semibold mt-1">{resolvedPhone || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Employment Type</p>
                        <p className="text-sm font-semibold mt-1">{employee.employment_type || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-semibold mt-1">{employee.location || "-"}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-500">Qualification</p>
                        <p className="text-sm font-semibold mt-1">{employee.qualification || "-"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="leaves" className="mt-6">
              <Card className="bg-white border-gray-100 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">Leave Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {empLeaves.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No leave requests</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-b">
                          <tr>
                            <th className="text-left p-3 text-xs font-semibold">Dates</th>
                            <th className="text-left p-3 text-xs font-semibold">Days</th>
                            <th className="text-left p-3 text-xs font-semibold">Reason</th>
                            <th className="text-left p-3 text-xs font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {empLeaves.map((l) => (
                            <tr key={l.id} className="border-b hover:bg-blue-50/50">
                              <td className="p-3 text-sm">
                                {l.start_date} → {l.end_date}
                              </td>
                              <td className="p-3 text-sm font-mono">
                                {l.total_days || l.days_count || "-"}
                              </td>
                              <td className="p-3 text-sm max-w-[420px]">
                                <div className="truncate">{l.reason}</div>
                                {l.status === "rejected" && l.rejection_reason && (
                                  <div className="text-xs text-red-600 mt-1 truncate">
                                    {l.rejection_reason}
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <Badge
                                  className={`text-xs ${
                                    l.status === "approved"
                                      ? "bg-green-500"
                                      : l.status === "rejected"
                                        ? "bg-red-500"
                                        : "bg-yellow-500"
                                  }`}
                                >
                                  {l.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overtime" className="mt-6">
              <Card className="bg-white border-gray-100 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">Overtime Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {empOvertime.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No overtime requests</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-b">
                          <tr>
                            <th className="text-left p-3 text-xs font-semibold">Date</th>
                            <th className="text-left p-3 text-xs font-semibold">Hours</th>
                            <th className="text-left p-3 text-xs font-semibold">Reason</th>
                            <th className="text-left p-3 text-xs font-semibold">Extra Pay</th>
                            <th className="text-left p-3 text-xs font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {empOvertime.map((o) => (
                            <tr key={o.id} className="border-b hover:bg-blue-50/50">
                              <td className="p-3 text-sm">
                                {new Date(o.date).toLocaleDateString()}
                              </td>
                              <td className="p-3 text-sm font-mono">{o.hours}</td>
                              <td className="p-3 text-sm max-w-[420px]">
                                <div className="truncate">{o.reason}</div>
                                {o.status === "rejected" && o.rejection_reason && (
                                  <div className="text-xs text-red-600 mt-1 truncate">
                                    {o.rejection_reason}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-sm font-mono">
                                {typeof o.extra_pay === "number" ? `₹${o.extra_pay}` : "-"}
                              </td>
                              <td className="p-3">
                                <Badge
                                  className={`text-xs ${
                                    o.status === "approved"
                                      ? "bg-green-500"
                                      : o.status === "rejected"
                                        ? "bg-red-500"
                                        : "bg-yellow-500"
                                  }`}
                                >
                                  {o.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <Card className="bg-white border-gray-100 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {empDocs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No documents submitted</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {empDocs.map((d) => (
                        <Card key={d.id} className="p-4 border shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">{d.title}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(d.uploaded_at).toLocaleDateString()}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge
                                  className={`text-xs ${
                                    (d.status || "pending") === "verified"
                                      ? "bg-green-500"
                                      : (d.status || "pending") === "rejected"
                                        ? "bg-red-500"
                                        : "bg-yellow-500"
                                  }`}
                                >
                                  {d.status || "pending"}
                                </Badge>
                                {d.document_type && (
                                  <Badge variant="outline" className="text-xs">
                                    {d.document_type}
                                  </Badge>
                                )}
                              </div>
                              {d.description && (
                                <p className="text-xs text-gray-600 mt-2 line-clamp-3">{d.description}</p>
                              )}
                              {(d.status || "pending") === "rejected" && d.rejection_reason && (
                                <p className="text-xs text-red-600 mt-2 line-clamp-2">
                                  {d.rejection_reason}
                                </p>
                              )}
                            </div>
                            <a
                              href={d.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </a>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="project" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-white border-gray-100 shadow-md lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-700">Private Project</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isProjectLoading ? (
                      <div className="text-sm text-gray-600">Loading project...</div>
                    ) : currentProject ? (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-lg font-bold truncate">{currentProject.title}</div>
                            <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {currentProject.shortDescription || "-"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            <Badge variant="outline" className="text-xs font-mono">
                              {currentProject.id}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {currentProject.status}
                            </Badge>
                          </div>
                        </div>

                        {(currentProject.description || currentProject.details) && (
                          <div className="grid grid-cols-1 gap-4">
                            {currentProject.description && (
                              <div>
                                <div className="text-xs text-gray-500">Description</div>
                                <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                                  {currentProject.description}
                                </div>
                              </div>
                            )}
                            {currentProject.details && (
                              <div>
                                <div className="text-xs text-gray-500">Details</div>
                                <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                                  {currentProject.details}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-500">Timeline</div>
                            <div className="text-sm font-semibold mt-1">{currentProject.timeline || "-"}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Client</div>
                            <div className="text-sm font-semibold mt-1">{currentProject.client || "-"}</div>
                          </div>
                          <div className="md:col-span-2">
                            <div className="text-xs text-gray-500">Team</div>
                            <div className="text-sm font-semibold mt-1">{currentProject.team || "-"}</div>
                          </div>
                          <div className="md:col-span-2">
                            <div className="text-xs text-gray-500">Technologies</div>
                            <div className="text-sm font-semibold mt-1">
                              {Array.isArray(currentProject.technologies)
                                ? currentProject.technologies.join(", ")
                                : currentProject.technologies || "-"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">No current project assigned.</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-100 shadow-md lg:col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-700">Upcoming Work</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isProjectLoading ? (
                      <div className="text-sm text-gray-600">Loading...</div>
                    ) : currentProject ? (
                      <>
                        <div>
                          <div className="text-xs text-gray-500">Working Days</div>
                          <div className="text-sm font-semibold mt-1">
                            {(currentProject.stats as any)?.working_days || "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Spare Till Date</div>
                          <div className="text-sm font-semibold mt-1">
                            {(currentProject.stats as any)?.spare_till_date || "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Rejoin Note</div>
                          <div className="text-sm font-semibold mt-1">
                            {(currentProject.stats as any)?.rejoin_note || "-"}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-600">No upcoming work.</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-700">Tickets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!projectId ? (
                      <div className="text-sm text-gray-600">Assign a project to start ticketing.</div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label className="text-xs">Title</Label>
                            <Input
                              value={ticketTitle}
                              onChange={(e) => setTicketTitle(e.target.value)}
                              className="h-9 text-sm mt-1"
                              placeholder="Ticket title"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Description</Label>
                            <Textarea
                              value={ticketDescription}
                              onChange={(e) => setTicketDescription(e.target.value)}
                              className="text-sm mt-1"
                              rows={3}
                              placeholder="Describe the task / issue"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3 items-end">
                            <div>
                              <Label className="text-xs">Priority</Label>
                              <select
                                value={ticketPriority}
                                onChange={(e) => setTicketPriority(e.target.value as any)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </div>
                            <Button onClick={addTicket} className="h-9">
                              <Plus className="w-4 h-4 mr-2" />
                              Add
                            </Button>
                          </div>
                        </div>

                        <div className="border-t pt-4 space-y-2">
                          {tickets.length === 0 ? (
                            <div className="text-sm text-gray-600">No tickets yet.</div>
                          ) : (
                            tickets.map((t) => (
                              <div key={t.id} className="border rounded-lg p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold truncate">{t.title}</div>
                                    {t.description && (
                                      <div className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                                        {t.description}
                                      </div>
                                    )}
                                    <div className="text-[11px] text-gray-500 mt-2">
                                      {new Date(t.created_at).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap justify-end">
                                    <Badge
                                      className={`text-xs ${
                                        t.priority === "high"
                                          ? "bg-red-500"
                                          : t.priority === "low"
                                          ? "bg-gray-500"
                                          : "bg-yellow-500"
                                      }`}
                                    >
                                      {t.priority}
                                    </Badge>
                                    <select
                                      value={t.status}
                                      onChange={(e) => {
                                        const next = tickets.map((x) =>
                                          x.id === t.id ? { ...x, status: e.target.value as any } : x
                                        );
                                        persistTickets(next);
                                      }}
                                      className="h-8 text-xs rounded-md border border-input bg-background px-2"
                                    >
                                      <option value="open">Open</option>
                                      <option value="in_progress">In Progress</option>
                                      <option value="closed">Closed</option>
                                    </select>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        const next = tickets.filter((x) => x.id !== t.id);
                                        persistTickets(next);
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-700">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(() => {
                      const items: { type: string; at: string; label: string; status?: string }[] = [];
                      empLeaves.forEach((l) =>
                        items.push({
                          type: "Leave",
                          at: l.created_at,
                          label: `${l.leave_type} (${l.start_date} → ${l.end_date})`,
                          status: l.status,
                        })
                      );
                      empOvertime.forEach((o) =>
                        items.push({
                          type: "Overtime",
                          at: o.created_at,
                          label: `${o.date} • ${o.hours}h`,
                          status: o.status,
                        })
                      );
                      empDocs.forEach((d) =>
                        items.push({
                          type: "Document",
                          at: d.uploaded_at,
                          label: d.title,
                          status: d.status || "pending",
                        })
                      );
                      const sorted = items
                        .map((i) => ({ ...i, ts: new Date(i.at).getTime() }))
                        .filter((i) => !Number.isNaN(i.ts))
                        .sort((a, b) => b.ts - a.ts)
                        .slice(0, 10);
                      if (sorted.length === 0) {
                        return <div className="text-sm text-gray-600">No activity found.</div>;
                      }
                      return (
                        <div className="space-y-2">
                          {sorted.map((i) => (
                            <div key={`${i.type}_${i.at}_${i.label}`} className="border rounded-lg p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-xs text-gray-500">{new Date(i.at).toLocaleString()}</div>
                                  <div className="text-sm font-semibold mt-1">
                                    {i.type}: <span className="font-medium">{i.label}</span>
                                  </div>
                                </div>
                                {i.status && (
                                  <Badge
                                    className={`text-xs ${
                                      i.status === "approved" || i.status === "verified"
                                        ? "bg-green-500"
                                        : i.status === "rejected"
                                        ? "bg-red-500"
                                        : i.status === "in_progress"
                                        ? "bg-blue-500"
                                        : "bg-yellow-500"
                                    }`}
                                  >
                                    {i.status}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card className="bg-white border-gray-100 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Current password cannot be viewed. Set a new password below.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">New Password</Label>
                      <div className="relative mt-1">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      onClick={doResetPassword}
                      disabled={resettingPassword || !newPassword.trim()}
                      className="bg-primary"
                    >
                      {resettingPassword ? "Saving..." : "Reset Password"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("team");
  const router = useRouter();
  const auth = useAuth();
  const [user, setUser] = useState<{ username?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [blogCount, setBlogCount] = useState(0);
  const [blogDraftCount, setBlogDraftCount] = useState(0);

  useEffect(() => {
    if (auth.loading) return;
    const token = localStorage.getItem("access") || localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    if ((auth as any)?.user && (auth as any).user.employee_id) {
      router.replace("/employee/dashboard");
    }
  }, [auth, router]);

  useEffect(() => {
    const sync = () => {
      const blogs = loadAdminBlogs();
      setBlogCount(blogs.length);
      setBlogDraftCount(blogs.filter((b) => b.status === "draft").length);
    };
    sync();

    window.addEventListener(BLOGS_UPDATED_EVENT, sync);
    return () => window.removeEventListener(BLOGS_UPDATED_EVENT, sync);
  }, []);

  // Team State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeam);
  const [teamSearch, setTeamSearch] = useState("");
  const [teamDeptFilter, setTeamDeptFilter] = useState("all");
  const [teamStatusFilter, setTeamStatusFilter] = useState("all");
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [isEditTeamMode, setIsEditTeamMode] = useState(false);

  // Projects State
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [employeeProjects, setEmployeeProjects] = useState<Project[]>([]);
  const [projectCreateScope, setProjectCreateScope] = useState<"public" | "current">("public");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectCategoryFilter, setProjectCategoryFilter] = useState("all");
  const [projectStatusFilter, setProjectStatusFilter] = useState("all");
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isAddBlogsModalOpen, setIsAddBlogsModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editedProject, setEditedProject] = useState<Partial<Project>>({});
  const [newProject, setNewProject] = useState<Partial<ProjectForm>>({
    title: "",
    shortDescription: "",
    description: "",
    category: "mobile",
    client: "",
    image: "",
    technologies: "",
    status: "planned",
    timeline: "",
    team: "",
    color: "from-blue-500 to-purple-600",
    featured: false,
    details: "",
    challenges: "",
    outcomes: "",
    stats: {},
    gallery: [],
    icon: "Briefcase",
    testimonial: undefined,
  });

  // Gallery State
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);
  const [isAddingGallery, setIsAddingGallery] = useState(false);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [editedGallery, setEditedGallery] = useState<Partial<GalleryItemForm>>({});
  const [gallerySearch, setGallerySearch] = useState("");
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState("all");
  const [isAddGalleryModalOpen, setIsAddGalleryModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [newGalleryItem, setNewGalleryItem] = useState<Partial<GalleryItemForm>>({
    title: "",
    description: "",
    category: "",
    image: null,
    created_at: "",
  });

  // Products State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    tagline: "",
    iconText: "",
    cover: "",
    gallery: [],
    description: "",
    fullDescription: "",
    features: [],
    outcomes: [],
    challenges: [],
    technologies: [],
    stats: [],
    liveUrl: "",
    status: "In Development",
    category: "education",
    platforms: [],
    integrations: [],
    support: [],
    documentationUrl: "",
    demoUrl: "",
    featured: false,
    sortOrder: 0,
  });
// ==================== GIS SERVICES FUNCTIONS (new) ====================
  const addGisService = async (
    serviceData: Partial<ServiceForm> & { explore?: ExploreSection }
  ) => {
    try {
      const normalized: Partial<ServiceForm> = { ...serviceData };

      if (normalized.use_cases) {
        normalized.use_cases = (await resolveUseCasesForSave(
          normalized.use_cases as any
        )) as any;
      }

      if ((normalized as any).explore) {
        (normalized as any).explore = await resolveExploreForSave(
          (normalized as any).explore
        );
      }

      const formData = new FormData();
      Object.entries(normalized).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (key === "image") {
          if (value instanceof File) {
            formData.append("image", value);
          }
          return;
        }

        if (key === "explore") {
          formData.append(key, JSON.stringify(value));
          return;
        }

        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      });

      const res = await auth.authFetch(`${API_URL}/api/gis-services/`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const created = await res.json();
        setGisServices((prev) => [...prev, created]);
        setIsAddGisServiceModalOpen(false);
        setNewGisService({
          id: "",
          title: "",
          description: "",
          image: "",
          long_description: "",
          features: [],
          benefits: [],
          technologies: [],
          developers: [],
          demo_video_url: "",
          status: "active",
          sort_order: 0,
          use_cases: [],
        });
        alert("GIS Service added successfully!");
      } else {
        const errorData = await res.json();
        console.error("Failed to add GIS service:", errorData);
        alert(`Failed to add GIS service: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error adding GIS service:", err);
      alert("Error adding GIS service. Please try again.");
    }
  };

  const updateGisService = async (
    id: string,
    updatedData: Partial<ServiceForm> & { explore?: ExploreSection }
  ) => {
    try {
      const normalized: Partial<ServiceForm> = { ...updatedData };

      if (normalized.use_cases) {
        normalized.use_cases = (await resolveUseCasesForSave(
          normalized.use_cases as any
        )) as any;
      }

      if ((normalized as any).explore) {
        (normalized as any).explore = await resolveExploreForSave(
          (normalized as any).explore
        );
      }

      const formData = new FormData();
      Object.entries(normalized).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (key === "image") {
          if (value instanceof File) {
            formData.append("image", value);
          }
          return;
        }

        if (key === "explore") {
          formData.append(key, JSON.stringify(value));
          return;
        }

        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      });

      const res = await auth.authFetch(`${API_URL}/api/gis-services/${id}/`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        const updated = await res.json();
        setGisServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
        setIsEditGisServiceModalOpen(false);
        setEditingGisService(null);
        alert("GIS Service updated successfully!");
      } else {
        const errorData = await res.json();
        console.error("Failed to update GIS service:", errorData);
        alert(`Failed to update GIS service: ${JSON.stringify(errorData)}`);
      }
    } catch (err) {
      console.error("Error updating GIS service:", err);
      alert("Error updating GIS service. Please try again.");
    }
  };

  // GIS Services State
  const [gisServices, setGisServices] = useState<GisService[]>(initialGisServices);
  const [gisServiceSearch, setGisServiceSearch] = useState("");
  const [gisServiceStatusFilter, setGisServiceStatusFilter] = useState("all");
  const [isAddGisServiceModalOpen, setIsAddGisServiceModalOpen] = useState(false);
  const [isEditGisServiceModalOpen, setIsEditGisServiceModalOpen] = useState(false);
  const [editingGisService, setEditingGisService] = useState<GisService | null>(null);
  const [newGisService, setNewGisService] = useState<
    Partial<ServiceForm> & { explore?: ExploreSection }
  >({
    id: "",
    title: "",
    description: "",
    image: "",
    long_description: "",
    features: [],
    benefits: [],
    technologies: [],
    developers: [],
    demo_video_url: "",
    status: "active",
    sort_order: 0,
    use_cases: [],
    explore: { title: "", subsections: [] },
  });

  // Services State
  const [services, setServices] = useState<Service[]>(initialServices);
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceStatusFilter, setServiceStatusFilter] = useState("all");
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState<
    Partial<ServiceForm> & { explore?: ExploreSection }
  >({
    id: "",
    title: "",
    description: "",
    image: "",
    long_description: "",
    features: [],
    benefits: [],
    technologies: [],
    developers: [],
    demo_video_url: "",
    status: "active",
    sort_order: 0,
    use_cases: [],
    explore: { title: "", subsections: [] },
  });

  // Testimonials State
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [testimonialSearch, setTestimonialSearch] = useState("");
  const [testimonialStatusFilter, setTestimonialStatusFilter] = useState("all");
  const [isAddTestimonialModalOpen, setIsAddTestimonialModalOpen] = useState(false);
  const [isEditTestimonialModalOpen, setIsEditTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [newTestimonial, setNewTestimonial] = useState<Partial<TestimonialForm>>({
    name: "",
    company: "",
    role: "",
    text: "",
    image: null,
    linkedin: "",
    status: "active",
    sort_order: 0,
  });

  // Employees State
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeDesignationFilter, setEmployeeDesignationFilter] = useState("all");
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState("all");
  const [currentProjectSearch, setCurrentProjectSearch] = useState("");
  const [currentProjectAssignmentFilter, setCurrentProjectAssignmentFilter] = useState<"all" | "assigned" | "unassigned">(
    "assigned"
  );
  const [currentProjectPlans, setCurrentProjectPlans] = useState<Record<string, any>>({});
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isEmployeeDetailsModalOpen, setIsEmployeeDetailsModalOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState<Partial<EmployeeForm>>({
    login_id: "",
    email: "",
    phone: "",
    employee_id: "",
    name: "",
    designation: "",
    password: "",
    profile_pic: null,
    location: "",
    employment_type: "",
    qualification: "",
    documents: null,
    status: "active",
  });

  // Leave Requests State
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveSearch, setLeaveSearch] = useState('');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('all');

  // Overtime Requests State
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([]);
  const [overtimeSearch, setOvertimeSearch] = useState('');
  const [overtimeStatusFilter, setOvertimeStatusFilter] = useState('all');

  // Employee Documents State
  const [employeeDocuments, setEmployeeDocuments] = useState<EmployeeDocument[]>([]);
  const [docSearch, setDocSearch] = useState('');
  const [docStatusFilter, setDocStatusFilter] = useState('all');

  // Employee Ticketing System State
  const [employeeTickets, setEmployeeTickets] = useState<EmployeeTicket[]>([]);
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState<"all" | EmployeeTicket["status"]>("all");
  const [ticketAssignmentFilter, setTicketAssignmentFilter] = useState<"all" | "assigned" | "unassigned">("all");
  const [newTicketEmployeeId, setNewTicketEmployeeId] = useState<string>("");
  const [newTicketTitle, setNewTicketTitle] = useState<string>("");
  const [newTicketDescription, setNewTicketDescription] = useState<string>("");
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [multiAssignTicketId, setMultiAssignTicketId] = useState<number | null>(null);
  const [multiAssignSelected, setMultiAssignSelected] = useState<Record<string, boolean>>({});
  const [multiAssignSearch, setMultiAssignSearch] = useState("");
  const [ticketCommentsTicketId, setTicketCommentsTicketId] = useState<number | null>(null);
  const [ticketComments, setTicketComments] = useState<any[]>([]);
  const [ticketCommentsLoading, setTicketCommentsLoading] = useState(false);
  const [ticketCommentDraft, setTicketCommentDraft] = useState("");
  const [ticketCommentLinkDraft, setTicketCommentLinkDraft] = useState("");
  const [ticketCommentFiles, setTicketCommentFiles] = useState<File[]>([]);
  const [ticketCommentSaving, setTicketCommentSaving] = useState(false);
  const [adminTicketNotifications, setAdminTicketNotifications] = useState<any[]>([]);
  const [latestTicketCommentsById, setLatestTicketCommentsById] = useState<Record<string, any[]>>({});

  const employeeLabelByKey = useMemo(() => {
    const map: Record<string, string> = {};
    employees.forEach((e: any) => {
      const id = e?.id != null ? String(e.id) : "";
      const code = (e as any)?.employee_id != null ? String((e as any).employee_id) : "";
      const name = cleanText((e as any)?.name) || cleanText((e as any)?.username) || cleanText((e as any)?.email) || "Employee";
      const label = `${name} (${code || id || "-"})`;
      if (id) map[id] = label;
      if (code) map[code] = label;
    });
    return map;
  }, [employees]);

  const toScalarKey = (value: any): string => {
    if (value === undefined || value === null) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (typeof value === "object") {
      const id =
        (value as any)?.id ??
        (value as any)?.employee_id ??
        (value as any)?.employeeId ??
        (value as any)?.employee_code ??
        (value as any)?.pk ??
        (value as any)?.employee;
      return id === undefined || id === null ? "" : String(id);
    }
    return "";
  };

  const extractIdList = (value: any): string[] => {
    const out: string[] = [];

    const pushId = (v: any) => {
      const s = cleanText(v);
      if (s) out.push(s);
    };

    if (value == null) return out;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item == null) return;
        if (typeof item === "object") {
          pushId((item as any)?.id ?? (item as any)?.employee_id ?? (item as any)?.employeeId ?? (item as any)?.employee);
          return;
        }
        pushId(item);
      });
    } else if (typeof value === "object") {
      pushId((value as any)?.id ?? (value as any)?.employee_id ?? (value as any)?.employeeId ?? (value as any)?.employee);
    } else {
      pushId(value);
    }

    return Array.from(new Set(out));
  };

  const extractNameList = (value: any): string[] => {
    const out: string[] = [];
    const pushName = (v: any) => {
      const s = cleanText(v);
      if (s) out.push(s);
    };

    if (value == null) return out;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item == null) return;
        if (typeof item === "object") {
          pushName((item as any)?.name ?? (item as any)?.employee_name ?? (item as any)?.label);
          return;
        }
        pushName(item);
      });
    } else if (typeof value === "object") {
      pushName((value as any)?.name ?? (value as any)?.employee_name ?? (value as any)?.label);
    } else {
      pushName(value);
    }

    return Array.from(new Set(out));
  };

  const getTicketAssigneeIds = (t: any): string[] => {
    const direct =
      (t as any)?.assigned_to_ids ??
      (t as any)?.assignees ??
      (t as any)?.assigned_to_id ??
      (t as any)?.assigned_to ??
      (t as any)?.Reassigned_to ??
      (t as any)?.reassigned_to;
    return extractIdList(direct);
  };

  const getTicketAssigneeLabel = (t: any): string => {
    const ids = getTicketAssigneeIds(t);
    const assignedRaw =
      (t as any)?.assigned_to ??
      (t as any)?.assignees ??
      (t as any)?.assigned_to_ids ??
      (t as any)?.assigned_to_id;
    const embeddedNames = extractNameList(assignedRaw);

    const labels =
      ids.length > 0
        ? ids.map((id) => employeeLabelByKey[id] || (id ? `Employee #${id}` : "")).filter(Boolean)
        : embeddedNames;

    return labels.length > 0 ? labels.join(", ") : "Unassigned";
  };

  const normalizeTicketStatusKey = (value: any): string => {
    const raw = cleanText(value).toLowerCase();
    if (!raw) return "";
    return raw.replace(/_/g, "-");
  };

  const normalizeTicketCommentsList = (raw: any): any[] => {
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
          cleanText((c as any).text) ||
          cleanText((c as any).comment) ||
          cleanText((c as any).message) ||
          cleanText((c as any).body) ||
          "";
        if (!text) return null;
        const authorKey =
          cleanText((c as any)?.created_by?.id) ||
          cleanText((c as any)?.created_by?.employee_id) ||
          cleanText((c as any)?.author?.id) ||
          cleanText((c as any)?.employee) ||
          cleanText((c as any)?.employee_id) ||
          "";
        const authorLabel =
          cleanText((c as any)?.created_by?.name) ||
          cleanText((c as any)?.created_by?.username) ||
          cleanText((c as any)?.author?.name) ||
          cleanText((c as any)?.author?.email) ||
          cleanText((c as any)?.employee_name) ||
          (authorKey ? employeeLabelByKey[authorKey] || `Employee #${authorKey}` : "") ||
          "";
        const authorFinal = authorLabel.trim().toLowerCase() === "admin" ? "Admin" : authorLabel;
        const createdAt = (c as any).created_at ?? (c as any).createdAt ?? (c as any).created_on ?? (c as any).createdOn ?? null;
        const id = (c as any).id ?? (c as any).pk ?? `${idx}`;
        const links = Array.isArray((c as any).links) ? (c as any).links : [];
        const attachments = Array.isArray((c as any).attachments) ? (c as any).attachments : [];
        return { id, text, author: authorFinal || "Unknown", created_at: createdAt, links, attachments };
      })
      .filter(Boolean);
  };

  const multiAssignTicket = useMemo(() => {
    if (!multiAssignTicketId) return null;
    const target = Number(multiAssignTicketId);
    if (!Number.isFinite(target) || target <= 0) return null;
    return (
      employeeTickets.find((t: any) => {
        const raw = (t as any)?.id ?? (t as any)?.ticket_id ?? (t as any)?.ticketId ?? (t as any)?.ticket?.id;
        const n = Number(cleanText(raw) || raw);
        return Number.isFinite(n) && n === target;
      }) || null
    );
  }, [employeeTickets, multiAssignTicketId]);

  const ticketCommentsTicket = useMemo(() => {
    if (!ticketCommentsTicketId) return null;
    const target = Number(ticketCommentsTicketId);
    if (!Number.isFinite(target) || target <= 0) return null;
    return (
      employeeTickets.find((t: any) => {
        const raw = (t as any)?.id ?? (t as any)?.ticket_id ?? (t as any)?.ticketId ?? (t as any)?.ticket?.id;
        const n = Number(cleanText(raw) || raw);
        return Number.isFinite(n) && n === target;
      }) || null
    );
  }, [employeeTickets, ticketCommentsTicketId]);

  const fetchAdminTicketComments = async (ticketId: number) => {
    if (!ticketId) return [];
    setTicketCommentsLoading(true);
    try {
      const urls = [
        `${API_URL}/api/employee-tickets/${ticketId}/comments/`,
        `${API_URL}/api/employee-ticket-comments/?ticket=${ticketId}`,
        `${API_URL}/api/ticket-comments/?ticket=${ticketId}`,
        `${API_URL}/api/employee-tickets/${ticketId}/`,
      ];

      for (const url of urls) {
        const res = await auth.authFetch(url, { method: "GET" });
        if (!res.ok) continue;
        const data = await res.json().catch(() => null);
        const unwrapped =
          data && typeof data === "object" && (data as any).ticket && typeof (data as any).ticket === "object"
            ? (data as any).ticket
            : data;
        const embedded =
          unwrapped && typeof unwrapped === "object"
            ? (unwrapped as any).comments ?? (unwrapped as any).comment_threads ?? (unwrapped as any).ticket_comments
            : null;
        const normalized = normalizeTicketCommentsList(embedded ?? unwrapped);
        setTicketComments(normalized);
        setLatestTicketCommentsById((prev) => ({ ...prev, [String(ticketId)]: normalized }));
        return normalized;
      }

      setTicketComments([]);
      return [];
    } finally {
      setTicketCommentsLoading(false);
    }
  };

  const loadAdminTicketNotifications = async () => {
    try {
      const res = await auth.authFetch(`${API_URL}/api/employee-ticket-notifications/?unread=1&limit=20`, { method: "GET" });
      if (!res.ok) return;
      const data = await res.json().catch(() => []);
      setAdminTicketNotifications(Array.isArray(data) ? data : []);
    } catch {}
  };

  const markAdminTicketNotificationsRead = async () => {
    try {
      await auth.authFetch(`${API_URL}/api/employee-ticket-notifications/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: "all" }),
      });
      setAdminTicketNotifications([]);
    } catch {}
  };

  const postAdminTicketComment = async (ticketId: number, messageRaw: string) => {
    const message = cleanText(messageRaw);
    const links = parseTicketLinks(ticketCommentLinkDraft);
    const files = ticketCommentFiles;
    if (!ticketId || (!message && links.length === 0 && files.length === 0)) return;
    if (ticketCommentSaving) return;
    setTicketCommentSaving(true);
    try {
      if (links.length > 0 || files.length > 0) {
        const formData = new FormData();
        formData.append("text", message || "Shared files and links.");
        formData.append("links", JSON.stringify(links));
        files.forEach((file) => formData.append("files", file));
        const res = await auth.authFetch(`${API_URL}/api/employee-tickets/${ticketId}/comments/`, {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          setTicketCommentDraft("");
          setTicketCommentLinkDraft("");
          setTicketCommentFiles([]);
          await fetchAdminTicketComments(ticketId);
          return;
        }
      }

      const endpoints: { url: string; method: "POST" | "PATCH"; bodies: any[] }[] = [
        {
          url: `${API_URL}/api/employee-tickets/${ticketId}/comments/`,
          method: "POST",
          bodies: [{ text: message }, { comment: message }, { message }],
        },
        {
          url: `${API_URL}/api/employee-ticket-comments/`,
          method: "POST",
          bodies: [{ ticket: ticketId, text: message }, { ticket_id: ticketId, text: message }],
        },
        {
          url: `${API_URL}/api/employee-tickets/${ticketId}/`,
          method: "PATCH",
          bodies: [{ admin_comment: message }, { comment: message }, { notes: message }],
        },
      ];

      for (const ep of endpoints) {
        for (const body of ep.bodies) {
          const res = await auth.authFetch(ep.url, {
            method: ep.method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          if (!res.ok) continue;
          setTicketCommentDraft("");
          setTicketCommentLinkDraft("");
          setTicketCommentFiles([]);
          const list = await fetchAdminTicketComments(ticketId);
          const has = Array.isArray(list) && list.some((c: any) => cleanText(c?.text) === message);
          if (!has) {
            alert("Backend did not save this comment");
          }
          return;
        }
      }

      alert("Failed to post comment");
    } finally {
      setTicketCommentSaving(false);
    }
  };


  const [scrollProgress, setScrollProgress] = useState(0);
  const isAnyModalOpen =
    isTeamModalOpen ||
    isAddProjectModalOpen ||
    isEditProjectModalOpen ||
    isAddProductModalOpen ||
    isEditProductModalOpen ||
    isAddGalleryModalOpen ||
    isAddServiceModalOpen ||
    isEditServiceModalOpen ||
    isAddGisServiceModalOpen ||
    isEditGisServiceModalOpen ||
    isAddTestimonialModalOpen ||
    isEditTestimonialModalOpen ||
    isAddEmployeeModalOpen ||
    isEditEmployeeModalOpen;

  useEffect(() => {
    const updateScrollProgress = () => {
      if (isAnyModalOpen) return;
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const progress = scrollTop / docHeight;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", updateScrollProgress);
    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, [isAnyModalOpen]);

  useEffect(() => {
    const handler = (event: any) => {
      const detail = event?.detail;
      const pid = cleanText(detail?.projectId) || cleanText(detail?.project_id) || cleanText(detail?.id);
      const plan = detail?.plan;
      if (!pid || !plan) return;
      setCurrentProjectPlans((prev) => ({ ...prev, [pid]: plan }));
    };
    window.addEventListener("nilaya-current-project-plan-updated", handler as EventListener);
    return () => window.removeEventListener("nilaya-current-project-plan-updated", handler as EventListener);
  }, []);

  useEffect(() => {
    if (!isAnyModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isAnyModalOpen]);

  // Toast effect
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Get unique values for filters
  const departments = [
    "all",
    ...Array.from(
      new Set(teamMembers.map((m) => m.department).filter(Boolean))
    ),
  ];
  const galleryCategories = [
    "all",
    "office",
    "events",
    "celebration",
    "others",
  ];

  // Fetch all data
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const listify = (v: any) =>
          Array.isArray(v)
            ? v
            : Array.isArray(v?.results)
              ? v.results
              : Array.isArray(v?.data)
                ? v.data
                : Array.isArray(v?.items)
                  ? v.items
                  : [];

        let compact: any = null;

        try {
          const adminRes = await auth.authFetch(`${API_URL}/api/admin/dashboard/`, { method: "GET" });
          if (adminRes.ok) {
            const adminData = await adminRes.json();
            if (!cancelled) setUser(adminData.user);
            compact =
              adminData?.dashboard && typeof adminData.dashboard === "object"
                ? adminData.dashboard
                : adminData?.data && typeof adminData.data === "object"
                  ? adminData.data
                  : adminData && typeof adminData === "object"
                    ? adminData
                    : null;
          } else if (adminRes.status === 404) {
            console.warn("Admin endpoint not found, using fallback");
            if (!cancelled) setUser({ username: "Admin" });
          } else if (adminRes.status === 401 || adminRes.status === 403) {
            if (!cancelled) {
              const maybeEmployee = (auth as any)?.user && (auth as any).user.employee_id;
              router.replace(maybeEmployee ? "/employee/dashboard" : "/login");
              setLoading(false);
            }
            return;
          } else {
            throw new Error(`Admin API failed with status: ${adminRes.status}`);
          }
        } catch (adminError) {
          console.warn("Admin fetch failed:", adminError);
          if (!cancelled) setUser({ username: "Admin" });
        }

        if (!cancelled) setLoading(false);

        const hasCompact =
          compact &&
          (compact.team ||
            compact.team_members ||
            compact.projects ||
            compact.employee_projects ||
            compact.employeeProjects ||
            compact.gallery ||
            compact.products ||
            compact.gis_services ||
            compact.gisServices ||
            compact.services ||
            compact.testimonials ||
            compact.employees ||
            compact.leave_requests ||
            compact.leaveRequests ||
            compact.overtime_requests ||
            compact.overtimeRequests ||
            compact.employee_documents ||
            compact.employeeDocuments ||
            compact.employee_tickets ||
            compact.employeeTickets ||
            compact.private_projects ||
            compact.privateProjects);

        if (hasCompact) {
          if (!cancelled && (compact.team || compact.team_members)) {
            const raw = compact.team ?? compact.team_members;
            const arr = listify(raw);
            if (!cancelled) setTeamMembers(arr);
          }
          if (!cancelled && compact.projects) {
            const arr = listify(compact.projects);
            if (!cancelled) setProjects(arr);
          }
          if (!cancelled && (compact.employee_projects || compact.employeeProjects)) {
            const raw = compact.employee_projects ?? compact.employeeProjects;
            const arr = listify(raw);
            if (!cancelled) setEmployeeProjects(arr);
          }
          if (!cancelled && compact.gallery) {
            const arr = listify(compact.gallery);
            if (!cancelled) setGallery(arr);
          }
          if (!cancelled && compact.products) {
            const arr = listify(compact.products);
            if (!cancelled) setProducts(arr);
          }
          if (!cancelled && (compact.gis_services || compact.gisServices)) {
            const raw = compact.gis_services ?? compact.gisServices;
            const arr = listify(raw);
            if (!cancelled) setGisServices(arr);
          }
          if (!cancelled && compact.services) {
            const arr = listify(compact.services);
            if (!cancelled) setServices(arr);
          }
          if (!cancelled && compact.testimonials) {
            const arr = listify(compact.testimonials);
            if (!cancelled) setTestimonials(arr);
          }
          if (!cancelled && compact.employees) {
            const arr = listify(compact.employees);
            if (!cancelled) setEmployees(arr);
          }
          if (!cancelled && (compact.leave_requests || compact.leaveRequests)) {
            const raw = compact.leave_requests ?? compact.leaveRequests;
            const arr = listify(raw);
            if (!cancelled) setLeaveRequests(arr);
          }
          if (!cancelled && (compact.overtime_requests || compact.overtimeRequests)) {
            const raw = compact.overtime_requests ?? compact.overtimeRequests;
            const arr = listify(raw);
            if (!cancelled) setOvertimeRequests(arr);
          }
          if (!cancelled && (compact.employee_documents || compact.employeeDocuments)) {
            const raw = compact.employee_documents ?? compact.employeeDocuments;
            const arr = listify(raw);
            if (!cancelled) setEmployeeDocuments(arr);
          }
          if (!cancelled && (compact.employee_tickets || compact.employeeTickets)) {
            const raw = compact.employee_tickets ?? compact.employeeTickets;
            const arr = listify(raw);
            const normalized = arr
              .map((item: any) => (item && typeof item === "object" && item.ticket && typeof item.ticket === "object" ? item.ticket : item))
              .filter(Boolean);
            if (!cancelled) setEmployeeTickets(normalized);
            loadAdminTicketNotifications();
            normalized.slice(0, 8).forEach((ticket: any) => {
              const id = Number(cleanText(ticket?.id ?? ticket?.ticket_id ?? ticket?.ticketId));
              if (Number.isFinite(id) && id > 0) fetchAdminTicketComments(id);
            });
          }

          try {
            const rawPlans = compact.private_projects ?? compact.privateProjects;
            const arr = listify(rawPlans);
            let planMap: Record<string, any> = {};
            if (Array.isArray(arr) && arr.length > 0) {
              planMap = arr.reduce((acc: Record<string, any>, item: any) => {
                const pid = cleanText(item?.project_id) || cleanText(item?.project?.id) || cleanText(item?.id);
                if (pid) acc[pid] = item;
                return acc;
              }, {});
            }

            try {
              const localRaw = window.localStorage.getItem("nilaya_current_project_plan_v1");
              const localParsed = localRaw ? JSON.parse(localRaw) : {};
              if (localParsed && typeof localParsed === "object") {
                Object.keys(localParsed).forEach((pid) => {
                  const plan = (localParsed as any)[pid];
                  if (plan && typeof plan === "object") planMap[String(pid)] = plan;
                });
              }
            } catch {}

            if (!cancelled) setCurrentProjectPlans(planMap);
          } catch {
            if (!cancelled) setCurrentProjectPlans({});
          }

          return;
        }

        const requests = [
          auth.authFetch(`${API_URL}/api/team/`, { method: "GET" }),
          auth.authFetch(`${API_URL}/api/projects/`, { method: "GET" }),
          auth.authFetch(`${API_URL}/api/employees/projects/`, { method: "GET" }),
          auth.authFetch(`${API_URL}/api/gallery/`, { method: "GET" }),
          auth.authFetch(`${API_URL}/api/products/`, { method: "GET" }),
          auth.authFetch(`${API_URL}/api/gis-services/`, { method: "GET" }),
          auth.authFetch(`${API_URL}/api/services/`, { method: "GET" }),
          auth.authFetch(`${API_URL}/api/testimonials/`, { method: "GET" }),
          auth.authFetch(`${API_URL}/api/employees/`, { method: "GET" }),
          auth.authFetch(`${API_URL}/api/leave-requests/`, { method: "GET" }),
          auth.authFetch(`${API_URL}/api/overtime-requests/`, { method: "GET" }),
          auth.authFetch(`${API_URL}/api/employee-documents/`, { method: "GET" }),
          auth.authFetch(`${API_URL}/api/employee-tickets/`, { method: "GET" }),
        ] as const;

        const [
          teamRes,
          projectRes,
          employeeProjectsRes,
          galleryRes,
          productsRes,
          gisservicesRes,
          servicesRes,
          testimonialsRes,
          employeesRes,
          leaveRes,
          overtimeRes,
          docsRes,
          employeeTicketsRes,
        ] = (await Promise.allSettled(requests)).map((r) => (r.status === "fulfilled" ? r.value : null));

        if (!cancelled && teamRes?.ok) {
          const teamData = await teamRes.json().catch(() => []);
          if (!cancelled) setTeamMembers(Array.isArray(teamData) ? teamData : teamData?.results || []);
        }
        if (!cancelled && projectRes?.ok) {
          const projectData = await projectRes.json().catch(() => []);
          if (!cancelled) setProjects(Array.isArray(projectData) ? projectData : projectData?.results || []);
        }
        if (!cancelled && employeeProjectsRes?.ok) {
          const raw = await employeeProjectsRes.json().catch(() => []);
          const arr = Array.isArray(raw) ? raw : raw.results || [];
          if (!cancelled) setEmployeeProjects(Array.isArray(arr) ? arr : []);
        }

        try {
          const currentProjectListUrls = [
            `${API_URL}/api/private-projects/`,
          ];
          let planMap: Record<string, any> = {};
          for (const url of currentProjectListUrls) {
            const res = await auth.authFetch(url, { method: "GET" });
            if (!res.ok) continue;
            const raw = await res.json().catch(() => null);
            const arr = Array.isArray(raw) ? raw : raw?.results || [];
            if (!Array.isArray(arr)) continue;
            planMap = arr.reduce((acc: Record<string, any>, item: any) => {
              const pid =
                cleanText(item?.project_id) ||
                cleanText(item?.project?.id) ||
                cleanText(item?.id);
              if (pid) acc[pid] = item;
              return acc;
            }, {});
            break;
          }

          try {
            const localRaw = window.localStorage.getItem("nilaya_current_project_plan_v1");
            const localParsed = localRaw ? JSON.parse(localRaw) : {};
            if (localParsed && typeof localParsed === "object") {
              Object.keys(localParsed).forEach((pid) => {
                const plan = (localParsed as any)[pid];
                if (plan && typeof plan === "object") planMap[String(pid)] = plan;
              });
            }
          } catch {}

          setCurrentProjectPlans(planMap);
        } catch {
          if (!cancelled) setCurrentProjectPlans({});
        }

        if (!cancelled && galleryRes?.ok) {
          const galleryData = await galleryRes.json().catch(() => []);
          if (!cancelled) setGallery(Array.isArray(galleryData) ? galleryData : galleryData?.results || []);
        }
        if (!cancelled && productsRes?.ok) {
          const productsData = await productsRes.json().catch(() => []);
          if (!cancelled) setProducts(Array.isArray(productsData) ? productsData : productsData?.results || []);
        }
        if (!cancelled && gisservicesRes?.ok) {
          const gisData = await gisservicesRes.json().catch(() => []);
          if (!cancelled) setGisServices(Array.isArray(gisData) ? gisData : gisData?.results || []);
        }
        if (!cancelled && servicesRes?.ok) {
          const servicesData = await servicesRes.json().catch(() => []);
          if (!cancelled) setServices(Array.isArray(servicesData) ? servicesData : servicesData?.results || []);
        }
        if (!cancelled && testimonialsRes?.ok) {
          const testimonialsData = await testimonialsRes.json().catch(() => []);
          if (!cancelled) setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : testimonialsData?.results || []);
        }
        if (!cancelled && employeesRes?.ok) {
          const employeesData = await employeesRes.json().catch(() => []);
          const arr = Array.isArray(employeesData) ? employeesData : employeesData.results || [];
          if (!cancelled) setEmployees(Array.isArray(arr) ? arr : []);
        }
        if (!cancelled && leaveRes?.ok) {
          const leaveData = await leaveRes.json().catch(() => []);
          if (!cancelled) setLeaveRequests(Array.isArray(leaveData) ? leaveData : leaveData?.results || []);
        }
        if (!cancelled && overtimeRes?.ok) {
          const overtimeData = await overtimeRes.json().catch(() => []);
          if (!cancelled) setOvertimeRequests(Array.isArray(overtimeData) ? overtimeData : overtimeData?.results || []);
        }
        if (!cancelled && docsRes?.ok) {
          const docsData = await docsRes.json().catch(() => []);
          if (!cancelled) setEmployeeDocuments(Array.isArray(docsData) ? docsData : docsData?.results || []);
        }
        if (!cancelled && employeeTicketsRes?.ok) {
          const raw = await employeeTicketsRes.json().catch(() => []);
          const arr = Array.isArray(raw) ? raw : raw?.results || [];
          const list = Array.isArray(arr) ? arr : [];
          const normalized = list
            .map((item: any) => (item && typeof item === "object" && item.ticket && typeof item.ticket === "object" ? item.ticket : item))
            .filter(Boolean);
          if (!cancelled) setEmployeeTickets(normalized);
          loadAdminTicketNotifications();
          normalized.slice(0, 8).forEach((ticket: any) => {
            const id = Number(cleanText(ticket?.id ?? ticket?.ticket_id ?? ticket?.ticketId));
            if (Number.isFinite(id) && id > 0) fetchAdminTicketComments(id);
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [auth, router]);

  // Team Functions
  const handleAddTeamMember = () => {
    setEditingTeamMember(null);
    setIsEditTeamMode(false);
    setIsTeamModalOpen(true);
  };

  const handleEditTeamMember = (member: TeamMember) => {
    setEditingTeamMember(member);
    setIsEditTeamMode(true);
    setIsTeamModalOpen(true);
  };

  const handleSaveTeamMember = async (memberData: Partial<TeamMemberForm>) => {
    try {
      const formData = new FormData();
      Object.entries(memberData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (key === "image") {
          if (value instanceof File) {
            formData.append("image", value);
          }
          return;
        }

        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      });

      let url = `${API_URL}/api/team/`;
      let method = "POST";

      if (isEditTeamMode && editingTeamMember?.id) {
        url = `${API_URL}/api/team/${editingTeamMember.id}/`;
        method = "PUT";
      }

      const res = await auth.authFetch(url, { method, body: formData });

      if (res.ok) {
        const data = await res.json();

        if (isEditTeamMode && editingTeamMember?.id) {
          setTeamMembers((prev) =>
            prev.map((m) => (m.id === editingTeamMember.id ? data : m))
          );
        } else {
          setTeamMembers((prev) => [...prev, data]);
        }

        setIsTeamModalOpen(false);
        setEditingTeamMember(null);
        alert(`Team member ${isEditTeamMode ? "updated" : "added"} successfully!`);
      } else {
        const errorData = await res.json();
        console.error("Failed to save team member:", errorData);
        alert(`Failed to save team member: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error saving team member:", err);
      alert("Error saving team member. Please try again.");
    }
  };

  const deleteTeamMember = async (member: TeamMember) => {
    try {
      const res = await auth.authFetch(`${API_URL}/api/team/${member.id}/`, { method: "DELETE" });

      if (res.ok) {
        window.location.reload();
      } else {
        alert(`Failed to delete team member. Status: ${res.status}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting team member. Please try again.");
    }
  };

  // Testimonials Functions
  const addTestimonial = async (testimonialData: Partial<TestimonialForm>) => {
    try {
      const formData = new FormData();

      Object.entries(testimonialData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (key === "image") {
          if (value instanceof File) {
            formData.append("image", value);
          }
          return;
        }

        formData.append(key, value.toString());
      });

      const res = await auth.authFetch(`${API_URL}/api/testimonials/`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const created = await res.json();
        setTestimonials((prev) => [...prev, created]);
        setIsAddTestimonialModalOpen(false);
        setNewTestimonial({
          name: "",
          company: "",
          role: "",
          text: "",
          image: null,
          linkedin: "",
          status: "active",
          sort_order: 0,
        });
        alert("Testimonial added successfully!");
      } else {
        const errorData = await res.json();
        console.error("Failed to add testimonial:", errorData);
        alert(`Failed to add testimonial: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error adding testimonial:", err);
      alert("Error adding testimonial. Please try again.");
    }
  };

  const updateTestimonial = async (id: number, updatedData: Partial<TestimonialForm>) => {
    try {
      const formData = new FormData();

      Object.entries(updatedData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (key === "image") {
          if (value instanceof File) {
            formData.append("image", value);
          }
          return;
        }

        formData.append(key, value.toString());
      });

      const res = await auth.authFetch(`${API_URL}/api/testimonials/${id}/`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        const updated = await res.json();
        setTestimonials((prev) => prev.map((t) => (t.id === id ? updated : t)));
        setIsEditTestimonialModalOpen(false);
        setEditingTestimonial(null);
        alert("Testimonial updated successfully!");
      } else {
        const errorData = await res.json();
        console.error("Failed to update testimonial:", errorData);
        alert(`Failed to update testimonial: ${JSON.stringify(errorData)}`);
      }
    } catch (err) {
      console.error("Error updating testimonial:", err);
      alert("Error updating testimonial. Please try again.");
    }
  };

  const deleteTestimonial = async (id: number) => {
    if (!confirm("Are you sure you want to delete this testimonial? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await auth.authFetch(`${API_URL}/api/testimonials/${id}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
        alert("Testimonial deleted successfully!");
      } else {
        alert("Failed to delete testimonial. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting testimonial. Please try again.");
    }
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setIsEditTestimonialModalOpen(true);
  };

  // Employee Functions
  const addEmployee = async (employeeData: Partial<EmployeeForm>) => {
    try {
      const formData = new FormData();
      Object.entries(employeeData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (key === "profile_pic" || key === "documents") {
          if (value instanceof File) {
            formData.append(key, value);
          }
          return;
        }
        if (key === "password") {
          if (value) {
            formData.append("password", value.toString());
          }
          return;
        }
        formData.append(key, value.toString());
      });

      const res = await auth.authFetch(`${API_URL}/api/employees/`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const created = await res.json();
        setEmployees((prev) => [...prev, created]);
        setIsAddEmployeeModalOpen(false);
        setNewEmployee({
          login_id: "",
          email: "",
          phone: "",
          employee_id: "",
          name: "",
          designation: "",
          password: "",
          profile_pic: null,
          location: "",
          employment_type: "",
          qualification: "",
          documents: null,
          status: "active",
        });
        alert("Employee added successfully!");
      } else {
        const errorData = await res.json();
        console.error("Failed to add employee:", errorData);
        alert(`Failed to add employee: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error adding employee:", err);
      alert("Error adding employee. Please try again.");
    }
  };

  const updateEmployee = async (id: string, updatedData: Partial<EmployeeForm>) => {
    try {
      const formData = new FormData();
      Object.entries(updatedData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (key === "profile_pic" || key === "documents") {
          if (value instanceof File) {
            formData.append(key, value);
          }
          return;
        }
        if (key === "password") {
          if (value) {
            formData.append("password", value.toString());
          }
          return;
        }
        formData.append(key, value.toString());
      });

      const res = await auth.authFetch(`${API_URL}/api/employees/${id}/`, {
        method: "PATCH",
        body: formData,
      });

      if (res.ok) {
        const updated = await res.json();
        setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)));
        setIsEditEmployeeModalOpen(false);
        setEditingEmployee(null);
        alert("Employee updated successfully!");
      } else {
        const errorData = await res.json();
        console.error("Failed to update employee:", errorData);
        alert(`Failed to update employee: ${JSON.stringify(errorData)}`);
      }
    } catch (err) {
      console.error("Error updating employee:", err);
      alert("Error updating employee. Please try again.");
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee? This action cannot be undone.")) return;
    try {
      const res = await auth.authFetch(`${API_URL}/api/employees/${id}/`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEmployees((prev) => prev.filter((e) => e.id !== id));
        alert("Employee deleted successfully!");
      } else {
        alert("Failed to delete employee. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting employee. Please try again.");
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEditEmployeeModalOpen(true);
  };

  const handleViewEmployeeDetails = (employee: Employee) => {
    setViewingEmployee(employee);
    setIsEmployeeDetailsModalOpen(true);
  };

  const resetEmployeePassword = async (employeeId: string, newPassword: string) => {
    if (!newPassword || newPassword.trim().length < 4) {
      alert("Password must be at least 4 characters");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("password", newPassword.trim());
      const res = await auth.authFetch(`${API_URL}/api/employees/${employeeId}/`, {
        method: "PATCH",
        body: formData,
      });
      if (res.ok) {
        const updated = await res.json();
        setEmployees((prev) => prev.map((e) => (e.id === employeeId ? updated : e)));
        alert("Password updated successfully!");
      } else {
        const errorData = await res.json().catch(() => null);
        alert(errorData?.detail || errorData?.message || "Failed to update password");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating password. Please try again.");
    }
  };

  const fetchProjectById = async (projectId: string): Promise<Project | null> => {
    try {
      const urls = [
        `${API_URL}/api/employees/projects/${projectId}/`,
      ];
      for (const url of urls) {
        const res = await auth.authFetch(url, { method: "GET" });
        if (!res.ok) continue;
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  };

  const currentProjectCards = useMemo(() => {
    return employeeProjects.map((project) => {
      const pid = String(project.id);
      const plan = currentProjectPlans[pid] || null;
      const assignments = Array.isArray(plan?.assignments)
        ? plan.assignments
        : Array.isArray(plan?.employees)
          ? plan.employees
          : [];
      const totalAssigned = assignments.length;
      const completedAssigned = assignments.filter((a: any) => cleanText(a?.status) === "completed").length;
      const completion = totalAssigned > 0 ? Math.round((completedAssigned / totalAssigned) * 100) : 0;
      const assignedEmployees = employees.filter((e) => {
        const raw =
          (e as any)?.current_project_id ??
          (e as any)?.current_project?.id ??
          (e as any)?.current_project;
        return String(raw || "") === pid;
      }).length;
      return {
        id: pid,
        title: cleanText(plan?.project_name) || cleanText(project.title) || `Project ${pid}`,
        status: cleanText(plan?.status) || cleanText(project.status) || "planned",
        assignedEmployees,
        totalAssigned,
        completedAssigned,
        completion,
      };
    });
  }, [employeeProjects, currentProjectPlans, employees]);

  const updateLeaveStatus = async (id: number, status: string, rejectionReason?: string) => {
    try {
      const res = await auth.authFetch(`${API_URL}/api/leave-requests/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          status === "rejected"
            ? { status, rejection_reason: rejectionReason || "" }
            : { status }
        ),
      });
      if (res.ok) {
        const updated = await res.json();
        setLeaveRequests(prev => prev.map(r => r.id === id ? updated : r));
        alert('Leave request status updated successfully!');
      } else {
        alert('Failed to update leave request status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating leave request status');
    }
  };

  const handleRejectLeave = (id: number) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason || !reason.trim()) return;
    updateLeaveStatus(id, "rejected", reason.trim());
  };

  // Overtime Requests Status Update
  const updateOvertimeStatus = async (
    id: number,
    status: string,
    extraPay?: number,
    rejectionReason?: string
  ) => {
    try {
      const body =
        status === "approved"
          ? { status, extra_pay: extraPay || 0 }
          : status === "rejected"
            ? { status, rejection_reason: rejectionReason || "" }
            : { status };
      const res = await auth.authFetch(`${API_URL}/api/overtime-requests/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated = await res.json();
        setOvertimeRequests(prev => prev.map(r => r.id === id ? updated : r));
        alert('Overtime request status updated successfully!');
      } else {
        alert('Failed to update overtime request status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating overtime request status');
    }
  };

  const handleApproveOvertime = (id: number) => {
    const raw = window.prompt("Enter Extra Pay Amount (₹):", "0");
    if (raw === null) return;
    const value = parseInt(raw, 10);
    if (Number.isNaN(value) || value < 0) {
      alert("Invalid extra pay amount");
      return;
    }
    updateOvertimeStatus(id, "approved", value);
  };

  const handleRejectOvertime = (id: number) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason || !reason.trim()) return;
    updateOvertimeStatus(id, "rejected", undefined, reason.trim());
  };

  const updateDocumentStatus = async (id: number, status: "verified" | "rejected", rejectionReason?: string) => {
    try {
      const body =
        status === "rejected"
          ? { status, rejection_reason: rejectionReason || "" }
          : { status };
      const res = await auth.authFetch(`${API_URL}/api/employee-documents/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated = await res.json();
        setEmployeeDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)));
        alert("Document status updated successfully!");
      } else {
        alert("Failed to update document status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating document status");
    }
  };

  const handleRejectDocument = (id: number) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason || !reason.trim()) return;
    updateDocumentStatus(id, "rejected", reason.trim());
  };

  const updateEmployeeTicket = async (ticketIdInput: unknown, payload: Record<string, any>) => {
    const toTicketIdNumber = (value: unknown): number | null => {
      const cleaned = cleanText(value);
      const n = Number(cleaned || value);
      return Number.isFinite(n) && n > 0 ? n : null;
    };

    const ticketId = toTicketIdNumber(ticketIdInput);
    if (!ticketId) return;

    try {
      const url = `${API_URL}/api/employee-tickets/${ticketId}/`;
      const normalizeStatus = (value: any) => normalizeTicketStatusKey(value);
      const flattenTicket = (obj: any) =>
        obj && typeof obj === "object" && obj.ticket && typeof obj.ticket === "object" ? { ...obj, ...obj.ticket } : obj;

      const desiredStatus = payload?.status !== undefined ? normalizeStatus(payload.status) : "";
      const desiredAssignedIds =
        payload?.assigned_to_ids !== undefined
          ? extractIdList(payload.assigned_to_ids)
          : payload?.assignees !== undefined
            ? extractIdList(payload.assignees)
            : payload?.assigned_to !== undefined
              ? payload.assigned_to == null
                ? []
                : extractIdList(payload.assigned_to)
              : payload?.assigned_to_id !== undefined
                ? payload.assigned_to_id == null
                  ? []
                  : extractIdList(payload.assigned_to_id)
                : payload?.Reassigned_to !== undefined
                  ? payload.Reassigned_to == null
                    ? []
                    : extractIdList(payload.Reassigned_to)
                  : payload?.reassigned_to !== undefined
                    ? payload.reassigned_to == null
                      ? []
                      : extractIdList(payload.reassigned_to)
                    : null;

      const updateSatisfiesIntent = (updatedTicket: any) => {
        const updated = flattenTicket(updatedTicket);
        if (!updated || typeof updated !== "object") return false;

        if (payload?.status !== undefined) {
          if (normalizeStatus(updated.status) !== desiredStatus) return false;
        }

        if (desiredAssignedIds !== null) {
          const currentIds = getTicketAssigneeIds(updated);
          if (desiredAssignedIds.length === 0) return currentIds.length === 0;
          const set = new Set(currentIds.map(String));
          return desiredAssignedIds.every((id) => set.has(String(id)));
        }

        return true;
      };

      const buildAltPayloads = (base: Record<string, any>) => {
        const alts: Record<string, any>[] = [];

        if (base?.status !== undefined) {
          const raw = cleanText(base.status).toLowerCase();
          if (raw) {
            const hyphen = raw.replace(/_/g, "-");
            const underscore = raw.replace(/-/g, "_");
            if (hyphen !== raw) alts.push({ ...base, status: hyphen });
            if (underscore !== raw) alts.push({ ...base, status: underscore });
          }
        }

        if (base?.Reassigned_to !== undefined) {
          const alt = { ...base, reassigned_to: base.Reassigned_to };
          delete (alt as any).Reassigned_to;
          alts.push(alt);
        }

        if (base?.reassigned_to !== undefined) {
          const alt = { ...base, Reassigned_to: base.reassigned_to };
          delete (alt as any).reassigned_to;
          alts.push(alt);
        }

        if (base?.assigned_to !== undefined) {
          alts.push({ ...base, assigned_to_id: base.assigned_to });
          alts.push({ ...base, assigned_to_ids: base.assigned_to == null ? [] : [base.assigned_to] });
          alts.push({ ...base, reassigned_to: base.assigned_to });
          alts.push({ ...base, Reassigned_to: base.assigned_to });
        }

        if (base?.assigned_to_id !== undefined) {
          alts.push({ ...base, assigned_to: base.assigned_to_id });
          alts.push({ ...base, assigned_to_ids: base.assigned_to_id == null ? [] : [base.assigned_to_id] });
          alts.push({ ...base, reassigned_to: base.assigned_to_id });
          alts.push({ ...base, Reassigned_to: base.assigned_to_id });
        }

        if (base?.assigned_to_ids !== undefined) {
          alts.push({ ...base, assigned_to: Array.isArray(base.assigned_to_ids) ? base.assigned_to_ids[0] ?? null : null });
          alts.push({ ...base, assignees: base.assigned_to_ids });
        }

        if (base?.assignees !== undefined) {
          alts.push({ ...base, assigned_to_ids: base.assignees });
          alts.push({ ...base, assigned_to: Array.isArray(base.assignees) ? base.assignees[0] ?? null : null });
        }

        return alts;
      };

      const candidates = [payload, ...buildAltPayloads(payload)];
      let res: any = null;
      let lastOkRes: any = null;
      let appliedPayload: Record<string, any> = payload;
      let updated: any = null;
      let responseBodyRead = false;
      let satisfied = false;
      for (const candidate of candidates) {
        res = await auth.authFetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(candidate),
        });
        if (!res.ok) continue;

        lastOkRes = res;
        responseBodyRead = true;
        const candidateUpdated = await res.json().catch(() => null);
        appliedPayload = candidate;
        updated = candidateUpdated;
        if (candidateUpdated == null) break;
        if (candidateUpdated != null && updateSatisfiesIntent(candidateUpdated)) {
          satisfied = true;
          break;
        }
      }

      if (!lastOkRes) {
        const data = await res?.json?.().catch?.(() => null);
        alert(data?.detail || "Failed to update ticket");
        return;
      }

      if (!satisfied) {
        try {
          const verifyRes = await auth.authFetch(url, { method: "GET" });
          if (verifyRes.ok) {
            const latest = await verifyRes.json().catch(() => null);
            if (latest != null && updateSatisfiesIntent(latest)) {
              updated = latest;
              satisfied = true;
            }
          }
        } catch {}
      }

      if (!satisfied && payload && typeof payload === "object") {
        alert("Update not applied by backend");
        return;
      }

      if (updated == null && !responseBodyRead) {
        updated = await lastOkRes.json().catch(() => null);
      }
      setEmployeeTickets((prev) =>
        prev.map((t: any) => {
          const tid = toTicketIdNumber(
            (t as any)?.id ?? (t as any)?.ticket_id ?? (t as any)?.ticketId ?? (t as any)?.ticket?.id
          );

          // If a ticket in state doesn't have a numeric id, do not attempt to compare/merge it.
          if (!tid || tid !== ticketId) return t;

          let merged: any =
            updated && typeof updated === "object" ? { ...t, ...updated } : { ...t, ...appliedPayload };

          // Some APIs return { ticket: {...} } wrapper; flatten if present.
          if (merged && typeof merged === "object" && merged.ticket && typeof merged.ticket === "object") {
            merged = { ...merged, ...merged.ticket };
          }

          // Keep both naming conventions in sync.
          if (merged.Reassigned_to == null && merged.reassigned_to != null) {
            merged.Reassigned_to = merged.reassigned_to;
          }
          if (merged.reassigned_to == null && merged.Reassigned_to != null) {
            merged.reassigned_to = merged.Reassigned_to;
          }

          if (merged.assigned_to == null && merged.assigned_to_id != null) {
            merged.assigned_to = merged.assigned_to_id;
          }
          if (merged.assigned_to_id == null && merged.assigned_to != null) {
            const id = (merged.assigned_to as any)?.id ?? merged.assigned_to;
            if (typeof id === "string" || typeof id === "number") merged.assigned_to_id = id;
          }

          return merged;
        })
      );
    } catch {
      alert("Failed to update ticket");
    }
  };

  const createEmployeeTicket = async () => {
    if (!newTicketEmployeeId || !newTicketTitle.trim()) return;
    setCreatingTicket(true);
    try {
      const res = await auth.authFetch(`${API_URL}/api/employee-tickets/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee: Number(newTicketEmployeeId),
          title: newTicketTitle.trim(),
          description: newTicketDescription.trim(),
          status: "pending",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.detail || "Failed to create ticket");
        return;
      }
      const created = await res.json().catch(() => null);
      if (created && typeof created === "object") {
        let merged: any = created;
        if (merged && typeof merged === "object" && merged.ticket && typeof merged.ticket === "object") {
          merged = { ...merged, ...merged.ticket };
        }
        if (merged.Reassigned_to == null && merged.reassigned_to != null) merged.Reassigned_to = merged.reassigned_to;
        if (merged.reassigned_to == null && merged.Reassigned_to != null) merged.reassigned_to = merged.Reassigned_to;
        setEmployeeTickets((prev) => [merged, ...prev]);
      }
      setNewTicketEmployeeId("");
      setNewTicketTitle("");
      setNewTicketDescription("");
    } catch {
      alert("Failed to create ticket");
    } finally {
      setCreatingTicket(false);
    }
  };

  // Service Functions
  const uploadImageFile = async (file: File): Promise<string> => {
    const token =
      localStorage.getItem("access") || localStorage.getItem("access_token");

    const endpoints = [
      `${API_URL}/api/admin/upload-image/`,
      `${API_URL}/api/upload-image/`,
      `${API_URL}/api/admin/blogs/upload/`,
    ];

    for (const endpoint of endpoints) {
      try {
        const formData = new FormData();
        formData.append("image", file);

        const res = token
          ? await auth.authFetch(endpoint, { method: "POST", body: formData })
          : await fetch(endpoint, { method: "POST", body: formData });

        if (!res.ok) continue;

        const data = await res.json();
        const url = data.url || data.image_url || data.path;
        if (typeof url === "string" && url) return url;
      } catch {
        continue;
      }
    }

    throw new Error("Image upload failed");
  };

  const sanitizeRemoteUrl = (value: unknown) => {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    return trimmed.replace(/^`+/, "").replace(/`+$/, "").trim();
  };

  const slugifyTitle = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const resolveUseCasesForSave = async (useCases: Service["use_cases"]) => {
    return Promise.all(
      (useCases || []).map(async (uc, idx) => {
        const layout =
          uc.layout ?? (idx % 2 === 0 ? "image_left" : "image_right");

        let image = uc.image;
        if (image instanceof File) {
          image = await uploadImageFile(image);
        }

        return {
          title: uc.title || "",
          description: uc.description || "",
          image: sanitizeRemoteUrl(typeof image === "string" ? image : ""),
          layout,
        };
      })
    );
  };

  const resolveExploreForSave = async (explore: unknown): Promise<ExploreSection> => {
    const e = (explore || {}) as any;
    const title = typeof e.title === "string" ? e.title : "";
    const subsections: any[] = Array.isArray(e.subsections) ? e.subsections : [];

    const resolvedSubsections: ExploreSubsection[] = await Promise.all(
      subsections.map(async (sub: any) => {
        const subTitle = typeof sub.title === "string" ? sub.title : "";
        const slug = sanitizeRemoteUrl(typeof sub.slug === "string" ? sub.slug : "") || slugifyTitle(subTitle);
        const short_description = typeof sub.short_description === "string" ? sub.short_description : "";
        const description = typeof sub.description === "string" ? sub.description : "";

        const imagesRaw: any[] = Array.isArray(sub.images) ? sub.images : [];
        const imagesResolved = await Promise.all(
          imagesRaw.map(async (img) => {
            if (img instanceof File) return await uploadImageFile(img);
            return sanitizeRemoteUrl(img);
          })
        );

        const technologies = Array.isArray(sub.technologies)
          ? sub.technologies.map((t: any) => String(t)).filter(Boolean)
          : [];

        const developers = Array.isArray(sub.developers)
          ? sub.developers.map((d: any) => Number(d)).filter((n: number) => !Number.isNaN(n))
          : [];

        const use_cases = (await resolveUseCasesForSave(sub.use_cases || [])) as ExploreUseCase[];

        return {
          title: subTitle,
          slug,
          short_description,
          description,
          images: imagesResolved.filter(Boolean),
          technologies,
          developers,
          use_cases,
        };
      })
    );

    return {
      title,
      subsections: resolvedSubsections.filter((s) => s.title && s.slug),
    };
  };

  const addService = async (
    serviceData: Partial<ServiceForm> & { explore?: ExploreSection }
  ) => {
    try {
      const normalized: Partial<ServiceForm> = { ...serviceData };

      if (normalized.use_cases) {
        normalized.use_cases = (await resolveUseCasesForSave(
          normalized.use_cases as any
        )) as any;
      }

      if ((normalized as any).explore) {
        (normalized as any).explore = await resolveExploreForSave(
          (normalized as any).explore
        );
      }

      const formData = new FormData();

      Object.entries(normalized).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (key === "image") {
          if (value instanceof File) {
            formData.append("image", value);
          }
          return;
        }

        if (key === "explore") {
          formData.append(key, JSON.stringify(value));
          return;
        }

        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      });

      const res = await auth.authFetch(`${API_URL}/api/services/`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const created = await res.json();
        setServices((prev) => [...prev, created]);
        setIsAddServiceModalOpen(false);
        setNewService({
          id: "",
          title: "",
          description: "",
          image: "",
          long_description: "",
          features: [],
          benefits: [],
          technologies: [],
          developers: [],
          demo_video_url: "",
          status: "active",
          sort_order: 0,
          use_cases: [],
          explore: { title: "", subsections: [] },
        });
        alert("Service added successfully!");
      } else {
        const errorData = await res.json();
        console.error("Failed to add service:", errorData);
        alert(`Failed to add service: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error adding service:", err);
      alert("Error adding service. Please try again.");
    }
  };

  const updateService = async (
    id: string,
    updatedData: Partial<ServiceForm> & { explore?: ExploreSection }
  ) => {
    try {
      const normalized: Partial<ServiceForm> = { ...updatedData };

      if (normalized.use_cases) {
        normalized.use_cases = (await resolveUseCasesForSave(
          normalized.use_cases as any
        )) as any;
      }

      if ((normalized as any).explore) {
        (normalized as any).explore = await resolveExploreForSave(
          (normalized as any).explore
        );
      }

      const formData = new FormData();

      Object.entries(normalized).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (key === "image") {
          if (value instanceof File) {
            formData.append("image", value);
          }
          return;
        }

        if (key === "explore") {
          formData.append(key, JSON.stringify(value));
          return;
        }

        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      });

      const res = await auth.authFetch(`${API_URL}/api/services/${id}/`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        const updated = await res.json();
        setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
        setIsEditServiceModalOpen(false);
        setEditingService(null);
        alert("Service updated successfully!");
      } else {
        const errorData = await res.json();
        console.error("Failed to update service:", errorData);
        alert(`Failed to update service: ${JSON.stringify(errorData)}`);
      }
    } catch (err) {
      console.error("Error updating service:", err);
      alert("Error updating service. Please try again.");
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await auth.authFetch(`${API_URL}/api/services/${id}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== id));
        alert("Service deleted successfully!");
      } else {
        alert("Failed to delete service. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting service. Please try again.");
    }
  };

  const handleEditGisService = (service: GisService) => {
    setEditingGisService(service);
    setIsEditGisServiceModalOpen(true);
  };

  const deleteGisService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this GIS service? This action cannot be undone.")) return;
    try {
      const res = await auth.authFetch(`${API_URL}/api/gis-services/${id}/`, { method: "DELETE" });
      if (res.ok) {
        setGisServices((prev) => prev.filter((g) => g.id !== id));
        alert("GIS service deleted successfully");
      } else {
        alert("Failed to delete GIS service. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting GIS service. Please try again.");
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsEditServiceModalOpen(true);
  };

  // Project Functions
  const validateProject = (project: Partial<ProjectForm>): string[] => {
    const errors: string[] = [];
    if (!project.title?.trim()) errors.push("Title is required");
    if (!project.shortDescription?.trim())
      errors.push("Short description is required");
    if (project.shortDescription && project.shortDescription.length > 200) {
      errors.push("Short description should be under 200 characters");
    }
    const testimonialQuote =
      project.testimonial_quote ?? project.testimonial?.quote ?? "";
    const testimonialName =
      project.testimonial_name ?? project.testimonial?.name ?? "";
    if (testimonialQuote && !testimonialName) {
      errors.push("Client name is required if testimonial is provided");
    }
    return errors;
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    isEdit: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isEdit) {
        setEditedProject((prev) => ({
          ...prev,
          [field]: file,
        }));
      } else {
        setNewProject((prev) => ({
          ...prev,
          [field]: file,
        }));
      }
    }
  };

  const addProject = async (newProjectData: Partial<ProjectForm>) => {
    const validationErrors = validateProject(newProjectData);
    if (validationErrors.length > 0) {
      alert(`Please fix the following errors:\n${validationErrors.join("\n")}`);
      return;
    }

    try {
      const formData = new FormData();

      // Basic fields
      formData.append("title", newProjectData.title || "");
      formData.append("shortDescription", newProjectData.shortDescription || "");
      formData.append("description", newProjectData.description || "");
      formData.append("category", newProjectData.category || "mobile");
      formData.append("client", newProjectData.client || "");
      formData.append("status", newProjectData.status || "planned");
      formData.append("timeline", newProjectData.timeline || "");
      formData.append("team", newProjectData.team || "");
      formData.append("color", newProjectData.color || "from-blue-500 to-purple-600");
      formData.append("icon", newProjectData.icon || "Briefcase");
      formData.append("details", newProjectData.details || "");
      formData.append("liveUrl", newProjectData.liveUrl || "");
      formData.append("videoUrl", newProjectData.videoUrl || "");
      formData.append("featured", newProjectData.featured ? "true" : "false");
      if (newProjectData.sortOrder !== undefined) {
      formData.append("sortOrder", String(newProjectData.sortOrder));
    }

      // Send as proper JSON strings
      formData.append("technologies", JSON.stringify(
        typeof newProjectData.technologies === "string"
          ? newProjectData.technologies
            .split(",")
            .map((tech: string) => tech.trim())
            .filter((tech: string) => tech)
          : Array.isArray(newProjectData.technologies)
            ? newProjectData.technologies
            : []
      ));

      formData.append("challenges", JSON.stringify(
        typeof newProjectData.challenges === "string"
          ? newProjectData.challenges
            .split("\n")
            .map((challenge: string) => challenge.trim())
            .filter((challenge: string) => challenge)
          : Array.isArray(newProjectData.challenges)
            ? newProjectData.challenges
            : []
      ));

      formData.append("outcomes", JSON.stringify(
        typeof newProjectData.outcomes === "string"
          ? newProjectData.outcomes
            .split("\n")
            .map((outcome: string) => outcome.trim())
            .filter((outcome: string) => outcome)
          : Array.isArray(newProjectData.outcomes)
            ? newProjectData.outcomes
            : []
      ));

      // Default empty values for other JSON fields
      formData.append("stats", JSON.stringify(newProjectData.stats || {}));
      formData.append("gallery", JSON.stringify(newProjectData.gallery || []));

      // Testimonial fields
      formData.append("testimonial_name", newProjectData.testimonial?.name || "");
      formData.append("testimonial_role", newProjectData.testimonial?.role || "");
      formData.append("testimonial_image", newProjectData.testimonial?.image || "");
      formData.append("testimonial_quote", newProjectData.testimonial?.quote || "");
      formData.append("testimonial_rating", newProjectData.testimonial?.rating?.toString() || "5");

      if (isFile(newProjectData.image)) {
        formData.append("image", newProjectData.image);
      }

      const createUrl =
        projectCreateScope === "current" ? `${API_URL}/api/employees/projects/` : `${API_URL}/api/projects/`;
      const res = await auth.authFetch(createUrl, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const created = await res.json();
        if (projectCreateScope === "current") {
          setEmployeeProjects((prev) => [...prev, created]);
        } else {
          setProjects((prev) => [...prev, created]);
        }
        setIsAddProjectModalOpen(false);
        setNewProject({
          title: "",
          shortDescription: "",
          description: "",
          category: "mobile",
          client: "",
          image: "",
          technologies: "",
          status: "planned",
          timeline: "",
          team: "",
          color: "from-blue-500 to-purple-600",
          featured: false,
          details: "",
          challenges: "",
          outcomes: "",
          stats: {},
          gallery: [],
          icon: "Briefcase",
          testimonial: undefined,
        });
        alert("Project added successfully!");
      } else {
        const errorData = await res.json();
        console.error("Failed to add project:", errorData);
        alert(`Failed to add project: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error adding project:", err);
      alert("Error adding project. Please try again.");
    }
  };

  const updateProject = async (id: string, updatedData: Partial<ProjectForm>) => {
    const validationErrors = validateProject(updatedData);
    if (validationErrors.length > 0) {
      alert(`Please fix the following errors:\n${validationErrors.join("\n")}`);
      return;
    }

    try {
      const formData = new FormData();

      Object.entries(updatedData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (key === "image") {
          if (value instanceof File) {
            formData.append("image", value);
          }
          return;
        } else if (key === "technologies") {
          formData.append(
            key,
            JSON.stringify(
              typeof value === "string"
                ? value
                  .split(",")
                  .map((tech: string) => tech.trim())
                  .filter((tech: string) => tech)
                : Array.isArray(value)
                  ? value
                  : []
            )
          );
        } else if (key === "challenges") {
          formData.append(
            key,
            JSON.stringify(
              typeof value === "string"
                ? value
                  .split("\n")
                  .map((challenge: string) => challenge.trim())
                  .filter((challenge: string) => challenge)
                : Array.isArray(value)
                  ? value
                  : []
            )
          );
        } else if (key === "outcomes") {
          formData.append(
            key,
            JSON.stringify(
              typeof value === "string"
                ? value
                  .split("\n")
                  .map((outcome: string) => outcome.trim())
                  .filter((outcome: string) => outcome)
                : Array.isArray(value)
                  ? value
                  : []
            )
          );
        } else if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === "boolean") {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value.toString());
        }
      });

      const res = await auth.authFetch(`${API_URL}/api/projects/${id}/`, { method: "PUT", body: formData });

      const responseData = await res.json();

      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? responseData : p))
        );
        setIsEditProjectModalOpen(false);
        setEditingProject(null);
        setEditedProject({});
        alert("Project updated successfully!");
      } else {
        console.error("Failed to update project:", responseData);
        alert(`Failed to update project: ${JSON.stringify(responseData)}`);
      }
    } catch (err) {
      console.error("Error updating project:", err);
      alert("Error updating project. Please try again.");
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await auth.authFetch(`${API_URL}/api/projects/${id}/`, { method: "DELETE" });

      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        alert("Project deleted successfully!");
      } else {
        alert("Failed to delete project. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting project. Please try again.");
    }
  };

  const handleEditProject = (project: Project) => {
    const mappedProject = {
      ...project,
      shortDescription: project.shortDescription || "",
      liveUrl: project.liveUrl || "",
      videoUrl: project.videoUrl || "",
      testimonial: project.testimonial_name
        ? {
          name: project.testimonial_name,
          role: project.testimonial_role || "",
          image: project.testimonial_image || "",
          quote: project.testimonial_quote || "",
          rating: project.testimonial_rating || 5,
        }
        : undefined,
      technologies: Array.isArray(project.technologies)
        ? project.technologies.join(", ")
        : project.technologies || "",
      challenges: Array.isArray(project.challenges)
        ? project.challenges.join("\n")
        : project.challenges || "",
      outcomes: Array.isArray(project.outcomes)
        ? project.outcomes.join("\n")
        : project.outcomes || "",
    };

    setEditingProject(mappedProject);
    setEditedProject({});
    setIsEditProjectModalOpen(true);
  };

  const resetNewProjectForm = () => {
    setNewProject({
      title: "",
      shortDescription: "",
      description: "",
      category: "mobile",
      client: "",
      image: "",
      technologies: "",
      status: "planned",
      timeline: "",
      team: "",
      color: "from-blue-500 to-purple-600",
      featured: false,
      details: "",
      challenges: "",
      outcomes: "",
      stats: {},
      gallery: [],
      icon: "Briefcase",
      testimonial: undefined,
    });
  };

  // Gallery Functions
  const resetGalleryForm = () => {
    setNewGalleryItem({
      title: "",
      description: "",
      category: "office",
      image: null,
    });
  };

  const addGalleryItem = async (newItem: Partial<GalleryItemForm>) => {
    setIsAddingGallery(true);
    try {
      const formData = new FormData();
      formData.append("title", newItem.title || "");
      formData.append("description", newItem.description || "");
      formData.append("category", newItem.category || "office");

      if (newItem.image instanceof File) {
        formData.append("image", newItem.image);
      }

      if (newItem.tags) {
        formData.append("tags", JSON.stringify(newItem.tags));
      }

      const res = await auth.authFetch(`${API_URL}/api/gallery/`, { method: "POST", body: formData });

      if (res.ok) {
        const created = await res.json();
        setGallery((prev) => [...prev, created]);
        setIsAddGalleryModalOpen(false);
        resetGalleryForm();
        setShowToast(true);
      } else {
        const errorData = await res.json();
        console.error("Failed to add gallery item:", errorData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingGallery(false);
    }
  };

  const updateGalleryItem = async (
    id: string,
    updatedData: Partial<GalleryItemForm>
  ) => {
    try {
      const formData = new FormData();

      Object.entries(updatedData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (key === "image") {
          if (value instanceof File) {
            formData.append("image", value);
          }
          return;
        }

        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      });

      const res = await auth.authFetch(`${API_URL}/api/gallery/${id}/`, { method: "PUT", body: formData });

      if (res.ok) {
        const updated = await res.json();
        setGallery((prev) => prev.map((g) => (g.id === id ? updated : g)));
        setEditingGalleryId(null);
        setEditedGallery({});
      } else {
        const errorData = await res.json();
        console.error("Failed to update gallery item:", errorData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteGalleryItem = async (id: string) => {
    try {
      const res = await auth.authFetch(`${API_URL}/api/gallery/${id}/`, { method: "DELETE" });
      if (res.ok) {
        setGallery((prev) => prev.filter((g) => g.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Product Functions
  const normalizeStringList = (value: unknown): string[] => {
    const fromArray = (arr: unknown[]): string[] => {
      const out: string[] = [];
      const stack = [...arr];
      while (stack.length) {
        const item = stack.shift();
        if (Array.isArray(item)) {
          stack.unshift(...item);
          continue;
        }
        if (item === undefined || item === null) continue;
        if (typeof item === "string") {
          const s = item.trim();
          if (s) out.push(s);
          continue;
        }
        if (typeof item === "object") {
          const maybeValue = (item as any).value;
          if (typeof maybeValue === "string") {
            const s = maybeValue.trim();
            if (s) out.push(s);
            continue;
          }
        }
        const s = String(item).trim();
        if (s) out.push(s);
      }
      return out;
    };

    if (Array.isArray(value)) return fromArray(value);
    if (typeof value === "string") {
      const s = value.trim();
      if (!s) return [];
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return fromArray(parsed);
      } catch {
        // ignore
      }
      return s
        .split(/\r?\n|,/g)
        .map((x) => x.trim())
        .filter(Boolean);
    }
    if (value === undefined || value === null) return [];
    return [String(value).trim()].filter(Boolean);
  };

  const normalizeStatsList = (
    value: unknown
  ): { label: string; value: string }[] => {
    const fromArray = (arr: unknown[]): { label: string; value: string }[] => {
      const out: { label: string; value: string }[] = [];
      for (const item of arr) {
        if (item === undefined || item === null) continue;
        if (Array.isArray(item)) {
          const label = String(item[0] ?? "").trim();
          const val = String(item[1] ?? "").trim();
          if (label || val) out.push({ label, value: val });
          continue;
        }
        if (typeof item === "object") {
          const obj = item as any;
          const label = String(obj.label ?? "").trim();
          const val = String(obj.value ?? "").trim();
          if (label || val) out.push({ label, value: val });
          continue;
        }
      }
      return out;
    };

    if (Array.isArray(value)) return fromArray(value);
    if (typeof value === "string") {
      const s = value.trim();
      if (!s) return [];
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return fromArray(parsed);
      } catch {
        // ignore
      }
      return [];
    }
    if (value && typeof value === "object") {
      return Object.entries(value as Record<string, unknown>)
        .map(([k, v]) => ({ label: String(k).trim(), value: String(v ?? "").trim() }))
        .filter((x) => x.label || x.value);
    }
    return [];
  };

  const validateProduct = (product: Partial<Product>): string[] => {
    const errors: string[] = [];
    if (!product.name?.trim()) errors.push("Product name is required");
    if (!product.tagline?.trim()) errors.push("Tagline is required");
    if (!product.description?.trim()) errors.push("Description is required");
    if (!product.fullDescription?.trim())
      errors.push("Full description is required");
    if (normalizeStringList(product.features).length === 0)
      errors.push("At least one feature is required");
    return errors;
  };

  const addProduct = async (newProductData: Partial<Product>) => {
    const validationErrors = validateProduct(newProductData);
    if (validationErrors.length > 0) {
      alert(`Please fix the following errors:\n${validationErrors.join("\n")}`);
      return;
    }

    try {
      const formData = new FormData();
      const skipKeys = new Set(["id", "createdAt", "updatedAt", "gallery"]);
      const stringListKeys = new Set([
        "features",
        "outcomes",
        "challenges",
        "technologies",
        "platforms",
        "integrations",
        "support",
      ]);

      Object.keys(newProductData).forEach((key) => {
        if (skipKeys.has(key)) return;
        const value = newProductData[key as keyof Product];

        if (value === undefined || value === null) return;

        if (value instanceof File) {
          if (key === "cover") {
            formData.append("cover", value);
          }
          return;
        }

        if (key.startsWith("gallery_")) {
          if (value instanceof File) {
            formData.append(key, value);
          }
          return;
        }

        if (key === "stats") {
          const normalizedStats = normalizeStatsList(value);
          normalizedStats.forEach((s) => formData.append(key, JSON.stringify(s)));
          return;
        }

        if (stringListKeys.has(key)) {
          const normalizedList = normalizeStringList(value);
          normalizedList.forEach((item) => formData.append(key, item));
          return;
        }

        if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
          return;
        }

        if (typeof value === "boolean") {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value.toString());
        }
      });

      Object.keys(newProductData).forEach((key) => {
        if (key.startsWith("gallery_")) {
          const value = newProductData[key as keyof Product];
          if (value instanceof File) {
            formData.append(key, value);
          }
        }
      });

      const res = await auth.authFetch(`${API_URL}/api/products/`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const created = await res.json();
        setProducts((prev) => [...prev, created]);
        setIsAddProductModalOpen(false);
        resetNewProductForm();
        alert("Product added successfully!");
      } else {
        let body: unknown = null;
        try {
          body = await res.json();
        } catch {
          body = await res.text().catch(() => "");
        }

        const category =
          res.status === 400
            ? "Backend validation error"
            : res.status === 401 || res.status === 403
              ? "Auth error"
              : res.status >= 500
                ? "Backend server error"
                : "Request failed";

        alert(`${category} (HTTP ${res.status}): ${typeof body === "string" ? body : JSON.stringify(body)}`);
      }
    } catch (err) {
      console.error("Error adding product:", err);
      if (err instanceof Error && err.message === "Not authenticated") {
        alert("Frontend auth error: Not authenticated. Please login again.");
      } else {
        alert("Network/Frontend error adding product. Please try again.");
      }
    }
  };

  const updateProduct = async (id: string, updatedData: Partial<Product>) => {
    const validationErrors = validateProduct(updatedData);
    if (validationErrors.length > 0) {
      alert(`Please fix the following errors:\n${validationErrors.join("\n")}`);
      return;
    }

    try {
      const formData = new FormData();
      const skipKeys = new Set(["id", "createdAt", "updatedAt", "gallery"]);
      const stringListKeys = new Set([
        "features",
        "outcomes",
        "challenges",
        "technologies",
        "platforms",
        "integrations",
        "support",
      ]);

      Object.keys(updatedData).forEach((key) => {
        if (skipKeys.has(key)) return;
        const value = updatedData[key as keyof Product];

        if (value === undefined || value === null) return;

        if (value instanceof File) {
          if (key === "cover") {
            formData.append("cover", value);
          }
          return;
        }

        if (key.startsWith("gallery_")) {
          if (value instanceof File) {
            formData.append(key, value);
          }
          return;
        }

        if (key === "stats") {
          const normalizedStats = normalizeStatsList(value);
          normalizedStats.forEach((s) => formData.append(key, JSON.stringify(s)));
          return;
        }

        if (stringListKeys.has(key)) {
          const normalizedList = normalizeStringList(value);
          normalizedList.forEach((item) => formData.append(key, item));
          return;
        }

        if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
          return;
        }

        if (typeof value === "boolean") {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value.toString());
        }
      });

      Object.keys(updatedData).forEach((key) => {
        if (key.startsWith("gallery_")) {
          const value = updatedData[key as keyof Product];
          if (value instanceof File) {
            formData.append(key, value);
          }
        }
      });

      const res = await auth.authFetch(`${API_URL}/api/products/${id}/`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        const updated = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        setIsEditProductModalOpen(false);
        setEditingProduct(null);
        setEditedProduct({});
        alert("Product updated successfully!");
      } else {
        let body: unknown = null;
        try {
          body = await res.json();
        } catch {
          body = await res.text().catch(() => "");
        }

        const category =
          res.status === 400
            ? "Backend validation error"
            : res.status === 401 || res.status === 403
              ? "Auth error"
              : res.status >= 500
                ? "Backend server error"
                : "Request failed";

        alert(`${category} (HTTP ${res.status}): ${typeof body === "string" ? body : JSON.stringify(body)}`);
      }
    } catch (err) {
      console.error("Error updating product:", err);
      if (err instanceof Error && err.message === "Not authenticated") {
        alert("Frontend auth error: Not authenticated. Please login again.");
      } else {
        alert("Network/Frontend error updating product. Please try again.");
      }
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await auth.authFetch(`${API_URL}/api/products/${id}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        alert("Product deleted successfully!");
      } else {
        alert("Failed to delete product. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting product. Please try again.");
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditedProduct({});
    setIsEditProductModalOpen(true);
  };

  const resetNewProductForm = () => {
    setNewProduct({
      name: "",
      tagline: "",
      iconText: "",
      color: "from-blue-500 to-purple-600",
      cover: "",
      gallery: [],
      description: "",
      fullDescription: "",
      features: [],
      outcomes: [],
      challenges: [],
      technologies: [],
      stats: [],
      liveUrl: "",
      status: "In Development",
      category: "education",
    
      platforms: [],
      integrations: [],
      support: [],
      documentationUrl: "",
      demoUrl: "",
      pricing: "",
      featured: false,
      sortOrder: 0,
    });
  };
  const ProjectModal = ({
    isOpen,
    onClose,
    project,
    onSave,
    isEdit = false,
  }: {
    isOpen: boolean;
    onClose: () => void;
    project: Partial<ProjectForm>;
    onSave: (project: Partial<ProjectForm>) => void;
    isEdit?: boolean;
  }) => {
    const [activeTab, setActiveTab] = useState("basic");
    const [allProjects, setAllProjects] = useState<(Project & { sortOrder?: number })[]>([]);
    const [availableSortOrders, setAvailableSortOrders] = useState<number[]>([]);
    useEffect(() => {
  if (isOpen) {
    fetchAllProjects();
    }
    }, [isOpen]);

const fetchAllProjects = async () => {
  try {
    const res = await auth.authFetch(`${API_URL}/api/projects/`, { method: "GET" });
    if (res.ok) {
      const projects = await res.json();
      setAllProjects(projects);
    // Generate available sort orders (1 to total projects + 1)
      const maxOrder = Math.max(...projects.map((p: Project) => p.sortOrder || 0), 0);
      const orders = [];
      for (let i = 1; i <= maxOrder + 1; i++) {
        orders.push(i);
      }
      setAvailableSortOrders(orders);
    }
  } catch (err) {
    console.error("Error fetching projects for sort order:", err);
  }
};

// Helper function to get project title by sort order
const getProjectTitleByOrder = (order: number) => {
  if (!allProjects.length) return "";
  const project = allProjects.find(p => p.sortOrder === order && p.id !== localProject.id);
  return project ? project.title : "Empty slot";
};

// Helper to check if an order is taken
    const isOrderTaken = (order: number) => {
    if (!allProjects.length) return false;
    return allProjects.some(p => p.sortOrder === order && p.id !== localProject.id);
    };  
    const [localProject, setLocalProject] = useState<Partial<ProjectForm>>(() => {
      if (isEdit && project) {
        return {
          ...project,
          testimonial: project.testimonial_name
            ? {
              name: project.testimonial_name,
              role: project.testimonial_role || "",
              image: project.testimonial_image || "",
              quote: project.testimonial_quote || "",
              rating: project.testimonial_rating || 5,
            }
            : undefined,
          technologies: Array.isArray(project.technologies)
            ? project.technologies.join(", ")
            : project.technologies || "",
          challenges: Array.isArray(project.challenges)
            ? project.challenges.join("\n")
            : project.challenges || "",
          outcomes: Array.isArray(project.outcomes)
            ? project.outcomes.join("\n")
            : project.outcomes || "",
        };
      }
      return project;
    });

    useEffect(() => {
      setLocalProject(project);
    }, [project]);

    if (!isOpen) return null;

    const handleSave = () => {
      const backendData: any = {
        ...localProject,
      };

      if (typeof localProject.technologies === "string") {
        backendData.technologies = localProject.technologies;
      } else if (Array.isArray(localProject.technologies)) {
        backendData.technologies = localProject.technologies.join(", ");
      } else {
        backendData.technologies = "";
      }

      if (typeof localProject.challenges === "string") {
        backendData.challenges = localProject.challenges;
      } else if (Array.isArray(localProject.challenges)) {
        backendData.challenges = localProject.challenges.join("\n");
      } else {
        backendData.challenges = "";
      }

      if (typeof localProject.outcomes === "string") {
        backendData.outcomes = localProject.outcomes;
      } else if (Array.isArray(localProject.outcomes)) {
        backendData.outcomes = localProject.outcomes.join("\n");
      } else {
        backendData.outcomes = "";
      }

      if (localProject.testimonial) {
        backendData.testimonial_name = localProject.testimonial.name || "";
        backendData.testimonial_role = localProject.testimonial.role || "";
        backendData.testimonial_image = localProject.testimonial.image || "";
        backendData.testimonial_quote = localProject.testimonial.quote || "";
        backendData.testimonial_rating = localProject.testimonial.rating || 5;
      } else {
        backendData.testimonial_name = "";
        backendData.testimonial_role = "";
        backendData.testimonial_image = "";
        backendData.testimonial_quote = "";
        backendData.testimonial_rating = 5;
      }
      if (localProject.sortOrder !== undefined) {
        backendData.sortOrder = localProject.sortOrder;
      }
      delete backendData.testimonial;

      backendData.stats = backendData.stats || {};
      backendData.gallery = backendData.gallery || [];
      backendData.featured = backendData.featured || false;

      console.log("Saving project with sortOrder:", backendData.sortOrder); 
      onSave(backendData);
    };

    const handleImageUpload = (
      e: React.ChangeEvent<HTMLInputElement>,
      field: string
    ) => {
      const file = e.target.files?.[0];
      if (file) {
        setLocalProject((prev) => ({
          ...prev,
          [field]: file,
        }));
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {isEdit ? "Edit Project" : "Add New Project"}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-6 gap-1">
                <TabsTrigger
                  value="basic"
                  className="text-xs py-2 px-1 truncate"
                >
                  Basic
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="text-xs py-2 px-1 truncate"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="text-xs py-2 px-1 truncate"
                >
                  Media
                </TabsTrigger>
                <TabsTrigger
                  value="testimonial"
                  className="text-xs py-2 px-1 truncate"
                >
                  Testimonial
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="text-xs py-2 px-1 truncate"
                >
                  Advanced
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      value={localProject.title || ""}
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          title: e.target.value,
                        })
                      }
                      placeholder="Enter project title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      value={localProject.category}
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          category: e.target.value,
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {projectCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="shortDescription">
                      Short Description *
                    </Label>
                    <Input
                      id="shortDescription"
                      value={localProject.shortDescription || ""}
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          shortDescription: e.target.value,
                        })
                      }
                      placeholder="Short description for cards"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {localProject.shortDescription?.length || 0}/200
                      characters
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={localProject.status}
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          status: e.target.value as any,
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="planned">Planned</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="client">Client</Label>
                    <Input
                      id="client"
                      value={localProject.client || ""}
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          client: e.target.value,
                        })
                      }
                      placeholder="Client name or organization"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeline">Timeline</Label>
                    <Input
                      id="timeline"
                      value={localProject.timeline || ""}
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          timeline: e.target.value,
                        })
                      }
                      placeholder="e.g., 6 months, Q2 2024"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={localProject.description || ""}
                    onChange={(e) =>
                      setLocalProject({
                        ...localProject,
                        description: e.target.value,
                      })
                    }
                    placeholder="Detailed project description..."
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div>
                  <Label htmlFor="details">Project Details</Label>
                  <Textarea
                    id="details"
                    value={localProject.details || ""}
                    onChange={(e) =>
                      setLocalProject({
                        ...localProject,
                        details: e.target.value,
                      })
                    }
                    placeholder="Comprehensive project overview, technical details, approach..."
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="team">Team</Label>
                    <Input
                      id="team"
                      value={localProject.team || ""}
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          team: e.target.value,
                        })
                      }
                      placeholder="e.g., 3 developers, 1 designer, 1 PM"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="technologies">
                      Technologies (comma separated)
                    </Label>
                    <Input
                      id="technologies"
                      value={
                        Array.isArray(localProject.technologies)
                          ? localProject.technologies.join(", ")
                          : localProject.technologies || ""
                      }
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          technologies: e.target.value,
                        })
                      }
                      placeholder="React, Node.js, MongoDB, AWS"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="challenges">
                      Challenges (one per line)
                    </Label>
                    <Textarea
                      id="challenges"
                      value={
                        Array.isArray(localProject.challenges)
                          ? localProject.challenges.join("\n")
                          : localProject.challenges || ""
                      }
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          challenges: e.target.value,
                        })
                      }
                      placeholder="Key challenges faced during project..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="outcomes">Outcomes (one per line)</Label>
                    <Textarea
                      id="outcomes"
                      value={
                        Array.isArray(localProject.outcomes)
                          ? localProject.outcomes.join("\n")
                          : localProject.outcomes || ""
                      }
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          outcomes: e.target.value,
                        })
                      }
                      placeholder="Key results and achievements..."
                      rows={4}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="image">Upload Main Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "image")}
                      className="h-10"
                    />
                    {isFile(localProject.image) && (
                      <p className="text-xs text-green-600 mt-1">
                        Selected: {localProject.image.name}
                      </p>
                    )}
                    {typeof localProject.image === "string" &&
                      localProject.image && (
                        <p className="text-xs text-gray-600 mt-1">
                          Current image: {localProject.image}
                        </p>
                      )}
                  </div>
                  <div>
                    <Label htmlFor="liveUrl">Live Project URL</Label>
                    <Input
                      id="liveUrl"
                      value={localProject.liveUrl || ""}
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          liveUrl: e.target.value,
                        })
                      }
                      placeholder="https://project-domain.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <Input
                      id="videoUrl"
                      value={localProject.videoUrl || ""}
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          videoUrl: e.target.value,
                        })
                      }
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="gallery">
                      Gallery Images (comma separated URLs)
                    </Label>
                    <Input
                      id="gallery"
                      value={localProject.gallery?.join(", ") || ""}
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          gallery: e.target.value
                            .split(",")
                            .map((url) => url.trim())
                            .filter((url) => url !== ""),
                        })
                      }
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="testimonial" className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Client Testimonial
                    </span>
                  </div>
                  <p className="text-blue-700 text-xs mt-1">
                    Add a client testimonial to showcase feedback for this
                    project.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="testimonialName">Client Name</Label>
                    <Input
                      id="testimonialName"
                      value={localProject.testimonial?.name || ""}
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          testimonial: {
                            ...localProject.testimonial,
                            name: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g., Dr. Sarah Johnson"
                    />
                  </div>
                  <div>
                    <Label htmlFor="testimonialRole">
                      Client Role & Company
                    </Label>
                    <Input
                      id="testimonialRole"
                      value={localProject.testimonial?.role || ""}
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          testimonial: {
                            ...localProject.testimonial,
                            role: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g., Dean of Technology, Westlake University"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="testimonialImage">Client Photo URL</Label>
                    <Input
                      id="testimonialImage"
                      value={localProject.testimonial?.image || ""}
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          testimonial: {
                            ...localProject.testimonial,
                            image: e.target.value,
                          },
                        })
                      }
                      placeholder="https://example.com/client-photo.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="testimonialRating">Rating</Label>
                    <div className="flex items-center gap-2">
                      <select
                        id="testimonialRating"
                        value={localProject.testimonial?.rating || 5}
                        onChange={(e) =>
                          setLocalProject({
                            ...localProject,
                            testimonial: {
                              ...localProject.testimonial,
                              rating: parseInt(e.target.value),
                            },
                          })
                        }
                        className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <option key={rating} value={rating}>
                            {rating} {rating === 1 ? "Star" : "Stars"}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < (localProject.testimonial?.rating || 5)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="testimonialQuote">Testimonial Quote</Label>
                  <Textarea
                    id="testimonialQuote"
                    value={localProject.testimonial?.quote || ""}
                    onChange={(e) =>
                      setLocalProject({
                        ...localProject,
                        testimonial: {
                          ...localProject.testimonial,
                          quote: e.target.value,
                        },
                      })
                    }
                    placeholder="Client's testimonial about the project..."
                    rows={5}
                    className="resize-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeTestimonial"
                    checked={!!localProject.testimonial?.name}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        setLocalProject({
                          ...localProject,
                          testimonial: undefined,
                        });
                      } else {
                        setLocalProject({
                          ...localProject,
                          testimonial: {
                            name: "",
                            role: "",
                            image: "",
                            quote: "",
                            rating: 5,
                          },
                        });
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <Label
                    htmlFor="includeTestimonial"
                    className="text-sm font-medium leading-none"
                  >
                    Include Client Testimonial
                  </Label>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="color">Color Gradient</Label>
                    <select
                      id="color"
                      value={localProject.color}
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          color: e.target.value,
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {colorOptions.map((color) => (
                        <option key={color} value={color}>
                          {color.replace("from-", "").replace("to-", " → ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="icon">Icon</Label>
                    <select
                      id="icon"
                      value={localProject.icon}
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          icon: e.target.value,
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="Briefcase">Briefcase</option>
                      <option value="GraduationCap">Graduation Cap</option>
                      <option value="Brain">Brain (AI)</option>
                      <option value="BarChart">Bar Chart</option>
                      <option value="Database">Database</option>
                      <option value="ShoppingCart">Shopping Cart</option>
                      <option value="Globe">Globe</option>
                      <option value="Server">Server</option>
                      <option value="Blocks">Blocks</option>
                      <option value="Code">Code</option>
                      <option value="Smartphone">Smartphone</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="stat1">Stat 1 Value</Label>
                    <Input
                      id="stat1"
                      placeholder="e.g., 10K+"
                      value={localProject.stats?.users || ""}
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          stats: {
                            ...localProject.stats,
                            users: e.target.value,
                          },
                        })
                      }
                    />
                    <Label
                      htmlFor="stat1Label"
                      className="text-xs text-gray-500 mt-1"
                    >
                      Label (e.g., users)
                    </Label>
                  </div>
                  <div>
                    <Label htmlFor="stat2">Stat 2 Value</Label>
                    <Input
                      id="stat2"
                      placeholder="e.g., 4.8"
                      value={localProject.stats?.rating || ""}
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          stats: {
                            ...localProject.stats,
                            rating: e.target.value,
                          },
                        })
                      }
                    />
                    <Label
                      htmlFor="stat2Label"
                      className="text-xs text-gray-500 mt-1"
                    >
                      Label (e.g., rating)
                    </Label>
                  </div>
                  <div>
                    <Label htmlFor="stat3">Stat 3 Value</Label>
                    <Input
                      id="stat3"
                      placeholder="e.g., 50K+"
                      value={localProject.stats?.downloads || ""}
                      onChange={(e) =>
                        setLocalProject({
                          ...localProject,
                          stats: {
                            ...localProject.stats,
                            downloads: e.target.value,
                          },
                        })
                      }
                    />
                    <Label
                      htmlFor="stat3Label"
                      className="text-xs text-gray-500 mt-1"
                    >
                      Label (e.g., downloads)
                    </Label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={localProject.featured || false}
                    onChange={(e) =>
                      setLocalProject({
                        ...localProject,
                        featured: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label
                    htmlFor="featured"
                    className="text-sm font-medium leading-none"
                  >
                    Featured Project
                  </Label>
                </div>
                <div className="space-y-4">
    <div>
    <Label htmlFor="sortOrder">Sort Position</Label>
    <p className="text-xs text-gray-500 mb-2">
      Choose where this project should appear in the list (1 = first position)
    </p>
    
    <div className="flex flex-col space-y-3">
      {/* Current position indicator */}
      {localProject.sortOrder && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">Current Position</span>
            <Badge className="bg-blue-500">#{localProject.sortOrder}</Badge>
          </div>
        </div>
      )}

      {/* Sort order dropdown */}
      <div className="relative">
        <select
          id="sortOrder"
          value={localProject.sortOrder || ""}
          onChange={(e) => {
            const newOrder = parseInt(e.target.value);
            if (!isNaN(newOrder)) {
              // Show confirmation if order is taken
              if (isOrderTaken(newOrder) && !isEdit) {
                if (!confirm(`Position #${newOrder} is currently occupied by "${getProjectTitleByOrder(newOrder)}". Moving this project here will swap positions. Continue?`)) {
                  return;
                }
              }
              setLocalProject({
                ...localProject,
                sortOrder: newOrder,
              });
            }
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Select position...</option>
          {availableSortOrders.map((order) => {
            const taken = isOrderTaken(order);
            const projectTitle = getProjectTitleByOrder(order);
            const isCurrent = localProject.sortOrder === order;
            
            return (
              <option 
                key={order} 
                value={order}
                disabled={taken && !isCurrent}
                className={taken && !isCurrent ? "text-gray-400" : ""}
              >
                Position #{order} {taken && !isCurrent ? `(Taken by: ${projectTitle})` : isCurrent ? "(Current)" : "(Empty)"}
              </option>
            );
          })}
        </select>
      </div>

      {/* Visual position preview */}
      {availableSortOrders.length > 0 && (
        <div className="mt-4 border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 border-b">
            <span className="text-xs font-medium text-gray-700">Current Order Preview</span>
          </div>
          <div className="p-3 max-h-60 overflow-y-auto">
            {availableSortOrders.slice(0, 10).map((order) => {
              const projectAtPosition = allProjects.find(p => p.sortOrder === order);
              const isThisProject = localProject.sortOrder === order;
              const isSelected = localProject.sortOrder === order;
              
              return (
                <div 
                  key={order}
                  className={`flex items-center gap-3 py-2 border-b last:border-0 text-sm
                    ${isSelected ? 'bg-blue-50 -mx-3 px-3 rounded' : ''}`}
                >
                  <Badge variant="outline" className="w-8 justify-center">
                    #{order}
                  </Badge>
                  <div className="flex-1">
                    {projectAtPosition && !isThisProject ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900">{projectAtPosition.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      </div>
                    ) : isThisProject ? (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 font-medium">
                          {localProject.title || "Current Project"}
                        </span>
                        <Badge className="bg-blue-500 text-xs">
                          New Position
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-gray-400">Empty slot</span>
                    )}
                  </div>
                </div>
              );
            })}
             {availableSortOrders.length > 10 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                + {availableSortOrders.length - 10} more positions
              </p>
                )}
                  </div>
                 </div>
                  )}
                  </div>
                    <p className="text-xs text-gray-500 mt-2">
                    Lower numbers appear first. Projects with the same sort order will be sorted by creation date.
                 </p>
                </div>
               </div>
              </TabsContent>
            </Tabs>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!localProject.title || !localProject.shortDescription}
                className="bg-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? "Update Project" : "Add Project"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  // Product Modal Component - Simplified version
  // Product Modal Component - Fixed version (no blinking on scroll)
  const ProductModal = ({
    isOpen,
    onClose,
    product,
    onSave,
    isEdit = false,
  }: {
    isOpen: boolean;
    onClose: () => void;
    product: Partial<Product>;
    onSave: (product: Partial<Product>) => void;
    isEdit?: boolean;
  }) => {
    const [activeTab, setActiveTab] = useState("basic");
    const isInitialMount = useRef(true);

    // Use a state that persists across re-renders
    const [localProduct, setLocalProduct] = useState<Partial<Product>>(() => {
      return {
        name: "",
        tagline: "",
        iconText: "",
        cover: "",
        description: "",
        fullDescription: "",
        features: [],
        outcomes: [],
        challenges: [],
        technologies: [],
        stats: [],
        liveUrl: "",
        status: "In Development",
        category: "education",
        platforms: [],
        integrations: [],
        support: [],
        documentationUrl: "",
        demoUrl: "",
        featured: false,
        sortOrder: 0,
        ...product,
      };
    });

    // ✅ FIX: Separate state for gallery files (not part of product data)
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [existingGalleryImages, setExistingGalleryImages] = useState<any[]>(
      []
    );

    // Only update when modal opens or product data fundamentally changes
    useEffect(() => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      // Only update when the modal opens with new product data
      if (isOpen && product) {
        setLocalProduct((prev) => ({
          ...prev,
          ...product,
        }));
        // Reset gallery files when editing existing product
        setGalleryFiles([]);
      }
    }, [isOpen, product]);
    // Fetch existing gallery images when editing
    useEffect(() => {
      if (isOpen && isEdit && product?.id) {
        const fetchGalleryImages = async () => {
          try {
            const res = await auth.authFetch(
              `${API_URL}/api/products/${product.id}/gallery/`
            );
            if (res.ok) {
              const galleryData = await res.json();
              setExistingGalleryImages(galleryData);
            } else {
              let body: unknown = null;
              try {
                body = await res.json();
              } catch {
                body = await res.text().catch(() => "");
              }
              console.error("Failed to fetch gallery images:", {
                status: res.status,
                body,
              });
            }
          } catch (err) {
            console.error("Error fetching gallery images:", err);
          }
        };
        fetchGalleryImages();
      } else {
        setExistingGalleryImages([]);
      }
    }, [isOpen, isEdit, product?.id]);

    // Reset form only when modal completely closes
    useEffect(() => {
      if (!isOpen) {
        const timer = setTimeout(() => {
          if (!isEdit) {
            setLocalProduct({
              name: "",
              tagline: "",
              iconText: "",
              cover: "",
              description: "",
              fullDescription: "",
              features: [],
              outcomes: [],
              challenges: [],
              technologies: [],
              stats: [],
              liveUrl: "",
              status: "In Development",
              category: "education",
              platforms: [],
              integrations: [],
              support: [],
              documentationUrl: "",
              demoUrl: "",
              featured: false,
              sortOrder: 0,
            });
            setGalleryFiles([]);
          }
          setActiveTab("basic");
        }, 300);
        return () => clearTimeout(timer);
      }
    }, [isOpen, isEdit]);

    // Don't return null - keep the modal in DOM but hide it
    if (!isOpen) {
      return (
        <div style={{ display: "none" }}>
          {/* Hidden placeholder to maintain state */}
        </div>
      );
    }

    const handleSave = () => {
      // ✅ FIX: Create FormData to properly handle file uploads
      const formData = new FormData();

      // Append all product data
      Object.keys(localProduct).forEach((key) => {
        const value = localProduct[key as keyof Product];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (typeof value === "boolean") {
            formData.append(key, value.toString());
          } else if (isFile(value)) {
            // Files will be handled separately
            if (key === "cover") {
              formData.append("cover", value);
            }
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // ✅ FIX: Append gallery files with proper field names
      galleryFiles.forEach((file, index) => {
        console.log(`🖼️ Adding gallery file gallery_${index}:`, file.name);
        formData.append(`gallery_${index}`, file);
      });

      // Convert FormData back to object for the onSave function
      // This is a bit hacky but maintains your existing API
      const productData: any = {
        ...localProduct,
      };

      // Add gallery files directly to the object
      galleryFiles.forEach((file, index) => {
        productData[`gallery_${index}`] = file;
      });

      console.log("📤 Sending product data with gallery files:", {
        product: localProduct,
        galleryFiles: galleryFiles.map((f) => f.name),
        formDataKeys: Array.from(formData.keys()),
      });

      onSave(productData);
    };

    const handleImageUpload = (
      e: React.ChangeEvent<HTMLInputElement>,
      field: string
    ) => {
      const file = e.target.files?.[0];
      if (file) {
        setLocalProduct((prev) => ({
          ...prev,
          [field]: file,
        }));
      }
    };

    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const newGallery = Array.from(files);
        setGalleryFiles((prev) => [...prev, ...newGallery]);
      }
    };

    const removeGalleryImage = (index: number) => {
      setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    };
    const deleteExistingGalleryImage = async (galleryId: number) => {
      try {
        const res = await auth.authFetch(
          `${API_URL}/api/products/gallery/${galleryId}/`,
          { method: "DELETE" }
        );

        if (res.ok) {
          setExistingGalleryImages((prev) =>
            prev.filter((img) => img.id !== galleryId)
          );
        } else {
          let body: unknown = null;
          try {
            body = await res.json();
          } catch {
            body = await res.text().catch(() => "");
          }
          console.error("Failed to delete gallery image:", {
            status: res.status,
            body,
          });
          alert("Failed to delete gallery image");
        }
      } catch (err) {
        console.error("Error deleting gallery image:", err);
        alert("Error deleting gallery image");
      }
    };

    const addFeature = () => {
      setLocalProduct((prev) => ({
        ...prev,
        features: [...(prev.features || []), ""],
      }));
    };

    const updateFeature = (index: number, value: string) => {
      const updatedFeatures = [...(localProduct.features || [])];
      updatedFeatures[index] = value;
      setLocalProduct((prev) => ({
        ...prev,
        features: updatedFeatures,
      }));
    };

    const removeFeature = (index: number) => {
      setLocalProduct((prev) => ({
        ...prev,
        features: prev.features?.filter((_, i) => i !== index) || [],
      }));
    };

    const addStat = () => {
      setLocalProduct((prev) => ({
        ...prev,
        stats: [...(prev.stats || []), { label: "", value: "" }],
      }));
    };

    const updateStat = (index: number, field: string, value: string) => {
      const updatedStats = [...(localProduct.stats || [])];
      updatedStats[index] = { ...updatedStats[index], [field]: value };
      setLocalProduct((prev) => ({
        ...prev,
        stats: updatedStats,
      }));
    };

    const removeStat = (index: number) => {
      setLocalProduct((prev) => ({
        ...prev,
        stats: prev.stats?.filter((_, i) => i !== index) || [],
      }));
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {isEdit ? "Edit Product" : "Add New Product"}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 mb-6 gap-1">
                <TabsTrigger
                  value="basic"
                  className="text-xs py-2 px-1 truncate"
                >
                  Basic Info
                </TabsTrigger>
                <TabsTrigger
                  value="description"
                  className="text-xs py-2 px-1 truncate"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="text-xs py-2 px-1 truncate"
                >
                  Media
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="text-xs py-2 px-1 truncate"
                >
                  Advanced
                </TabsTrigger>
              </TabsList>

              {/* BASIC TAB */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={localProduct.name || ""}
                      onChange={(e) =>
                        setLocalProduct({
                          ...localProduct,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tagline">Tagline *</Label>
                    <Input
                      id="tagline"
                      value={localProduct.tagline || ""}
                      onChange={(e) =>
                        setLocalProduct({
                          ...localProduct,
                          tagline: e.target.value,
                        })
                      }
                      placeholder="Short catchy tagline"
                    />
                  </div>
                  <div>
                    <Label htmlFor="iconText">Icon Text</Label>
                    <Input
                      id="iconText"
                      value={localProduct.iconText || ""}
                      onChange={(e) =>
                        setLocalProduct({
                          ...localProduct,
                          iconText: e.target.value,
                        })
                      }
                      placeholder="Single character or short text"
                      maxLength={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      value={localProduct.category}
                      onChange={(e) =>
                        setLocalProduct({
                          ...localProduct,
                          category: e.target.value,
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {productCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={localProduct.status}
                      onChange={(e) =>
                        setLocalProduct({
                          ...localProduct,
                          status: e.target.value as any,
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="Live">Live</option>
                      <option value="In Development">In Development</option>
                      <option value="Coming Soon">Coming Soon</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="liveUrl">Live URL</Label>
                    <Input
                      id="liveUrl"
                      value={localProduct.liveUrl || ""}
                      onChange={(e) =>
                        setLocalProduct({
                          ...localProduct,
                          liveUrl: e.target.value,
                        })
                      }
                      placeholder="https://product-domain.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="demoUrl">Demo URL</Label>
                    <Input
                      id="demoUrl"
                      value={localProduct.demoUrl || ""}
                      onChange={(e) =>
                        setLocalProduct({
                          ...localProduct,
                          demoUrl: e.target.value,
                        })
                      }
                      placeholder="https://demo.product.com"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* DESCRIPTION TAB */}
              <TabsContent value="description" className="space-y-4">
                <div>
                  <Label htmlFor="description">Short Description *</Label>
                  <Textarea
                    id="description"
                    value={localProduct.description || ""}
                    onChange={(e) =>
                      setLocalProduct({
                        ...localProduct,
                        description: e.target.value,
                      })
                    }
                    placeholder="Brief description for product cards..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {localProduct.description?.length || 0}/300 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="fullDescription">Full Description *</Label>
                  <Textarea
                    id="fullDescription"
                    value={localProduct.fullDescription || ""}
                    onChange={(e) =>
                      setLocalProduct({
                        ...localProduct,
                        fullDescription: e.target.value,
                      })
                    }
                    placeholder="Comprehensive product description with details..."
                    rows={6}
                  />
                </div>

                {/* Technologies Field */}
                <div>
                  <Label htmlFor="technologies">Technologies</Label>
                  <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-md min-h-10 bg-white">
                    {localProduct.technologies?.map((tech, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 text-xs"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => {
                            const updatedTech =
                              localProduct.technologies?.filter(
                                (_, i) => i !== index
                              ) || [];
                            setLocalProduct({
                              ...localProduct,
                              technologies: updatedTech,
                            });
                          }}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    <input
                      type="text"
                      className="flex-1 outline-none border-none bg-transparent text-sm min-w-[120px]"
                      placeholder={
                        localProduct.technologies?.length === 0
                          ? "Type technology and press Enter or comma..."
                          : "Add more technologies..."
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          const value = e.currentTarget.value.trim();
                          if (
                            value &&
                            !localProduct.technologies?.includes(value)
                          ) {
                            const updatedTech = [
                              ...(localProduct.technologies || []),
                              value,
                            ];
                            setLocalProduct({
                              ...localProduct,
                              technologies: updatedTech,
                            });
                            e.currentTarget.value = "";
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (
                          value &&
                          !localProduct.technologies?.includes(value)
                        ) {
                          const updatedTech = [
                            ...(localProduct.technologies || []),
                            value,
                          ];
                          setLocalProduct({
                            ...localProduct,
                            technologies: updatedTech,
                          });
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Type technology and press Enter or comma to add. Click × to
                    remove.
                  </p>
                </div>

                {/* Outcomes and Challenges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="outcomes">Outcomes</Label>
                      <Badge variant="outline" className="text-xs">
                        {localProduct.outcomes?.length || 0} items
                      </Badge>
                    </div>
                    <Textarea
                      id="outcomes"
                      value={localProduct.outcomes?.join("\n") || ""}
                      onChange={(e) => {
                        const lines = e.target.value.split("\n");
                        setLocalProduct({
                          ...localProduct,
                          outcomes: lines,
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          return;
                        }
                      }}
                      placeholder={`Enter each outcome on a new line:\n• Improved efficiency\n• Cost reduction\n• Better user experience`}
                      rows={5}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Press Enter to create new lines. Each line becomes a
                      separate outcome.
                    </p>

                    {localProduct.outcomes &&
                      localProduct.outcomes.filter((line) => line.trim() !== "")
                        .length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded border">
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Preview:
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {localProduct.outcomes
                              .filter((line) => line.trim() !== "")
                              .map((outcome, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-green-500 mr-2">•</span>
                                  <span>{outcome}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="challenges">Challenges</Label>
                      <Badge variant="outline" className="text-xs">
                        {localProduct.challenges?.length || 0} items
                      </Badge>
                    </div>
                    <Textarea
                      id="challenges"
                      value={localProduct.challenges?.join("\n") || ""}
                      onChange={(e) => {
                        const lines = e.target.value.split("\n");
                        setLocalProduct({
                          ...localProduct,
                          challenges: lines,
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          return;
                        }
                      }}
                      placeholder={`Enter each challenge on a new line:\n• Scalability issues\n• Performance optimization\n• Integration complexity`}
                      rows={5}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Press Enter to create new lines. Each line becomes a
                      separate challenge.
                    </p>

                    {localProduct.challenges &&
                      localProduct.challenges.filter(
                        (line) => line.trim() !== ""
                      ).length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded border">
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Preview:
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {localProduct.challenges
                              .filter((line) => line.trim() !== "")
                              .map((challenge, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-blue-500 mr-2">•</span>
                                  <span>{challenge}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              </TabsContent>

              {/* MEDIA TAB - FIXED */}
              <TabsContent value="media" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cover">Cover Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "cover")}
                      className="h-10"
                    />
                    {isFile(localProduct.cover) && (
                      <p className="text-xs text-green-600 mt-1">
                        Selected: {localProduct.cover.name}
                      </p>
                    )}
                    {typeof localProduct.cover === "string" &&
                      localProduct.cover && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600">
                            Current cover image:
                          </p>
                          <img
                            src={`${API_URL}${localProduct.cover}`}
                            alt="Cover preview"
                            className="w-32 h-32 object-cover rounded-lg mt-1"
                          />
                        </div>
                      )}
                  </div>
                  <div>
                    <Label htmlFor="gallery">Gallery Images</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                      className="h-10"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Select multiple images for product gallery
                    </p>
                  </div>
                </div>

                {/* ✅ FIXED: Gallery Preview showing BOTH existing and new images */}
                {(galleryFiles.length > 0 ||
                  existingGalleryImages.length > 0) && (
                    <div>
                      <Label>
                        Gallery Preview ({galleryFiles.length} new,{" "}
                        {existingGalleryImages.length} existing)
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        {/* Existing gallery images */}
                        {existingGalleryImages.map((image, index) => (
                          <div
                            key={`existing-${image.id}`}
                            className="relative group"
                          >
                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              <img
                                src={`${API_URL}${image.image}`}
                                alt={`Existing gallery ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteExistingGalleryImage(image.id)}
                              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}

                        {/* New gallery files */}
                        {galleryFiles.map((file, index) => (
                          <div key={`new-${index}`} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`New gallery ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeGalleryImage(index)}
                              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Show message if gallery is empty */}
                {galleryFiles.length === 0 &&
                  existingGalleryImages.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">
                        No gallery images added yet
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Upload images using the file input above
                      </p>
                    </div>
                  )}
              </TabsContent>

              {/* ADVANCED TAB */}
              <TabsContent value="advanced" className="space-y-4">
                {/* Features Section */}
                <div className="flex justify-between items-center">
                  <Label>Features *</Label>
                  <Button type="button" onClick={addFeature} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Feature
                  </Button>
                </div>

                <div className="space-y-3">
                  {localProduct.features?.map((feature, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Statistics Section */}
                <div className="flex justify-between items-center mt-6">
                  <Label>Statistics</Label>
                  <Button type="button" onClick={addStat} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Stat
                  </Button>
                </div>
                {/* Pricing - Simple string field */}
                <div className="space-y-2 mt-4">
                <label className="text-xs font-medium">
                Pricing
                </label>
              <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={localProduct.pricing || ""}
              onChange={(e) =>
              setLocalProduct(prev => ({
              ...prev,
              pricing: e.target.value
            }))
          }
        placeholder="e.g. Free, ₹499/month, Custom Pricing"
        />
        <p className="text-xs text-gray-500 mt-1">
         This text will be displayed on the product card
        </p>
        </div>
                <div className="space-y-3">
                  {localProduct.stats?.map((stat, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <Input
                        value={stat.label}
                        onChange={(e) =>
                          updateStat(index, "label", e.target.value)
                        }
                        placeholder="Label (e.g., Active Users)"
                      />
                      <div className="flex gap-2">
                        <Input
                          value={stat.value}
                          onChange={(e) =>
                            updateStat(index, "value", e.target.value)
                          }
                          placeholder="Value (e.g., 50K+)"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeStat(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Advanced Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <Label htmlFor="documentationUrl">Documentation URL</Label>
                    <Input
                      id="documentationUrl"
                      value={localProduct.documentationUrl || ""}
                      onChange={(e) =>
                        setLocalProduct({
                          ...localProduct,
                          documentationUrl: e.target.value,
                        })
                      }
                      placeholder="https://docs.product.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={localProduct.sortOrder || 0}
                      onChange={(e) =>
                        setLocalProduct({
                          ...localProduct,
                          sortOrder: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lower numbers appear first
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={localProduct.featured || false}
                    onChange={(e) =>
                      setLocalProduct({
                        ...localProduct,
                        featured: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label
                    htmlFor="featured"
                    className="text-sm font-medium leading-none"
                  >
                    Featured Product
                  </Label>
                </div>
              </TabsContent>
            </Tabs>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  !localProduct.name ||
                  !localProduct.tagline ||
                  !localProduct.description ||
                  !localProduct.fullDescription
                }
                className="bg-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };


  // Add this modal component near the other modal components
  const TestimonialModal = ({
    isOpen,
    onClose,
    testimonial,
    onSave,
    isEdit = false,
  }: {
    isOpen: boolean;
    onClose: () => void;
    testimonial: Partial<TestimonialForm>;
    onSave: (testimonial: Partial<TestimonialForm>) => void;
    isEdit?: boolean;
  }) => {
    const [localTestimonial, setLocalTestimonial] = useState<Partial<TestimonialForm>>(() => ({
      name: "",
      company: "",
      role: "",
      text: "",
      image: null,
      linkedin: "",
      status: "active",
      sort_order: 0,
      ...testimonial,
    }));

    useEffect(() => {
      setLocalTestimonial(testimonial);
    }, [testimonial]);

    if (!isOpen) return null;

    const handleSave = () => {
      onSave(localTestimonial);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setLocalTestimonial((prev) => ({
          ...prev,
          image: file,
        }));
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {isEdit ? "Edit Testimonial" : "Add Testimonial"}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6 space-y-4">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-24 h-24 mb-4">
                {localTestimonial.image ? (
                  <img
                    src={
                      localTestimonial.image instanceof File
                        ? URL.createObjectURL(localTestimonial.image)
                        : typeof localTestimonial.image === "string" && localTestimonial.image
                          ? localTestimonial.image.startsWith("http")
                            ? localTestimonial.image
                            : `${API_URL}${localTestimonial.image}`
                          : "/brand/avatar.svg"
                    }
                    alt="Profile preview"
                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {localTestimonial.image ? "Change Photo" : "Upload Photo"}
                    </span>
                  </Button>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Recommended: Square photo for best results
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Full Name *</Label>
                <Input
                  value={localTestimonial.name || ""}
                  onChange={(e) =>
                    setLocalTestimonial({
                      ...localTestimonial,
                      name: e.target.value,
                    })
                  }
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Company *</Label>
                <Input
                  value={localTestimonial.company || ""}
                  onChange={(e) =>
                    setLocalTestimonial({
                      ...localTestimonial,
                      company: e.target.value,
                    })
                  }
                  placeholder="Company Name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Role/Title *</Label>
                <Input
                  value={localTestimonial.role || ""}
                  onChange={(e) =>
                    setLocalTestimonial({
                      ...localTestimonial,
                      role: e.target.value,
                    })
                  }
                  placeholder="CEO, Manager, etc."
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">LinkedIn URL</Label>
                <Input
                  value={localTestimonial.linkedin}
                  onChange={(e) =>
                    setLocalTestimonial({
                      ...localTestimonial,
                      linkedin: e.target.value,
                    })
                  }
                  placeholder="https://linkedin.com/in/username"
                  className="mt-1"
                />
                {/* <p className="text-xs text-gray-500 mt-1">
                  Use "/#" if not available
                </p> */}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <select
                  value={localTestimonial.status}
                  onChange={(e) =>
                    setLocalTestimonial({
                      ...localTestimonial,
                      status: e.target.value as "active" | "inactive",
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium">Sort Order</Label>
                <Input
                  type="number"
                  value={localTestimonial.sort_order || 0}
                  onChange={(e) =>
                    setLocalTestimonial({
                      ...localTestimonial,
                      sort_order: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first
                </p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Testimonial Text *</Label>
              <Textarea
                value={localTestimonial.text || ""}
                onChange={(e) =>
                  setLocalTestimonial({
                    ...localTestimonial,
                    text: e.target.value,
                  })
                }
                placeholder="What did the client say about working with us?"
                rows={6}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                {localTestimonial.text?.length || 0} characters
              </p>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!localTestimonial.name || !localTestimonial.company || !localTestimonial.role || !localTestimonial.text}
              className="bg-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEdit ? "Update Testimonial" : "Add Testimonial"}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  };


  // Filtered Data
  const lower = (value: unknown) => (typeof value === "string" ? value.toLowerCase() : "");

  const filteredTeam = teamMembers.filter((m) => {
    const q = teamSearch.toLowerCase();
    const matchesSearch =
      lower(m.name).includes(q) || lower(m.role).includes(q);
    const matchesDept =
      teamDeptFilter === "all" || m.member_type === teamDeptFilter;
    const matchesStatus =
      teamStatusFilter === "all" ||
      m.status?.toLowerCase() === teamStatusFilter.toLowerCase();
    return matchesSearch && matchesDept && matchesStatus;
  });

  const filteredProjects = projects.filter((p) => {
    const q = projectSearch.toLowerCase();
    const matchesSearch =
      lower(p.title).includes(q) || lower(p.shortDescription).includes(q);
    const matchesCategory =
      projectCategoryFilter === "all" || p.category === projectCategoryFilter;
    const matchesStatus =
      projectStatusFilter === "all" || p.status === projectStatusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredGallery = gallery.filter((g) => {
    const q = gallerySearch.toLowerCase();
    const matchesSearch =
      lower(g.title).includes(q) || lower(g.category).includes(q);
    const matchesCategory =
      galleryCategoryFilter === "all" || g.category === galleryCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredProducts = products.filter((p) => {
    const q = productSearch.toLowerCase();
    const matchesSearch =
      lower(p.name).includes(q) || lower(p.tagline).includes(q) || lower(p.description).includes(q);
    const matchesCategory =
      productCategoryFilter === "all" || p.category === productCategoryFilter;
    const matchesStatus =
      productStatusFilter === "all" || p.status === productStatusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredGIServices = gisServices.filter((s) => {
    const q = gisServiceSearch.toLowerCase();
    const matchesSearch =
      lower(s.title).includes(q) || lower(s.description).includes(q);
    const matchesStatus =
      gisServiceStatusFilter === "all" || s.status === gisServiceStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredServices = services.filter((s) => {
    const q = serviceSearch.toLowerCase();
    const matchesSearch =
      lower(s.title).includes(q) || lower(s.description).includes(q);
    const matchesStatus =
      serviceStatusFilter === "all" || s.status === serviceStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTestimonials = testimonials.filter((t) => {
    const q = testimonialSearch.toLowerCase();
    const matchesSearch =
      lower(t.name).includes(q) || lower(t.company).includes(q) || lower(t.role).includes(q);
    const matchesStatus =
      testimonialStatusFilter === "all" || t.status === testimonialStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredEmployees = employees.filter((e) => {
    const q = employeeSearch.toLowerCase();
    const matchesSearch =
      lower(e.name).includes(q) ||
      lower(e.employee_id).includes(q) ||
      lower(e.login_id).includes(q) ||
      lower(e.email).includes(q) ||
      lower(e.phone).includes(q);
    const matchesDesignation =
      employeeDesignationFilter === "all" || e.designation === employeeDesignationFilter;
    const matchesStatus =
      employeeStatusFilter === "all" || e.status === employeeStatusFilter;
    return matchesSearch && matchesDesignation && matchesStatus;
  });

  // Stats calculations
  const activeTeam = teamMembers.filter((m) => m.status === "Active").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const ongoingProjects = projects.filter((p) => p.status === "ongoing").length;
  const liveProducts = products.filter((p) => p.status === "Live").length;
  const activeServices = services.filter((s) => s.status === "active").length;
  const activeTestimonials = testimonials.filter((t) => t.status === 'active').length;
  const activeEmployees = employees.filter((e) => e.status === 'active').length;
  const giServiceActive = gisServices.filter((s) => s.status === 'active').length;

  const handleExport = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    switch (activeTab) {
      case "team":
        downloadCsv(
          `team-${stamp}.csv`,
          teamMembers.map((m) => ({
            name: m.name,
            type: m.member_type,
            role: m.role,
            department: m.department,
            status: m.status,
            location: m.location,
            joinDate: m.joinDate,
          }))
        );
        break;
      case "employees":
        downloadCsv(
          `employees-${stamp}.csv`,
          employees.map((e) => ({
            employee_id: e.employee_id,
            name: e.name,
            designation: e.designation,
            location: e.location,
            employment_type: e.employment_type,
            status: e.status,
            email: e.email ?? "",
            phone: e.phone ?? "",
          }))
        );
        break;
      case "tickets":
        downloadCsv(
          `tickets-${stamp}.csv`,
          employeeTickets.map((t) => ({
            id: t.id ?? t.ticket_id ?? "",
            title: t.title ?? t.ticket_title ?? t.subject ?? "",
            status: t.status ?? "",
            employee: t.employee_name ?? "",
            created_at: t.created_at ?? "",
          }))
        );
        break;
      case "leave-requests":
        downloadCsv(
          `leave-${stamp}.csv`,
          leaveRequests.map((r: any) => ({
            employee: r.employee_name ?? r.employee ?? "",
            type: r.leave_type ?? r.type ?? "",
            status: r.status ?? "",
            from: r.start_date ?? r.from_date ?? "",
            to: r.end_date ?? r.to_date ?? "",
          }))
        );
        break;
      default:
        alert(
          "Export works on Team, Employees, Tickets, and Leave tabs. Switch to one of those sections first."
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 relative">
      {/* Scroll Progress */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500 z-50">
        <div
          className="h-full bg-gradient-to-r from-primary to-purple-500 transition-transform duration-100"
          style={{
            transform: `scaleX(${scrollProgress})`,
            transformOrigin: "0%",
          }}
        />
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          ✅ Image added successfully!
        </div>
      )}

      <div className="container mx-auto px-3 md:px-6 py-20 md:py-24">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Top Header Bar */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <LayoutDashboard className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <h1 className="text-4xl font-bold mb-6 text-card-foreground">
                    Welcome, {user?.username || "Admin"} 👋
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage your content efficiently
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={handleExport}>
                  <Download className="w-3 h-3 mr-1" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-8 gap-3 md:gap-4 mb-6">

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-teal-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mb-1">Testimonials</p>
              <p className="text-2xl font-bold text-gray-900">{testimonials.length}</p>
              <p className="text-xs text-green-600 mt-1">{activeTestimonials} Active</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mb-1">Total Team</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.length}
              </p>
              <p className="text-xs text-green-600 mt-1">{activeTeam} Active</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-amber-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mb-1">Employees</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              <p className="text-xs text-green-600 mt-1">{activeEmployees} Active</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mb-1">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.length}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {ongoingProjects} Ongoing
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mb-1">IT Services</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.length}
              </p>
              <p className="text-xs text-green-600 mt-1">{activeServices} Active</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-cyan-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mb-1">GIS Services</p>
              <p className="text-2xl font-bold text-gray-900">
                {gisServices.length}
              </p>
              <p className="text-xs text-green-600 mt-1">{giServiceActive} Active</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mb-1">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.length}
              </p>
              <p className="text-xs text-green-600 mt-1">{liveProducts} Live</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mb-1">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {completedProjects}
              </p>
              <p className="text-xs text-green-600 mt-1">Projects Done</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-pink-600" />
                </div>
                <Activity className="w-4 h-4 text-pink-500" />
              </div>
              <p className="text-xs text-gray-500 mb-1">Gallery Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {gallery.length}
              </p>
              <p className="text-xs text-gray-600 mt-1">Total Images</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <PenLine className="w-5 h-5 text-indigo-600" />
                </div>
                <BarChart3 className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mb-1">Total Blogs</p>
              <p className="text-2xl font-bold text-gray-900">{blogCount}</p>
              <p className="text-xs text-indigo-600 mt-1">
                {blogDraftCount} drafts saved
              </p>
            </motion.div>
          </div>

          {/* Enhanced Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            orientation="vertical"
            className="w-full flex"
          >
            {/* Sidebar container */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-1 w-64 flex flex-col gap-1">
              <TabsList
                className="flex flex-col w-full h-auto bg-transparent gap-1"
                aria-orientation="vertical"
              >
                <TabsTrigger
                  value="team"
                  className="w-full justify-start text-xs md:text-sm py-2 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Team ({teamMembers.length})
                </TabsTrigger>
                <TabsTrigger
                  value="employees"
                  className="w-full justify-start text-xs md:text-sm py-2 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Employees ({employees.length})
                </TabsTrigger>
                <TabsTrigger
                  value="current-projects"
                  className="w-full justify-start text-xs md:text-sm py-2 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Private Project
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="w-full justify-start text-xs md:text-sm py-2 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Projects ({projects.length})
                </TabsTrigger>
                <TabsTrigger
                  value="services"
                  className="w-full justify-start text-xs md:text-sm py-2 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  IT-Services ({services.length})
                </TabsTrigger>
                <TabsTrigger
                  value="gis-services"
                  className="w-full justify-start text-xs md:text-sm py-2 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  GIS Services ({gisServices.length})
                </TabsTrigger>
                <TabsTrigger
                  value="products"
                  className="w-full justify-start text-xs md:text-sm py-2 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Products ({products.length})
                </TabsTrigger>
                <TabsTrigger
                  value="testimonials"
                  className="w-full justify-start text-xs md:text-sm py-2 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Testimonials ({testimonials.length})
                </TabsTrigger>
                <TabsTrigger
                  value="gallery"
                  className="w-full justify-start text-xs md:text-sm py-2 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Gallery ({gallery.length})
                </TabsTrigger>
                <TabsTrigger
                  value="blog"
                  className="w-full justify-start text-xs md:text-sm py-2 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <PenLine className="w-4 h-4 mr-2" />
                  Blog ({blogCount})
                </TabsTrigger>
                <TabsTrigger
                  value="leave-requests"
                  className="w-full justify-start text-xs md:text-sm py-2 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Leave ({leaveRequests.length})
                </TabsTrigger>
                <TabsTrigger
                  value="overtime-requests"
                  className="w-full justify-start text-xs md:text-sm py-2 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Overtime ({overtimeRequests.length})
                </TabsTrigger>
                <TabsTrigger
                  value="employee-docs"
                  className="w-full justify-start text-xs md:text-sm py-2 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Documents ({employeeDocuments.length})
                </TabsTrigger>
                <TabsTrigger
                  value="tickets"
                  className="w-full justify-start text-xs md:text-sm py-2 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Tickets ({employeeTickets.length})
                </TabsTrigger>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/admin1/api-center")}
                  className="w-full justify-start text-xs md:text-sm py-2 px-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  API Center
                </Button>
              </TabsList>
            </div>
            {/* content area should follow inside Tabs */}
            <div className="flex-1 pl-4">

            {/* TEAM TAB */}
            <TabsContent value="team">
              <div className="space-y-4">
                {/* Team Filters Section */}
                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary" />
                        Filters & Search
                      </CardTitle>
                      <Button
                        onClick={handleAddTeamMember}
                        size="sm"
                        className="bg-gradient-to-r from-primary to-blue-600 text-white text-xs h-8"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Member
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search by name or role..."
                          value={teamSearch}
                          onChange={(e) => setTeamSearch(e.target.value)}
                          className="h-9 text-sm pl-9 border-gray-200"
                        />
                      </div>
                      <select
                        value={teamDeptFilter}
                        onChange={(e) => setTeamDeptFilter(e.target.value)}
                        className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                      >
                        <option value="all">All Member Types</option>
                        <option value="founder">Founders</option>
                        <option value="executive">Executives</option>
                        <option value="employee">Employees</option>
                      </select>
                      <select
                        value={teamStatusFilter}
                        onChange={(e) => setTeamStatusFilter(e.target.value)}
                        className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="alumni">Alumni</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {filteredTeam.length} Result
                          {filteredTeam.length !== 1 ? "s" : ""}
                        </Badge>
                        {(teamSearch ||
                          teamDeptFilter !== "all" ||
                          teamStatusFilter !== "all") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                setTeamSearch("");
                                setTeamDeptFilter("all");
                                setTeamStatusFilter("all");
                              }}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Clear
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Table */}
                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm font-semibold text-gray-700">
                      Team Members
                    </CardTitle>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    {/* Desktop View */}
                    <table className="w-full hidden md:table">
                      <thead className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-b">
                        <tr>
                          <th className="text-left p-2 md:p-3 text-xs font-semibold">
                            Profile
                          </th>
                          <th className="text-left p-2 md:p-3 text-xs font-semibold">
                            Name
                          </th>
                          <th className="text-left p-2 md:p-3 text-xs font-semibold">
                            Type
                          </th>
                          <th className="text-left p-2 md:p-3 text-xs font-semibold">
                            Role
                          </th>
                          <th className="text-left p-2 md:p-3 text-xs font-semibold">
                            Department
                          </th>
                          <th className="text-left p-2 md:p-3 text-xs font-semibold">
                            Status
                          </th>
                          <th className="text-left p-2 md:p-3 text-xs font-semibold">
                            Location
                          </th>
                          <th className="text-left p-2 md:p-3 text-xs font-semibold">
                            Join Date
                          </th>
                          <th className="text-left p-2 md:p-3 text-xs font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeam.map((member) => (
                          <tr
                            key={member.id}
                            className="border-b hover:bg-blue-50/50"
                          >
                            <td className="p-2 md:p-3">
                              <div className="relative w-10 h-10">
                                <Image
                                  src={
                                    typeof member.image === "string" && member.image
                                      ? member.image.startsWith("http")
                                        ? member.image
                                        : `${API_URL}${member.image}`
                                      : "/brand/avatar.svg"
                                  }
                                  alt={member.name}
                                  fill
                                  className="rounded-full object-cover"
                                  sizes="40px"
                                />
                              </div>
                            </td>
                            <td className="p-2 md:p-3">
                              <p className="text-xs font-semibold">
                                {member.name}
                              </p>
                            </td>
                            <td className="p-2 md:p-3">
                              <Badge variant="outline" className="text-xs">
                                {member.member_type}
                              </Badge>
                            </td>
                            <td className="p-2 md:p-3">
                              <p className="text-xs">{member.role}</p>
                            </td>
                            <td className="p-2 md:p-3">
                              <Badge variant="outline" className="text-xs">
                                {member.department}
                              </Badge>
                            </td>
                            <td className="p-2 md:p-3">
                              <Badge
                                className={`text-xs ${lower(member.status) === "active"
                                  ? "bg-green-500"
                                  : "bg-gray-500"
                                  }`}
                              >
                                {member.status}
                              </Badge>
                            </td>
                            <td className="p-2 md:p-3">
                              <p className="text-xs">{member.location}</p>
                            </td>
                            <td className="p-2 md:p-3">
                              <p className="text-xs">
                                {member.joinDate || "-"}
                              </p>
                            </td>
                            <td className="p-2 md:p-3">
                              <div className="flex justify-end gap-1">
                                <Button
                                  onClick={() => handleEditTeamMember(member)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => {
                                    const confirmed = window.confirm(
                                      `Are you sure you want to delete ${member.name}? This action cannot be undone.`
                                    );
                                    if (confirmed) {
                                      deleteTeamMember(member);
                                    }
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mobile View */}
                    <div className="block md:hidden space-y-3 p-3">
                      {filteredTeam.map((member) => (
                        <Card key={member.id} className="p-4 border shadow-sm">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="relative w-12 h-12 flex-shrink-0">
                                <Image
                                  src={
                                    typeof member.image === "string" && member.image
                                      ? member.image.startsWith("http")
                                        ? member.image
                                        : `${API_URL}${member.image}`
                                      : "/brand/avatar.svg"
                                  }
                                  alt={member.name}
                                  fill
                                  className="rounded-full object-cover"
                                  sizes="48px"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div>
                                  <p className="text-sm font-semibold truncate">
                                    {member.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {member.role}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {member.member_type}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {member.department}
                                    </Badge>
                                    <Badge
                                      className={`text-xs ${lower(member.status) === "active"
                                        ? "bg-green-500"
                                        : "bg-gray-500"
                                        }`}
                                    >
                                      {member.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span>{member.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span>{member.joinDate || "-"}</span>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t">
                              <Button
                                onClick={() => handleEditTeamMember(member)}
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                onClick={() => {
                                  const confirmed = window.confirm(
                                    `Are you sure you want to delete ${member.name}? This action cannot be undone.`
                                  );
                                  if (confirmed) {
                                    deleteTeamMember(member);
                                  }
                                }}
                                variant="destructive"
                                size="sm"
                                className="h-8 px-3 text-xs"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* EMPLOYEES TAB */}
            <TabsContent value="employees">
              <div className="space-y-6">
                {/* Filters Card */}
                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary" />
                        Employees Management
                      </CardTitle>
                      <Button
                        onClick={() => setIsAddEmployeeModalOpen(true)}
                        size="sm"
                        className="bg-gradient-to-r from-primary to-blue-600 text-white text-xs h-8"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Employee
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search by name, ID, email, or phone..."
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          className="h-9 text-sm pl-9 border-gray-200"
                        />
                      </div>
                      <select
                        value={employeeDesignationFilter}
                        onChange={(e) => setEmployeeDesignationFilter(e.target.value)}
                        className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                      >
                        <option value="all">All Designations</option>
                        {employeeDesignations.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <select
                        value={employeeStatusFilter}
                        onChange={(e) => setEmployeeStatusFilter(e.target.value)}
                        className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {filteredEmployees.length} Employees
                        </Badge>
                        {(employeeSearch || employeeDesignationFilter !== "all" || employeeStatusFilter !== "all") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setEmployeeSearch("");
                              setEmployeeDesignationFilter("all");
                              setEmployeeStatusFilter("all");
                            }}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Employees Table */}
                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm font-semibold text-gray-700">Employees</CardTitle>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-b">
                        <tr>
                          <th className="text-left p-3 text-xs font-semibold">Photo</th>
                          <th className="text-left p-3 text-xs font-semibold">Name</th>
                          <th className="text-left p-3 text-xs font-semibold">Employee ID</th>
                          <th className="text-left p-3 text-xs font-semibold">Email</th>
                          <th className="text-left p-3 text-xs font-semibold">Phone</th>
                          <th className="text-left p-3 text-xs font-semibold">Designation</th>
                          <th className="text-left p-3 text-xs font-semibold">Employment Type</th>
                          <th className="text-left p-3 text-xs font-semibold">Location</th>
                          <th className="text-left p-3 text-xs font-semibold">Status</th>
                          <th className="text-left p-3 text-xs font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployees.map((employee) => (
                          <tr key={employee.id} className="border-b hover:bg-blue-50/50">
                            <td className="p-3">
                              <div className="relative w-10 h-10">
                                {employee.profile_pic ? (
                                  <img
                                    src={
                                      withCacheBuster(
                                        resolveMediaUrl(employee.profile_pic) || "/brand/avatar.svg",
                                        employee.updated_at || employee.id
                                      )
                                    }
                                    alt={employee.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <p className="text-sm font-semibold">{employee.name}</p>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs font-mono">
                                {employee.employee_id}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <p className="text-sm">
                                {employee.email ||
                                  (employee.login_id && employee.login_id.includes("@")
                                    ? employee.login_id
                                    : "-")}
                              </p>
                            </td>
                            <td className="p-3">
                              <p className="text-sm">
                                {employee.phone ||
                                  (employee.login_id && !employee.login_id.includes("@")
                                    ? employee.login_id
                                    : "-")}
                              </p>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs">
                                {employee.designation}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <p className="text-sm">{employee.employment_type || "-"}</p>
                            </td>
                            <td className="p-3">
                              <p className="text-sm">{employee.location || "-"}</p>
                            </td>
                            <td className="p-3">
                              <Badge
                                className={`text-xs ${employee.status === "active" ? "bg-green-500" : "bg-gray-500"}`}
                              >
                                {employee.status}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  onClick={() => handleViewEmployeeDetails(employee)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => handleEditEmployee(employee)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => deleteEmployee(employee.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {filteredEmployees.length === 0 && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="size-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">No employees found</h3>
                      <p className="text-muted-foreground mb-6">
                        {employees.length === 0
                          ? "Get started by adding your first employee"
                          : "No employees match your current filters"}
                      </p>
                      {employees.length === 0 && (
                        <Button onClick={() => setIsAddEmployeeModalOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Employee
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* PRIVATE PROJECT TAB */}
            <TabsContent value="current-projects">
              <div className="space-y-6">
                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        Private Project Plan
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => router.push("/admin1/private-projects/new")}
                          size="sm"
                          className="bg-gradient-to-r from-primary to-blue-600 text-white text-xs h-8"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          New Private Project
                        </Button>
                        <Button
                          onClick={() => router.push("/admin1/private-projects/monitoring")}
                          size="sm"
                          variant="outline"
                          className="text-xs h-8"
                        >
                          <Activity className="w-3 h-3 mr-1" />
                          Work Monitoring
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {currentProjectCards.length === 0 ? (
                      <div className="text-sm text-gray-600">No private projects yet.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {currentProjectCards.map((card) => (
                          <div key={card.id} className="border rounded-lg p-4 bg-white">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate">{card.title}</div>
                                <div className="text-xs text-gray-500 font-mono mt-1">{card.id}</div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {card.status}
                              </Badge>
                            </div>
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>Completion</span>
                                <span>{card.completion}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-primary to-blue-600" style={{ width: `${card.completion}%` }} />
                              </div>
                              <div className="text-xs text-gray-600">
                                Employees: {card.assignedEmployees} • Tasks: {card.completedAssigned}/{card.totalAssigned}
                              </div>
                            </div>
                            <div className="mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() => router.push(`/admin1/private-projects/${card.id}`)}
                              >
                                <PenLine className="w-3 h-3 mr-1" />
                                Open Plan
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm font-semibold text-gray-700">Employees by Project</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search by employee name, ID, or project..."
                          value={currentProjectSearch}
                          onChange={(e) => setCurrentProjectSearch(e.target.value)}
                          className="h-9 text-sm pl-9 border-gray-200"
                        />
                      </div>
                      <select
                        value={currentProjectAssignmentFilter}
                        onChange={(e) =>
                          setCurrentProjectAssignmentFilter(e.target.value as "all" | "assigned" | "unassigned")
                        }
                        className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                      >
                        <option value="all">All</option>
                        <option value="assigned">Assigned</option>
                        <option value="unassigned">Unassigned</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {employees.filter((e) => {
                            const raw =
                              (e as any)?.current_project_id ??
                              (e as any)?.current_project?.id ??
                              (e as any)?.current_project;
                            const id = raw ? String(raw) : "";
                            if (currentProjectAssignmentFilter === "assigned") return Boolean(id);
                            if (currentProjectAssignmentFilter === "unassigned") return !id;
                            return true;
                          }).length}{" "}
                          Employees
                        </Badge>
                        {(currentProjectSearch || currentProjectAssignmentFilter !== "assigned") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setCurrentProjectSearch("");
                              setCurrentProjectAssignmentFilter("assigned");
                            }}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-b">
                          <tr>
                            <th className="text-left p-3 text-xs font-semibold">Employee</th>
                            <th className="text-left p-3 text-xs font-semibold">Designation</th>
                            <th className="text-left p-3 text-xs font-semibold">Project</th>
                            <th className="text-left p-3 text-xs font-semibold">Status</th>
                            <th className="text-left p-3 text-xs font-semibold">Activity</th>
                            <th className="text-left p-3 text-xs font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                        {employees
                          .filter((e) => {
                            const raw =
                              (e as any)?.current_project_id ??
                              (e as any)?.current_project?.id ??
                              (e as any)?.current_project;
                            const projectId = raw ? String(raw) : "";
                            if (currentProjectAssignmentFilter === "assigned" && !projectId) return false;
                            if (currentProjectAssignmentFilter === "unassigned" && projectId) return false;

                            const project =
                              projectId
                                ? employeeProjects.find((p) => String(p.id) === projectId) ||
                                  projects.find((p) => String(p.id) === projectId) ||
                                  null
                                : null;
                            const projectTitle =
                              cleanText((e as any)?.current_project_title) ||
                              cleanText((e as any)?.current_project?.title) ||
                              cleanText((e as any)?.current_project?.name) ||
                              project?.title ||
                              "";

                            const q = currentProjectSearch.trim().toLowerCase();
                            if (!q) return true;
                            return (
                              String(e.name || "").toLowerCase().includes(q) ||
                              String(e.employee_id || "").toLowerCase().includes(q) ||
                              String(projectTitle || "").toLowerCase().includes(q) ||
                              String(projectId || "").toLowerCase().includes(q)
                            );
                          })
                          .map((e) => {
                            const raw =
                              (e as any)?.current_project_id ??
                              (e as any)?.current_project?.id ??
                              (e as any)?.current_project;
                            const projectId = raw ? String(raw) : "";
                            const project =
                              projectId
                                ? employeeProjects.find((p) => String(p.id) === projectId) ||
                                  projects.find((p) => String(p.id) === projectId) ||
                                  null
                                : null;
                            const projectTitle =
                              cleanText((e as any)?.current_project_title) ||
                              cleanText((e as any)?.current_project?.title) ||
                              cleanText((e as any)?.current_project?.name) ||
                              project?.title ||
                              "-";

                            const empId = String(e.id);
                            const leaveCount = leaveRequests.filter((l) => String(l.employee) === empId).length;
                            const overtimeCount = overtimeRequests.filter((o) => String(o.employee) === empId).length;
                            const docsCount = employeeDocuments.filter((d) => String(d.employee) === empId).length;

                            const lastDates: number[] = [];
                            const latestLeave = leaveRequests
                              .filter((l) => String(l.employee) === empId)
                              .map((l) => new Date(l.created_at).getTime())
                              .filter((t) => !Number.isNaN(t));
                            const latestOt = overtimeRequests
                              .filter((o) => String(o.employee) === empId)
                              .map((o) => new Date(o.created_at).getTime())
                              .filter((t) => !Number.isNaN(t));
                            const latestDoc = employeeDocuments
                              .filter((d) => String(d.employee) === empId)
                              .map((d) => new Date(d.uploaded_at).getTime())
                              .filter((t) => !Number.isNaN(t));
                            if (latestLeave.length) lastDates.push(Math.max(...latestLeave));
                            if (latestOt.length) lastDates.push(Math.max(...latestOt));
                            if (latestDoc.length) lastDates.push(Math.max(...latestDoc));
                            const lastActivity = lastDates.length ? new Date(Math.max(...lastDates)) : null;

                            return (
                              <tr key={e.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">
                                  <div className="flex items-center gap-3">
                                    {e.profile_pic ? (
                                      <img
                                        src={withCacheBuster(resolveMediaUrl(e.profile_pic) || "/brand/avatar.svg", e.updated_at || e.id)}
                                        alt={e.name}
                                        className="w-8 h-8 rounded-full object-cover border"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="w-4 h-4 text-gray-400" />
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <div className="text-sm font-semibold text-gray-900 truncate">{e.name || "-"}</div>
                                      <div className="text-xs text-gray-500 font-mono truncate">{e.employee_id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-sm text-gray-700">{e.designation || "-"}</td>
                                <td className="p-3">
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-gray-900 truncate">
                                      {projectTitle || "-"}
                                    </div>
                                    {projectId && (
                                      <div className="text-xs text-gray-500 font-mono truncate">{projectId}</div>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <Badge variant="outline" className="text-xs">
                                    {project?.status || (projectId ? "assigned" : "unassigned")}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                      Leaves {leaveCount}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      OT {overtimeCount}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      Docs {docsCount}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {lastActivity ? lastActivity.toLocaleString() : "-"}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 px-3 text-xs"
                                      onClick={() => handleViewEmployeeDetails(e)}
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      View
                                    </Button>
                                    {projectId && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 px-3 text-xs"
                                        onClick={() => router.push(`/admin1/private-projects/${projectId}`)}
                                      >
                                        <PenLine className="w-3 h-3 mr-1" />
                                        Plan
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* SERVICES TAB */}
            <TabsContent value="services">
              <div className="space-y-6">
                {/* Services Filters Section */}
                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary" />
                        Services Management
                      </CardTitle>
                      <Button
                        onClick={() => setIsAddServiceModalOpen(true)}
                        size="sm"
                        className="bg-gradient-to-r from-primary to-blue-600 text-white text-xs h-8"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Service
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search services..."
                          value={serviceSearch}
                          onChange={(e) => setServiceSearch(e.target.value)}
                          className="h-9 text-sm pl-9 border-gray-200"
                        />
                      </div>
                      <select
                        value={serviceStatusFilter}
                        onChange={(e) => setServiceStatusFilter(e.target.value)}
                        className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {filteredServices.length} Services
                        </Badge>
                        {(serviceSearch || serviceStatusFilter !== "all") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setServiceSearch("");
                              setServiceStatusFilter("all");
                            }}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((service) => (
                    <Card
                      key={service.id}
                      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group rounded-lg"
                    >
                      {/* Service Header with Image */}
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={
                            typeof service.image === "string" && service.image
                              ? service.image.startsWith("http")
                                ? service.image
                                : `${API_URL}${service.image}`
                              : "/brand/abstract-grid.svg"
                          }
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge
                            className={`text-xs ${service.status === "active"
                              ? "bg-green-500"
                              : "bg-gray-500"
                              }`}
                          >
                            {service.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        {/* Quick Actions Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                          <Button
                            onClick={() => handleEditService(service)}
                            size="sm"
                            className="bg-white/90 text-gray-800 hover:bg-white"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => deleteService(service.id)}
                            size="sm"
                            className="bg-red-500/90 text-white hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold line-clamp-1">
                            {service.title}
                          </h3>

                          <p className="text-sm text-gray-600 line-clamp-2">
                            {service.description}
                          </p>

                          {/* Features Preview */}
                          {service.features.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {service.features.slice(0, 3).map((feature, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                              {service.features.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{service.features.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Service Meta */}
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                            <div className="flex items-center gap-2">
                              <span>
                                {service.developers?.length || 0} developer(s)
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {service.demo_video_url && (
                                <a
                                  href={service.demo_video_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Play className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* No Services Message */}
                {filteredServices.length === 0 && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="size-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        No services found
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Get started by adding your first IT service
                      </p>
                      <Button onClick={() => setIsAddServiceModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Service
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* PROJECTS TAB */}
            <TabsContent value="projects">
              <div className="space-y-6">
                {/* Project Filters Section */}
                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary" />
                        Projects Management
                      </CardTitle>
                      <Button
                        onClick={() => {
                          setProjectCreateScope("public");
                          setIsAddProjectModalOpen(true);
                        }}
                        size="sm"
                        className="bg-gradient-to-r from-primary to-blue-600 text-white text-xs h-8"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Project
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search projects..."
                          value={projectSearch}
                          onChange={(e) => setProjectSearch(e.target.value)}
                          className="h-9 text-sm pl-9 border-gray-200"
                        />
                      </div>
                      <select
                        value={projectCategoryFilter}
                        onChange={(e) =>
                          setProjectCategoryFilter(e.target.value)
                        }
                        className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                      >
                        <option value="all">All Categories</option>
                        {projectCategories.map((c) => (
                          <option key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </option>
                        ))}
                      </select>
                      <select
                        value={projectStatusFilter}
                        onChange={(e) => setProjectStatusFilter(e.target.value)}
                        className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                      >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="planned">Planned</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {filteredProjects.length} Projects
                        </Badge>
                        {(projectSearch ||
                          projectCategoryFilter !== "all" ||
                          projectStatusFilter !== "all") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                setProjectSearch("");
                                setProjectCategoryFilter("all");
                                setProjectStatusFilter("all");
                              }}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Clear
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <Card
                      key={project.id}
                      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group rounded-lg"
                    >
                      {/* Project Header with Image */}
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <Image
                          src={
                            project.image?.startsWith("http")
                              ? project.image
                              : project.image
                                ? `${API_URL}${project.image}`
                                : "/brand/abstract-grid.svg"
                          }
                          alt={project.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge
                            className={`text-xs ${getStatusColor(
                              project.status
                            )}`}
                          >
                            {getStatusText(project.status)}
                          </Badge>
                        </div>

                        {/* Featured Badge */}
                        {project.featured && (
                          <div className="absolute top-3 right-3">
                            <Badge
                              variant="secondary"
                              className="text-xs bg-yellow-500 text-white"
                            >
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Featured
                            </Badge>
                          </div>
                        )}

                        {/* Quick Actions Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                          <Button
                            onClick={() => handleEditProject(project)}
                            size="sm"
                            className="bg-white/90 text-gray-800 hover:bg-white"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => deleteProject(project.id)}
                            size="sm"
                            className="bg-red-500/90 text-white hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Title and Category */}
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold line-clamp-1 flex-1">
                              {project.title}
                            </h3>
                            <Badge
                              variant="outline"
                              className="text-xs shrink-0 ml-2"
                            >
                              {project.category}
                            </Badge>
                          </div>

                          {/* Short Description */}
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {project.shortDescription}
                          </p>

                          {/* Technologies */}
                          {(() => {
                            const technologies = Array.isArray(project.technologies)
                              ? project.technologies
                              : typeof project.technologies === "string"
                                ? project.technologies
                                  .split(",")
                                  .map((t) => t.trim())
                                  .filter(Boolean)
                                : [];
                            if (technologies.length === 0) return null;
                            return (
                              <div className="flex flex-wrap gap-1">
                                {technologies.slice(0, 3).map((tech: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                                {technologies.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{technologies.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            );
                          })()}

                          {/* Project Meta */}
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {project.timeline || "No timeline"}
                              </span>
                              {project.client && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {project.client}
                                </span>
                              )}
                            </div>

                            {/* Quick Stats */}
                            <div className="flex items-center gap-3">
                              {project.liveUrl && (
                                <a
                                  href={project.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {project.videoUrl && (
                                <a
                                  href={project.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Play className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Testimonial Preview */}
                          {project.testimonial && (
                            <div className="bg-blue-50 rounded-lg p-3 mt-2">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${i < (project.testimonial?.rating ?? 0)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                        }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs font-medium text-gray-700">
                                  {project.testimonial.name}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2 italic">
                                "{project.testimonial.quote}"
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* No Projects Message */}
                {filteredProjects.length === 0 && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Search className="size-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        No projects found
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {projects.length === 0
                          ? "Get started by adding your first project"
                          : "No projects match your current filters"}
                      </p>
                      {projects.length === 0 && (
                        <Button
                          onClick={() => {
                            setProjectCreateScope("public");
                            setIsAddProjectModalOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Project
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* GIS SERVICES TAB */}
            <TabsContent value="gis-services">
              <div className="space-y-6">
                {/* GIS Services Filters Section */}
                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary" />
                        GIS Services Management
                      </CardTitle>
                      <Button
                        onClick={() => setIsAddGisServiceModalOpen(true)}
                        size="sm"
                        className="bg-gradient-to-r from-primary to-blue-600 text-white text-xs h-8"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add GIS Service
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search GIS services..."
                          value={gisServiceSearch}
                          onChange={(e) => setGisServiceSearch(e.target.value)}
                          className="h-9 text-sm pl-9 border-gray-200"
                        />
                      </div>
                      <select
                        value={gisServiceStatusFilter}
                        onChange={(e) => setGisServiceStatusFilter(e.target.value)}
                        className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {filteredGIServices.length} Services
                        </Badge>
                        {(gisServiceSearch || gisServiceStatusFilter !== "all") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setGisServiceSearch("");
                              setGisServiceStatusFilter("all");
                            }}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* GIS Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGIServices.map((service) => (
                    <Card
                      key={service.id}
                      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group rounded-lg"
                    >
                      {/* Service Header with Image */}
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={
                            typeof service.image === "string" && service.image
                              ? service.image.startsWith("http")
                                ? service.image
                                : `${API_URL}${service.image}`
                              : "/brand/abstract-grid.svg"
                          }
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge
                            className={`text-xs ${service.status === "active"
                              ? "bg-green-500"
                              : "bg-gray-500"
                              }`}
                          >
                            {service.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        {/* Quick Actions Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                          <Button
                            onClick={() => handleEditGisService(service)}
                            size="sm"
                            className="bg-white/90 text-gray-800 hover:bg-white"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => deleteGisService(service.id)}
                            size="sm"
                            className="bg-red-500/90 text-white hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold truncate">
                          {service.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2 truncate">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className="text-xs">
                            {service.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditGisService(service)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* No GIS Services Message */}
                {filteredGIServices.length === 0 && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="size-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        No GIS services found
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Get started by adding your first GIS service
                      </p>
                      <Button onClick={() => setIsAddGisServiceModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First GIS Service
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* PRODUCTS TAB */}
            <TabsContent value="products">
              <div className="space-y-6">
                {/* Products Filters Section */}
                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary" />
                        Products Management
                      </CardTitle>
                      <Button
                        onClick={() => setIsAddProductModalOpen(true)}
                        size="sm"
                        className="bg-gradient-to-r from-primary to-blue-600 text-white text-xs h-8"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Product
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search products..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="h-9 text-sm pl-9 border-gray-200"
                        />
                      </div>
                      <select
                        value={productCategoryFilter}
                        onChange={(e) =>
                          setProductCategoryFilter(e.target.value)
                        }
                        className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                      >
                        <option value="all">All Categories</option>
                        {productCategories.map((c) => (
                          <option key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </option>
                        ))}
                      </select>
                      <select
                        value={productStatusFilter}
                        onChange={(e) => setProductStatusFilter(e.target.value)}
                        className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                      >
                        <option value="all">All Status</option>
                        <option value="Live">Live</option>
                        <option value="In Development">In Development</option>
                        <option value="Coming Soon">Coming Soon</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {filteredProducts.length} Products
                        </Badge>
                        {(productSearch ||
                          productCategoryFilter !== "all" ||
                          productStatusFilter !== "all") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                setProductSearch("");
                                setProductCategoryFilter("all");
                                setProductStatusFilter("all");
                              }}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Clear
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group rounded-lg"
                    >
                      {/* Product Header with Image */}
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <Image
                          src={
                            product.cover?.startsWith("http")
                              ? product.cover
                              : product.cover
                                ? `${API_URL}${product.cover}`
                                : "/brand/abstract-grid.svg"
                          }
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge
                            className={`text-xs ${getStatusColor(
                              product.status
                            )}`}
                          >
                            {getStatusText(product.status)}
                          </Badge>
                        </div>

                        {/* Featured Badge */}
                        {product.featured && (
                          <div className="absolute top-3 right-3">
                            <Badge
                              variant="secondary"
                              className="text-xs bg-yellow-500 text-white"
                            >
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Featured
                            </Badge>
                          </div>
                        )}

                        {/* Quick Actions Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                          <Button
                            onClick={() => handleEditProduct(product)}
                            size="sm"
                            className="bg-white/90 text-gray-800 hover:bg-white"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => deleteProduct(product.id)}
                            size="sm"
                            className="bg-red-500/90 text-white hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Title and Category */}
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold line-clamp-1 flex-1">
                              {product.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className="text-xs shrink-0 ml-2"
                            >
                              {product.category}
                            </Badge>
                          </div>

                          {/* Tagline */}
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {product.tagline}
                          </p>

                          {/* Description */}
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {product.description}
                          </p>

                          {/* Technologies */}
                          {product.technologies &&
                            product.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {product.technologies
                                  .slice(0, 3)
                                  .map((tech, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {tech}
                                    </Badge>
                                  ))}
                                {product.technologies.length > 3 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    +{product.technologies.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}

                          {/* Stats */}
                          {product.stats && product.stats.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                              {product.stats.slice(0, 2).map((stat, index) => (
                                <div key={index} className="text-center">
                                  <p className="text-lg font-bold text-primary">
                                    {stat.value}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {stat.label}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Product Meta */}
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                            <div className="flex items-center gap-4">
                              {product.liveUrl && (
                                <a
                                  href={product.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Live
                                </a>
                              )}
                              {product.demoUrl && (
                                <a
                                  href={product.demoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-700 flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Play className="w-3 h-3" />
                                  Demo
                                </a>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {product.platforms
                                ?.slice(0, 2)
                                .map((platform, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {platform}
                                  </Badge>
                                ))}
                              {product.platforms &&
                                product.platforms.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{product.platforms.length - 2}
                                  </Badge>
                                )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* No Products Message */}
                {filteredProducts.length === 0 && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Package className="size-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        No products found
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {products.length === 0
                          ? "Get started by adding your first product"
                          : "No products match your current filters"}
                      </p>
                      {products.length === 0 && (
                        <Button onClick={() => setIsAddProductModalOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Product
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* GALLERY TAB */}
            <TabsContent value="gallery">
              <div className="space-y-4">
                {/* Gallery Filters Section */}
                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary" />
                        Filters & Search
                      </CardTitle>
                      <Button
                        onClick={() => setIsAddGalleryModalOpen(true)}
                        size="sm"
                        className="bg-gradient-to-r from-primary to-blue-600 text-white text-xs h-8"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Image
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search gallery..."
                          value={gallerySearch}
                          onChange={(e) => setGallerySearch(e.target.value)}
                          className="h-9 text-sm pl-9 border-gray-200"
                        />
                      </div>
                      <select
                        value={galleryCategoryFilter}
                        onChange={(e) =>
                          setGalleryCategoryFilter(e.target.value)
                        }
                        className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                      >
                        {galleryCategories.map((c) => (
                          <option key={c} value={c}>
                            {c === "all" ? "All Categories" : c}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {filteredGallery.length} Result
                          {filteredGallery.length !== 1 ? "s" : ""}
                        </Badge>
                        {(gallerySearch || galleryCategoryFilter !== "all") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setGallerySearch("");
                              setGalleryCategoryFilter("all");
                            }}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredGallery.map((item) => {
                    const isEditing = editingGalleryId === item.id;

                    const getCurrentImageUrl = () => {
                      if (isEditing && isFile(editedGallery?.image)) {
                        return URL.createObjectURL(editedGallery.image);
                      }
                      if (typeof item.image === "string" && item.image) {
                        return item.image.startsWith("http")
                          ? item.image
                          : `${API_URL}${item.image}`;
                      }
                      if (isFile(item.image)) {
                        return URL.createObjectURL(item.image);
                      }
                      return "/brand/abstract-grid.svg";
                    };

                    return (
                      <Card
                        key={item.id}
                        className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                      >
                        <div className="relative h-40">
                          <Image
                            src={getCurrentImageUrl()}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          {isEditing && (
                            <>
                              <label
                                htmlFor={`edit-image-${item.id}`}
                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
                                title="Change image"
                              >
                                <Edit className="w-6 h-6 text-white" />
                              </label>
                              <input
                                id={`edit-image-${item.id}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setEditedGallery((prev) => ({
                                      ...prev,
                                      image: file,
                                    }));
                                  }
                                }}
                              />
                            </>
                          )}
                        </div>
                        <CardContent className="p-3">
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-gray-700">
                                  Title
                                </Label>
                                <Input
                                  value={editedGallery.title ?? item.title}
                                  onChange={(e) =>
                                    setEditedGallery((prev) => ({
                                      ...prev,
                                      title: e.target.value,
                                    }))
                                  }
                                  className="h-8 text-sm"
                                  placeholder="Enter title"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-gray-700">
                                  Category
                                </Label>
                                <select
                                  value={
                                    editedGallery.category ?? item.category
                                  }
                                  onChange={(e) =>
                                    setEditedGallery((prev) => ({
                                      ...prev,
                                      category: e.target.value,
                                    }))
                                  }
                                  className="h-8 text-sm border rounded px-2 w-full"
                                >
                                  <option value="office">Office</option>
                                  <option value="events">Events</option>
                                  <option value="celebration">
                                    Celebration
                                  </option>
                                  <option value="others">Others</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-gray-700">
                                  Description
                                </Label>
                                <Textarea
                                  value={
                                    editedGallery.description ??
                                    item.description
                                  }
                                  onChange={(e) =>
                                    setEditedGallery((prev) => ({
                                      ...prev,
                                      description: e.target.value,
                                    }))
                                  }
                                  className="text-sm resize-none"
                                  rows={3}
                                  placeholder="Enter description"
                                />
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Button
                                  onClick={() => {
                                    updateGalleryItem(item.id, editedGallery);
                                    if (isFile(editedGallery?.image)) {
                                      URL.revokeObjectURL(getCurrentImageUrl());
                                    }
                                  }}
                                  size="sm"
                                  className="h-8 flex-1 text-xs bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  onClick={() => {
                                    if (isFile(editedGallery?.image)) {
                                      URL.revokeObjectURL(getCurrentImageUrl());
                                    }
                                    setEditingGalleryId(null);
                                    setEditedGallery({});
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 flex-1 text-xs"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="text-xs font-semibold mb-1">
                                {item.title || "Untitled"}
                              </h3>
                              <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                                {item.description || "No description"}
                              </p>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                                <div className="flex gap-1">
                                  <Button
                                    onClick={() => {
                                      setEditingGalleryId(item.id);
                                      setEditedGallery({
                                        title: item.title || "",
                                        description: item.description || "",
                                        category: item.category || "office",
                                      });
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      const confirmed = window.confirm(
                                        `Are you sure you want to delete this image? This action cannot be undone.`
                                      );
                                      if (confirmed) {
                                        deleteGalleryItem(item.id);
                                      }
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>



            <TabsContent value="testimonials">
              <div className="space-y-6">
                {/* Testimonials Filters Section */}
                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary" />
                        Testimonials Management
                      </CardTitle>
                      <Button
                        onClick={() => setIsAddTestimonialModalOpen(true)}
                        size="sm"
                        className="bg-gradient-to-r from-primary to-blue-600 text-white text-xs h-8"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Testimonial
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search testimonials..."
                          value={testimonialSearch}
                          onChange={(e) => setTestimonialSearch(e.target.value)}
                          className="h-9 text-sm pl-9 border-gray-200"
                        />
                      </div>
                      <select
                        value={testimonialStatusFilter}
                        onChange={(e) => setTestimonialStatusFilter(e.target.value)}
                        className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {filteredTestimonials.length} Testimonials
                        </Badge>
                        {(testimonialSearch || testimonialStatusFilter !== "all") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setTestimonialSearch("");
                              setTestimonialStatusFilter("all");
                            }}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Testimonials Table */}
                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm font-semibold text-gray-700">
                      Client Testimonials
                    </CardTitle>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-b">
                        <tr>
                          <th className="text-left p-3 text-xs font-semibold">Photo</th>
                          <th className="text-left p-3 text-xs font-semibold">Name</th>
                          <th className="text-left p-3 text-xs font-semibold">Role & Company</th>
                          <th className="text-left p-3 text-xs font-semibold">Testimonial</th>
                          <th className="text-left p-3 text-xs font-semibold">LinkedIn</th>
                          <th className="text-left p-3 text-xs font-semibold">Status</th>
                          <th className="text-left p-3 text-xs font-semibold">Order</th>
                          <th className="text-left p-3 text-xs font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTestimonials.map((testimonial) => (
                          <tr key={testimonial.id} className="border-b hover:bg-blue-50/50">
                            <td className="p-3">
                              <div className="relative w-12 h-12">
                                {testimonial.image ? (
                                  <img
                                    src={
                                      testimonial.image.startsWith("http")
                                        ? testimonial.image
                                        : `${API_URL}${testimonial.image}`
                                    }
                                    alt={testimonial.name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <p className="text-sm font-semibold">{testimonial.name}</p>
                            </td>
                            <td className="p-3">
                              <p className="text-sm">{testimonial.role}</p>
                              <p className="text-xs text-gray-500">{testimonial.company}</p>
                            </td>
                            <td className="p-3 max-w-xs">
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {testimonial.text}
                              </p>
                            </td>
                            <td className="p-3">
                              {testimonial.linkedin !== "/#" ? (
                                <a
                                  href={testimonial.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 text-xs"
                                >
                                  <ExternalLinkIcon className="w-4 h-4" />
                                </a>
                              ) : (
                                <span className="text-xs text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="p-3">
                              <Badge
                                className={`text-xs ${testimonial.status === "active"
                                  ? "bg-green-500"
                                  : "bg-gray-500"
                                  }`}
                              >
                                {testimonial.status}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <span className="text-xs font-mono">{testimonial.sort_order}</span>
                            </td>
                            <td className="p-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  onClick={() => handleEditTestimonial(testimonial)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => {
                                    const confirmed = window.confirm(
                                      `Are you sure you want to delete ${testimonial.name}'s testimonial? This action cannot be undone.`
                                    );
                                    if (confirmed) {
                                      deleteTestimonial(testimonial.id);
                                    }
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* No Testimonials Message */}
                {filteredTestimonials.length === 0 && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="size-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">No testimonials found</h3>
                      <p className="text-muted-foreground mb-6">
                        {testimonials.length === 0
                          ? "Get started by adding your first client testimonial"
                          : "No testimonials match your current filters"}
                      </p>
                      {testimonials.length === 0 && (
                        <Button onClick={() => setIsAddTestimonialModalOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Testimonial
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Blogs TAB */}
            <TabsContent value="blog">
              <div className="space-y-6">
                <div className="border-2 border-dashed p-6 rounded-lg">
                  <BlogAdmin />
                </div>
              </div>
            </TabsContent>

            {/* LEAVE REQUESTS TAB */}
            <TabsContent value="leave-requests">
              <div className="space-y-6">
                {/* Filters Card */}
                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Filter className="w-4 h-4 text-primary" />
                      Leave Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search by employee or reason..."
                          value={leaveSearch}
                          onChange={(e) => setLeaveSearch(e.target.value)}
                          className="h-9 text-sm pl-9"
                        />
                      </div>
                      <select
                        value={leaveStatusFilter}
                        onChange={(e) => setLeaveStatusFilter(e.target.value)}
                        className="h-9 text-sm rounded-md border border-gray-200 px-3"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {leaveRequests.filter(l => 
                            (leaveStatusFilter === 'all' || l.status === leaveStatusFilter) &&
                            (lower(l.employee_name).includes(leaveSearch.toLowerCase()) ||
                             lower(l.reason).includes(leaveSearch.toLowerCase()))
                          ).length} requests
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Requests Table */}
                <Card className="bg-white border-gray-100 shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-b">
                        <tr>
                          <th className="text-left p-3 text-xs font-semibold">Employee</th>
                          <th className="text-left p-3 text-xs font-semibold">Type</th>
                          <th className="text-left p-3 text-xs font-semibold">Dates</th>
                          <th className="text-left p-3 text-xs font-semibold">Days</th>
                          <th className="text-left p-3 text-xs font-semibold">Reason</th>
                          <th className="text-left p-3 text-xs font-semibold">Status</th>
                          <th className="text-left p-3 text-xs font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaveRequests
                          .filter(l => 
                            (leaveStatusFilter === 'all' || l.status === leaveStatusFilter) &&
                            (lower(l.employee_name).includes(leaveSearch.toLowerCase()) ||
                             lower(l.reason).includes(leaveSearch.toLowerCase()))
                          )
                          .map(req => (
                            <tr key={req.id} className="border-b hover:bg-blue-50/50">
                              <td className="p-3 text-sm">{req.employee_name || `ID: ${req.employee}`}</td>
                              <td className="p-3 text-sm capitalize">{req.leave_type}</td>
                              <td className="p-3 text-sm">{req.start_date} → {req.end_date}</td>
                              <td className="p-3 text-sm font-mono">{req.total_days || req.days_count || "-"}</td>
                              <td className="p-3 text-sm max-w-xs">
                                <div className="truncate">{req.reason}</div>
                                {req.status === "rejected" && req.rejection_reason && (
                                  <div className="text-xs text-red-600 mt-1 truncate">
                                    {req.rejection_reason}
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <Badge className={`text-xs ${
                                  req.status === 'approved' ? 'bg-green-500' :
                                  req.status === 'rejected' ? 'bg-red-500' :
                                  'bg-yellow-500'
                                }`}>
                                  {req.status}
                                </Badge>
                              </td>
                              <td className="p-3">
                                {req.status === 'pending' && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      className="h-7 px-2 bg-green-600 hover:bg-green-700"
                                      onClick={() => updateLeaveStatus(req.id, 'approved')}
                                    >
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-7 px-2"
                                      onClick={() => handleRejectLeave(req.id)}
                                    >
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                )}
                                {req.documents && (
                                  <a
                                    href={req.documents}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-xs ml-2"
                                  >
                                    View Doc
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {leaveRequests.filter(l => 
                      (leaveStatusFilter === 'all' || l.status === leaveStatusFilter) &&
                      (lower(l.employee_name).includes(leaveSearch.toLowerCase()) ||
                       lower(l.reason).includes(leaveSearch.toLowerCase()))
                    ).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No leave requests found</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* OVERTIME REQUESTS TAB */}
            <TabsContent value="overtime-requests">
              <div className="space-y-6">
                {/* Filters Card */}
                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Filter className="w-4 h-4 text-primary" />
                      Overtime Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search by employee or reason..."
                          value={overtimeSearch}
                          onChange={(e) => setOvertimeSearch(e.target.value)}
                          className="h-9 text-sm pl-9"
                        />
                      </div>
                      <select
                        value={overtimeStatusFilter}
                        onChange={(e) => setOvertimeStatusFilter(e.target.value)}
                        className="h-9 text-sm rounded-md border border-gray-200 px-3"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {overtimeRequests.filter(o => 
                            (overtimeStatusFilter === 'all' || o.status === overtimeStatusFilter) &&
                            (lower(o.employee_name).includes(overtimeSearch.toLowerCase()) ||
                             lower(o.reason).includes(overtimeSearch.toLowerCase()))
                          ).length} requests
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Requests Table */}
                <Card className="bg-white border-gray-100 shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-b">
                        <tr>
                          <th className="text-left p-3 text-xs font-semibold">Employee</th>
                          <th className="text-left p-3 text-xs font-semibold">Date</th>
                          <th className="text-left p-3 text-xs font-semibold">Hours</th>
                          <th className="text-left p-3 text-xs font-semibold">Reason</th>
                          <th className="text-left p-3 text-xs font-semibold">Status</th>
                          <th className="text-left p-3 text-xs font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overtimeRequests
                          .filter(o => 
                            (overtimeStatusFilter === 'all' || o.status === overtimeStatusFilter) &&
                            (lower(o.employee_name).includes(overtimeSearch.toLowerCase()) ||
                             lower(o.reason).includes(overtimeSearch.toLowerCase()))
                          )
                          .map(req => (
                            <tr key={req.id} className="border-b hover:bg-blue-50/50">
                              <td className="p-3 text-sm">{req.employee_name || `ID: ${req.employee}`}</td>
                              <td className="p-3 text-sm">{new Date(req.date).toLocaleDateString()}</td>
                              <td className="p-3 text-sm font-mono">{req.hours}</td>
                              <td className="p-3 text-sm max-w-xs">
                                <div className="truncate">{req.reason}</div>
                                {req.status === "rejected" && req.rejection_reason && (
                                  <div className="text-xs text-red-600 mt-1 truncate">
                                    {req.rejection_reason}
                                  </div>
                                )}
                                {req.status === "approved" && typeof req.extra_pay === "number" && (
                                  <div className="text-xs text-green-700 mt-1 truncate">
                                    Extra Pay: ₹{req.extra_pay}
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <Badge className={`text-xs ${
                                  req.status === 'approved' ? 'bg-green-500' :
                                  req.status === 'rejected' ? 'bg-red-500' :
                                  'bg-yellow-500'
                                }`}>
                                  {req.status}
                                </Badge>
                              </td>
                              <td className="p-3">
                                {req.status === 'pending' && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      className="h-7 px-2 bg-green-600 hover:bg-green-700"
                                      onClick={() => handleApproveOvertime(req.id)}
                                    >
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-7 px-2"
                                      onClick={() => handleRejectOvertime(req.id)}
                                    >
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {overtimeRequests.filter(o => 
                      (overtimeStatusFilter === 'all' || o.status === overtimeStatusFilter) &&
                      (lower(o.employee_name).includes(overtimeSearch.toLowerCase()) ||
                       lower(o.reason).includes(overtimeSearch.toLowerCase()))
                    ).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No overtime requests found</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* EMPLOYEE DOCUMENTS TAB */}
            <TabsContent value="employee-docs">
              <div className="space-y-6">
                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Employee Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search by title or employee..."
                          value={docSearch}
                          onChange={(e) => setDocSearch(e.target.value)}
                          className="h-9 text-sm pl-9"
                        />
                      </div>
                      <select
                        value={docStatusFilter}
                        onChange={(e) => setDocStatusFilter(e.target.value)}
                        className="h-9 text-sm rounded-md border border-gray-200 px-3"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {employeeDocuments.filter((doc) => {
                            const status = (doc.status || "pending") as string;
                            const matchesStatus = docStatusFilter === "all" || status === docStatusFilter;
                            const q = docSearch.toLowerCase();
                            const matchesSearch =
                              lower(doc.title).includes(q) || lower(doc.employee_name).includes(q);
                            return matchesStatus && matchesSearch;
                          }).length}{" "}
                          docs
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {employeeDocuments
                        .filter((doc) => {
                          const status = (doc.status || "pending") as string;
                          const matchesStatus = docStatusFilter === "all" || status === docStatusFilter;
                          const q = docSearch.toLowerCase();
                          const matchesSearch =
                            lower(doc.title).includes(q) || lower(doc.employee_name).includes(q);
                          return matchesStatus && matchesSearch;
                        })
                        .map(doc => (
                          <Card key={doc.id} className="p-4 border shadow-sm">
                            <div className="flex items-start gap-3">
                              <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold truncate">{doc.title}</h4>
                                <p className="text-xs text-gray-500">
                                  {doc.employee_name || `Employee #${toScalarKey((doc as any).employee)}`}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(doc.uploaded_at).toLocaleDateString()}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <Badge
                                    className={`text-xs ${
                                      (doc.status || "pending") === "verified"
                                        ? "bg-green-500"
                                        : (doc.status || "pending") === "rejected"
                                          ? "bg-red-500"
                                          : "bg-yellow-500"
                                    }`}
                                  >
                                    {doc.status || "pending"}
                                  </Badge>
                                  {doc.document_type && (
                                    <Badge variant="outline" className="text-xs">
                                      {doc.document_type}
                                    </Badge>
                                  )}
                                </div>
                                {doc.description && (
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{doc.description}</p>
                                )}
                                {(doc.status || "pending") === "rejected" && doc.rejection_reason && (
                                  <p className="text-xs text-red-600 mt-2 line-clamp-2">
                                    {doc.rejection_reason}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              {(doc.status || "pending") === "pending" ? (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="h-7 px-2 bg-green-600 hover:bg-green-700"
                                    onClick={() => updateDocumentStatus(doc.id, "verified")}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verify
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-7 px-2"
                                    onClick={() => handleRejectDocument(doc.id)}
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              ) : (
                                <div />
                              )}
                              <a
                                href={doc.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                Download
                              </a>
                            </div>
                          </Card>
                        ))}
                    </div>
                    {employeeDocuments.filter((doc) => {
                      const status = (doc.status || "pending") as string;
                      const matchesStatus = docStatusFilter === "all" || status === docStatusFilter;
                      const q = docSearch.toLowerCase();
                      const matchesSearch =
                        lower(doc.title).includes(q) || lower(doc.employee_name).includes(q);
                      return matchesStatus && matchesSearch;
                    }).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No documents found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TICKETS TAB */}
            <TabsContent value="tickets">
              <div className="space-y-6">
                <Card className="bg-white border-gray-100 shadow-md">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Employee Tickets
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {adminTicketNotifications.length > 0 ? (
                      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-blue-900">Ticket alerts from employees</div>
                            <div className="mt-2 space-y-2">
                              {adminTicketNotifications.slice(0, 4).map((notification: any) => (
                                <button
                                  key={String(notification.id)}
                                  type="button"
                                  className="block text-left text-sm text-blue-800 hover:text-blue-950"
                                  onClick={() => {
                                    const id = Number(cleanText(notification.ticket));
                                    if (Number.isFinite(id) && id > 0) {
                                      setTicketCommentsTicketId(id);
                                      setTicketComments([]);
                                      setTicketCommentDraft("");
                                      setTicketCommentLinkDraft("");
                                      setTicketCommentFiles([]);
                                      fetchAdminTicketComments(id);
                                    }
                                  }}
                                >
                                  <span className="font-medium">{cleanText(notification.title) || "Ticket update"}</span>
                                  {notification.message ? <span className="text-blue-700"> - {cleanText(notification.message)}</span> : null}
                                </button>
                              ))}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="bg-white" onClick={markAdminTicketNotificationsRead}>
                            Mark read
                          </Button>
                        </div>
                      </div>
                    ) : null}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      <div>
                        <Label className="text-xs">Employee</Label>
                        <select
                          value={newTicketEmployeeId}
                          onChange={(e) => setNewTicketEmployeeId(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-gray-200 bg-background px-3 text-sm mt-1"
                        >
                          <option value="">Select employee</option>
                          {employees.map((e) => (
                            <option key={String(e.id)} value={String(e.id)}>
                              {String(e.name || "Employee")} ({String((e as any).employee_id || e.id)})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Ticket Title</Label>
                        <Input
                          value={newTicketTitle}
                          onChange={(e) => setNewTicketTitle(e.target.value)}
                          className="h-9 text-sm mt-1"
                          placeholder="Short title"
                        />
                      </div>
                      <Button
                        onClick={createEmployeeTicket}
                        disabled={creatingTicket || !newTicketEmployeeId || !newTicketTitle.trim()}
                        className="h-9"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {creatingTicket ? "Creating..." : "Create Ticket"}
                      </Button>
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        value={newTicketDescription}
                        onChange={(e) => setNewTicketDescription(e.target.value)}
                        className="text-sm mt-1"
                        rows={3}
                        placeholder="Describe the issue/request"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search by employee, title, status..."
                          value={ticketSearch}
                          onChange={(e) => setTicketSearch(e.target.value)}
                          className="h-9 text-sm pl-9 border-gray-200"
                        />
                      </div>
                      <select
                        value={ticketStatusFilter}
                        onChange={(e) => setTicketStatusFilter(e.target.value as any)}
                        className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      <select
                        value={ticketAssignmentFilter}
                        onChange={(e) => setTicketAssignmentFilter(e.target.value as any)}
                        className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                      >
                        <option value="all">All</option>
                        <option value="assigned">Assigned</option>
                        <option value="unassigned">Unassigned</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      {employeeTickets
                        .filter((t) => {
                          const q = ticketSearch.trim().toLowerCase();
                          const ticketId = toScalarKey((t as any)?.id ?? (t as any)?.ticket_id ?? (t as any)?.ticketId);
                          const employeeKey = toScalarKey(
                            (t as any)?.employee ?? (t as any)?.employee_id ?? (t as any)?.employeeId ?? (t as any)?.employee?.id
                          );
                          const employeeName =
                            String((t as any)?.employee_name ?? "") ||
                            employeeLabelByKey[employeeKey] ||
                            (employeeKey ? `Employee #${employeeKey}` : "");
                          const title = String(
                            (t as any)?.title ?? (t as any)?.ticket_title ?? (t as any)?.Ticket_Title ?? (t as any)?.subject ?? ""
                          );
                          const desc = String((t as any)?.description ?? (t as any)?.details ?? "");
                          const status = normalizeTicketStatusKey((t as any)?.status ?? "");
                          const assigneeIds = getTicketAssigneeIds(t);
                          const assigneeName = getTicketAssigneeLabel(t);
                          const matchesSearch =
                            !q ||
                            ticketId.toLowerCase().includes(q) ||
                            employeeName.toLowerCase().includes(q) ||
                            title.toLowerCase().includes(q) ||
                            desc.toLowerCase().includes(q) ||
                            status.includes(q) ||
                            assigneeName.toLowerCase().includes(q);
                          const matchesStatus =
                            ticketStatusFilter === "all" ||
                            normalizeTicketStatusKey(status) === normalizeTicketStatusKey(ticketStatusFilter);
                          const hasAssignee = assigneeIds.length > 0;
                          const matchesAssignee =
                            ticketAssignmentFilter === "all" ||
                            (ticketAssignmentFilter === "assigned" ? hasAssignee : !hasAssignee);
                          return matchesSearch && matchesStatus && matchesAssignee;
                        })
                        .map((t, idx) => {
                          const ticketId = toScalarKey((t as any)?.id ?? (t as any)?.ticket_id ?? (t as any)?.ticketId);
                          const ticketNumericId = Number(ticketId || 0);
                          const employeeKey = toScalarKey(
                            (t as any)?.employee ?? (t as any)?.employee_id ?? (t as any)?.employeeId ?? (t as any)?.employee?.id
                          );
                          const employeeName =
                            String((t as any)?.employee_name ?? "") ||
                            employeeLabelByKey[employeeKey] ||
                            (employeeKey ? `Employee #${employeeKey}` : "Employee");
                          const assigneeIds = getTicketAssigneeIds(t);
                          const primaryAssigneeKey = assigneeIds[0] || "";
                          const assigneeName = getTicketAssigneeLabel(t);
                          const title =
                            String((t as any)?.title ?? "") ||
                            String((t as any)?.ticket_title ?? "") ||
                            String((t as any)?.Ticket_Title ?? "") ||
                            String((t as any)?.subject ?? "") ||
                            (ticketId ? `Ticket #${ticketId}` : "Ticket");
                          const createdAt = (t as any)?.created_at ?? (t as any)?.createdAt;
                          const createdAtLabel = createdAt ? new Date(createdAt as any).toLocaleString() : "-";
                          const status = normalizeTicketStatusKey((t as any)?.status ?? "pending") || "pending";
                          const description = String((t as any)?.description ?? (t as any)?.details ?? "");
                          const latestComments = latestTicketCommentsById[ticketId] || normalizeTicketCommentsList((t as any)?.comments || []);
                          const latestComment = latestComments[0];
                          const hasDoneComment =
                            latestComments.some((c: any) => cleanText(c?.text).toLowerCase().includes("done")) ||
                            status === "resolved" ||
                            status === "closed";

                          return (
                          <div
                            key={ticketId || `${idx}`}
                            id={ticketId ? `ticket-${ticketId}` : undefined}
                            className={`border rounded-lg p-4 bg-white ${hasDoneComment ? "border-green-200 bg-green-50/30" : ""}`}
                          >
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate">
                                  <span className="font-mono text-gray-500 mr-2">#{ticketId || "-"}</span>
                                  {title}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{employeeName}</div>
                                <div className="text-xs text-gray-500 mt-1">Assigned to: {assigneeName}</div>
                                <div className="text-xs text-gray-400 mt-1">{createdAtLabel}</div>
                              </div>
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <select
                                  value={status}
                                  onChange={(e) => {
                                    if (!ticketNumericId) return;
                                    updateEmployeeTicket(ticketNumericId, { status: e.target.value });
                                  }}
                                  className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                                  disabled={!ticketNumericId}
                                >
                                  <option value="pending">pending</option>
                                  <option value="in-progress">in-progress</option>
                                  <option value="resolved">resolved</option>
                                  <option value="closed">closed</option>
                                </select>
                                <select
                                  value={primaryAssigneeKey}
                                  onChange={(e) => {
                                    if (!ticketNumericId) return;
                                    updateEmployeeTicket(ticketNumericId, {
                                      assigned_to_id: e.target.value ? Number(e.target.value) : null,
                                      assigned_to: e.target.value ? Number(e.target.value) : null,
                                      assigned_to_ids: e.target.value ? [Number(e.target.value)] : [],
                                      assignees: e.target.value ? [Number(e.target.value)] : [],
                                    });
                                  }}
                                  className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                                  disabled={!ticketNumericId}
                                >
                                  <option value="">Unassigned</option>
                                  {employees.map((e) => (
                                    <option key={String(e.id)} value={String(e.id)}>
                                      {String(e.name || "Employee")} ({String((e as any).employee_id || e.id)})
                                    </option>
                                  ))}
                                </select>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-9 text-xs"
                                  disabled={!ticketNumericId}
                                  onClick={() => {
                                    if (!ticketNumericId) return;
                                    const ids = getTicketAssigneeIds(t);
                                    const next: Record<string, boolean> = {};
                                    ids.forEach((id) => {
                                      if (cleanText(id)) next[String(id)] = true;
                                    });
                                    setMultiAssignSelected(next);
                                    setMultiAssignSearch("");
                                    setMultiAssignTicketId(ticketNumericId);
                                  }}
                                >
                                  Assign multiple
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-9 text-xs"
                                  disabled={!ticketNumericId}
                                  onClick={() => {
                                    if (!ticketNumericId) return;
                                    setTicketCommentsTicketId(ticketNumericId);
                                    setTicketComments([]);
                                    setTicketCommentDraft("");
                                    setTicketCommentLinkDraft("");
                                    setTicketCommentFiles([]);
                                    fetchAdminTicketComments(ticketNumericId);
                                  }}
                                >
                                  Comments
                                </Button>
                              </div>
                            </div>
                            {description ? (
                              <div className="text-xs text-gray-600 mt-3 whitespace-pre-wrap">{description}</div>
                            ) : null}
                            {latestComment ? (
                              <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-xs font-semibold text-gray-700">
                                    Latest update from {cleanText(latestComment?.author) || "employee"}
                                  </div>
                                  {latestComment?.created_at ? (
                                    <div className="text-[11px] text-gray-400">{new Date(latestComment.created_at).toLocaleString()}</div>
                                  ) : null}
                                </div>
                                <div className="mt-1 text-xs text-gray-700 whitespace-pre-wrap">{cleanText(latestComment?.text)}</div>
                                {(Array.isArray(latestComment?.links) && latestComment.links.length > 0) ||
                                (Array.isArray(latestComment?.attachments) && latestComment.attachments.length > 0) ? (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {Array.isArray(latestComment?.links) && latestComment.links.length > 0 ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">
                                        <LinkIcon className="h-3 w-3" />
                                        {latestComment.links.length} link{latestComment.links.length === 1 ? "" : "s"}
                                      </span>
                                    ) : null}
                                    {Array.isArray(latestComment?.attachments) && latestComment.attachments.length > 0 ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700">
                                        <Paperclip className="h-3 w-3" />
                                        {latestComment.attachments.length} file{latestComment.attachments.length === 1 ? "" : "s"}
                                      </span>
                                    ) : null}
                                  </div>
                                ) : null}
                                {hasDoneComment ? (
                                  <div className="mt-2 inline-flex rounded-full bg-green-100 px-2 py-1 text-[11px] font-medium text-green-700">
                                    Employee marked this as done. Please check it once.
                                  </div>
                                ) : null}
                              </div>
                            ) : status === "resolved" || status === "closed" ? (
                              <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-xs font-medium text-green-700">
                                Employee marked this as done. Please check comments once.
                              </div>
                            ) : null}
                          </div>
                          );
                        })}

                      {employeeTickets.filter((t) => {
                        const q = ticketSearch.trim().toLowerCase();
                        const ticketId = toScalarKey((t as any)?.id ?? (t as any)?.ticket_id ?? (t as any)?.ticketId);
                        const employeeKey = toScalarKey(
                          (t as any)?.employee ?? (t as any)?.employee_id ?? (t as any)?.employeeId ?? (t as any)?.employee?.id
                        );
                        const employeeName =
                          String((t as any)?.employee_name ?? "") ||
                          employeeLabelByKey[employeeKey] ||
                          (employeeKey ? `Employee #${employeeKey}` : "");
                        const title = String(
                          (t as any)?.title ?? (t as any)?.ticket_title ?? (t as any)?.Ticket_Title ?? (t as any)?.subject ?? ""
                        );
                        const desc = String((t as any)?.description ?? (t as any)?.details ?? "");
                        const status = normalizeTicketStatusKey((t as any)?.status ?? "");
                        const assigneeIds = getTicketAssigneeIds(t);
                        const assigneeName = getTicketAssigneeLabel(t);
                        const matchesSearch =
                          !q ||
                          ticketId.toLowerCase().includes(q) ||
                          employeeName.toLowerCase().includes(q) ||
                          title.toLowerCase().includes(q) ||
                          desc.toLowerCase().includes(q) ||
                          status.includes(q) ||
                          assigneeName.toLowerCase().includes(q);
                        const matchesStatus =
                          ticketStatusFilter === "all" ||
                          normalizeTicketStatusKey(status) === normalizeTicketStatusKey(ticketStatusFilter);
                        const hasAssignee = assigneeIds.length > 0;
                        const matchesAssignee =
                          ticketAssignmentFilter === "all" ||
                          (ticketAssignmentFilter === "assigned" ? hasAssignee : !hasAssignee);
                        return matchesSearch && matchesStatus && matchesAssignee;
                      }).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p>No tickets found</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
          </Tabs>
        </motion.div>
      </div>

      {multiAssignTicketId != null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2400] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div className="min-w-0">
                <h2 className="text-lg font-bold truncate">Assign Employees</h2>
                <div className="text-xs text-gray-500 mt-1 truncate">
                  Ticket #{String(multiAssignTicketId)}{" "}
                  {multiAssignTicket ? `• ${cleanText((multiAssignTicket as any)?.title) || "Ticket"}` : ""}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMultiAssignTicketId(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search employees by name or ID..."
                  value={multiAssignSearch}
                  onChange={(e) => setMultiAssignSearch(e.target.value)}
                  className="h-9 text-sm pl-9 border-gray-200"
                />
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[55vh] overflow-y-auto divide-y">
                  {employees
                    .filter((e: any) => {
                      const q = multiAssignSearch.trim().toLowerCase();
                      if (!q) return true;
                      const id = cleanText(e?.id) || String(e?.id ?? "");
                      const code = cleanText((e as any)?.employee_id);
                      const name = cleanText((e as any)?.name) || "Employee";
                      return (
                        id.toLowerCase().includes(q) ||
                        code.toLowerCase().includes(q) ||
                        name.toLowerCase().includes(q)
                      );
                    })
                    .map((e: any) => {
                      const id = cleanText(e?.id) || String(e?.id ?? "");
                      const label = employeeLabelByKey[id] || `${cleanText(e?.name) || "Employee"} (${cleanText((e as any)?.employee_id) || id || "-"})`;
                      const checked = Boolean(multiAssignSelected[id]);
                      return (
                        <label key={id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(ev) => {
                              setMultiAssignSelected((prev) => {
                                const next = { ...prev };
                                if (ev.target.checked) next[id] = true;
                                else delete next[id];
                                return next;
                              });
                            }}
                          />
                          <span className="text-sm text-gray-900">{label}</span>
                        </label>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between gap-3">
              <div className="text-xs text-gray-500">
                Selected: {Object.values(multiAssignSelected).filter(Boolean).length}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setMultiAssignTicketId(null)}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (multiAssignTicketId == null) return;
                    updateEmployeeTicket(multiAssignTicketId, { assigned_to_ids: [], assigned_to_id: null, assigned_to: null });
                    setMultiAssignSelected({});
                    setMultiAssignTicketId(null);
                  }}
                >
                  Unassign all
                </Button>
                <Button
                  onClick={() => {
                    if (multiAssignTicketId == null) return;
                    const ids = Object.entries(multiAssignSelected)
                      .filter(([, v]) => Boolean(v))
                      .map(([k]) => Number(cleanText(k) || k))
                      .filter((n) => Number.isFinite(n) && n > 0);
                    updateEmployeeTicket(multiAssignTicketId, {
                      assigned_to_ids: ids,
                      assignees: ids,
                      assigned_to_id: ids[0] ?? null,
                    });
                    setMultiAssignTicketId(null);
                  }}
                  className="bg-primary"
                >
                  Save
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {ticketCommentsTicketId != null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2450] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div className="min-w-0">
                <h2 className="text-lg font-bold truncate">Ticket Comments</h2>
                <div className="text-xs text-gray-500 mt-1 truncate">
                  Ticket #{String(ticketCommentsTicketId)}{" "}
                  {ticketCommentsTicket ? `• ${cleanText((ticketCommentsTicket as any)?.title) || "Ticket"}` : ""}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setTicketCommentsTicketId(null);
                  setTicketCommentDraft("");
                  setTicketCommentLinkDraft("");
                  setTicketCommentFiles([]);
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              {ticketCommentsLoading ? (
                <div className="text-sm text-gray-500">Loading comments...</div>
              ) : ticketComments.length === 0 ? (
                <div className="text-sm text-gray-500">No comments yet</div>
              ) : (
                <div className="space-y-2">
                  {ticketComments.map((c: any, idx: number) => {
                    const author = cleanText(c?.author) || "Unknown";
                    const when = c?.created_at ? new Date(c.created_at).toLocaleString() : "";
                    return (
                      <div key={String(c?.id ?? `${ticketCommentsTicketId}:${idx}`)} className="bg-gray-50 border rounded-lg p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs font-medium text-gray-700 truncate">{author}</div>
                          {when ? <div className="text-[11px] text-gray-400">{when}</div> : <div />}
                        </div>
                        <div className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{String(c?.text ?? "")}</div>
                        {Array.isArray(c?.links) && c.links.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {c.links.map((link: any, lidx: number) => {
                              const url = cleanText(link?.url ?? link);
                              if (!url) return null;
                              return (
                                <a
                                  key={`${ticketCommentsTicketId}:link:${idx}:${lidx}`}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                >
                                  <LinkIcon className="h-3.5 w-3.5" />
                                  {cleanText(link?.label) || url}
                                </a>
                              );
                            })}
                          </div>
                        ) : null}
                        {Array.isArray(c?.attachments) && c.attachments.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {c.attachments.map((file: any, fidx: number) => {
                              const url = resolveMediaUrl(file?.file_url ?? file?.file ?? file?.url);
                              if (!url) return null;
                              return (
                                <a
                                  key={`${ticketCommentsTicketId}:file:${idx}:${fidx}`}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                                >
                                  <Paperclip className="h-3.5 w-3.5" />
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
                  value={ticketCommentDraft}
                  onChange={(e) => setTicketCommentDraft(e.target.value)}
                  rows={3}
                  placeholder="Write what needs to be added, reviewed, or changed..."
                />
                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={ticketCommentLinkDraft}
                      onChange={(e) => setTicketCommentLinkDraft(e.target.value)}
                      placeholder="Attach reference links, comma or new line separated"
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
                        const files = Array.from(e.target.files || []);
                        setTicketCommentFiles((prev) => [...prev, ...files].slice(0, 10));
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
                {ticketCommentFiles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {ticketCommentFiles.map((file, fidx) => (
                      <span key={`admin-ticket-file:${fidx}`} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                        <Paperclip className="h-3 w-3" />
                        {file.name}
                        <button
                          type="button"
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => setTicketCommentFiles((prev) => prev.filter((_, i) => i !== fidx))}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (ticketCommentsTicketId == null) return;
                      fetchAdminTicketComments(ticketCommentsTicketId);
                    }}
                    disabled={ticketCommentsTicketId == null || ticketCommentsLoading}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTicketCommentDraft("");
                      setTicketCommentLinkDraft("");
                      setTicketCommentFiles([]);
                    }}
                    disabled={ticketCommentSaving || (!cleanText(ticketCommentDraft) && !cleanText(ticketCommentLinkDraft) && ticketCommentFiles.length === 0)}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={() => {
                      if (ticketCommentsTicketId == null) return;
                      postAdminTicketComment(ticketCommentsTicketId, ticketCommentDraft);
                    }}
                    disabled={ticketCommentsTicketId == null || ticketCommentSaving || (!cleanText(ticketCommentDraft) && !cleanText(ticketCommentLinkDraft) && ticketCommentFiles.length === 0)}
                    className="bg-primary"
                  >
                    {ticketCommentSaving ? "Posting..." : "Send update"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      { /* Modals */ }

      <TestimonialModal
        isOpen={isAddTestimonialModalOpen}
        onClose={() => {
          setIsAddTestimonialModalOpen(false);
          setNewTestimonial({
            name: "",
            company: "",
            role: "",
            text: "",
            image: null,
            linkedin: "",
            status: "active",
            sort_order: 0,
          });
        }}
        testimonial={newTestimonial}
        onSave={addTestimonial}
        isEdit={false}
      />

      {/* Edit Testimonial Modal */}
      <TestimonialModal
        isOpen={isEditTestimonialModalOpen}
        onClose={() => {
          setIsEditTestimonialModalOpen(false);
          setEditingTestimonial(null);
        }}
        testimonial={editingTestimonial || {}}
        onSave={(updatedTestimonial) =>
          updateTestimonial(editingTestimonial!.id, updatedTestimonial)
        }
        isEdit={true}
      />

      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => {
          setIsTeamModalOpen(false);
          setEditingTeamMember(null);
        }}
        member={editingTeamMember}
        onSave={handleSaveTeamMember}
        isEdit={isEditTeamMode}
      />

      {/* Add IT Service Modal */}
      <ServiceModal
        isOpen={isAddServiceModalOpen}
        onClose={() => {
          setIsAddServiceModalOpen(false);
          setNewService({
            id: "",
            title: "",
            description: "",
            image: "",
            long_description: "",
            features: [],
            benefits: [],
            technologies: [],
            developers: [],
            demo_video_url: "",
            status: "active",
            sort_order: 0,
            use_cases: [],
            explore: { title: "", subsections: [] },
          });
        }}
        service={newService}
        onSave={addService}
        isEdit={false}
        teamMembers={teamMembers}
        entityName="IT Service"
        isGis={false}
        enableExplore={true}
      />

      {/* Edit IT Service Modal */}
      <ServiceModal
        isOpen={isEditServiceModalOpen}
        onClose={() => {
          setIsEditServiceModalOpen(false);
          setEditingService(null);
        }}
        service={editingService || {}}
        onSave={(updatedService) =>
          updateService(editingService!.id, updatedService)
        }
        isEdit={true}
        teamMembers={teamMembers}
        entityName="IT Service"
        isGis={false}
        enableExplore={true}
      />

      {/* Add GIS Service Modal */}
      <ServiceModal
        isOpen={isAddGisServiceModalOpen}
        onClose={() => {
          setIsAddGisServiceModalOpen(false);
          setNewGisService({
            id: "",
            title: "",
            description: "",
            image: "",
            long_description: "",
            features: [],
            benefits: [],
            technologies: [],
            developers: [],
            demo_video_url: "",
            status: "active",
            sort_order: 0,
            use_cases: [],
            explore: { title: "", subsections: [] },
          });
        }}
        service={newGisService}
        onSave={addGisService}
        isEdit={false}
        teamMembers={teamMembers}
        entityName="GIS Service"
        isGis={true}
        enableExplore={true}
      />

      {/* Edit GIS Service Modal */}
      <ServiceModal
        isOpen={isEditGisServiceModalOpen}
        onClose={() => {
          setIsEditGisServiceModalOpen(false);
          setEditingGisService(null);
        }}
        service={editingGisService || {}}
        onSave={(updated) => updateGisService(editingGisService!.id, updated)}
        isEdit={true}
        teamMembers={teamMembers}
        entityName="GIS Service"
        isGis={true}
        enableExplore={true}
      />

      {/* Add Project Modal */}
      <ProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => {
          setIsAddProjectModalOpen(false);
          resetNewProjectForm();
        }}
        project={newProject}
        onSave={addProject}
        isEdit={false}
      />

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => {
          setIsEditProjectModalOpen(false);
          setEditingProject(null);
          setEditedProject({});
        }}
        project={editingProject || {}}
        onSave={(updatedProject) =>
          updateProject(editingProject!.id, updatedProject)
        }
        isEdit={true}
      />

      {/* Add Product Modal */}
      <ProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => {
          setIsAddProductModalOpen(false);
          resetNewProductForm();
        }}
        product={newProduct}
        onSave={addProduct}
        isEdit={false}
      />

      {/* Edit Product Modal */}
      <ProductModal
        isOpen={isEditProductModalOpen}
        onClose={() => {
          setIsEditProductModalOpen(false);
          setEditingProduct(null);
          setEditedProduct({});
        }}
        product={editingProduct || {}}
        onSave={(updatedProduct) =>
          updateProduct(editingProduct!.id, updatedProduct)
        }
        isEdit={true}
      />

      {/* Add Gallery Modal */}
      {isAddGalleryModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Add Gallery Image</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddGalleryModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label className="text-xs">Title *</Label>
                <Input
                  value={newGalleryItem.title}
                  onChange={(e) =>
                    setNewGalleryItem({
                      ...newGalleryItem,
                      title: e.target.value,
                    })
                  }
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Category</Label>
                    <select
                      value={newGalleryItem.category}
                      onChange={(e) =>
                        setNewGalleryItem({
                          ...newGalleryItem,
                          category: e.target.value,
                        })
                      }
                      className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                    >
                      <option value="office">Office</option>
                      <option value="events">Events</option>
                      <option value="celebration">Celebration</option>
                      <option value="others">Others</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs">Upload Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setNewGalleryItem({
                      ...newGalleryItem,
                      image: file || null,
                    });
                  }}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={newGalleryItem.description}
                  onChange={(e) =>
                    setNewGalleryItem({
                      ...newGalleryItem,
                      description: e.target.value,
                    })
                  }
                  className="text-sm resize-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddGalleryModalOpen(false);
                  resetGalleryForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => addGalleryItem(newGalleryItem)}
                disabled={!newGalleryItem.title || isAddingGallery}
                className="bg-primary"
              >
                {isAddingGallery ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Add Image
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Employee Modals */}
      <EmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => {
          setIsAddEmployeeModalOpen(false);
          setNewEmployee({
            login_id: "",
            email: "",
            phone: "",
            employee_id: "",
            name: "",
            designation: "",
            password: "",
            profile_pic: null,
            location: "",
            employment_type: "",
            qualification: "",
            documents: null,
            status: "active",
          });
        }}
        employee={newEmployee}
        onSave={addEmployee}
        isEdit={false}
      />

      <EmployeeModal
        isOpen={isEditEmployeeModalOpen}
        onClose={() => {
          setIsEditEmployeeModalOpen(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee || {}}
        onSave={(updated) => updateEmployee(editingEmployee!.id, updated)}
        isEdit={true}
      />

      <EmployeeDetailsModal
        isOpen={isEmployeeDetailsModalOpen}
        onClose={() => {
          setIsEmployeeDetailsModalOpen(false);
          setViewingEmployee(null);
        }}
        employee={viewingEmployee}
        leaveRequests={leaveRequests}
        overtimeRequests={overtimeRequests}
        employeeDocuments={employeeDocuments}
        projects={projects}
        onFetchProjectById={fetchProjectById}
        onResetPassword={resetEmployeePassword}
      />
    </div>
  );
}
