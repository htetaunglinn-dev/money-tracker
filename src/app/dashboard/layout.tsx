"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navigation } from "@/components/layout/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-money-black">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-money-green border-t-transparent" />
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-money-green opacity-20" />
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-money-black">
      <Navigation />
      {/*
        Mobile:  pt-14 (top header) + pb-20 (bottom nav + safe area)
        Desktop: ml-60 (sidebar width), no top/bottom offset needed
      */}
      <main className="lg:ml-60 pt-14 pb-20 lg:pt-0 lg:pb-0 min-h-screen">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
