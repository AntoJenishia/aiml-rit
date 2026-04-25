import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import NeuralNetCanvas from "@/components/NeuralNetCanvas";
import BackgroundGlows from "@/components/BackgroundGlows";
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
  icons: {
    icon: "/favicon.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Space Grotesk — premium display/number font via CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans overflow-x-hidden antialiased`}>
        <BackgroundGlows />
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
