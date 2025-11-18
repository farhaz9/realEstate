"use client";

import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/layout/footer";
import MobileNav from "./mobile-nav";
import Header from "./header";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-theme(spacing.16))]">
        {children}
      </main>
      <MobileNav />
      <Footer />
      <Toaster />
    </>
  );
}
