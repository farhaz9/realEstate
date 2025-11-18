import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import Footer from "@/components/layout/footer";
import { ContactButtons } from "@/components/shared/contact-buttons";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Delhi Estate Luxe",
  description: "Find high-end luxury properties in Delhi.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          poppins.variable
        )}
        suppressHydrationWarning
      >
        <Header />
        <main className="min-h-[calc(100vh-theme(spacing.16))] pt-16 pb-16 md:pb-0">
          {children}
        </main>
        <ContactButtons />
        <MobileNav />
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
