"use client"

import { motion } from "framer-motion"
import {
  Shield,
  Lock,
  Eye,
  User,
  Database,
  Cookie,
  Mail,
  MapPin,
  Phone,
  FileText,
  AlertCircle,
  Globe,
  CheckCircle,
  BookOpen,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function PrivacyPolicyPage() {
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

  // Privacy Policy sections – structured for clarity and completeness
  const sections = [
    {
      title: "1. Introduction",
      icon: <BookOpen className="size-6" />,
      content: [
        "This Privacy Policy describes how NILAYA AI (hereinafter referred to as 'Platform Owner', 'we', 'us', 'our') collects, uses, stores, shares and protects your personal information when you access or use our website https://nilaya.ai/, mobile application, and related services (collectively, the 'Platform').",
        "We are committed to protecting your privacy and ensuring that your personal information is handled responsibly. This Privacy Policy applies to all users of the Platform, including visitors, registered users, and customers.",
        "By accessing or using the Platform, you acknowledge that you have read and understood this Privacy Policy and agree to the collection, use, and disclosure of your information as described herein. If you do not agree with any part of this policy, please do not use our Platform.",
      ],
    },
    {
      title: "2. Information We Collect",
      icon: <Database className="size-6" />,
      content: [
        "We collect several types of information from and about users of our Platform, including:",
        "a) Personal Information: Information that identifies you personally, such as your name, email address, phone number, postal address, date of birth, government-issued identification numbers, and payment information.",
        "b) Non-Personal Information: Information that does not directly identify you, such as your browser type, device type, operating system, IP address, referring URLs, and usage data about how you interact with our Platform.",
        "c) Cookies and Tracking Technologies: We and our service providers may use cookies, web beacons, pixel tags, and similar technologies to collect information about your browsing activities and to remember your preferences.",
        "We collect this information when you register an account, fill out forms, make purchases, participate in surveys, contact customer support, or otherwise interact with our Platform.",
      ],
    },
    {
      title: "3. How We Use Your Information",
      icon: <Eye className="size-6" />,
      content: [
        "We use the information we collect for various purposes, including:",
        "• To provide, operate, and maintain our Platform and services.",
        "• To process your transactions and send you related information, including purchase confirmations and invoices.",
        "• To send you technical notices, updates, security alerts, and support and administrative messages.",
        "• To respond to your comments, questions, and requests and provide customer service.",
        "• To communicate with you about products, services, offers, promotions, and events and provide other news or information about us and our partners.",
        "• To monitor and analyze trends, usage, and activities in connection with our Platform.",
        "• To detect, investigate, and prevent fraudulent transactions and other illegal activities and protect the rights and property of NILAYA AI and others.",
        "• To personalize your experience and deliver content and product offerings relevant to your interests.",
        "• For any other purpose with your consent.",
      ],
    },
    {
      title: "4. Cookies and Tracking Technologies",
      icon: <Cookie className="size-6" />,
      content: [
        "We use cookies and similar tracking technologies to track activity on our Platform and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.",
        "You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Platform.",
        "We use both session cookies (which expire once you close your web browser) and persistent cookies (which stay on your computer until you delete them).",
        "Third-party service providers, such as analytics providers, may also use cookies or similar technologies to collect information about your online activities over time and across different websites.",
      ],
    },
    {
      title: "5. How We Share Your Information",
      icon: <Globe className="size-6" />,
      content: [
        "We do not sell, trade, or rent your personal information to third parties without your explicit consent, except in the following circumstances:",
        "a) Service Providers: We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf (e.g., payment processing, data analysis, email delivery, hosting services).",
        "b) Business Transfers: If we are involved in a merger, acquisition, financing due diligence, reorganization, bankruptcy, receivership, sale of company assets, or transition of service to another provider, your information may be transferred as part of such transaction.",
        "c) Legal Compliance: We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).",
        "d) Protection of Rights: We may disclose your information to enforce our terms and conditions, protect our rights, privacy, safety, or property, and that of our affiliates, you, or others.",
        "We require third parties to respect the security of your data and to treat it in accordance with applicable law.",
      ],
    },
    {
      title: "6. Data Security",
      icon: <Lock className="size-6" />,
      content: [
        "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, firewalls, secure socket layer technology (SSL), and access controls.",
        "However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.",
        "You are responsible for maintaining the confidentiality of your account credentials and for any activities that occur under your account. Please notify us immediately of any unauthorized use of your account.",
      ],
    },
    {
      title: "7. Your Rights and Choices",
      icon: <User className="size-6" />,
      content: [
        "Depending on your jurisdiction, you may have the following rights regarding your personal information:",
        "• Access: You may request a copy of the personal information we hold about you.",
        "• Correction: You may request that we correct inaccurate or incomplete information.",
        "• Deletion: You may request that we delete your personal information, subject to certain exceptions.",
        "• Objection: You may object to our processing of your personal information.",
        "• Restriction: You may request that we restrict the processing of your personal information.",
        "• Portability: You may request to receive your personal information in a structured, commonly used, and machine-readable format.",
        "• Withdraw Consent: Where we rely on consent to process your information, you may withdraw that consent at any time.",
        "To exercise these rights, please contact us using the information provided in the 'Contact Us' section. We will respond to your request in accordance with applicable law.",
      ],
    },
    {
      title: "8. Data Retention",
      icon: <Database className="size-6" />,
      content: [
        "We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).",
        "When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize it. If this is not possible (for example, because your information has been stored in backup archives), we will securely store your information and isolate it from any further processing until deletion is possible.",
      ],
    },
    {
      title: "9. Children's Privacy",
      icon: <Shield className="size-6" />,
      content: [
        "Our Platform is not intended for children under the age of 13 (or the age of majority in your jurisdiction). We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information without parental consent, please contact us. If we become aware that we have collected personal information from a child without verification of parental consent, we will take steps to remove that information from our servers.",
      ],
    },
    {
      title: "10. International Data Transfers",
      icon: <Globe className="size-6" />,
      content: [
        "Your information may be transferred to, and maintained on, computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those in your jurisdiction.",
        "If you are located outside India and choose to provide information to us, please note that we transfer the data, including personal information, to India and process it there. By using our Platform, you consent to such transfer and processing.",
        "We will take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy.",
      ],
    },
    {
      title: "11. Changes to This Privacy Policy",
      icon: <FileText className="size-6" />,
      content: [
        "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Effective Date' at the top.",
        "You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page. Your continued use of the Platform after any changes indicates your acceptance of the updated Privacy Policy.",
      ],
    },
    {
      title: "12. Contact Us",
      icon: <Mail className="size-6" />,
      content: [
        "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:",
        "NILAYA AI",
        "TRIDENT GALAXY APARTMENT, KALINGANAGAR,",
        "Remote-first HQ",
        "Email: privacy@nilaya.ai",
        "Phone: +91 7008639757",
        "We will attempt to resolve your complaint or request within a reasonable timeframe.",
      ],
    },
  ]

  // Deterministic background elements – hydration‑safe
  const privacyIcons = ["🔒", "🛡️", "👁️", "🔐", "📊", "📋", "🔏", "🗄️"]
  const dotPositions = Array.from({ length: 30 }, (_, i) => ({
    left: `${(i * 7) % 100}%`,
    top: `${(i * 11) % 100}%`,
    delay: i * 0.2,
    duration: 8 + (i % 10),
  }))

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Hero Section – Privacy‑themed, identical design language */}
      <section className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-primary/90 to-purple-950">
        {/* Subtle, deterministic background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(79,70,229,0.15)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.1)_0%,_transparent_50%)]" />
          
          {/* Deterministic floating privacy icons */}
          <div className="absolute inset-0">
            {privacyIcons.map((icon, i) => (
              <motion.div
                key={i}
                className="absolute text-white/5 text-7xl"
                initial={{ 
                  x: `${(i * 12) % 80}%`, 
                  y: `${(i * 19) % 80}%`, 
                  rotate: i * 30,
                  scale: 0.8 
                }}
                animate={{ 
                  y: [`${(i * 19) % 80}%`, `${(i * 19 + 4) % 80}%`, `${(i * 19) % 80}%`],
                  rotate: [i * 30, i * 30 + 8, i * 30],
                  scale: [0.8, 0.9, 0.8],
                }}
                transition={{
                  duration: 14 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4,
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
                <div className="size-28 bg-gradient-to-br from-white to-purple-100 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20">
                  <Shield className="size-14 text-primary" />
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
              <span className="bg-gradient-to-r from-white via-purple-100 to-slate-200 bg-clip-text text-transparent">
                Privacy Policy
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto"
            >
              How we collect, use, and protect your information
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
                <Shield className="size-4 mr-2" /> Your Privacy Matters
              </Badge>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Policy Content Section – same elegant card style */}
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
                <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300 bg-gradient-to-br from-card to-purple-50/5 shadow-lg hover:shadow-xl">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 size-12 rounded-full bg-gradient-to-br from-primary/10 to-purple-600/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        {section.icon}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
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
              This Privacy Policy was last updated on 1st January 2025
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