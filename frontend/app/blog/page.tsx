import BlogPageClient from "./BlogPageClient"
import { getAllBlogPostsServer } from "@/lib/blog-data"

export default async function BlogPage() {
  const posts = await getAllBlogPostsServer()
  return <BlogPageClient initialPosts={posts} blogBase="/blog" />
}
