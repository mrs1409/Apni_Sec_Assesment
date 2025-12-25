import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4ade80",
};

export const metadata: Metadata = {
  title: {
    default: "ApniSec - Cybersecurity Solutions | Cloud Security, VAPT & Reteam Assessment",
    template: "%s | ApniSec",
  },
  description: "ApniSec provides enterprise-grade cybersecurity solutions including Cloud Security, VAPT (Vulnerability Assessment and Penetration Testing), and Reteam Assessment services. Protect your digital assets with our expert security team.",
  keywords: [
    "cybersecurity",
    "cloud security",
    "VAPT",
    "vulnerability assessment",
    "penetration testing",
    "reteam assessment",
    "security consulting",
    "application security",
    "network security",
    "ApniSec",
  ],
  authors: [{ name: "ApniSec Team" }],
  creator: "ApniSec",
  publisher: "ApniSec",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://apnisec.com",
    siteName: "ApniSec",
    title: "ApniSec - Cybersecurity Solutions",
    description: "Enterprise-grade cybersecurity solutions including Cloud Security, VAPT, and Reteam Assessment services.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ApniSec - Cybersecurity Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ApniSec - Cybersecurity Solutions",
    description: "Enterprise-grade cybersecurity solutions including Cloud Security, VAPT, and Reteam Assessment services.",
    images: ["/og-image.png"],
    creator: "@apnisec",
  },
  alternates: {
    canonical: "https://apnisec.com",
  },
  category: "Technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
