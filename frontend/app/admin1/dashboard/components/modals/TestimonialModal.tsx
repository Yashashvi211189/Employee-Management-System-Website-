"use client";

import { API_URL } from "@/lib/config";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    X,
    Save,
    Upload,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TestimonialForm } from "../types";

interface TestimonialModalProps {
    isOpen: boolean;
    onClose: () => void;
    testimonial: Partial<TestimonialForm>;
    onSave: (testimonial: Partial<TestimonialForm>) => void;
    isEdit?: boolean;
}

export const TestimonialModal = ({
    isOpen,
    onClose,
    testimonial,
    onSave,
    isEdit = false,
}: TestimonialModalProps) => {
    const [localTestimonial, setLocalTestimonial] = useState<Partial<TestimonialForm>>(() => ({
        name: "",
        company: "",
        role: "",
        text: "",
        image: null,
        linkedin: "",
        status: "active",
        sort_order: 0,
        ...testimonial,
    }));

    useEffect(() => {
        setLocalTestimonial(testimonial);
    }, [testimonial]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(localTestimonial);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLocalTestimonial((prev) => ({
                ...prev,
                image: file,
            }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold">
                        {isEdit ? "Edit Testimonial" : "Add Testimonial"}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Profile Image Section */}
                    <div className="flex flex-col items-center mb-4">
                        <div className="relative w-24 h-24 mb-4">
                            {localTestimonial.image ? (
                                <img
                                    src={
                                        localTestimonial.image instanceof File
                                            ? URL.createObjectURL(localTestimonial.image)
                                            : typeof localTestimonial.image === "string" && localTestimonial.image
                                                ? localTestimonial.image.startsWith("http")
                                                    ? localTestimonial.image
                                                    : `${API_URL}${localTestimonial.image}`
                                                : "/brand/avatar.svg"
                                    }
                                    alt="Profile preview"
                                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="w-12 h-12 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="image-upload" className="cursor-pointer">
                                <Button variant="outline" size="sm" asChild>
                                    <span>
                                        <Upload className="w-4 h-4 mr-2" />
                                        {localTestimonial.image ? "Change Photo" : "Upload Photo"}
                                    </span>
                                </Button>
                            </Label>
                            <Input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Recommended: Square photo for best results
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium">Full Name *</Label>
                            <Input
                                value={localTestimonial.name || ""}
                                onChange={(e) =>
                                    setLocalTestimonial({
                                        ...localTestimonial,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="John Doe"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Company *</Label>
                            <Input
                                value={localTestimonial.company || ""}
                                onChange={(e) =>
                                    setLocalTestimonial({
                                        ...localTestimonial,
                                        company: e.target.value,
                                    })
                                }
                                placeholder="Company Name"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Role/Title *</Label>
                            <Input
                                value={localTestimonial.role || ""}
                                onChange={(e) =>
                                    setLocalTestimonial({
                                        ...localTestimonial,
                                        role: e.target.value,
                                    })
                                }
                                placeholder="CEO, Manager, etc."
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium">LinkedIn URL</Label>
                            <Input
                                value={localTestimonial.linkedin}
                                onChange={(e) =>
                                    setLocalTestimonial({
                                        ...localTestimonial,
                                        linkedin: e.target.value,
                                    })
                                }
                                placeholder="https://linkedin.com/in/username"
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium">Status</Label>
                            <select
                                value={localTestimonial.status}
                                onChange={(e) =>
                                    setLocalTestimonial({
                                        ...localTestimonial,
                                        status: e.target.value as "active" | "inactive",
                                    })
                                }
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Sort Order</Label>
                            <Input
                                type="number"
                                value={localTestimonial.sort_order || 0}
                                onChange={(e) =>
                                    setLocalTestimonial({
                                        ...localTestimonial,
                                        sort_order: parseInt(e.target.value) || 0,
                                    })
                                }
                                placeholder="0"
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Lower numbers appear first
                            </p>
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium">Testimonial Text *</Label>
                        <Textarea
                            value={localTestimonial.text || ""}
                            onChange={(e) =>
                                setLocalTestimonial({
                                    ...localTestimonial,
                                    text: e.target.value,
                                })
                            }
                            placeholder="What did the client say about working with us?"
                            rows={6}
                            className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {localTestimonial.text?.length || 0} characters
                        </p>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!localTestimonial.name || !localTestimonial.company || !localTestimonial.role || !localTestimonial.text}
                        className="bg-primary"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isEdit ? "Update Testimonial" : "Add Testimonial"}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
