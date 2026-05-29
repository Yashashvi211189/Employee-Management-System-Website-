"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPrivateProjectsNewPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin1/dashboard?tab=current-projects");
  }, [router]);
  return null;
}

