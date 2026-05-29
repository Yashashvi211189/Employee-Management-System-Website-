"use client"
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation"
import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight,
  Code,
  Smartphone,
  BarChart,
  Brain,
  Cpu,
  Users,
  Target,
  Lightbulb,
  Shield,
  Zap,
  CheckCircle,
  Award,
  ChevronDown,
  Star,
  Sparkles,
  Globe,
  Rocket,
  Heart,
  TrendingUp,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MapPin, Phone, Mail } from "lucide-react";
import { API_URL } from "@/lib/config";


export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const journeyRef = useRef<HTMLDivElement>(null)
  const valuesRef = useRef<HTMLDivElement>(null)
  const teamRef = useRef<HTMLDivElement>(null)
  const expertiseRef = useRef<HTMLDivElement>(null)

  // Scroll progress and parallax effects
  const { scrollYProgress } = useScroll({ target: containerRef })
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  // Parallax transforms
  const heroY = useTransform(smoothProgress, [0, 0.3], [0, -200])
  const heroOpacity = useTransform(smoothProgress, [0, 0.3], [1, 0])
  const heroScale = useTransform(smoothProgress, [0, 0.3], [1, 0.8])

  const backgroundY1 = useTransform(smoothProgress, [0, 1], [0, -300])
  const backgroundY2 = useTransform(smoothProgress, [0, 1], [0, -150])
  const backgroundY3 = useTransform(smoothProgress, [0, 1], [0, -75])

  // Section visibility
  const heroInView = useInView(heroRef, { once: false, amount: 0.3 })
  const statsInView = useInView(statsRef, { once: false, amount: 0.3 })
  const journeyInView = useInView(journeyRef, { once: false, amount: 0.3 })
  const valuesInView = useInView(valuesRef, { once: false, amount: 0.3 })
  const teamInView = useInView(teamRef, { once: false, amount: 0.3 })
  const expertiseInView = useInView(expertiseRef, { once: false, amount: 0.3 })

  // Mouse position for 3D effects
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / (typeof window !== 'undefined' ? window.innerWidth : 1)) * 2 - 1,
        y: (e.clientY / (typeof window !== 'undefined' ? window.innerHeight : 1)) * 2 - 1,
      })
    }

    if (typeof window !== 'undefined') {
      window.addEventListener("mousemove", handleMouseMove)
      return () => window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  // Animated counter component
  const AnimatedCounter = ({ value, label, suffix = "+" }: { value: number; label: string; suffix?: string }) => {
    const [count, setCount] = useState(0)
    const counterRef = useRef<HTMLDivElement>(null)
    const counterInView = useInView(counterRef, { once: true, amount: 0.5 })

    useEffect(() => {
      if (counterInView) {
        const duration = 2000
        const steps = 60
        const increment = value / steps
        let current = 0

        const timer = setInterval(() => {
          current += increment
          if (current >= value) {
            setCount(value)
            clearInterval(timer)
          } else {
            setCount(Math.floor(current))
          }
        }, duration / steps)

        return () => clearInterval(timer)
      }
    }, [counterInView, value])

    return (
      <div ref={counterRef} className="text-center group">
        <motion.div
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2"
          animate={{ scale: counterInView ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {count}
          {suffix}
        </motion.div>
        <div className="text-sm text-muted-foreground font-medium">{label}</div>
        <motion.div
          className="w-12 h-1 bg-gradient-to-r from-primary to-blue-500 mx-auto mt-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: counterInView ? 48 : 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>


    )
  }

  // Floating particles component
  const FloatingParticles = () => {
    const particles = Array.from({ length: 20 }, (_, i) => i)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    useEffect(() => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }, [])

    if (dimensions.width === 0 || dimensions.height === 0) {
      return null
    }

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            initial={{
              x: Math.random() * dimensions.width,
              y: dimensions.height + 100,
            }}
            animate={{
              y: -100,
              x: Math.random() * dimensions.width,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    )
  }

  const [projects, setProjects] = useState<Array<{ client?: string | null }>>([]);
  const [loading, setLoading] = useState(true);

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

  const uniqueClients = new Set(
    projects
      .map((project) => project.client?.trim())
      .filter((client) => client && client !== "")
  ).size;

  // In about/page.tsx, add these lines near your other state declarations:

  // const [teamMembers, setTeamMembers] = useState<any[]>([]);
  // const [executives, setExecutives] = useState<any[]>([]);
  // const [founders, setFounders] = useState<any[]>([]);
  // const [teamLoading, setTeamLoading] = useState(true);

  // // Copy the exact same useEffect from team page
  // useEffect(() => {
  //   const fetchTeamData = async () => {
  //     try {
  //       const [teamRes, execRes, founderRes] = await Promise.all([
  //         fetch(`${API_URL}/api/team-members/`),
  //         fetch(`${API_URL}/api/executives/`),
  //         fetch(`${API_URL}/api/founders/`)
  //       ]);

  //       const [teamData, execData, founderData] = await Promise.all([
  //         teamRes.json(),
  //         execRes.json(),
  //         founderRes.json()
  //       ]);

  //       setTeamMembers(teamData);
  //       setExecutives(execData);
  //       setFounders(founderData);
  //     } catch (error) {
  //       console.error('Error fetching team data:', error);
  //     } finally {
  //       setTeamLoading(false);
  //     }
  //   };

  //   fetchTeamData();
  // }, []);

  // // Calculate total team count
  // const totalTeamCount = teamMembers.length + executives.length + founders.length;
  // console.log("Total team members in about page:", totalTeamCount);

  // // Now use it in your stats
  // const stats = [
  //   { value: 3, label: "Years of Excellence" },
  //   { value: projects.length || 0, label: "Projects Delivered" },
  //   { value: totalTeamCount, label: "Team Members" }, // ✅ Use it here
  //   { value: 5, label: "Industry Awards" },
  // ];

  // const stats = [
  //   { value: 3, label: "Years of Excellence" },
  //   { value: projects.length, label: "Projects Delivered" },
  //   { value: 15, label: "Team Members" },
  //   { value: 5, label: "Industry Awards" },
  // ]
  // Remove all these:
  // const [teamMembers, setTeamMembers] = useState<any[]>([]);
  // const [executives, setExecutives] = useState<any[]>([]);
  // const [founders, setFounders] = useState<any[]>([]);
  // const [teamLoading, setTeamLoading] = useState(true);

  // Replace with this simpler version:

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
  console.log("Total active team members in about page:", teammember);

  // Now use it in your stats
  const stats = [
    { value: 3, label: "Years of Excellence" },
    { value: projects.length || 0, label: "Projects Delivered" },
    { value: teamLoading ? 15 : teammember, label: "Team Members" }, // ✅ Use it here
    { value: 5, label: "Industry Awards" },
  ];




  const journey = [
    {
      year: "2022",
      title: "Nilaya AI Founded",
      description: "Started as a compact AI studio focused on automation-first product teams.",
      icon: <Rocket className="size-6" />,
      color: "from-indigo-500 to-cyan-500",
    },
    {
      year: "2023",
      title: "First Workflow Platform",
      description: "Released an orchestration layer that connected tools, data, and approvals.",
      icon: <Sparkles className="size-6" />,
      color: "from-cyan-500 to-emerald-500",
    },
    {
      year: "2024",
      title: "LLM Integration Suite",
      description: "Delivered secure LLM connectors with evaluation and governance built in.",
      icon: <TrendingUp className="size-6" />,
      color: "from-violet-500 to-indigo-500",
    },
    {
      year: "2025",
      title: "Global Scale",
      description: "Expanded to multi-region deployments with always-on automation support.",
      icon: <Target className="size-6" />,
      color: "from-emerald-500 to-teal-500",
    },
  ]

  const values = [
    {
      title: "Human-Centered AI",
      description:
        "We build systems people trust, with clarity, safety, and real-world usability.",
      icon: <Heart className="size-8" />,
      gradient: "from-rose-400 via-fuchsia-500 to-indigo-500",
      delay: 0,
    },
    {
      title: "Execution Velocity",
      description:
        "Short feedback loops, rapid pilots, and measurable outcomes at every step.",
      icon: <Zap className="size-8" />,
      gradient: "from-cyan-400 via-blue-500 to-indigo-500",
      delay: 0.2,
    },
    {
      title: "Reliable by Design",
      description:
        "Resilient architectures, observability, and governance baked into every release.",
      icon: <Shield className="size-8" />,
      gradient: "from-emerald-400 via-teal-500 to-cyan-500",
      delay: 0.4,
    },
  ]

  const team = [
    {
      name: "Automation Strategists",
      role: "AI Strategy",
      image: "/brand/team-collab.svg",
      quote: "Experts in AI, automation, and scalable architecture",
      social: { linkedin: "#", twitter: "#" },
    },
    {
      name: "Applied AI Engineers",
      role: "Model & Workflow",
      image: "/brand/ai-robot.svg",
      quote: "Building trustworthy systems that ship with confidence",
      social: { linkedin: "#", twitter: "#" },
    },
    {
      name: "Platform Architects",
      role: "Data & Infrastructure",
      image: "/brand/data-viz.svg",
      quote: "Designing resilient AI platforms for scale",
      social: { linkedin: "#", twitter: "#" },
    },
  ]

  const expertise = [
    {
      title: "AI Workflow Automation",
      description: "Automate approvals, routing, and repetitive work with AI-driven orchestration.",
      icon: <Cpu className="size-8" />,
      image: "/brand/automation.svg",
      technologies: ["Orchestration", "Event Triggers", "RPA", "Integrations"],
    },
    {
      title: "Custom AI Applications",
      description: "Product-grade AI apps tailored to your data, teams, and customers.",
      icon: <Code className="size-8" />,
      image: "/brand/workspace.svg",
      technologies: ["Next.js", "Node.js", "Python", "Secure APIs"],
    },
    {
      title: "LLM Integration",
      description: "Connect LLMs safely with evaluation, governance, and observability.",
      icon: <Brain className="size-8" />,
      image: "/brand/llm.svg",
      technologies: ["RAG", "Prompt Ops", "Model Routing", "Eval Suite"],
    },
    {
      title: "Document Intelligence",
      description: "Extract, classify, and summarize documents at enterprise scale.",
      icon: <BarChart className="size-8" />,
      image: "/brand/document.svg",
      technologies: ["OCR", "Vector Search", "Extraction", "Compliance"],
    },
  ]

  const certifications = [
    { name: "Privacy by Design", icon: <Shield className="size-6" />, color: "text-indigo-500" },
    { name: "Secure Pipelines", icon: <CheckCircle className="size-6" />, color: "text-cyan-500" },
    { name: "Responsible AI", icon: <Star className="size-6" />, color: "text-emerald-500" },
    { name: "Audit-Ready", icon: <Award className="size-6" />, color: "text-amber-500" },
  ]

  return (
    <div ref={containerRef} className="flex min-h-screen flex-col overflow-hidden">
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-600 z-50 origin-left"
        style={{ scaleX: smoothProgress }}
      />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-50/30 to-purple-50/20"
            style={{ y: backgroundY1 }}
          />

          {/* Floating geometric shapes */}
          <motion.div
            className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            style={{ y: backgroundY2 }}
          />

          <motion.div
            className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            style={{ y: backgroundY3 }}
          />

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

          <FloatingParticles />
        </div>

        <motion.div
          className="container px-4 md:px-6 relative z-10"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        >
          <div className="text-center max-w-5xl mx-auto">
            {/* Animated title */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-8"
            >
              <motion.h1
                className="text-2xl md:text-2xl lg:text-2xl font-bold tracking-tight mb-6"
                style={{
                  transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`,
                }}
              >

                <motion.span
                  className="block bg-gradient-to-r from-primary via-blue-700 to-purple-600 bg-clip-text text-transparent text-7xl"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  About Us
                </motion.span>
              </motion.h1>
            </motion.div>

            {/* Subtitle with typewriter effect */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-6xl mx-auto leading-relaxed text-center"
            >
              Nilaya AI is an automation studio helping modern businesses design intelligent systems that are secure, reliable, and fast to deploy.
            </motion.p>


            {/* Animated logo */}


            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="rounded-full px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg"
                >
                  Explore Our Journey
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/team">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full px-8 py-6 text-lg font-semibold border-2 hover:bg-primary/5"
                  >
                    Meet Our Team
                    <Heart className="ml-2 size-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: heroInView ? 1 : 0 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => statsRef.current?.scrollIntoView({ behavior: "smooth" })}
          >
            <span className="text-sm text-muted-foreground mb-2">Discover More</span>
            <ChevronDown className="size-6 text-primary" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="py-20 md:py-32 bg-gradient-to-br from-gray-50 to-blue-50/30 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: statsInView ? 1 : 0, y: statsInView ? 0 : 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every number tells a story of innovation, dedication, and transformative success
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12 overflow-x-auto md:overflow-visible">
            <div className="flex md:contents gap-4 md:gap-12 min-w-max md:min-w-0">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: statsInView ? 1 : 0, y: statsInView ? 0 : 50 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 p-8 group hover:scale-105">
                    <CardContent className="p-0">
                      <AnimatedCounter value={stat.value} label={stat.label} />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section
        ref={journeyRef}
        className="py-20 md:py-32 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.3),transparent_50%)]" />

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: journeyInView ? 1 : 0, y: journeyInView ? 0 : 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Our Journey Through Time
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              From humble beginnings to industry leadership - every milestone shaped our vision
            </p>
          </motion.div>

          <div className="relative max-w-6xl mx-auto">
            {/* Timeline line */}
            <motion.div
              className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-purple-500 to-pink-500 transform sm:-translate-x-1/2"
              initial={{ height: 0 }}
              animate={{ height: journeyInView ? "100%" : 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />

            {journey.map((item, index) => (
              <motion.div
                key={index}
                className={cn(
                  "relative flex flex-col sm:flex-row items-center mb-16 last:mb-0",
                  index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                )}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                animate={{
                  opacity: journeyInView ? 1 : 0,
                  x: journeyInView ? 0 : index % 2 === 0 ? -100 : 100,
                }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <div
                  className={cn(
                    "w-full sm:w-5/12",
                    index % 2 === 0 ? "sm:text-right sm:pr-8" : "sm:text-left sm:pl-8"
                  )}
                >
                  <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-500 group">
                    <CardContent className="p-6">
                      <div
                        className={cn(
                          "flex items-center gap-3 mb-3",
                          index % 2 === 0 ? "justify-end" : "justify-start"
                        )}
                      >
                        <motion.div
                          className={cn(
                            "size-10 rounded-full bg-gradient-to-r flex items-center justify-center text-white",
                            item.color
                          )}
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.3 }}
                        >
                          {item.icon}
                        </motion.div>
                        <span className="text-2xl font-bold text-white">{item.year}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-300">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Timeline dot */}
                <motion.div
                  className="absolute left-4 sm:left-1/2 transform sm:-translate-x-1/2 size-6 rounded-full bg-white shadow-lg z-10"
                  initial={{ scale: 0 }}
                  animate={{ scale: journeyInView ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
                  whileHover={{ scale: 1.5 }}
                >
                  <motion.div
                    className="size-full rounded-full bg-gradient-to-r from-primary to-purple-500"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>




        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Our Mission & Vision
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Guiding principles that shape our journey and define our future
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group"
            >
              <Card className="h-full border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-primary to-blue-600 overflow-hidden">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 90, 0],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -top-20 -right-20 w-40 h-40 bg-white/20 rounded-full blur-xl"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="size-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Target className="size-10 text-white" />
                    </motion.div>
                  </div>
                </div>
                <CardContent className="p-8">
                  <h3 className="text-3xl font-bold mb-4 text-gray-900">Our Mission</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    To empower businesses worldwide with innovative, cutting-edge software solutions that drive digital transformation and unlock new possibilities. We are committed to delivering excellence through creativity, technical expertise, and a deep understanding of our clients' needs.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group"
            >
              <Card className="h-full border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-purple-600 to-pink-600 overflow-hidden">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, -90, 0],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/20 rounded-full blur-xl"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="size-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Rocket className="size-10 text-white" />
                    </motion.div>
                  </div>
                </div>
                <CardContent className="p-8">
                  <h3 className="text-3xl font-bold mb-4 text-gray-900">Our Vision</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    To be a global leader in AI-powered software development, recognized for our innovation, integrity, and impact. We envision a future where technology seamlessly integrates with human potential, creating solutions that inspire progress and transform industries worldwide.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section
        ref={valuesRef}
        className="py-20 md:py-32 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: valuesInView ? 1 : 0, y: valuesInView ? 0 : 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              What Drives Us Forward
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our core values shape every decision, every innovation, and every partnership we build
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: valuesInView ? 1 : 0, y: valuesInView ? 0 : 50 }}
                transition={{ duration: 0.8, delay: value.delay }}
                className="group"
              >
                <Card className="h-full border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group-hover:scale-105">
                  <div className="relative h-64 overflow-hidden">
                    <motion.div
                      className={cn("absolute inset-0 bg-gradient-to-br opacity-90", value.gradient)}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="size-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.5 }}
                      >
                        {value.icon}
                      </motion.div>
                    </div>
                  </div>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        ref={teamRef}
        className="py-20 md:py-32 bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: teamInView ? 1 : 0, y: teamInView ? 0 : 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Our AI Team
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experts in AI, automation, and scalable architecture
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: teamInView ? 1 : 0, y: teamInView ? 0 : 50 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="group"
              >
                <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-500 overflow-hidden group-hover:scale-105">
                  <div className="relative h-80 overflow-hidden">
                    <motion.img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover object-top"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <motion.div
                      className="absolute top-4 right-4 size-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Star className="size-6 text-yellow-400" />
                    </motion.div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-primary font-medium mb-4">{member.role}</p>
                    <blockquote className="text-gray-300 italic border-l-2 border-primary pl-4">
                      "{member.quote}"
                    </blockquote>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section
        ref={expertiseRef}
        className="py-20 md:py-32 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.1),transparent_50%)]" />

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: expertiseInView ? 1 : 0, y: expertiseInView ? 0 : 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Our Expertise Domains
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge technologies and methodologies that power transformative solutions
            </p>
          </motion.div>

          {/* ✅ Desktop Grid (unchanged) */}
          <div className="hidden md:grid md:grid-cols-2 gap-8">

            {expertise.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: expertiseInView ? 1 : 0, y: expertiseInView ? 0 : 50 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="group"
              >
                <Card className="h-full border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group-hover:scale-105">
                  <div className="relative h-56 md:h-64 overflow-hidden rounded-lg">
                    <motion.img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-center rounded-lg"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.5 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <motion.div
                      className="absolute bottom-4 left-4 size-12 rounded-full bg-white/90 flex items-center justify-center text-primary shadow-lg"
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                    >
                      {item.icon}
                    </motion.div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{item.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.technologies.map((tech, techIndex) => (
                        <motion.span
                          key={techIndex}
                          className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* ✅ Mobile Swiper */}
          <div className="md:hidden">
            <Swiper
              modules={[Navigation]}
              spaceBetween={16}
              slidesPerView={1.1} // shows one card fully and part of the next
              navigation
            >
              {expertise.map((item, index) => (
                <SwiperSlide key={index}>
                  <Card className="h-full border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    <div className="relative h-56 overflow-hidden rounded-lg">
                      <motion.img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover object-center rounded-lg"
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.5 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <motion.div
                        className="absolute bottom-4 left-4 size-12 rounded-full bg-white/90 flex items-center justify-center text-primary shadow-lg"
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.5 }}
                      >
                        {item.icon}
                      </motion.div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed">{item.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.technologies.map((tech, techIndex) => (
                          <motion.span
                            key={techIndex}
                            className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-white to-gray-50">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Trusted & Certified
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our commitment to excellence is recognized by leading industry bodies
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group"
              >
                <Card className="p-6 text-center bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                  <motion.div
                    className={cn(
                      "size-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors",
                      cert.color,
                    )}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {cert.icon}
                  </motion.div>
                  <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary via-blue-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Animated background elements */}
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1.2, 1, 1.2] }}
          transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              style={{
                background: "linear-gradient(90deg, #ffffff, #e0e7ff, #ffffff)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Ready to Automate What Matters?
            </motion.h2>

            <motion.p
              className="text-xl text-white/80 mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Let's collaborate to design intelligent systems that turn complexity into clarity.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="rounded-full px-8 py-6 text-lg font-semibold bg-white text-primary hover:bg-gray-100 shadow-xl"
                  >
                    Start Free Consultation
                    <Rocket className="ml-2 size-5" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/projects">
                  <Button
                    size="lg"
                    className="rounded-full px-8 py-6 text-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300"
                  >
                    View Case Studies
                    <ArrowRight className="ml-2 size-5" />
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
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About Nilaya AI
                  </Link>
                </li>
                <li>
                  <Link
                    href="/projects"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Case Studies
                  </Link>
                </li>
                <li>
                  <Link
                    href="/team"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Team
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/refund-policy"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/products"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    FlowGrid Orchestration
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    SignalIQ Analytics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Atlas Knowledge Hub
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    OpsPulse Console
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/it-services"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    AI Workflow Automation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/it-services"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Custom AI Applications
                  </Link>
                </li>
                <li>
                  <Link
                    href="/it-services"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    LLM Integration
                  </Link>
                </li>
                <li>
                  <Link
                    href="/it-services"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    API Development
                  </Link>
                </li>
                <li>
                  <Link
                    href="/it-services"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Data Processing Systems
                  </Link>
                </li>
                <li>
                  <Link
                    href="/it-services"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Document Intelligence
                  </Link>
                </li>
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
              <Link
                href="/refund-policy"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
