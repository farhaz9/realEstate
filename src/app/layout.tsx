
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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://delhi-estate-luxe.com";
const siteTitle = "Falcon Estates | Best Real Estate & Interior Design in Delhi Rohini";
const siteDescription = "Discover luxury properties, plots, and bespoke interior design services in Delhi & Rohini with Falcon Estates. Your trusted partner for buying, selling, and renting real estate.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  keywords: ["real estate delhi", "property in rohini", "interior design delhi", "luxury apartments delhi", "buy property rohini", "sell property delhi", "falcon estates"],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: 'Falcon Estates',
    images: [
      {
        url: `/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Luxury real estate and interior design in Delhi by Falcon Estates',
      },
    ],
    locale: 'en_IN',
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'Falcon Estates',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description: siteDescription,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Vijay Vihar',
    addressLocality: 'Rohini',
    addressRegion: 'Delhi',
    postalCode: '110085',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-9953414336',
    contactType: 'customer service',
  },
  areaServed: {
    '@type': 'Place',
    name: 'Delhi',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased overflow-x-hidden",
          poppins.variable
        )}
        suppressHydrationWarning
      >
        <div>
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
