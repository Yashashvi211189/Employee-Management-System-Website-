"use client"
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useState, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  Youtube,
  Palette,
  Globe,
  DollarSign,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Sparkles,
  Zap,
  Play,
  PenTool,
  MousePointer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";

export default function DigitalMarketingPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  }

  const services = [
    {
      title: "AI Growth Systems",
      icon: <Globe className="size-8" />,
      color: "from-indigo-500 to-cyan-600",
      features: [
        "Lifecycle automation & routing",
        "AI lead scoring & enrichment",
        "Multichannel campaign orchestration",
        "Conversion analytics & dashboards",
        "Experimentation playbooks",
      ],
    },
    {
      title: "Content Intelligence Studio",
      icon: <Youtube className="size-8" />,
      color: "from-emerald-500 to-teal-600",
      features: [
        "AI content briefs & outlines",
        "Product demo storytelling",
        "SEO knowledge base pipelines",
        "Campaign sequencing & repurposing",
        "Brand-safe review workflows",
      ],
    },
    {
      title: "Brand Systems & Design",
      icon: <Palette className="size-8" />,
      color: "from-violet-500 to-indigo-600",
      features: [
        "Messaging architecture",
        "Visual identity kits",
        "Sales enablement assets",
        "Launch playbooks",
        "Guidelines & governance",
      ],
    },
    {
      title: "YouTube Production & Distribution",
      icon: <Youtube className="size-8" />,
      color: "from-red-500 to-pink-600",
      features: [
        "Video production planning",
        "Editing, motion, and packaging",
        "Channel positioning & optimization",
        "Promotion and paid distribution",
        "Search-first content strategy",
      ],
    },
    {
      title: "Content Ops & Identity Creation",
      icon: <Palette className="size-8" />,
      color: "from-purple-500 to-indigo-600",
      features: [
        "Logo and brand kit creation",
        "Stationery templates",
        "Launch storytelling assets",
        "Social content operations",
        "Brand guidelines & governance",
      ],
    },
  ]

  const whyChooseUs = [
    {
      icon: <DollarSign className="size-6" />,
      title: "Outcome-Driven",
      description: "Every engagement is mapped to measurable revenue or efficiency gains.",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: <Zap className="size-6" />,
      title: "Rapid Execution",
      description: "We pilot fast, validate quickly, and scale what works.",
      color: "from-indigo-500 to-cyan-600",
    },
    {
      icon: <Users className="size-6" />,
      title: "Partner Mindset",
      description: "Embedded teams that align with your roadmap and KPIs.",
      color: "from-violet-500 to-indigo-600",
    },
  ]

  const packages = {
    youtube: [
      {
        name: "Automation Sprint",
        price: "$2,000",
        period: "/month",
        features: [
          "Workflow discovery",
          "Automation blueprint",
          "Pilot workflow build",
          "KPI baseline",
          "Handoff playbook",
        ],
        popular: false,
      },
      {
        name: "Workflow Accelerator",
        price: "$4,500",
        period: "/month",
        features: [
          "2-3 automated workflows",
          "Data connector setup",
          "LLM prompt library",
          "Monitoring dashboard",
          "Team enablement",
        ],
        popular: true,
      },
      {
        name: "Enterprise Automation",
        price: "$8,000",
        period: "/month",
        features: [
          "Multi-team orchestration",
          "Governance & access controls",
          "SLA-backed support",
          "Advanced evaluation suite",
          "Change management",
        ],
        popular: false,
      },
    ],
    branding: [
      {
        name: "Content Ops Starter",
        price: "$1,200",
        period: "/month",
        features: [
          "AI content briefs",
          "Editorial calendar",
          "Brand voice guides",
          "Review workflow",
        ],
        popular: false,
      },
      {
        name: "Content Ops Pro",
        price: "$2,600",
        period: "/month",
        features: [
          "Repurposing pipeline",
          "SEO optimization",
          "Performance reporting",
          "Asset library",
        ],
        popular: true,
      },
      {
        name: "Content Ops Studio",
        price: "$4,200",
        period: "/month",
        features: [
          "Multichannel campaigns",
          "Video + demo scripting",
          "Messaging architecture",
          "Launch support",
        ],
        popular: false,
      },
    ],
    digital: [
      {
        name: "Growth Systems",
        price: "$3,500",
        period: "/month",
        features: [
          "Lifecycle automation",
          "Conversion tracking",
          "Experimentation roadmap",
          "Weekly KPI review",
        ],
        popular: false,
      },
      {
        name: "Revenue Ops Sync",
        price: "$6,500",
        period: "/month",
        features: [
          "Sales + marketing alignment",
          "Lead scoring models",
          "Attribution dashboards",
          "Team training",
        ],
        popular: true,
      },
      {
        name: "Enterprise Growth",
        price: "$12,000",
        period: "/month",
        features: [
          "Multi-region rollout",
          "Advanced governance",
          "Custom integrations",
          "Dedicated success pod",
        ],
        popular: false,
      },
    ],
  }

  const addOnServices = [
    {
      title: "Automation Opportunity Audit",
      description:
        "A structured review of workflows, data, and tooling to identify quick wins.",
      price: "From $1,200",
      note: "per workflow",
      icon: <MousePointer className="size-6" />,
    },
    {
      title: "AI Design Sprint",
      description: "A focused sprint to prototype, validate, and scope your AI initiative.",
      price: "From $2,500",
      icon: <PenTool className="size-6" />,
    },
  ]

  const testimonials = [
    {
      name: "Maya Chen",
      content:
        "Nilaya AI helped us automate lead routing and campaign ops in weeks. Conversion rates climbed immediately.",
      rating: 5,
      image: "/brand/avatar.svg",
    },
    {
      name: "Jared Holt",
      content:
        "Their team blended AI strategy with execution. We shipped faster and stayed aligned to KPIs.",
      rating: 5,
      image: "/brand/avatar.svg",
    },
    {
      name: "Priya Rao",
      content:
        "The automation roadmap was clear, measurable, and delivered real time savings for our team.",
      rating: 5,
      image: "/brand/avatar.svg",
    },
  ]

  return (
    <div ref={containerRef} className="flex min-h-[100dvh] flex-col">
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-blue-50/50 to-purple-50/30">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              y: [0, -30, 0],
              x: [0, 30, 0],
            }}
            transition={{
              duration: 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"
          />
        </div>

        <div className="container px-4 md:px-6 relative z-10 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="size-4" />
              AI Growth Systems
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              About Our{" "}
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
              >
                Growth Systems
              </motion.span>{" "}
              Services
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed"
            >
              Move from manual campaigns to automated, data-driven growth. Nilaya AI builds intelligent systems that align sales, marketing, and operations.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-lg text-muted-foreground mb-10 max-w-3xl mx-auto"
            >
              We connect data sources, orchestrate messaging, and measure impact so your teams stay focused on strategy and outcomes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button size="lg" className="rounded-full h-14 px-10 text-lg group">
                Start Free Consultation
                <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-10 text-lg">
                View Our Portfolio
                <Play className="ml-2 size-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
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

      {/* Why Choose Us Section */}
      <section className="w-full py-20 md:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Teams Choose Nilaya AI</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We combine innovation, expertise, and dedication to deliver exceptional results
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {whyChooseUs.map((item, i) => (
              <motion.div key={i} variants={itemVariants} whileHover={{ y: -10 }} className="group">
                <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-blue-50/30 backdrop-blur transition-all hover:shadow-xl">
                  <CardContent className="p-8">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`size-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-6 shadow-lg`}
                    >
                      {item.icon}
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-b from-blue-50/30 to-background">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Services We Provide</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive digital marketing solutions tailored to your business needs
          </p>
        </motion.div>

        {/* Desktop Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="hidden md:grid gap-8 md:grid-cols-3"
        >
          {services.map((service, i) => (
            <motion.div key={i} variants={itemVariants} whileHover={{ scale: 1.05 }} className="group">
              <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/20 backdrop-blur transition-all hover:shadow-2xl">
                <div className={`h-2 bg-gradient-to-r ${service.color}`} />
                <CardContent className="p-8">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    whileHover={{ rotate: 360 }}
                    className={`size-16 rounded-full bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-6 shadow-lg mx-auto`}
                  >
                    {service.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold mb-6 text-center">{service.title}</h3>
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle className="size-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Slider */}
        <div className="md:hidden">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={16}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
          >
            {services.map((service, i) => (
              <SwiperSlide key={i}>
                <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/20 backdrop-blur transition-all hover:shadow-2xl">
                  <div className={`h-2 bg-gradient-to-r ${service.color}`} />
                  <CardContent className="p-8">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      whileHover={{ rotate: 360 }}
                      className={`size-16 rounded-full bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-6 shadow-lg mx-auto`}
                    >
                      {service.icon}
                    </motion.div>
                    <h3 className="text-xl font-bold mb-6 text-center">{service.title}</h3>
                    <ul className="space-y-3">
                      {service.features.map((feature, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle className="size-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>

      {/* Packages Section */}
      <section className="w-full py-20 md:py-32 bg-background">
  <div className="container px-4 md:px-6">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="text-center mb-16"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Automation Packages</h2>
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
        Choose a package that matches your automation maturity and growth goals
      </p>
    </motion.div>

    <Tabs defaultValue="youtube" className="w-full">
      <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-12">
        <TabsTrigger value="youtube" className="gap-2">
          <Youtube className="size-4" />
          Automation
        </TabsTrigger>
        <TabsTrigger value="branding" className="gap-2">
          <Palette className="size-4" />
          Content Ops
        </TabsTrigger>
        <TabsTrigger value="digital" className="gap-2">
          <Globe className="size-4" />
          Growth Systems
        </TabsTrigger>
      </TabsList>

      {Object.entries(packages).map(([key, categoryPackages]) => (
        <TabsContent key={key} value={key}>
          {/* Desktop Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="hidden md:grid gap-8 md:grid-cols-3"
          >
            {categoryPackages.map((pkg, i) => (
              <motion.div key={i} variants={itemVariants} whileHover={{ y: -10 }} className="relative">
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card
                  className={`h-full overflow-hidden transition-all hover:shadow-2xl ${
                    pkg.popular ? "border-primary shadow-lg" : "border-border/40"
                  }`}
                >
                  <CardHeader className="text-center pb-8 pt-8">
                    <CardTitle className="text-2xl mb-4">{pkg.name}</CardTitle>
                    <div className="flex items-baseline justify-center gap-1">
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                        className="text-4xl font-bold"
                      >
                        {pkg.price}
                      </motion.span>
                      <span className="text-muted-foreground">{pkg.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="size-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <motion.div
                      className="h-1 bg-primary/20 rounded-full overflow-hidden mb-6"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "0%" }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 1 }}
                      />
                    </motion.div>
                    <Button
                      className={`w-full ${pkg.popular ? "" : "variant-outline"}`}
                      variant={pkg.popular ? "default" : "outline"}
                      onClick={() => setSelectedPackage(`${key}-${i}`)}
                    >
                      Get Started
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile Slider */}
          <div className="md:hidden">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              pagination={{ clickable: true }}
              navigation
            >
              {categoryPackages.map((pkg, i) => (
                <SwiperSlide key={i}>
                  <motion.div variants={itemVariants} whileHover={{ y: -10 }} className="relative">
                    {pkg.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <Card
                      className={`h-full overflow-hidden transition-all hover:shadow-2xl ${
                        pkg.popular ? "border-primary shadow-lg" : "border-border/40"
                      }`}
                    >
                      <CardHeader className="text-center pb-8 pt-8">
                        <CardTitle className="text-2xl mb-4">{pkg.name}</CardTitle>
                        <div className="flex items-baseline justify-center gap-1">
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                            className="text-4xl font-bold"
                          >
                            {pkg.price}
                          </motion.span>
                          <span className="text-muted-foreground">{pkg.period}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-8">
                        <ul className="space-y-3 mb-8">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <CheckCircle className="size-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <motion.div
                          className="h-1 bg-primary/20 rounded-full overflow-hidden mb-6"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        >
                          <motion.div
                            className="h-full bg-primary"
                            initial={{ width: "0%" }}
                            whileHover={{ width: "100%" }}
                            transition={{ duration: 1 }}
                          />
                        </motion.div>
                        <Button
                          className={`w-full ${pkg.popular ? "" : "variant-outline"}`}
                          variant={pkg.popular ? "default" : "outline"}
                          onClick={() => setSelectedPackage(`${key}-${i}`)}
                        >
                          Get Started
                          <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  </div>
</section>

      {/* Add-On Services */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-b from-blue-50/30 to-background">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Add-On Services</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Enhance your packages with the following services
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto"
          >
            {addOnServices.map((service, i) => (
              <motion.div key={i} variants={itemVariants} whileHover={{ scale: 1.02 }} className="group">
                <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/20 backdrop-blur transition-all hover:shadow-xl">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        {service.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                        <p className="text-muted-foreground mb-4">{service.description}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-semibold text-primary">{service.price}</span>
                          {service.note && <span className="text-sm text-muted-foreground">{service.note}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-20 md:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied clients
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {testimonials.map((testimonial, i) => (
              <motion.div key={i} variants={itemVariants} whileHover={{ y: -10 }} className="group">
                <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-blue-50/30 backdrop-blur transition-all hover:shadow-xl">
                  <CardContent className="p-8">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, idx) => (
                        <Star key={idx} className="size-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-full overflow-hidden bg-muted">
                        <img
                          src={testimonial.image || "/brand/avatar.svg"}
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to automate growth with Nilaya AI?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">Get in Touch with Us Today</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="secondary" className="rounded-full h-14 px-10 text-lg group">
                Start Free Consultation
                <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
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
  )
}
