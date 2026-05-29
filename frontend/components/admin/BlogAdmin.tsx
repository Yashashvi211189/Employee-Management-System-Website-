"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Upload, Save, Link2, AlertCircle } from "lucide-react";
import { API_URL } from "@/lib/config";
import {
  AdminBlog,
  autoCanonical,
  autoMetaDescription,
  autoMetaTitle,
  loadAdminBlogs,
  makeNewBlog,
  saveAdminBlogs,
  slugify,
  parseTags,
} from "@/lib/admin-blog-store";

function splitTags(input: string) {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

const normalizeBackendMediaUrl = (value: unknown): string => {
  if (typeof value !== "string") return "";
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("data:")) return v;
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("/")) return `${API_URL}${v}`;
  return `${API_URL}/${v}`;
};

const parseHttpUrl = (value: string): URL | null => {
  try {
    const u = new URL(value);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u;
  } catch {
    return null;
  }
};

const normalizeExternalImageUrl = (value: string): string => {
  const raw = (value || "").trim();
  if (!raw || raw.startsWith("data:")) return raw;

  const u = parseHttpUrl(raw);
  if (!u) return raw;

  const host = u.hostname.toLowerCase().replace(/^www\./, "");

  if (host === "unsplash.com") {
    const m = u.pathname.match(/^\/photos\/([^/]+)\/?$/);
    if (m?.[1]) {
      return `https://source.unsplash.com/${m[1]}`;
    }
  }

  if (host === "images.unsplash.com" || host === "images.pexels.com") {
    return `${u.origin}${u.pathname}`;
  }

  return raw;
};

const normalizeImagePosition = (value: unknown): "left" | "center" | "right" => {
  if (typeof value !== "string") return "center";
  const v = value.trim().toLowerCase();
  if (v === "left") return "left";
  if (v === "right") return "right";
  return "center";
};

const normalizeBlogStatus = (value: unknown): "draft" | "published" => {
  if (typeof value !== "string") return "draft";
  const v = value.trim().toLowerCase();
  if (v === "published") return "published";
  return "draft";
};

const getPravatarUrl = (seed: string): string => {
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`;
};

const getDicebearUrl = (seed: string, style?: string): string => {
  const collection =
    style === "style2"
      ? "adventurer"
      : style === "style3"
        ? "bottts"
        : "avataaars";
  return `https://api.dicebear.com/7.x/${collection}/svg?seed=${encodeURIComponent(seed)}`;
};

const buildAuthorAvatarSeed = (
  author: { name?: string; gender?: string },
  fallbackId: string,
  nonce?: string
): string => {
  const base = (author?.name || "").trim() || fallbackId;
  const gender = (author?.gender || "neutral").trim() || "neutral";
  return nonce ? `${base}-${gender}-${nonce}` : `${base}-${gender}`;
};

// Helper function to convert backend blog to AdminBlog format
const backendBlogToAdminBlog = (backendBlog: any): AdminBlog => {
  const updatedAt = backendBlog.updated_at || new Date().toISOString();
  const createdAt = backendBlog.created_at || new Date().toISOString();
  
  // Handle banner image - ensure it's a valid URL
  let bannerImageUrl =
    backendBlog.banner_image ||
    backendBlog.banner_image_url ||
    backendBlog.image ||
    "";

  bannerImageUrl = normalizeBackendMediaUrl(bannerImageUrl) || bannerImageUrl;
  const bannerImagePosition = normalizeImagePosition(
    backendBlog.banner_image_position ??
      backendBlog.banner_image_align ??
      backendBlog.image_position ??
      backendBlog.image_align
  );
  const authorAvatarUrl =
    normalizeBackendMediaUrl(
      backendBlog.author_avatar || backendBlog.author_avatar_url || ""
    ) || "";
  
  return {
    id: String(backendBlog.id),
    title: backendBlog.title || "",
    slug: backendBlog.slug || "",
    excerpt: backendBlog.excerpt || "",
    content: backendBlog.content || "",
    category: backendBlog.category || "",
    tags: Array.isArray(backendBlog.tags) ? backendBlog.tags : [],
    bannerImageUrl: bannerImageUrl,
    bannerImageAlt: backendBlog.banner_image_alt || "",
    bannerImagePosition,
    author: {
      name: backendBlog.author_name || "",
      role: backendBlog.author_role || "",
      gender: backendBlog.author_gender || undefined,
      avatarStyle: backendBlog.author_avatar_style || undefined,
      avatarUrl: authorAvatarUrl,
    },
    status: normalizeBlogStatus(backendBlog.status),
    featured: !!backendBlog.featured,
    meta: {
      title: backendBlog.meta_title || "",
      description: backendBlog.meta_description || "",
      canonical: backendBlog.canonical_url || "",
      allowIndexing: backendBlog.allow_indexing ?? true,
    },
    createdAt: createdAt,
    updatedAt: updatedAt,
    publishedAt: backendBlog.published_at || null,
  };
};

// Helper function to fetch blogs from Django API
const fetchBackendBlogs = async (): Promise<AdminBlog[]> => {
  try {
    const token =
      localStorage.getItem("access") ||
      localStorage.getItem("access_token") ||
      "";

    if (!token) {
      console.warn("No auth token found, only using local blogs");
      return [];
    }

    const response = await fetch(`${API_URL}/api/admin/blogs/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      console.error("Failed to fetch backend blogs:", response.status);
      return [];
    }

    const backendBlogs = await response.json();
    const list = Array.isArray(backendBlogs)
      ? backendBlogs
      : Array.isArray(backendBlogs?.results)
        ? backendBlogs.results
        : [];
    return list.map(backendBlogToAdminBlog);
  } catch (error) {
    console.error("Error fetching backend blogs:", error);
    return [];
  }
};

// Function to convert data URL to File object
const dataURLtoFile = (dataurl: string, filename: string): File | null => {
  try {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  } catch (error) {
    console.error('Error converting data URL to file:', error);
    return null;
  }
};

// Try to upload image to backend, but fall back to placeholder if fails
const tryUploadImageToBackend = async (file: File, token: string): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    // Try multiple possible endpoints
    const endpoints = [
      `${API_URL}/api/admin/upload-image/`,
      `${API_URL}/api/upload-image/`,
      `${API_URL}/api/admin/blogs/upload/`,
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          return data.url || data.image_url || data.path || null;
        }
      } catch (error) {
        console.log(`Endpoint ${endpoint} failed:`, error);
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error trying to upload image:', error);
    return null;
  }
};

export default function BlogAdmin() {
  const router = useRouter();
  const [tagsInput, setTagsInput] = useState("");
  const [blogs, setBlogs] = useState<AdminBlog[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<string>('');
  const [bannerFiles, setBannerFiles] = useState<Record<string, File | null>>({});
  const [authorAvatarFiles, setAuthorAvatarFiles] = useState<Record<string, File | null>>({});
  const [showDicebearDemo, setShowDicebearDemo] = useState<Record<string, boolean>>({});
  const bannerUrlInputRef = useRef<HTMLInputElement | null>(null);

  // Editor draft
  const active = useMemo(
    () => blogs.find((b) => b.id === activeId) || null,
    [blogs, activeId]
  );

  // Check if banner image is a data URL
  const isBannerDataUrl = useMemo(() => {
    return active?.bannerImageUrl?.startsWith('data:') || false;
  }, [active?.bannerImageUrl]);

  const isAuthorAvatarDataUrl = useMemo(() => {
    return active?.author?.avatarUrl?.startsWith("data:") || false;
  }, [active?.author?.avatarUrl]);

  useEffect(() => {
    if (!active) {
      setTagsInput("");
      return;
    }
    setTagsInput((active.tags || []).join(", "));
  }, [active?.id]);

  // Load blogs from both localStorage and backend API
  useEffect(() => {
    const loadAllBlogs = async () => {
      setIsLoading(true);
      
      // 1. Load local blogs from localStorage
      const localBlogs = loadAdminBlogs();
      
      // 2. Fetch blogs from backend API
      const backendBlogs = await fetchBackendBlogs();
      
      // 3. Merge blogs: backend blogs take precedence, keep local drafts
      const blogMap = new Map<string, AdminBlog>();
      
      // Add backend blogs first (published ones from Django)
      backendBlogs.forEach(blog => {
        blogMap.set(blog.id, blog);
      });
      
      // Add local blogs, but don't override backend blogs with same ID
      localBlogs.forEach(localBlog => {
        // If local blog is a draft (not numeric ID) or doesn't exist in backend, add it
        const isLocalDraft = !/^\d+$/.test(localBlog.id);
        if (!blogMap.has(localBlog.id) || isLocalDraft) {
          blogMap.set(localBlog.id, localBlog);
        }
      });
      
      // Convert map back to array
      const mergedBlogs = Array.from(blogMap.values());
      
      // Sort: published first, then by updatedAt
      mergedBlogs.sort((a, b) => {
        if (a.status === "published" && b.status !== "published") return -1;
        if (a.status !== "published" && b.status === "published") return 1;
        
        // Fix: Ensure we have valid dates before creating Date objects
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      });
      
      setBlogs(mergedBlogs);
      if (mergedBlogs.length > 0) {
        setActiveId(mergedBlogs[0].id);
      }
      setIsLoading(false);
    };
    
    loadAllBlogs();
  }, []);

  useEffect(() => {
    saveAdminBlogs(blogs);
  }, [blogs]);

  const publishedCount = useMemo(
    () => blogs.filter((b) => b.status === "published").length,
    [blogs]
  );

  const onCreate = () => {
    const b = makeNewBlog();
    setBlogs((prev) => [b, ...prev]);
    setActiveId(b.id);
  };

  const updateActive = (patch: Partial<AdminBlog>) => {
    if (!active) return;
    setBlogs((prev) =>
      prev.map((b) =>
        b.id === active.id
          ? {
              ...b,
              ...patch,
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    );
  };

  const autoFill = () => {
    if (!active) return;

    const title = (active.title || "").trim();
    const slug = slugify(active.slug || title);

    const canonical = active.meta?.canonical?.trim()
      ? active.meta.canonical
      : autoCanonical(slug);

    const metaTitle = active.meta?.title?.trim()
      ? active.meta.title
      : autoMetaTitle(title);

    const metaDesc = active.meta?.description?.trim()
      ? active.meta.description
      : autoMetaDescription(active.excerpt, active.content);

    updateActive({
      title,
      slug,
      meta: {
        ...active.meta,
        canonical,
        title: metaTitle,
        description: metaDesc,
        allowIndexing: active.meta?.allowIndexing ?? true,
      },
    });
  };

  const onSaveDraft = async () => {
    if (!active) return;

    const tags = parseTags(tagsInput);
    const title = (active.title || "").trim();
    const slug = slugify(active.slug || title);

    const canonical = active.meta?.canonical?.trim()
      ? active.meta.canonical
      : autoCanonical(slug);

    const metaTitle = active.meta?.title?.trim()
      ? active.meta.title
      : autoMetaTitle(title);

    const metaDesc = active.meta?.description?.trim()
      ? active.meta.description
      : autoMetaDescription(active.excerpt, active.content);

    updateActive({
      title,
      slug,
      tags,
      meta: {
        ...active.meta,
        canonical,
        title: metaTitle,
        description: metaDesc,
        allowIndexing: active.meta?.allowIndexing ?? true,
      },
    });

    const isBackendId = /^\d+$/.test(active.id);
    if (!isBackendId || active.status !== "published") return;

    const token =
      localStorage.getItem("access") ||
      localStorage.getItem("access_token") ||
      "";

    if (!token) return;
    if (!title || !slug) return;

    try {
      const url = `${API_URL}/api/admin/blogs/${active.id}/`;

      const fd = new FormData();
      fd.append("title", title);
      fd.append("slug", slug);
      fd.append("excerpt", active.excerpt || "");
      fd.append("content", active.content || "");
      if (active.category?.trim()) fd.append("category", active.category.trim());
      fd.append("status", "published");
      fd.append("featured", String(!!active.featured));
      fd.append("allow_indexing", String(active.meta?.allowIndexing ?? true));
      fd.append("tags", JSON.stringify(tags));

      const bannerImageUrl = normalizeExternalImageUrl((active.bannerImageUrl || "").trim());
      const bannerFileFromPicker = bannerFiles[active.id] || null;
      if (bannerFileFromPicker) {
        fd.append("banner_image", bannerFileFromPicker);
      } else if (bannerImageUrl && !bannerImageUrl.startsWith("data:")) {
        if (!parseHttpUrl(bannerImageUrl)) {
          alert("Banner Image URL must start with http:// or https://");
          return;
        }
        fd.append("banner_image_url", bannerImageUrl);
      }
      if (active.bannerImageAlt) fd.append("banner_image_alt", active.bannerImageAlt);
      if (active.bannerImagePosition) fd.append("banner_image_position", active.bannerImagePosition);

      if (active.author?.name?.trim()) fd.append("author_name", active.author.name.trim());
      if (active.author?.role?.trim()) fd.append("author_role", active.author.role.trim());
      if (active.author?.gender) fd.append("author_gender", active.author.gender);
      if (active.author?.avatarStyle) fd.append("author_avatar_style", active.author.avatarStyle);

      const authorAvatarUrl = normalizeExternalImageUrl((active.author?.avatarUrl || "").trim());
      const authorFileFromPicker = authorAvatarFiles[active.id] || null;
      if (authorFileFromPicker) {
        fd.append("author_avatar", authorFileFromPicker);
      } else if (authorAvatarUrl && !authorAvatarUrl.startsWith("data:")) {
        if (!parseHttpUrl(authorAvatarUrl)) {
          alert("Avatar URL must start with http:// or https://");
          return;
        }
        fd.append("author_avatar_url", authorAvatarUrl);
      }

      fd.append("meta_title", metaTitle);
      fd.append("meta_description", metaDesc);
      fd.append("canonical_url", canonical);

      const res = await fetch(url, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) return;

      const saved = await res.json().catch(() => null);
      if (!saved) return;

      const backendBlog = backendBlogToAdminBlog(saved);
      setBlogs((prev) => {
        const withoutOld = prev.filter((b) => b.id !== active.id);
        const next = [backendBlog, ...withoutOld];
        saveAdminBlogs(next);
        return next;
      });
      setActiveId(String(saved.id));
    } catch {
    }
  };

  const onPublish = async () => {
    if (!active) return;

    // Compute locally (don't depend on setState timing)
    const title = (active.title || "").trim();
    const slug = slugify(active.slug || title);
    if (!title || !slug) {
      alert("Title and slug are required");
      return;
    }

    const canonical = active.meta?.canonical?.trim()
      ? active.meta.canonical
      : autoCanonical(slug);

    const metaTitle = active.meta?.title?.trim()
      ? active.meta.title
      : autoMetaTitle(title);

    const metaDesc = active.meta?.description?.trim()
      ? active.meta.description
      : autoMetaDescription(active.excerpt, active.content);

    const tags = parseTags(tagsInput);

    const token =
      localStorage.getItem("access") ||
      localStorage.getItem("access_token") ||
      "";

    if (!token) {
      alert("Access token missing. Please login again.");
      return;
    }

    setIsPublishing(true);
    setImageUploadStatus('');

    try {
      const bannerImageUrl = normalizeExternalImageUrl((active.bannerImageUrl || "").trim());
      const bannerImageAlt = active.bannerImageAlt || "";
      const fileFromPicker = bannerFiles[active.id] || null;
      const fileFromDataUrl =
        !fileFromPicker && bannerImageUrl.startsWith("data:")
          ? dataURLtoFile(bannerImageUrl, `banner-${Date.now()}.jpg`)
          : null;
      let bannerImageFile = fileFromPicker || fileFromDataUrl;
      let bannerImageUrlToSend = bannerImageUrl;
      const BACKEND_URL_MAX = 200;

      if (
        !bannerImageFile &&
        bannerImageUrlToSend &&
        !bannerImageUrlToSend.startsWith("data:") &&
        !parseHttpUrl(bannerImageUrlToSend)
      ) {
        alert("Banner Image URL must start with http:// or https://");
        setIsPublishing(false);
        setImageUploadStatus("");
        return;
      }

      if (
        !bannerImageFile &&
        bannerImageUrlToSend &&
        !bannerImageUrlToSend.startsWith("data:") &&
        bannerImageUrlToSend.length > BACKEND_URL_MAX
      ) {
        setImageUploadStatus("Banner URL is long — uploading image to server...");
        try {
          const resp = await fetch(bannerImageUrlToSend);
          if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}`);
          }
          const contentType = (resp.headers.get("content-type") || "").toLowerCase();
          const blob = await resp.blob();
          const mime = (contentType || blob.type || "").toLowerCase();
          if (!mime.startsWith("image/")) {
            throw new Error("NOT_IMAGE");
          }
          const ext =
            mime === "image/png"
              ? "png"
              : mime === "image/webp"
                ? "webp"
                : mime === "image/gif"
                  ? "gif"
                  : "jpg";
          bannerImageFile = new File([blob], `banner-${Date.now()}.${ext}`, {
            type: blob.type || mime || "image/jpeg",
          });
          bannerImageUrlToSend = "";
        } catch (e) {
          alert(
            `Banner image URL is longer than ${BACKEND_URL_MAX} characters (backend limit). Please upload the image from your computer, or paste a shorter URL.`
          );
          setIsPublishing(false);
          setImageUploadStatus("");
          return;
        }
      }

      const authorAvatarUrl = normalizeExternalImageUrl((active.author?.avatarUrl || "").trim());
      const authorFileFromPicker = authorAvatarFiles[active.id] || null;
      const authorFileFromDataUrl =
        !authorFileFromPicker && authorAvatarUrl.startsWith("data:")
          ? dataURLtoFile(authorAvatarUrl, `author-${Date.now()}.jpg`)
          : null;
      let authorAvatarFile = authorFileFromPicker || authorFileFromDataUrl;
      let authorAvatarUrlToSend = authorAvatarUrl;

      if (
        !authorAvatarFile &&
        authorAvatarUrlToSend &&
        !authorAvatarUrlToSend.startsWith("data:") &&
        !parseHttpUrl(authorAvatarUrlToSend)
      ) {
        alert("Avatar URL must start with http:// or https://");
        setIsPublishing(false);
        setImageUploadStatus("");
        return;
      }

      if (
        !authorAvatarFile &&
        authorAvatarUrlToSend &&
        !authorAvatarUrlToSend.startsWith("data:") &&
        authorAvatarUrlToSend.length > BACKEND_URL_MAX
      ) {
        setImageUploadStatus("Avatar URL is long — uploading image to server...");
        try {
          const resp = await fetch(authorAvatarUrlToSend);
          if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}`);
          }
          const contentType = (resp.headers.get("content-type") || "").toLowerCase();
          const blob = await resp.blob();
          const mime = (contentType || blob.type || "").toLowerCase();
          if (!mime.startsWith("image/")) {
            throw new Error("NOT_IMAGE");
          }
          const ext =
            mime === "image/png"
              ? "png"
              : mime === "image/webp"
                ? "webp"
                : mime === "image/gif"
                  ? "gif"
                  : "jpg";
          authorAvatarFile = new File([blob], `author-${Date.now()}.${ext}`, {
            type: blob.type || mime || "image/jpeg",
          });
          authorAvatarUrlToSend = "";
        } catch {
          alert(
            `Avatar URL is longer than ${BACKEND_URL_MAX} characters (backend limit). Please upload the image from your computer, or paste a shorter URL.`
          );
          setIsPublishing(false);
          setImageUploadStatus("");
          return;
        }
      }

      const isBackendId = /^\d+$/.test(active.id);
      const url = isBackendId
        ? `${API_URL}/api/admin/blogs/${active.id}/`
        : `${API_URL}/api/admin/blogs/`;

      const method = isBackendId ? "PATCH" : "POST";

      const buildFormData = (
        positionField: "banner_image_position" | "banner_image_align" | null,
        includeAuthorAvatar: boolean
      ) => {
        const fd = new FormData();
        fd.append("title", title);
        fd.append("slug", slug);
        fd.append("excerpt", active.excerpt || "");
        fd.append("content", active.content || "");
        if (active.category?.trim()) {
          fd.append("category", active.category.trim());
        }
        fd.append("status", "published");
        fd.append("featured", String(!!active.featured));
        fd.append("allow_indexing", String(active.meta?.allowIndexing ?? true));

        fd.append("tags", JSON.stringify(tags));

        if (bannerImageFile) {
          setImageUploadStatus("Uploading banner image...");
          fd.append("banner_image", bannerImageFile);
        } else if (bannerImageUrlToSend && !bannerImageUrlToSend.startsWith("data:")) {
          fd.append("banner_image_url", bannerImageUrlToSend);
        }

        if (bannerImageAlt) fd.append("banner_image_alt", bannerImageAlt);
        if (positionField && active.bannerImagePosition) {
          fd.append(positionField, active.bannerImagePosition);
        }

        if (active.author?.name?.trim()) fd.append("author_name", active.author.name.trim());
        if (active.author?.role?.trim()) fd.append("author_role", active.author.role.trim());
        if (active.author?.gender) fd.append("author_gender", active.author.gender);
        if (active.author?.avatarStyle) fd.append("author_avatar_style", active.author.avatarStyle);
        if (includeAuthorAvatar) {
          if (authorAvatarFile) {
            fd.append("author_avatar", authorAvatarFile);
          } else if (authorAvatarUrlToSend && !authorAvatarUrlToSend.startsWith("data:")) {
            fd.append("author_avatar_url", authorAvatarUrlToSend);
          }
        }

        fd.append("meta_title", metaTitle);
        fd.append("meta_description", metaDesc);
        fd.append("canonical_url", canonical);

        return fd;
      };

      let positionField: "banner_image_position" | "banner_image_align" | null =
        "banner_image_position";
      let includeAuthorAvatar = true;

      let res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: buildFormData(positionField, includeAuthorAvatar),
      });

      let responseText = await res.text();
      console.log("Backend response status:", res.status);
      console.log("Backend response:", responseText);

      if (
        !res.ok &&
        positionField === "banner_image_position" &&
        !!active.bannerImagePosition &&
        responseText.includes("banner_image_position")
      ) {
        positionField = "banner_image_align";
        res = await fetch(url, {
          method,
          headers: { Authorization: `Bearer ${token}` },
          body: buildFormData(positionField, includeAuthorAvatar),
        });
        responseText = await res.text();
      }

      if (
        !res.ok &&
        positionField === "banner_image_align" &&
        !!active.bannerImagePosition &&
        responseText.includes("banner_image_align")
      ) {
        positionField = null;
        res = await fetch(url, {
          method,
          headers: { Authorization: `Bearer ${token}` },
          body: buildFormData(positionField, includeAuthorAvatar),
        });
        responseText = await res.text();
      }

      if (
        !res.ok &&
        includeAuthorAvatar &&
        (authorAvatarFile || authorAvatarUrlToSend) &&
        (responseText.includes("author_avatar") || responseText.includes("author_avatar_url"))
      ) {
        includeAuthorAvatar = false;
        res = await fetch(url, {
          method,
          headers: { Authorization: `Bearer ${token}` },
          body: buildFormData(positionField, includeAuthorAvatar),
        });
        responseText = await res.text();
      }

      if (!res.ok) {
        let errorMessage = `Publish failed: ${res.status}`;
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.detail) {
            errorMessage += ` - ${errorData.detail}`;
          } else if (errorData.message) {
            errorMessage += ` - ${errorData.message}`;
          } else if (typeof errorData === 'object') {
            // Try to extract field errors
            const fieldErrors = Object.entries(errorData)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('; ');
            if (fieldErrors) {
              errorMessage += ` - ${fieldErrors}`;
            } else {
              errorMessage += ` - ${JSON.stringify(errorData)}`;
            }
          }
        } catch (e) {
          errorMessage += ` - ${responseText}`;
        }
        alert(errorMessage);
        setIsPublishing(false);
        setImageUploadStatus('');
        return;
      }

      let saved;
      try {
        saved = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response JSON:", e);
        alert("Published successfully but failed to parse response.");
        saved = { id: active.id, title, slug };
      }

      // Convert backend response to AdminBlog format for state update
      const backendBlog = backendBlogToAdminBlog(saved);

      // Replace local item with backend-saved item
      setBlogs((prev) => {
        const withoutOld = prev.filter((b) => b.id !== active.id);
        const next = [backendBlog, ...withoutOld];
        saveAdminBlogs(next);
        return next;
      });

      setActiveId(String(saved.id));
      setImageUploadStatus('');
      setBannerFiles((prev) => ({ ...prev, [active.id]: null }));
      setAuthorAvatarFiles((prev) => ({ ...prev, [active.id]: null }));
      alert("Blog published successfully!");
      router.push("/blog");
    } catch (error: any) {
      console.error("Error publishing blog:", error);
      alert(error.message || "Failed to publish blog. Check console for details.");
      setImageUploadStatus('');
    } finally {
      setIsPublishing(false);
    }
  };

  const onView = () => {
    if (!active) return;
    const slug = slugify(active.slug || active.title);
    if (!slug) return;
    window.open(`/blog/${slug}`, "_blank");
  };

  const onDelete = async () => {
    if (!active) return;

    const isBackendId = /^\d+$/.test(active.id);

    if (isBackendId) {
      const token =
        localStorage.getItem("access") ||
        localStorage.getItem("access_token") ||
        "";

      if (token) {
        try {
          const res = await fetch(`${API_URL}/api/admin/blogs/${active.id}/`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            alert(`Failed to delete blog: ${res.status}`);
            return;
          }
        } catch {
          alert("Failed to delete blog.");
          return;
        }
      }
    }

    setBlogs((prev) => prev.filter((b) => b.id !== active.id));
    setActiveId(null);
  };

  const onUploadBanner = async (file: File | null) => {
    if (!file || !active) return;
    
    // Check file size (limit to 5MB for data URLs)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large (max 5MB). Please use a smaller image.");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      updateActive({
        bannerImageUrl: String(reader.result || ""),
        bannerImageAlt: file.name,
      });
      setBannerFiles((prev) => ({ ...prev, [active.id]: file }));
    };
    reader.readAsDataURL(file);
  };

  const onUploadAuthorAvatar = async (file: File | null) => {
    if (!file || !active) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large (max 2MB). Please use a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateActive({
        author: {
          ...active.author,
          avatarUrl: String(reader.result || ""),
        },
      });
      setAuthorAvatarFiles((prev) => ({ ...prev, [active.id]: file }));
    };
    reader.readAsDataURL(file);
  };

  // Function to handle external URL input
  const handleExternalUrl = async () => {
    if (!active) return;
    bannerUrlInputRef.current?.focus();

    try {
      const text = (await navigator.clipboard?.readText?.())?.trim();
      if (text && /^https?:\/\//i.test(text)) {
        updateActive({ bannerImageUrl: normalizeExternalImageUrl(text) });
        setBannerFiles((prev) => ({ ...prev, [active.id]: null }));
      }
    } catch {
    }
  };

  // Function to clear banner image
  const clearBannerImage = () => {
    if (!active) return;
    updateActive({
      bannerImageUrl: "",
      bannerImageAlt: "",
    });
    setBannerFiles((prev) => ({ ...prev, [active.id]: null }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-muted-foreground">Loading blogs...</div>
      </div>
    );
  }

  const primaryActionButtonClass =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 rounded-md px-3 bg-gradient-to-r from-primary to-blue-600 text-white text-xs h-8";

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Blogs</h2>
          <p className="text-sm text-muted-foreground">
            Published: {publishedCount} • Total: {blogs.length}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onCreate} className={primaryActionButtonClass}>
            <Plus className="w-3 h-3 mr-1" />
            Add New Blog
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        {/* LEFT: list */}
        <div className="rounded-xl border bg-background flex flex-col h-[70vh]">
          <div className="p-3 border-b shrink-0">
            <p className="text-sm font-semibold">All Posts</p>
            <p className="text-xs text-muted-foreground">
              Click to edit. Published posts appear on /blog.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {blogs.length === 0 ? (
              <div className="p-4" />
            ) : (
              <div className="divide-y">
                {blogs.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setActiveId(b.id)}
                    className={`w-full text-left p-3 hover:bg-muted/50 transition ${
                      activeId === b.id ? "bg-muted/60" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          {b.title?.trim() ? b.title : null}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {b.slug ? `/${b.slug}` : null}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full border ${
                            b.status === "published"
                              ? "bg-green-50 text-green-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {b.status === "published" ? "Published" : "Draft"}
                        </span>
                        {/^\d+$/.test(b.id) && (
                          <span className="text-[9px] text-muted-foreground">
                            Backend
                          </span>
                        )}
                      </div>
                    </div>

                    {b.featured ? (
                      <p className="mt-2 text-[10px] inline-flex px-2 py-1 rounded-full bg-blue-50 text-blue-700 border">
                        Featured
                      </p>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: editor (inline, not popup) */}
        <div className="rounded-xl border bg-background">
          {!active ? (
            <div className="p-6 text-sm text-muted-foreground">
              Select a blog to edit or create a new one.
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Editor top bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                <div>
                  <p className="text-sm font-semibold">
                    {active.status === "published"
                      ? "Edit Blog • Published"
                      : "New Blog • Blog Details"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Slug + canonical + meta defaults auto-generate when you save/publish.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onView}
                    disabled={!active.slug && !active.title}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>

                  <Button variant="outline" size="sm" onClick={onSaveDraft}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>

                  <button
                    type="button"
                    className={primaryActionButtonClass}
                    onClick={onPublish}
                    disabled={isPublishing}
                  >
                    {isPublishing ? "Publishing..." : "Publish"}
                  </button>
                </div>
              </div>

              {imageUploadStatus && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                  <p className="text-xs text-blue-800 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    {imageUploadStatus}
                  </p>
                </div>
              )}

              {/* Form grid */}
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-4">
                {/* LEFT column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Title *</label>
                      <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={active.title}
                        onChange={(e) =>
                          updateActive({
                            title: e.target.value,
                            slug: active.slug ? active.slug : slugify(e.target.value),
                          })
                        }
                        placeholder="e.g. Building Nilaya AI Admin CMS"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">Category</label>
                      <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={active.category}
                        onChange={(e) => updateActive({ category: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Slug</label>
                      <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={active.slug}
                        onChange={(e) => updateActive({ slug: e.target.value })}
                        placeholder="auto-generated-from-title"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">
                        Tags (comma separated)
                      </label>
                      <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        onBlur={() => {
                          if (active) {
                            updateActive({ tags: parseTags(tagsInput) });
                          }
                        }}
                        placeholder="e.g. Next.js, Admin, CMS"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium">Excerpt</label>
                    <textarea
                      className="w-full rounded-md border px-3 py-2 text-sm min-h-[90px]"
                      value={active.excerpt}
                      onChange={(e) => updateActive({ excerpt: e.target.value })}
                      placeholder="Short summary shown on cards and SEO fallback."
                    />
                  </div>

                  <div className="space-y-2">
                  <label className="text-xs font-medium">Content</label>
                  <textarea
                    className="w-full rounded-md border px-3 py-2 text-sm min-h-[400px] font-mono"
                    value={active.content}
                    onChange={(e) => updateActive({ content: e.target.value })}
                    placeholder="Write blog content here. Use double line breaks for paragraphs. You can use markdown for formatting:&#10;&#10;# Heading 1&#10;## Heading 2&#10;### Heading 3&#10;&#10;- Bullet point 1&#10;- Bullet point 2&#10;&#10;1. Numbered list&#10;2. Numbered list"
                    style={{ whiteSpace: 'pre-wrap' }}
                   />
                  <p className="text-xs text-muted-foreground">
                    Use markdown for formatting: # Heading, ## Subheading, - bullets, 1. numbered lists, and double line breaks for paragraphs.
                    </p>
                  </div>
                </div>

                {/* RIGHT column */}
                <div className="space-y-4">
                  {/* Banner image: upload + external link */}
                  <div className="rounded-lg border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Blog Banner Image</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExternalUrl}
                          className="text-xs h-7"
                        >
                          <Link2 className="w-3 h-3 mr-1" />
                          Use URL
                        </Button>
                        {active.bannerImageUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearBannerImage}
                            className="text-xs h-7 text-red-500"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>

                    {isBannerDataUrl && (
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
                        <p className="text-xs text-amber-800">
                          <strong>Note:</strong> Local images will be automatically converted and saved to server when you publish.
                          For production, consider using an external URL for better performance.
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-medium flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload from computer (max 5MB)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onUploadBanner(e.target.files?.[0] || null)}
                        className="block w-full text-sm"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        {isBannerDataUrl 
                          ? "Local image - will be uploaded to server when published" 
                          : "Upload image or use external URL"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">Image URL</label>
                      <input
                        ref={bannerUrlInputRef}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={active.bannerImageUrl}
                        onChange={(e) => {
                          const next = e.target.value;
                          updateActive({ bannerImageUrl: next });
                          if (next.trim() && !next.startsWith("data:")) {
                            setBannerFiles((prev) => ({ ...prev, [active.id]: null }));
                          }
                        }}
                        onBlur={(e) => {
                          const normalized = normalizeExternalImageUrl(e.target.value);
                          if (normalized && normalized !== e.target.value) {
                            updateActive({ bannerImageUrl: normalized });
                            setBannerFiles((prev) => ({ ...prev, [active.id]: null }));
                          }
                        }}
                        placeholder="Enter URL or upload image above"
                      />
                      <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={active.bannerImageAlt}
                        onChange={(e) => updateActive({ bannerImageAlt: e.target.value })}
                        placeholder="Alt text for accessibility"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">Image Crop Alignment</label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant={(active.bannerImagePosition || "center") === "left" ? "default" : "outline"}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => updateActive({ bannerImagePosition: "left" })}
                        >
                          Left
                        </Button>
                        <Button
                          type="button"
                          variant={(active.bannerImagePosition || "center") === "center" ? "default" : "outline"}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => updateActive({ bannerImagePosition: "center" })}
                        >
                          Center
                        </Button>
                        <Button
                          type="button"
                          variant={(active.bannerImagePosition || "center") === "right" ? "default" : "outline"}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => updateActive({ bannerImagePosition: "right" })}
                        >
                          Right
                        </Button>
                      </div>
                    </div>

                    {active.bannerImageUrl ? (
                      <div className="rounded-md overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={active.bannerImageUrl}
                          alt={active.bannerImageAlt || "Banner preview"}
                          className={`w-full h-[140px] object-cover ${
                            (active.bannerImagePosition || "center") === "left"
                              ? "object-left"
                              : (active.bannerImagePosition || "center") === "right"
                                ? "object-right"
                                : "object-center"
                          }`}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="p-2 bg-gray-50 flex justify-between items-center">
                          <span className="text-[10px] text-muted-foreground">
                            {isBannerDataUrl ? "Local image" : "External URL"}
                          </span>
                          {isBannerDataUrl && (
                            <span className="text-[10px] text-blue-600">
                              Will upload on publish
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed p-8 text-center">
                        <p className="text-sm text-muted-foreground">No banner image selected</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Optional: Add an image to make your blog stand out
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Author */}
                  <div className="rounded-lg border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Author Details</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Name</label>
                        <input
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          value={active.author.name}
                          onChange={(e) =>
                            updateActive({
                              author: { ...active.author, name: e.target.value },
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium">Role</label>
                        <input
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          value={active.author.role}
                          onChange={(e) =>
                            updateActive({
                              author: { ...active.author, role: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Gender</label>
                        <select
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          value={active.author.gender}
                          onChange={(e) =>
                            updateActive({
                              author: {
                                ...active.author,
                                gender: e.target.value as any,
                              },
                            })
                          }
                        >
                          <option value="neutral">Neutral</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium">Avatar Style</label>
                        <select
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          value={active.author.avatarStyle}
                          onChange={(e) =>
                            updateActive({
                              author: {
                                ...active.author,
                                avatarStyle: e.target.value as any,
                              },
                            })
                          }
                        >
                          <option value="style1">Style 1</option>
                          <option value="style2">Style 2</option>
                          <option value="style3">Style 3</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">Profile Avatar</label>

                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-full overflow-hidden border bg-muted">
                          <img
                            src={
                              showDicebearDemo[active.id]
                                ? getDicebearUrl(
                                    buildAuthorAvatarSeed(active.author, active.id),
                                    active.author.avatarStyle
                                  )
                                : active.author.avatarUrl ||
                                  getPravatarUrl(
                                    buildAuthorAvatarSeed(active.author, active.id)
                                  )
                            }
                            alt={active.author.name || "Author"}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setShowDicebearDemo((prev) => ({
                                ...prev,
                                [active.id]: false,
                              }));

                              const base = active.author.name || active.id;
                              const seed = buildAuthorAvatarSeed(
                                active.author,
                                active.id,
                                `${base}-${Date.now()}-${Math.random()
                                  .toString(16)
                                  .slice(2)}`
                              );

                              updateActive({
                                author: {
                                  ...active.author,
                                  avatarUrl: getPravatarUrl(seed),
                                },
                              });
                            }}
                          >
                            Generate
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() =>
                              setShowDicebearDemo((prev) => ({
                                ...prev,
                                [active.id]: !prev[active.id],
                              }))
                            }
                          >
                            DiceBear Demo
                          </Button>
                          {!!active.author.avatarUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-red-500"
                              onClick={() => {
                                setShowDicebearDemo((prev) => ({
                                  ...prev,
                                  [active.id]: false,
                                }));
                                updateActive({
                                  author: { ...active.author, avatarUrl: "" },
                                });
                              }}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>

                      <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={active.author.avatarUrl || ""}
                        onChange={(e) => {
                          const next = e.target.value;
                          updateActive({
                            author: { ...active.author, avatarUrl: next },
                          });
                          if (next.trim() && !next.startsWith("data:")) {
                            setAuthorAvatarFiles((prev) => ({ ...prev, [active.id]: null }));
                          }
                        }}
                        onBlur={(e) => {
                          const normalized = normalizeExternalImageUrl(e.target.value);
                          if (normalized && normalized !== e.target.value) {
                            updateActive({
                              author: { ...active.author, avatarUrl: normalized },
                            });
                            setAuthorAvatarFiles((prev) => ({ ...prev, [active.id]: null }));
                          }
                        }}
                        placeholder="Avatar URL (optional)"
                      />

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onUploadAuthorAvatar(e.target.files?.[0] || null)}
                        className="block w-full text-sm"
                      />

                      <p className="text-[11px] text-muted-foreground">
                        {isAuthorAvatarDataUrl
                          ? "Local avatar - will be uploaded to server when published"
                          : "Use URL, generate, or upload from computer"}
                      </p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="rounded-lg border p-3 space-y-3">
                    <p className="text-sm font-semibold">Meta Tags (SEO)</p>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">Meta Title (≤ 60)</label>
                      <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={active.meta.title}
                        onChange={(e) =>
                          updateActive({ meta: { ...active.meta, title: e.target.value } })
                        }
                        placeholder="Auto from title"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">
                        Meta Description (150–160)
                      </label>
                      <textarea
                        className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px]"
                        value={active.meta.description}
                        onChange={(e) =>
                          updateActive({
                            meta: { ...active.meta, description: e.target.value },
                          })
                        }
                        placeholder="Auto from excerpt/content if empty"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">Canonical</label>
                      <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={active.meta.canonical}
                        onChange={(e) =>
                          updateActive({
                            meta: { ...active.meta, canonical: e.target.value },
                          })
                        }
                        placeholder="/blog/your-slug"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Canonical will be saved as: /blog/your-slug
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <label className="text-xs font-medium">Allow indexing</label>
                      <input
                        type="checkbox"
                        checked={active.meta.allowIndexing}
                        onChange={(e) =>
                          updateActive({
                            meta: { ...active.meta, allowIndexing: e.target.checked },
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Featured */}
                  <div className="rounded-lg border p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Featured Article</p>
                      <p className="text-xs text-muted-foreground">
                        Show this blog in Featured section.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={active.featured}
                      onChange={(e) => updateActive({ featured: e.target.checked })}
                    />
                  </div>

                  {/* Delete (optional) */}
                  <div className="flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={onDelete}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>

              {/* Compact footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Status:{" "}
                  <span className="font-medium">
                    {active.status === "published" ? "Published" : "Draft"}
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={onSaveDraft}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <button
                    type="button"
                    className={primaryActionButtonClass}
                    onClick={onPublish}
                    disabled={isPublishing}
                  >
                    {isPublishing ? "Publishing..." : "Publish"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
