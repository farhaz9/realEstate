"use client";

import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/layout/footer";
import MobileNav from "./mobile-nav";
import { ContactButtons } from "../shared/contact-buttons";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="min-h-[calc(100vh-theme(spacing.16))]">
        {children}
      </main>
      <ContactButtons />
      <MobileNav />
      <Footer />
      <Toaster />
    </>
  );
}
