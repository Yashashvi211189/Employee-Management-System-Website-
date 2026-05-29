"use client";

import { API_URL } from "@/lib/config";
import useAuth from "@/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
    X,
    Save,
    Plus,
    Trash2,
    Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Product } from "../types";
import { productCategories, isFile } from "../constants";

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Partial<Product>;
    onSave: (product: Partial<Product>) => void;
    isEdit?: boolean;
}

export const ProductModal = ({
    isOpen,
    onClose,
    product,
    onSave,
    isEdit = false,
}: ProductModalProps) => {
    const auth = useAuth();
    const [activeTab, setActiveTab] = useState("basic");
    const isInitialMount = useRef(true);

    const [localProduct, setLocalProduct] = useState<Partial<Product>>(() => {
        return {
            name: "",
            tagline: "",
            iconText: "",
            cover: "",
            description: "",
            fullDescription: "",
            features: [],
            outcomes: [],
            challenges: [],
            technologies: [],
            stats: [],
            liveUrl: "",
            status: "In Development",
            category: "education",
            platforms: [],
            integrations: [],
            support: [],
            documentationUrl: "",
            demoUrl: "",
            featured: false,
            sortOrder: 0,
            ...product,
        };
    });

    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [existingGalleryImages, setExistingGalleryImages] = useState<any[]>([]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (isOpen && product) {
            setLocalProduct((prev) => ({
                ...prev,
                ...product,
            }));
            setGalleryFiles([]);
        }
    }, [isOpen, product]);

    useEffect(() => {
        if (isOpen && isEdit && product?.id) {
            const fetchGalleryImages = async () => {
                try {
                    const res = await auth.authFetch(
                        `${API_URL}/api/products/${product.id}/gallery/`
                    );
                    if (res.ok) {
                        const galleryData = await res.json();
                        setExistingGalleryImages(galleryData);
                    } else {
                        console.error("Failed to fetch gallery images");
                    }
                } catch (err) {
                    console.error("Error fetching gallery images:", err);
                }
            };
            fetchGalleryImages();
        } else {
            setExistingGalleryImages([]);
        }
    }, [isOpen, isEdit, product?.id]);

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                if (!isEdit) {
                    setLocalProduct({
                        name: "",
                        tagline: "",
                        iconText: "",
                        cover: "",
                        description: "",
                        fullDescription: "",
                        features: [],
                        outcomes: [],
                        challenges: [],
                        technologies: [],
                        stats: [],
                        liveUrl: "",
                        status: "In Development",
                        category: "education",
                        platforms: [],
                        integrations: [],
                        support: [],
                        documentationUrl: "",
                        demoUrl: "",
                        featured: false,
                        sortOrder: 0,
                    });
                    setGalleryFiles([]);
                }
                setActiveTab("basic");
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, isEdit]);

    if (!isOpen) {
        return (
            <div style={{ display: "none" }}>
                {/* Hidden placeholder to maintain state */}
            </div>
        );
    }

    const handleSave = () => {
        const productData: any = {
            ...localProduct,
        };

        galleryFiles.forEach((file, index) => {
            productData[`gallery_${index}`] = file;
        });

        onSave(productData);
    };

    const handleImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: string
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setLocalProduct((prev) => ({
                ...prev,
                [field]: file,
            }));
        }
    };

    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newGallery = Array.from(files);
            setGalleryFiles((prev) => [...prev, ...newGallery]);
        }
    };

    const removeGalleryImage = (index: number) => {
        setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const deleteExistingGalleryImage = async (galleryId: number) => {
        try {
            const res = await auth.authFetch(
                `${API_URL}/api/products/gallery/${galleryId}/`,
                { method: "DELETE" }
            );

            if (res.ok) {
                setExistingGalleryImages((prev) =>
                    prev.filter((img) => img.id !== galleryId)
                );
            } else {
                alert("Failed to delete gallery image");
            }
        } catch (err) {
            console.error("Error deleting gallery image:", err);
            alert("Error deleting gallery image");
        }
    };

    const addFeature = () => {
        setLocalProduct((prev) => ({
            ...prev,
            features: [...(prev.features || []), ""],
        }));
    };

    const updateFeature = (index: number, value: string) => {
        const updatedFeatures = [...(localProduct.features || [])];
        updatedFeatures[index] = value;
        setLocalProduct((prev) => ({
            ...prev,
            features: updatedFeatures,
        }));
    };

    const removeFeature = (index: number) => {
        setLocalProduct((prev) => ({
            ...prev,
            features: prev.features?.filter((_, i) => i !== index) || [],
        }));
    };

    const addStat = () => {
        setLocalProduct((prev) => ({
            ...prev,
            stats: [...(prev.stats || []), { label: "", value: "" }],
        }));
    };

    const updateStat = (index: number, field: string, value: string) => {
        const updatedStats = [...(localProduct.stats || [])];
        updatedStats[index] = { ...updatedStats[index], [field]: value };
        setLocalProduct((prev) => ({
            ...prev,
            stats: updatedStats,
        }));
    };

    const removeStat = (index: number) => {
        setLocalProduct((prev) => ({
            ...prev,
            stats: prev.stats?.filter((_, i) => i !== index) || [],
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold">
                        {isEdit ? "Edit Product" : "Add New Product"}
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
                        <TabsList className="grid w-full grid-cols-4 mb-6 gap-1">
                            <TabsTrigger
                                value="basic"
                                className="text-xs py-2 px-1 truncate"
                            >
                                Basic Info
                            </TabsTrigger>
                            <TabsTrigger
                                value="description"
                                className="text-xs py-2 px-1 truncate"
                            >
                                Description
                            </TabsTrigger>
                            <TabsTrigger
                                value="media"
                                className="text-xs py-2 px-1 truncate"
                            >
                                Media
                            </TabsTrigger>
                            <TabsTrigger
                                value="advanced"
                                className="text-xs py-2 px-1 truncate"
                            >
                                Advanced
                            </TabsTrigger>
                        </TabsList>

                        {/* BASIC TAB */}
                        <TabsContent value="basic" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input
                                        id="name"
                                        value={localProduct.name || ""}
                                        onChange={(e) =>
                                            setLocalProduct({
                                                ...localProduct,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="Enter product name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="tagline">Tagline *</Label>
                                    <Input
                                        id="tagline"
                                        value={localProduct.tagline || ""}
                                        onChange={(e) =>
                                            setLocalProduct({
                                                ...localProduct,
                                                tagline: e.target.value,
                                            })
                                        }
                                        placeholder="Short catchy tagline"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="iconText">Icon Text</Label>
                                    <Input
                                        id="iconText"
                                        value={localProduct.iconText || ""}
                                        onChange={(e) =>
                                            setLocalProduct({
                                                ...localProduct,
                                                iconText: e.target.value,
                                            })
                                        }
                                        placeholder="Single character or short text"
                                        maxLength={3}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="category">Category *</Label>
                                    <select
                                        id="category"
                                        value={localProduct.category}
                                        onChange={(e) =>
                                            setLocalProduct({
                                                ...localProduct,
                                                category: e.target.value,
                                            })
                                        }
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        {productCategories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        value={localProduct.status}
                                        onChange={(e) =>
                                            setLocalProduct({
                                                ...localProduct,
                                                status: e.target.value as any,
                                            })
                                        }
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="Live">Live</option>
                                        <option value="In Development">In Development</option>
                                        <option value="Coming Soon">Coming Soon</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="liveUrl">Live URL</Label>
                                    <Input
                                        id="liveUrl"
                                        value={localProduct.liveUrl || ""}
                                        onChange={(e) =>
                                            setLocalProduct({
                                                ...localProduct,
                                                liveUrl: e.target.value,
                                            })
                                        }
                                        placeholder="https://product-domain.com"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="demoUrl">Demo URL</Label>
                                    <Input
                                        id="demoUrl"
                                        value={localProduct.demoUrl || ""}
                                        onChange={(e) =>
                                            setLocalProduct({
                                                ...localProduct,
                                                demoUrl: e.target.value,
                                            })
                                        }
                                        placeholder="https://demo.product.com"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* DESCRIPTION TAB */}
                        <TabsContent value="description" className="space-y-4">
                            <div>
                                <Label htmlFor="description">Short Description *</Label>
                                <Textarea
                                    id="description"
                                    value={localProduct.description || ""}
                                    onChange={(e) =>
                                        setLocalProduct({
                                            ...localProduct,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Brief description for product cards..."
                                    rows={3}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {localProduct.description?.length || 0}/300 characters
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="fullDescription">Full Description *</Label>
                                <Textarea
                                    id="fullDescription"
                                    value={localProduct.fullDescription || ""}
                                    onChange={(e) =>
                                        setLocalProduct({
                                            ...localProduct,
                                            fullDescription: e.target.value,
                                        })
                                    }
                                    placeholder="Comprehensive product description with details..."
                                    rows={6}
                                />
                            </div>

                            {/* Technologies Field */}
                            <div>
                                <Label htmlFor="technologies">Technologies</Label>
                                <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-md min-h-10 bg-white">
                                    {localProduct.technologies?.map((tech, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="flex items-center gap-1 text-xs"
                                        >
                                            {tech}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updatedTech =
                                                        localProduct.technologies?.filter(
                                                            (_, i) => i !== index
                                                        ) || [];
                                                    setLocalProduct({
                                                        ...localProduct,
                                                        technologies: updatedTech,
                                                    });
                                                }}
                                                className="text-gray-500 hover:text-red-500"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                    <input
                                        type="text"
                                        className="flex-1 outline-none border-none bg-transparent text-sm min-w-[120px]"
                                        placeholder={
                                            localProduct.technologies?.length === 0
                                                ? "Type technology and press Enter or comma..."
                                                : "Add more technologies..."
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === ",") {
                                                e.preventDefault();
                                                const value = e.currentTarget.value.trim();
                                                if (
                                                    value &&
                                                    !localProduct.technologies?.includes(value)
                                                ) {
                                                    const updatedTech = [
                                                        ...(localProduct.technologies || []),
                                                        value,
                                                    ];
                                                    setLocalProduct({
                                                        ...localProduct,
                                                        technologies: updatedTech,
                                                    });
                                                    e.currentTarget.value = "";
                                                }
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const value = e.target.value.trim();
                                            if (
                                                value &&
                                                !localProduct.technologies?.includes(value)
                                            ) {
                                                const updatedTech = [
                                                    ...(localProduct.technologies || []),
                                                    value,
                                                ];
                                                setLocalProduct({
                                                    ...localProduct,
                                                    technologies: updatedTech,
                                                });
                                                e.target.value = "";
                                            }
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Type technology and press Enter or comma to add. Click × to
                                    remove.
                                </p>
                            </div>

                            {/* Outcomes and Challenges */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <Label htmlFor="outcomes">Outcomes</Label>
                                        <Badge variant="outline" className="text-xs">
                                            {localProduct.outcomes?.length || 0} items
                                        </Badge>
                                    </div>
                                    <Textarea
                                        id="outcomes"
                                        value={localProduct.outcomes?.join("\n") || ""}
                                        onChange={(e) => {
                                            const lines = e.target.value.split("\n");
                                            setLocalProduct({
                                                ...localProduct,
                                                outcomes: lines,
                                            });
                                        }}
                                        placeholder={`Enter each outcome on a new line:\n• Improved efficiency\n• Cost reduction\n• Better user experience`}
                                        rows={5}
                                        className="font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Press Enter to create new lines. Each line becomes a
                                        separate outcome.
                                    </p>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <Label htmlFor="challenges">Challenges</Label>
                                        <Badge variant="outline" className="text-xs">
                                            {localProduct.challenges?.length || 0} items
                                        </Badge>
                                    </div>
                                    <Textarea
                                        id="challenges"
                                        value={localProduct.challenges?.join("\n") || ""}
                                        onChange={(e) => {
                                            const lines = e.target.value.split("\n");
                                            setLocalProduct({
                                                ...localProduct,
                                                challenges: lines,
                                            });
                                        }}
                                        placeholder={`Enter each challenge on a new line:\n• Scalability issues\n• Performance optimization\n• Integration complexity`}
                                        rows={5}
                                        className="font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Press Enter to create new lines. Each line becomes a
                                        separate challenge.
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        {/* MEDIA TAB */}
                        <TabsContent value="media" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="cover">Cover Image</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, "cover")}
                                        className="h-10"
                                    />
                                    {isFile(localProduct.cover) && (
                                        <p className="text-xs text-green-600 mt-1">
                                            Selected: {localProduct.cover.name}
                                        </p>
                                    )}
                                    {typeof localProduct.cover === "string" &&
                                        localProduct.cover && (
                                            <div className="mt-2">
                                                <p className="text-xs text-gray-600">
                                                    Current cover image:
                                                </p>
                                                <img
                                                    src={`${API_URL}${localProduct.cover}`}
                                                    alt="Cover preview"
                                                    className="w-32 h-32 object-cover rounded-lg mt-1"
                                                />
                                            </div>
                                        )}
                                </div>
                                <div>
                                    <Label htmlFor="gallery">Gallery Images</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleGalleryUpload}
                                        className="h-10"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Select multiple images for product gallery
                                    </p>
                                </div>
                            </div>

                            {/* Gallery Preview */}
                            {(galleryFiles.length > 0 ||
                                existingGalleryImages.length > 0) && (
                                    <div>
                                        <Label>
                                            Gallery Preview ({galleryFiles.length} new,{" "}
                                            {existingGalleryImages.length} existing)
                                        </Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                            {/* Existing gallery images */}
                                            {existingGalleryImages.map((image, index) => (
                                                <div
                                                    key={`existing-${image.id}`}
                                                    className="relative group"
                                                >
                                                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src={`${API_URL}${image.image}`}
                                                            alt={`Existing gallery ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => deleteExistingGalleryImage(image.id)}
                                                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}

                                            {/* New gallery files */}
                                            {galleryFiles.map((file, index) => (
                                                <div key={`new-${index}`} className="relative group">
                                                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={`New gallery ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => removeGalleryImage(index)}
                                                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {/* Show message if gallery is empty */}
                            {galleryFiles.length === 0 &&
                                existingGalleryImages.length === 0 && (
                                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500 text-sm">
                                            No gallery images added yet
                                        </p>
                                        <p className="text-gray-400 text-xs mt-1">
                                            Upload images using the file input above
                                        </p>
                                    </div>
                                )}
                        </TabsContent>

                        {/* ADVANCED TAB */}
                        <TabsContent value="advanced" className="space-y-4">
                            {/* Features Section */}
                            <div className="flex justify-between items-center">
                                <Label>Features *</Label>
                                <Button type="button" onClick={addFeature} size="sm">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Feature
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {localProduct.features?.map((feature, index) => (
                                    <div key={index} className="flex gap-2 items-start">
                                        <Input
                                            value={feature}
                                            onChange={(e) => updateFeature(index, e.target.value)}
                                            placeholder={`Feature ${index + 1}`}
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeFeature(index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Statistics Section */}
                            <div className="flex justify-between items-center mt-6">
                                <Label>Statistics</Label>
                                <Button type="button" onClick={addStat} size="sm">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Stat
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {localProduct.stats?.map((stat, index) => (
                                    <div key={index} className="grid grid-cols-2 gap-2">
                                        <Input
                                            value={stat.label}
                                            onChange={(e) =>
                                                updateStat(index, "label", e.target.value)
                                            }
                                            placeholder="Label (e.g., Active Users)"
                                        />
                                        <div className="flex gap-2">
                                            <Input
                                                value={stat.value}
                                                onChange={(e) =>
                                                    updateStat(index, "value", e.target.value)
                                                }
                                                placeholder="Value (e.g., 50K+)"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeStat(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Additional Advanced Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <div>
                                    <Label htmlFor="documentationUrl">Documentation URL</Label>
                                    <Input
                                        id="documentationUrl"
                                        value={localProduct.documentationUrl || ""}
                                        onChange={(e) =>
                                            setLocalProduct({
                                                ...localProduct,
                                                documentationUrl: e.target.value,
                                            })
                                        }
                                        placeholder="https://docs.product.com"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="sortOrder">Sort Order</Label>
                                    <Input
                                        id="sortOrder"
                                        type="number"
                                        value={localProduct.sortOrder || 0}
                                        onChange={(e) =>
                                            setLocalProduct({
                                                ...localProduct,
                                                sortOrder: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Lower numbers appear first
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="featured"
                                    checked={localProduct.featured || false}
                                    onChange={(e) =>
                                        setLocalProduct({
                                            ...localProduct,
                                            featured: e.target.checked,
                                        })
                                    }
                                    className="rounded border-gray-300"
                                />
                                <Label
                                    htmlFor="featured"
                                    className="text-sm font-medium leading-none"
                                >
                                    Featured Product
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
                            disabled={
                                !localProduct.name ||
                                !localProduct.tagline ||
                                !localProduct.description ||
                                !localProduct.fullDescription
                            }
                            className="bg-primary"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isEdit ? "Update Product" : "Add Product"}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
