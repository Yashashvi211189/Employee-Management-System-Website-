// lib/services/blog-api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface BlogApiResponse {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  image: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  date: string;
  readingTime: number;
  status?: string;
  featured?: boolean;
}

export async function getBlogs(): Promise<BlogApiResponse[]> {
  try {
    const response = await fetch(`${API_BASE}/api/blogs/`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
    return [];
  }
}

export async function getBlogBySlug(slug: string): Promise<BlogApiResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/api/blogs/${slug}/`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch blog ${slug}:`, error);
    return null;
  }
}