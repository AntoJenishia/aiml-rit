import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import PublicChrome from "@/components/PublicChrome";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

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
        <SessionProvider>
          {/*
            PublicChrome reads the current pathname and conditionally renders
            Navbar / Footer / animated backgrounds only on public routes.
            Auth routes (/login) and protected routes (/dashboard, /admin, /profile)
            get their own self-contained layouts — no double chrome.
          */}
          <PublicChrome>{children}</PublicChrome>
        </SessionProvider>
      </body>
    </html>
  );
}
