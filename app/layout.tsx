import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AUS Connect | Discovering Talent · Delivering Opportunity",
  description:
    "AUS Connect bridges the gap between elite Australian basketball players and US college coaches. Get discovered. Get recruited.",
  keywords: [
    "Australian basketball",
    "US college basketball",
    "basketball recruitment",
    "college coaches",
    "NBL pathway",
    "basketball scholarship",
  ],
  openGraph: {
    title: "AUS Connect",
    description: "Connecting Australian basketball talent with US college coaches.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-navy text-white">{children}</body>
    </html>
  );
}
