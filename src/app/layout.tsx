
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AppProviders from "@/components/layout/app-providers";
import Header from "@/components/layout/header";
import { FirebaseClientProvider } from "@/firebase";
import ErrorBoundary from "@/components/ErrorBoundary";
import Script from "next/script";
import { AuthGate } from "@/components/layout/auth-gate";
import NotificationListener from "@/components/shared/notification-listener";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.farhazhomes.com";
const siteTitle = "Falcon Axe Homes | Best Real Estate and Interior Design Company in Delhi";
const siteDescription = "Discover Delhi's best real estate and interior design company. Falcon Axe Homes offers luxury properties, bespoke interiors, and complete construction solutions in Delhi.";


export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: 'Falcon Axe Homes',
    images: [
      {
        url: `/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Luxury real estate and interior design in Delhi by Falcon Axe Homes',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [`/og-image.jpg`],
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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          poppins.variable
        )}
        suppressHydrationWarning
      >
        <div className="overflow-x-hidden">
          <Script
              id="razorpay-checkout-js"
              src="https://checkout.razorpay.com/v1/checkout.js"
          />
          <FirebaseClientProvider>
            <AuthGate>
              <Header />
              <NotificationListener />
              <ErrorBoundary>
                <AppProviders>{children}</AppProviders>
              </ErrorBoundary>
            </AuthGate>
          </FirebaseClientProvider>
        </div>
      </body>
    </html>
  );
}
