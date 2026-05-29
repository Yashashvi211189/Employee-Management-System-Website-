import BlogPageClient from "../blog/BlogPageClient"
import { getAllBlogPostsServer } from "@/lib/blog-data"

export default async function BlogsPage() {
  const posts = await getAllBlogPostsServer()
  return <BlogPageClient initialPosts={posts} blogBase="/blogs" />
}
