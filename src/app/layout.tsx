import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AIML Department | RIT College of Engineering",
    template: "%s | AIML Department",
  },
  description:
    "Department of Artificial Intelligence & Machine Learning — RIT College of Engineering, Chennai. Explore academics, faculty, events, and achievements.",
  keywords: ["AIML", "AI", "Machine Learning", "Deep Learning", "RIT", "Engineering", "Chennai"],
  openGraph: {
    title: "AIML Department | RIT College of Engineering",
    description: "Department of Artificial Intelligence & Machine Learning",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans overflow-x-hidden bg-[#f8fafc] text-[#1e293b] antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
