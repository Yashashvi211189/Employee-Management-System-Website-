"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronRight, Phone, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LidarCarousel } from "@/components/lidar-carousel"
import { cn } from "@/lib/utils"

// --- DATA DEFINITIONS ---

const SUBSECTIONS = [
    { slug: "advanced-dsm-classification", title: "Advanced DSM Classification" },
    { slug: "powerline-feature-extraction", title: "Powerline Feature Extraction" },
    { slug: "uav-point-classification", title: "UAV Point Classification" },
    { slug: "corridor-classification", title: "Corridor Classification" },
    { slug: "mls-point-classification", title: "MLS Point Classification" },
    { slug: "mls-vectorization", title: "MLS Vectorization" },
    { slug: "dtm-classification", title: "DTM Classification" },
    { slug: "bathymetry-mapping", title: "Bathymetry Mapping" },
]

const CONTENT_MAP: Record<string, {
    description: string,
    benefits: string[],
    images: string[],
    bottomSection: { title: string, description: string, tags: string[] }
}> = {
    "advanced-dsm-classification": {
        description: "A Digital Surface Model (DSM) captures the globe's natural and artificial features, distinguishing between the ground surface, vegetation, and man-made objects. These models provide a comprehensive 3D representation of the environment, essential for applications ranging from RF planning and landscape modeling to complex city visualization.",
        benefits: ["Holistic environmental capture", "RF & Network planning", "Urban landscape modeling", "3D City visualization"],
        images: [
            "/brand/abstract-grid.svg",
            "/brand/abstract-grid.svg",
            "/brand/abstract-grid.svg"
        ],
        bottomSection: {
            title: "Strategic Urban Planning & Design",
            description: "We provide imaginative and practical advice for urban development, managing projects from initial study to completion. Our data supports zoning, transportation network design, and policy implementation, ensuring the orderly and strategic development of communities.",
            tags: ["Urban Design", "Strategic Planning", "Policy Analysis", "Community Dev"]
        }
    },
    "powerline-feature-extraction": {
        description: "By combining high-resolution LiDAR data with targeted fieldwork, we deliver ultimate utility mapping services that drastically reduce costs for electrical grid design and maintenance. We create accurate 2D and 3D models for both transmission and distribution lines, enabling precise network management.",
        benefits: ["Cost-effective grid design", "2D/3D Network modeling", "Vegetation clearance analysis", "Maintenance optimization"],
        images: [
            "/brand/abstract-grid.svg",
        "/brand/abstract-grid.svg",
        "/brand/abstract-grid.svg"
        ],
        bottomSection: {
            title: "Advanced QA for Grid Reliability",
            description: "Utilizing specialized QA software, we deliver faster, more reliable results for vegetation management and PLS-CADD modeling. Our solution covers safety distance analysis, asset inventories, and planimetry to ensure your network withstands any condition.",
            tags: ["PLS-CADD", "Vegetation Mgmt", "Safety Analysis", "Asset Inventory"]
        }
    },
    "uav-point-classification": {
        description: "While UAV point clouds are often converted into standard raster models (DEM, DSM), we unlock their full potential by processing the raw, dense datasets to characterize vegetation structure. This approach is critical for measuring canopy height, tree crown diameter, and detecting individual trees for precision agriculture and forestry.",
        benefits: ["Canopy & Tree height measurement", "Individual tree detection", "Precision agriculture", "Biomass estimation"],
        images: [
            "/brand/abstract-grid.svg",
            "/brand/abstract-grid.svg",
            "/brand/abstract-grid.svg"
        ],
        bottomSection: {
            title: "Reliable & Scalable Classification",
            description: "With years of experience in mapping services, we manually extract UAV points to meet your exact horizontal and vertical accuracy requirements. Our team constantly scales to adopt new tools, providing best-in-industry services for agricultural and environmental monitoring.",
            tags: ["Manual Extraction", "Stereo Imaging", "High Accuracy", "Agri-Tech"]
        }
    },
    "corridor-classification": {
        description: "We utilize LiDAR data to generate highly accurate 3D models for utility and transportation corridors, facilitating risk analysis and vegetation encroachment studies. Our customizable workflows allow for specific safety analysis across different voltages, spans, and assets, helping you prioritize maintenance and ensure regulatory compliance.",
        benefits: ["Vegetation encroachment analysis", "Safety distance verification", "Route planning & monitoring", "Infrastructure inventory"],
        images: [
            "/brand/abstract-grid.svg",
            "/brand/abstract-grid.svg",
            "/brand/abstract-grid.svg"
        ],
        bottomSection: {
            title: "Fast-Track Infrastructure Projects",
            description: "From roadways to railways, our mapping solutions enable you to fast-track project completion without sacrificing quality. We check safety distances against existing elements (buildings, ground, wires) to prevent infringements and optimize asset management.",
            tags: ["Risk Analysis", "Route Planning", "Safety Audits", "Asset Mgmt"]
        }
    },
    "mls-point-classification": {
        description: "Our Mobile Laser Scanning (MLS) classification relies on extracting detrended geometric features to accurately label complex 3D urban scenes. We assign individual class labels to objects—such as road markings, poles, and street furniture—playing an essential role in the creation of detailed high-definition maps for autonomous navigation and smart cities.",
        benefits: ["Geometric feature extraction", "3D Urban scene labeling", "HD Mapping support", "Granular object classification"],
        images: [
            "/brand/abstract-grid.svg",
            "/brand/abstract-grid.svg",
            "/brand/abstract-grid.svg"
        ],
        bottomSection: {
            title: "Expert Engineering & Support",
            description: "Our team of photogrammetric professionals provides comprehensive engineering support for MLS projects. Leveraging years of GIS experience, we handle planimetric mapping and orthophoto production to meet a wide range of client requirements with ease.",
            tags: ["GIS Expertise", "Planimetrics", "Urban Engineering", "Ortho Production"]
        }
    },
    "mls-vectorization": {
        description: "Topographic mapping is a primary requirement for smarter route planning and high-level decision making in transport and telecom industries. Our 3D vector maps cover hundreds of square kilometers with precision, aiding in thematic data preparation, planimetric mapping, and disaster management strategies.",
        benefits: ["Smarter route planning", "Disaster management support", "Thematic data preparation", "Large-scale 3D mapping"],
        images: [
            "/brand/abstract-grid.svg",
            "/brand/abstract-grid.svg",
            "/brand/abstract-grid.svg"
        ],
        bottomSection: {
            title: "Global Delivery & Assured Quality",
            description: "With a global delivery framework and robust quality processes, we help you get the right value for your investment. We address the needs of utilities, mining, and municipal sectors, helping you create detailed topographic maps that drive success.",
            tags: ["Global Delivery", "Mining & Utility", "Quality Assurance", "Decision Support"]
        }
    },
    "dtm-classification": {
        description: "Our Digital Terrain Model (DTM) classification isolates the 'bare earth' by analyzing laser pulse reflections from man-made structures, vegetation, and the ground. By distinguishing between multiple returns—upper canopy vs. ground beneath—we derive precise elevation data to create accurate point cloud datasets of the terrain itself.",
        benefits: ["Bare-earth extraction", "Multi-return signal analysis", "Precise elevation modeling", "Vegetation filtering"],
        images: [
            "/brand/abstract-grid.svg",
            "/brand/abstract-grid.svg",
            "/brand/abstract-grid.svg"
        ],
        bottomSection: {
            title: "3D Modeling & Visualization",
            description: "Beyond classification, we offer a full suite of 3D modeling products for GIS applications, architectural design, and simulators. We bridge the gap between raw data and immersive 3D graphic design.",
            tags: ["3D Simulators", "GIS Apps", "Architectural Mod", "Visualization"]
        }
    },
    "bathymetry-mapping": {
        description: "LiDAR Bathymetry Mapping enables the seamless survey of land and water interfaces. We process bathymetric LiDAR data to map underwater topography, riverbeds, and coastal zones. This service is crucial for coastal management, harbor design, and understanding aquatic environments, providing a continuous model from land into water.",
        benefits: ["Underwater topography mapping", "Coastal zone management", "Riverbed analysis", "Seamless land-water modeling"],
        images: [
            "/brand/abstract-grid.svg",
            "/brand/abstract-grid.svg",
            "/brand/abstract-grid.svg"
        ],
        bottomSection: {
            title: "Seamless Land-to-Water Modeling",
            description: "Understanding what lies beneath the water's surface is vital for coastal resilience. Our bathymetric processing bridges the gap between terrestrial and aquatic data, creating a unified model of the coastal environment.",
            tags: ["Coastal Zone", "Hydrography", "Marine Survey", "Environment"]
        }
    },
    "default": {
        description: "We provide industry-leading LiDAR processing services tailored to your needs. Our expert team ensures high precision and timely delivery for all classification tasks.",
        benefits: ["Quality Assurance", "Fast Turnaround", "Expert Support"],
        images: [
            "/brand/abstract-grid.svg",
            "/brand/abstract-grid.svg",
            "/brand/abstract-grid.svg"
        ],
        bottomSection: {
            title: "Reliable Point Cloud Classification",
            description: "We have years of experience in Mapping services and point cloud classification. We extract UAV points manually as per required accuracy (horizontal & vertical) using stereo images. Our team constantly scales up to utilize new tools.",
            tags: ["High Accuracy", "Stereo Imaging", "Manual Extraction", "Scalable Teams"]
        }
    }
}

export default function LidarSubsectionPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.subsection as string

    // Find current subsection
    const currentSection = SUBSECTIONS.find(s => s.slug === slug)

    // If not found, show nice 404
    if (!currentSection) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <h1 className="text-2xl font-bold mb-4">Subsection Not Found</h1>
                <Button onClick={() => router.push("/it-services")}>Back to Services</Button>
            </div>
        )
    }

    // Get content or default
    const content = CONTENT_MAP[slug] || CONTENT_MAP["default"]
    // Ensure image paths are URL-encoded for spaces and special chars so
    // files in `public/IT-services/Lider_images` load correctly in browsers/servers.
    const encodePath = (p: string) => p.replace(/ /g, "%20").replace(/&/g, "%26")
    const carouselImages = (content.images || CONTENT_MAP["default"].images).map(encodePath)
    // Use the 2nd and 3rd images for the bottom section, or fallback
    const bottomImages = carouselImages.length >= 3 ? [carouselImages[1], carouselImages[2]] : carouselImages.slice(0, 2)


    return (
        <div className="min-h-screen bg-background relative overflow-hidden">

            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-30" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] opacity-30" />
            </div>

            {/* Hero / Header Section */}
            <section className="relative w-full pt-24 pb-12 z-10">
                <div className="container px-4 md:px-6">

                    {/* Breadcrumb / Back Link */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <Link
                            href="/it-services/14-lidar-technology-and-services"
                            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
                        >
                            <div className="p-1 rounded-full bg-muted group-hover:bg-primary/20 transition-colors">
                                <ArrowLeft className="size-4" />
                            </div>
                            <span className="group-hover:translate-x-1 transition-transform">Back to LiDAR Services</span>
                        </Link>
                    </motion.div>



                    {/* CAROUSEL */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="w-full mb-16 rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-transparent z-10 pointer-events-none" />

                        <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex flex-col items-center text-center pb-12 md:pb-16">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg tracking-tight mb-4"
                            >
                                {currentSection.title}
                            </motion.h1>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: 100 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                className="h-1 bg-primary rounded-full"
                            />
                        </div>

                        <LidarCarousel images={carouselImages} />
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-12 items-start">

                        {/* LEFT COLUMN: Main Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="lg:col-span-2 space-y-10"
                        >
                            {/* Intro Text */}
                            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
                                <p className="text-xl font-medium leading-relaxed text-foreground/90 border-l-4 border-primary pl-6 py-1">
                                    {content.description}
                                </p>
                                {/* <p className="leading-relaxed">
                                    Nowadays, point cloud datasets have been widely used in characterizing vegetation structure where the full potential of the photogrammetric data has not been utilized. Most requirements involve converting dense point cloud information into Digital Elevation Models (DEM), Digital Terrain Models (DTM), DSM, or CSM because working with pure LiDAR-like datasets presents unique challenges in terms of scale and complexity.
                                </p> */}
                                {/* <p className="leading-relaxed">
                                    In general, UAV point clouds are critical for measuring canopy height, tree height, tree crown diameter analysis, detecting individual trees, and specifically for precision agriculture applications like monitoring annual crops.
                                </p> */}
                            </div>

                            {/* Bottom Images */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {bottomImages.map((img, idx) => (
                                    <div key={idx} className="group relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-border/50">
                                        <img
                                            src={img}
                                            alt={`LiDAR visualization ${idx + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                ))}
                            </div>

                            {/* Dynamic Bottom Section */}
                            <div className="p-8 rounded-3xl bg-muted/30 border border-border/50 backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />

                                <h2 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">
                                    {content.bottomSection.title}
                                </h2>
                                <p className="text-muted-foreground mb-6 leading-relaxed relative z-10">
                                    {content.bottomSection.description}
                                </p>

                                <div className="flex flex-wrap gap-3 relative z-10">
                                    {content.bottomSection.tags.map((tag, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                                            <CheckCircle2 className="size-3" /> {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* RIGHT COLUMN: Sidebar */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="space-y-8 lg:sticky lg:top-24"
                        >
                            {/* Navigation Menu */}
                            <Card className="border-border/50 shadow-xl bg-background/60 backdrop-blur-md overflow-hidden">
                                <CardHeader className="bg-muted/50 border-b border-border/50 pb-4">
                                    <CardTitle className="text-base font-bold text-foreground">LiDAR Services</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <nav className="flex flex-col">
                                        {SUBSECTIONS.map((sub, idx) => {
                                            const isActive = slug === sub.slug
                                            return (
                                                <Link
                                                    key={idx}
                                                    href={`/it-services/14-lidar-technology-and-services/${sub.slug}`}
                                                    className={cn(
                                                        "flex items-center justify-between p-4 border-b border-border/40 last:border-0 text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                                        isActive
                                                            ? "text-primary bg-primary/5 pl-5"
                                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:pl-5"
                                                    )}
                                                >
                                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                                                    <span className="z-10">{sub.title}</span>
                                                    {isActive && <ChevronRight className="size-4 text-primary" />}
                                                </Link>
                                            )
                                        })}
                                    </nav>
                                </CardContent>
                            </Card>

                            {/* Contact Box */}
                            <div className="rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-1 shadow-xl">
                                <div className="bg-background rounded-xl p-6 text-center h-full">
                                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary animate-pulse">
                                        <Phone className="size-7" />
                                    </div>
                                    <h4 className="font-bold text-lg mb-2">Need Expert Advice?</h4>
                                    <p className="text-sm text-muted-foreground mb-6">Our LiDAR specialists are available 24/7 to assist you.</p>
                                    <Link href="/contact">
                                        <Button className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl">
                                            Contact Us
                                        </Button>
                                    </Link>
                                </div>
                            </div>


                        </motion.div>
                    </div>
                </div>

            </section>

        </div>
    )
}
