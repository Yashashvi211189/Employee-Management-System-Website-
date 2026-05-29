"use client";
import { API_URL } from "@/lib/config";
import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Github,
  Youtube,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form validation schema
const formSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z
    .string()
    .min(5, { message: "Subject must be at least 5 characters" }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const formRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const isFormInView = useInView(formRef, { once: true, amount: 0.3 });
  const isMapInView = useInView(mapRef, { once: true, amount: 0.3 });

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: any) => {
    setFormStatus("submitting");

    try {
      const response = await fetch(`${API_URL}/api/contact/submit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setFormStatus("success");
        form.reset();
      } else {
        setFormStatus("error");
        console.error("Submission error:", result.error);
      }
    } catch (error) {
      console.error("Network error:", error);
      setFormStatus("error");
    }
  };

  // Office locations
  const officeLocations = [
    {
      id: "global-hq",
      name: "Global HQ (Remote-first)",
      address:
        "Distributed teams across North America, Europe, and APAC",
      phone: "+1 (415) 555-0148",
      email: "hello@nilaya.ai",
      mapUrl: "https://www.google.com/maps?q=San%20Francisco%2C%20CA&output=embed",
      hours: "Monday - Friday: 9:00 AM - 6:00 PM PT",
      image: "/brand/workspace.svg",
    },
    {
      id: "innovation-studio",
      name: "Innovation Studio",
      address: "Austin, TX, United States",
      phone: "+1 (512) 555-0186",
      email: "hello@nilaya.ai",
      mapUrl: "https://www.google.com/maps?q=Austin%2C%20TX&output=embed",
      hours: "Monday - Friday: 10:00 AM - 6:00 PM CT",
      image: "/brand/team-collab.svg",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8 },
    },
  };

  const mapVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
    },
  };

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Hero Section */}
      <section className="relative w-full min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-blue-50/50 to-purple-50/30">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
          />
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
              <Mail className="size-4" />
              Get in Touch
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Let's Start a
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
              >
                Conversation
              </motion.span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Have a project in mind? We'd love to hear from you and discuss how
              we can help bring your ideas to life.
            </p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
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

      {/* Contact Information Cards */}
      <section className="w-full py-16 bg-background relative z-10">
        <div className="container px-4 md:px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-8 md:grid-cols-3"
          >
            {/* Address Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="group"
            >
              <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-blue-50/30 backdrop-blur transition-all hover:shadow-xl">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <MapPin className="size-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Visit Our Office</h3>
                  <p className="text-muted-foreground mb-4">
                    Remote-first HQ
                    <br />
                    Serving North America, Europe, and APAC
                    <br />
                    Pin: 751007
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-auto group-hover:bg-primary group-hover:text-white"
                  >
                    Get Directions
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Phone Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="group"
            >
              <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-blue-50/30 backdrop-blur transition-all hover:shadow-xl">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Phone className="size-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Call Us</h3>
                  <p className="text-muted-foreground mb-4">
                    Our friendly team is here to help
                    <br />
                    <span className="text-lg font-medium text-foreground">
                      +91 7008639757
                    </span>
                  </p>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Clock className="size-4" />
                    <span className="text-sm">Mon-Fri: 9:00 AM - 6:00 PM</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-auto group-hover:bg-primary group-hover:text-white"
                  >
                    Call Now
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Email Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="group"
            >
              <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-blue-50/30 backdrop-blur transition-all hover:shadow-xl">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Mail className="size-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Email Us</h3>
                  <p className="text-muted-foreground mb-4">
                    Drop us a line anytime at
                    <br />
                    <span className="text-lg font-medium text-foreground">
                      hello@nilaya.ai
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    We'll get back to you within 24 hours
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-auto group-hover:bg-primary group-hover:text-white"
                  >
                    Send Email
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form and Map Section */}
      <section className="w-full py-20 bg-gradient-to-b from-background to-blue-50/30">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <div ref={formRef}>
              <motion.div
                variants={fadeInVariants}
                initial="hidden"
                animate={isFormInView ? "visible" : "hidden"}
                className="mb-8"
              >
                <h2 className="text-3xl font-bold mb-2">Send Us a Message</h2>
                <p className="text-muted-foreground max-w-md">
                  Fill out the form below and our team will get back to you as
                  soon as possible.
                </p>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={isFormInView ? "visible" : "hidden"}
              >
                <Card className="border-border/40 overflow-hidden">
                  <CardContent className="p-6 md:p-8">
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                      >
                        {/* Name Fields - Side by Side */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <motion.div variants={itemVariants}>
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="John"
                                      {...field}
                                      className="transition-all focus:ring-2 focus:ring-primary/20"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Doe"
                                      {...field}
                                      className="transition-all focus:ring-2 focus:ring-primary/20"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </motion.div>
                        </div>

                        {/* Email Field */}
                        <motion.div variants={itemVariants}>
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="john@example.com"
                                    {...field}
                                    className="transition-all focus:ring-2 focus:ring-primary/20"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        {/* Subject Field */}
                        <motion.div variants={itemVariants}>
                          <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="How can we help you?"
                                    {...field}
                                    className="transition-all focus:ring-2 focus:ring-primary/20"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        {/* Message Field */}
                        <motion.div variants={itemVariants}>
                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Tell us about your project or inquiry..."
                                    rows={5}
                                    {...field}
                                    className="resize-none transition-all focus:ring-2 focus:ring-primary/20"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div variants={itemVariants}>
                          <Button
                            type="submit"
                            className="w-full h-12 rounded-lg group"
                            disabled={formStatus === "submitting"}
                          >
                            {formStatus === "submitting" ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                Sending...
                              </div>
                            ) : (
                              <>
                                Send Message
                                <Send className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </form>
                    </Form>

                    {/* Form Status Messages */}
                    <AnimatePresence mode="wait">
                      {formStatus === "success" && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
                        >
                          <CheckCircle2 className="size-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-800">
                              Message Sent Successfully!
                            </h4>
                            <p className="text-sm text-green-600">
                              Thank you for reaching out. We'll get back to you
                              as soon as possible.
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {formStatus === "error" && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                        >
                          <AlertCircle className="size-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-red-800">
                              Something went wrong
                            </h4>
                            <p className="text-sm text-red-600">
                              There was an error sending your message. Please
                              try again or contact us directly.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Office Locations with Map */}
            <div ref={mapRef}>
              <motion.div
                variants={fadeInVariants}
                initial="hidden"
                animate={isMapInView ? "visible" : "hidden"}
                className="mb-8"
              >
                <h2 className="text-3xl font-bold mb-2">Our Offices</h2>
                <p className="text-muted-foreground max-w-md">
                  Visit us at one of our office locations or connect with us
                  virtually from anywhere in the world.
                </p>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={isMapInView ? "visible" : "hidden"}
              >
                <Tabs defaultValue="bhubaneswar" className="w-full">
                  <TabsList className="w-full mb-6">
                    {officeLocations.map((office) => (
                      <TabsTrigger
                        key={office.id}
                        value={office.id}
                        className="flex-1"
                      >
                        {office.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {officeLocations.map((office) => (
                    <TabsContent key={office.id} value={office.id}>
                      <Card className="border-border/40 overflow-hidden">
                        <div className="relative h-48 md:h-64 overflow-hidden">
                          <Image
                            src={office.image || "/brand/workspace.svg"}
                            alt={office.name}
                            width={600}
                            height={400}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-xl font-bold text-white">
                              {office.name}
                            </h3>
                          </div>
                        </div>

                        <CardContent className="p-6">
                          <div className="grid gap-4 mb-6">
                            <div className="flex items-start gap-3">
                              <MapPin className="size-5 text-primary flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-medium mb-1">Address</h4>
                                <p className="text-sm text-muted-foreground">
                                  {office.address}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Phone className="size-5 text-primary flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-medium mb-1">Phone</h4>
                                <p className="text-sm text-muted-foreground">
                                  {office.phone}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Mail className="size-5 text-primary flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-medium mb-1">Email</h4>
                                <p className="text-sm text-muted-foreground">
                                  {office.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Clock className="size-5 text-primary flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-medium mb-1">
                                  Business Hours
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {office.hours}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Interactive Map */}
                          <motion.div
                            variants={mapVariants}
                            className="w-full h-64 rounded-lg overflow-hidden border border-border/40"
                          >
                            <iframe
                              src={office.mapUrl}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              title={`Map showing ${office.name} location`}
                            ></iframe>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
     <section className="w-full py-20 bg-background">
  <div className="container px-4 md:px-6 max-w-4xl mx-auto">
    
    {/* Header */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center mb-14"
    >
      <h2 className="text-3xl font-bold tracking-tight mb-3">
        Frequently Asked Questions
      </h2>
      <p className="text-muted-foreground max-w-xl mx-auto">
        Clear answers to common questions about our approach, process, and
        long-term support.
      </p>
    </motion.div>

    {/* FAQ List */}
    <div className="space-y-4">
      {[
        {
          question:
            "What makes your approach different from other agencies?",
          answer:
            "We focus on solving business problems first, not just building software. Our solutions are aligned with measurable outcomes like performance, scalability, and ROI.",
        },
        {
          question: "How long does a typical project take to complete?",
          answer:
            "Timelines depend on scope. MVPs typically take 8–12 weeks, while full-scale platforms range from 3–6 months with clear milestones and sprint-based delivery.",
        },
        {
          question: "Do you offer ongoing support after project completion?",
          answer:
            "Yes. We provide flexible post-launch support including monitoring, security updates, performance optimization, and feature enhancements.",
        },
        {
          question: "Can you work with our existing team and technologies?",
          answer:
            "Absolutely. We frequently collaborate with in-house teams and integrate seamlessly with existing systems, tools, and technology stacks.",
        },
      ].map((faq, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          className="border border-border/50 rounded-lg bg-background hover:shadow-sm transition-all"
        >
          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between px-6 py-5 font-semibold text-base list-none">
              {faq.question}
              <span className="ml-4 transition-transform group-open:rotate-180">
                ▼
              </span>
            </summary>
            <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
              {faq.answer}
            </div>
          </details>
        </motion.div>
      ))}
    </div>
  </div>
</section>


      {/* Connect with Us Section */}
      <section className="w-full py-20 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Connect With Us
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Follow us on social media for the latest updates, insights, and
              announcements.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                {
                  icon: <Linkedin className="size-5" />,
                  label: "LinkedIn",
                  href: "https://www.linkedin.com/company/nilaya-ai",
                },
                {
                  icon: <Twitter className="size-5" />,
                  label: "Twitter",
                  href: "https://x.com/Nilaya AI1",
                },
                {
                  icon: <Instagram className="size-5" />,
                  label: "Instagram",
                  href: "https://www.instagram.com/dasho.app/",
                },
                {
                  icon: <Facebook className="size-5" />,
                  label: "Facebook",
                  href: "https://www.facebook.com/nilayaai",
                },
                /* { icon: <Github className="size-5" />, label: "GitHub", href: "#" },*/
                {
                  icon: <Youtube className="size-5" />,
                  label: "Youtube",
                  href: "https://www.youtube.com/@Nilaya AIVlogs",
                },
              ].map((social, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5 }}
                >
                  <Link href={social.href}>
                    <Button
                      size="lg"
                      className="group rounded-full h-14 px-8 text-base font-medium bg-white text-blue-600 hover:bg-blue-100 transition-all duration-300 gap-2"
                    >
                      {social.icon}
                      {social.label}
                      <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
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
