/* =========================================================
   Constants
========================================================= */
export const BLOGS_STORAGE_KEY = "blogs";
export const BLOGS_UPDATED_EVENT = "BLOGS_UPDATED_EVENT";

/* =========================================================
   Types
========================================================= */
export type BlogMeta = {
  title: string;
  description: string;
  canonical: string;
  allowIndexing: boolean;
};

export type BlogAuthor = {
  name: string;
  role?: string;
  gender?: "male" | "female" | "neutral";
  avatarStyle?: "style1" | "style2" | "style3";
  avatarUrl?: string;
};

export type AdminBlog = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category: string;
  tags: string[];
  bannerImageUrl?: string;
  bannerImageAlt?: string;
  bannerImagePosition?: "left" | "center" | "right";

  author: BlogAuthor;
  meta: BlogMeta;

  featured: boolean;
  status: "draft" | "published";

  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
};

/* =========================================================
   Internal helpers
========================================================= */
function safeParse<T>(value: string | null, fallback: T): T {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function emitUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BLOGS_UPDATED_EVENT));
}

/* =========================================================
   READ
========================================================= */
export function loadAdminBlogs(): AdminBlog[] {
  if (typeof window === "undefined") return [];
  return safeParse<AdminBlog[]>(
    localStorage.getItem(BLOGS_STORAGE_KEY),
    []
  );
}

/* =========================================================
   WRITE
========================================================= */
export function saveAdminBlogs(blogs: AdminBlog[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BLOGS_STORAGE_KEY, JSON.stringify(blogs));
  emitUpdate();
}

/* =========================================================
   FACTORY
========================================================= */
export function makeNewBlog(): AdminBlog {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  return {
    id,
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    tags: [],
    bannerImageUrl: "",
    bannerImageAlt: "",
    bannerImagePosition: "center",

    author: {
      name: "",
      role: "",
      avatarUrl: "",
    },

    meta: {
      title: "",
      description: "",
      canonical: "",
      allowIndexing: true,
    },

    featured: false,
    status: "draft",

    createdAt: now,
    updatedAt: now,
  };
}

/* =========================================================
   SEO HELPERS (USED BY BlogAdmin.tsx)
========================================================= */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function autoCanonical(slug: string) {
  return `/blog/${slug}`;
}

export function autoMetaTitle(title: string) {
  return title.length > 60 ? title.slice(0, 57) + "…" : title;
}

export function autoMetaDescription(
  excerpt?: string,
  content?: string
) {
  const base = excerpt?.trim() || content?.trim() || "";
  return base.length > 160 ? base.slice(0, 157) + "…" : base;
}

export function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
