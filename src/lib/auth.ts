import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore"
import { db } from "./firebase"
import { adminDb } from "./firebaseAdmin"
import { supabaseAdmin } from "./supabase"
import { parseStudentEmail } from "./parseStudentEmail"

export type UserRole = "student" | "staff" | "hod" | "guest"

const INTERNAL_DOMAIN = "@internal.aiml.rit"

/**
 * Accepted email formats:
 *   HOD     — hod.aids@ritchennai.edu.in / selvakumaran.s@ritchennai.edu.in
 *   Student — *.@aiml.ritchennai.edu.in
 *   Staff   — *@ritchennai.edu.in
 */
export function getRole(email: string): UserRole {
  if (!email) return "guest"
  // ── DEV BYPASS ── remove before production ──────────────────
  if (email === "antojenishiadev@gmail.com") return "hod"
  // ────────────────────────────────────────────────────────────

  // Internal domain for faculty/HOD username logins
  if (email.endsWith(INTERNAL_DOMAIN)) {
    return "staff"
  }

  // HOD specific email
  if (email.toLowerCase().includes("selvakumaran") || email.toLowerCase().startsWith("hod.")) {
    return "hod"
  }

  // Student — domain aiml.ritchennai.edu.in
  if (email.toLowerCase().endsWith("@aiml.ritchennai.edu.in")) {
    return "student"
  }

  // Staff — college faculty domain
  if (email.toLowerCase().endsWith("@ritchennai.edu.in")) {
    return "staff"
  }

  return "guest"
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    CredentialsProvider({
      name: "Faculty Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        let normalizedUsername = credentials.username.trim().toLowerCase()

        // If faculty typed their email address, look up their staff_code
        if (normalizedUsername.includes("@")) {
          const { data: staffByEmail } = await supabaseAdmin
            .from("staff")
            .select("staff_code")
            .ilike("email", normalizedUsername)
            .maybeSingle()
          if (staffByEmail?.staff_code) {
            normalizedUsername = staffByEmail.staff_code.trim().toLowerCase()
          }
        }

        const internalEmail = `${normalizedUsername}${INTERNAL_DOMAIN}`

        try {
          // 1. Verify password via Firebase Auth REST API
          const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
          const res = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: internalEmail,
                password: credentials.password,
                returnSecureToken: true,
              }),
            }
          )

          const authData = await res.json()
          if (!res.ok) {
            console.error("[NextAuth] Firebase REST Auth error:", authData.error?.message || authData)
            return null
          }

          const uid = authData.localId
          console.log(`[NextAuth] REST Auth successful for UID: ${uid}. Fetching staff profile...`)

          // 2. Fetch user profile from Supabase staff table
          let staffName = credentials.username
          let staffRole: UserRole = "staff"

          const { data: staffData } = await supabaseAdmin
            .from("staff")
            .select("*")
            .or(`staff_code.ilike.${credentials.username},email.ilike.${credentials.username}`)
            .maybeSingle()

          if (staffData) {
            staffName = staffData.name
            staffRole = (staffData.staff_code?.toUpperCase() === "CS91" || staffData.role === "hod") ? "hod" : "staff"
          } else {
            // Fallback to Firestore
            try {
              const userDoc = await adminDb.collection("users").doc(uid).get()
              if (userDoc.exists) {
                const userData = userDoc.data()!
                staffName = userData.name || staffName
                staffRole = userData.role || staffRole
              }
            } catch (dbError) {
              console.error("[NextAuth] Firestore lookup error:", dbError)
            }
          }

          // Return NextAuth user object
          return {
            id: uid,
            email: staffData?.email || internalEmail,
            name: staffName,
            role: staffRole, // "staff" or "hod"
            username: credentials.username,
            staffCode: staffData?.staff_code || credentials.username
          }
        } catch (error) {
          console.error("Authorize error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Credentials provider handles its own validation in `authorize`
      if (account?.provider === "credentials") return true

      const email = (user.email ?? "").toLowerCase().trim()
      let role = getRole(email)

      // Check Supabase staff
      const { data: staffData } = await supabaseAdmin
        .from("staff")
        .select("role, staff_code")
        .ilike("email", email)
        .maybeSingle()

      if (staffData) {
        role = (staffData.staff_code?.toUpperCase() === "CS91" || staffData.role === "hod") ? "hod" : "staff"
      } else {
        // Check Supabase students
        const { data: studentData } = await supabaseAdmin
          .from("students")
          .select("id")
          .ilike("email", email)
          .maybeSingle()

        if (studentData) {
          role = "student"
        }
      }

      // Block non-authorized emails
      if (role === "guest") return false

      try {
        const userRef = doc(db, "users", user.id!)
        const snap = await getDoc(userRef)

        if (!snap.exists()) {
          const userData: Record<string, unknown> = {
            email,
            name: user.name ?? "",
            role,
            photoURL: user.image ?? "",
            createdAt: new Date(),
            lastLogin: new Date(),
            profileComplete: true,
          }
          await setDoc(userRef, userData)
        } else {
          await setDoc(userRef, { lastLogin: new Date(), role }, { merge: true })
        }
      } catch (err) {
        console.warn("Firestore signIn sync warning:", err)
      }
      return true
    },

    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.uid = user.id
        token.name = user.name
        
        if (account?.provider === "credentials") {
          token.role = user.role
          token.username = user.username
          token.staffCode = user.staffCode || user.username
          if (user.email && !user.email.includes("@internal.aiml.rit")) {
            token.email = user.email
          }
        } else if (user.email) {
          const email = user.email.toLowerCase().trim()
          let resolvedRole = getRole(email)

          if (email === "antojenishiadev@gmail.com") {
            resolvedRole = "hod"
          } else {
            // Check Supabase staff
            const { data: staffData } = await supabaseAdmin
              .from("staff")
              .select("role, staff_code")
              .ilike("email", email)
              .maybeSingle()

            if (staffData) {
              resolvedRole = (staffData.staff_code?.toUpperCase() === "CS91" || staffData.role === "hod") ? "hod" : "staff"
            } else {
              // Check Supabase students
              const { data: studentData } = await supabaseAdmin
                .from("students")
                .select("id")
                .ilike("email", email)
                .maybeSingle()

              if (studentData) {
                resolvedRole = "student"
              }
            }
          }
          token.role = resolvedRole
        }
      }

      // Sanitize HOD name if it contains legacy "Test"
      if (token.role === "hod") {
        if (!token.name || (typeof token.name === "string" && token.name.toLowerCase().includes("test"))) {
          token.name = "SELVAKUMARAN S."
          token.picture = "https://ims.ritchennai.edu.in/uploads/1739339224.jpg"
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole
        session.user.uid = token.uid as string
        
        if (token.name) {
          session.user.name = token.name as string
        }

        if (session.user.role === "hod") {
          if (!session.user.name || session.user.name.toLowerCase().includes("test")) {
            session.user.name = "SELVAKUMARAN S."
          }
          if (!session.user.image || session.user.image.includes("default")) {
            session.user.image = "https://ims.ritchennai.edu.in/uploads/1739339224.jpg"
          }
        }

        // Ensure staffCode and username are set on session.user
        if (token.username) {
          session.user.username = token.username as string
        }
        if (token.staffCode) {
          session.user.staffCode = token.staffCode as string
        }
        if (token.email && !String(token.email).includes("@internal.aiml.rit")) {
          session.user.email = token.email as string
        }
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
