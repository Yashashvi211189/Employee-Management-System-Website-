"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  PlayCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { API_URL } from "@/lib/config";

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

interface GISService {
  id: string;
  slug?: string;
  title: string;
  description: string;
  image: string;
  features: string[];
  long_description?: string;
  benefits?: string[];
  technologies?: string[];
  demo_video_url?: string;
  developers?: number[];
  use_cases?: UseCase[];
  explore?: ExploreSection;
}

type TeamMember = {
  id: number;
  name: string;
  role: string;
  department?: string;
  image?: string;
};

export default function GISServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.slug as string;

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
  const [developers, setDevelopers] = useState<TeamMember[]>([]);
  const [related, setRelated] = useState<GISService[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleDeveloperClick = (developerName: string) => {
    const slug = generateSlug(developerName);
    setNavigatingTo(slug);
    setTimeout(() => {
      router.push(`/team/${slug}`);
    }, 150);
  };

  useEffect(() => {
    if (!serviceId) return;

    let cancelled = false;

    const fetchServiceDetails = async () => {
      try {
        // Fetch the specific service
        const response = await fetch(`${API_URL}/api/gis-services/${serviceId}/`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data: GISService = await response.json();
          if (!cancelled) setService(data);

          // Fetch developers
          if (Array.isArray(data.developers) && data.developers.length > 0) {
            const teamResponse = await fetch(`${API_URL}/api/team/`, {
              cache: "no-store",
            });
            if (teamResponse.ok) {
              const teamData: TeamMember[] = await teamResponse.json();
              const serviceDevelopers = teamData.filter((member) =>
                data.developers!.includes(member.id)
              );
              if (!cancelled) setDevelopers(serviceDevelopers);
            }
          } else {
            if (!cancelled) setDevelopers([]);
          }

          // Fetch all services for "Related Services"
          const allServicesResponse = await fetch(`${API_URL}/api/gis-services/`, {
            cache: "no-store",
          });
          if (allServicesResponse.ok) {
            const allData = await allServicesResponse.json();
            const allServices = Array.isArray(allData) ? allData : allData.results || [];
            const filteredRelated = allServices
              .filter((s: GISService) => s.id !== data.id)
              .slice(0, 3);
            if (!cancelled) setRelated(filteredRelated);
          }
        } else {
          if (!cancelled) setService(null);
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
        if (!cancelled) setService(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchServiceDetails();

    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  const extractYouTubeId = (url: string | undefined) => {
    if (!url) return null;
    const match = url.match(
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    );
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-emerald-50/20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">GIS Service Not Found</h1>
          <Link href="/gis-services">
            <Button>Back to GIS Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  const youtubeId = extractYouTubeId(service.demo_video_url);

  const explore = (service as any).explore as ExploreSection | undefined;
  const exploreTitle =
    typeof explore?.title === "string" && explore.title.trim()
      ? explore.title
      : `Explore ${service.title}`;
  const exploreSubsections = Array.isArray(explore?.subsections)
    ? explore!.subsections
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-emerald-50/20">
      {/* Hero */}
      <section className="relative w-full py-20 bg-gradient-to-br from-emerald-500/10 via-teal-50/30 to-green-50/20">
        <div className="container px-4 md:px-6">
          <Link
            href="/gis-services"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-emerald-600 mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to GIS Services
          </Link>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {service.title}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {service.description}
              </p>
              <div className="flex flex-wrap gap-3">
                {service.features && service.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={getImageUrl(service.image, "/brand/abstract-grid.svg")}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Detail */}
      <section className="w-full py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              {/* Overview */}
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Overview</h2>
              <p className="text-muted-foreground mb-12 leading-relaxed whitespace-pre-line">
                {service.long_description || service.description}
              </p>

              {/* Benefits */}
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Key Benefits
              </h2>
              <div className="grid sm:grid-cols-2 gap-6 mb-12">
                {service.benefits && service.benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="size-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">{benefit}</p>
                  </motion.div>
                ))}
              </div>

              {/* Technologies */}
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Technologies & Tools
              </h2>
              <div className="space-y-4 mb-12">
                {service.technologies && service.technologies.map((tech, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <ChevronRight className="size-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">{tech}</p>
                  </motion.div>
                ))}
              </div>

              {/* Our Expert Team */}
              {developers.length > 0 && (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Expert Team</h2>
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
                          <Card className="overflow-hidden border-border/40 hover:shadow-lg transition-all duration-300 hover:border-emerald-600/50 relative">
                            {isNavigating && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center"
                              >
                                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
                                <p className="text-xs text-muted-foreground">Loading profile...</p>
                              </motion.div>
                            )}
                            <CardContent className="p-0">
                              <div className="relative h-32 overflow-hidden">
                                <img
                                  src={getImageUrl(developer.image || "", "/brand/abstract-grid.svg")}
                                  alt={developer.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              </div>
                              <div className="p-3">
                                <h3 className="font-semibold text-sm mb-1 group-hover:text-emerald-600 transition-colors">
                                  {developer.name}
                                </h3>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {developer.role}
                                </p>
                                {developer.department && (
                                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                                    {developer.department}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Use Cases */}
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

              {/* Demo Video */}
              {service.demo_video_url && (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                    <PlayCircle className="size-8 text-emerald-600" />
                    Demo
                  </h2>
                  <div className="mb-12">
                    {youtubeId ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          title="Demo"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <Card className="p-6 border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold mb-2">
                              Watch the demo
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
                              Watch
                              <ExternalLink className="ml-2 size-4" />
                            </a>
                          </Button>
                        </div>
                      </Card>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8 lg:sticky lg:top-24 h-fit">
              {exploreSubsections.length > 0 && (
                <div className="rounded-lg bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-white/20 bg-black/10 backdrop-blur-sm">
                    <h3 className="text-base font-bold tracking-tight">
                      {exploreTitle}
                    </h3>
                    <p className="text-xs text-white/80 mt-1">
                      Choose a subsection to explore
                    </p>
                  </div>
                  <div className="divide-y divide-white/20">
                    {exploreSubsections.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/gis-services/${service.slug || service.id}/${sub.slug}`}
                        className="group relative flex items-center justify-between p-4 text-sm font-medium transition-all duration-300 hover:pl-6 hover:bg-white/20 hover:backdrop-blur-md"
                      >
                        <span className="absolute left-0 w-1 h-0 bg-yellow-300 group-hover:h-6 transition-all duration-300" />
                        <span className="truncate">{sub.title}</span>
                        <ChevronRight className="size-4 text-white/80 group-hover:text-yellow-300 group-hover:translate-x-1 transition-all duration-300" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-1 shadow-xl">
                <div className="bg-background/90 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="size-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg animate-pulse flex items-center justify-center">
                      <ExternalLink className="size-5 text-white" />
                    </div>
                  </div>

                  <h3 className="text-center text-lg font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Need Expert Advice?
                  </h3>
                  <p className="text-center text-sm text-muted-foreground mb-6">
                    Our GIS specialists are available to assist you.
                  </p>

                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link href="/contact">Contact Us</Link>
                  </Button>

                  <div className="mt-6 grid gap-3">
                    <Button asChild variant="outline" className="w-full rounded-xl">
                      <Link href="/gis-services">View All GIS Services</Link>
                    </Button>
                  </div>

                  {related.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-border/50">
                      <h4 className="text-sm font-bold mb-4">Related Services</h4>
                      <div className="space-y-3">
                        {related.map((rel) => (
                          <Link
                            key={rel.id}
                            href={`/gis-services/${rel.slug || rel.id}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                          >
                            <div className="size-12 rounded-lg overflow-hidden flex-shrink-0 border border-border/50">
                              <img
                                src={getImageUrl(rel.image, "/brand/abstract-grid.svg")}
                                alt={rel.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <span className="text-sm font-medium group-hover:text-emerald-600 line-clamp-2">
                              {rel.title}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="w-full py-16 bg-gradient-to-r from-emerald-500/5 to-teal-50/30">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Harness the power of geospatial data
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let’s discuss how our GIS expertise can bring clarity to your next
            project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                Contact Our Team
              </Button>
            </Link>
            <Link href="/gis-services">
              <Button variant="outline" size="lg">
                Explore All GIS Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
