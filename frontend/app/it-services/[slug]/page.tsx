"use client";
import { API_URL } from "@/lib/config";
import { generateSlug } from "@/lib/team";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Users,
  PlayCircle,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

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
  long_description: string;
  features: string[];
  benefits: string[];
  technologies: string[];
  developers: number[];
  demo_video_url: string;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  use_cases?: {
    title: string;
    description: string;
    image: string;
    layout?: "image_left" | "image_right";
  }[];
  explore?: ExploreSection;
};

type TeamMember = {
  id: number;
  name: string;
  role: string;
  image: string;
  department: string;
  location: string;
};

// LiDAR Subsections Data
const LIDAR_SUBSECTIONS = [
  { slug: "advanced-dsm-classification", title: "Advanced DSM Classification" },
  { slug: "powerline-feature-extraction", title: "Powerline Feature Extraction" },
  { slug: "uav-point-classification", title: "UAV Point Classification" },
  { slug: "corridor-classification", title: "Corridor Classification" },
  { slug: "mls-point-classification", title: "MLS Point Classification" },
  { slug: "mls-vectorization", title: "MLS Vectorization" },
  { slug: "dtm-classification", title: "DTM Classification" },
  { slug: "bathymetry-mapping", title: "Bathymetry Mapping" },
];

export default function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [developers, setDevelopers] = useState<TeamMember[]>([]);
  const [relatedServices, setRelatedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  // ... (rest of the state and handlers remain the same)

  // Check if current service is LiDAR
  const isLidarService = service?.title.toLowerCase().includes("lidar");
  const exploreTitle =
    typeof service?.explore?.title === "string" && service.explore.title.trim()
      ? service.explore.title.trim()
      : service
      ? `Explore ${service.title}`
      : "Explore";
  const exploreSubsections = Array.isArray(service?.explore?.subsections)
    ? service!.explore!.subsections
    : [];

  // Handler for developer navigation
  const handleDeveloperClick = (developerName: string) => {
    const slug = generateSlug(developerName);
    setNavigatingTo(slug);

    // Use Next.js router for better navigation
    setTimeout(() => {
      router.push(`/team/${slug}`);
    }, 150);
  };

  const slugifyTitle = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const getImageUrl = (imagePath?: string | null, fallback = "/brand/abstract-grid.svg") => {
    if (!imagePath) return fallback;
    const cleaned = imagePath.trim().replace(/^`+/, "").replace(/`+$/, "").trim();
    if (!cleaned) return fallback;
    if (cleaned.startsWith("http")) return cleaned;
    const normalized = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    return `${API_URL}${normalized}`;
  };

  const generateServiceSlug = (id: string, title: string) => {
    const titleSlug = slugifyTitle(title);
    const isNumericId = /^\d+$/.test(id);
    return isNumericId ? `${id}-${titleSlug}` : id;
  };

  const findServiceBySlug = (all: Service[], slug: string) =>
    all.find((s) => {
      const titleSlug = slugifyTitle(s.title);
      return slug === s.id || slug === `${s.id}-${titleSlug}`;
    });

  const getServiceIdCandidatesFromSlug = (slug: string): string[] => {
    const numericPrefix = slug.match(/^(\d+)-/);
    const candidates = [slug];
    if (numericPrefix?.[1]) candidates.unshift(numericPrefix[1]);
    return Array.from(new Set(candidates));
  };

  // Fetch service data and related information
  useEffect(() => {
    let cancelled = false;

    const fetchServiceData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const allServicesResponse = await fetch(`${API_URL}/api/services/`, {
          cache: "no-store",
        });
        const allServices: Service[] = allServicesResponse.ok
          ? await allServicesResponse.json()
          : [];

        const matched = findServiceBySlug(allServices, params.slug);
        const idCandidates = matched
          ? [matched.id]
          : getServiceIdCandidatesFromSlug(params.slug);

        let serviceData: Service | null = null;

        for (const candidateId of idCandidates) {
          const res = await fetch(`${API_URL}/api/services/${candidateId}/`, {
            cache: "no-store",
          });

          if (res.ok) {
            serviceData = await res.json();
            break;
          }

          if (res.status !== 404) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
        }

        if (!serviceData) {
          throw new Error("Service not found");
        }

        if (cancelled) return;
        if (!serviceData) {
          if (!cancelled) {
            setService(null);
            setDevelopers([]);
            setRelatedServices([]);
          }
          return;
        }

        const resolvedServiceData = serviceData;

        setService(resolvedServiceData);

        // Fetch all team members to get developer details
        if (
          resolvedServiceData.developers &&
          resolvedServiceData.developers.length > 0
        ) {
          const teamResponse = await fetch(`${API_URL}/api/team/`, {
            cache: "no-store",
          });
          if (teamResponse.ok) {
            const teamData: TeamMember[] = await teamResponse.json();
            const serviceDevelopers = teamData.filter((member) =>
              resolvedServiceData.developers.includes(member.id)
            );
            if (!cancelled) setDevelopers(serviceDevelopers);
          }
        } else {
          setDevelopers([]);
        }

        const related = allServices
          .filter((s) => s.status === "active" && s.id !== resolvedServiceData.id)
          .sort((a, b) => a.sort_order - b.sort_order)
          .slice(0, 3);

        if (!cancelled) setRelatedServices(related);
      } catch (error) {
        console.error("Error fetching service data:", error);
        const message = error instanceof Error ? error.message : String(error);
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchServiceData();

    return () => {
      cancelled = true;
    };
  }, [params.slug]);

  // Extract video ID from YouTube URL
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Check if URL is a Vimeo URL
  const extractVimeoId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /vimeo\.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold mb-4">Service Not Found</h1>
          <p className="text-muted-foreground mb-8">
            {error || "The service you're looking for doesn't exist or has been removed."}
          </p>
          <Link href="/it-services">
            <Button size="lg">
              <ArrowLeft className="mr-2 size-4" />
              Back to All Services
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const youtubeId = extractYouTubeId(service.demo_video_url);
  const vimeoId = extractVimeoId(service.demo_video_url);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-50/20">
      {/* Hero Section */}
      <section className="relative w-full py-20 bg-gradient-to-br from-primary/10 via-blue-50/30 to-purple-50/20">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Link
                href="/it-services"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
              >
                <ArrowLeft className="mr-2 size-4" />
                Back to All Services
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {service.title}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {service.description}
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                {service.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative h-64 md:h-96 overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={getImageUrl(service.image, "/brand/abstract-grid.svg")}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Content */}
      <section className="w-full py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              {/* Overview */}
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Overview</h2>
              <div className="prose prose-lg max-w-none mb-12 text-muted-foreground">
                {service.long_description.split("\n\n").map((paragraph, idx) => (
                  <p key={idx} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Key Benefits */}
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Key Benefits
              </h2>
              <div className="grid sm:grid-cols-2 gap-6 mb-12">
                {service.benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="size-6 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">{benefit}</p>
                  </motion.div>
                ))}
              </div>

              {/* Technologies & Tools */}
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Technologies & Tools
              </h2>
              <div className="space-y-4 mb-12">
                {service.technologies.map((tech, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <ChevronRight className="size-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">{tech}</p>
                  </motion.div>
                ))}
              </div>

              {/* Developers Section */}
              {developers.length > 0 && (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                    <Users className="size-8 text-primary" />
                    Our Expert Team
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-12">
                    {developers.map((developer) => {
                      const developerSlug = generateSlug(developer.name);
                      const isNavigating = navigatingTo === developerSlug;

                      return (
                        <motion.div
                          key={developer.id}
                          onClick={() => handleDeveloperClick(developer.name)}
                          className="group cursor-pointer"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card className="overflow-hidden border-border/40 hover:shadow-lg transition-all duration-300 hover:border-primary/50 relative">
                            {isNavigating && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center"
                              >
                                <Loader2 className="size-8 animate-spin text-primary mb-2" />
                                <p className="text-xs text-muted-foreground">Loading profile...</p>
                              </motion.div>
                            )}
                            <CardContent className="p-0">
                              <div className="relative h-32 overflow-hidden">
                                <img
                                  src={getImageUrl(developer.image, "/brand/abstract-grid.svg")}
                                  alt={developer.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              </div>
                              <div className="p-3">
                                <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                                  {developer.name}
                                </h3>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {developer.role}
                                </p>
                                <Badge
                                  variant="outline"
                                  className="mt-2 text-xs"
                                >
                                  {developer.department}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Use Cases Section */}
              {(service.use_cases?.length || 0) > 0 && (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6">Use Cases</h2>
                  <div className="space-y-10 mb-12">
                    {service.use_cases!.map((uc, idx) => {
                      const resolvedLayout =
                        uc.layout ?? (idx % 2 === 0 ? "image_left" : "image_right");
                      const isImageLeft = resolvedLayout === "image_left";

                      return (
                        <motion.div
                          key={`${uc.title}-${idx}`}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5 }}
                          className="grid md:grid-cols-2 gap-8 items-center"
                        >
                          <div className={isImageLeft ? "order-1" : "order-2"}>
                            <div className="relative overflow-hidden rounded-2xl border border-border/50 shadow-lg bg-muted">
                              <img
                                src={getImageUrl(uc.image, "/brand/abstract-grid.svg")}
                                alt={uc.title || "Use case image"}
                                className="w-full h-64 md:h-80 object-cover"
                              />
                            </div>
                          </div>

                          <div className={isImageLeft ? "order-2" : "order-1"}>
                            <h3 className="text-xl md:text-2xl font-bold mb-3">
                              {uc.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                              {uc.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}


              {/* Demo Video Section */}
              {service.demo_video_url && (youtubeId || vimeoId) && (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                    <PlayCircle className="size-8 text-primary" />
                    Demo Video
                  </h2>
                  <div className="mb-12">
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                      {youtubeId && (
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          title="Service Demo Video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      )}
                      {vimeoId && !youtubeId && (
                        <iframe
                          src={`https://player.vimeo.com/video/${vimeoId}`}
                          title="Service Demo Video"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Raw video URL link if it's not YouTube or Vimeo */}
              {service.demo_video_url && !youtubeId && !vimeoId && (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                    <PlayCircle className="size-8 text-primary" />
                    Demo Video
                  </h2>
                  <div className="mb-12">
                    <Card className="p-6 border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold mb-2">
                            Watch Our Demo
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Click to view the demonstration video
                          </p>
                        </div>
                        <Button asChild>
                          <a
                            href={service.demo_video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Watch Video
                            <ExternalLink className="ml-2 size-4" />
                          </a>
                        </Button>
                      </div>
                    </Card>
                  </div>
                </>
              )}
            </div>

            
              
                    
            {/* Sidebar */}
            <div className="space-y-6 sticky top-24 h-fit">
              {/* SPECIAL LIDAR MENU */}
              {isLidarService && (
                <div className="relative group/card">
                  {/* Glowing border effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/40 via-primary/40 to-indigo-600/40 rounded-xl blur opacity-75 group-hover/card:opacity-100 transition-opacity duration-500" />

                  <Card className="relative border border-slate-700 shadow-2xl bg-slate-800/95 backdrop-blur-xl overflow-hidden rounded-xl">

                    {/* Dark Header */}
                    <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 border-b border-slate-700/60">
                      {/* Grid pattern */}
                      <div
                        className="absolute inset-0 opacity-[0.05]"
                        style={{
                          backgroundImage: `linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)`,
                          backgroundSize: "20px 20px",
                        }}
                      />

                      <div className="relative flex items-center gap-4">
                        <div className="relative p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-xl shadow-inner shadow-blue-500/10">
                          <CheckCircle className="size-6 text-blue-400" />
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-100 text-base tracking-tight mb-1">
                            Explore LiDAR Services
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="flex size-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <p className="text-xs font-medium text-slate-400">
                              {LIDAR_SUBSECTIONS.length} specialized solutions
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dark List Content */}
                    <CardContent className="p-0">
                      <nav className="flex flex-col divide-y divide-slate-700/60">
                        {(exploreSubsections.length > 0
                          ? exploreSubsections
                          : LIDAR_SUBSECTIONS
                        ).map((sub, idx) => (
                          <Link
                            key={idx}
                            href={`/it-services/${params.slug}/${sub.slug}`}
                            className="relative flex items-center justify-between p-4 text-sm group/item
                         bg-slate-800/50 hover:bg-slate-700/50
                         transition-all duration-300 ease-out border-l-2 border-transparent hover:border-blue-500"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono text-slate-600 group-hover/item:text-blue-400 transition-colors">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <span className="font-medium text-slate-300 group-hover/item:text-white transition-colors">
                                {sub.title}
                              </span>
                            </div>

                            {/* Always visible arrow */}
                            <ArrowRight className="size-4 text-slate-600 group-hover/item:text-blue-400 transform group-hover/item:translate-x-1 transition-all duration-300" />
                          </Link>
                        ))}
                      </nav>

                      {/* Footer */}
                      <div className="p-3 bg-slate-900/30 border-t border-slate-700/60 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                          Select to Learn More
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {!isLidarService && exploreSubsections.length > 0 && (
                <div className="relative group/card">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-900/60 via-blue-600/30 to-slate-900/60 rounded-xl blur opacity-70 group-hover/card:opacity-100 transition-opacity duration-500" />
                  <Card className="relative border border-slate-800 shadow-2xl bg-slate-950/95 backdrop-blur-xl overflow-hidden rounded-xl">
                    <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 border-b border-slate-800/70">
                      <div
                        className="absolute inset-0 opacity-[0.06]"
                        style={{
                          backgroundImage: `linear-gradient(#60a5fa 1px, transparent 1px), linear-gradient(90deg, #60a5fa 1px, transparent 1px)`,
                          backgroundSize: "22px 22px",
                        }}
                      />
                      <div className="relative flex items-center gap-4">
                        <div className="relative p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-xl shadow-inner shadow-blue-500/10">
                          <ChevronRight className="size-6 text-blue-300" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-100 text-base tracking-tight mb-1">
                            {exploreTitle}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="flex size-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <p className="text-xs font-medium text-slate-400">
                              {exploreSubsections.length} subsections
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-0">
                      <nav className="flex flex-col divide-y divide-slate-800/70">
                        {exploreSubsections.map((sub, idx) => (
                          <Link
                            key={sub.slug || idx}
                            href={`/it-services/${params.slug}/${sub.slug}`}
                            className="relative flex items-center justify-between p-4 text-sm group/item bg-slate-950/40 hover:bg-slate-900/50 transition-all duration-300 ease-out border-l-2 border-transparent hover:border-blue-500"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xs font-mono text-slate-700 group-hover/item:text-blue-400 transition-colors">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <span className="font-medium text-slate-200 group-hover/item:text-white transition-colors truncate">
                                {sub.title}
                              </span>
                            </div>
                            <ArrowRight className="size-4 text-slate-700 group-hover/item:text-blue-400 transform group-hover/item:translate-x-1 transition-all duration-300" />
                          </Link>
                        ))}
                      </nav>
                    </CardContent>
                  </Card>
                </div>
              )}
              {/* Standard CTA Card */}
              <Card className="border-border/40 bg-gradient-to-b from-background to-blue-50/30 backdrop-blur shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Ready to get started?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Contact us today to discuss how our {service.title}{" "}
                    services can help your business grow.
                  </p>
                  <Link href="/contact" className="block">
                    <Button className="w-full mb-4" size="lg">
                      Request a Consultation
                    </Button>
                  </Link>
                  <Link href="/it-services" className="block">
                    <Button variant="outline" className="w-full">
                      View All Services
                    </Button>
                  </Link>

                  {/* Related Services */}
                  {relatedServices.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-border">
                      <h4 className="font-semibold mb-4">Related Services</h4>
                      <div className="space-y-3">
                        {relatedServices.map((relatedService) => (
                          <Link
                            key={relatedService.id}
                            href={`/it-services/${generateServiceSlug(
                              relatedService.id,
                              relatedService.title
                            )}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors group"
                          >
                            <div className="size-12 rounded-lg overflow-hidden flex-shrink-0 border border-border/50">
                              <img
                                src={getImageUrl(relatedService.image, "/brand/abstract-grid.svg")}
                                alt={relatedService.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <span className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                              {relatedService.title}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 bg-gradient-to-r from-primary/5 to-blue-50/30">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's discuss how {service.title} can help you achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg">Contact Our Team</Button>
            </Link>
            <Link href="/it-services">
              <Button variant="outline" size="lg">
                Explore All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
