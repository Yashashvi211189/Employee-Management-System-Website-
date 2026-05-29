"use client";

import { API_URL } from "@/lib/config";
import { useState, useRef, useEffect } from "react";
import "react-easy-crop/react-easy-crop.css";
// import Cropper, { Area } from "react-easy-crop"
import { motion, useScroll, useSpring } from "framer-motion";
import {  useCallback} from "react"
import Cropper, { Area } from "react-easy-crop"
import BlogAdmin from "@/components/admin/BlogAdmin"

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
  Settings,
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
  pricing?: {
    type: "free" | "paid" | "freemium";
    amount?: number;
    currency?: string;
    period?: string;
  };
  createdAt: string;
  updatedAt: string;
}

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
};
type GalleryItemForm = Omit<GalleryItem, "image"> & { image: string | File | null };
type ProductForm = Omit<Product, "cover"> & { cover: string | File };

// Initial Data
const initialTeam: TeamMember[] = [];
const initialProjects: Project[] = [];
const initialGallery: GalleryItem[] = [];
const initialProducts: Product[] = [];

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
  // Create cropped image - FIXED VERSION
const createCroppedImage = useCallback(async () => {
  if (!cropImageSrc || !croppedAreaPixels) {
    console.error('Missing crop data');
    return;
  }

  try {
    setIsCropping(true);
    
    // Create a simple HTML Image element
    const image = new window.Image();
    image.crossOrigin = 'anonymous'; // Allow cross-origin images
    
    // Create a promise for image loading
    const imageLoaded = new Promise((resolve, reject) => {
      image.onload = () => resolve(true);
      image.onerror = () => reject(new Error('Failed to load image'));
    });
    
    image.src = cropImageSrc;
    await imageLoaded;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Draw cropped image
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

    // Convert to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.95);
    });

    if (!blob) {
      throw new Error('Failed to create image blob');
    }

    // Create file from blob
    const fileName = `cropped-${Date.now()}.jpg`;
    const croppedFile = new File([blob], fileName, { 
      type: 'image/jpeg',
      lastModified: Date.now()
    });

    // Update state
    setLocalMember(prev => ({
      ...prev,
      image: croppedFile,
    }));

    // Create preview URL
    const previewUrl = URL.createObjectURL(blob);
    setImagePreview(previewUrl);

    // Close crop modal and cleanup
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

      {/* Crop Modal - SIMPLIFIED VERSION */}
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



export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("team");
  const router = useRouter();
  const auth = useAuth();
  const [user, setUser] = useState<{ username?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [blogCount, setBlogCount] = useState(0);
  const [blogDraftCount, setBlogDraftCount] = useState(0);

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
  // Team State - NEW VERSION
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeam);
  const [teamSearch, setTeamSearch] = useState("");
  const [teamDeptFilter, setTeamDeptFilter] = useState("all");
  const [teamStatusFilter, setTeamStatusFilter] = useState("all");
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(
    null
  );
  const [isEditTeamMode, setIsEditTeamMode] = useState(false);

  // Projects State
  const [projects, setProjects] = useState<Project[]>(initialProjects);
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
  const [editedGallery, setEditedGallery] = useState<Partial<GalleryItemForm>>(
    {}
  );
  const [gallerySearch, setGallerySearch] = useState("");
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState("all");
  const [isAddGalleryModalOpen, setIsAddGalleryModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [newGalleryItem, setNewGalleryItem] = useState<Partial<GalleryItemForm>>(
    {
    title: "",
    description: "",
    category: "",
    image: null,
    created_at: "",
    }
  );

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

  const [scrollProgress, setScrollProgress] = useState(0);
  const isAnyModalOpen =
    isTeamModalOpen ||
    isAddProjectModalOpen ||
    isEditProjectModalOpen ||
    isAddProductModalOpen ||
    isEditProductModalOpen ||
    isAddGalleryModalOpen;

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const access = localStorage.getItem("access");
        const headers = { Authorization: `JWT ${access}` };
        try {
          const adminRes = await fetch(`${API_URL}/api/admin/dashboard/`, {
            headers,
          });
          if (adminRes.ok) {
            const adminData = await adminRes.json();
            setUser(adminData.user);
          } else if (adminRes.status === 404) {
            console.warn("Admin endpoint not found, using fallback");
            setUser({ username: "Admin" });
          } else {
            throw new Error(`Admin API failed with status: ${adminRes.status}`);
          }
        } catch (adminError) {
          console.warn("Admin fetch failed:", adminError);
          setUser({ username: "Admin" });
        }
        const [teamRes, projectRes, galleryRes, productsRes] =
          await Promise.all([
            fetch(`${API_URL}/api/team/`, { headers }),
            fetch(`${API_URL}/api/projects/`, { headers }),
            fetch(`${API_URL}/api/gallery/`, { headers }),
            fetch(`${API_URL}/api/products/`, { headers }),
          ]);

        if (teamRes.ok && projectRes.ok && galleryRes.ok) {
          setTeamMembers(await teamRes.json());
          setProjects(await projectRes.json());
          setGallery(await galleryRes.json());
        }

        if (productsRes.ok) {
          setProducts(await productsRes.json());
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const handleSaveTeamMember = async (
    memberData: Partial<TeamMemberForm>
  ) => {
    try {
      const formData = new FormData();
      const stringListKeys = new Set([
        "features",
        "outcomes",
        "challenges",
        "technologies",
        "platforms",
        "integrations",
        "support",
      ]);

      // Add all fields to formData
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

        alert(
          `Team member ${isEditTeamMode ? "updated" : "added"} successfully!`
        );
      } else {
        const errorData = await res.json();
        console.error("Failed to save team member:", errorData);
        alert(
          `Failed to save team member: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (err) {
      console.error("Error saving team member:", err);
      alert("Error saving team member. Please try again.");
    }
  };

  const deleteTeamMember = async (member: TeamMember) => {
    try {
      const access = localStorage.getItem("access");
      const res = await fetch(`${API_URL}/api/team/${member.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `JWT ${access}`,
        },
      });

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
      formData.append(
        "shortDescription",
        newProjectData.shortDescription || ""
      );
      formData.append("description", newProjectData.description || "");
      formData.append("category", newProjectData.category || "mobile");
      formData.append("client", newProjectData.client || "");
      formData.append("status", newProjectData.status || "planned");
      formData.append("timeline", newProjectData.timeline || "");
      formData.append("team", newProjectData.team || "");
      formData.append(
        "color",
        newProjectData.color || "from-blue-500 to-purple-600"
      );
      formData.append("icon", newProjectData.icon || "Briefcase");
      formData.append("details", newProjectData.details || "");
      formData.append("liveUrl", newProjectData.liveUrl || "");
      formData.append("videoUrl", newProjectData.videoUrl || "");
      formData.append("featured", newProjectData.featured ? "true" : "false");

      // Send as proper JSON strings
      formData.append(
        "technologies",
        JSON.stringify(
          typeof newProjectData.technologies === "string"
            ? newProjectData.technologies
                .split(",")
                .map((tech: string) => tech.trim())
                .filter((tech: string) => tech)
            : Array.isArray(newProjectData.technologies)
            ? newProjectData.technologies
            : []
        )
      );

      formData.append(
        "challenges",
        JSON.stringify(
          typeof newProjectData.challenges === "string"
            ? newProjectData.challenges
                .split("\n")
                .map((challenge: string) => challenge.trim())
                .filter((challenge: string) => challenge)
            : Array.isArray(newProjectData.challenges)
            ? newProjectData.challenges
            : []
        )
      );

      formData.append(
        "outcomes",
        JSON.stringify(
          typeof newProjectData.outcomes === "string"
            ? newProjectData.outcomes
                .split("\n")
                .map((outcome: string) => outcome.trim())
                .filter((outcome: string) => outcome)
            : Array.isArray(newProjectData.outcomes)
            ? newProjectData.outcomes
            : []
        )
      );

      // Default empty values for other JSON fields
      formData.append("stats", JSON.stringify(newProjectData.stats || {}));
      formData.append("gallery", JSON.stringify(newProjectData.gallery || []));

      // Testimonial fields
      formData.append(
        "testimonial_name",
        newProjectData.testimonial?.name || ""
      );
      formData.append(
        "testimonial_role",
        newProjectData.testimonial?.role || ""
      );
      formData.append(
        "testimonial_image",
        newProjectData.testimonial?.image || ""
      );
      formData.append(
        "testimonial_quote",
        newProjectData.testimonial?.quote || ""
      );
      formData.append(
        "testimonial_rating",
        newProjectData.testimonial?.rating?.toString() || "5"
      );

      if (isFile(newProjectData.image)) {
        formData.append("image", newProjectData.image);
      }

      const res = await auth.authFetch(`${API_URL}/api/projects/`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const created = await res.json();
        setProjects((prev) => [...prev, created]);
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
      const access = localStorage.getItem("access");
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

      const res = await fetch(`${API_URL}/api/projects/${id}/`, {
        method: "PUT",
        headers: {
          Authorization: `JWT ${access}`,
        },
        body: formData,
      });

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
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const access = localStorage.getItem("access");
      const res = await fetch(`${API_URL}/api/projects/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `JWT ${access}`,
        },
      });

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
      const access = localStorage.getItem("access");

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

      const res = await fetch(`${API_URL}/api/gallery/`, {
        method: "POST",
        headers: {
          Authorization: `JWT ${access}`,
        },
        body: formData,
      });

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
      const access = localStorage.getItem("access");
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

      const res = await fetch(`${API_URL}/api/gallery/${id}/`, {
        method: "PUT",
        headers: {
          Authorization: `JWT ${access}`,
        },
        body: formData,
      });

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
      const access = localStorage.getItem("access");
      const res = await fetch(`${API_URL}/api/gallery/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `JWT ${access}`,
        },
      });
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

      console.log("🔄 Starting product creation with FormData...");
      console.log("Product data:", newProductData);

      // ✅ FIX: Append all product data as FormData
      Object.keys(newProductData).forEach((key) => {
        if (skipKeys.has(key)) return;
        const value = newProductData[key as keyof Product];

        if (value === undefined || value === null) return;

        // Handle files separately
        if (value instanceof File) {
          if (key === "cover") {
            console.log(`📁 Appending cover file: ${value.name}`);
            formData.append("cover", value);
          }
          return;
        }

        // Handle gallery files (gallery_0, gallery_1, etc.)
        if (key.startsWith("gallery_")) {
          if (value instanceof File) {
            console.log(`🖼️ Appending gallery file ${key}: ${value.name}`);
            formData.append(key, value);
          }
          return;
        }

        if (key === "stats") {
          const normalizedStats = normalizeStatsList(value);
          normalizedStats.forEach((s) => formData.append(key, JSON.stringify(s)));
          console.log(`📊 Appending stats:`, normalizedStats);
          return;
        }

        if (stringListKeys.has(key)) {
          const normalizedList = normalizeStringList(value);
          normalizedList.forEach((item) => formData.append(key, item));
          console.log(`📊 Appending array ${key}:`, normalizedList);
          return;
        }

        if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
          return;
        }
        // Handle boolean fields
        if (typeof value === "boolean") {
          formData.append(key, value.toString());
        }
        // Handle string/number fields
        else {
          formData.append(key, value.toString());
        }
      });

      // ✅ FIX: Also append gallery files that might not be in the main object
      // Extract gallery files from the data
      Object.keys(newProductData).forEach((key) => {
        if (key.startsWith("gallery_")) {
          const value = newProductData[key as keyof Product];
          if (value instanceof File) {
            console.log(`🖼️ Appending gallery file ${key}: ${value.name}`);
            formData.append(key, value);
          }
        }
      });

      // Debug: Check what's in FormData
      console.log("📋 FormData contents:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}:`, value);
        }
      }

      const res = await auth.authFetch(`${API_URL}/api/products/`, {
        method: "POST",
        body: formData,
      });

      console.log("📨 Response status:", res.status);

      if (res.ok) {
        const created = await res.json();
        console.log("✅ Product created successfully:", created);
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

        console.error("❌ Failed to add product:", { status: res.status, body });
        alert(`${category} (HTTP ${res.status}): ${typeof body === "string" ? body : JSON.stringify(body)}`);
      }
    } catch (err) {
      console.error("💥 Error adding product:", err);
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

      console.log("🔄 Starting product update with FormData...");
      console.log("Product data:", updatedData);

      // ✅ FIX: Append all product data as FormData
      Object.keys(updatedData).forEach((key) => {
        if (skipKeys.has(key)) return;
        const value = updatedData[key as keyof Product];

        if (value === undefined || value === null) return;

        // Handle files separately
        if (value instanceof File) {
          if (key === "cover") {
            console.log(`📁 Appending cover file: ${value.name}`);
            formData.append("cover", value);
          }
          return;
        }

        // Handle gallery files (gallery_0, gallery_1, etc.)
        if (key.startsWith("gallery_")) {
          if (value instanceof File) {
            console.log(`🖼️ Appending gallery file ${key}: ${value.name}`);
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
        // Handle boolean fields
        if (typeof value === "boolean") {
          formData.append(key, value.toString());
        }
        // Handle string/number fields
        else {
          formData.append(key, value.toString());
        }
      });

      Object.keys(updatedData).forEach((key) => {
        if (key.startsWith("gallery_")) {
          const value = updatedData[key as keyof Product];
          if (value instanceof File) {
            console.log(`🖼️ Appending gallery file ${key}: ${value.name}`);
            formData.append(key, value);
          }
        }
      });

      // Debug: Check what's in FormData
      console.log("📋 FormData contents for update:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}:`, value);
        }
      }

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

        console.error("Failed to update product:", { status: res.status, body });
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
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
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
      pricing: {
        type: "free",
        amount: 0,
        currency: "USD",
        period: "monthly",
      },
      platforms: [],
      integrations: [],
      support: [],
      documentationUrl: "",
      demoUrl: "",
      featured: false,
      sortOrder: 0,
    });
  };

  // Project Modal Component
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

      delete backendData.testimonial;

      backendData.stats = backendData.stats || {};
      backendData.gallery = backendData.gallery || [];
      backendData.featured = backendData.featured || false;

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
                            className={`w-4 h-4 ${
                              i < (localProject.testimonial?.rating || 5)
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

  // Product Modal Component
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

  // Add this COMPONENT right after your ProductModal component
  // Move this TeamModal component OUTSIDE the AdminDashboard function
// Place it right after the ProductModal component (around line 1600)



// Then remove the TeamModal component that's INSIDE the AdminDashboard function
// (the one starting around line 1400 in your current code)

  // Filtered Data
  const filteredTeam = teamMembers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
      m.role.toLowerCase().includes(teamSearch.toLowerCase());
    const matchesDept =
      teamDeptFilter === "all" || m.member_type === teamDeptFilter;
    const matchesStatus =
      teamStatusFilter === "all" ||
      m.status?.toLowerCase() === teamStatusFilter.toLowerCase();
    return matchesSearch && matchesDept && matchesStatus;
  });

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(projectSearch.toLowerCase());
    const matchesCategory =
      projectCategoryFilter === "all" || p.category === projectCategoryFilter;
    const matchesStatus =
      projectStatusFilter === "all" || p.status === projectStatusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredGallery = gallery.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(gallerySearch.toLowerCase()) ||
      g.category.toLowerCase().includes(gallerySearch.toLowerCase());
    const matchesCategory =
      galleryCategoryFilter === "all" || g.category === galleryCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.tagline.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory =
      productCategoryFilter === "all" || p.category === productCategoryFilter;
    const matchesStatus =
      productStatusFilter === "all" || p.status === productStatusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Stats calculations
  const activeTeam = teamMembers.filter((m) => m.status === "Active").length;
  const completedProjects = projects.filter(
    (p) => p.status === "completed"
  ).length;
  const ongoingProjects = projects.filter((p) => p.status === "ongoing").length;
  const liveProducts = products.filter((p) => p.status === "Live").length;

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
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Settings className="w-3 h-3 mr-1" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 mb-6">
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
                  <Package className="w-5 h-5 text-purple-600" />
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
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-orange-600" />
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
            className="w-full"
          >
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-1 mb-6">
              <TabsList className="grid w-full grid-cols-5 bg-transparent gap-1">
                <TabsTrigger
                  value="team"
                  className="text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Team ({teamMembers.length})
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <Briefcase className="w-4 h-4 mr-1" />
                  Projects ({projects.length})
                </TabsTrigger>
                <TabsTrigger
                  value="products"
                  className="text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <Package className="w-4 h-4 mr-1" />
                  Products ({products.length})
                </TabsTrigger>
                <TabsTrigger
                  value="gallery"
                  className="text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <ImageIcon className="w-4 h-4 mr-1" />
                  Gallery ({gallery.length})
                </TabsTrigger>
                <TabsTrigger
                  value="blog"
                  className="text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <PenLine className="w-4 h-4 mr-1" />
                  blog({blogCount})
                </TabsTrigger>
              </TabsList>
            </div>

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
                                className={`text-xs ${
                                  member.status.toLowerCase() === "active"
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
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {member.member_type}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {member.department}
                                    </Badge>
                                    <Badge
                                      className={`text-xs ${
                                        member.status.toLowerCase() === "active"
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
                        onClick={() => setIsAddProjectModalOpen(true)}
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
                      className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      {/* Project Header with Image */}
                      <div className="relative h-48">
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
                                      className={`w-3 h-3 ${
                                        i < (project.testimonial?.rating ?? 0)
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
                        <Button onClick={() => setIsAddProjectModalOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Project
                        </Button>
                      )}
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
                      className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      {/* Product Header with Image */}
                      <div className="relative h-48">
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

                        {/* Pricing Badge */}
                        <div className="absolute bottom-3 left-3">
                          <Badge
                            className={`text-xs ${getPricingTypeColor(
                              product.pricing?.type || "free"
                            )}`}
                          >
                            {product.pricing?.type === "free" && "Free"}
                            {product.pricing?.type === "paid" &&
                              `$${product.pricing.amount}/${product.pricing.period}`}
                            {product.pricing?.type === "freemium" && "Freemium"}
                          </Badge>
                        </div>

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

            {/* Blogs TAB */}
            <TabsContent value="blog">
              <div className="space-y-6">
              <div className="border-2 border-dashed p-6 rounded-lg">  
                <BlogAdmin />
              </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Add Team Modal */}
      {/* Team Modal */}
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
      {/* Add Blogs Modal */}
      {isAddBlogsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Add Blogs Details</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddBlogsModalOpen(false)}
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
                  setIsAddBlogsModalOpen(false);
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
    </div>
  );
}
