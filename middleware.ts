import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export const middleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Admin — HOD only
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "hod") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Student dashboard — students only
    if (pathname.startsWith("/dashboard/student")) {
      if (token?.role !== "student") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Staff dashboard — staff or HOD
    if (pathname.startsWith("/dashboard/staff")) {
      if (!["staff", "hod"].includes(token?.role as string)) {
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
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile/:path*", "/onboarding/:path*"],
}
