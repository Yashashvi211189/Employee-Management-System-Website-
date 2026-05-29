"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GalleryItemForm } from "../types";

interface GalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    galleryItem: Partial<GalleryItemForm>;
    onSave: (item: Partial<GalleryItemForm>) => void;
    isAdding?: boolean;
}

export const GalleryModal = ({
    isOpen,
    onClose,
    galleryItem,
    onSave,
    isAdding = false,
}: GalleryModalProps) => {
    const [localItem, setLocalItem] = useState<Partial<GalleryItemForm>>(() => ({
        title: "",
        category: "office",
        image: null,
        description: "",
        ...galleryItem,
    }));

    useEffect(() => {
        if (isOpen) {
            setLocalItem({
                title: "",
                category: "office",
                image: null,
                description: "",
                ...galleryItem,
            });
        }
    }, [isOpen, galleryItem]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(localItem);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setLocalItem({
            ...localItem,
            image: file || null,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold">Add Gallery Image</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <Label className="text-xs">Title *</Label>
                        <Input
                            value={localItem.title || ""}
                            onChange={(e) =>
                                setLocalItem({
                                    ...localItem,
                                    title: e.target.value,
                                })
                            }
                            className="h-9 text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs">Category</Label>
                                <select
                                    value={localItem.category}
                                    onChange={(e) =>
                                        setLocalItem({
                                            ...localItem,
                                            category: e.target.value,
                                        })
                                    }
                                    className="h-9 text-sm rounded-md border border-gray-200 bg-background px-3"
                                >
                                    <option value="office">Office</option>
                                    <option value="events">Events</option>
                                    <option value="celebration">Celebration</option>
                                    <option value="others">Others</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs">Upload Image</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="h-9 text-sm"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Description</Label>
                        <Textarea
                            value={localItem.description || ""}
                            onChange={(e) =>
                                setLocalItem({
                                    ...localItem,
                                    description: e.target.value,
                                })
                            }
                            className="text-sm resize-none"
                            rows={3}
                        />
                    </div>
                </div>
                <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!localItem.title || isAdding}
                        className="bg-primary"
                    >
                        {isAdding ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Adding...
                            </div>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Add Image
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
