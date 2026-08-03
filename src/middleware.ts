import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export const middleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Auto-redirect from base dashboard to role-specific dashboard
    if (pathname === "/dashboard") {
      if (token?.role === "student") return NextResponse.redirect(new URL("/dashboard/student", req.url))
      if (token?.role === "staff") return NextResponse.redirect(new URL("/dashboard/faculty", req.url))
      if (token?.role === "hod") return NextResponse.redirect(new URL("/dashboard/hod", req.url))
    }

    // HOD dashboard
    if (pathname.startsWith("/dashboard/hod")) {
      if (token?.role !== "hod") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Faculty dashboard — staff or HOD
    if (pathname.startsWith("/dashboard/faculty")) {
      if (!["staff", "hod"].includes(token?.role as string)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Student dashboard — students only
    if (pathname.startsWith("/dashboard/student")) {
      if (token?.role !== "student") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
}
