import type { Metadata } from "next";
import { Poppins, Belleza } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import Footer from "@/components/layout/footer";
import ProgressBar from "@/components/layout/progress-bar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const belleza = Belleza({
  subsets: ['latin'],
  weight: ['400'],
});

export const metadata: Metadata = {
  title: "Farhaz Homes",
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
      >
        <Header />
        <main className="min-h-[calc(100vh-theme(spacing.16))] pt-16 pb-16 md:pb-0">
          {children}
        </main>
        <ProgressBar />
        <MobileNav />
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
