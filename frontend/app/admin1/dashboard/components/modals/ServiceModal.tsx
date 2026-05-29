"use client";

import { API_URL } from "@/lib/config";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    X,
    Save,
    Plus,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";                // <-- added missing import
import { ServiceForm, TeamMember } from "../types";
import { isFile } from "../constants";

// Define the shape of a use case (if not already in types)
interface UseCase {
    title: string;
    description: string;
    image?: string;
}

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: Partial<ServiceForm>;
    onSave: (service: Partial<ServiceForm>) => void;
    isEdit?: boolean;
    teamMembers?: TeamMember[];
    entityName?: string; // used for heading and button labels
}

export const ServiceModal = ({
    isOpen,
    onClose,
    service,
    onSave,
    isEdit = false,
    teamMembers = [],
    entityName = "Service",
}: ServiceModalProps) => {
    const [activeTab, setActiveTab] = useState("basic");
    const [localService, setLocalService] = useState<Partial<ServiceForm> & { use_cases?: UseCase[] }>(() => ({
        id: "",
        title: "",
        description: "",
        image: "",
        long_description: "",
        features: [],
        benefits: [],
        technologies: [],
        developers: [],
        demo_video_url: "",
        status: "active",
        sort_order: 0,
        use_cases: [],                 // <-- added with empty default
        ...service,
    }));

    useEffect(() => {
        setLocalService(service as any);  // cast is safe because we merged the types
    }, [service]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(localService);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLocalService((prev) => ({
                ...prev,
                image: file,
            }));
        }
    };

    const addListItem = (field: "features" | "benefits" | "technologies") => {
        setLocalService((prev) => ({
            ...prev,
            [field]: [...(prev[field] || []), ""],
        }));
    };

    const updateListItem = (field: "features" | "benefits" | "technologies", index: number, value: string) => {
        const updatedList = [...(localService[field] || [])];
        updatedList[index] = value;
        setLocalService((prev) => ({
            ...prev,
            [field]: updatedList,
        }));
    };

    const removeListItem = (field: "features" | "benefits" | "technologies", index: number) => {
        setLocalService((prev) => ({
            ...prev,
            [field]: prev[field]?.filter((_, i) => i !== index) || [],
        }));
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
                        {isEdit ? `Edit ${entityName}` : `Add New ${entityName}`}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-6 gap-1">  {/* changed to 4 columns */}
                            <TabsTrigger value="basic" className="text-xs py-2 px-1 truncate">
                                Basic Info
                            </TabsTrigger>
                            <TabsTrigger value="details" className="text-xs py-2 px-1 truncate">
                                Details
                            </TabsTrigger>
                            <TabsTrigger value="advanced" className="text-xs py-2 px-1 truncate">
                                Advanced
                            </TabsTrigger>
                            <TabsTrigger value="useCases" className="text-xs py-2 px-1 truncate">
                                Use Cases
                            </TabsTrigger>
                        </TabsList>

                        {/* BASIC TAB */}
                        <TabsContent value="basic" className="space-y-4">
                            {/* ... existing basic tab content ... */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="id">Service ID *</Label>
                                    <Input
                                        id="id"
                                        value={localService.id || ""}
                                        onChange={(e) =>
                                            setLocalService({
                                                ...localService,
                                                id: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                                            })
                                        }
                                        placeholder="fullstack-development"
                                        disabled={isEdit}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Unique identifier (lowercase with hyphens)
                                    </p>
                                </div>
                                <div>
                                    <Label htmlFor="title">Service Title *</Label>
                                    <Input
                                        id="title"
                                        value={localService.title || ""}
                                        onChange={(e) =>
                                            setLocalService({
                                                ...localService,
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="Fullstack Development"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Short Description *</Label>
                                <Textarea
                                    id="description"
                                    value={localService.description || ""}
                                    onChange={(e) =>
                                        setLocalService({
                                            ...localService,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Brief description for cards..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="demo_video_url">Demo Video URL</Label>
                                    <Input
                                        id="demo_video_url"
                                        value={localService.demo_video_url || ""}
                                        onChange={(e) =>
                                            setLocalService({
                                                ...localService,
                                                demo_video_url: e.target.value,
                                            })
                                        }
                                        placeholder="https://youtube.com/watch?v=..."
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        value={localService.status}
                                        onChange={(e) =>
                                            setLocalService({
                                                ...localService,
                                                status: e.target.value as "active" | "inactive",
                                            })
                                        }
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </TabsContent>

                        {/* DETAILS TAB */}
                        <TabsContent value="details" className="space-y-4">
                            {/* ... existing details tab content ... */}
                            <div>
                                <Label htmlFor="long_description">Long Description</Label>
                                <Textarea
                                    id="long_description"
                                    value={localService.long_description || ""}
                                    onChange={(e) =>
                                        setLocalService({
                                            ...localService,
                                            long_description: e.target.value,
                                        })
                                    }
                                    placeholder="Detailed service description with HTML support..."
                                    rows={6}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    You can use HTML tags for formatting
                                </p>
                            </div>

                            {/* Features */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Label>Features</Label>
                                    <Button type="button" onClick={() => addListItem("features")} size="sm">
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Feature
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {localService.features?.map((feature, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={feature}
                                                onChange={(e) => updateListItem("features", index, e.target.value)}
                                                placeholder={`Feature ${index + 1}`}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeListItem("features", index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Benefits */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Label>Benefits</Label>
                                    <Button type="button" onClick={() => addListItem("benefits")} size="sm">
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Benefit
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {localService.benefits?.map((benefit, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={benefit}
                                                onChange={(e) => updateListItem("benefits", index, e.target.value)}
                                                placeholder={`Benefit ${index + 1}`}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeListItem("benefits", index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Technologies */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Label>Technologies</Label>
                                    <Button type="button" onClick={() => addListItem("technologies")} size="sm">
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Technology
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {localService.technologies?.map((tech, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={tech}
                                                onChange={(e) => updateListItem("technologies", index, e.target.value)}
                                                placeholder={`Technology ${index + 1}`}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeListItem("technologies", index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        {/* ADVANCED TAB */}
                        <TabsContent value="advanced" className="space-y-4">
                            {/* ... existing advanced tab content ... */}
                            <div>
                                <Label htmlFor="image">Service Image</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="h-10"
                                />
                                {isFile(localService.image) && (
                                    <p className="text-xs text-green-600 mt-1">
                                        Selected: {(localService.image as File).name}
                                    </p>
                                )}
                                {typeof localService.image === "string" && localService.image && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-600">Current image:</p>
                                        <img
                                            src={
                                                typeof service.image === "string" && service.image
                                                    ? service.image.startsWith("http")
                                                        ? service.image
                                                        : `${API_URL}${service.image}`
                                                    : "/brand/abstract-grid.svg"
                                            }
                                            alt="Service preview"
                                            className="w-60 h-32 object-cover rounded-lg mt-1"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Developers */}
                            <div>
                                <Label>Developers (Team Members)</Label>
                                <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                                    {teamMembers.map((member) => (
                                        <div key={member.id} className="flex items-center gap-2 py-1">
                                            <input
                                                type="checkbox"
                                                id={`dev-${member.id}`}
                                                checked={localService.developers?.includes(Number(member.id))}
                                                onChange={(e) => {
                                                    const currentDevs = [...(localService.developers || [])];
                                                    if (e.target.checked) {
                                                        currentDevs.push(Number(member.id));
                                                    } else {
                                                        const index = currentDevs.indexOf(Number(member.id));
                                                        if (index > -1) currentDevs.splice(index, 1);
                                                    }
                                                    setLocalService({
                                                        ...localService,
                                                        developers: currentDevs,
                                                    });
                                                }}
                                                className="rounded border-gray-300"
                                            />
                                            <Label htmlFor={`dev-${member.id}`} className="text-sm cursor-pointer flex-1">
                                                {member.name} - {member.role}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Select team members involved in this service
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="sort_order">Sort Order</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={localService.sort_order || 0}
                                        onChange={(e) =>
                                            setLocalService({
                                                ...localService,
                                                sort_order: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Lower numbers appear first
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        {/* USE CASES TAB */}
                        <TabsContent value="useCases" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Use Cases</Label>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setLocalService(prev => ({
                                            ...prev,
                                            use_cases: [
                                                ...(prev.use_cases || []),
                                                { title: '', description: '', image: '' }
                                            ]
                                        }));
                                    }}
                                    size="sm"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Add Use Case
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {(localService.use_cases || []).map((uc, index) => (
                                    <Card key={index} className="p-4 border border-gray-200">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-medium">Use Case #{index + 1}</h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const updated = [...(localService.use_cases || [])];
                                                    updated.splice(index, 1);
                                                    setLocalService(prev => ({ ...prev, use_cases: updated }));
                                                }}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-xs">Title</Label>
                                                <Input
                                                    value={uc.title}
                                                    onChange={(e) => {
                                                        const updated = [...(localService.use_cases || [])];
                                                        updated[index] = { ...updated[index], title: e.target.value };
                                                        setLocalService(prev => ({ ...prev, use_cases: updated }));
                                                    }}
                                                    placeholder="e.g., Urban Planning"
                                                />
                                            </div>

                                            <div>
                                                <Label className="text-xs">Description</Label>
                                                <Textarea
                                                    value={uc.description}
                                                    onChange={(e) => {
                                                        const updated = [...(localService.use_cases || [])];
                                                        updated[index] = { ...updated[index], description: e.target.value };
                                                        setLocalService(prev => ({ ...prev, use_cases: updated }));
                                                    }}
                                                    placeholder="Describe how this applies..."
                                                    rows={3}
                                                />
                                            </div>

                                            <div>
                                                <Label className="text-xs">Image URL</Label>
                                                <Input
                                                    value={uc.image || ''}
                                                    onChange={(e) => {
                                                        const updated = [...(localService.use_cases || [])];
                                                        updated[index] = { ...updated[index], image: e.target.value };
                                                        setLocalService(prev => ({ ...prev, use_cases: updated }));
                                                    }}
                                                    placeholder="https://example.com/image.jpg"
                                                />
                                                {uc.image && (
                                                    <div className="mt-2">
                                                        <img
                                                            src={uc.image}
                                                            alt="Preview"
                                                            className="w-32 h-20 object-cover rounded"
                                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {(!localService.use_cases || localService.use_cases.length === 0) && (
                                <p className="text-sm text-gray-500 text-center py-8 border border-dashed rounded-lg">
                                    No use cases added yet. Click "Add Use Case" to start.
                                </p>
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* STICKY FOOTER - only one, placed correctly after Tabs */}
                    <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3 mt-6">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!localService.id || !localService.title || !localService.description}
                            className="bg-primary"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isEdit ? `Update ${entityName}` : `Add ${entityName}`}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};