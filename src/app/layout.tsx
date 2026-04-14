import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import clsx from "clsx";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "AIML Department",
    template: "%s | AIML Department"
  },
  description: "AIML Department — static frontend"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${poppins.className} overflow-x-hidden bg-slate-50 text-slate-900 antialiased`}>
        <div
          aria-hidden="true"
          className={clsx(
            "pointer-events-none fixed inset-0 -z-10 opacity-50",
            "bg-[radial-gradient(ellipse_at_20%_50%,_#dbeafe_0%,_transparent_60%),radial-gradient(ellipse_at_80%_20%,_#ede9fe_0%,_transparent_60%),radial-gradient(ellipse_at_50%_80%,_#f0f9ff_0%,_transparent_60%)]",
            "bg-[length:400%_400%] motion-safe:animate-gradientShift"
          )}
        />
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
