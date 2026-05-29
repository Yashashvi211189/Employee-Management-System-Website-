// lib/blog-data.ts

import { API_URL } from "@/lib/config";
import { BLOGS_UPDATED_EVENT } from "@/lib/admin-blog-store";

/* =======================
   Types
======================= */
export type PublicBlogPost = {
  id: string | number;
  title?: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image?: string;
  imagePosition?: "left" | "center" | "right";
  category?: string;
  tags?: string[];
  date?: string;
  status?: "draft" | "published";
  featured?: boolean;
  readingTime?: number;
  author?: {
    name?: string;
    avatar?: string;
    role?: string;
  };
};


/* =======================
   Helpers
======================= */
function estimateReadingTime(text: string): number {
  const words = (text || "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeStatus(value: unknown): "draft" | "published" | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim().toLowerCase();
  if (v === "published") return "published";
  if (v === "draft") return "draft";
  return undefined;
}

function normalizeApiImageUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("data:")) return v;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("/")) return `${API_URL}${v}`;
  return `${API_URL}/${v}`;
}

function normalizeImagePosition(value: unknown): "left" | "center" | "right" {
  if (typeof value !== "string") return "center";
  const v = value.trim().toLowerCase();
  if (v === "left") return "left";
  if (v === "right") return "right";
  return "center";
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return v ? v : undefined;
}

function transformApiBlog(apiBlog: any): PublicBlogPost | null {
  const slug = asNonEmptyString(apiBlog?.slug);
  if (!slug) return null;

  const apiImage =
    apiBlog?.image ?? apiBlog?.banner_image ?? apiBlog?.banner_image_url ?? "";
  const image = normalizeApiImageUrl(apiImage);
  const imagePosition = normalizeImagePosition(
    apiBlog?.banner_image_position ??
      apiBlog?.banner_image_align ??
      apiBlog?.image_position ??
      apiBlog?.image_align
  );

  const authorName = asNonEmptyString(apiBlog?.author?.name ?? apiBlog?.author_name);
  const authorAvatarFromApi =
    apiBlog.author?.avatar ??
    apiBlog.author_avatar ??
    apiBlog.author_avatar_url ??
    "";
  const authorAvatar = normalizeApiImageUrl(authorAvatarFromApi);
  const authorRole = asNonEmptyString(apiBlog?.author?.role ?? apiBlog?.author_role);

  const dateSource =
    apiBlog?.date || apiBlog?.published_at || apiBlog?.updated_at || apiBlog?.created_at;
  const dateFormatted = asNonEmptyString(dateSource) ? formatDate(dateSource) : undefined;

  const content = asNonEmptyString(apiBlog?.content);

  return {
    id: apiBlog?.id ?? slug,
    title: asNonEmptyString(apiBlog?.title),
    slug,
    excerpt: asNonEmptyString(apiBlog?.excerpt),
    content,
    image: image || undefined,
    imagePosition: image ? imagePosition : undefined,
    category: asNonEmptyString(apiBlog?.category),
    tags: Array.isArray(apiBlog?.tags)
      ? apiBlog.tags
          .map((t: unknown) => asNonEmptyString(t))
          .filter((t: string | undefined): t is string => Boolean(t))
      : [],
    date: dateFormatted,
    status: normalizeStatus(apiBlog.status),
    featured: !!apiBlog.featured,
    readingTime:
      typeof apiBlog.readingTime === "number" && Number.isFinite(apiBlog.readingTime)
        ? Math.max(1, Math.round(apiBlog.readingTime))
        : content
          ? estimateReadingTime(content)
          : undefined,
    author:
      authorName || authorAvatar || authorRole
        ? {
            name: authorName,
            avatar: authorAvatar || undefined,
            role: authorRole,
          }
        : undefined,
  };
}

function extractBlogsArray(data: any): any[] {
  return Array.isArray(data) ? data : data?.results || [];
}

/* =======================
   Client-side Functions
======================= */
export async function fetchPublicBlogsClient(): Promise<PublicBlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/api/blogs/`, { cache: "no-store" });
    if (!res.ok) return [];

    const data = await res.json();
    const blogsArray = extractBlogsArray(data);
    const apiBlogs = blogsArray
      .map(transformApiBlog)
      .filter((b): b is PublicBlogPost => Boolean(b));

    return apiBlogs
      .filter((b) => !!b?.slug && b.status !== "draft")
      .sort(
        (a: PublicBlogPost, b: PublicBlogPost) =>
          +new Date(b.date || 0) - +new Date(a.date || 0)
      );
  } catch {
    return [];
  }
}

export async function fetchBlogBySlug(slug: string): Promise<PublicBlogPost | null> {
  try {
    const res = await fetch(`${API_URL}/api/blogs/${slug}/`, {
      cache: "no-store"
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return transformApiBlog(data);
    
  } catch {
    return null;
  }
}

/* =======================
   Server-side Functions (for SSR/SSG)
======================= */
export async function getAllBlogPostsServer(): Promise<PublicBlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/api/blogs/`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    const blogsArray = extractBlogsArray(data);
    const apiBlogs = blogsArray
      .map(transformApiBlog)
      .filter((b): b is PublicBlogPost => Boolean(b));
    
    return apiBlogs
      .filter((b) => !!b?.slug && b.status !== "draft")
      .sort(
        (a: PublicBlogPost, b: PublicBlogPost) =>
          +new Date(b.date || 0) - +new Date(a.date || 0)
      );
    
  } catch {
    return [];
  }
}

export async function fetchPublicBlogs(): Promise<PublicBlogPost[]> {
  // Alias for backward compatibility
  return fetchPublicBlogsClient();
}

/* =======================
   Admin update listener
======================= */
export function subscribeBlogUpdates(cb: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(BLOGS_UPDATED_EVENT, cb);
  return () => window.removeEventListener(BLOGS_UPDATED_EVENT, cb);
}
