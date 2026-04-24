import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import NeuralNetCanvas from "@/components/NeuralNetCanvas";
import PageWrapper from "@/components/PageWrapper";

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
    "Department of Artificial Intelligence & Machine Learning — RIT College of Engineering, Chennai.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} font-sans overflow-x-hidden bg-slate-50 text-slate-800 antialiased`}
      >
        {/* Global subtle neural-network background on all pages */}
        <NeuralNetCanvas />

        <Navbar />
        <main className="relative z-10 min-h-screen">
          <PageWrapper>{children}</PageWrapper>
        </main>
        <Footer />
      </body>
    </html>
  );
}
