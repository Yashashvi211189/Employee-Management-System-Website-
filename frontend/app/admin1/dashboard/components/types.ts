// Shared TypeScript interfaces and types for Admin Dashboard

export interface Testimonial {
    id: number;
    name: string;
    company: string;
    role: string;
    text: string;
    image: string | null;
    linkedin: string;
    status: 'active' | 'inactive';
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export type TestimonialForm = Omit<Testimonial, 'image'> & { image: string | File | null };

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    department: string;
    image: string | File;
    bio: string;
    location: string;
    joinDate: string;
    memberID?: string;
    skills: string[];
    status: "Active" | "Alumni";
    member_type: "founder" | "executive" | "employee" | "alumni";
    education?: string;
    achievements?: string[];
    experience?: string;
}

export interface Project {
    id: string;
    title: string;
    shortDescription: string;
    description: string;
    image: string;
    gallery: string[];
    icon: string;
    category: string;
    technologies: string[] | string;
    color: string;
    stats: Record<string, string>;
    details: string;
    challenges: string[] | string;
    outcomes: string[] | string;
    timeline: string;
    team: string;
    client: string;
    liveUrl?: string;
    videoUrl?: string;
    status: "completed" | "ongoing" | "planned";
    featured?: boolean;
    testimonial?: {
        name?: string;
        role?: string;
        image?: string;
        quote?: string;
        rating?: number;
    };
    testimonial_name?: string;
    testimonial_role?: string;
    testimonial_image?: string;
    testimonial_quote?: string;
    testimonial_rating?: number;
}

export interface GalleryItem {
    id: string;
    title: string;
    description: string;
    category: string;
    image: string;
    created_at: string;
    tags?: string[];
}

export interface Product {
    id: string;
    name: string;
    tagline: string;
    iconText: string;
    cover: string;
    gallery: string[];
    description: string;
    fullDescription: string;
    features: string[];
    outcomes: string[];
    challenges: string[];
    technologies: string[];
    stats: { label: string; value: string }[];
    liveUrl?: string;
    status: "Live" | "In Development" | "Coming Soon";
    category: string;
    platforms: string[];
    integrations: string[];
    support: string[];
    documentationUrl?: string;
    demoUrl?: string;
    featured: boolean;
    sortOrder: number;
    color?: string;
    pricing?: {
        type: "free" | "paid" | "freemium";
        amount?: number;
        currency?: string;
        period?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Service {
    id: string;
    title: string;
    description: string;
    image: string | File;
    long_description: string;
    features: string[];
    benefits: string[];
    technologies: string[];
    developers: number[];
    demo_video_url?: string;
    status: "active" | "inactive";
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export type ServiceForm = Omit<Service, "image"> & { image: string | File };
export type TeamMemberForm = Omit<TeamMember, "image"> & { image: string | File };
export type ProjectForm = Omit<Project, "image" | "technologies" | "challenges" | "outcomes"> & {
    image: string | File;
    technologies: string[] | string;
    challenges: string[] | string;
    outcomes: string[] | string;
    testimonial_name?: string;
    testimonial_role?: string;
    testimonial_image?: string;
    testimonial_quote?: string;
    testimonial_rating?: number;
};
export type GalleryItemForm = Omit<GalleryItem, "image"> & { image: string | File | null };
export type ProductForm = Omit<Product, "cover"> & { cover: string | File };
