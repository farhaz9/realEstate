"use client";

import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/layout/footer";
import MobileNav from "./mobile-nav";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="min-h-[calc(100vh-theme(spacing.16))] pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav />
      <Footer />
      <Toaster />
    </>
  );
}
