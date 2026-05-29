"use client";

import { API_URL } from "@/lib/config";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState, useEffect, useRef, Suspense } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Check,
  ArrowRight,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Play,
  TrendingUp,
  Target,
  Zap,
  Shield,
  Users,
  Clock,
  ChevronRight,
  ChevronLeft,
  Star,
  Award,
  Cpu,
  Database,
  Globe,
  ExternalLink,
  Watch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
// Demo video CTA intentionally removed to avoid shipping legacy placeholder media.

const HERO_VIDEO_SRC =
  "/Hero Section Video/AI_and_Human_Collaboration_Video_Generation.mp4";

interface Testimonial {
  id: number;
  name: string;
  company: string;
  role: string;
  text: string;
  image: string;
  linkedin: string;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("ai");
  const [activeCert, setActiveCert] = useState<number | null>(null);
  const benefitsScrollerRef = useRef<HTMLDivElement>(null);

  const scrollBenefitsBy = (direction: 1 | -1) => {
    const el = benefitsScrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const isStatsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const isBenefitsInView = useInView(benefitsRef, { once: true, amount: 0.3 });
  const isServicesInView = useInView(servicesRef, { once: true, amount: 0.3 });
  const isCtaInView = useInView(ctaRef, { once: true, amount: 0.3 });

  const { scrollYProgress } = useScroll({
    target: typeof window !== "undefined" ? heroRef : undefined,
    offset: ["start start", "end start"],
  });

  const yRange = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    setMounted(true);
    if (videoRef.current) {
      videoRef.current.addEventListener("loadeddata", () => {
        setVideoLoaded(true);
      });
      videoRef.current.load();
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const certifications = [
    {
      name: "Responsible AI",
      logo: "/brand/ai-robot.svg",
      certificateNo: "RAI-01",
      issuedBy: "Nilaya AI Principles",
      validity: "Ongoing",
      description: "Ethical AI use with transparency and oversight.",
    },
    {
      name: "Security-First",
      logo: "/brand/automation.svg",
      certificateNo: "SEC-07",
      issuedBy: "Security Program",
      validity: "Annual Review",
      description: "Secure development and access control practices.",
    },
    {
      name: "Data Governance",
      logo: "/brand/data-viz.svg",
      certificateNo: "DG-12",
      issuedBy: "Data Stewardship",
      validity: "Ongoing",
      description: "Policies for data quality, lineage, and retention.",
    },
    {
      name: "Quality Engineering",
      logo: "/brand/workspace.svg",
      certificateNo: "QE-04",
      issuedBy: "Delivery Ops",
      validity: "Continuous",
      description: "Automated testing and release readiness standards.",
    },
    {
      name: "Compliance Ready",
      logo: "/brand/document.svg",
      certificateNo: "CR-09",
      issuedBy: "Client Alignment",
      validity: "Project-based",
      description: "Aligned to client policies and industry needs.",
    },
    {
      name: "Observability",
      logo: "/brand/llm.svg",
      certificateNo: "OBS-03",
      issuedBy: "Reliability Lab",
      validity: "Continuous",
      description: "Monitoring, tracing, and incident response playbooks.",
    },
    {
      name: "Privacy by Design",
      logo: "/brand/abstract-grid.svg",
      certificateNo: "PBD-05",
      issuedBy: "Privacy Office",
      validity: "Ongoing",
      description: "Privacy safeguards embedded from day one.",
    },
  ];

  const keyBenefits = [
    {
      title: "Workflow Acceleration",
      description:
        "Automate repetitive tasks and move from idea to execution in days, not months.",
      icon: <Zap className="size-6" />,
      image: "/brand/automation.svg",
    },
    {
      title: "Decision Intelligence",
      description:
        "Unify your data and unlock real-time insights for confident, AI-assisted decisions.",
      icon: <Target className="size-6" />,
      image: "/brand/data-viz.svg",
    },
    {
      title: "Scalable Systems",
      description:
        "Deploy robust architectures that grow with your business and stay reliable under load.",
      icon: <TrendingUp className="size-6" />,
      image: "/brand/llm.svg",
    },
  ];

  const [projects, setProjects] = useState<Array<{ client?: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/api/projects/`);
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setTestimonialsLoading(true);
        const response = await fetch(`${API_URL}/api/testimonials/`);
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const uniqueClients = new Set(
    projects
      .map((project) => project.client?.trim())
      .filter((client) => client && client !== "")
  ).size;

  const stats = [
    {
      number: "50+",
      label: "AI Solutions Delivered",
      icon: <Cpu className="size-6" />,
    },
    {
      number: "95%",
      label: "Client Satisfaction",
      icon: <Star className="size-6" />,
    },
    {
      number: "24/7",
      label: "Automation Support",
      icon: <Clock className="size-6" />,
    },
    {
      number: "10+",
      label: "Industries Served",
      icon: <Globe className="size-6" />,
    },
  ];

  const services = {
    ai: [
      "AI Workflow Automation",
      "Custom AI Applications",
      "LLM Integration",
      "API Development",
      "Data Processing Systems",
      "AI Chatbots",
      "Document Intelligence",
    ],
    web: [
      "Intelligent Web Portals",
      "Knowledge & Support Hubs",
      "Customer Experience Apps",
      "Secure API Gateways",
      "Automation Dashboards",
    ],
    mobile: [
      "Field Operations Assistants",
      "AI-Powered Mobile UX",
      "Cross-platform Delivery",
      "Secure Offline Sync",
      "On-device Insights",
    ],
    cloud: [
      "Scalable MLOps Pipelines",
      "Real-time Data Streams",
      "Enterprise Observability",
      "Compliance & Governance",
      "Resilient Cloud Infrastructure",
    ],
  };

  const showcaseSections = [
    {
      image: "/brand/team-collab.svg",
      title: "Collaborative Pods",
      description:
        "Cross-functional squads align quickly, prototype fast, and deliver measurable outcomes.",
    },
    {
      image: "/brand/workspace.svg",
      title: "Design-First Spaces",
      description:
        "A calm, modern environment that keeps focus on outcomes and elegant execution.",
    },
    {
      image: "/brand/data-viz.svg",
      title: "Experiment to Impact",
      description:
        "We iterate in tight loops, proving value early and scaling what works.",
    },
  ];

  // Helper functions for testimonials
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/brand/avatar.svg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  const toggleReadMore = (index: number) => {
    setExpandedCards((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleNextTestimonial = () => {
    const cardsPerView = 3;
    setStartIndex((prev) =>
      prev + cardsPerView >= testimonials.length
        ? 0
        : prev + cardsPerView
    );
  };

  const handlePrevTestimonial = () => {
    const cardsPerView = 3;
    setStartIndex((prev) =>
      prev - cardsPerView < 0
        ? testimonials.length - cardsPerView
        : prev - cardsPerView
    );
  };

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Hero Section */}
      <div ref={heroRef} className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{
              willChange: "auto",
              transform: "translate3d(0, 0, 0)",
            }}
            onLoadedData={() => setVideoLoaded(true)}
          >
            <source src={HERO_VIDEO_SRC} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {!videoLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-blue-600/30 to-purple-600/20" />
          )}

          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden opacity-20">
          <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
        </div>

        <div className="relative z-10 h-full flex items-center justify-center">
          {mounted ? (
            <motion.div
              style={{ y: yRange }}
              className="container px-4 md:px-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center max-w-4xl mx-auto"
              >
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-white drop-shadow-2xl"
                >
                  Build Intelligent Systems with{" "}
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent"
                  >
                    Nilaya AI
                  </motion.span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-xl md:text-2xl lg:text-3xl text-white/95 mb-8 max-w-3xl mx-auto drop-shadow-lg"
                >
                  Automate workflows, enhance decisions, and scale faster using AI-powered solutions.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/contact">
                      <Button
                        size="lg"
                        className="rounded-full h-12 sm:h-14 px-6 sm:px-10 text-sm sm:text-lg bg-white/95 text-primary hover:bg-white backdrop-blur-sm shadow-2xl group transition-all duration-300 w-full sm:w-auto"
                      >
                        <span className="flex items-center gap-2">
                          <span className="hidden sm:inline">
                            Start Free Consultation
                          </span>
                          <span className="sm:hidden">Free Consultation</span>
                          <Calendar className="size-4 sm:size-5 transition-transform group-hover:scale-110" />
                        </span>
                      </Button>
                    </Link>
                    {/* View-demo modal removed */}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <div className="container px-4 md:px-6 text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-white drop-shadow-2xl">
                Build Intelligent Systems with{" "}
                <span className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                  Nilaya AI
                </span>
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-white/95 mb-8 max-w-3xl mx-auto drop-shadow-lg">
                Automate workflows, enhance decisions, and scale faster using AI-powered solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/contact">
                    <Button
                      size="lg"
                      className="rounded-full h-12 sm:h-14 px-6 sm:px-10 text-sm sm:text-lg bg-white/95 text-primary hover:bg-white backdrop-blur-sm shadow-2xl group transition-all duration-300 w-full sm:w-auto"
                    >
                      <span className="flex items-center gap-2">
                        <span className="hidden sm:inline">
                          Start Free Consultation
                        </span>
                        <span className="sm:hidden">Free Consultation</span>
                        <Calendar className="size-4 sm:size-5" />
                      </span>
                    </Button>
                  </Link>

                  <Link href="/products">
                    <Button
                      size="lg"
                      className="rounded-full h-14 px-10 text-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-300"
                    >
                      Explore Solutions
                      <ArrowRight className="ml-2 size-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center animate-bounce">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="w-full py-24 relative overflow-hidden bg-gradient-to-b from-background via-background/95 to-background"
      >
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={
              isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Our Impact in Numbers
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Delivering exceptional results that speak for themselves
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{
                  scale: 1.03,
                }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-2xl transform group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-3 md:p-6 rounded-2xl shadow-xl overflow-hidden h-full flex flex-col items-center justify-center transform transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isStatsInView ? { scale: 1 } : { scale: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.1 + 0.2,
                      type: "spring",
                    }}
                    className="size-12 md:size-16 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-primary mb-2 md:mb-4 group-hover:from-primary/30 group-hover:to-blue-500/30 transition-all duration-300"
                  >
                    {stat.icon}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={
                      isStatsInView
                        ? { opacity: 1, scale: 1 }
                        : { opacity: 0, scale: 0.8 }
                    }
                    transition={{ duration: 0.4, delay: i * 0.1 + 0.3 }}
                    className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-1 md:mb-2"
                  >
                    {stat.number}
                  </motion.div>

                  <p className="text-muted-foreground font-medium text-center text-xs md:text-sm">
                    {stat.label}
                  </p>

                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={isStatsInView ? { width: "100%" } : { width: 0 }}
                    transition={{ duration: 0.8, delay: i * 0.1 + 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nilaya AI Solutions Section */}
      <section className="w-full py-24 relative overflow-hidden bg-gradient-to-b from-background to-blue-50/30">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(147,51,234,0.08),transparent_70%)]"></div>
        </div>

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, type: "spring" }}
                className="size-16 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center mx-auto mb-4"
              >
                <Cpu className="size-8 text-primary" />
              </motion.div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold inline-block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Nilaya AI Solutions
            </h2>

            <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
              Modular products that connect data, teams, and intelligent automation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 relative z-10">
            {/* FlowGrid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="group relative h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

              <Card className="relative overflow-hidden rounded-3xl shadow-xl border border-border/40 backdrop-blur bg-white/80 h-full flex flex-col">
                <div className="relative h-72 w-full overflow-hidden rounded-t-3xl flex-shrink-0">
                  <Image
                    src="/brand/workspace.svg"
                    alt="FlowGrid Orchestration"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold">FlowGrid</h3>
                    <p className="text-white/80 text-sm">
                      Workflow Orchestration Platform
                    </p>
                  </div>
                </div>

                <CardContent className="p-6 flex flex-col flex-grow">
                  <p className="text-muted-foreground mb-4 flex-grow">
                    An orchestration layer that automates approvals, routes work, and keeps teams in sync across tools.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {["Smart Routing", "Multi-tool Sync", "Approval Logic", "Ops Analytics"].map((i, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-primary/10 to-blue-500/10 border border-border/40"
                      >
                        {i}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link href="/products" className="flex-1">
                      <Button className="rounded-full w-full group">
                        Explore FlowGrid
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link
                      href="/contact"
                      className="flex-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="rounded-full w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        Request Demo
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* SignalIQ */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="group relative h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

              <Card className="relative overflow-hidden rounded-3xl shadow-xl border border-border/40 backdrop-blur bg-white/80 h-full flex flex-col">
                <div className="relative h-72 w-full overflow-hidden rounded-t-3xl flex-shrink-0">
                  <Image
                    src="/brand/data-viz.svg"
                    alt="SignalIQ Analytics"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold">SignalIQ</h3>
                    <p className="text-white/80 text-sm">
                      Real-time Analytics Suite
                    </p>
                  </div>
                </div>

                <CardContent className="p-6 flex flex-col flex-grow">
                  <p className="text-muted-foreground mb-4 flex-grow">
                    A unified analytics layer delivering live metrics, forecasts, and operational insights.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {["Unified Metrics", "Alerting", "Forecasting", "Executive Dashboards"].map((i, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-border/40"
                      >
                        {i}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link href="/products" className="flex-1">
                      <Button className="rounded-full w-full group">
                        Explore SignalIQ
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link
                      href="/contact"
                      className="flex-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="rounded-full w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                      >
                        Request Demo
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="w-full py-24 relative overflow-visible bg-gradient-to-b from-background to-blue-50/30">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(147,51,234,0.1),transparent_70%)]"></div>
        </div>

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, type: "spring" }}
                className="size-16 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center mx-auto mb-4"
              >
                <Award className="size-8 text-primary" />
              </motion.div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Trust & Governance
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our operating standards prioritize trust, security, and responsible AI.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6 relative z-30 overflow-visible">
            {certifications.map((cert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, rotateY: 30 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group relative"
                onMouseEnter={() => setActiveCert(i)}
                onMouseLeave={() => setActiveCert(null)}
              >
                <div
                  className="relative bg-white rounded-xl shadow-lg border border-blue-100 p-4 md:p-6 h-full transform-gpu transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 flex flex-col items-center justify-center text-center cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setActiveCert(activeCert === i ? null : i);
                    }
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>

                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 + 0.2 }}
                    className="size-8 md:size-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary"
                  >
                    <Check className="size-4 md:size-5" />
                  </motion.div>

                  <p className="font-medium text-sm md:text-base relative z-10 leading-tight">
                    {cert.name}
                  </p>

                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.05 + 0.3 }}
                  />
                </div>

                <AnimatePresence>
                  {activeCert === i && (
                    <>
                      <div
                        className="fixed inset-0 bg-black/30 z-30 md:hidden"
                        onClick={() => setActiveCert(null)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ duration: 0.25 }}
                        className="absolute z-40 w-full max-w-[260px] md:w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                        style={{
                          top: "calc(100% + 12px)",
                          left: "50%",
                          transform: "translateX(-50%)",
                          ...(typeof window !== "undefined" && window.innerWidth <= 430 && {
                            width: "92vw",
                            transform: "none",
                            ...(i % 2 === 0 ? { left: "5vw" } : { right: "5vw", left: "auto" }),
                          }),
                          ...(typeof window !== "undefined" && window.innerWidth > 430 && {
                            left: "50%",
                            transform: "translateX(-50%)",
                            ...(i % 7 >= 5 && { left: "auto", right: "0", transform: "none" }),
                            ...(i % 7 <= 1 && { left: "0", transform: "none" }),
                          }),
                        }}
                      >
                        <div className="relative h-40 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                          <Image
                            src={cert.logo}
                            alt={`${cert.name} Logo`}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                parent.className = "relative h-40 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden flex items-center justify-center";
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-black/5"></div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div>
                            <h4 className="font-bold text-sm text-gray-900">{cert.name}</h4>
                            <p className="text-xs text-gray-600 mt-1">{cert.description}</p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500">Certificate No:</span>
                              <span className="font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded border text-xs">
                                {cert.certificateNo || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500">Issued By:</span>
                              <span className="text-gray-900 text-right font-medium max-w-[120px] truncate">
                                {cert.issuedBy || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500">Validity:</span>
                              <span
                                className={cn(
                                  "font-medium px-2 py-1 rounded border text-xs",
                                  cert.validity === "Lifetime" || cert.validity === "Permanent" || cert.validity === "Active"
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : "bg-blue-100 text-blue-700 border-blue-200"
                                )}
                              >
                                {cert.validity || "N/A"}
                              </span>
                            </div>
                          </div>

                          <div className="md:hidden pt-2">
                            <button
                              onClick={() => setActiveCert(null)}
                              className="w-full py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-12 relative z-10"
          >
            <Button
              variant="outline"
              className="rounded-full border-primary/20 hover:border-primary/40 bg-white/50 backdrop-blur-sm"
              size="lg"
            >
              View All Certifications
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section
        ref={benefitsRef}
        className="w-full py-24 relative overflow-hidden bg-gradient-to-b from-blue-50/30 to-background"
      >
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_70%)]"></div>
        </div>

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isBenefitsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
              Why Nilaya AI
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A pragmatic AI partner focused on outcomes, reliability, and speed.
            </p>
          </motion.div>

          <div className="relative overflow-hidden">
            <div className="grid md:grid-cols-3 md:gap-8 overflow-hidden md:overflow-visible">
              <div
                ref={benefitsScrollerRef}
                className="flex md:contents gap-4 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory w-full scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {keyBenefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 50, rotateX: 10 }}
                    animate={isBenefitsInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: 10 }}
                    transition={{ duration: 0.6, delay: i * 0.2 }}
                    whileHover={{ scale: 1.03, rotateY: 5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                    className="group perspective snap-start w-full min-w-full md:w-auto md:min-w-0"
                  >
                    <div className="relative h-full transform-gpu transition-all duration-500 preserve-3d">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-2xl transform group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500"></div>

                      <Card className="h-full overflow-hidden border-border/40 bg-white backdrop-blur transition-all duration-300 group-hover:shadow-xl relative z-10">
                        <div className="relative h-56 overflow-hidden">
                          <motion.div
                            initial={{ scale: 1.2 }}
                            animate={isBenefitsInView ? { scale: 1 } : { scale: 1.2 }}
                            transition={{ duration: 0.8, delay: i * 0.2 }}
                            className="relative w-full h-full"
                          >
                            <Image
                              src={benefit.image}
                              alt={benefit.title}
                              fill
                              className="object-contain bg-white p-4 transition-transform duration-700 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 33vw"
                              loading="lazy"
                            />
                          </motion.div>
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-transparent" />
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isBenefitsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.6, delay: i * 0.2 + 0.3 }}
                            className="absolute bottom-4 left-4"
                          >
                            <div className="size-14 rounded-xl bg-white/90 flex items-center justify-center text-primary shadow-lg group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                              {benefit.icon}
                            </div>
                          </motion.div>
                        </div>

                        <CardContent className="p-6 relative">
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={isBenefitsInView ? { width: "40%" } : { width: "0%" }}
                            transition={{ duration: 0.8, delay: i * 0.2 + 0.4 }}
                            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-blue-500"
                          />
                          <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                            {benefit.title}
                          </h3>
                          <p className="text-muted-foreground">{benefit.description}</p>
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={isBenefitsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                            transition={{ duration: 0.6, delay: i * 0.2 + 0.5 }}
                            className="mt-6"
                          >
                            <Link
                              href="#"
                              className="inline-flex items-center text-primary font-medium group/link"
                            >
                              Learn more
                              <ChevronRight className="ml-1 size-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                            </Link>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="md:hidden pointer-events-none">
              <button
                onClick={() => scrollBenefitsBy(-1)}
                className="pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-primary"
                aria-label="Previous"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={() => scrollBenefitsBy(1)}
                className="pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-primary"
                aria-label="Next"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Testimonials</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear what our clients and partners have to say about working with us
            </p>
          </div>

          {testimonialsLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {!testimonialsLoading && testimonials.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No testimonials available at the moment.</p>
            </div>
          )}

          {!testimonialsLoading && testimonials.length > 0 && (
            <div className="relative max-w-6xl mx-auto">
              {/* Calculate testimonial display variables */}
              {(() => {
                const cardsPerView = 3;
                const totalGroups = Math.ceil(testimonials.length / cardsPerView);
                const visibleTestimonials = testimonials.slice(startIndex, startIndex + cardsPerView);
                const showLeftArrow = startIndex > 0;
                const showRightArrow = startIndex + cardsPerView < testimonials.length;

                return (
                  <>
                    {/* Cards Container */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {visibleTestimonials.map((t, i) => {
                        const isExpanded = expandedCards.includes(i);
                        const shouldTruncate = t.text.length > 180;
                        const displayText = shouldTruncate && !isExpanded
                          ? t.text.substring(0, 180) + "..."
                          : t.text;

                        return (
                          <div
                            key={t.id}
                            className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/20 overflow-hidden flex flex-col"
                          >
                            <div className="h-2 bg-gradient-to-r from-primary via-blue-500 to-cyan-400"></div>
                            <div className="p-8 flex-1 flex flex-col">
                              <div className="mb-6 flex justify-center">
                                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <svg className="size-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                  </svg>
                                </div>
                              </div>

                              <div className="flex-1">
                                <p className="text-gray-700 italic text-center mb-4 leading-relaxed min-h-[120px]">
                                  "{displayText}"
                                </p>

                                {shouldTruncate && (
                                  <div className="text-center mt-2 mb-4">
                                    <button
                                      onClick={() => toggleReadMore(i)}
                                      className="text-primary hover:text-primary/80 text-sm font-medium inline-flex items-center gap-1 transition-colors"
                                    >
                                      {isExpanded ? "Show Less" : "Read More"}
                                      <ChevronRight className={`size-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col items-center mt-auto">
                                <div className="mb-4">
                                  <div className="size-20 rounded-full border-4 border-white shadow-lg overflow-hidden">
                                    <img
                                      src={getImageUrl(t.image)}
                                      alt={t.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/brand/avatar.svg";
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="text-center mb-4">
                                  <h4 className="font-bold text-lg text-gray-900">{t.name}</h4>
                                  <p className="text-primary font-medium text-sm">{t.role}</p>
                                  <p className="text-gray-600 text-sm mt-1">{t.company}</p>
                                </div>

                                {t.linkedin === "/#" ? (
                                  <button
                                    className="size-10 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center"
                                    aria-label={`LinkedIn profile not available for ${t.name}`}
                                    title="LinkedIn profile not available"
                                    disabled
                                  >
                                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                  </button>
                                ) : (
                                  <a
                                    href={t.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="size-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center hover:scale-110"
                                    aria-label={`Connect with ${t.name} on LinkedIn`}
                                  >
                                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Navigation arrows */}
                    {showLeftArrow && (
                      <button
                        onClick={handlePrevTestimonial}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 size-10 rounded-full bg-white shadow-lg text-primary border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 hover:shadow-xl"
                        aria-label="Previous testimonials"
                      >
                        <ChevronLeft className="size-6" />
                      </button>
                    )}

                    {showRightArrow && (
                      <button
                        onClick={handleNextTestimonial}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 size-10 rounded-full bg-white shadow-lg text-primary border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 hover:shadow-xl"
                        aria-label="Next testimonials"
                      >
                        <ChevronRight className="size-6" />
                      </button>
                    )}

                    {/* Dots indicator */}
                    {totalGroups > 1 && (
                      <div className="flex justify-center gap-3 mt-12">
                        {Array.from({ length: totalGroups }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setStartIndex(i * cardsPerView)}
                            className={`size-3 rounded-full transition-all duration-300 ${
                              startIndex === i * cardsPerView
                                ? "bg-primary w-8"
                                : "bg-gray-300 hover:bg-gray-400"
                            }`}
                            aria-label={`Go to slide group ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </section>

      {/* Inside Nilaya AI Section */}
      <section className="w-full py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-background to-primary/5">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_70%)]"></div>
        </div>

        <div className="container px-4 md:px-6 relative space-y-10 md:space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-2 inline-block bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
              Inside Nilaya AI
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A glimpse into how we collaborate, prototype, and ship.
            </p>
          </motion.div>

          {showcaseSections.map((s, idx) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              <div className={`grid md:grid-cols-12 gap-6 md:gap-8 items-center rounded-3xl border border-border/40 bg-white/60 backdrop-blur shadow-xl p-5 md:p-8 ${idx % 2 === 1 ? "md:pr-6" : "md:pl-6"}`}>
                <div className={idx % 2 === 1 ? "md:col-span-5 order-2 md:order-1" : "md:col-span-5 order-2 md:order-1"}>
                  <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs md:text-sm bg-white/80">
                    <span className="size-2 rounded-full bg-primary" />
                    <span>{idx === 0 ? "Our Culture" : idx === 1 ? "Workspace" : "How We Work"}</span>
                  </div>
                  <h4 className="mt-3 text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    {s.title}
                  </h4>
                  <p className="mt-2 text-muted-foreground md:text-lg">{s.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(idx === 0 ? ["Cross-functional pods", "Rapid alignment", "Outcome focus"] :
                      idx === 1 ? ["Quiet zones", "Design-led setup", "Deep work"] :
                      ["Prototype to scale", "Data-backed choices", "Shared wins"]).map((chip, cIdx) => (
                      <motion.span
                        key={cIdx}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.05 * cIdx }}
                        className="text-xs md:text-sm px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-blue-500/10 border border-border/50"
                      >
                        {chip}
                      </motion.span>
                    ))}
                  </div>
                  <div className="mt-5 h-1 w-24 bg-gradient-to-r from-primary to-blue-500 rounded-full" />
                </div>

                <div className={idx % 2 === 1 ? "md:col-span-7 order-1 md:order-2" : "md:col-span-7 order-1 md:order-2"}>
                  <motion.div
                    initial={{ scale: 0.96, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    whileHover={{ scale: 1.01 }}
                    className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.15),transparent_40%)]"
                  >
                    <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-primary/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                  </motion.div>
                </div>
              </div>

              <div className="pointer-events-none absolute -z-10 inset-0 blur-3xl opacity-40 group-hover:opacity-60 transition-opacity">
                <div className={`${idx % 2 === 1 ? "md:left-1/3" : "md:right-1/3"} absolute top-0 size-56 rounded-full bg-primary/20`} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} className="w-full py-24 relative overflow-hidden bg-gradient-to-b from-background to-primary/5">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.1),transparent_70%)]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(59,130,246,0.05)_360deg)] rounded-full animate-slow-spin"></div>
        </div>

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isServicesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Our Expertise
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive solutions tailored to your business needs
            </p>
          </motion.div>

          <Tabs defaultValue="ai" className="w-full max-w-4xl mx-auto" onValueChange={setActiveTab}>
            <div className="flex justify-center mb-6 md:mb-8">
              <TabsList className="flex flex-wrap justify-center gap-1 p-1 sm:gap-2 sm:grid sm:grid-cols-4 sm:h-14 bg-muted/50 backdrop-blur-sm rounded-full w-full max-w-sm sm:max-w-none">
                <TabsTrigger
                  value="ai"
                  className={cn(
                    "rounded-full text-xs sm:text-sm md:text-base font-medium transition-all data-[state=active]:shadow-lg px-2 sm:px-4 py-2",
                    activeTab === "ai"
                      ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white"
                      : ""
                  )}
                >
                  <span className="hidden sm:inline">Automation</span>
                  <span className="sm:hidden">Automation</span>
                </TabsTrigger>
                <TabsTrigger
                  value="web"
                  className={cn(
                    "rounded-full text-xs sm:text-sm md:text-base font-medium transition-all data-[state=active]:shadow-lg px-2 sm:px-4 py-2",
                    activeTab === "web"
                      ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white"
                      : ""
                  )}
                >
                  <span className="hidden sm:inline">AI Applications</span>
                  <span className="sm:hidden">AI Apps</span>
                </TabsTrigger>
                <TabsTrigger
                  value="mobile"
                  className={cn(
                    "rounded-full text-xs sm:text-sm md:text-base font-medium transition-all data-[state=active]:shadow-lg px-2 sm:px-4 py-2",
                    activeTab === "mobile"
                      ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white"
                      : ""
                  )}
                >
                  <span className="hidden sm:inline">LLM Integration</span>
                  <span className="sm:hidden">LLM</span>
                </TabsTrigger>
                <TabsTrigger
                  value="cloud"
                  className={cn(
                    "rounded-full text-xs sm:text-sm md:text-base font-medium transition-all data-[state=active]:shadow-lg px-2 sm:px-4 py-2",
                    activeTab === "cloud"
                      ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white"
                      : ""
                  )}
                >
                  <span className="hidden sm:inline">Data Systems</span>
                  <span className="sm:hidden">Data</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="relative mt-6 md:mt-8 min-h-[300px] md:min-h-[400px]">
              <AnimatePresence mode="wait">
                {["ai", "web", "mobile", "cloud"].map((tab) => activeTab === tab && (
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="md:absolute md:inset-0"
                  >
                    <TabsContent value={tab} className="mt-0 md:h-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
                        <div className="order-2 md:order-1">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative aspect-video rounded-xl md:rounded-2xl overflow-hidden shadow-xl md:shadow-2xl"
                          >
                            <Image
                              src={
                                tab === "ai" ? "/brand/automation.svg" :
                                tab === "web" ? "/brand/workspace.svg" :
                                tab === "mobile" ? "/brand/chatbot.svg" :
                                tab === "cloud" ? "/brand/data-viz.svg" :
                                "/brand/abstract-grid.svg"
                              }
                              alt={`${tab} Development`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent flex items-end">
                              <div className="p-6">
                                <h3 className="text-2xl font-bold text-white mb-2">
                                  {tab === "ai" ? "Automation Blueprint" :
                                   tab === "web" ? "AI Applications" :
                                   tab === "mobile" ? "LLM Experiences" : "Data Systems"}
                                </h3>
                                <p className="text-white/80">
                                  {tab === "ai" ? "Design intelligent workflows that cut cycle time and cost." :
                                   tab === "web" ? "Build AI-first products that deliver measurable business outcomes." :
                                   tab === "mobile" ? "Deploy conversational and assistant experiences with LLMs." :
                                   "Engineer reliable data foundations for real-time intelligence."}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        <div className="order-1 md:order-2">
                          <motion.h3
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-xl md:text-2xl font-bold mb-4 md:mb-6"
                          >
                            {tab === "ai" ? "Automation, End-to-End" :
                             tab === "web" ? "AI Application Delivery" :
                             tab === "mobile" ? "LLM-Ready Experiences" :
                             "Data Platforms That Scale"}
                          </motion.h3>

                          <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-3 md:space-y-4"
                          >
                            {services[tab as keyof typeof services].map((service, i) => (
                              <motion.div
                                key={i}
                                variants={itemVariants}
                                custom={i}
                                whileHover={{ x: 5 }}
                                className="flex items-center gap-3 group"
                              >
                                <div className="size-8 md:size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 flex-shrink-0">
                                  <Check className="size-4 md:size-5" />
                                </div>
                                <p className="font-medium text-sm md:text-base">{service}</p>
                              </motion.div>
                            ))}
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="mt-6 md:mt-8"
                          >
                            <Button size="lg" className="rounded-full group w-full sm:w-auto">
                              <span className="hidden sm:inline">
                                Explore {tab === "ai" ? "Automation" : tab === "web" ? "AI Apps" : tab === "mobile" ? "LLM" : "Data Systems"}
                              </span>
                              <span className="sm:hidden">
                                Explore {tab === "ai" ? "Automation" : tab === "web" ? "AI Apps" : tab === "mobile" ? "LLM" : "Data"}
                              </span>
                              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </TabsContent>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="w-full py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-blue-600/90 -z-10"></div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="absolute inset-0 -z-5 overflow-hidden opacity-30">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute size-40 rounded-full bg-white/10 blur-3xl"
              style={{ left: `${i * 25}%`, top: `${i * 15}%` }}
            />
          ))}
        </div>

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl md:text-5xl font-bold mb-6"
            >
              Ready to take your business to the{" "}
              <span className="relative inline-block">
                next level
                <motion.span
                  initial={{ width: 0 }}
                  animate={isCtaInView ? { width: "100%" } : { width: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="absolute bottom-1 left-0 h-3 bg-white/20 -z-10 rounded-sm"
                />
              </span>
              ?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-white/90 mb-10 max-w-2xl mx-auto"
            >
              Get in touch today to unlock your business's full potential!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="relative group">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-md group-hover:blur-xl transition-all duration-300 -z-10"></div>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="rounded-full h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-medium bg-white text-primary hover:bg-white/90 shadow-xl group-hover:shadow-white/20 transition-all duration-300 w-full sm:w-auto"
                  >
                    <span className="hidden sm:inline">Start Free Consultation</span>
                    <span className="sm:hidden">Free Consultation</span>
                    <Calendar className="ml-2 size-4 sm:size-5 transition-transform group-hover:scale-110" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="rounded-full h-14 px-8 text-base font-medium bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 group"
                  >
                    View Case Studies
                    <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
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
    </div>
  );
}
