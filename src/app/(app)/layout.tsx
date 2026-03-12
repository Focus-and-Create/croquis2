"use client";

import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      {(userEmail) => (
        <div className="min-h-screen bg-background">
          <Navbar userEmail={userEmail} />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
      )}
    </AuthGuard>
  );
}
