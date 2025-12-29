
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
import Preloader from "@/components/shared/preloader";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: 'swap',
});

const siteUrl = "https://estates.falconaxe.com";
const siteTitle = "Falcon Estates | Buy, Sell, Rent Properties in India | Real Estate & Interior Design";
const siteDescription = "Your premier destination for real estate in India. Falcon Estates helps you buy, sell, and rent properties, with a special focus on Delhi. Explore verified listings for apartments, plots, and homes with expert interior design services.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Falcon Estates – Buy, Sell & Rent Premium Properties",
    template: "%s | Falcon Estates",
  },
  description: "Find verified properties across India with Falcon Estates.",
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: "Falcon Estates",
    type: "website",
    images: [
      {
        url: `/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Luxury real estate and interior design in India by Falcon Estates',
      },
    ],
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [`${siteUrl}/og-image.jpg`],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#1E2029' },
  ],
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
    '@type': 'Country',
    name: 'India',
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
        <meta name="google-site-verification" content="egpm6NuUvbaWrSf-M6KuZ0kkE63bHrgLWdeHOfuo6jw" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Falcon Estates" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased overflow-x-hidden",
          poppins.variable
        )}
        suppressHydrationWarning
      >
        <Preloader />
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
