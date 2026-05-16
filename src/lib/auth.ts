import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "./firebase"
import { parseStudentEmail } from "./parseStudentEmail"

export type UserRole = "student" | "staff" | "hod" | "guest"

/**
 * Accepted email formats:
 *   HOD     — hod.aids@ritchennai.edu.in          (exact match)
 *   Student — name.regno@aiml.ritchennai.edu.in   (e.g. john.7376222cs101@aiml.ritchennai.edu.in)
 *   Staff   — name@ritchennai.edu.in               (e.g. john@ritchennai.edu.in)
 */
export function getRole(email: string): UserRole {
  if (!email) return "guest"
  // ── DEV BYPASS ── remove before production ──────────────────
  if (email === "antojenishia@gmail.com") return "staff"
  // ────────────────────────────────────────────────────────────
  // ── DEV BYPASS ── remove before production ──────────────────
  if (email === "antojenishiadev@gmail.com") return "hod"
  // ────────────────────────────────────────────────────────────
  // ── DEV BYPASS ── remove before production ──────────────────
  if (email === "antojenishiadev@gmail.com") return "staff"
  // ────────────────────────────────────────────────────────────
  // HOD — single exact email
  if (email === "hod.aids@ritchennai.edu.in") return "hod"

  // Student — format: <name>.<regno>@aiml.ritchennai.edu.in
  // Local part must be two dot-separated segments (letters/digits, no other dots)
  const studentPattern = /^[a-zA-Z]+\.[a-zA-Z0-9]+@aiml\.ritchennai\.edu\.in$/
  if (studentPattern.test(email)) return "student"

  // Staff — format: <name>@ritchennai.edu.in
  // Local part is a single word (letters only, no dots), NOT on the aiml subdomain
  const staffPattern = /^[a-zA-Z]+@ritchennai\.edu\.in$/
  if (staffPattern.test(email)) return "staff"

  return "guest"
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // ritchennai.edu.in is the parent Google Workspace domain.
          // All dept subdomains (aiml, aids, ece, vlsi, cce, cse, mech)
          // are part of this same Workspace org, so hd covers them all.
          // If a user selects a non-RIT account, Google blocks the sign-in.
          // Server-side getRole() provides a second enforcement layer.
          hd: "ritchennai.edu.in",
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email ?? ""
      const role = getRole(email)
      // Block non-RIT emails entirely
      if (role === "guest") return false

      try {
        const userRef = doc(db, "users", user.id!)
        const snap = await getDoc(userRef)
        if (!snap.exists()) {
          // Base user document
          const userData: Record<string, unknown> = {
            email,
            name: user.name ?? "",
            role,
            photoURL: user.image ?? "",
            createdAt: new Date(),
            lastLogin: new Date(),
          }

          // If student, parse email and add profile fields
          if (role === "student") {
            const parsed = parseStudentEmail(email)
            if (parsed) {
              userData.department = parsed.department
              userData.deptCode = parsed.deptCode
              userData.batch = parsed.batch
              userData.currentYear = parsed.currentYear
              userData.rollNumber = parsed.rollNumber
              // Keep Google account name (user.name) — don't overwrite with parsed email
            }
            userData.profileComplete = false // Require onboarding
          } else {
            userData.profileComplete = true // Staff/HOD skip onboarding
          }

          await setDoc(userRef, userData)
        } else {
          await setDoc(userRef, { lastLogin: new Date() }, { merge: true })
        }
      } catch (err) {
        console.error("Firestore signIn error:", err)
      }
      return true
    },

    async jwt({ token, user }) {
      if (user?.email) {
        token.role = getRole(user.email)
        token.uid = user.id
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole
        session.user.uid = token.uid as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Ensure cookies work correctly in both dev (http) and prod (https)
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
}
