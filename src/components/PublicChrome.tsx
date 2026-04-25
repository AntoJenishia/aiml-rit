"use client"
import { usePathname } from "next/navigation"
import Navbar from "./Navbar"
import Footer from "./Footer"
import NeuralNetCanvas from "./NeuralNetCanvas"
import BackgroundGlows from "./BackgroundGlows"
import PageWrapper from "./PageWrapper"

// Routes that should NOT show the public Navbar / Footer / animated background
const AUTH_PATHS = ["/login", "/dashboard", "/admin", "/profile"]

export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublic = !AUTH_PATHS.some((p) => pathname?.startsWith(p))

  if (isPublic) {
    return (
      <>
        <BackgroundGlows />
        <NeuralNetCanvas />
        <Navbar />
        <main className="relative z-10 min-h-screen">
          <PageWrapper>{children}</PageWrapper>
        </main>
        <Footer />
      </>
    )
  }

  // Auth / protected pages render their own full-page layouts
  return <>{children}</>
}
