"use client";

import Image from "next/image";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function AdminHeader() {
  const { user, logout } = useAuth();
  const name =
    (user as { username?: string; firstname?: string; email?: string })?.firstname ||
    (user as { username?: string })?.username ||
    (user as { email?: string })?.email ||
    "Admin";

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:px-6">
        <Link href="/admin1/dashboard" className="flex items-center gap-2">
          <Image src="/brand/nilaya-icon.svg" alt="Nilaya AI" width={28} height={28} />
          <span className="font-semibold text-slate-900">Nilaya Admin</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-600 sm:inline">{name}</span>
          <Button variant="outline" size="sm" onClick={() => logout()}>
            <LogOut className="mr-1 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
