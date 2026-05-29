"use client";
import { API_URL } from "@/lib/config";
import { CardContent } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Code,
  Brain,
  Smartphone,
  BarChart,
  Blocks,
  Database,
  Server,
  GraduationCap,
  ShoppingCart,
  Globe,
  X,
  ExternalLink,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Star,
  Search,
  Clock,
  Users,
  CheckCircle,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";


// API URL - make sure this matches your backend
// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types
interface Project {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  image: string;
  gallery: string[];
  icon: string;
  category: string;
  technologies: string[];
  color: string;
  stats: Record<string, string>;
  details: string;
  challenges: string[];
  outcomes: string[];
  timeline: string;
  team: string;
  client: string;
  created_at?: string;
  liveUrl?: string;
  videoUrl?: string;
  status: "completed" | "ongoing" | "planned";
  featured?: boolean;
  testimonial_name?: string;
  testimonial_role?: string;
  testimonial_image?: string;
  testimonial_quote?: string;
  testimonial_rating?: number;
  sortOrder?: number;
}

interface ProjectTestimonial {
  name: string;
  role: string;
  image: string;
  quote: string;
  rating: number;
}

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleProjects, setVisibleProjects] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const projectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unwrapList = (v: any) => {
      // Backend sometimes returns `{ results: [...] }`, sometimes a plain array.
      if (Array.isArray(v)) return v;
      if (v && typeof v === "object" && Array.isArray((v as any).results)) return (v as any).results;
      return [];
    };

    const toStringList = (v: any): string[] => {
      if (Array.isArray(v)) {
        return v.map((x) => String(x ?? "").trim()).filter(Boolean);
      }
      if (typeof v === "string") {
        // Many project fields are stored as comma-separated strings in the API.
        return v
          .split(/[\n,]+/g)
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    };

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/projects/`);
        if (!response.ok) throw new Error(`Failed to fetch projects: ${response.status}`);

        const raw = await response.json();
        const list = unwrapList(raw);

        // Normalize a few fields so UI code can safely use `.map()`, `.slice()`, etc.
        const normalized = list.map((p: any) => ({
          ...p,
          technologies: toStringList(p.technologies),
          challenges: toStringList(p.challenges),
          outcomes: toStringList(p.outcomes),
          gallery: Array.isArray(p.gallery) ? p.gallery : [],
        })) as Project[];

        const sortedProjects = [...normalized].sort((a, b) => {
          const sortOrderA = a.sortOrder ?? 9999;
          const sortOrderB = b.sortOrder ?? 9999;
          if (sortOrderA !== sortOrderB) return sortOrderA - sortOrderB;
          const aTime = new Date(a.created_at ?? 0).getTime();
          const bTime = new Date(b.created_at ?? 0).getTime();
          return bTime - aTime;
        });

        setProjects(sortedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const [teamData, setTeamData] = useState<any[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);

  // Copy the exact same useEffect from team page (simplified version)
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        console.log("Fetching team data from:", `${API_URL}/api/team/`);
        const response = await fetch(`${API_URL}/api/team/`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Team data response:", data);

        // Make sure data is an array
        if (!Array.isArray(data)) {
          console.error("Team data is not an array:", data);
          setTeamData([]);
          return;
        }

        setTeamData(data);
      } catch (error) {
        console.error('Error fetching team data:', error);
        setTeamData([]);
      } finally {
        setTeamLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  // Calculate total team count (same logic as team page)
  const teammember = teamData.filter((member: any) => member.status === 'Active').length;


  const openProject = (project: Project) => {
    setSelectedProject(project);
  };

  const categories = [
    { id: "all", label: "All Projects", icon: <Sparkles className="size-4" /> },
    {
      id: "mobile",
      label: "Mobile Apps",
      icon: <Smartphone className="size-4" />,
    },
    { id: "fintech", label: "FinTech", icon: <BarChart className="size-4" /> },
    { id: "saas", label: "SaaS", icon: <Database className="size-4" /> },
    {
      id: "edtech",
      label: "EdTech",
      icon: <GraduationCap className="size-4" />,
    },
    { id: "ai", label: "AI/ML", icon: <Brain className="size-4" /> },
    {
      id: "blockchain",
      label: "Blockchain",
      icon: <Blocks className="size-4" />,
    },
    { id: "devops", label: "DevOps", icon: <Server className="size-4" /> },
    {
      id: "ecommerce",
      label: "E-Commerce",
      icon: <ShoppingCart className="size-4" />,
    },
    { id: "govtech", label: "GovTech", icon: <Globe className="size-4" /> },
    {
      id: "enterprise",
      label: "Enterprise",
      icon: <Code className="size-4" />,
    },
  ];

  // Filter projects based on category and search query
  const getFilteredProjects = () => {
    let filtered = projects;

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter(
        (project) => project.category === activeCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.shortDescription.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.technologies.some((tech) =>
            tech.toLowerCase().includes(query)
          )
      );
    }

    return filtered;
  };

  const filteredProjects = getFilteredProjects();

  // Load more projects
  const loadMoreProjects = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleProjects((prev) => Math.min(prev + 3, filteredProjects.length));
      setIsLoading(false);
    }, 800);
  };

  // Scroll to projects section
  const scrollToProjects = () => {
    projectsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Reset filters
  const resetFilters = () => {
    setActiveCategory("all");
    setSearchQuery("");
  };

  // Get testimonial for a project - dynamic from project data
  const getProjectTestimonial = (
    project: Project
  ): ProjectTestimonial | null => {
    if (project.testimonial_name && project.testimonial_quote) {
      return {
        name: project.testimonial_name,
        role: project.testimonial_role || "",
        image: project.testimonial_image || "/brand/avatar.svg",
        quote: project.testimonial_quote,
        rating: project.testimonial_rating || 5,
      };
    }
    return null;
  };

  // Get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      Code: <Code className="size-6" />,
      Brain: <Brain className="size-6" />,
      Smartphone: <Smartphone className="size-6" />,
      BarChart: <BarChart className="size-6" />,
      Blocks: <Blocks className="size-6" />,
      Database: <Database className="size-6" />,
      Server: <Server className="size-6" />,
      GraduationCap: <GraduationCap className="size-6" />,
      ShoppingCart: <ShoppingCart className="size-6" />,
      Globe: <Globe className="size-6" />,
    };
    return iconMap[iconName] || <Code className="size-6" />;
  };

  // Get image URL - handles both full URLs and relative paths
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/brand/avatar.svg";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8 },
    },
  };
  const uniqueClients = new Set(
    projects
      .map(project => project.client?.trim())
      .filter(client => client && client !== "")
  ).size;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Hero Section - Fixed without parallax */}
      <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-blue-50/50 to-purple-50/30">
        {/* Static Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
          </div>
        </div>

        <div className="container px-4 md:px-6 relative z-10 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="size-4" />
              Our Portfolio
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Transforming Ideas into
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
              >
                Digital Reality
              </motion.span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Explore our portfolio of innovative solutions that drive business
              growth and digital transformation
            </p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mb-12"
            >
              {[
                { label: "Projects Completed", value: `${projects.length}+` },
                { label: "Happy Clients", value: `${uniqueClients}+` },
                { label: "Team Members", value: `${teammember}` },
                { label: "Years Experience", value: "3+" },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <Button
                size="lg"
                onClick={scrollToProjects}
                className="rounded-full px-8 py-6 text-base"
              >
                Explore Our Projects
                <ChevronRight className="ml-2 size-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="w-1 h-3 bg-primary/70 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Projects Section */}
      <section ref={projectsRef} className="w-full py-20 bg-background">
        <div className="container px-4 md:px-6">
          <motion.div
            variants={fadeInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Our Projects
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Discover our portfolio of innovative solutions across various
                industries and technologies
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64 rounded-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            variants={fadeInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-12"
          >
            <Tabs
              defaultValue="all"
              value={activeCategory}
              onValueChange={setActiveCategory}
            >
              <TabsList className="flex flex-wrap gap-2 h-auto bg-transparent">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {category.icon}
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Projects Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects
                .slice(0, visibleProjects)
                .map((project, idx) => {
                  const testimonial = getProjectTestimonial(project);

                  return (
                    <motion.div
                      key={project.id}
                      layout
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="group relative"
                    >
                      <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/20 backdrop-blur transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                        {/* Project Image */}
                        <div className="relative h-56 overflow-hidden">
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-90 transition-opacity duration-500`}
                          />
                          <Image
                            src={
                              project.image?.startsWith("http")
                                ? project.image
                                : project.image
                                  ? `${API_URL}${project.image}`
                                  : "/brand/avatar.svg" // Add this fallback
                            }
                            alt={project.title}
                            width={800}
                            height={600}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          // onError={(e) => {
                          //   e.currentTarget.src = "/brand/avatar.svg"; // Fallback if image fails to load
                          // }}
                          />

                          {/* Category Badge */}
                          <div className="absolute top-4 left-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${project.color} text-white`}
                            >
                              {
                                categories.find(
                                  (c) => c.id === project.category
                                )?.label
                              }
                            </span>
                          </div>

                          {/* Project Icon */}
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            whileInView={{ scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="absolute top-4 right-4"
                          >
                            <div className="size-10 rounded-full bg-white/90 flex items-center justify-center text-primary shadow-lg">
                              {getIconComponent(project.icon)}
                            </div>
                          </motion.div>

                          {/* Quick Stats */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100"
                          >
                            <div className="flex justify-between text-white">
                              <div className="flex items-center gap-2">
                                <Clock className="size-4" />
                                <span className="text-sm">
                                  {project.timeline}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="size-4" />
                                <span className="text-sm">
                                  {project.team.split(",")[0]}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        {/* Project Content */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {project.shortDescription}
                          </p>

                          {/* Technologies */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.technologies
                              .slice(0, 3)
                              .map((tech, idx) => (
                                <motion.span
                                  key={idx}
                                  initial={{ opacity: 0, scale: 0 }}
                                  whileInView={{ opacity: 1, scale: 1 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md"
                                >
                                  {tech}
                                </motion.span>
                              ))}
                            {project.technologies.length > 3 && (
                              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md">
                                +{project.technologies.length - 3} more
                              </span>
                            )}
                          </div>

                          {/* Testimonial Preview - Dynamic */}
                          {testimonial && (
                            <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-border/30">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {[...Array(testimonial.rating)].map(
                                    (_, i) => (
                                      <Star
                                        key={i}
                                        className="size-3 fill-primary text-primary"
                                      />
                                    )
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  Client Testimonial
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground italic line-clamp-2">
                                "{testimonial.quote.substring(0, 100)}..."
                              </p>
                            </div>
                          )}

                          {/* Action Button */}
                          <Button
                            onClick={() => setSelectedProject(project)}
                            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                          >
                            View Project Details
                            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </motion.div>

          {/* Load More Button */}
          {visibleProjects < filteredProjects.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center mt-12"
            >
              <Button
                variant="outline"
                size="lg"
                onClick={loadMoreProjects}
                disabled={isLoading}
                className="rounded-full px-8"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                    Loading...
                  </div>
                ) : (
                  <>
                    Load More Projects
                    <ChevronRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* No Results Message */}
          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Search className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find any projects matching your current filters.
              </p>
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-10 size-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="size-5" />
              </button>

              {/* Modal Content */}
              <div className="relative">
                {/* Header Image */}
                <div className="relative h-64 md:h-80 overflow-hidden rounded-t-2xl">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${selectedProject.color} opacity-90`}
                  />
                  <Image
                    src={
                      selectedProject.image?.startsWith("http")
                        ? selectedProject.image
                        : selectedProject.image
                          ? `${API_URL}${selectedProject.image}`
                          : "/brand/avatar.svg" // Add this fallback
                    }
                    alt={selectedProject.title}
                    width={1200}
                    height={600}
                    className="w-full h-full object-cover"
                  // onError={(e) => {
                  //   e.currentTarget.src = "/brand/avatar.svg";
                  // }}
                  />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="size-12 rounded-full bg-white/90 flex items-center justify-center text-primary">
                        {getIconComponent(selectedProject.icon)}
                      </div>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                        {
                          categories.find(
                            (c) => c.id === selectedProject.category
                          )?.label
                        }
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                      {selectedProject.title}
                    </h2>
                    <p className="text-white/90 text-lg">
                      {selectedProject.description}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                  {/* Project Tabs */}
                  <Tabs defaultValue="overview" className="mb-8">
                    <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 mb-6">
                      <TabsTrigger
                        value="overview"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        Overview
                      </TabsTrigger>
                      <TabsTrigger
                        value="gallery"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        Gallery
                      </TabsTrigger>
                      <TabsTrigger
                        value="testimonial"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        Client Testimonial
                      </TabsTrigger>
                      <TabsTrigger
                        value="video"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        Video
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-0">
                      <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                          {/* Project Details */}
                          <div className="mb-8">
                            <h3 className="text-xl font-bold mb-4">
                              Project Overview
                            </h3>
                            <div className="prose prose-blue max-w-none text-muted-foreground">
                              {selectedProject.details
                                .split("\n\n")
                                .map((paragraph, idx) => (
                                  <p key={idx}>{paragraph}</p>
                                ))}
                            </div>
                          </div>

                          {/* Challenges & Outcomes */}
                          <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div>
                              <h3 className="text-xl font-bold mb-4">
                                Challenges
                              </h3>
                              <ul className="space-y-3">
                                {selectedProject.challenges.map(
                                  (challenge, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-3 text-muted-foreground"
                                    >
                                      <CheckCircle className="size-5 text-primary flex-shrink-0 mt-0.5" />
                                      <span>{challenge}</span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold mb-4">
                                Outcomes
                              </h3>
                              <ul className="space-y-3">
                                {selectedProject.outcomes.map(
                                  (outcome, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-3 text-muted-foreground"
                                    >
                                      <CheckCircle className="size-5 text-primary flex-shrink-0 mt-0.5" />
                                      <span>{outcome}</span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>

                          {/* Technologies */}
                          <div className="mb-8">
                            <h3 className="text-xl font-bold mb-4">
                              Technologies Used
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedProject.technologies.map((tech, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Project Info Sidebar */}
                        <div>
                          <Card className="bg-muted/30 border-border/40">
                            <CardContent className="p-6">
                              <h3 className="text-lg font-bold mb-4">
                                Project Information
                              </h3>

                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                    Client
                                  </h4>
                                  <p className="font-medium">
                                    {selectedProject.client}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                    Timeline
                                  </h4>
                                  <p className="font-medium">
                                    {selectedProject.timeline}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                    Team
                                  </h4>
                                  <p className="font-medium">
                                    {selectedProject.team}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                    Category
                                  </h4>
                                  <p className="font-medium">
                                    {
                                      categories.find(
                                        (c) => c.id === selectedProject.category
                                      )?.label
                                    }
                                  </p>
                                </div>
                              </div>

                              <div className="border-t border-border/40 my-6"></div>

                              {/* Project Stats */}
                              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                                Key Metrics
                              </h4>
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                {selectedProject.stats?.stat1 && (
                                  <div className="text-center p-3 bg-background rounded-lg">
                                    <div className="text-xl font-bold text-primary">
                                      {selectedProject.stats.stat1}
                                    </div>
                                    <div className="text-xs text-muted-foreground capitalize">
                                      {selectedProject.stats.stat1_label ||
                                        "users"}
                                    </div>
                                  </div>
                                )}
                                {selectedProject.stats?.stat2 && (
                                  <div className="text-center p-3 bg-background rounded-lg">
                                    <div className="text-xl font-bold text-primary">
                                      {selectedProject.stats.stat2}
                                    </div>
                                    <div className="text-xs text-muted-foreground capitalize">
                                      {selectedProject.stats.stat2_label ||
                                        "rating"}
                                    </div>
                                  </div>
                                )}
                                {selectedProject.stats?.stat3 && (
                                  <div className="text-center p-3 bg-background rounded-lg">
                                    <div className="text-xl font-bold text-primary">
                                      {selectedProject.stats.stat3}
                                    </div>
                                    <div className="text-xs text-muted-foreground capitalize">
                                      {selectedProject.stats.stat3_label ||
                                        "downloads"}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="space-y-3">
                                <Button
                                  className="w-full gap-2"
                                  onClick={() => {
                                    if (selectedProject.liveUrl) {
                                      window.open(
                                        selectedProject.liveUrl,
                                        "_blank"
                                      );
                                    } else {
                                      alert("Project link not available");
                                    }
                                  }}
                                >
                                  <ExternalLink className="size-4" />
                                  View Live Project
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="gallery" className="mt-0">
                      <h3 className="text-xl font-bold mb-6">
                        Project Gallery
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedProject.gallery.map((image, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative overflow-hidden rounded-lg aspect-video"
                          >
                            <Image
                              src={getImageUrl(image)}
                              alt={`${selectedProject.title} - Gallery image ${idx + 1
                                }`}
                              width={800}
                              height={600}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="testimonial" className="mt-0">
                      {getProjectTestimonial(selectedProject) ? (
                        <div>
                          <h3 className="text-xl font-bold mb-6">
                            Client Testimonial
                          </h3>
                          <Card className="bg-muted/30 border-border/40">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-4 mb-6">
                                <div className="size-16 rounded-full overflow-hidden">
                                  <Image
                                    src={getImageUrl(
                                      getProjectTestimonial(selectedProject)!
                                        .image
                                    )}
                                    alt={
                                      getProjectTestimonial(selectedProject)!
                                        .name
                                    }
                                    width={100}
                                    height={100}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h4 className="font-bold">
                                    {
                                      getProjectTestimonial(selectedProject)!
                                        .name
                                    }
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {
                                      getProjectTestimonial(selectedProject)!
                                        .role
                                    }
                                  </p>
                                  <div className="flex mt-1">
                                    {[
                                      ...Array(
                                        getProjectTestimonial(selectedProject)!
                                          .rating
                                      ),
                                    ].map((_, i) => (
                                      <Star
                                        key={i}
                                        className="size-4 fill-primary text-primary"
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <blockquote className="text-lg italic text-muted-foreground">
                                "{getProjectTestimonial(selectedProject)!.quote}
                                "
                              </blockquote>
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                            <Star className="size-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-xl font-bold mb-2">
                            No testimonial available
                          </h3>
                          <p className="text-muted-foreground">
                            We don't have a client testimonial for this project
                            yet.
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="video" className="mt-0">
                      <h3 className="text-xl font-bold mb-6">Project Video</h3>

                      {selectedProject.videoUrl ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                          {/* Video Player */}
                          {selectedProject.videoUrl.includes("youtube") ||
                            selectedProject.videoUrl.includes("youtu.be") ? (
                            <iframe
                              src={selectedProject.videoUrl
                                .replace("watch?v=", "embed/")
                                .replace("youtu.be/", "youtube.com/embed/")}
                              title={`${selectedProject.title} - Project Video`}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : selectedProject.videoUrl.includes("vimeo") ? (
                            <iframe
                              src={selectedProject.videoUrl.replace(
                                "vimeo.com/",
                                "player.vimeo.com/video/"
                              )}
                              title={`${selectedProject.title} - Project Video`}
                              className="w-full h-full"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                              <div className="text-center text-white">
                                <Play className="size-16 mx-auto mb-4" />
                                <p className="text-lg font-semibold">
                                  Video Preview
                                </p>
                                <p className="text-sm text-gray-300 mt-2">
                                  <a
                                    href={selectedProject.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 underline"
                                  >
                                    Click to view video
                                  </a>
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                            <Play className="size-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-xl font-bold mb-2">
                            No video available
                          </h3>
                          <p className="text-muted-foreground">
                            We don't have a video for this project yet.
                          </p>
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground mt-4">
                        {selectedProject.videoUrl
                          ? `This video showcases the key features and functionality of the ${selectedProject.title} project.`
                          : "Check back later for video content about this project."}
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full border-t bg-background/95 backdrop-blur-sm relative z-20">
        <div className="container px-4 py-10 md:px-6 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 font-bold mb-4">
                <img
                  src="/brand/nilaya-icon.svg"
                  alt="Nilaya AI Logo"
                  className="size-8 rounded-lg object-cover"
                />
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
