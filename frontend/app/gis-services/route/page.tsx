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

type GISService = {
  id: string;
  slug?: string;
  title: string;
  description: string;
  image: string;
  explore?: ExploreSection;
};

type TeamMember = {
  id: number;
  name: string;
  role: string;
  department?: string;
  image?: string;
};

export default function GISExploreSubsectionPage() {
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

  const [service, setService] = useState<GISService | null>(null);
  const [subsection, setSubsection] = useState<ExploreSubsection | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/api/gis-services/${serviceSlug}/`, {
          cache: "no-store",
        });

        if (!res.ok) {
          if (!cancelled) {
            setService(null);
            setSubsection(null);
            setTeam([]);
          }
          return;
        }

        const data: GISService = await res.json();
        const explore = (data as any).explore as ExploreSection | undefined;
        const subs = Array.isArray(explore?.subsections) ? explore!.subsections : [];
        const match = subs.find((s) => s.slug === subsectionSlug) || null;

        if (!cancelled) {
          setService(data);
          setSubsection(match);
          setActiveImageIdx(0);
          setTeam([]);
        }

        const devIds = Array.isArray(match?.developers) ? match!.developers! : [];
        if (devIds.length > 0) {
          const teamRes = await fetch(`${API_URL}/api/team/`, { cache: "no-store" });
          if (teamRes.ok) {
            const teamData: TeamMember[] = await teamRes.json();
            const filtered = teamData.filter((m) => devIds.includes(m.id));
            if (!cancelled) setTeam(filtered);
          }
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

  const exploreTitle = useMemo(() => {
    const t = (service as any)?.explore?.title;
    if (typeof t === "string" && t.trim()) return t;
    return service ? `Explore ${service.title}` : "Explore";
  }, [service]);

  const exploreSubsections = useMemo(() => {
    const subs = (service as any)?.explore?.subsections;
    return Array.isArray(subs) ? (subs as ExploreSubsection[]) : [];
  }, [service]);

  const images = useMemo(() => {
    const raw = subsection?.images || [];
    return raw.map((u) => getImageUrl(u, "/brand/abstract-grid.svg")).filter(Boolean);
  }, [subsection]);

  const heroImage = images[activeImageIdx] || getImageUrl(service?.image, "/brand/abstract-grid.svg");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!service || !subsection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Subsection not found</h1>
          <Link href={`/gis-services/${serviceSlug}`}>
            <Button>Back to GIS Service</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-emerald-50/20">
      <section className="relative w-full py-10 md:py-14">
        <div className="container px-4 md:px-6">
          <Link
            href={`/gis-services/${service.slug || service.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-emerald-600 mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to {service.title}
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
                    idx === activeImageIdx ? "border-emerald-600" : "border-border/50"
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
                  {subsection.description || service.description}
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

            <div className="space-y-6 sticky top-24 h-fit">
              <Card className="border-border/40 bg-gradient-to-b from-emerald-600/10 to-teal-50/30">
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold mb-3">{exploreTitle}</h3>
                  <div className="divide-y rounded-xl overflow-hidden border border-border/40 bg-background">
                    {exploreSubsections.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/gis-services/${service.slug || service.id}/${sub.slug}`}
                        className={`flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-muted/40 transition-colors ${
                          sub.slug === subsection.slug ? "bg-muted/50" : ""
                        }`}
                      >
                        <span className="line-clamp-1">{sub.title}</span>
                        <ChevronRight className="size-4 text-emerald-600" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-background">
                <CardContent className="p-6 text-center">
                  <h3 className="text-base font-bold mb-2">Need Expert Advice?</h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    Our GIS specialists are available to assist you.
                  </p>
                  <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/contact">
                      Contact Us <ExternalLink className="ml-2 size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}