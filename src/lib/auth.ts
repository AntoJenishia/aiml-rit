import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "./firebase"

export type UserRole = "student" | "staff" | "hod" | "guest"

export function getRole(email: string): UserRole {
  if (!email) return "guest"

  // ── DEV BYPASS ── remove before production ──────────────────
  if (email === "antojenishiadev@gmail.com") return "hod"
  // ────────────────────────────────────────────────────────────

  if (email === "hod.aids@ritchennai.edu.in") return "hod"
  // Students use @aiml.ritchennai.edu.in (e.g. name.reg@aiml.ritchennai.edu.in)
  if (email.endsWith("@aiml.ritchennai.edu.in")) return "student"
  // Staff / faculty use @ritchennai.edu.in
  if (email.endsWith("@ritchennai.edu.in")) return "staff"
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
