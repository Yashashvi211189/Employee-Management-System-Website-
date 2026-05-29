"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    X,
    Save,
    Star,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectForm } from "../types";
import { projectCategories, colorOptions, isFile } from "../constants";

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Partial<ProjectForm>;
    onSave: (project: Partial<ProjectForm>) => void;
    isEdit?: boolean;
}

export const ProjectModal = ({
    isOpen,
    onClose,
    project,
    onSave,
    isEdit = false,
}: ProjectModalProps) => {
    const [activeTab, setActiveTab] = useState("basic");
    const [localProject, setLocalProject] = useState<Partial<ProjectForm>>(() => {
        if (isEdit && project) {
            return {
                ...project,
                testimonial: project.testimonial_name
                    ? {
                        name: project.testimonial_name,
                        role: project.testimonial_role || "",
                        image: project.testimonial_image || "",
                        quote: project.testimonial_quote || "",
                        rating: project.testimonial_rating || 5,
                    }
                    : undefined,
                technologies: Array.isArray(project.technologies)
                    ? project.technologies.join(", ")
                    : project.technologies || "",
                challenges: Array.isArray(project.challenges)
                    ? project.challenges.join("\n")
                    : project.challenges || "",
                outcomes: Array.isArray(project.outcomes)
                    ? project.outcomes.join("\n")
                    : project.outcomes || "",
            };
        }
        return project;
    });

    useEffect(() => {
        setLocalProject(project);
    }, [project]);

    if (!isOpen) return null;

    const handleSave = () => {
        const backendData: any = {
            ...localProject,
        };

        if (typeof localProject.technologies === "string") {
            backendData.technologies = localProject.technologies;
        } else if (Array.isArray(localProject.technologies)) {
            backendData.technologies = localProject.technologies.join(", ");
        } else {
            backendData.technologies = "";
        }

        if (typeof localProject.challenges === "string") {
            backendData.challenges = localProject.challenges;
        } else if (Array.isArray(localProject.challenges)) {
            backendData.challenges = localProject.challenges.join("\n");
        } else {
            backendData.challenges = "";
        }

        if (typeof localProject.outcomes === "string") {
            backendData.outcomes = localProject.outcomes;
        } else if (Array.isArray(localProject.outcomes)) {
            backendData.outcomes = localProject.outcomes.join("\n");
        } else {
            backendData.outcomes = "";
        }

        if (localProject.testimonial) {
            backendData.testimonial_name = localProject.testimonial.name || "";
            backendData.testimonial_role = localProject.testimonial.role || "";
            backendData.testimonial_image = localProject.testimonial.image || "";
            backendData.testimonial_quote = localProject.testimonial.quote || "";
            backendData.testimonial_rating = localProject.testimonial.rating || 5;
        } else {
            backendData.testimonial_name = "";
            backendData.testimonial_role = "";
            backendData.testimonial_image = "";
            backendData.testimonial_quote = "";
            backendData.testimonial_rating = 5;
        }

        delete backendData.testimonial;

        backendData.stats = backendData.stats || {};
        backendData.gallery = backendData.gallery || [];
        backendData.featured = backendData.featured || false;

        onSave(backendData);
    };

    const handleImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: string
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setLocalProject((prev) => ({
                ...prev,
                [field]: file,
            }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold">
                        {isEdit ? "Edit Project" : "Add New Project"}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-6 gap-1">
                            <TabsTrigger
                                value="basic"
                                className="text-xs py-2 px-1 truncate"
                            >
                                Basic
                            </TabsTrigger>
                            <TabsTrigger
                                value="details"
                                className="text-xs py-2 px-1 truncate"
                            >
                                Details
                            </TabsTrigger>
                            <TabsTrigger
                                value="media"
                                className="text-xs py-2 px-1 truncate"
                            >
                                Media
                            </TabsTrigger>
                            <TabsTrigger
                                value="testimonial"
                                className="text-xs py-2 px-1 truncate"
                            >
                                Testimonial
                            </TabsTrigger>
                            <TabsTrigger
                                value="advanced"
                                className="text-xs py-2 px-1 truncate"
                            >
                                Advanced
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="title">Project Title *</Label>
                                    <Input
                                        id="title"
                                        value={localProject.title || ""}
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="Enter project title"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="category">Category *</Label>
                                    <select
                                        id="category"
                                        value={localProject.category}
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                category: e.target.value,
                                            })
                                        }
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        {projectCategories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="shortDescription">
                                        Short Description *
                                    </Label>
                                    <Input
                                        id="shortDescription"
                                        value={localProject.shortDescription || ""}
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                shortDescription: e.target.value,
                                            })
                                        }
                                        placeholder="Short description for cards"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {localProject.shortDescription?.length || 0}/200
                                        characters
                                    </p>
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        value={localProject.status}
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                status: e.target.value as any,
                                            })
                                        }
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="planned">Planned</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="client">Client</Label>
                                    <Input
                                        id="client"
                                        value={localProject.client || ""}
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                client: e.target.value,
                                            })
                                        }
                                        placeholder="Client name or organization"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="timeline">Timeline</Label>
                                    <Input
                                        id="timeline"
                                        value={localProject.timeline || ""}
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                timeline: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., 6 months, Q2 2024"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Full Description</Label>
                                <Textarea
                                    id="description"
                                    value={localProject.description || ""}
                                    onChange={(e) =>
                                        setLocalProject({
                                            ...localProject,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Detailed project description..."
                                    rows={4}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="details" className="space-y-4">
                            <div>
                                <Label htmlFor="details">Project Details</Label>
                                <Textarea
                                    id="details"
                                    value={localProject.details || ""}
                                    onChange={(e) =>
                                        setLocalProject({
                                            ...localProject,
                                            details: e.target.value,
                                        })
                                    }
                                    placeholder="Comprehensive project overview, technical details, approach..."
                                    rows={6}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="team">Team</Label>
                                    <Input
                                        id="team"
                                        value={localProject.team || ""}
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                team: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., 3 developers, 1 designer, 1 PM"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="technologies">
                                        Technologies (comma separated)
                                    </Label>
                                    <Input
                                        id="technologies"
                                        value={
                                            Array.isArray(localProject.technologies)
                                                ? localProject.technologies.join(", ")
                                                : localProject.technologies || ""
                                        }
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                technologies: e.target.value,
                                            })
                                        }
                                        placeholder="React, Node.js, MongoDB, AWS"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="challenges">
                                        Challenges (one per line)
                                    </Label>
                                    <Textarea
                                        id="challenges"
                                        value={
                                            Array.isArray(localProject.challenges)
                                                ? localProject.challenges.join("\n")
                                                : localProject.challenges || ""
                                        }
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                challenges: e.target.value,
                                            })
                                        }
                                        placeholder="Key challenges faced during project..."
                                        rows={4}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="outcomes">Outcomes (one per line)</Label>
                                    <Textarea
                                        id="outcomes"
                                        value={
                                            Array.isArray(localProject.outcomes)
                                                ? localProject.outcomes.join("\n")
                                                : localProject.outcomes || ""
                                        }
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                outcomes: e.target.value,
                                            })
                                        }
                                        placeholder="Key results and achievements..."
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="media" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="image">Upload Main Image</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, "image")}
                                        className="h-10"
                                    />
                                    {isFile(localProject.image) && (
                                        <p className="text-xs text-green-600 mt-1">
                                            Selected: {localProject.image.name}
                                        </p>
                                    )}
                                    {typeof localProject.image === "string" &&
                                        localProject.image && (
                                            <p className="text-xs text-gray-600 mt-1">
                                                Current image: {localProject.image}
                                            </p>
                                        )}
                                </div>
                                <div>
                                    <Label htmlFor="liveUrl">Live Project URL</Label>
                                    <Input
                                        id="liveUrl"
                                        value={localProject.liveUrl || ""}
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                liveUrl: e.target.value,
                                            })
                                        }
                                        placeholder="https://project-domain.com"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="videoUrl">Video URL</Label>
                                    <Input
                                        id="videoUrl"
                                        value={localProject.videoUrl || ""}
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                videoUrl: e.target.value,
                                            })
                                        }
                                        placeholder="https://youtube.com/watch?v=..."
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="gallery">
                                        Gallery Images (comma separated URLs)
                                    </Label>
                                    <Input
                                        id="gallery"
                                        value={localProject.gallery?.join(", ") || ""}
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                gallery: e.target.value
                                                    .split(",")
                                                    .map((url) => url.trim())
                                                    .filter((url) => url !== ""),
                                            })
                                        }
                                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="testimonial" className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center gap-2 text-blue-800">
                                    <Users className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        Client Testimonial
                                    </span>
                                </div>
                                <p className="text-blue-700 text-xs mt-1">
                                    Add a client testimonial to showcase feedback for this
                                    project.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="testimonialName">Client Name</Label>
                                    <Input
                                        id="testimonialName"
                                        value={localProject.testimonial?.name || ""}
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                testimonial: {
                                                    ...localProject.testimonial,
                                                    name: e.target.value,
                                                },
                                            })
                                        }
                                        placeholder="e.g., Dr. Sarah Johnson"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="testimonialRole">
                                        Client Role & Company
                                    </Label>
                                    <Input
                                        id="testimonialRole"
                                        value={localProject.testimonial?.role || ""}
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                testimonial: {
                                                    ...localProject.testimonial,
                                                    role: e.target.value,
                                                },
                                            })
                                        }
                                        placeholder="e.g., Dean of Technology, Westlake University"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="testimonialImage">Client Photo URL</Label>
                                    <Input
                                        id="testimonialImage"
                                        value={localProject.testimonial?.image || ""}
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                testimonial: {
                                                    ...localProject.testimonial,
                                                    image: e.target.value,
                                                },
                                            })
                                        }
                                        placeholder="https://example.com/client-photo.jpg"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="testimonialRating">Rating</Label>
                                    <div className="flex items-center gap-2">
                                        <select
                                            id="testimonialRating"
                                            value={localProject.testimonial?.rating || 5}
                                            onChange={(e) =>
                                                setLocalProject({
                                                    ...localProject,
                                                    testimonial: {
                                                        ...localProject.testimonial,
                                                        rating: parseInt(e.target.value),
                                                    },
                                                })
                                            }
                                            className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <option key={rating} value={rating}>
                                                    {rating} {rating === 1 ? "Star" : "Stars"}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < (localProject.testimonial?.rating || 5)
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="testimonialQuote">Testimonial Quote</Label>
                                <Textarea
                                    id="testimonialQuote"
                                    value={localProject.testimonial?.quote || ""}
                                    onChange={(e) =>
                                        setLocalProject({
                                            ...localProject,
                                            testimonial: {
                                                ...localProject.testimonial,
                                                quote: e.target.value,
                                            },
                                        })
                                    }
                                    placeholder="Client's testimonial about the project..."
                                    rows={5}
                                    className="resize-none"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="includeTestimonial"
                                    checked={!!localProject.testimonial?.name}
                                    onChange={(e) => {
                                        if (!e.target.checked) {
                                            setLocalProject({
                                                ...localProject,
                                                testimonial: undefined,
                                            });
                                        } else {
                                            setLocalProject({
                                                ...localProject,
                                                testimonial: {
                                                    name: "",
                                                    role: "",
                                                    image: "",
                                                    quote: "",
                                                    rating: 5,
                                                },
                                            });
                                        }
                                    }}
                                    className="rounded border-gray-300"
                                />
                                <Label
                                    htmlFor="includeTestimonial"
                                    className="text-sm font-medium leading-none"
                                >
                                    Include Client Testimonial
                                </Label>
                            </div>
                        </TabsContent>

                        <TabsContent value="advanced" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="color">Color Gradient</Label>
                                    <select
                                        id="color"
                                        value={localProject.color}
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                color: e.target.value,
                                            })
                                        }
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        {colorOptions.map((color) => (
                                            <option key={color} value={color}>
                                                {color.replace("from-", "").replace("to-", " → ")}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="icon">Icon</Label>
                                    <select
                                        id="icon"
                                        value={localProject.icon}
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                icon: e.target.value,
                                            })
                                        }
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="Briefcase">Briefcase</option>
                                        <option value="GraduationCap">Graduation Cap</option>
                                        <option value="Brain">Brain (AI)</option>
                                        <option value="BarChart">Bar Chart</option>
                                        <option value="Database">Database</option>
                                        <option value="ShoppingCart">Shopping Cart</option>
                                        <option value="Globe">Globe</option>
                                        <option value="Server">Server</option>
                                        <option value="Blocks">Blocks</option>
                                        <option value="Code">Code</option>
                                        <option value="Smartphone">Smartphone</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="stat1">Stat 1 Value</Label>
                                    <Input
                                        id="stat1"
                                        placeholder="e.g., 10K+"
                                        value={localProject.stats?.users || ""}
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                stats: {
                                                    ...localProject.stats,
                                                    users: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="stat1Label"
                                        className="text-xs text-gray-500 mt-1"
                                    >
                                        Label (e.g., users)
                                    </Label>
                                </div>
                                <div>
                                    <Label htmlFor="stat2">Stat 2 Value</Label>
                                    <Input
                                        id="stat2"
                                        placeholder="e.g., 4.8"
                                        value={localProject.stats?.rating || ""}
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                stats: {
                                                    ...localProject.stats,
                                                    rating: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="stat2Label"
                                        className="text-xs text-gray-500 mt-1"
                                    >
                                        Label (e.g., rating)
                                    </Label>
                                </div>
                                <div>
                                    <Label htmlFor="stat3">Stat 3 Value</Label>
                                    <Input
                                        id="stat3"
                                        placeholder="e.g., 50K+"
                                        value={localProject.stats?.downloads || ""}
                                        onChange={(e) =>
                                            setLocalProject({
                                                ...localProject,
                                                stats: {
                                                    ...localProject.stats,
                                                    downloads: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="stat3Label"
                                        className="text-xs text-gray-500 mt-1"
                                    >
                                        Label (e.g., downloads)
                                    </Label>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="featured"
                                    checked={localProject.featured || false}
                                    onChange={(e) =>
                                        setLocalProject({
                                            ...localProject,
                                            featured: e.target.checked,
                                        })
                                    }
                                    className="rounded border-gray-300"
                                />
                                <Label
                                    htmlFor="featured"
                                    className="text-sm font-medium leading-none"
                                >
                                    Featured Project
                                </Label>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3 mt-6">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!localProject.title || !localProject.shortDescription}
                            className="bg-primary"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isEdit ? "Update Project" : "Add Project"}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
