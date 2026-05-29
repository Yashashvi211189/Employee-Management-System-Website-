"use client";

import { motion } from "framer-motion";
import { FlaskConical, Calendar, Clock, Rocket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail } from "lucide-react";

export default function ResearchPage() {
  const sectionFade = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* HERO SECTION */}
      <section className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-primary/10">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute left-20 top-20 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 14, repeat: Infinity }}
            className="absolute right-20 bottom-20 w-52 h-52 bg-blue-500/20 rounded-full blur-2xl"
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={sectionFade}
            className="space-y-8"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <FlaskConical className="size-12 text-white" />
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
              Research &{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 text-transparent bg-clip-text">
                Development
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Building the future of educational technology through cutting-edge research and innovation.
            </p>

            {/* Coming Soon Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-full border border-primary/20"
            >
              <Clock className="size-5 text-primary" />
              <span className="text-primary font-semibold">Launching Soon</span>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto pt-4"
            >
              Our R&D division is currently working behind the scenes on revolutionary AI-powered educational solutions. 
              We're preparing to unveil groundbreaking research that will transform how institutions teach and students learn.
            </motion.p>

            {/* Stay Updated CTA */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="pt-8"
            >
              <Link href="/contact">
                <Button 
                  size="lg" 
                  className="rounded-full px-8 py-6 text-lg bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                >
                  <Rocket className="mr-3 size-5" />
                  Get Early Access Updates
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                Be the first to know when our research papers and prototypes are released
              </p>
            </motion.div> */}
          </motion.div>
        </div>
      </section>

      
      {/* CTA SECTION */}
      <section className="w-full py-20 bg-gradient-to-br from-primary/5 to-blue-50">
        <div className="container px-4 md:px-6">
          <motion.div
            variants={sectionFade}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Interested in Our Research?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Partner with us, contribute to our studies, or simply stay updated with our latest breakthroughs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" variant="default" className="rounded-full px-8">
                  Schedule a Research Briefing
                </Button>
              </Link>
              {/* <Link href="/subscribe">
                <Button size="lg" variant="outline" className="rounded-full px-8">
                  Subscribe to Updates
                </Button>
              </Link> */}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t bg-background/95 backdrop-blur-sm">
        <div className="container px-4 py-10 md:px-6 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Company Info */}
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

            {/* Company */}
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
                    href="/blog"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/team"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Career
                  </Link>
                </li>
                <li>
                  <Link
                    href="/holidays"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Holidays
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
                    Refund & Returns Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="text-sm font-bold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    FlowGrid Orchestration
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    SignalIQ Analytics
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Atlas Knowledge Hub
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    OpsPulse Console
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
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
                    href="/digital-marketing"
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

          {/* Contact Info */}
          <div className="border-t border-border/40 pt-8 mt-8">
            <h4 className="text-sm font-bold mb-4">Contact</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <MapPin className="size-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Remote-first HQ</p>
                  <p className="text-muted-foreground">
                    Serving North America, Europe, and APAC
                  </p>
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

          {/* Copyright */}
          <div className="flex flex-col gap-4 sm:flex-row justify-between items-center border-t border-border/40 pt-8 mt-8">
            <p className="text-xs text-muted-foreground">
              © 2024 Nilaya AI. All Rights Reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
