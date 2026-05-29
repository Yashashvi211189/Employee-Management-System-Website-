"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Tag, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  subscribeBlogUpdates,
  PublicBlogPost,
  fetchBlogBySlug,
  fetchPublicBlogsClient,
} from "@/lib/blog-data";

const imagePositionClass = (pos?: PublicBlogPost["imagePosition"]) => {
  if (pos === "left") return "object-left";
  if (pos === "right") return "object-right";
  return "object-center";
};

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const blogBase = pathname?.startsWith("/blogs") ? "/blogs" : "/blog";

  const slug = typeof params?.slug === "string" ? params.slug : null;

  const [post, setPost] = useState<PublicBlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<PublicBlogPost[]>([]);
  const [allPosts, setAllPosts] = useState<PublicBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareStatus, setShareStatus] = useState<"idle" | "shared" | "copied">("idle");

  /* =====================================================
     Load + Subscribe (SAFE)
  ====================================================== */
  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);

      const current = await fetchBlogBySlug(slug);
      if (cancelled) return;

      if (!current) {
        setPost(null);
        setRelatedPosts([]);
        setAllPosts([]);
        setLoading(false);
        return;
      }

      setPost(current);

      const blogs = (await fetchPublicBlogsClient()).filter(
        (b): b is PublicBlogPost => Boolean(b?.slug)
      );
      if (cancelled) return;

      setAllPosts(blogs);
      setRelatedPosts(
        blogs
          .filter((b) => b.slug !== current.slug && b.category === current.category)
          .slice(0, 3)
      );

      setLoading(false);
    };

    void load();
    const unsub = subscribeBlogUpdates(() => void load());
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [slug]);

  const onShare = async () => {
    if (!post) return;

    const url = window.location.href;
    const shareData = {
      title: post.title || "",
      text: post.excerpt || "",
      url,
    };

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as any).share(shareData);
        setShareStatus("shared");
        window.setTimeout(() => setShareStatus("idle"), 2000);
        return;
      } catch (err) {
        console.error("Share failed:", err);
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
      window.setTimeout(() => setShareStatus("idle"), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Unable to share automatically. Please copy the URL from the address bar.");
    }
  };

  /* =====================================================
     Loading
  ====================================================== */
  if (loading || !slug) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  /* =====================================================
     Not Found
  ====================================================== */
  if (!post) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Blog post not found</h2>
          <Button onClick={() => router.push(blogBase)}>Back to Blog</Button>
        </div>
      </div>
    );
  }

  /* =====================================================
     Render (SAFE FROM HERE)
  ====================================================== */
  const tags = post.tags ?? [];

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 to-muted pb-16 pt-28">
        <div className="container max-w-4xl">
          <Link href={blogBase} className="-ml-12 mb-4 flex items-center text-primary">
            <ArrowLeft className="mr-2 size-4" />
            Back to Blog
          </Link>

          {post.category ? (
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm">
              {post.category}
            </span>
          ) : null}

          {post.title ? <h1 className="mb-4 text-4xl font-bold">{post.title}</h1> : null}

          {post.image && (
            <div className="mt-6 overflow-hidden rounded-2xl border bg-background">
              <img
                src={post.image}
                alt={post.title || ""}
                className={`aspect-video w-full object-cover ${imagePositionClass(post.imagePosition)}`}
              />
            </div>
          )}

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {post.date ? (
              <span className="flex items-center gap-1">
                <Calendar className="size-4" />
                {post.date}
              </span>
            ) : null}
            {typeof post.readingTime === "number" ? (
              <span className="flex items-center gap-1">
                <Clock className="size-4" />
                {post.readingTime} min
              </span>
            ) : null}
          </div>

          {post.author?.name || post.author?.avatar ? (
            <div className="mt-6 flex items-center gap-3">
              <Avatar>
                {post.author?.avatar ? <AvatarImage src={post.author.avatar} /> : null}
                {post.author?.name ? <AvatarFallback>{post.author.name[0]}</AvatarFallback> : null}
              </Avatar>
              <div>
                {post.author?.name ? <p className="font-medium">{post.author.name}</p> : null}
                {post.author?.role ? (
                  <p className="text-xs text-muted-foreground">{post.author.role}</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Content */}
      <section className="container grid max-w-5xl gap-10 py-12 md:grid-cols-12">
        <div className="prose max-w-none md:col-span-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
              h1: ({ node, ...props }) => (
                <h1 className="mb-4 mt-8 text-3xl font-bold" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="mb-3 mt-6 text-2xl font-bold" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="mb-2 mt-4 text-xl font-bold" {...props} />
              ),
              h4: ({ node, ...props }) => (
                <h4 className="mb-2 mt-3 text-lg font-bold" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="mb-4 list-disc space-y-1 pl-6" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="mb-4 list-decimal space-y-1 pl-6" {...props} />
              ),
              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote className="my-4 border-l-4 border-primary pl-4 italic" {...props} />
              ),
              // Properly typed code component with inline property
              code: ({ node, inline, ...props }: { node?: any; inline?: boolean; [key: string]: any }) =>
                inline ? (
                  <code className="rounded bg-muted px-1 py-0.5 text-sm" {...props} />
                ) : (
                  <code className="block overflow-x-auto rounded-lg bg-muted p-4 text-sm" {...props} />
                ),
            }}
          >
            {/* Use type assertion to bypass missing content property if needed */}
            {(post as any).content || ""}
          </ReactMarkdown>

          {tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              <Tag className="size-4 text-muted-foreground" />
              {tags.map((t, i) => (
                <span key={i} className="rounded-full bg-muted px-3 py-1 text-sm">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 />{" "}
              {shareStatus === "shared" ? "Shared" : shareStatus === "copied" ? "Link copied" : "Share"}
            </Button>
          </div>
        </div>

        {/* Related */}
        <aside className="md:col-span-4">
          <h3 className="mb-4 text-xl font-bold">Related</h3>
          <div className="space-y-4">
            {relatedPosts.map((r) => (
              <Link key={r.slug} href={`${blogBase}/${r.slug}`}>
                <div className="flex gap-4 rounded p-2 hover:bg-muted/40">
                  <div className="size-20 shrink-0 overflow-hidden rounded bg-muted/30">
                    {r.image ? <img src={r.image} className="size-20 rounded object-cover" /> : null}
                  </div>
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.date}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}