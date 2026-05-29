"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, ExternalLink } from "lucide-react";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type UseCase = {
  image: string;
  title: string;
  description: string;
  layout?: "image_left" | "image_right";
};

type ExploreSubsection = {
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  images?: string[];
  technologies?: string[];
  developers?: number[];
  use_cases?: UseCase[];
};

type ExploreSection = {
  title: string;
  subsections: ExploreSubsection[];
};

type ITService = {
  id: string;
  title: string;
  description: string;
  image?: string;
  status?: string;
  explore?: ExploreSection;
};

type SubsectionApiResponse = {
  service_slug: string;
  service_title: string;
  explore_title?: string;
  subsection: ExploreSubsection;
};

type TeamMember = {
  id: number;
  name: string;
  role: string;
  department?: string;
  image?: string;
};

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

export default function ITExploreSubsectionPage() {
  const params = useParams();
  const serviceSlug = params.slug as string;
  const subsectionSlug = params.subsection as string;

  const sanitizeRemoteUrl = (value?: string | null) => {
    if (!value) return "";
    const trimmed = value.trim();
    return trimmed.replace(/^`+/, "").replace(/`+$/, "").trim();
  };

  const getImageUrl = (imagePath?: string | null, fallback = "/brand/abstract-grid.svg") => {
    const cleaned = sanitizeRemoteUrl(imagePath);
    if (!cleaned) return fallback;
    if (cleaned.startsWith("http")) return cleaned;
    const normalized = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    return `${API_URL}${normalized}`;
  };

  const [service, setService] = useState<ITService | null>(null);
  const [subsection, setSubsection] = useState<ExploreSubsection | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [exploreTitleFromApi, setExploreTitleFromApi] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);

        const [subRes, svcRes] = await Promise.all([
          fetch(`${API_URL}/api/services/${serviceSlug}/${subsectionSlug}/`, {
            cache: "no-store",
          }),
          fetch(`${API_URL}/api/services/${serviceSlug}/`, {
            cache: "no-store",
          }),
        ]);

        let subsectionData: ExploreSubsection | null = null;
        if (subRes.ok) {
          const data: SubsectionApiResponse = await subRes.json();
          subsectionData = data?.subsection || null;
          if (!cancelled) {
            setSubsection(subsectionData);
            setExploreTitleFromApi(typeof data?.explore_title === "string" ? data.explore_title : "");
          }
        } else {
          if (!cancelled) {
            setSubsection(null);
            setExploreTitleFromApi("");
          }
        }

        if (svcRes.ok) {
          const svc: ITService = await svcRes.json();
          if (!cancelled) setService(svc);
        } else {
          if (!cancelled) setService(null);
        }

        const devIds = Array.isArray(subsectionData?.developers)
          ? subsectionData!.developers!
          : [];
        if (devIds.length > 0) {
          const teamRes = await fetch(`${API_URL}/api/team/`, {
            cache: "no-store",
          });
          if (teamRes.ok) {
            const teamData: TeamMember[] = await teamRes.json();
            const filtered = teamData.filter((m) => devIds.includes(m.id));
            if (!cancelled) setTeam(filtered);
          } else {
            if (!cancelled) setTeam([]);
          }
        } else {
          if (!cancelled) setTeam([]);
        }
      } catch {
        if (!cancelled) {
          setService(null);
          setSubsection(null);
          setTeam([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (serviceSlug && subsectionSlug) run();

    return () => {
      cancelled = true;
    };
  }, [serviceSlug, subsectionSlug]);

  const isLidarService = useMemo(() => {
    if (!service?.title) return false;
    return service.title.toLowerCase().includes("lidar");
  }, [service?.title]);

  const exploreTitle = useMemo(() => {
    if (exploreTitleFromApi.trim()) return exploreTitleFromApi.trim();
    const t = (service as any)?.explore?.title;
    if (typeof t === "string" && t.trim()) return t;
    return service ? `Explore ${service.title}` : "Explore";
  }, [exploreTitleFromApi, service]);

  const exploreSubsections = useMemo(() => {
    const subs = (service as any)?.explore?.subsections;
    if (Array.isArray(subs)) return subs as ExploreSubsection[];
    if (isLidarService) return LIDAR_SUBSECTIONS as unknown as ExploreSubsection[];
    return [];
  }, [service, isLidarService]);

  const images = useMemo(() => {
    const raw = subsection?.images || [];
    return raw.map((u) => getImageUrl(u, "/brand/abstract-grid.svg")).filter(Boolean);
  }, [subsection]);

  const heroImage = images[activeImageIdx] || getImageUrl(service?.image || "", "/brand/abstract-grid.svg");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!subsection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Subsection not found</h1>
          <Link href={`/it-services/${serviceSlug}`}>
            <Button>Back to IT Service</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-50/20">
      <section className="relative w-full py-10 md:py-14">
        <div className="container px-4 md:px-6">
          <Link
            href={`/it-services/${service?.id || serviceSlug}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-blue-600 mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to {service?.title || serviceSlug}
          </Link>

          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <div className="relative h-48 md:h-72">
              <img src={heroImage} alt={subsection.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute left-6 bottom-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{subsection.title}</h1>
                {subsection.short_description && (
                  <p className="text-white/85 mt-2 max-w-2xl">{subsection.short_description}</p>
                )}
              </div>
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-auto pb-2">
              {images.map((src, idx) => (
                <button
                  key={src + idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`shrink-0 rounded-lg overflow-hidden border ${
                    idx === activeImageIdx ? "border-blue-600" : "border-border/50"
                  }`}
                >
                  <img src={src} alt="thumb" className="w-28 h-16 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="w-full pb-16">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-10">
              <div>
                <h2 className="text-2xl font-bold mb-3">Overview</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {subsection.description || ""}
                </p>
              </div>

              {(subsection.technologies?.length || 0) > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-3">Technicals</h2>
                  <div className="flex flex-wrap gap-2">
                    {subsection.technologies!.map((t, idx) => (
                      <Badge key={idx} variant="outline">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(subsection.use_cases?.length || 0) > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
                  <div className="space-y-10">
                    {subsection.use_cases!.map((uc, idx) => {
                      const layout = uc.layout ?? (idx % 2 === 0 ? "image_left" : "image_right");
                      const isImageLeft = layout === "image_left";
                      return (
                        <motion.div
                          key={`${uc.title}-${idx}`}
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4 }}
                          className="grid md:grid-cols-2 gap-8 items-center"
                        >
                          <div className={isImageLeft ? "order-1" : "order-2"}>
                            <div className="rounded-2xl overflow-hidden border border-border/50 bg-muted shadow-lg">
                              <img
                                src={getImageUrl(uc.image, "/brand/abstract-grid.svg")}
                                alt={uc.title}
                                className="w-full h-64 md:h-80 object-cover"
                              />
                            </div>
                          </div>
                          <div className={isImageLeft ? "order-2" : "order-1"}>
                            <h3 className="text-xl font-bold mb-2">{uc.title}</h3>
                            <p className="text-muted-foreground whitespace-pre-line">{uc.description}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(team.length || 0) > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Team Members</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {team.map((m) => (
                      <Card key={m.id} className="overflow-hidden border-border/40">
                        <CardContent className="p-0">
                          <div className="h-28 bg-muted overflow-hidden">
                            <img
                              src={getImageUrl(m.image || "", "/brand/abstract-grid.svg")}
                              alt={m.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-3">
                            <div className="font-semibold text-sm">{m.name}</div>
                            <div className="text-xs text-muted-foreground">{m.role}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8 lg:sticky lg:top-24 h-fit">
              {exploreSubsections.length > 0 && (
                <div className="rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white shadow-2xl overflow-hidden border border-slate-800/70">
                  <div className="p-6 border-b border-slate-800/70 bg-black/20 backdrop-blur-sm">
                    <h3 className="text-base font-bold tracking-tight">{exploreTitle}</h3>
                    <p className="text-xs text-white/70 mt-1">Choose a subsection to explore</p>
                  </div>
                  <div className="divide-y divide-slate-800/70">
                    {(exploreSubsections as any[]).map((sub) => {
                      const slug = String(sub.slug || "");
                      const title = String(sub.title || "");
                      const isActive = slug === subsection.slug;
                      return (
                        <Link
                          key={slug}
                          href={`/it-services/${serviceSlug}/${slug}`}
                          className={`group relative flex items-center justify-between p-4 text-sm font-medium transition-all duration-300 hover:pl-6 hover:bg-white/10 hover:backdrop-blur-md ${
                            isActive ? "bg-white/10" : ""
                          }`}
                        >
                          <span
                            className={`absolute left-0 w-1 bg-blue-400 transition-all duration-300 ${
                              isActive ? "h-6" : "h-0 group-hover:h-6"
                            }`}
                          />
                          <span className="truncate">{title}</span>
                          <ChevronRight className="size-4 text-white/70 group-hover:text-blue-300 group-hover:translate-x-1 transition-all duration-300" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-1 shadow-xl">
                <div className="bg-background/90 backdrop-blur-sm rounded-xl p-6 border border-slate-200/20">
                  <div className="flex items-center justify-center mb-4">
                    <div className="size-12 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 shadow-lg animate-pulse flex items-center justify-center">
                      <ExternalLink className="size-5 text-white" />
                    </div>
                  </div>

                  <h3 className="text-center text-lg font-bold mb-2 bg-gradient-to-r from-blue-600 to-slate-900 bg-clip-text text-transparent">
                    Need Expert Advice?
                  </h3>
                  <p className="text-center text-sm text-muted-foreground mb-6">
                    Our IT specialists are available to assist you.
                  </p>

                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-slate-950 to-blue-700 hover:from-slate-900 hover:to-blue-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
