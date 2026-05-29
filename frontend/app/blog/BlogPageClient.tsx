"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  Clock,
  Search,
  Filter,
  Tag,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

import {
  subscribeBlogUpdates,
  PublicBlogPost,
  fetchPublicBlogsClient,
} from "@/lib/blog-data"

const imagePositionClass = (pos?: PublicBlogPost["imagePosition"]) => {
  if (pos === "left") return "object-left"
  if (pos === "right") return "object-right"
  return "object-center"
}

function isValidPost(p: any): p is PublicBlogPost {
  return (
    p &&
    typeof p === "object" &&
    typeof p.slug === "string" &&
    p.slug.length > 0 &&
    (p.status === "published" || p.status == null)
  )
}

export default function BlogPageClient({
  initialPosts,
  blogBase: blogBaseProp,
}: {
  initialPosts: PublicBlogPost[]
  blogBase?: string
}) {
  const pathname = usePathname()
  const blogBase = blogBaseProp || (pathname?.startsWith("/blogs") ? "/blogs" : "/blog")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [allPosts, setAllPosts] = useState<PublicBlogPost[]>(() =>
    (initialPosts || []).filter(isValidPost)
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const blogs = await fetchPublicBlogsClient()
      if (cancelled) return
      setAllPosts(blogs.filter(isValidPost))
      setLoading(false)
    }

    const unsub = subscribeBlogUpdates(() => void load())
    return () => {
      cancelled = true
      unsub?.()
    }
  }, [])

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          allPosts
            .map((p) => p.category)
            .filter((c): c is string => typeof c === "string" && !!c.trim())
        )
      ),
    ],
    [allPosts]
  )

  const filteredPosts = useMemo(() => {
    let result = allPosts

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.excerpt || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q) ||
          (p.tags || []).some((t) => (t || "").toLowerCase().includes(q))
      )
    }

    return result
  }, [allPosts, searchQuery, selectedCategory])

  const featuredPosts = useMemo(
    () => filteredPosts.filter((p) => !!p.featured),
    [filteredPosts]
  )

  // Remove this line - we don't need to separate featured from non-featured
  // const nonFeaturedPosts = useMemo(
  //   () => filteredPosts.filter((p) => !p.featured),
  //   [filteredPosts]
  // )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const featuredMain = featuredPosts[0]
  const featuredSecondary = featuredPosts.slice(1, 4)

  const pageTitle = useMemo(() => {
    const raw = String(blogBase || "").replace(/^\/+/, "").trim()
    if (!raw) return ""
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  }, [blogBase])

  const heroTag = useMemo(() => {
    if (selectedCategory !== "All") return selectedCategory
    const first = categories.find((c) => c !== "All")
    return first || ""
  }, [categories, selectedCategory])

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <section className="relative w-full min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-blue-50/50 to-purple-50/30 pt-20">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {heroTag ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Tag className="size-4" />
                {heroTag}
              </div>
            ) : null}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {pageTitle || "Blog"}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {filteredPosts.length} articles
            </p>
            <p className="text-xl md:text-2xl text-muted-foreground from-primary to-blue-600 mb-8 max-w-3xl mx-auto">
              Insights, tutorials, and thoughts on technology, innovation, and digital transformation
            </p>
          </div>
        </div>
      </section>

      <section className="w-full py-8 border-b bg-background/95 backdrop-blur sticky top-20 z-30">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex items-center gap-2 w-full md:w-[420px]">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <button
              type="button"
              aria-label="Clear filters"
              className="shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-md border bg-background hover:bg-muted transition"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("All")
              }}
            >
              <Filter className="size-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant="outline"
                className={`cursor-pointer border transition-colors ${
                  selectedCategory === cat
                    ? "bg-sky-200 border-sky-300 text-sky-950 hover:bg-sky-300"
                    : "bg-amber-100 border-amber-300 text-amber-950 hover:bg-amber-200"
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles Section - Shows only the first 4 featured articles */}
      {featuredPosts.length > 0 && (
        <section className="py-14 mt-6">
          <div className="container">
            <div className="mb-8">
              <h2 className="text-2xl font-bold">Featured Articles</h2>
              <p className="text-sm text-muted-foreground">
                Our most informative and popular pieces
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
              {/* Main featured article - first one */}
              {featuredMain && (
                <Link href={`${blogBase}/${featuredMain.slug}`}>
                  <motion.div whileHover={{ scale: 1.02 }} className="space-y-4">
                    <div className="overflow-hidden rounded-xl bg-muted/30">
                      {featuredMain.image ? (
                        <img
                          src={featuredMain.image}
                          className={`w-full aspect-video object-cover ${imagePositionClass(featuredMain.imagePosition)}`}
                        />
                      ) : (
                        <div className="w-full aspect-video" />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {featuredMain.category ? (
                        <Badge className="h-5 px-2 text-[10px]">{featuredMain.category}</Badge>
                      ) : null}
                      {featuredMain.date ? (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3.5" />
                          {featuredMain.date}
                        </span>
                      ) : null}
                      {typeof featuredMain.readingTime === "number" ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {featuredMain.readingTime} min read
                        </span>
                      ) : null}
                    </div>

                    {featuredMain.title ? <h3 className="text-xl font-bold">{featuredMain.title}</h3> : null}
                    {featuredMain.excerpt ? (
                      <p className="text-sm text-muted-foreground">{featuredMain.excerpt}</p>
                    ) : null}

                    {featuredMain.author?.name || featuredMain.author?.avatar ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Avatar className="size-6">
                          {featuredMain.author?.avatar ? (
                            <AvatarImage src={featuredMain.author.avatar} />
                          ) : null}
                          {featuredMain.author?.name ? (
                            <AvatarFallback>{featuredMain.author.name[0]}</AvatarFallback>
                          ) : null}
                        </Avatar>
                        <div className="leading-tight">
                          {featuredMain.author?.name ? (
                            <p className="text-xs font-medium text-foreground">
                              {featuredMain.author.name}
                            </p>
                          ) : null}
                          {featuredMain.author?.role ? (
                            <p className="text-[11px] text-muted-foreground">
                              {featuredMain.author.role}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </motion.div>
                </Link>
              )}

              <div className="flex flex-col">
                <div className="space-y-4">
                  {featuredSecondary.map((p) => (
                    <Link key={p.slug} href={`${blogBase}/${p.slug}`}>
                      <div className="flex gap-4 rounded-lg border bg-background p-3 hover:bg-muted/30 transition">
                        <div className="size-20 rounded-md bg-muted/30 overflow-hidden shrink-0">
                          {p.image ? (
                            <img
                              src={p.image}
                              className={`size-20 rounded-md object-cover ${imagePositionClass(p.imagePosition)}`}
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            {p.category ? (
                              <Badge className="h-5 px-2 text-[10px]">{p.category}</Badge>
                            ) : null}
                          </div>
                          <h4 className="font-semibold leading-snug line-clamp-2">{p.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {filteredPosts.length > 0 && (
                  <div className="mt-6">
                    <Link
                      href="#all-articles"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      View All Articles
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="all-articles" className="scroll-mt-32 py-16 mt-10 bg-muted/20">
        <div className="container">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">All Articles</h2>
            <p className="text-sm text-muted-foreground">
              {filteredPosts.length} articles available
            </p>
          </div>

          <AnimatePresence>
            {filteredPosts.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredPosts.map((post) => (
                  <motion.div key={post.slug} variants={itemVariants}>
                    <Link href={`${blogBase}/${post.slug}`}>
                      <Card className="h-full hover:shadow-md transition">
                        {post.image ? (
                          <img
                            src={post.image}
                            className={`aspect-video object-cover ${imagePositionClass(post.imagePosition)}`}
                          />
                        ) : (
                          <div className="aspect-video bg-muted/30" />
                        )}
                        <CardContent className="p-5 flex flex-col gap-3">
                          <div className="space-y-2">
                            {post.category ? (
                              <Badge className="h-5 px-2 text-[10px]">{post.category}</Badge>
                            ) : null}
                            {post.featured && (
                              <Badge className="h-5 px-2 text-[10px] bg-primary/10 text-primary border-primary/20">
                                Featured
                              </Badge>
                            )}
                            <h3 className="font-bold line-clamp-2">{post.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {post.excerpt}
                            </p>
                          </div>

                          <div className="mt-auto flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2 min-w-0">
                              {post.author?.name || post.author?.avatar ? (
                                <Avatar className="size-6">
                                  {post.author?.avatar ? (
                                    <AvatarImage src={post.author.avatar} />
                                  ) : null}
                                  {post.author?.name ? (
                                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                                  ) : null}
                                </Avatar>
                              ) : null}
                              <p className="text-xs text-muted-foreground truncate">
                                {post.author?.name}
                              </p>
                            </div>

                            <span className="text-xs text-primary inline-flex items-center gap-1">
                              Read More <ArrowRight className="size-3.5" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20">
                <Search className="mx-auto mb-4 size-10 text-muted-foreground" />
                <Button
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("All")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </AnimatePresence>
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
