"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MapPin, Phone, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { API_URL } from "@/lib/config";

type Service = {
  id: string;
  title: string;
  description: string;
  image: string;
  features: string[];
  long_description: string;
  benefits: string[];
  technologies: string[];
  developers: number[];
  demo_video_url: string;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export default function ITServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/api/services/`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Filter active services and sort by sort_order
        const activeServices = data
          .filter((service: Service) => service.status === 'active')
          .sort((a: Service, b: Service) => a.sort_order - b.sort_order);
        
        setServices(activeServices);
      } catch (error) {
        console.error("Error fetching services:", error);
        const message = error instanceof Error ? error.message : String(error);
        setError(`Failed to load services: ${message}`);
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const slugifyTitle = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const getImageUrl = (imagePath?: string | null, fallback = "/brand/abstract-grid.svg") => {
    if (!imagePath) return fallback;
    if (imagePath.startsWith("http")) return imagePath;
    const normalized = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${API_URL}${normalized}`;
  };

  // Generate slug from service ID and title
  const generateServiceSlug = (id: string, title: string) => {
    const titleSlug = slugifyTitle(title);
    const isNumericId = /^\d+$/.test(id);
    return isNumericId ? `${id}-${titleSlug}` : id;
  };

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Hero Section */}
      <section className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-blue-50/50 to-purple-50/30">
        <div className="container px-4 md:px-6 relative z-10 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Services
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Empowering Innovation with Technology
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              Building smart solutions in Web Development, Data Analytics, and
              AI to drive digital transformation
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="w-full py-20 md:py-32 bg-background">
        <div className="container px-4 md:px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="size-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading Nilaya AI services...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="text-red-500 mb-4">{error}</div>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold mb-2">No Services Available</h3>
              <p className="text-muted-foreground">We're refreshing our automation catalog.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {services.map((service, i) => (
                <motion.div
                  key={service.id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <Card className="h-full w-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-blue-50/30 backdrop-blur transition-all hover:shadow-xl">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={getImageUrl(service.image, "/brand/abstract-grid.svg")}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <div className="text-white text-sm font-semibold bg-primary/90 px-3 py-1 rounded-full">
                          {service.features.length} Features
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {service.description}
                      </p>
                      <div className="space-y-2 mb-4">
                        {service.features.slice(0, 2).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-primary"></div>
                            <span className="text-sm text-muted-foreground">
                              {feature}
                            </span>
                          </div>
                        ))}
                        {service.features.length > 2 && (
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-primary"></div>
                            <span className="text-sm text-muted-foreground">
                              And {service.features.length - 2} more...
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                        asChild
                      >
                        <Link href={`/it-services/${generateServiceSlug(service.id, service.title)}`}>
                          Learn More
                          <ArrowRight className="ml-2 size-3" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
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
  );
}