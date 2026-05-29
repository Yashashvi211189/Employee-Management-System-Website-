"use client";

import { API_URL } from "@/lib/config";
import { useState, useEffect, useCallback } from "react";
import "react-easy-crop/react-easy-crop.css";
import Cropper, { Area } from "react-easy-crop";
import { motion } from "framer-motion";
import {
    Users,
    Plus,
    Trash2,
    X,
    Save,
    Check,
    Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { TeamMember, TeamMemberForm } from "../types";

interface TeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: Partial<TeamMember> | null;
    onSave: (member: Partial<TeamMemberForm>) => void;
    isEdit?: boolean;
}

export const TeamModal = ({
    isOpen,
    onClose,
    member,
    onSave,
    isEdit = false,
}: TeamModalProps) => {
    const [localMember, setLocalMember] = useState<Partial<TeamMemberForm>>(() => ({
        name: "",
        role: "",
        department: "",
        image: "",
        bio: "",
        location: "",
        joinDate: "",
        memberID: "",
        skills: [],
        status: "Active",
        member_type: "employee",
        education: "",
        achievements: [],
        experience: "",
    }));

    const [imagePreview, setImagePreview] = useState<string>("");
    const [isInitialized, setIsInitialized] = useState(false);

    // Crop state
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState<string>("");
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    // Define the crop ratio (397:287)
    const CROP_RATIO = 397 / 287; // approximately 1.383

    // Initialize only once when modal opens
    useEffect(() => {
        if (isOpen && !isInitialized) {
            if (member) {
                setLocalMember({
                    name: member.name || "",
                    role: member.role || "",
                    department: member.department || "",
                    image: member.image || "",
                    bio: member.bio || "",
                    location: member.location || "",
                    joinDate: member.joinDate || "",
                    memberID: member.memberID || "",
                    skills: member.skills || [],
                    status: member.status || "Active",
                    member_type: member.member_type || "employee",
                    education: member.education || "",
                    achievements: member.achievements || [],
                    experience: member.experience || "",
                });

                if (!member.image) {
                    setImagePreview("");
                } else if (typeof member.image === "string") {
                    if (member.image.startsWith("http")) {
                        setImagePreview(member.image);
                    } else {
                        setImagePreview(`${API_URL}${member.image}`);
                    }
                } else {
                    setImagePreview(URL.createObjectURL(member.image));
                }
            } else {
                setLocalMember({
                    name: "",
                    role: "",
                    department: "",
                    image: "",
                    bio: "",
                    location: "",
                    joinDate: "",
                    skills: [],
                    status: "Active",
                    member_type: "employee",
                    education: "",
                    achievements: [],
                    experience: "",
                });
                setImagePreview("");
            }
            setIsInitialized(true);
        }
    }, [isOpen, member, isInitialized]);

    // Reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            setIsInitialized(false);
        }
    }, [isOpen]);

    // Handle image upload - opens crop modal
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setCropImageSrc(event.target.result as string);
                    setCropModalOpen(true);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle crop completion
    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // Create cropped image
    const createCroppedImage = useCallback(async () => {
        if (!cropImageSrc || !croppedAreaPixels) {
            console.error('Missing crop data');
            return;
        }

        try {
            setIsCropping(true);

            const image = new window.Image();
            image.crossOrigin = 'anonymous';

            const imageLoaded = new Promise((resolve, reject) => {
                image.onload = () => resolve(true);
                image.onerror = () => reject(new Error('Failed to load image'));
            });

            image.src = cropImageSrc;
            await imageLoaded;

            const canvas = document.createElement('canvas');
            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            ctx.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );

            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, 'image/jpeg', 0.95);
            });

            if (!blob) {
                throw new Error('Failed to create image blob');
            }

            const fileName = `cropped-${Date.now()}.jpg`;
            const croppedFile = new File([blob], fileName, {
                type: 'image/jpeg',
                lastModified: Date.now()
            });

            setLocalMember(prev => ({
                ...prev,
                image: croppedFile,
            }));

            const previewUrl = URL.createObjectURL(blob);
            setImagePreview(previewUrl);

            setIsCropping(false);
            setCropModalOpen(false);
            setCropImageSrc('');

        } catch (error) {
            console.error('Error cropping image:', error);
            setIsCropping(false);
            alert('Failed to crop image. Please try again.');
        }
    }, [cropImageSrc, croppedAreaPixels]);

    const handleSave = () => {
        onSave(localMember);
    };

    const addSkill = () => {
        setLocalMember((prev) => ({
            ...prev,
            skills: [...(prev.skills || []), ""],
        }));
    };

    const updateSkill = (index: number, value: string) => {
        const updatedSkills = [...(localMember.skills || [])];
        updatedSkills[index] = value;
        setLocalMember((prev) => ({
            ...prev,
            skills: updatedSkills,
        }));
    };

    const removeSkill = (index: number) => {
        setLocalMember((prev) => ({
            ...prev,
            skills: prev.skills?.filter((_, i) => i !== index) || [],
        }));
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Main Team Modal */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                    <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold">
                            {isEdit ? "Edit Team Member" : "Add Team Member"}
                        </h2>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Profile Image Section with Crop Option */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative w-32 h-32 mb-4">
                                {imagePreview ? (
                                    <Image
                                        src={imagePreview}
                                        alt="Profile preview"
                                        fill
                                        className="rounded-full object-cover border-4 border-white shadow-lg"
                                        sizes="128px"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                                        <Users className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-center">
                                <Label htmlFor="image-upload" className="cursor-pointer">
                                    <Button variant="outline" size="sm" asChild>
                                        <span>
                                            <Upload className="w-4 h-4 mr-2" />
                                            {localMember.image ? "Change Photo" : "Upload Photo"}
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
                                    Recommended: Upload any image <br />
                                    You can crop to 397:287 ratio after uploading
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Member Type *</Label>
                                <select
                                    value={localMember.member_type}
                                    onChange={(e) =>
                                        setLocalMember({
                                            ...localMember,
                                            member_type: e.target.value as any,
                                        })
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                                >
                                    <option value="employee">Employee</option>
                                    <option value="executive">Executive</option>
                                    <option value="founder">Founder</option>
                                    <option value="alumni">Alumni</option>
                                </select>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Status</Label>
                                <select
                                    value={localMember.status}
                                    onChange={(e) =>
                                        setLocalMember({
                                            ...localMember,
                                            status: e.target.value as any,
                                        })
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Alumni">Alumni</option>
                                </select>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Full Name *</Label>
                                <Input
                                    value={localMember.name}
                                    onChange={(e) =>
                                        setLocalMember({ ...localMember, name: e.target.value })
                                    }
                                    placeholder="John Doe"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Role *</Label>
                                <Input
                                    value={localMember.role}
                                    onChange={(e) =>
                                        setLocalMember({ ...localMember, role: e.target.value })
                                    }
                                    placeholder="Software Engineer"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Department</Label>
                                <Input
                                    value={localMember.department}
                                    onChange={(e) =>
                                        setLocalMember({
                                            ...localMember,
                                            department: e.target.value,
                                        })
                                    }
                                    placeholder="Engineering"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Location</Label>
                                <Input
                                    value={localMember.location}
                                    onChange={(e) =>
                                        setLocalMember({
                                            ...localMember,
                                            location: e.target.value,
                                        })
                                    }
                                    placeholder="San Francisco, CA"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Member ID</Label>
                                <Input
                                    value={localMember.memberID || ""}
                                    onChange={(e) =>
                                        setLocalMember({
                                            ...localMember,
                                            memberID: e.target.value,
                                        })
                                    }
                                    placeholder="DI10001"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Join Date</Label>
                                <Input
                                    type="date"
                                    value={localMember.joinDate || ""}
                                    onChange={(e) =>
                                        setLocalMember({
                                            ...localMember,
                                            joinDate: e.target.value,
                                        })
                                    }
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Education</Label>
                                <Input
                                    value={localMember.education}
                                    onChange={(e) =>
                                        setLocalMember({
                                            ...localMember,
                                            education: e.target.value,
                                        })
                                    }
                                    placeholder="B.S. Computer Science"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Skills Section */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-sm font-medium">Skills</Label>
                                <Button
                                    type="button"
                                    onClick={addSkill}
                                    size="sm"
                                    variant="outline"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Skill
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {localMember.skills?.map((skill, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={skill}
                                            onChange={(e) => updateSkill(index, e.target.value)}
                                            placeholder={`Skill ${index + 1}`}
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeSkill(index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <Label className="text-sm font-medium">Bio *</Label>
                            <Textarea
                                value={localMember.bio}
                                onChange={(e) =>
                                    setLocalMember({ ...localMember, bio: e.target.value })
                                }
                                placeholder="Tell us about this team member..."
                                rows={4}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!localMember.name || !localMember.role || !localMember.bio}
                            className="bg-primary"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isEdit ? "Update Member" : "Add Member"}
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Crop Modal */}
            {cropModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full"
                    >
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold">Crop Image</h2>
                            <p className="text-sm text-gray-500">Adjust crop to 397:287 ratio</p>
                            <Button variant="ghost" size="icon" onClick={() => setCropModalOpen(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="p-6">
                            <div className="relative h-[400px] w-full bg-black rounded-lg overflow-hidden">
                                {cropImageSrc && (
                                    <Cropper
                                        image={cropImageSrc}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={CROP_RATIO}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                        onCropComplete={onCropComplete}
                                        cropShape="rect"
                                        showGrid={true}
                                        restrictPosition={false}
                                        style={{
                                            containerStyle: {
                                                width: "100%",
                                                height: "100%",
                                            },
                                        }}
                                    />
                                )}
                            </div>

                            <div className="mt-6 space-y-4">
                                <div>
                                    <Label className="text-sm font-medium mb-2 block">Zoom</Label>
                                    <input
                                        type="range"
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        value={zoom}
                                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>1x</span>
                                        <span>{zoom.toFixed(1)}x</span>
                                        <span>3x</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setCropModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={createCroppedImage}
                                disabled={isCropping}
                                className="bg-primary"
                            >
                                {isCropping ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Cropping...
                                    </div>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Apply Crop
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
};
