// app/team/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Award,
  Linkedin,
  Twitter,
  Github,
  Mail,
  Copy,
  Share2,
  IdCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/lib/config";
import { generateSlug, getMemberBySlug, resolveSlug } from "@/lib/team";

export default function TeamMemberPage() {
  const params = useParams();
  const router = useRouter();

  const slug =
    typeof params.slug === "string"
      ? params.slug
      : Array.isArray(params.slug)
      ? params.slug[0]
      : "";

  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    async function fetchMember() {
      try {
        const response = await fetch(`${API_URL}/api/team/`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        // 🔑 Resolve short or partial slug to canonical form
        const canonicalSlug = resolveSlug(slug, data);

        if (!canonicalSlug) {
          setMember(null);
          setLoading(false);
          return;
        }

        // 🔁 Normalize URL to canonical format if needed
        if (canonicalSlug !== slug) {
          router.replace(`/team/${canonicalSlug}`);
          return;
        }

        // ✅ Now safe to fetch member with canonical slug
        const foundMember = getMemberBySlug(canonicalSlug, data);

        if (!foundMember) {
          setMember(null);
          setLoading(false);
          return;
        }

        const safeMemberID =
          typeof foundMember.memberID === "string" && foundMember.memberID.trim()
          ? foundMember.memberID.trim()
          : typeof foundMember.memberId === "string" && foundMember.memberId.trim()
          ? foundMember.memberId.trim()
          : ""; // ✅ do not accept numeric member_id

        const processedMember = {
          ...foundMember,
          image: foundMember.image || "/brand/avatar.svg",
          bio: foundMember.bio || "AI team member at Nilaya AI",
          skills: foundMember.skills || [],
          department: foundMember.department || "General",
          location: foundMember.location || "Remote-first",
          joinDate: foundMember.joinDate || "2024",
          memberID: foundMember.memberID || foundMember.memberId || foundMember.id || foundMember.member_id || foundMember.employee_id || "",
          achievements: foundMember.achievements || [],
          experience: foundMember.experience || "",
          education: foundMember.education || "",
          social: foundMember.social || {
            linkedin: "#",
            twitter: "#",
            github: "#",
            email: "#",
          },
        };

        setMember(processedMember);
      } catch (error) {
        console.error("Error fetching team member:", error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchMember();
  }, [slug, router]);

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const shareOnSocialMedia = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`Meet ${member?.name} at Nilaya AI`);

    let shareUrl = "";
    if (platform === "twitter") {
      shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
    } else if (platform === "linkedin") {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    }

    if (shareUrl) window.open(shareUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Profile not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-10">
        {/* Back */}
        <Button
          variant="ghost"
          onClick={() => {
          router.push("/team");
          setTimeout(() => {
          window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          }, 50);
        }}
          className="fixed top-20 left-4 z-50 bg-white/80 backdrop-blur border shadow-sm"
          >
         <ArrowLeft className="w-4 h-4 mr-2" />
          Back
         </Button>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white/40 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-xl"
        >
          {/* Image */}
          <div className="relative w-full h-[420px] rounded-2xl overflow-hidden">
            <Image
              src={member.image}
              alt={member.name}
              fill
              className="object-cover object-top bg-white"
            />
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{member.name}</h1>
              <p className="text-primary text-lg font-semibold">{member.role}</p>
              {/* I want gap from memberID badge to the top */}

              {member.memberID && (
                  <div className="flex items-center gap-2 mt-3">
                  <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/40 text-yellow-600 font-semibold text-sm flex items-center gap-2 shadow-md">
                   ID: <span className="font-bold text-yellow-700">{member.memberID}</span>
                </div>
                </div>
                 )}
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge>{member.department}</Badge>
                <Badge variant="secondary">{member.status}</Badge>
                <Badge variant="outline">{member.member_type}</Badge>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {member.location}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Joined: {member.joinDate}
              
              </div>
            </div>

            <p className="text-sm leading-relaxed">{member.bio}</p>
            {/* Education */}
            {member.education && (
            <div className="mt-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Educational Qualification
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
            {member.education}
            </p>
          </div>
        )}
            {/* Skills */}
            {member.skills?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {member.skills.slice(0, 12).map((skill: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {member.achievements?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" /> Achievements
                </h3>
                <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                  {member.achievements.slice(0, 5).map((a: string, idx: number) => (
                    <li key={idx}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Social + Share */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Button
                variant="outline"
                onClick={() => window.open(member.social.linkedin, "_blank")}
              >
                <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open(member.social.twitter, "_blank")}
              >
                <Twitter className="w-4 h-4 mr-2" /> Twitter
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open(member.social.github, "_blank")}
              >
                <Github className="w-4 h-4 mr-2" /> GitHub
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open(`mailto:${member.social.email}`)}
              >
                <Mail className="w-4 h-4 mr-2" /> Email
              </Button>

              <Button variant="secondary" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                {copySuccess ? "Copied!" : "Copy Link"}
              </Button>

              <Button variant="secondary" onClick={() => shareOnSocialMedia("linkedin")}>
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}