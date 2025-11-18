"use client";

import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import Footer from "@/components/layout/footer";
import ProgressBar from "@/components/layout/progress-bar";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-theme(spacing.16))] pt-16 pb-16 md:pb-0">
        {children}
      </main>
      <ProgressBar />
      <MobileNav />
      <Footer />
      <Toaster />
    </>
  );
}
