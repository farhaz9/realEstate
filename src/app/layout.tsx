
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AppProviders from "@/components/layout/app-providers";
import Header from "@/components/layout/header";
import { FirebaseClientProvider } from "@/firebase";
import { ScrollProgress } from "@/components/layout/scroll-progress";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: 'swap',
});

const siteUrl = "https://www.farhazhomes.com";
const siteTitle = "Farhaz Homes | Best Real Estate and Interior Design Company in Delhi";
const siteDescription = "Discover Delhi's best real estate and interior design company. Farhaz Homes offers luxury properties, bespoke interiors, and complete construction solutions in Delhi.";


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
    siteName: 'Farhaz Homes',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Luxury real estate and interior design in Delhi by Farhaz Homes',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
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
        <FirebaseClientProvider>
          <Header />
          <AppProviders>{children}</AppProviders>
          <ScrollProgress />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
