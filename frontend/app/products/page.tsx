"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  MessageSquare,
  FileText,
  Video,
  Ticket,
  Layers,
  Check,
  MapPin,
  Phone,
  Mail,
  X,
  ExternalLink,
  Globe,
  FileCode2,
  Rocket,
  Search,
  RefreshCw,
  BarChart3,
  AlertTriangle,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Heart,
  Zap,
  Palette,
  Megaphone,
  Building,
  Briefcase,
  Target,
  Brain,
  Code,
  Paintbrush,
  // DollarSign,
  Stethoscope,
  Cloud,
  Users,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/config";

/* ----------------------------- Types (API) ----------------------------- */
type ApiGalleryImage = {
  id: number;
  image: string;
  created_at: string;
};

type ApiProduct = {
  id: number;
  name: string;
  tagline?: string | null;
  iconText?: string | null;
  cover?: string | null;
  description?: string | null;
  fullDescription?: string | null;
  category?: string | null;
  status?: string | null;

  features?: unknown;
  outcomes?: unknown;
  challenges?: unknown;
  technologies?: unknown;
  stats?: unknown;

  gallery_images?: ApiGalleryImage[] | null;

  liveUrl?: string | null;
  demoUrl?: string | null;
  documentationUrl?: string | null;
  pricing?: string | null


  featured?: boolean | null;
  sortOrder?: number | null;
  created_at?: string | null;
};

/* ------------------------------ UI types ------------------------------ */
type IconKey =
  | "education"
  | "business"
  | "productivity"
  | "analytics"
  | "communication"
  | "development"
  | "design"
  | "marketing"
  | "finance"
  | "healthcare";

type StatItem = { label: string; value: string };

type UiProduct = {
  id: string;
  name: string;
  category: string;
  status: string;

  iconText: string;
  iconKey: IconKey;

  coverUrl: string;
  galleryUrls: string[];
  description: string;
  fullDescription: string;

  technologies: string[];
  features: string[];
  challenges: string[];
  outcomes: string[];
  stats: StatItem[];

  liveUrl?: string;
  demoUrl?: string;
  documentationUrl?: string;
  pricing?: string;

  featured: boolean;
  sortOrder: number;
};

/* ----------------------------- Helpers ----------------------------- */
const ORIGIN_FALLBACK = "https://nilaya.ai";
const POLL_MS = 20000;
const CACHE_KEY = "nilaya_products_cache_v1";

// Canonical category mapping - updated to use new categories
const CANONICAL_CATEGORIES: Record<string, string> = {
  // Education - comprehensive mapping
  "education": "Education",
  "edtech": "Education",
  "edu": "Education",
  "learning": "Education",
  "lms": "Education",
  "elearning": "Education",
  "e-learning": "Education",
  "course": "Education",
  "training": "Education",
  "academic": "Education",
  "school": "Education",
  "university": "Education",
  "college": "Education",
  "edutech": "Education",

  // Business - comprehensive mapping
  "business": "Business",
  "enterprise": "Business",
  "saas": "Business",
  "software-as-a-service": "Business",
  "management": "Business",
  "crm": "Business",
  "erp": "Business",
  "operations": "Business",
  "b2b": "Business",
  "business-intelligence": "Business",
  "gov": "Business", // Government mapped to Business
  "government": "Business",
  "govtech": "Business",

  // Productivity
  "productivity": "Productivity",
  "task": "Productivity",
  "project": "Productivity",
  "workflow": "Productivity",
  "automation": "Productivity",
  "efficiency": "Productivity",
  "time-management": "Productivity",
  "collaboration": "Productivity",

  // Analytics
  "analytics": "Analytics",
  "ai": "Analytics",
  "ml": "Analytics",
  "ai-ml": "Analytics",
  "artificial-intelligence": "Analytics",
  "machine-learning": "Analytics",
  "data": "Analytics",
  "data-science": "Analytics",
  "business-analytics": "Analytics",
  "insights": "Analytics",
  "reporting": "Analytics",
  "dashboard": "Analytics",
  "intelligence": "Analytics",

  // Communication
  "communication": "Communication",
  "chat": "Communication",
  "comms": "Communication",
  "messaging": "Communication",
  "video": "Communication",
  "video-conferencing": "Communication",
  "voice": "Communication",
  "voice-chat": "Communication",
  "team-communication": "Communication",
  "internal-communication": "Communication",
  "social": "Communication",

  // Development
  "development": "Development",
  "dev": "Development",
  "devops": "Development",
  "software-development": "Development",
  "programming": "Development",
  "coding": "Development",
  "web-development": "Development",
  "app-development": "Development",
  "mobile-development": "Development",
  "api": "Development",
  "backend": "Development",
  "frontend": "Development",
  "fullstack": "Development",
  "full-stack": "Development",
  "blockchain": "Development",
  "mobile": "Development",
  "mobile-apps": "Development",
  "mobile-app": "Development",

  // Design
  "design": "Design",
  "ui": "Design",
  "ux": "Design",
  "user-interface": "Design",
  "user-experience": "Design",
  "graphics": "Design",
  "graphic-design": "Design",
  "web-design": "Design",
  "app-design": "Design",
  "prototyping": "Design",
  "figma": "Design",
  "sketch": "Design",
  "creative": "Design",

  // Marketing
  "marketing": "Marketing",
  "digital": "Marketing",
  "digital-marketing": "Marketing",
  "seo": "Marketing",
  "search-engine-optimization": "Marketing",
  "sem": "Marketing",
  "social-media": "Marketing",
  "advertising": "Marketing",
  "ads": "Marketing",
  "campaign": "Marketing",
  "branding": "Marketing",
  "content": "Marketing",
  "content-marketing": "Marketing",
  "email": "Marketing",
  "email-marketing": "Marketing",
  "growth": "Marketing",

  // Finance
  "finance": "Finance",
  "fintech": "Finance",
  "financial-technology": "Finance",
  "banking": "Finance",
  "payment": "Finance",
  "payment-processing": "Finance",
  "accounting": "Finance",
  "personal-finance": "Finance",
  "investment": "Finance",
  "trading": "Finance",
  "stock-trading": "Finance",
  "crypto": "Finance",
  "cryptocurrency": "Finance",
  "wealth": "Finance",
  "insurance": "Finance",

  // Healthcare
  "healthcare": "Healthcare",
  "health": "Healthcare",
  "medical": "Healthcare",
  "health-tech": "Healthcare",
  "medical-technology": "Healthcare",
  "telemedicine": "Healthcare",
  "tele-health": "Healthcare",
  "patient-care": "Healthcare",
  "hospital": "Healthcare",
  "clinic": "Healthcare",
  "pharmacy": "Healthcare",
  "wellness": "Healthcare",
  "fitness": "Healthcare",
  "biotech": "Healthcare",
  "medtech": "Healthcare",

  // E-commerce mapped to Business
  "ecommerce": "Business",
  "e-commerce": "Business",
  "ecom": "Business",
  "shop": "Business",
  "shopping": "Business",
  "retail": "Business",
};

function normalizeCategory(raw?: string | null): string {
  if (!raw) return "Business";
  const key = raw.toLowerCase().trim();

  // Try exact match first
  if (key in CANONICAL_CATEGORIES) {
    return CANONICAL_CATEGORIES[key];
  }

  // Try partial matching for robustness
  if (key.includes("edu") || key.includes("learn") || key.includes("school") || key.includes("college")) {
    return "Education";
  }
  if (key.includes("biz") || key.includes("enterprise") || key.includes("saas") || key.includes("crm") || key.includes("erp") || key.includes("gov")) {
    return "Business";
  }
  if (key.includes("productivity") || key.includes("task") || key.includes("project") || key.includes("workflow")) {
    return "Productivity";
  }
  if (key.includes("analytics") || key.includes("ai") || key.includes("ml") || key.includes("data") || key.includes("insight")) {
    return "Analytics";
  }
  if (key.includes("comm") || key.includes("chat") || key.includes("message") || key.includes("video") || key.includes("social")) {
    return "Communication";
  }
  if (key.includes("dev") || key.includes("code") || key.includes("program") || key.includes("blockchain") || key.includes("mobile")) {
    return "Development";
  }
  if (key.includes("design") || key.includes("ui") || key.includes("ux") || key.includes("graphic") || key.includes("creative")) {
    return "Design";
  }
  if (key.includes("market") || key.includes("seo") || key.includes("ad") || key.includes("brand") || key.includes("growth")) {
    return "Marketing";
  }
  if (key.includes("fin") || key.includes("bank") || key.includes("payment") || key.includes("crypto") || key.includes("wealth")) {
    return "Finance";
  }
  if (key.includes("health") || key.includes("medical") || key.includes("care") || key.includes("wellness") || key.includes("bio")) {
    return "Healthcare";
  }

  return "Business";
}

function titleCase(input: string) {
  return input
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);

  if (typeof value === "string") {
    return value
      .split(/[\n,]+/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (value && typeof value === "object") {
    const anyVal = value as any;
    if (Array.isArray(anyVal.items)) {
      return anyVal.items.map(String).map((s: string) => s.trim()).filter(Boolean);
    }
  }

  return [];
}

function toStatItems(stats: unknown): StatItem[] {
  if (!stats) return [];

  if (Array.isArray(stats)) {
    return stats
      .map((x) => {
        if (x && typeof x === "object") {
          const o = x as any;
          const label = String(o.label ?? o.name ?? o.key ?? "").trim();
          const value = String(o.value ?? o.val ?? o.count ?? "").trim();
          if (label && value) return { label, value };
          return null;
        }
        const s = String(x).trim();
        return s ? { label: "Stat", value: s } : null;
      })
      .filter(Boolean) as StatItem[];
  }

  if (typeof stats === "object") {
    return Object.entries(stats as Record<string, unknown>)
      .map(([k, v]) => ({
        label: titleCase(k),
        value: String(v ?? "").trim(),
      }))
      .filter((x) => x.label && x.value);
  }

  return [{ label: "Stat", value: String(stats) }];
}

function pickIconKey(categoryRaw: string): IconKey {
  const category = normalizeCategory(categoryRaw);
  const c = category.toLowerCase();

  if (c.includes("education")) return "education";
  if (c.includes("business")) return "business";
  if (c.includes("productivity")) return "productivity";
  if (c.includes("analytics")) return "analytics";
  if (c.includes("communication")) return "communication";
  if (c.includes("development")) return "development";
  if (c.includes("design")) return "design";
  if (c.includes("marketing")) return "marketing";
  if (c.includes("finance")) return "finance";
  if (c.includes("healthcare")) return "healthcare";

  return "business";
}

// FIXED GRADIENT_STYLE with correct icons and gradients
const GRADIENT_STYLE: Record<
  IconKey,
  {
    Icon: any;
    gradient: string;
    badge: string;
    color: string;
    fromColor: string;
    toColor: string;
  }
> = {
  education: {
    Icon: BookOpen, // Correct icon for Education
    gradient: "from-blue-500 to-purple-600",
    badge: "Education", // Changed from EdTech to Education
    color: "blue-500",
    fromColor: "blue-500",
    toColor: "purple-600"
  },
  business: {
    Icon: Building, // Better icon for Business (was Rocket)
    gradient: "from-green-500 to-emerald-600",
    badge: "Business",
    color: "green-500",
    fromColor: "green-500",
    toColor: "emerald-600"
  },
  productivity: {
    Icon: Zap, // Good icon for Productivity
    gradient: "from-orange-500 to-red-600",
    badge: "Productivity",
    color: "orange-500",
    fromColor: "orange-500",
    toColor: "red-600"
  },
  analytics: {
    Icon: BarChart3, // Good icon for Analytics
    gradient: "from-purple-500 to-pink-600",
    badge: "Analytics",
    color: "purple-500",
    fromColor: "purple-500",
    toColor: "pink-600"
  },
  communication: {
    Icon: MessageSquare, // Good icon for Communication
    gradient: "from-indigo-500 to-blue-600",
    badge: "Communication",
    color: "indigo-500",
    fromColor: "indigo-500",
    toColor: "blue-600"
  },
  development: {
    Icon: Code, // Better icon for Development (was FileCode2)
    gradient: "from-gray-600 to-gray-800",
    badge: "Development",
    color: "gray-600",
    fromColor: "gray-600",
    toColor: "gray-800"
  },
  design: {
    Icon: Palette, // Good icon for Design
    gradient: "from-cyan-500 to-blue-600",
    badge: "Design",
    color: "cyan-500",
    fromColor: "cyan-500",
    toColor: "blue-600"
  },
  marketing: {
    Icon: Target, // Better icon for Marketing (was Megaphone)
    gradient: "from-yellow-500 to-orange-600",
    badge: "Marketing",
    color: "yellow-500",
    fromColor: "yellow-500",
    toColor: "orange-600"
  },
  finance: {
    Icon: Wallet,
    gradient: "from-emerald-500 to-teal-600",
    badge: "Finance",
    color: "emerald-500",
    fromColor: "emerald-500",
    toColor: "teal-600"
  },

  healthcare: {
    Icon: Heart, // Good icon for Healthcare
    gradient: "from-pink-500 to-rose-600",
    badge: "Healthcare",
    color: "pink-500",
    fromColor: "pink-500",
    toColor: "rose-600"
  },
};

// Safe getter for gradient style with fallback
function getGradientStyle(iconKey: IconKey | string) {
  // Type guard to ensure we have a valid IconKey
  const validIconKey = Object.keys(GRADIENT_STYLE).includes(iconKey as IconKey)
    ? iconKey as IconKey
    : "business";

  return GRADIENT_STYLE[validIconKey] || GRADIENT_STYLE.business;
}

function normalizeUrlMaybe(url?: string | null): string | undefined {
  const u = String(url ?? "").trim();
  if (!u) return undefined;
  return u;
}

function normalizeImageUrl(pathOrUrl?: string | null): string {
  const raw = String(pathOrUrl ?? "").trim();
  if (!raw) return "/brand/abstract-grid.svg";

  if (/^https?:\/\//i.test(raw)) return raw;

  const origin = (API_URL || ORIGIN_FALLBACK).replace(/\/+$/, "");
  if (raw.startsWith("/")) return `${origin}${raw}`;
  return `${origin}/${raw}`;
}

function toUiProduct(p: ApiProduct): UiProduct {
  const category = normalizeCategory(p.category);
  const status = String(p.status ?? "Live").trim() || "Live";

  const iconText =
    String(p.iconText ?? "").trim() || (p.name?.trim()?.[0]?.toUpperCase() ?? "P");

  const galleryUrls = (p.gallery_images ?? [])
    .map((g) => normalizeImageUrl(g?.image))
    .filter((u) => u && u !== "/brand/abstract-grid.svg");

  const coverUrl =
    normalizeImageUrl(p.cover) ||
    (p.gallery_images?.[0]?.image ? normalizeImageUrl(p.gallery_images[0].image) : "/brand/abstract-grid.svg");

  const iconKey = pickIconKey(category);

  return {
    id: String(p.id),
    name: p.name,
    category,
    status,

    iconText,
    iconKey,

    coverUrl,
    galleryUrls,
    description: String(p.description ?? p.tagline ?? "").trim(),



    fullDescription: String(p.fullDescription ?? "").trim(),

    technologies: asStringArray(p.technologies),
    features: asStringArray(p.features),
    challenges: asStringArray(p.challenges),
    outcomes: asStringArray(p.outcomes),
    stats: toStatItems(p.stats),

    liveUrl: normalizeUrlMaybe(p.liveUrl),
    demoUrl: normalizeUrlMaybe(p.demoUrl),
    documentationUrl: normalizeUrlMaybe(p.documentationUrl),
    pricing: String(p.pricing ?? "").trim(),

    featured: Boolean(p.featured),
    sortOrder: Number.isFinite(p.sortOrder as number) ? Number(p.sortOrder) : 0,
  };
}

/* ----------------------------- Page ----------------------------- */
export default function ProductsPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const productsRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const [items, setItems] = useState<UiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const [selected, setSelected] = useState<UiProduct | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const [selectedDemoProducts, setSelectedDemoProducts] = useState<string[]>([]);
  const [demoName, setDemoName] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const [demoNotes, setDemoNotes] = useState("");

  const categoriesFromApi = useMemo(() => {
    const uniq = Array.from(new Set(items.map((p) => (p.category || "Business").trim()).filter(Boolean)));
    return uniq;
  }, [items]);

  const categoryChips = useMemo(() => {
    const preferred = [
      "All Products",
      "Education",
      "Business",
      "Productivity",
      "Analytics",
      "Communication",
      "Development",
      "Design",
      "Marketing",
      "Finance",
      "Healthcare",
    ];

    return preferred;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const matchesQuery = (p: UiProduct) => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.fullDescription.toLowerCase().includes(q) ||
        p.technologies.join(" ").toLowerCase().includes(q)
      );
    };

    const matchesCategory = (p: UiProduct) => {
      if (activeCategory === "all") return true;

      const chip = activeCategory.toLowerCase();
      const iconLabel = getGradientStyle(p.iconKey).badge.toLowerCase();
      const cat = p.category.toLowerCase();

      if (chip === "all products") return true;
      return cat.includes(chip) || iconLabel.includes(chip);
    };

    return items.filter((p) => matchesQuery(p) && matchesCategory(p));
  }, [items, query, activeCategory]);

  const featured = useMemo(() => {
    if (!items.length) return null;
    return items.find((p) => p.featured) ?? items[0];
  }, [items]);

  const secondFeatured = useMemo(() => {
    if (!items.length) return null;
    const f = featured;
    return items.find((p) => p.id !== f?.id) ?? null;
  }, [items, featured]);

  async function fetchProducts(signal?: AbortSignal) {
    const candidates = [
      // "/api/products/",
      `${(API_URL || ORIGIN_FALLBACK).replace(/\/+$/, "")}/api/products/`,
      `${ORIGIN_FALLBACK}/api/products/`,
    ];

    let lastErr: unknown = null;

    for (const url of candidates) {
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal,
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status} ${res.statusText} ${txt}`.trim());
        }

        const data = (await res.json()) as ApiProduct[];
        const ui = (Array.isArray(data) ? data : [])
          .map(toUiProduct)
          .sort((a, b) => {
            if (a.featured !== b.featured) return a.featured ? -1 : 1;
            if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
            return a.name.localeCompare(b.name);
          });

        setItems(ui);
        setLastUpdated(new Date());

        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ at: Date.now(), items: ui })
          );
        } catch {
          // ignore
        }

        return;
      } catch (e) {
        lastErr = e;
        continue;
      }
    }

    throw lastErr instanceof Error ? lastErr : new Error("Failed to fetch products.");
  }

  const toggleDemoProduct = (productId: string) => {
    setSelectedDemoProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDemoSubmit = () => {
    if (selectedDemoProducts.length === 0) {
      alert("Please select at least one product for the demo");
      return;
    }

    if (!demoName.trim() || !demoEmail.trim()) {
      alert("Please provide your name and email");
      return;
    }

    const selectedProductNames = items
      .filter(p => selectedDemoProducts.includes(p.id))
      .map(p => p.name);

    alert(`Demo requested for: ${selectedProductNames.join(", ")}\n\nName: ${demoName}\nEmail: ${demoEmail}${demoNotes ? `\nNotes: ${demoNotes}` : ''}\n\nWe'll contact you shortly to schedule the demo!`);

    setSelectedDemoProducts([]);
    setDemoName("");
    setDemoEmail("");
    setDemoNotes("");
  };

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    try {
      const cachedRaw = sessionStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        const parsed = JSON.parse(cachedRaw) as { at: number; items: UiProduct[] };
        if (parsed?.items?.length) {
          setItems(parsed.items);
          setLastUpdated(new Date(parsed.at));
          setIsLoading(false);
        }
      }
    } catch {
      // ignore
    }

    (async () => {
      try {
        setLoadError(null);
        if (mounted && items.length === 0) setIsLoading(true);
        await fetchProducts(controller.signal);
      } catch (e) {
        if (!mounted) return;
        setLoadError(e instanceof Error ? e.message : "Failed to fetch");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    const t = window.setInterval(() => {
      fetchProducts().catch(() => {
        // keep silent during polling; UI already has last good state
      });
    }, POLL_MS);

    return () => {
      mounted = false;
      controller.abort();
      window.clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  };

  const handleScrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const refreshNow = async () => {
    try {
      setLoadError(null);
      await fetchProducts();
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to fetch");
    }
  };

  const handleOpenModal = (product: UiProduct) => {
    setSelected(product);
    setCurrentImageIndex(0);
    const merged = [product.coverUrl, ...(product.galleryUrls || [])].filter(Boolean);
    const unique = Array.from(new Set(merged));
    setGalleryImages(unique.length ? unique : [product.coverUrl]);

    (async () => {
      const base = (API_URL || ORIGIN_FALLBACK).replace(/\/+$/, "");
      const url = `${base}/api/products/${product.id}/gallery/`;
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as Array<{ image?: string | null }>;
        const urls = (Array.isArray(data) ? data : [])
          .map((g) => normalizeImageUrl(g?.image))
          .filter((u) => u && u !== "/brand/abstract-grid.svg");
        if (urls.length === 0) return;
        setGalleryImages((prev) => Array.from(new Set([...(prev || []), ...urls])));
      } catch {
        return;
      }
    })();
  };

  const handleNextImage = () => {
    if (galleryImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }
  };

  const handlePrevImage = () => {
    if (galleryImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* Hero */}
      <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-blue-50/50 to-purple-50/30 dark:from-primary/10 dark:via-background dark:to-background py-14 sm:py-20">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
            transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-xl"
          />
        </div>

        <div className="container px-4 md:px-6 relative z-10 pt-16 sm:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1
              style={{ y }}
              className="font-bold tracking-tight leading-[1.05] mb-6 break-words text-[clamp(2.25rem,5vw,4rem)]"
            >
              Our{" "}
              <span className="block sm:inline bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Products
              </span>
            </motion.h1>

            <p className="text-muted-foreground mb-10 max-w-3xl mx-auto px-2 text-[clamp(1rem,2.2vw,1.5rem)]">
              Discover our portfolio of innovative solutions across various industries and technologies.
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 justify-center items-center">
              <Button
                size="lg"
                className="rounded-full h-12 px-8 text-base group bg-gradient-to-r from-primary to-blue-600 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
                onClick={handleScrollToProducts}
              >
                Explore Products
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-2" />
              </Button>

              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full h-12 px-8 text-base hover:scale-105 active:scale-95 transition-all duration-300 border-2"
                >
                  Request Demo
                </Button>
              </Link>
            </div>

            {loadError ? (
              <div className="mt-6 inline-flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
                <AlertTriangle className="size-4 mt-0.5 text-destructive" />
                <div className="text-left">
                  <div className="font-medium">Couldn't load products</div>
                  <div className="text-muted-foreground break-words">{loadError}</div>
                  <div className="mt-2">
                    <Button size="sm" onClick={refreshNow}>
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 mt-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="w-6 h-10 rounded-full border-2 border-primary/50 bg-primary/5 flex justify-center overflow-hidden">
            <motion.div
              className="w-1 h-3 rounded-full bg-primary/70 mt-2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
            />
          </div>
        </div>
      </section>

      {/* Products Filter + Cards */}
      <section ref={productsRef} className="w-full py-14 md:py-20 bg-gradient-to-b from-background to-background/80">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Our Products
                </span>
              </h2>
              <p className="mt-2 text-muted-foreground">
                One consistent card design, one action: <span className="font-medium text-foreground">View Product Details</span>.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-xl border border-border/60 bg-background/50 backdrop-blur-sm pl-10 pr-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                />
              </div>

              {/* Category chips - Updated to new categories */}
              <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto">
                <Button
                  type="button"
                  size="sm"
                  variant={activeCategory === "all" ? "default" : "outline"}
                  className={`rounded-full ${activeCategory === "all" ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg" : ""}`}
                  onClick={() => setActiveCategory("all")}
                >
                  All Products
                </Button>
                {categoryChips
                  .filter((c) => c !== "All Products")
                  .slice(0, 10)
                  .map((c) => (
                    <Button
                      key={c}
                      type="button"
                      size="sm"
                      variant={activeCategory === c ? "default" : "outline"}
                      className={`rounded-full ${activeCategory === c ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg" : ""}`}
                      onClick={() => setActiveCategory(c)}
                    >
                      {c}
                    </Button>
                  ))}
              </div>
            </div>

            {/* Loading skeleton */}
            {isLoading && items.length === 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[420px] rounded-lg border border-border bg-gradient-to-r from-background to-muted animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {filtered.map((p) => {
                  const style = getGradientStyle(p.iconKey);
                  const Icon = style.Icon;

                  const tech = p.technologies;
                  const showTech = tech.slice(0, 3);
                  const extra = Math.max(0, tech.length - showTech.length);

                  return (
                    <motion.div
                      key={p.id}
                      variants={itemVariants}
                      className="group/product rounded-xl border bg-card/50 backdrop-blur-sm text-card-foreground shadow-lg h-full overflow-hidden border-border/40 bg-gradient-to-b from-background/80 to-muted/10 transition-all duration-300 hover:shadow-xl"
                    >
                      {/* Gradient border effect */}
                      <div className="absolute -inset-0.5 bg-gradient-white to-r from-primary to-white rounded-xl opacity-0 group-hover/product:opacity-30 transition duration-500 -z-10 blur-sm" />

                      <div className="relative h-56 overflow-hidden rounded-t-xl">
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover/product:opacity-90 transition-opacity duration-500`}
                        />
                        <img
                          alt={p.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover/product:scale-110"
                          src={p.coverUrl}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/brand/abstract-grid.svg";
                          }}
                        />

                        <div className="absolute top-4 left-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${style.gradient} text-white shadow-md`}
                          >
                            {style.badge} {/* Use the badge from gradient style */}
                          </span>
                        </div>

                        <div className="absolute top-4 right-4">
                          <div className="size-10 rounded-full bg-white/90 dark:bg-background/80 flex items-center justify-center text-primary shadow-lg group-hover/product:scale-110 transition-transform duration-300">
                            <Icon className="size-5" />
                          </div>
                        </div>

                        <motion.div
                          initial={{ opacity: 0, y: 14 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover/product:opacity-100 transition-opacity duration-300"
                        >
                          <div className="flex justify-between text-white">
                            <div className="flex items-center gap-2">
                              <Trophy className="size-4" />
                              <span className="text-sm">{p.status || "Live"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe className="size-4" />
                              <span className="text-sm">{style.badge}</span>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">
                          {p.name}
                        </h3>

                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {p.description || p.fullDescription || "—"}
                        </p>

                        {showTech.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {showTech.map((t) => (
                              <span
                                key={t}
                                className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md hover:bg-primary/20 hover:scale-105 transition-all duration-300"
                              >
                                {t}
                              </span>
                            ))}
                            {extra > 0 ? (
                              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md hover:bg-muted/80 transition-all duration-300">
                                +{extra} more
                              </span>
                            ) : null}
                          </div>
                        )}

                        {p.pricing && (
                          <div className="flex items-center gap-2 mb-4 p-3 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg border border-primary/20">
                            {/* Removed the empty div that was showing dollar symbol */}
                            <span className="text-sm font-semibold text-foreground">
                              {p.pricing}
                            </span>
                          </div>
                        )}

                        <Button
                          type="button"
                          onClick={() => handleOpenModal(p)}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-95 rounded-md h-10 px-4 py-2 group hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg hover:from-blue-600 hover:to-purple-700"
                        >
                          View Product Details
                          <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-2 group-hover:scale-110" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {!isLoading && filtered.length === 0 ? (
              <div className="rounded-xl border border-border bg-card/50 p-6 text-muted-foreground text-center">
                <Search className="size-8 mx-auto mb-2 opacity-50" />
                <p>No products match your filters. Try a different search or category.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Product Integration Diagram */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-background/80 to-background">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Seamless Product Integration
              </span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-blue-600 mx-auto mb-6" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our solutions connect across teams, data, and workflows to deliver end-to-end automation.
            </p>
          </div>

          <div className="relative mx-auto max-w-4xl">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] bg-[size:16px_16px]" />

            {/* Central hub */}
            <div className="relative mx-auto mb-12 flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-600 p-1 shadow-2xl">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-background text-center">
                <div>
                  <div className="mb-2 flex justify-center">
                    <div className="h-10 w-10 rounded-[10px] overflow-hidden bg-[#0a4eb4] shadow-lg">
                      <Image
                        src="/brand/nilaya-icon.svg"
                        alt="Nilaya"
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                        priority
                      />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold">{featured?.name ?? "Nilaya AI Core"}</h3>
                  <p className="text-xs text-muted-foreground">Central Platform</p>
                </div>
              </div>
            </div>

            {/* Surrounding products with updated icons */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4 overflow-x-auto md:overflow-visible">
              <div className="flex md:contents gap-3 md:gap-4 min-w-max md:min-w-0">
                {items.slice(0, 8).map((p, idx) => {
                  const style = getGradientStyle(p.iconKey);
                  const Icon = style.Icon;
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: idx * 0.06 }}
                      whileHover={{ y: -5 }}
                      className="group flex flex-col items-center text-center"
                    >
                      <div
                        className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${style.gradient} text-white shadow-md transition-transform group-hover:scale-110 group-hover:shadow-xl`}
                      >
                        <Icon className="size-6" />
                      </div>
                      <h3 className="text-sm font-medium max-w-[10rem] line-clamp-2">
                        {p.name}
                      </h3>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="mt-12 rounded-xl border border-border/40 bg-muted/20 p-6 text-center shadow-sm backdrop-blur-sm">
              <h3 className="mb-3 text-xl font-bold">
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Unified Ecosystem
                </span>
              </h3>
              <p className="text-muted-foreground">
                Nilaya AI modules integrate seamlessly, sharing context and data to eliminate silos and accelerate decision-making across the organization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Request */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="container px-4 md:px-6 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Experience Nilaya AI Live
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Schedule a tailored walkthrough with our AI specialists.
            </p>

            <div className="mx-auto max-w-lg rounded-xl bg-white/10 p-6 backdrop-blur-sm border border-white/20">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 text-left">
                  <h3 className="text-lg font-medium">Select Products</h3>
                  <p className="text-sm text-primary-foreground/70 mb-2">
                    Click to select/unselect products for demo
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 
                                  [&::-webkit-scrollbar]:hidden
                                  [-ms-overflow-style:none]
                                  [scrollbar-width:none]">
                    {items.slice(0, 6).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => toggleDemoProduct(p.id)}
                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-white/10 ${selectedDemoProducts.includes(p.id)
                            ? 'bg-white/20 border border-white/30'
                            : 'border border-transparent'
                          }`}
                      >
                        <div className={`flex h-5 w-5 items-center justify-center rounded border ${selectedDemoProducts.includes(p.id)
                            ? 'bg-white border-white'
                            : 'border-white/30 hover:border-white/50'
                          }`}>
                          {selectedDemoProducts.includes(p.id) && (
                            <Check className="h-3 w-3 text-primary" />
                          )}
                        </div>
                        <span className="text-sm truncate">{p.name}</span>
                      </div>
                    ))}
                  </div>
                  {selectedDemoProducts.length > 0 && (
                    <p className="text-xs text-primary-foreground/70 mt-2">
                      Selected: {selectedDemoProducts.length} product{selectedDemoProducts.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <div className="space-y-4 text-left">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Your Name</label>
                    <input
                      type="text"
                      value={demoName}
                      onChange={(e) => setDemoName(e.target.value)}
                      className="w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Email</label>
                    <input
                      type="email"
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      className="w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Additional Notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={demoNotes}
                      onChange={(e) => setDemoNotes(e.target.value)}
                      className="w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 resize-none"
                      placeholder="Specific features or requirements you'd like to see..."
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full hover:scale-105 active:scale-95 transition-all duration-300"
                  onClick={handleDemoSubmit}
                >
                  Schedule Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t bg-background/95 backdrop-blur-sm relative z-20">
        <div className="container px-4 py-10 md:px-6 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 font-bold mb-4">
                <div className="relative size-8">
                  <Image
                    src="/brand/nilaya-icon.svg"
                    alt="Nilaya AI Logo"
                    width={32}
                    height={32}
                    className="rounded-lg object-cover"
                    loading="lazy"
                  />
                </div>
                <span>Nilaya AI</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Nilaya AI builds intelligent automation systems that help startups and enterprises scale faster with AI-powered tools.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Work email"
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                />
                <Button size="sm">Get updates</Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About Nilaya AI</Link></li>
                <li><Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">Case Studies</Link></li>
                <li><Link href="/team" className="text-muted-foreground hover:text-foreground transition-colors">Team</Link></li>
                <li><Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-and-conditions" className="text-muted-foreground hover:text-foreground transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/refund-policy" className="text-muted-foreground hover:text-foreground transition-colors">Refund Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">FlowGrid Orchestration</Link></li>
                <li><Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">SignalIQ Analytics</Link></li>
                <li><Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">Atlas Knowledge Hub</Link></li>
                <li><Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">OpsPulse Console</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/it-services" className="text-muted-foreground hover:text-foreground transition-colors">AI Workflow Automation</Link></li>
                <li><Link href="/it-services" className="text-muted-foreground hover:text-foreground transition-colors">Custom AI Applications</Link></li>
                <li><Link href="/it-services" className="text-muted-foreground hover:text-foreground transition-colors">LLM Integration</Link></li>
                <li><Link href="/it-services" className="text-muted-foreground hover:text-foreground transition-colors">API Development</Link></li>
                <li><Link href="/it-services" className="text-muted-foreground hover:text-foreground transition-colors">Data Processing Systems</Link></li>
                <li><Link href="/it-services" className="text-muted-foreground hover:text-foreground transition-colors">Document Intelligence</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 pt-8 mt-8">
            <h4 className="text-sm font-bold mb-4">Contact</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <MapPin className="size-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Remote-first HQ</p>
                  <p className="text-muted-foreground">Serving North America, Europe, and APAC</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-5 text-primary flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">+1 (415) 555-0148</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="size-5 text-primary flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">hello@nilaya.ai</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row justify-between items-center border-t border-border/40 pt-8 mt-8">
            <p className="text-xs text-muted-foreground">? 2026 Nilaya AI. All Rights Reserved.</p>
            <div className="flex gap-4">
              <Link href="/refund-policy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Details Modal */}
      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-6xl h-[90dvh] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden flex flex-col before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/10 before:to-purple-600/10 before:-z-10">
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 hover:bg-muted hover:scale-110 transition-all duration-300"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <div className="grid lg:grid-cols-3 gap-0 min-h-full">
                {/* Left Column - Image, Challenges, Outcomes */}
                <div className="lg:col-span-1">
                  {/* Product Image with Navigation */}
                  <div
                    className="relative aspect-[4/3] w-full bg-muted/30"
                    onTouchStart={(e) => {
                      const t = e.touches?.[0];
                      if (!t) return;
                      touchStartX.current = t.clientX;
                      touchStartY.current = t.clientY;
                    }}
                    onTouchEnd={(e) => {
                      const startX = touchStartX.current;
                      const startY = touchStartY.current;
                      touchStartX.current = null;
                      touchStartY.current = null;
                      if (startX === null || startY === null) return;

                      const t = e.changedTouches?.[0];
                      if (!t) return;
                      const dx = t.clientX - startX;
                      const dy = t.clientY - startY;
                      if (Math.abs(dx) < 50) return;
                      if (Math.abs(dx) < Math.abs(dy)) return;
                      if (galleryImages.length <= 1) return;
                      if (dx < 0) handleNextImage();
                      else handlePrevImage();
                    }}
                  >
                    <img
                      src={galleryImages[currentImageIndex]}
                      alt={selected.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/brand/abstract-grid.svg";
                      }}
                    />

                    {galleryImages.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white/85 opacity-60 hover:opacity-100 focus-visible:opacity-100 active:opacity-100 hover:bg-black/55 hover:text-white hover:scale-110 transition-all duration-300"
                        >
                          <ChevronLeft className="size-5" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white/85 opacity-60 hover:opacity-100 focus-visible:opacity-100 active:opacity-100 hover:bg-black/55 hover:text-white hover:scale-110 transition-all duration-300"
                        >
                          <ChevronRight className="size-5" />
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {galleryImages.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentImageIndex
                                  ? 'bg-white scale-125'
                                  : 'bg-white/50 hover:bg-white/70 hover:scale-110'
                                }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-6 border-t border-border hover:border-primary/30 hover:bg-card/5 transition-all duration-300 group/challenges">
                    <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                      <AlertTriangle className="size-4 text-primary group-hover/challenges:animate-pulse" />
                      Challenges
                    </div>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      {(selected.challenges.length ? selected.challenges : ["—"]).slice(0, 4).map((c, i) => (
                        <li
                          key={`${c}-${i}`}
                          className="flex gap-2 items-start p-2 rounded-md hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-600/5 hover:translate-x-1 transition-all duration-300"
                        >
                          <span className="mt-1.5 size-1.5 rounded-full bg-primary flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
                          <span className="hover:text-foreground transition-colors duration-300">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 border-t border-border hover:border-primary/30 hover:bg-card/5 transition-all duration-300 group/outcomes">
                    <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                      <Trophy className="size-4 text-primary group-hover/outcomes:animate-bounce" />
                      Outcomes
                    </div>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      {(selected.outcomes.length ? selected.outcomes : ["—"]).slice(0, 4).map((o, i) => (
                        <li
                          key={`${o}-${i}`}
                          className="flex gap-2 items-start p-2 rounded-md hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-600/5 hover:translate-x-1 transition-all duration-300"
                        >
                          <Check className="size-4 mt-0.5 text-primary flex-shrink-0 hover:scale-110 transition-transform duration-300" />
                          <span className="hover:text-foreground transition-colors duration-300">{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column - Product Details */}
                <div className="lg:col-span-2 p-6 lg:p-8 min-h-0">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-bold">
                        <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                          {selected.name}
                        </span>
                      </h3>
                      <p className="text-muted-foreground">{getGradientStyle(selected.iconKey).badge}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary/10 to-blue-600/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20 hover:from-primary/20 hover:to-blue-600/20 hover:scale-105 transition-all duration-300">
                        {selected.status || "Live"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Product Overview */}
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <FileText className="size-4 text-primary" />
                        Product Overview
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selected.fullDescription || selected.description || "—"}
                      </p>
                    </div>

                    {/* Technologies and Features in 2-column grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Technologies Section */}
                      <div className="rounded-xl border border-border bg-card/60 p-4 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 group/tech">
                        <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                          <FileCode2 className="size-4 text-primary group-hover/tech:scale-110 transition-transform duration-300" />
                          Technologies Used
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(selected.technologies.length ? selected.technologies : ["—"]).slice(0, 12).map((t, i) => (
                            <span
                              key={`${t}-${i}`}
                              className="px-2 py-1 rounded-md text-xs bg-gradient-to-r from-blue-500/10 to-purple-600/10 text-primary hover:from-blue-500/20 hover:to-purple-600/20 hover:scale-105 hover:shadow-sm transition-all duration-300 cursor-pointer border border-primary/10"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Features Section */}
                      <div className="rounded-xl border border-border bg-card/60 p-4 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 group/features">
                        <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                          <Layers className="size-4 text-primary group-hover/features:scale-110 transition-transform duration-300" />
                          Features
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {(selected.features.length ? selected.features : ["—"]).slice(0, 6).map((f, i) => (
                            <li
                              key={`${f}-${i}`}
                              className="flex gap-2 p-2 rounded-md hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-600/5 hover:translate-x-1 hover:shadow-sm transition-all duration-300 group/item"
                            >
                              <Check className="size-4 mt-0.5 text-primary group-hover/item:rotate-12 transition-transform duration-300" />
                              <span className="group-hover/item:text-foreground transition-colors duration-300">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="rounded-xl border border-border bg-card/60 p-4 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 group/stats">
                      <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                        <BarChart3 className="size-4 text-primary group-hover/stats:scale-110 transition-transform duration-300" />
                        Statistics
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {(selected.stats.length ? selected.stats : [{ label: "—", value: "—" }])
                          .slice(0, 6)
                          .map((s, idx) => (
                            <div
                              key={`${s.label}-${idx}`}
                              className="rounded-lg border border-border bg-background p-3 hover:border-primary/50 hover:scale-105 hover:shadow-md transition-all duration-300 group/stat"
                            >
                              <div className="text-xs text-muted-foreground group-hover/stat:text-primary transition-colors duration-300">
                                {s.label}
                              </div>
                              <div className="text-sm font-semibold text-[#204DA2] group-hover/stat:scale-110 group-hover/stat:text-[#0a4eb4] transition-all duration-300">
                                {s.value}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-2">
                      {selected.liveUrl ? (
                        <a
                          href={selected.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white hover:scale-105 transition-all duration-300 group/link"
                        >
                          <ExternalLink className="size-4 group-hover/link:rotate-12 transition-transform duration-300" />
                          Live
                        </a>
                      ) : null}

                      {selected.demoUrl ? (
                        <a
                          href={selected.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white hover:scale-105 transition-all duration-300 group/link"
                        >
                          <ExternalLink className="size-4 group-hover/link:rotate-12 transition-transform duration-300" />
                          Demo
                        </a>
                      ) : null}

                      {selected.documentationUrl ? (
                        <a
                          href={selected.documentationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white hover:scale-105 transition-all duration-300 group/link"
                        >
                          <FileCode2 className="size-4 group-hover/link:rotate-12 transition-transform duration-300" />
                          Docs
                        </a>
                      ) : null}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Tip: If Admin updates aren't showing instantly, hit <span className="font-medium">Refresh Now</span> or wait ~20s.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
