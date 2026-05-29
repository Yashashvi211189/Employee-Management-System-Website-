"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Sparkles,
  PartyPopper,
  Flame,
  Heart,
  Star,
  Zap,
  Gift,
  Crown,
  Music,
  Phone,
  Mail,
  MapPin,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

export default function HolidaysPage() {
  const [activeYear, setActiveYear] = useState("2025")

  const holidays2025 = [
    {
      date: "1st Jan",
      name: "New Year's Day",
      icon: <PartyPopper className="size-8" />,
      color: "from-purple-500 to-pink-500",
      emoji: "🎉",
      description: "Start the year with joy and celebrations!",
    },
    {
      date: "26th Jan",
      name: "Republic Day",
      icon: <Star className="size-8" />,
      color: "from-orange-500 to-red-500",
      emoji: "🇮🇳",
      description: "Celebrating India's Constitution",
    },
    {
      date: "26th Feb",
      name: "Mahashivratri",
      icon: <Flame className="size-8" />,
      color: "from-blue-500 to-purple-500",
      emoji: "🔱",
      description: "The Great Night of Lord Shiva",
    },
    {
      date: "14th Mar",
      name: "Holi",
      icon: <Sparkles className="size-8" />,
      color: "from-pink-500 to-yellow-500",
      emoji: "🎨",
      description: "Festival of Colors and Spring",
    },
    {
      date: "15th Jun",
      name: "Raja",
      icon: <Heart className="size-8" />,
      color: "from-green-500 to-teal-500",
      emoji: "🌸",
      description: "Celebrating Womanhood and Earth",
    },
    {
      date: "27th Jun",
      name: "Rath Yatra",
      icon: <Crown className="size-8" />,
      color: "from-yellow-500 to-orange-500",
      emoji: "🛕",
      description: "Chariot Festival of Lord Jagannath",
    },
    {
      date: "15th Aug",
      name: "Independence Day",
      icon: <Star className="size-8" />,
      color: "from-orange-500 to-green-500",
      emoji: "🇮🇳",
      description: "Celebrating Freedom and Unity",
    },
    {
      date: "27th Aug",
      name: "Ganesh Chaturthi",
      icon: <Gift className="size-8" />,
      color: "from-red-500 to-pink-500",
      emoji: "🐘",
      description: "Birthday of Lord Ganesha",
    },
    {
      date: "2nd Oct",
      name: "Dussehra",
      icon: <Zap className="size-8" />,
      color: "from-yellow-500 to-red-500",
      emoji: "🏹",
      description: "Victory of Good over Evil",
    },
    {
      date: "20th Oct",
      name: "Diwali",
      icon: <Flame className="size-8" />,
      color: "from-yellow-500 to-orange-500",
      emoji: "🪔",
      description: "Festival of Lights",
    },
    {
      date: "25th Dec",
      name: "Christmas",
      icon: <Gift className="size-8" />,
      color: "from-red-500 to-green-500",
      emoji: "🎄",
      description: "Celebrating Joy and Giving",
    },
  ]

  const holidays2026 = [
    {
      date: "1st Jan",
      name: "New Year Day",
      icon: <PartyPopper className="size-8" />,
      color: "from-purple-500 to-pink-500",
      emoji: "🎉",
      description: "Start the year with joy and celebrations!",
    },
    {
      date: "26th Jan",
      name: "Republic Day",
      icon: <Star className="size-8" />,
      color: "from-orange-500 to-red-500",
      emoji: "🇮🇳",
      description: "Celebrating India's Constitution",
    },
    {
      date: "15th Feb",
      name: "Mahashivratri",
      icon: <Flame className="size-8" />,
      color: "from-blue-500 to-purple-500",
      emoji: "🔱",
      description: "The Great Night of Lord Shiva",
    },
    {
      date: "4th March",
      name: "Holi",
      icon: <Sparkles className="size-8" />,
      color: "from-pink-500 to-yellow-500",
      emoji: "🎨",
      description: "Festival of Colors and Spring",
    },
    {
      date: "14th June",
      name: "Raja",
      icon: <Heart className="size-8" />,
      color: "from-green-500 to-teal-500",
      emoji: "🌸",
      description: "Celebrating Womanhood and Earth",
    },
    {
      date: "16th July",
      name: "Rath Yatra",
      icon: <Crown className="size-8" />,
      color: "from-yellow-500 to-orange-500",
      emoji: "🛕",
      description: "Chariot Festival of Lord Jagannath",
    },
    {
      date: "15th Aug",
      name: "Independence day",
      icon: <Star className="size-8" />,
      color: "from-orange-500 to-green-500",
      emoji: "🇮🇳",
      description: "Celebrating Freedom and Unity",
    },
    {
      date: "16th Sept",
      name: "Ganesh Chaturthi",
      icon: <Gift className="size-8" />,
      color: "from-red-500 to-pink-500",
      emoji: "🐘",
      description: "Birthday of Lord Ganesha",
    },
    {
      date: "10th October",
      name: "Dusserah",
      icon: <Zap className="size-8" />,
      color: "from-yellow-500 to-red-500",
      emoji: "🏹",
      description: "Victory of Good over Evil",
    },
    {
      date: "8th Nov",
      name: "Diwali",
      icon: <Flame className="size-8" />,
      color: "from-yellow-500 to-orange-500",
      emoji: "🪔",
      description: "Festival of Lights",
    },
    {
      date: "25th Dec",
      name: "Christmas",
      icon: <Gift className="size-8" />,
      color: "from-red-500 to-green-500",
      emoji: "🎄",
      description: "Celebrating Joy and Giving",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Hero Section with Crazy Animations */}
      <section className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-purple-50/50 to-pink-50/30">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * 100 + "%",
                y: Math.random() * 100 + "%",
                scale: Math.random() * 0.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.3,
              }}
              animate={{
                y: [
                  Math.random() * 100 + "%",
                  Math.random() * -20 + "%",
                  Math.random() * 100 + "%",
                ],
                rotate: [0, 360],
              }}
              transition={{
                duration: Math.random() * 15 + 10,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute"
              style={{
                fontSize: `${Math.random() * 30 + 20}px`,
              }}
            >
              {["🎉", "🎊", "✨", "🎈", "🎁", "🌟", "💫", "🎆", "🎇"][
                Math.floor(Math.random() * 9)
              ]}
            </motion.div>
          ))}
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Animated Calendar Icon */}
            <motion.div
              className="mb-8 flex justify-center"
              animate={{
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="relative">
                <div className="size-24 bg-gradient-to-br from-primary to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Calendar className="size-12 text-white" />
                </div>
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 rounded-3xl blur-xl"
                />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Nilaya AI Calendar
              </span>
              <motion.span
                animate={{ rotate: [0, 20, 0, -20, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block ml-4"
              >
                🎉
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            >
              Celebrate Life, Culture & Joy with Our Team!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-4 justify-center items-center"
            >
              {["🎊", "✨", "🎈", "🌟"].map((emoji, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="text-4xl"
                >
                  {emoji}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute size-2 bg-primary/30 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                left: `${10 + (i * 6) % 80}%`,
                top: `${20 + (i * 8) % 60}%`,
              }}
            />
          ))}
        </div>
      </section>

      {/* Holidays List Section */}
      <section className="w-full py-20 md:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <Tabs
            defaultValue="2025"
            className="w-full"
            onValueChange={setActiveYear}
          >
            <div className="flex justify-center mb-12">
              <TabsList className="grid grid-cols-2 h-14 p-1 bg-muted/50 backdrop-blur-sm rounded-full">
                <TabsTrigger
                  value="2025"
                  className="rounded-full text-lg font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  🗓️ 2025
                </TabsTrigger>
                <TabsTrigger
                  value="2026"
                  className="rounded-full text-lg font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  🗓️ 2026
                </TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <TabsContent value="2025" className="mt-0">
                <motion.div
                  key="2025"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -20 }}
                  className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-x-auto md:overflow-visible"
                >
                  <div className="flex md:contents gap-4 md:gap-6 min-w-max md:min-w-0">
                  {holidays2025.map((holiday, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      whileHover={{
                        scale: 1.05,
                        rotate: [0, -2, 2, -2, 0],
                        transition: { duration: 0.5 },
                      }}
                      className="group"
                    >
                      <Card className="h-full overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
                        <CardContent className="p-0">
                          {/* Holiday Header with Gradient */}
                          <div
                            className={`relative h-32 bg-gradient-to-br ${holiday.color} p-6 overflow-hidden`}
                          >
                            <motion.div
                              animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 180, 360],
                              }}
                              transition={{
                                duration: 10,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="absolute -top-10 -right-10 text-white/20 text-8xl"
                            >
                              {holiday.emoji}
                            </motion.div>

                            <div className="relative z-10 flex items-center justify-between">
                              <div className="text-white">
                                {holiday.icon}
                              </div>
                              <Badge className="bg-white/20 text-white backdrop-blur-sm">
                                {holiday.date}
                              </Badge>
                            </div>

                            <motion.div
                              className="absolute bottom-4 left-6 text-6xl"
                              animate={{
                                rotate: [0, 10, -10, 0],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                              }}
                            >
                              {holiday.emoji}
                            </motion.div>
                          </div>

                          {/* Holiday Content */}
                          <div className="p-6">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                              {holiday.name}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {holiday.description}
                            </p>

                            <motion.div
                              className="mt-4 flex gap-2 flex-wrap"
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                            >
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="size-3 mr-1" />
                                {holiday.date}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Sparkles className="size-3 mr-1" />
                                Festival
                              </Badge>
                            </motion.div>
                          </div>

                          {/* Bottom Gradient */}
                          <motion.div
                            className={`h-1 bg-gradient-to-r ${holiday.color}`}
                            initial={{ scaleX: 0 }}
                            whileHover={{ scaleX: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="2026" className="mt-0">
                <motion.div
                  key="2026"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -20 }}
                  className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-x-auto md:overflow-visible"
                >
                  <div className="flex md:contents gap-4 md:gap-6 min-w-max md:min-w-0">
                  {holidays2026.map((holiday, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      whileHover={{
                        scale: 1.05,
                        rotate: [0, -2, 2, -2, 0],
                        transition: { duration: 0.5 },
                      }}
                      className="group"
                    >
                      <Card className="h-full overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
                        <CardContent className="p-0">
                          {/* Holiday Header with Gradient */}
                          <div
                            className={`relative h-32 bg-gradient-to-br ${holiday.color} p-6 overflow-hidden`}
                          >
                            <motion.div
                              animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 180, 360],
                              }}
                              transition={{
                                duration: 10,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="absolute -top-10 -right-10 text-white/20 text-8xl"
                            >
                              {holiday.emoji}
                            </motion.div>

                            <div className="relative z-10 flex items-center justify-between">
                              <div className="text-white">
                                {holiday.icon}
                              </div>
                              <Badge className="bg-white/20 text-white backdrop-blur-sm">
                                {holiday.date}
                              </Badge>
                            </div>

                            <motion.div
                              className="absolute bottom-4 left-6 text-6xl"
                              animate={{
                                rotate: [0, 10, -10, 0],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                              }}
                            >
                              {holiday.emoji}
                            </motion.div>
                          </div>

                          {/* Holiday Content */}
                          <div className="p-6">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                              {holiday.name}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {holiday.description}
                            </p>

                            <motion.div
                              className="mt-4 flex gap-2 flex-wrap"
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                            >
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="size-3 mr-1" />
                                {holiday.date}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Sparkles className="size-3 mr-1" />
                                Festival
                              </Badge>
                            </motion.div>
                          </div>

                          {/* Bottom Gradient */}
                          <motion.div
                            className={`h-1 bg-gradient-to-r ${holiday.color}`}
                            initial={{ scaleX: 0 }}
                            whileHover={{ scaleX: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  </div>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </section>

      {/* Fun Stats Section */}
      <section className="w-full py-20 bg-gradient-to-br from-primary/5 via-purple-50/30 to-pink-50/20">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Holiday Statistics
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Making every celebration count!
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "11", label: "Global Observances", icon: <Calendar className="size-6" />, color: "from-blue-500 to-purple-500" },
              { number: "100%", label: "Joy & Fun", icon: <PartyPopper className="size-6" />, color: "from-pink-500 to-red-500" },
              { number: "24/7", label: "Celebration Mode", icon: <Sparkles className="size-6" />, color: "from-yellow-500 to-orange-500" },
              { number: "∞", label: "Happy Moments", icon: <Heart className="size-6" />, color: "from-green-500 to-teal-500" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-2 border-transparent group-hover:border-primary/50 transition-all">
                  <div className={`size-16 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
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

