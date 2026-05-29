"use client"

import { motion } from "framer-motion"
import {
  Ban,
  AlertCircle,
  CreditCard,
  ShoppingCart,
  Shield,
  Mail,
  MapPin,
  Phone,
  FileText,
  BookOpen,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function RefundPolicyPage() {
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  }

  // Refund Policy sections – clear and concise
  const sections = [
    {
      title: "1. No Refund Policy",
      icon: <Ban className="size-6" />,
      content: [
        "NILAYA AI does not accept any refund requests once an order is placed and payment is confirmed. All sales are final.",
        "This policy applies to all products and services offered on our Platform, including but not limited to software licenses, subscriptions, development services, and digital products.",
      ],
    },
    {
      title: "2. Why No Refunds?",
      icon: <AlertCircle className="size-6" />,
      content: [
        "Our products and services are digital in nature and are delivered immediately upon purchase. Once access is granted or work has commenced, the value is consumed and cannot be returned.",
        "We invest significant resources into each project and license, and this policy allows us to maintain competitive pricing and high-quality standards for all our customers.",
      ],
    },
    {
      title: "3. Review Before Purchase",
      icon: <ShoppingCart className="size-6" />,
      content: [
        "We strongly encourage you to carefully review all product details, specifications, and requirements before completing your purchase.",
        "If you have any questions about a product or service, please contact our support team before placing your order. We are happy to provide additional information, demos, or consultations to help you make an informed decision.",
      ],
    },
    {
      title: "4. Exceptions & Support",
      icon: <Shield className="size-6" />,
      content: [
        "While we do not offer refunds, we are committed to your satisfaction. If you experience technical issues or have concerns about your purchase, please contact us immediately.",
        "We will work diligently to resolve any problems, provide replacements for defective products, or offer credits toward future purchases in exceptional circumstances at our sole discretion.",
        "All exception requests are evaluated on a case-by-case basis and are not guaranteed.",
      ],
    },
    {
      title: "5. Chargebacks & Disputes",
      icon: <CreditCard className="size-6" />,
      content: [
        "Initiating a chargeback or payment dispute without first contacting us may result in permanent suspension of your account and legal action to recover costs incurred.",
        "If you believe a charge has been made in error, please contact us immediately so we can investigate and resolve the issue amicably.",
      ],
    },
    {
      title: "6. Contact Us",
      icon: <Mail className="size-6" />,
      content: [
        "For any questions or concerns regarding this Refund Policy, please reach out to us:",
        "NILAYA AI",
        "TRIDENT GALAXY APARTMENT, KALINGANAGAR,",
        "Remote-first HQ",
        "Email: billing@nilaya.ai",
        "Phone: +91 7008639757",
      ],
    },
  ]

  // Deterministic background elements – hydration‑safe
  const refundIcons = ["💳", "🛒", "🚫", "⚠️", "📦", "✅", "🔒", "📋"]
  const dotPositions = Array.from({ length: 30 }, (_, i) => ({
    left: `${(i * 7) % 100}%`,
    top: `${(i * 11) % 100}%`,
    delay: i * 0.2,
    duration: 8 + (i % 10),
  }))

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Hero Section – Refund‑themed, same elegant design */}
      <section className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-primary/90 to-rose-950">
        {/* Subtle, deterministic background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(79,70,229,0.15)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(244,63,94,0.1)_0%,_transparent_50%)]" />
          
          {/* Deterministic floating refund icons */}
          <div className="absolute inset-0">
            {refundIcons.map((icon, i) => (
              <motion.div
                key={i}
                className="absolute text-white/5 text-7xl"
                initial={{ 
                  x: `${(i * 13) % 80}%`, 
                  y: `${(i * 17) % 80}%`, 
                  rotate: i * 45,
                  scale: 0.8 
                }}
                animate={{ 
                  y: [`${(i * 17) % 80}%`, `${(i * 17 + 5) % 80}%`, `${(i * 17) % 80}%`],
                  rotate: [i * 45, i * 45 + 10, i * 45],
                  scale: [0.8, 0.9, 0.8],
                }}
                transition={{
                  duration: 13 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              >
                {icon}
              </motion.div>
            ))}
          </div>

          {/* Deterministic dots – subtle, clean */}
          <div className="absolute inset-0">
            {dotPositions.slice(0, 20).map((pos, i) => (
              <motion.div
                key={i}
                className="absolute size-1 bg-white/20 rounded-full"
                style={{ left: pos.left, top: pos.top }}
                animate={{ 
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: pos.duration,
                  repeat: Infinity,
                  delay: pos.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              className="mb-8 flex justify-center"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0],
              }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <div className="relative">
                <div className="size-28 bg-gradient-to-br from-white to-rose-100 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20">
                  <Ban className="size-14 text-primary" />
                </div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-white rounded-3xl blur-2xl"
                />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="bg-gradient-to-r from-white via-rose-100 to-slate-200 bg-clip-text text-transparent">
                Refund Policy
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto"
            >
              All sales are final. Please review carefully before purchasing.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Badge className="bg-white/10 text-white backdrop-blur-sm border-white/20 px-4 py-2 text-sm">
                <FileText className="size-4 mr-2" /> Effective Date: 1st Jan 2025
              </Badge>
              <Badge className="bg-white/10 text-white backdrop-blur-sm border-white/20 px-4 py-2 text-sm">
                <Ban className="size-4 mr-2" /> No Refunds
              </Badge>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Refund Policy Content Section – same elegant card style */}
      <section className="w-full py-20 md:py-28 bg-background">
        <div className="container px-4 md:px-6 max-w-6xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {sections.map((section, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                className="group"
              >
                <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300 bg-gradient-to-br from-card to-rose-50/5 shadow-lg hover:shadow-xl">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 size-12 rounded-full bg-gradient-to-br from-primary/10 to-rose-600/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        {section.icon}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-rose-600 bg-clip-text text-transparent">
                          {section.title}
                        </h2>
                        <div className="space-y-3">
                          {section.content.map((paragraph, pIdx) => (
                            <p key={pIdx} className="text-muted-foreground leading-relaxed">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-16 text-center"
          >
            <Badge variant="outline" className="px-6 py-3 text-base border-primary/30 bg-primary/5">
              <AlertCircle className="size-5 mr-2 text-primary" />
              This Refund Policy was last updated on 1st January 2025
            </Badge>
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
  )
}