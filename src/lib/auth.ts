import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "./firebase"

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
          await setDoc(userRef, {
            email,
            name: user.name ?? "",
            role,
            photoURL: user.image ?? "",
            createdAt: new Date(),
            lastLogin: new Date(),
          })
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
  },
}
