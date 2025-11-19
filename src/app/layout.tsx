
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AppProviders from "@/components/layout/app-providers";
import Header from "@/components/layout/header";
import ProgressBar from "@/components/layout/progress-bar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const siteUrl = "https://www.farhazhomes.com";

export const metadata: Metadata = {
  title: "Farhaz Homes - Best Real Estate Company in Delhi",
  description: "Find high-end luxury properties in Delhi. Farhaz Homes offers exclusive apartments, villas, and penthouses in prime locations.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Farhaz Homes - Best Real Estate Company in Delhi",
    description: "Find high-end luxury properties in Delhi. Farhaz Homes offers exclusive apartments, villas, and penthouses in prime locations.",
    url: siteUrl,
    siteName: 'Farhaz Homes',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Luxury home in Delhi by Farhaz Homes',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Farhaz Homes - Best Real Estate Company in Delhi",
    description: "Find high-end luxury properties in Delhi. Farhaz Homes offers exclusive apartments, villas, and penthouses in prime locations.",
    images: [`${siteUrl}/og-image.jpg`],
  },
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
        <AppProviders>{children}</AppProviders>
        <ProgressBar />
      </body>
    </html>
  );
}
