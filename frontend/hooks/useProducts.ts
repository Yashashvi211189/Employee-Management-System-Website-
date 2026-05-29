"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_URL } from "@/lib/config";

type ApiGalleryImage = { id: number; image: string; created_at?: string };
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

  featured?: boolean | null;
  sortOrder?: number | null;
  created_at?: string | null;
};

export type UiStat = { label: string; value: string };
export type UiProduct = {
  id: number;
  name: string;
  tagline: string;
  description: string;
  fullDescription: string;

  categoryRaw: string;
  categoryLabel: string;
  statusLabel: string;

  iconText: string;
  iconKey: string; // IMPORTANT: serializable (no JSX stored)
  gradient: string;

  cover: string;
  galleryImages: string[];

  technologies: string[];
  features: string[];
  challenges: string[];
  outcomes: string[];
  stats: UiStat[];

  liveUrl?: string;
  demoUrl?: string;
  documentationUrl?: string;

  featured: boolean;
  sortOrder: number;
  created_at?: string;
};

const LS_KEY = "nilaya.products.cache.v2";

function normalizeBaseUrl(base: string) {
  let b = (base || "").trim();
  if (!b) b = "https://nilaya.ai";
  if (!/^https?:\/\//i.test(b)) b = `https://${b}`;
  return b.replace(/\/+$/, "");
}

function absolutizeUrl(url: string, base: string) {
  const u = (url || "").trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("//")) return `https:${u}`;
  const b = normalizeBaseUrl(base);
  if (u.startsWith("/")) return `${b}${u}`;
  return `${b}/${u}`;
}

function toText(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object") {
    // best-effort stringify for weird shapes
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

function toStringList(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v
      .map((x) => {
        if (x && typeof x === "object") {
          const anyObj = x as any;
          return (
            anyObj?.label ??
            anyObj?.name ??
            anyObj?.title ??
            anyObj?.value ??
            toText(x)
          );
        }
        return toText(x);
      })
      .map((s) => String(s).trim())
      .filter(Boolean);
  }

  if (typeof v === "string") {
    return v
      .split(/[\n,]+/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (v && typeof v === "object") {
    // { a: "x", b: "y" } -> ["a: x", "b: y"]
    return Object.entries(v as Record<string, unknown>)
      .map(([k, val]) => `${k}: ${toText(val)}`.trim())
      .filter(Boolean);
  }

  return [];
}

function toStats(v: unknown): UiStat[] {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v
      .map((x) => {
        if (x && typeof x === "object") {
          const o = x as any;
          const label = String(o.label ?? o.name ?? o.title ?? "").trim();
          const value = String(o.value ?? o.count ?? o.amount ?? "").trim();
          if (label && value) return { label, value };
          return null;
        }
        return null;
      })
      .filter(Boolean) as UiStat[];
  }

  if (typeof v === "object") {
    return Object.entries(v as Record<string, unknown>).map(([k, val]) => ({
      label: k,
      value: toText(val),
    }));
  }

  return [];
}

function categoryLabel(raw: string) {
  const c = raw.toLowerCase();
  if (c.includes("mobile")) return "Mobile Apps";
  if (c.includes("fin")) return "FinTech";
  if (c.includes("saas")) return "SaaS";
  if (c.includes("edu")) return "EdTech";
  if (c.includes("ai") || c.includes("ml")) return "AI/ML";
  if (c.includes("block")) return "Blockchain";
  if (c.includes("devops")) return "DevOps";
  if (c.includes("ecom") || c.includes("commerce")) return "E-Commerce";
  if (c.includes("gov")) return "GovTech";
  // fallback
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "All Products";
}

function iconKeyFromCategory(raw: string) {
  const c = raw.toLowerCase();
  if (c.includes("edu")) return "education";
  if (c.includes("fin")) return "fintech";
  if (c.includes("ai") || c.includes("ml")) return "aiml";
  if (c.includes("block")) return "blockchain";
  if (c.includes("devops")) return "devops";
  if (c.includes("ecom") || c.includes("commerce")) return "ecommerce";
  if (c.includes("mobile")) return "mobile";
  return "general";
}

function gradientFromIconKey(key: string) {
  switch (key) {
    case "education":
      return "from-sky-500 to-indigo-600";
    case "fintech":
      return "from-emerald-500 to-green-600";
    case "aiml":
      return "from-indigo-500 to-purple-600";
    case "blockchain":
      return "from-amber-500 to-orange-600";
    case "devops":
      return "from-slate-500 to-slate-700";
    case "ecommerce":
      return "from-pink-500 to-rose-600";
    case "mobile":
      return "from-cyan-500 to-blue-600";
    default:
      return "from-sky-500 to-indigo-600";
  }
}

function normalizeHref(url?: string | null) {
  const u = (url || "").trim();
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  // if admin entered without scheme, still make it usable for users
  return `https://${u}`;
}

function mapProduct(p: ApiProduct, apiBase: string): UiProduct {
  const catRaw = String(p.category ?? "").trim();
  const iconKey = iconKeyFromCategory(catRaw);
  const cover =
    absolutizeUrl(String(p.cover ?? ""), apiBase) ||
    absolutizeUrl(String(p.gallery_images?.[0]?.image ?? ""), apiBase) ||
    "/brand/abstract-grid.svg";

  const galleryImages = (p.gallery_images ?? [])
    .map((g) => absolutizeUrl(String(g.image || ""), apiBase))
    .filter(Boolean);

  const iconText =
    String(p.iconText ?? "").trim() ||
    (p.name?.trim()?.[0]?.toUpperCase() ?? "P");

  return {
    id: p.id,
    name: String(p.name ?? "").trim(),
    tagline: String(p.tagline ?? "").trim(),
    description: String(p.description ?? "").trim(),
    fullDescription: String(p.fullDescription ?? "").trim(),

    categoryRaw: catRaw,
    categoryLabel: categoryLabel(catRaw || "general"),
    statusLabel: String(p.status ?? "In Development").trim() || "In Development",

    iconText,
    iconKey,
    gradient: gradientFromIconKey(iconKey),

    cover,
    galleryImages,

    technologies: toStringList(p.technologies),
    features: toStringList(p.features),
    challenges: toStringList(p.challenges),
    outcomes: toStringList(p.outcomes),
    stats: toStats(p.stats),

    liveUrl: normalizeHref(p.liveUrl),
    demoUrl: normalizeHref(p.demoUrl),
    documentationUrl: normalizeHref(p.documentationUrl),

    featured: Boolean(p.featured),
    sortOrder: Number.isFinite(p.sortOrder as number) ? Number(p.sortOrder) : 0,
    created_at: p.created_at ?? undefined,
  };
}

async function fetchProducts(): Promise<UiProduct[]> {
  const apiBase = normalizeBaseUrl(API_URL);

  const candidates = [
    "/api/products/", // if you have a Next proxy route, this avoids CORS
    `${apiBase}/api/products/`, // direct backend
  ];

  let lastErr: unknown = null;

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`.trim());
      }

      const json = await res.json();

      const list: ApiProduct[] = Array.isArray(json)
        ? json
        : Array.isArray((json as any)?.results)
        ? (json as any).results
        : [];

      return (list || [])
        .map((p) => mapProduct(p, apiBase))
        .sort((a, b) => {
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
          return a.name.localeCompare(b.name);
        });
    } catch (e) {
      lastErr = e;
      // try next candidate
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error("Failed to fetch products.");
}

export function useProducts(opts?: { pollMs?: number; enablePolling?: boolean }) {
  const pollMs = opts?.pollMs ?? 20000;
  const enablePolling = opts?.enablePolling ?? true;

  const [products, setProducts] = useState<UiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const inFlight = useRef(false);

  // load cache instantly (prevents blank UI)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { ts: number; data: UiProduct[] };
      if (parsed?.data?.length) {
        setProducts(parsed.data);
        setLastUpdated(parsed.ts ?? null);
        setIsLoading(false);
      }
    } catch {
      // ignore
    }
  }, []);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsRefreshing(true);
    setError(null);

    try {
      const data = await fetchProducts();
      setProducts(data);
      const ts = Date.now();
      setLastUpdated(ts);
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({ ts, data }));
      } catch {
        // ignore storage limits
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      inFlight.current = false;
    }
  }, []);

  // initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // polling for admin updates
  useEffect(() => {
    if (!enablePolling) return;
    const id = window.setInterval(() => refresh(), pollMs);
    return () => window.clearInterval(id);
  }, [enablePolling, pollMs, refresh]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) set.add(p.categoryLabel);
    const ordered = [
      "All Products",
      "Mobile Apps",
      "FinTech",
      "SaaS",
      "EdTech",
      "AI/ML",
      "Blockchain",
      "DevOps",
      "E-Commerce",
      "GovTech",
    ];
    const fromApi = Array.from(set).filter(Boolean);
    const merged = Array.from(new Set([...ordered, ...fromApi]));
    return merged;
  }, [products]);

  return { products, categories, isLoading, isRefreshing, error, lastUpdated, refresh };
}
