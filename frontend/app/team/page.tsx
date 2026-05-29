"use client"
import { API_URL } from '@/lib/config';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion"
import { Github, Linkedin, Twitter, Mail, Crown, Star, Users, Phone, MapPin, Calendar, Award, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRef, useState, useEffect } from "react"
import Link from "next/link";
import Image from "next/image";
import TeamModal from "./teammodel";
import { generateSlug } from "@/lib/team";


export default function TeamPage() {
  const [founders, setFounders] = useState<any[]>([]);
  const [executives, setExecutives] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [alumniMembers, setAlumniMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [projects, setProjects] = useState<Array<{ client?: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Function to extract year from date
  const getYearFromDate = (dateString: string) => {
    if (!dateString) return "2024";
    try {
      const date = new Date(dateString);
      return date.getFullYear().toString();
    } catch (error) {
      // If it's already just a year, return it
      if (/^\d{4}$/.test(dateString)) {
        return dateString;
      }
      return "2024";
    }
  };

  // Function to sort by join date (earliest first)
  const sortByJoinDate = (members: any[]) => {
    return [...members].sort((a, b) => {
      const dateA = a.joinDate ? new Date(a.joinDate).getTime() : new Date().getTime();
      const dateB = b.joinDate ? new Date(b.joinDate).getTime() : new Date().getTime();
      return dateA - dateB; // Ascending order (earliest first)
    });
  };

  // Fetch team data with member_type filtering
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("Fetching team data from:", `${API_URL}/api/team/`);

        const response = await fetch(`${API_URL}/api/team/`);

        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Raw API response:", data);

        // Check if data is an array
        if (!Array.isArray(data)) {
          throw new Error("API response is not an array");
        }

        // Let's see what member_type values actually exist
        const allMemberTypes = data.map((member: any) => member.member_type);
        console.log("All member_type values in data:", [...new Set(allMemberTypes)]);

        // Validate and transform data based on member_type
        const processMember = (member: any) => ({
          ...member,
          image: member.image || "/brand/avatar.svg",
          bio: member.bio || "AI team member at Nilaya AI",
          skills: member.skills || [],
          department: member.department || "General",
          location: member.location || "Remote-first",
          joinDate: member.joinDate || "2024",  // Convert to year only
          achievements: member.achievements || [],
          experience: member.experience || "",
          education: member.education || "",
          social: member.social || {
            linkedin: "#",
            twitter: "#",
            github: "#",
            email: "#"
          }
        });

        // Filter by member_type and status, then sort by join date
        const foundersData = sortByJoinDate(
          data
            .filter((member: any) => member.member_type === 'founder' && member.status === 'Active')
            .map(processMember)
        );

        const executivesData = sortByJoinDate(
          data
            .filter((member: any) => member.member_type === 'executive' && member.status === 'Active')
            .map(processMember)
        );

        const employeesData = sortByJoinDate(
          data
            .filter((member: any) => member.member_type === 'employee' && member.status === 'Active')
            .map(processMember)
        );

        const alumniData = data
          .filter((member: any) => member.status === 'Alumni')
          .map(member => ({
            ...processMember(member),
            bio: member.bio || "Former AI team member at Nilaya AI"
          }));

        console.log("Founders (sorted):", foundersData);
        console.log("Executives (sorted):", executivesData);
        console.log("Employees (sorted):", employeesData);
        console.log("Alumni:", alumniData);

        setFounders(foundersData);
        setExecutives(executivesData);
        setTeamMembers(employeesData);
        setAlumniMembers(alumniData);
      } catch (error) {
        console.error("Error fetching team data:", error);
        const message = error instanceof Error ? error.message : String(error);
        setError(`Failed to load team data: ${message}`);
        setFounders([]);
        setExecutives([]);
        setTeamMembers([]);
        setAlumniMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, []);
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

  

  const parallaxY = useTransform(smoothProgress, [0, 1], [0, -100])
  const parallaxY2 = useTransform(smoothProgress, [0, 1], [0, -200])
  const scaleProgress = useTransform(smoothProgress, [0, 0.5], [1, 1.1])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  }
  const teammember = teamMembers.length + executives.length + founders.length
  console.log("Total team members:", teammember);

  const CounterAnimation = ({ end, duration = 2000 }: { end: number; duration?: number }) => {
    const [count, setCount] = useState(0)
    const ref = useRef<HTMLSpanElement>(null)
    const isInView = useInView(ref, { once: true })

    useEffect(() => {
      if (isInView) {
        let startTime: number
        const animate = (currentTime: number) => {
          if (!startTime) startTime = currentTime
          const progress = Math.min((currentTime - startTime) / duration, 1)
          setCount(Math.floor(progress * end))
          if (progress < 1) {
            requestAnimationFrame(animate)
          }
        }
        requestAnimationFrame(animate)
      }
    }, [isInView, end, duration])


    return <span ref={ref}>{count}</span>
  }

  return (
    <div ref={containerRef} className="flex min-h-[100dvh] flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          style={{ y: parallaxY }}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full blur-xl"
        />
        <motion.div
          style={{ y: parallaxY2 }}
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl"
        />
        <motion.div
          style={{ y: parallaxY }}
          className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-xl"
        />
      </div>

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500 transform-gpu z-50"
        style={{ scaleX: smoothProgress, transformOrigin: "0%" }}
      />

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            style={{
              left: `${10 + ((i * 6) % 80)}%`,
              top: `${20 + ((i * 8) % 60)}%`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative w-full min-h-[100vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-50/50 to-purple-50/30" />

        {/* 3D Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="container px-4 md:px-6 relative z-10 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center max-w-6xl mx-auto"
          >
            {/* Animated Logo */}
            <motion.div
              className="mb-8 flex justify-center"
              whileHover={{ scale: 1.1, rotateY: 15 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <motion.div
                  className="w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl"
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Users className="w-12 h-12 text-white" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 rounded-2xl opacity-50 blur-xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                />
              </div>
            </motion.div>

            {/* 3D Text Effect */}
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
              style={{
                transform: `perspective(1000px) rotateX(${mousePosition.y * 0.01}deg) rotateY(${mousePosition.x * 0.01}deg)`,
              }}
            >
              Meet Our{" "}
              <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dream Team
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Passionate innovators, creative thinkers, and technology pioneers working together to shape the future of
              AI
            </motion.p>

            {/* Animated Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {[
                { label: "Projects Completed", value: projects.length, suffix: "+" },
                { label: "Happy Clients", value: 25, suffix: "+" },
                { label: "Team Members", value: teamMembers.length + executives.length + founders.length, suffix: "" },
                { label: "Years Experience", value: 3, suffix: "+" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    <CounterAnimation end={stat.value} />
                    {stat.suffix}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="w-full py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20" />
        <div className="container px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div className="flex items-center justify-center gap-4 mb-6" whileHover={{ scale: 1.05 }}>
              <Crown className="w-10 h-10 text-primary" />
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Our Visionary Leaders
              </h2>
            </motion.div>
            <div className="w-32 h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500 mx-auto rounded-full" />
            <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
              Experts in AI, automation, and scalable architecture
            </p>
          </motion.div>

          {/* Founders Loading/Empty States */}
          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading visionary leaders...</p>
            </div>
          ) : founders.length === 0 ? (
            <div className="text-center py-20">
              <Crown className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Visionary Leaders Found</h3>
              <p className="text-muted-foreground">We're currently updating our leadership information.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-10 md:grid-cols-3 max-w-7xl mx-auto"
            >
              {founders.map((member, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="group relative"
                  whileHover={{ y: -20, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link href={`/team/${generateSlug(member.name)}`}>
                    <Card className="h-full overflow-hidden border-0 bg-gradient-to-br from-white/40 to-white/40 backdrop-blur-xl shadow-2xl cursor-pointer">

                      <div className="relative h-72 overflow-hidden">
                        <motion.div
                          className="relative w-full h-full"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Image
                            src={member.image || "/brand/avatar.svg"}
                            alt={member.name}
                            fill
                            className="object-cover object-top bg-white transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            loading="lazy"
                          />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/20 to-transparent" />

                        {/* Floating Crown */}
                        <motion.div
                          className="absolute top-6 right-6"
                          animate={{ y: [-5, 5, -5] }}
                          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                            <Crown className="w-6 h-6 text-white" />
                          </div>
                        </motion.div>

                        {/* Achievement Badges */}
                        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                          {member.achievements?.slice(0, 2).map((achievement: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
                              <Award className="w-3 h-3 mr-1" />
                              {achievement}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <CardContent className="p-7">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                            <p className="text-primary font-semibold text-base">{member.role}</p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div className="flex items-center gap-1 mb-1">
                              <MapPin className="w-3 h-3" />
                              {member.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Since {getYearFromDate(member.joinDate)}
                            </div>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-4 leading-relaxed text-sm line-clamp-2">
                          <span className="font-medium"></span> {member.education || "Not specified"}
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-3">
                          {Object.entries(member.social).map(([platform, url]) => {
                            const Icon =
                              platform === "linkedin"
                                ? Linkedin
                                : platform === "twitter"
                                  ? Twitter
                                  : platform === "github"
                                    ? Github
                                    : Mail
                            return (
                              <motion.div key={platform} whileHover={{ scale: 1.2, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary hover:text-white transition-all duration-300"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (url !== "#") window.open(url as string, '_blank');
                                  }}
                                >
                                  <Icon className="w-4 h-4" />
                                </Button>
                              </motion.div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Executive Leadership Section */}
      <section className="w-full py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-background" />
        <div className="container px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div className="flex items-center justify-center gap-4 mb-6" whileHover={{ scale: 1.05 }}>
              <Star className="w-10 h-10 text-primary" />
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Executive Leadership
              </h2>
            </motion.div>
            <div className="w-32 h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500 mx-auto rounded-full" />
            <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
              Strategic leaders driving operational excellence and innovation across all departments
            </p>
          </motion.div>

          {/* Executives Loading/Empty States */}
          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading executive leadership...</p>
            </div>
          ) : executives.length === 0 ? (
            <div className="text-center py-20">
              <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Executive Leadership Found</h3>
              <p className="text-muted-foreground">We're currently updating our executive team information.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-4 grid-cols-2 md:gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {executives.map((member, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="group relative"
                  whileHover={{ y: -15, rotateY: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link href={`/team/${generateSlug(member.name)}`}>
                    <Card className="h-full overflow-hidden border-0 bg-gradient-to-br from-white/40 to-white/40 backdrop-blur-xl shadow-2xl cursor-pointer">
                      <div className="relative h-48 md:h-72 overflow-hidden">
                        <motion.div
                          className="relative w-full h-full"
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Image
                            src={member.image || "/brand/avatar.svg"}
                            alt={member.name}
                            fill
                            className="object-cover object-top"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            loading="lazy"
                          />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/20 to-transparent" />

                        {/* Department Badge */}
                        <div className="absolute top-2 left-2 md:top-4 md:left-4">
                          <Badge className="bg-primary/90 text-white text-xs md:text-sm">{member.department}</Badge>
                        </div>

                        {/* Star Icon */}
                        <motion.div
                          className="absolute top-4 right-4"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
                            <Star className="w-5 h-5 text-white" />
                          </div>
                        </motion.div>
                      </div>

                      <CardContent className="p-3 md:p-6">
                        <div className="mb-2 md:mb-4">
                          <h3 className="text-sm md:text-xl font-bold mb-1">{member.name}</h3>
                          <p className="text-primary font-semibold text-xs md:text-sm">{member.role}</p>
                          <div className="flex items-center gap-2 md:gap-4 mt-1 md:mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-2 h-2 md:w-3 md:h-3" />
                              {member.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-2 h-2 md:w-3 md:h-3" />
                              {getYearFromDate(member.joinDate)}
                            </div>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-4 leading-relaxed text-sm line-clamp-2">
                          <span className="font-medium"></span> {member.education || "Not specified"}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1 mb-2 md:mb-4">
                          {member.skills?.slice(0, 2).map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-1 md:gap-2">
                          {Object.entries(member.social).slice(0, 2).map(([platform, url]) => {
                            const Icon =
                              platform === "linkedin"
                                ? Linkedin
                                : platform === "twitter"
                                  ? Twitter
                                  : platform === "github"
                                    ? Github
                                    : Mail
                            return (
                              <motion.div key={platform} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-6 h-6 md:w-8 md:h-8 rounded-full hover:bg-primary hover:text-white transition-all duration-300"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (url !== "#") window.open(url as string, '_blank');
                                  }}
                                >
                                  <Icon className="w-2 h-2 md:w-3 md:h-3" />
                                </Button>
                              </motion.div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Team Members Section */}
      <section className="w-full py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-blue-50/20 to-purple-50/10" />
        <div className="container px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              className="flex items-center justify-center gap-4 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Users className="w-10 h-10 text-primary" />
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Our Amazing Team
              </h2>
            </motion.div>
            <div className="w-32 h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500 mx-auto rounded-full" />
            <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
              Talented professionals from around the world, united by passion and innovation
            </p>
          </motion.div>

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading team members...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">
              <p>{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Team Members Found</h3>
              <p className="text-muted-foreground">We're currently updating our team information.</p>
            </div>
          ) : (
            /* Team Members Grid */
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-4 grid-cols-2 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {teamMembers.map((member, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="group relative"
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link href={`/team/${generateSlug(member.name)}`}>
                    <Card className="h-full overflow-hidden border-0 bg-gradient-to-br from-white/40 to-white/40 backdrop-blur-xl shadow-2xl cursor-pointer">
                      <div className="relative h-48 md:h-64 overflow-hidden">
                        <motion.div
                          className="relative w-full h-full"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Image
                            src={member.image || "/brand/avatar.svg"}
                            alt={member.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            loading="lazy"
                          />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/20 to-transparent" />

                        {/* Department Badge */}
                        <div className="absolute top-2 left-2 md:top-3 md:left-3">
                          <Badge className="text-xs border-0 text-white shadow-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500">
                            {member.department}
                          </Badge>
                        </div>

                        {/* Join Year */}
                        <div className="absolute top-2 right-2 md:top-3 md:right-3">
                          <div className="text-white text-xs bg-black/30 px-1 py-1 md:px-2 rounded-full backdrop-blur-sm">
                            {getYearFromDate(member.joinDate)}
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-3 md:p-5">
                        <div className="mb-2 md:mb-3">
                          <h3 className="text-sm md:text-lg font-bold mb-1">{member.name}</h3>
                          <p className="text-primary font-semibold text-xs md:text-sm">{member.role}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="w-2 h-2 md:w-3 md:h-3" />
                            {member.location}
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-4 leading-relaxed text-sm line-clamp-2">
                          <span className="font-medium"></span> {member.education || "Not specified"}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1 mb-2 md:mb-3">
                          {member.skills?.slice(0, 2).map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-1">
                          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-5 h-5 md:w-7 md:h-7 rounded-full hover:bg-primary hover:text-white transition-all duration-300"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (member.social?.linkedin !== "#") window.open(member.social.linkedin, '_blank');
                              }}
                            >
                              <Linkedin className="w-2 h-2 md:w-3 md:h-3" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-5 h-5 md:w-7 md:h-7 rounded-full hover:bg-primary hover:text-white transition-all duration-300"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (member.social?.twitter !== "#") window.open(member.social.twitter, '_blank');
                              }}
                            >
                              <Twitter className="w-2 h-2 md:w-3 md:h-3" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-5 h-5 md:w-7 md:h-7 rounded-full hover:bg-primary hover:text-white transition-all duration-300"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (member.social?.github !== "#") window.open(member.social.github, '_blank');
                              }}
                            >
                              <Github className="w-2 h-2 md:w-3 md:h-3" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-5 h-5 md:w-7 md:h-7 rounded-full hover:bg-primary hover:text-white transition-all duration-300"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (member.social?.email !== "#") window.location.href = `mailto:${member.social.email}`;
                              }}
                            >
                              <Mail className="w-2 h-2 md:w-3 md:h-3" />
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Alumni Section */}
      <section className="w-full py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-muted/20" />
        <div className="container px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div className="flex items-center justify-center gap-4 mb-6" whileHover={{ scale: 1.05 }}>
              <Heart className="w-10 h-10 text-muted-foreground" />
              <h2 className="text-4xl md:text-5xl font-bold text-muted-foreground">Our Alumni</h2>
            </motion.div>
            <div className="w-32 h-1 bg-gradient-to-r from-muted-foreground to-muted mx-auto rounded-full" />
            <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
              Valued contributors who helped shape our journey and continue to inspire us
            </p>
          </motion.div>

          {/* Alumni Loading/Empty States */}
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-muted-foreground mx-auto"></div>
            </div>
          ) : alumniMembers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No alumni members to display.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-4 grid-cols-2 md:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto"
            >
              {alumniMembers.map((member, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="group relative"
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="h-full overflow-hidden border-0 bg-gradient-to-br from-muted/20 to-muted/10 backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-500 opacity-80">
                    <div className="relative h-40 md:h-56 overflow-hidden">
                      <motion.div
                        className="relative w-full h-full"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Image
                          src={member.image || "/brand/avatar.svg"}
                          alt={member.name}
                          fill
                          className="object-cover bg-white grayscale group-hover:grayscale-0 transition-all duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          loading="lazy"
                        />
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-transparent" />

                      {/* Alumni Badge */}
                      <div className="absolute top-2 right-2 md:top-4 md:right-4">
                        <Badge className="bg-muted text-muted-foreground text-xs">Alumni</Badge>
                      </div>

                      {/* Tenure */}
                      <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4">
                        <div className="text-white text-xs bg-black/40 px-1 py-1 md:px-2 rounded-full backdrop-blur-sm">
                          {getYearFromDate(member.joinDate)} -
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-3 md:p-6">
                      <div className="mb-2 md:mb-4">
                        <h3 className="text-sm md:text-xl font-bold mb-1 text-muted-foreground">{member.name}</h3>
                        <p className="text-muted-foreground/80 font-semibold text-xs md:text-sm">{member.role}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground/70">
                          <MapPin className="w-2 h-2 md:w-3 md:h-3" />
                          {member.location}
                        </div>
                      </div>

                      <p className="text-muted-foreground/70 text-xs md:text-sm mt-2">
                        <span className="font-medium"></span> {member.education || "Not specified"}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-blue-50/50 to-purple-50/30" />
        <div className="container px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Join Our Team?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              We're always looking for passionate individuals who want to make a difference in the world of AI and
              technology.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white px-8 py-4 text-lg rounded-full shadow-xl"
              >
                View Open Positions
              </Button>
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

      {/* Team Member Modal */}
      <TeamModal
        member={selectedMember}
        isOpen={open}
        onClose={() => {
          setOpen(false)
          setSelectedMember(null)
        }}
      />
    </div>
  )
}