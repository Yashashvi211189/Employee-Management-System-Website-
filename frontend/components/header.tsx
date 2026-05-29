"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Menu, X, Moon, Sun, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import useAuth from "@/hooks/useAuth";
import { NavLink } from "@/components/NavLink";
import { API_URL } from "@/lib/config";


type ExploreSubsection = {
  slug: string;
  title: string;
};

type ExploreSection = {
  title: string;
  subsections: ExploreSubsection[];
};

type Service = {
  id: string;
  slug?: string;
  title: string;
  description: string;
  image: string;
  status: string;
  sort_order: number;
  category?: string; // 'general' or 'gis'
  explore?: ExploreSection;
};

function HeaderInner() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProjectsMenuOpen, setMobileProjectsMenuOpen] = useState(false);
  const [mobileAboutMenuOpen, setMobileAboutMenuOpen] = useState(false);
  const [mobileItMenuOpen, setMobileItMenuOpen] = useState(false);
  const [mobileGisMenuOpen, setMobileGisMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // ---------- ACTIVE DROPDOWN STATE ----------
  const [activeDropdown, setActiveDropdown] = useState<
    "services" | "projects" | "about" | "gis" | null
  >(null);
  const dropdownTimeout = useRef<NodeJS.Timeout>();

  // ---------- HOVERED SERVICE ID (for sub-menus) ----------
  const [hoveredServiceId, setHoveredServiceId] = useState<string | null>(null);
  const [hoveredServiceSlug, setHoveredServiceSlug] = useState<string | null>(null);
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });

  // ---------- GIS LIDAR FLYOUT STATE ----------
  const [hoveredGisLidar, setHoveredGisLidar] = useState(false);
  const [hoveredGisLidarSlug, setHoveredGisLidarSlug] = useState<string | null>(null);
  const [gisFlyoutPos, setGisFlyoutPos] = useState({ top: 0, left: 0 });

  // ---------- DROPDOWN REFS ----------
  const servicesButtonRef = useRef<HTMLAnchorElement>(null);
  const servicesMenuRef = useRef<HTMLDivElement>(null);
  const servicesFlyoutRef = useRef<HTMLDivElement>(null);
  const projectsButtonRef = useRef<HTMLButtonElement>(null);
  const projectsMenuRef = useRef<HTMLDivElement>(null);
  const aboutButtonRef = useRef<HTMLButtonElement>(null);
  const aboutMenuRef = useRef<HTMLDivElement>(null);
  const gisButtonRef = useRef<HTMLAnchorElement>(null);
  const gisMenuRef = useRef<HTMLDivElement>(null);
  const gisFlyoutRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // ---------- THEME, PATH, AUTH ----------
  const { theme, setTheme } = useTheme();
  const [pathname, setPathname] = useState(() =>
    typeof window !== "undefined" ? window.location.pathname : ""
  );
  const { user, loading, logout } = useAuth();
  const isEmployeeUser = Boolean((user as any)?.employee_id);
  const mounted = true;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updatePathname = () => setPathname(window.location.pathname);
    updatePathname();

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = (...args) => {
      originalPushState.apply(window.history, args as any);
      updatePathname();
    };

    window.history.replaceState = (...args) => {
      originalReplaceState.apply(window.history, args as any);
      updatePathname();
    };

    window.addEventListener("popstate", updatePathname);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", updatePathname);
    };
  }, []);

  // ---------- SERVICES STATE ----------
  const [services, setServices] = useState<Service[]>([]); // general services
  const [servicesLoading, setServicesLoading] = useState(true);
  const [itExploreCache, setItExploreCache] = useState<Record<string, ExploreSection | null>>({});
  const [itExploreLoading, setItExploreLoading] = useState<Record<string, boolean>>({});

  // ---------- GIS SERVICES STATE ----------
  const [gisServices, setGisServices] = useState<Service[]>([]);
  const [gisServicesLoading, setGisServicesLoading] = useState(true);
  const [gisExploreCache, setGisExploreCache] = useState<Record<string, ExploreSection | null>>({});
  const [gisExploreLoading, setGisExploreLoading] = useState<Record<string, boolean>>({});

  // ---------- HELPER: SLUG FROM SERVICE ----------
  const generateServiceSlug = (id: string, title: string) => {
    const titleSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const isNumericId = /^\d+$/.test(id);
    return isNumericId ? `${id}-${titleSlug}` : id;
  };

  const sanitizeRemoteUrl = (value?: string | null) => {
    if (!value) return "";
    const trimmed = value.trim();
    return trimmed.replace(/^`+/, "").replace(/`+$/, "").trim();
  };

  const getImageUrl = (imagePath?: string | null, fallback = "/brand/abstract-grid.svg") => {
    const cleaned = sanitizeRemoteUrl(imagePath);
    if (!cleaned) return fallback;
    return cleaned;
  };

  const parseExplore = (raw: any): ExploreSection | null => {
    if (!raw || typeof raw !== "object") return null;
    const title = typeof raw.title === "string" ? raw.title : "";
    const subsections = Array.isArray(raw.subsections)
      ? raw.subsections
          .map((sub: any) => ({
            slug: String(sub?.slug ?? ""),
            title: String(sub?.title ?? ""),
          }))
          .filter((sub: ExploreSubsection) => sub.slug && sub.title)
      : [];
    if (!title && subsections.length === 0) return null;
    return { title, subsections };
  };

  const ensureItExplore = async (cacheKey: string, candidates: string[]) => {
    if (!cacheKey) return;
    if (itExploreCache[cacheKey] !== undefined) return;
    if (itExploreLoading[cacheKey]) return;

    setItExploreLoading((prev) => ({ ...prev, [cacheKey]: true }));
    try {
      for (const candidate of candidates) {
        if (!candidate) continue;
        const res = await fetch(
          `${API_URL}/api/services/${encodeURIComponent(candidate)}/`,
          { cache: "no-store" }
        );
        if (!res.ok) continue;
        const data = await res.json();
        const explore = parseExplore(data?.explore);
        setItExploreCache((prev) => ({ ...prev, [cacheKey]: explore }));
        return;
      }
      setItExploreCache((prev) => ({ ...prev, [cacheKey]: null }));
    } catch {
      setItExploreCache((prev) => ({ ...prev, [cacheKey]: null }));
    } finally {
      setItExploreLoading((prev) => ({ ...prev, [cacheKey]: false }));
    }
  };

  const ensureGisExplore = async (cacheKey: string, candidates: string[]) => {
    if (!cacheKey) return;
    if (gisExploreCache[cacheKey] !== undefined) return;
    if (gisExploreLoading[cacheKey]) return;

    setGisExploreLoading((prev) => ({ ...prev, [cacheKey]: true }));
    try {
      for (const candidate of candidates) {
        if (!candidate) continue;
        const res = await fetch(
          `${API_URL}/api/gis-services/${encodeURIComponent(candidate)}/`,
          { cache: "no-store" }
        );
        if (!res.ok) continue;
        const data = await res.json();
        const explore = parseExplore(data?.explore);
        setGisExploreCache((prev) => ({ ...prev, [cacheKey]: explore }));
        return;
      }
      setGisExploreCache((prev) => ({ ...prev, [cacheKey]: null }));
    } catch {
      setGisExploreCache((prev) => ({ ...prev, [cacheKey]: null }));
    } finally {
      setGisExploreLoading((prev) => ({ ...prev, [cacheKey]: false }));
    }
  };

  // ---------- FETCH IT SERVICES (ONLY /api/services/) ----------
  useEffect(() => {
    const fetchItServices = async () => {
      try {
        setServicesLoading(true);
        const res = await fetch(`${API_URL}/api/services/`);
        if (!res.ok) {
          setServices([]);
          return;
        }

        const raw = await res.json();
        const arr = Array.isArray(raw) ? raw : raw.results || [];

        const mapped: Service[] = (arr as any[]).map((s: any, idx: number) => {
          const explore = parseExplore(s?.explore) ?? undefined;
          const id = String(s?.id ?? idx);
          const slug = typeof s?.slug === "string" && s.slug ? s.slug : undefined;
          return {
            id,
            slug,
            title: String(s?.title ?? ""),
            description: String(s?.description ?? ""),
            image: String(s?.image ?? ""),
            status: typeof s?.status === "string" ? s.status : "active",
            sort_order: typeof s?.sort_order === "number" ? s.sort_order : idx,
            explore,
          };
        });

        const active = mapped.filter((s) => s.status === "active");
        setServices(active.sort((a, b) => a.sort_order - b.sort_order));
      } catch (error) {
        console.error("Error fetching IT services:", error);
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchItServices();
  }, []);

  // ---------- FETCH GIS SERVICES ----------
  useEffect(() => {
    const fetchGisServices = async () => {
      try {
        setGisServicesLoading(true);
        const res = await fetch(`${API_URL}/api/gis-services/`);
        if (!res.ok) {
          setGisServices([]);
          return;
        }

        const raw = await res.json();
        const arr = Array.isArray(raw) ? raw : raw.results || [];

        const mapped: Service[] = arr.map((s: any, idx: number) => {
          const exploreRaw = s?.explore;
          const explore: ExploreSection | undefined =
            exploreRaw && typeof exploreRaw === "object"
              ? {
                  title: typeof exploreRaw.title === "string" ? exploreRaw.title : "",
                  subsections: Array.isArray(exploreRaw.subsections)
                    ? exploreRaw.subsections
                        .map((sub: any) => ({
                          slug: String(sub?.slug ?? ""),
                          title: String(sub?.title ?? ""),
                        }))
                        .filter((sub: ExploreSubsection) => sub.slug && sub.title)
                    : [],
                }
              : undefined;

          return {
            id: String(s.id ?? idx),
            slug: typeof s.slug === "string" && s.slug ? s.slug : undefined,
            title: String(s.title ?? ""),
            description: String(s.description ?? ""),
            image: String(s.image ?? ""),
            status: "active",
            sort_order: typeof s.sort_order === "number" ? s.sort_order : idx,
            category: "gis",
            explore,
          };
        });

        setGisServices(mapped.sort((a, b) => a.sort_order - b.sort_order));
      } catch (error) {
        console.error("Error fetching GIS services:", error);
        setGisServices([]);
      } finally {
        setGisServicesLoading(false);
      }
    };

    fetchGisServices();
  }, []);

  // ---------- SCROLL DETECTION ----------
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ---------- CLICK OUTSIDE ----------
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        servicesMenuRef.current &&
        !servicesMenuRef.current.contains(target) &&
        servicesButtonRef.current &&
        !servicesButtonRef.current.contains(target) &&
        (!servicesFlyoutRef.current || !servicesFlyoutRef.current.contains(target))
      ) {
        setActiveDropdown((prev) => (prev === "services" ? null : prev));
      }
      if (
        projectsMenuRef.current &&
        !projectsMenuRef.current.contains(target) &&
        projectsButtonRef.current &&
        !projectsButtonRef.current.contains(target)
      ) {
        setActiveDropdown((prev) => (prev === "projects" ? null : prev));
      }
      if (
        aboutMenuRef.current &&
        !aboutMenuRef.current.contains(target) &&
        aboutButtonRef.current &&
        !aboutButtonRef.current.contains(target)
      ) {
        setActiveDropdown((prev) => (prev === "about" ? null : prev));
      }
      if (
        gisMenuRef.current &&
        !gisMenuRef.current.contains(target) &&
        gisButtonRef.current &&
        !gisButtonRef.current.contains(target) &&
        (!gisFlyoutRef.current || !gisFlyoutRef.current.contains(target))
      ) {
        setActiveDropdown((prev) => (prev === "gis" ? null : prev));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------- PROFILE MENU AUTO-CLOSE ----------
  useEffect(() => {
    const closeProfile = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeProfile);
    return () => document.removeEventListener("mousedown", closeProfile);
  }, []);

  // ---------- DROPDOWN ENTER / LEAVE (with increased delay) ----------
  const handleDropdownEnter = (menu: "services" | "projects" | "about" | "gis") => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(menu);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 300); // Increased from 150ms to 300ms for better tolerance
  };

  // ---------- THEME TOGGLE ----------
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  // ---------- STATIC DATA ----------
  const projectsItems = [
    { href: "/projects", label: "Case Studies" },
    { href: "/products", label: "Solution Library" },
    { href: "/Research", label: "Research Lab" },
  ];

  const aboutItems = [
    { href: "/about", label: "Company Story" },
    { href: "/team", label: "Our Team" },
    { href: "/gallery", label: "Studio Gallery" },
  ];

  const LIDAR_SUBSECTIONS = [
    "Advanced DSM Classification",
    "Powerline Feature Extraction",
    "UAV Point Classification",
    "Corridor Classification",
    "MLS Point Classification",
    "MLS Vectorization",
    "DTM Classification",
    "Bathymetry Mapping",
    "Telecom Engineering Services",
  ];

  // ---------- HOME PAGE STYLING HELPER ----------
  const isHomePage = pathname === "/";
  const headerBg =
    isScrolled || !isHomePage
      ? "bg-background/80 backdrop-blur-xl shadow-lg border-b border-border/30"
      : "bg-transparent";
  const textStyle =
    !isScrolled && isHomePage
      ? "text-white/90 hover:text-white hover:bg-white/10"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/50";
  const dropdownBg =
    !isScrolled && isHomePage
      ? "rgba(0, 0, 0, 0.95)"
      : "hsl(var(--background) / 0.95)";
  const dropdownBorder =
    !isScrolled && isHomePage
      ? "rgba(255, 255, 255, 0.2)"
      : "hsl(var(--border) / 0.3)";

  // ---------- AVATAR LETTER ----------
  const getAvatarLetter = (usr: any) => {
    if (!usr) return "";
    return (
      (usr.first_name && usr.first_name[0]) ||
      (usr.username && usr.username[0]) ||
      (usr.email && usr.email[0]) ||
      "A"
    ).toUpperCase();
  };

  // Sort GIS services so LiDAR (id 6) appears first
  const sortedGisServices = [...gisServices].sort((a, b) => {
    if (a.id === "6") return -1;
    if (b.id === "6") return 1;
    return 0;
  });

  return (
    <header
      className={`fixed top-0 z-40 w-full transition-all duration-500 ease-out ${headerBg}`}
    >
      <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* ---------- LOGO ---------- */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Link href="/" className="flex items-center gap-2 p-1 md:p-2">
            <div className="relative w-10 h-10">
              <Image
                src="/brand/nilaya-icon.svg"
                alt="Nilaya AI Logo"
                fill
                className="object-contain rounded-l transition-all duration-300 p-1"
              />
            </div>
            <span
              className={`text-xl md:text-2xl font-bold transition-all duration-300 ${
                !isScrolled && isHomePage
                  ? "text-white drop-shadow-lg group-hover:drop-shadow-xl"
                  : "text-foreground group-hover:text-primary"
              }`}
            >
              Nilaya AI
            </span>
          </Link>
        </motion.div>

        {/* ---------- DESKTOP NAVIGATION (ordered, now with whitespace-nowrap) ---------- */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1">
          {/* 1. Home */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.0 }}
          >
            <Link
              href="/"
              className={`relative px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-300 group flex items-center h-10 whitespace-nowrap ${textStyle} ${
                pathname === "/" ? "text-primary" : ""
              }`}
            >
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>

          {/* 2. About Dropdown */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onMouseEnter={() => handleDropdownEnter("about")}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              ref={aboutButtonRef}
              className={`relative px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-300 group flex items-center gap-1 h-10 whitespace-nowrap ${textStyle} ${
                ["/about", "/gallery"].includes(pathname) ? "text-primary" : ""
              }`}
            >
              <span className="relative z-10">About</span>
              <ChevronDown
                className={`size-4 transition-transform duration-300 ${
                  activeDropdown === "about" ? "rotate-180" : ""
                }`}
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <AnimatePresence>
              {activeDropdown === "about" && (
                <motion.div
                  ref={aboutMenuRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-48 rounded-xl shadow-2xl z-40 border"
                  style={{ background: dropdownBg, borderColor: dropdownBorder }}
                >
                  <div className="p-2 space-y-1">
                    {aboutItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group relative overflow-hidden ${
                          !isScrolled && isHomePage
                            ? "text-white/90 hover:text-white hover:bg-white/10"
                            : "text-foreground/90 hover:text-foreground hover:bg-muted/50"
                        } ${pathname === item.href ? "text-primary" : ""}`}
                        onClick={() => setActiveDropdown(null)}
                      >
                        <span className="relative z-10">{item.label}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 3. IT Services Dropdown */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onMouseEnter={() => handleDropdownEnter("services")}
            onMouseLeave={handleDropdownLeave}
          >
            <Link
              href="/it-services"
              ref={servicesButtonRef}
              className={`relative px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-300 group flex items-center gap-1 h-10 whitespace-nowrap ${textStyle} ${
                pathname === "/it-services" || pathname.startsWith("/it-services/")
                  ? "text-primary"
                  : ""
              }`}
            >
              <span className="relative z-10">AI Services</span>
              <ChevronDown
                className={`size-4 transition-transform duration-300 ${
                  activeDropdown === "services" ? "rotate-180" : ""
                }`}
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <AnimatePresence>
              {activeDropdown === "services" && services.length > 0 && (
                <motion.div
                  ref={servicesMenuRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full max-[1300px]:right-1 min-[1300px]:-left-40 mt-2 w-[600px] rounded-xl shadow-2xl z-40 backdrop-blur-xl border overflow-visible"
                  style={{ background: dropdownBg, borderColor: dropdownBorder }}
                >
                  <div className="p-4 overflow-y-auto max-h-[500px] custom-scrollbar overflow-x-visible">
                    <div className="grid grid-cols-2 gap-3">
                      {services.map((service) => {
                        const isSpecial =
                          String(service.id) === "14" ||
                          ["gis", "photogrammetry", "bim"].some((term) =>
                            service.title.toLowerCase().includes(term)
                          );
                        const baseSlug =
                          service.slug || generateServiceSlug(service.id, service.title);
                        const cacheKey = baseSlug;
                        const resolvedExplore =
                          itExploreCache[cacheKey] !== undefined
                            ? itExploreCache[cacheKey] ?? undefined
                            : service.explore;
                        const hasSecondDropdown =
                          (resolvedExplore?.subsections?.length ?? 0) > 0 ||
                          String(service.id) === "14";

                        return (
                          <div
                            key={service.id}
                            className="relative group"
                            onMouseEnter={(e) => {
                              if (hoverTimeoutRef.current)
                                clearTimeout(hoverTimeoutRef.current);
                              setHoveredServiceId(service.id);
                              const baseSlug =
                                service.slug || generateServiceSlug(service.id, service.title);
                              setHoveredServiceSlug(baseSlug);
                              if (!resolvedExplore?.subsections?.length) {
                                const numericPrefix = baseSlug.match(/^(\d+)-/)?.[1] || "";
                                const candidates = Array.from(
                                  new Set([service.slug || "", service.id || "", baseSlug, numericPrefix])
                                ).filter(Boolean);
                                void ensureItExplore(cacheKey, candidates);
                              }
                              const rect = e.currentTarget.getBoundingClientRect();
                              const flyoutWidth = 280;
                              const menuRect = servicesMenuRef.current?.getBoundingClientRect();
                              const menuMid = menuRect
                                ? menuRect.left + menuRect.width / 2
                                : window.innerWidth / 2;
                              const preferLeft = rect.left < menuMid;
                              const leftAvail = rect.left;
                              const rightAvail = window.innerWidth - rect.right;
                              const canOpenLeft = leftAvail >= flyoutWidth + 12;
                              const canOpenRight = rightAvail >= flyoutWidth + 12;
                              const openLeft = preferLeft ? canOpenLeft : !canOpenRight && canOpenLeft;
                              const desiredLeft = openLeft
                                ? rect.left - flyoutWidth - 10
                                : rect.right + 10;
                              const left = Math.min(
                                Math.max(12, desiredLeft),
                                window.innerWidth - flyoutWidth - 12
                              );
                              setFlyoutPos({ top: rect.top, left });
                            }}
                            onMouseLeave={() => {
                              hoverTimeoutRef.current = setTimeout(() => {
                                setHoveredServiceId(null);
                                setHoveredServiceSlug(null);
                              }, 600);
                            }}
                          >
                            <Link
                              href={`/it-services/${baseSlug}`}
                              className={`block p-3 rounded-lg transition-all duration-300 relative overflow-hidden ${
                                isSpecial
                                  ? !isScrolled && isHomePage
                                    ? "bg-blue-500/10 hover:bg-blue-500/20"
                                    : "bg-blue-100 border border-blue-200 hover:bg-blue-200"
                                  : !isScrolled && isHomePage
                                  ? "hover:bg-white/10"
                                  : "hover:bg-muted/50"
                              } ${
                                hoveredServiceId === service.id
                                  ? isSpecial && (isScrolled || !isHomePage)
                                    ? "bg-blue-200"
                                    : !isScrolled && isHomePage
                                    ? "bg-white/10"
                                    : "bg-muted/50"
                                  : ""
                              }`}
                              onClick={() => {
                                setActiveDropdown(null);
                                setHoveredServiceId(null);
                                setHoveredServiceSlug(null);
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted/30">
                                  <img
                                    src={getImageUrl(service.image, "/brand/abstract-grid.svg")}
                                    alt={service.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4
                                    className={`font-semibold text-sm mb-1 transition-colors ${
                                      !isScrolled && isHomePage
                                        ? "text-white group-hover:text-blue-400"
                                        : "text-foreground group-hover:text-primary"
                                    }`}
                                  >
                                    {service.title}
                                  </h4>
                                  <p
                                    className={`text-xs line-clamp-2 ${
                                      !isScrolled && isHomePage
                                        ? "text-white/70"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {service.description}
                                  </p>
                                </div>
                              </div>
                              {hasSecondDropdown && (
                                <div
                                  className={`absolute right-2 top-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ${
                                    !isScrolled && isHomePage
                                      ? "text-blue-400"
                                      : "text-primary"
                                  }`}
                                >
                                  <ChevronRight className="size-4" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <Link
                        href="/it-services"
                        className={`block text-center py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                          !isScrolled && isHomePage
                            ? "text-white hover:bg-white/10"
                            : "text-primary hover:bg-primary/10"
                        }`}
                        onClick={() => setActiveDropdown(null)}
                      >
                        View All AI Services →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 4. GIS Services Dropdown - with improved hover & width */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onMouseEnter={() => handleDropdownEnter("gis")}
          >
            <Link
              href="/gis-services"
              ref={gisButtonRef}
              className={`relative px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-300 group flex items-center gap-1 h-10 whitespace-nowrap ${textStyle} ${
                pathname.startsWith("/gis-services") ? "text-primary" : ""
              }`}
            >
              <span className="relative z-10">Automation</span>
              <ChevronDown
                className={`size-4 transition-transform duration-300 ${
                  activeDropdown === "gis" ? "rotate-180" : ""
                }`}
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            {/* Invisible bridge to smooth mouse movement */}
            {activeDropdown === "gis" && (
              <div className="absolute top-full left-0 w-full h-4 bg-transparent" />
            )}
            <AnimatePresence>
              {activeDropdown === "gis" && (
                <motion.div
                  ref={gisMenuRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full left-0 mt-2 w-72 min-w-fit rounded-xl shadow-2xl z-40 backdrop-blur-xl border overflow-hidden"
                  style={{ background: dropdownBg, borderColor: dropdownBorder }}
                  onMouseEnter={() => handleDropdownEnter("gis")}
                >
                  <div className="p-2 max-h-96 overflow-y-auto">
                    {gisServicesLoading ? (
                      <div className="px-3 py-2 text-sm text-center">Loading...</div>
                    ) : gisServices.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-center">No GIS services</div>
                    ) : (
                      sortedGisServices.map((service) => {
                        const isLidar = String(service.id) === "6";
                        const baseSlug = service.slug || service.id;
                        const cacheKey = baseSlug;
                        const resolvedExplore =
                          gisExploreCache[cacheKey] !== undefined
                            ? gisExploreCache[cacheKey] ?? undefined
                            : service.explore;
                        const hasSecondDropdown =
                          (resolvedExplore?.subsections?.length ?? 0) > 0 || isLidar;
                        return (
                          <div
                            key={service.id}
                            className="relative"
                            onMouseEnter={(e) => {
                              if (hasSecondDropdown) {
                                if (hoverTimeoutRef.current)
                                  clearTimeout(hoverTimeoutRef.current);
                                setHoveredGisLidar(true);
                                setHoveredGisLidarSlug(baseSlug);
                                if (!resolvedExplore?.subsections?.length) {
                                  const candidates = Array.from(
                                    new Set([service.slug || "", service.id || "", baseSlug])
                                  ).filter(Boolean);
                                  void ensureGisExplore(cacheKey, candidates);
                                }
                                const rect = e.currentTarget.getBoundingClientRect();
                                const flyoutWidth = 280;
                                const rightAvail = window.innerWidth - rect.right;
                                const leftAvail = rect.left;
                                const openLeft =
                                  rightAvail < flyoutWidth + 12 && leftAvail >= flyoutWidth + 12;
                                const desiredLeft = openLeft
                                  ? rect.left - flyoutWidth - 10
                                  : rect.right + 10;
                                const left = Math.min(
                                  Math.max(12, desiredLeft),
                                  window.innerWidth - flyoutWidth - 12
                                );
                                setGisFlyoutPos({ top: rect.top, left });
                              }
                            }}
                            onMouseLeave={() => {
                              if (hasSecondDropdown) {
                                hoverTimeoutRef.current = setTimeout(() => {
                                  setHoveredGisLidar(false);
                                  setHoveredGisLidarSlug(null);
                                }, 300);
                              }
                            }}
                          >
                            <Link
                              href={`/gis-services/${baseSlug}`}
                              className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                !isScrolled && isHomePage
                                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                                  : "text-foreground/80 hover:bg-muted/80 hover:text-primary"
                              }`}
                              onClick={() => {
                                setActiveDropdown(null);
                                setHoveredGisLidar(false);
                                setHoveredGisLidarSlug(null);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="truncate">{service.title}</span>
                                {hasSecondDropdown && (
                                  <ChevronRight className="size-3 opacity-50 flex-shrink-0 ml-2" />
                                )}
                              </div>
                            </Link>
                          </div>
                        );
                      })
                    )}
                    {!gisServicesLoading && gisServices.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/30">
                        <Link
                          href="/gis-services"
                          className={`block text-center py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                            !isScrolled && isHomePage
                              ? "text-white/70 hover:bg-white/10"
                              : "text-muted-foreground hover:bg-muted/50"
                          }`}
                          onClick={() => setActiveDropdown(null)}
                        >
                          View All Automation →
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 5. Projects Dropdown */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onMouseEnter={() => handleDropdownEnter("projects")}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              ref={projectsButtonRef}
              className={`relative px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-300 group flex items-center gap-1 h-10 whitespace-nowrap ${textStyle} ${
                ["/projects", "/products", "/research-development"].includes(pathname)
                  ? "text-primary"
                  : ""
              }`}
            >
              <span className="relative z-10">Case Studies</span>
              <ChevronDown
                className={`size-4 transition-transform duration-300 ${
                  activeDropdown === "projects" ? "rotate-180" : ""
                }`}
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <AnimatePresence>
              {activeDropdown === "projects" && (
                <motion.div
                  ref={projectsMenuRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-60 rounded-xl shadow-2xl z-40 border"
                  style={{ background: dropdownBg, borderColor: dropdownBorder }}
                >
                  <div className="p-2 space-y-1">
                    {projectsItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300 group relative overflow-hidden ${
                          !isScrolled && isHomePage
                            ? "text-white/90 hover:text-white hover:bg-white/10"
                            : "text-foreground/90 hover:text-foreground hover:bg-muted/50"
                        } ${pathname === item.href ? "text-primary" : ""}`}
                        onClick={() => setActiveDropdown(null)}
                      >
                        <span className="relative z-10 flex items-center justify-between">
                          {item.label}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 6. Solutions */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href="/products"
              className={`relative px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-300 group flex items-center h-10 whitespace-nowrap ${textStyle} ${
                pathname === "/products" ? "text-primary" : ""
              }`}
            >
              <span className="relative z-10">Solutions</span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>

          {/* 7. Blog */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/blog"
              className={`relative px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-300 group flex items-center h-10 whitespace-nowrap ${textStyle} ${
                pathname === "/blog" ? "text-primary" : ""
              }`}
            >
              <span className="relative z-10">Blog</span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>

          {/* 8. Contact */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <NavLink
              href="/contact"
              className={`${textStyle} ${
                pathname === "/contact" ? "text-primary" : ""
              }`}
            >
              Contact
            </NavLink>
          </motion.div>
        </nav>

        {/* ---------- DESKTOP ACTION BUTTONS (unchanged) ---------- */}
        <div className="hidden md:flex gap-3 items-center">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={`relative rounded-full transition-all duration-300 group ${
              !isScrolled && isHomePage
                ? "text-white hover:bg-white/20 backdrop-blur-sm"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <div className="relative">
              {mounted && theme === "dark" ? (
                <Sun className="size-5 transition-transform duration-300 group-hover:rotate-180" />
              ) : (
                <Moon className="size-5 transition-transform duration-300 group-hover:-rotate-12" />
              )}
            </div>
          </Button>

          <Link href="/contact">
            <Button
              className={`relative rounded-full px-4 lg:px-6 py-2.5 font-medium transition-all duration-300 group overflow-hidden ${
                !isScrolled && isHomePage
                  ? "bg-white/95 text-primary hover:bg-white hover:shadow-2xl hover:shadow-white/25"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
              }`}
            >
              <span className="relative z-10 flex items-center gap-2 text-sm lg:text-base whitespace-nowrap">
                Start Free Consultation
                <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Button>
          </Link>

          {/* Auth */}
          {loading ? (
            <div className="w-10 h-10 rounded-full bg-muted/40 animate-pulse" />
          ) : user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen((s) => !s)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ring-1 ring-border/20 transition-shadow ${
                  !isScrolled && isHomePage
                    ? "bg-white text-blue-600"
                    : "bg-primary text-primary-foreground"
                }`}
                aria-expanded={profileMenuOpen}
                aria-label="Open profile menu"
              >
                {getAvatarLetter(user)}
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl shadow-lg z-40 overflow-hidden bg-popover border border-border/30">
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-muted/10"
                    onClick={() => {
                      const dashboardRoute = (user as any)?.employee_id ? "/employee/dashboard" : "/admin1/dashboard";
                      window.location.href = dashboardRoute;
                    }}
                  >
                    Dashboard
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 border-t hover:bg-muted/10"
                    onClick={() => {
                      logout();
                      setProfileMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button
                className={`relative rounded-full px-4 lg:px-6 py-2.5 font-medium transition-all duration-300 group overflow-hidden ${
                  !isScrolled && isHomePage
                    ? "bg-transparent text-white hover:bg-white/10 hover:text-white"
                    : "bg-muted text-foreground hover:bg-muted/70"
                }`}
              >
                <span className="relative z-10 flex items-center gap-2 text-sm lg:text-base whitespace-nowrap">
                  Login
                  <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
          )}
        </div>

        {/* ---------- MOBILE MENU BUTTON ---------- */}
        <div className="flex items-center gap-3 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={`rounded-full transition-all duration-300 ${
              !isScrolled && isHomePage
                ? "text-white hover:bg-white/20 backdrop-blur-sm"
                : "text-foreground hover:bg-muted"
            }`}
          >
            {mounted && theme === "dark" ? (
              <Sun className="size-5" />
            ) : (
              <Moon className="size-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`rounded-full transition-all duration-300 ${
              !isScrolled && isHomePage
                ? "text-white hover:bg-white/20 backdrop-blur-sm"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <div className="relative">
              {mobileMenuOpen ? (
                <X className="size-6 transition-transform duration-300 rotate-90" />
              ) : (
                <Menu className="size-6 transition-transform duration-300" />
              )}
            </div>
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* ---------- MOBILE MENU (unchanged order) ---------- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`md:hidden absolute top-20 inset-x-4 rounded-2xl backdrop-blur-xl border shadow-2xl overflow-hidden ${
              !isScrolled && isHomePage
                ? "bg-black/80 border-white/20 shadow-black/50"
                : "bg-background/95 border-border/30 shadow-black/10"
            }`}
          >
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {/* 1. Home */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.0 }}
                >
                  <Link
                    href="/"
                    className={`block px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                      !isScrolled && isHomePage
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                </motion.div>

                {/* 2. About dropdown */}
                <div className="space-y-1">
                  <button
                    onClick={() => setMobileAboutMenuOpen(!mobileAboutMenuOpen)}
                    className={`w-full text-left px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 flex items-center justify-between ${
                      !isScrolled && isHomePage
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span>About</span>
                    <ChevronDown
                      className={`size-4 transition-transform duration-300 ${
                        mobileAboutMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {mobileAboutMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pl-4 space-y-1 overflow-hidden"
                      >
                        {aboutItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                              !isScrolled && isHomePage
                                ? "text-white/80 hover:text-white hover:bg-white/10"
                                : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
                            }`}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setMobileAboutMenuOpen(false);
                            }}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3. IT Services dropdown */}
                <div className="space-y-1">
                  <button
                    onClick={() => setMobileItMenuOpen(!mobileItMenuOpen)}
                    className={`w-full text-left px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 flex items-center justify-between ${
                      !isScrolled && isHomePage
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : "text-foreground hover:bg-muted/50"
                    } ${
                      pathname === "/it-services" || pathname.startsWith("/it-services/")
                        ? "text-primary"
                        : ""
                    }`}
                  >
                    <span>AI Services</span>
                    <ChevronDown
                      className={`size-4 transition-transform duration-300 ${
                        mobileItMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {mobileItMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pl-4 space-y-1 overflow-hidden"
                      >
                        {services.map((service) => {
                          const baseSlug =
                            service.slug || generateServiceSlug(service.id, service.title);
                          const subsections = Array.isArray(service.explore?.subsections)
                            ? service.explore!.subsections
                            : [];
                          const fallbackSubs =
                            String(service.id) === "14" && subsections.length === 0
                              ? LIDAR_SUBSECTIONS.map((t) => ({
                                  title: t,
                                  slug: t
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, "-")
                                    .replace(/(^-|-$)/g, ""),
                                }))
                              : [];

                          const effectiveSubs =
                            subsections.length > 0 ? subsections : fallbackSubs;

                          return (
                            <div key={service.id} className="space-y-1">
                              <Link
                                href={`/it-services/${baseSlug}`}
                                className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                                  !isScrolled && isHomePage
                                    ? "text-white/80 hover:text-white hover:bg-white/10"
                                    : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
                                }`}
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  setMobileItMenuOpen(false);
                                }}
                              >
                                {service.title}
                              </Link>

                              {effectiveSubs.length > 0 && (
                                <div className="pl-4 space-y-1">
                                  {effectiveSubs.map((sub, idx) => (
                                    <Link
                                      key={`${sub.slug}-${idx}`}
                                      href={`/it-services/${baseSlug}/${sub.slug}`}
                                      className={`block px-4 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${
                                        !isScrolled && isHomePage
                                          ? "text-white/70 hover:text-white hover:bg-white/10"
                                          : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                                      }`}
                                      onClick={() => {
                                        setMobileMenuOpen(false);
                                        setMobileItMenuOpen(false);
                                      }}
                                    >
                                      {sub.title}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <Link
                          href="/it-services"
                          className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                            !isScrolled && isHomePage
                              ? "text-white/80 hover:text-white hover:bg-white/10"
                              : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
                          }`}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setMobileItMenuOpen(false);
                          }}
                        >
                          View All AI Services →
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 4. GIS Services dropdown */}
                <div className="space-y-1">
                  <button
                    onClick={() => setMobileGisMenuOpen(!mobileGisMenuOpen)}
                    className={`w-full text-left px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 flex items-center justify-between ${
                      !isScrolled && isHomePage
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span>Automation</span>
                    <ChevronDown
                      className={`size-4 transition-transform duration-300 ${
                        mobileGisMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {mobileGisMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pl-4 space-y-1 overflow-hidden"
                      >
                        {sortedGisServices.map((service) => {
                          const baseSlug = service.slug || service.id;
                          const subsections = Array.isArray(service.explore?.subsections)
                            ? service.explore!.subsections
                            : [];
                          const fallbackSubs =
                            String(service.id) === "6" && subsections.length === 0
                              ? LIDAR_SUBSECTIONS.map((t) => ({
                                  title: t,
                                  slug: t
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, "-")
                                    .replace(/(^-|-$)/g, ""),
                                }))
                              : [];
                          const effectiveSubs =
                            subsections.length > 0 ? subsections : fallbackSubs;

                          return (
                            <div key={service.id} className="space-y-1">
                              <Link
                                href={`/gis-services/${baseSlug}`}
                                className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                                  !isScrolled && isHomePage
                                    ? "text-white/80 hover:text-white hover:bg-white/10"
                                    : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
                                }`}
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  setMobileGisMenuOpen(false);
                                }}
                              >
                                {service.title}
                              </Link>
                              {effectiveSubs.length > 0 && (
                                <div className="pl-4 space-y-1">
                                  {effectiveSubs.map((sub, idx) => (
                                    <Link
                                      key={`${sub.slug}-${idx}`}
                                      href={`/gis-services/${baseSlug}/${sub.slug}`}
                                      className={`block px-4 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${
                                        !isScrolled && isHomePage
                                          ? "text-white/70 hover:text-white hover:bg-white/10"
                                          : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                                      }`}
                                      onClick={() => {
                                        setMobileMenuOpen(false);
                                        setMobileGisMenuOpen(false);
                                      }}
                                    >
                                      {sub.title}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <Link
                          href="/gis-services"
                          className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                            !isScrolled && isHomePage
                              ? "text-white/80 hover:text-white hover:bg-white/10"
                              : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
                          }`}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setMobileGisMenuOpen(false);
                          }}
                        >
                          View All Automation →
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 5. Projects dropdown */}
                <div className="space-y-1">
                  <button
                    onClick={() => setMobileProjectsMenuOpen(!mobileProjectsMenuOpen)}
                    className={`w-full text-left px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 flex items-center justify-between ${
                      !isScrolled && isHomePage
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span>Case Studies</span>
                    <ChevronDown
                      className={`size-4 transition-transform duration-300 ${
                        mobileProjectsMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {mobileProjectsMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pl-4 space-y-1 overflow-hidden"
                      >
                        {projectsItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                              !isScrolled && isHomePage
                                ? "text-white/80 hover:text-white hover:bg-white/10"
                                : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
                            }`}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setMobileProjectsMenuOpen(false);
                            }}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 6. Solutions */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link
                    href="/products"
                    className={`block px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                      !isScrolled && isHomePage
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Solutions
                  </Link>
                </motion.div>

                {/* 7. Blog */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    href="/blog"
                    className={`block px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                      !isScrolled && isHomePage
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Blog
                  </Link>
                </motion.div>

                {/* 8. Contact */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    href="/contact"
                    className={`block px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                      !isScrolled && isHomePage
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </motion.div>
              </div>

              {/* Mobile action buttons (unchanged) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-4 border-t border-white/10"
              >
                <div className="flex flex-col gap-3">
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      className={`w-full rounded-xl py-3 font-medium transition-all duration-300 ${
                        !isScrolled && isHomePage
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      Start Free Consultation
                      <ChevronRight className="ml-2 size-4" />
                    </Button>
                  </Link>

                  {user ? (
                    <>
                      <Link
                        href={isEmployeeUser ? "/employee/dashboard" : "/admin1/dashboard"}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          className={`w-full rounded-xl py-3 font-medium transition-all duration-300 ${
                            !isScrolled && isHomePage
                              ? "bg-white text-blue-600 hover:bg-white/90"
                              : "bg-primary text-primary-foreground hover:bg-primary/90"
                          }`}
                        >
                          Dashboard
                          <ChevronRight className="ml-2 size-4" />
                        </Button>
                      </Link>
                      <Button
                        className={`w-full rounded-xl py-3 font-medium transition-all duration-300 ${
                          !isScrolled && isHomePage
                            ? "bg-transparent text-white hover:bg-white/10"
                            : "bg-muted text-foreground hover:bg-muted/70"
                        }`}
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        className={`w-full rounded-xl py-3 font-medium transition-all duration-300 ${
                          !isScrolled && isHomePage
                            ? "bg-transparent text-white hover:bg-white/10"
                            : "bg-muted text-foreground hover:bg-muted/70"
                        }`}
                      >
                        Login
                        <ChevronRight className="ml-2 size-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.5);
        }
      `}</style>

      {/* GIS Second Dropdown Flyout */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {activeDropdown === "gis" && hoveredGisLidar && (() => {
              const hovered = gisServices.find(
                (s) => (s.slug || s.id) === (hoveredGisLidarSlug || "")
              );
              const apiSlug = hoveredGisLidarSlug || (hovered?.slug || hovered?.id || "");
              const resolvedExplore =
                apiSlug && gisExploreCache[apiSlug] !== undefined
                  ? gisExploreCache[apiSlug] ?? undefined
                  : hovered?.explore;
              const dynamicSubs = resolvedExplore?.subsections ?? [];
              const isLoading = apiSlug ? !!gisExploreLoading[apiSlug] : false;
              const isLidar = String(hovered?.id ?? "") === "6";
              const fallbackSubs = isLidar
                ? LIDAR_SUBSECTIONS.map((t) => ({
                    title: t,
                    slug: t
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, ""),
                  }))
                : [];
              const subsections = dynamicSubs.length > 0 ? dynamicSubs : fallbackSubs;

              const exploreTitle =
                typeof resolvedExplore?.title === "string" && resolvedExplore.title.trim()
                  ? resolvedExplore.title.trim()
                  : hovered
                  ? `Explore ${hovered.title}`
                  : "Explore";

              const serviceSlug = apiSlug;
              if (!serviceSlug) return null;
              if (subsections.length === 0 && !isLoading) return null;

              return (
                <motion.div
                  key={`gis-flyout-${serviceSlug}`}
                  ref={gisFlyoutRef}
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="fixed w-[280px] rounded-xl shadow-2xl z-40 overflow-hidden backdrop-blur-xl border pointer-events-auto"
                  style={{
                    top: gisFlyoutPos.top,
                    left: gisFlyoutPos.left,
                    background: dropdownBg,
                    borderColor: dropdownBorder,
                  }}
                  onMouseEnter={() => {
                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    handleDropdownEnter("gis");
                    setHoveredGisLidar(true);
                  }}
                  onMouseLeave={() => {
                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    hoverTimeoutRef.current = setTimeout(() => {
                      setHoveredGisLidar(false);
                      setHoveredGisLidarSlug(null);
                    }, 300);
                  }}
                >
                  <div className="px-3 py-2 border-b border-border/30">
                    <div className="text-xs font-semibold truncate">{exploreTitle}</div>
                  </div>
                  <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
                    <div className="space-y-1">
                      {subsections.length === 0 && isLoading ? (
                        <div
                          className={`px-2 py-2 text-xs font-medium ${
                            !isScrolled && isHomePage ? "text-white/70" : "text-muted-foreground"
                          }`}
                        >
                          Loading...
                        </div>
                      ) : (
                        subsections.map((sub, idx) => (
                        <Link
                          key={`${sub.slug}-${idx}`}
                          href={`/gis-services/${serviceSlug}/${sub.slug}`}
                          className={`block px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                            !isScrolled && isHomePage
                              ? "text-white/80 hover:bg-white/10 hover:text-white"
                              : "text-foreground/80 hover:bg-muted/80 hover:text-primary"
                          }`}
                          onClick={() => {
                            setActiveDropdown(null);
                            setHoveredGisLidar(false);
                            setHoveredGisLidarSlug(null);
                          }}
                        >
                          {sub.title}
                        </Link>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>,
          document.body
        )}

      {/* IT Second Dropdown Flyout */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {activeDropdown === "services" && hoveredServiceId && (() => {
              const hovered = services.find((s) => s.id === hoveredServiceId) || null;
              const cacheKey = hoveredServiceSlug || hovered?.slug || hovered?.id || "";
              const resolvedExplore =
                cacheKey && itExploreCache[cacheKey] !== undefined
                  ? itExploreCache[cacheKey] ?? undefined
                  : hovered?.explore;
              const dynamicSubs = resolvedExplore?.subsections ?? [];
              const isLoading = cacheKey ? !!itExploreLoading[cacheKey] : false;
              const fallbackSubs =
                hoveredServiceId === "14"
                  ? LIDAR_SUBSECTIONS.map((t) => ({
                      title: t,
                      slug: t
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, ""),
                    }))
                  : [];
              const subsections = dynamicSubs.length > 0 ? dynamicSubs : fallbackSubs;

              const exploreTitle =
                typeof resolvedExplore?.title === "string" && resolvedExplore.title.trim()
                  ? resolvedExplore.title.trim()
                  : hovered
                  ? `Explore ${hovered.title}`
                  : "Explore";

              const baseSlug = cacheKey;
              if (!baseSlug) return null;
              if (subsections.length === 0 && !isLoading) return null;

              return (
                <motion.div
                  key={`it-flyout-${hoveredServiceId}`}
                  ref={servicesFlyoutRef}
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="fixed w-[280px] rounded-xl shadow-2xl z-40 overflow-hidden backdrop-blur-xl border pointer-events-auto"
                  style={{
                    top: flyoutPos.top,
                    left: flyoutPos.left,
                    background: dropdownBg,
                    borderColor: dropdownBorder,
                  }}
                  onMouseEnter={() => {
                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    handleDropdownEnter("services");
                    setHoveredServiceId(hoveredServiceId);
                    setHoveredServiceSlug(baseSlug);
                  }}
                  onMouseLeave={() => {
                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    hoverTimeoutRef.current = setTimeout(() => {
                      setHoveredServiceId(null);
                      setHoveredServiceSlug(null);
                      handleDropdownLeave();
                    }, 300);
                  }}
                >
                  <div className="px-3 py-2 border-b border-border/30">
                    <div className="text-xs font-semibold truncate">{exploreTitle}</div>
                  </div>
                  <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
                    <div className="space-y-1">
                      {subsections.length === 0 && isLoading ? (
                        <div
                          className={`px-2 py-2 text-xs font-medium ${
                            !isScrolled && isHomePage ? "text-white/70" : "text-muted-foreground"
                          }`}
                        >
                          Loading...
                        </div>
                      ) : (
                        subsections.map((sub, idx) => (
                        <Link
                          key={`${sub.slug}-${idx}`}
                          href={`/it-services/${baseSlug}/${sub.slug}`}
                          className={`block px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                            !isScrolled && isHomePage
                              ? "text-white/80 hover:bg-white/10 hover:text-white"
                              : "text-foreground/80 hover:bg-muted/80 hover:text-primary"
                          }`}
                          onClick={() => {
                            setActiveDropdown(null);
                            setHoveredServiceId(null);
                            setHoveredServiceSlug(null);
                          }}
                        >
                          {sub.title}
                        </Link>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
}

export function Header() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <HeaderInner />;
}
