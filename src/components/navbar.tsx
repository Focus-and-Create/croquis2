"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Pencil } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-foreground">
          <Pencil className="h-5 w-5 text-primary" />
          Croquis
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
