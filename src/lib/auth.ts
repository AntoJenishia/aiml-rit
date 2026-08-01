import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore"
import { db } from "./firebase"
import { adminDb } from "./firebaseAdmin"
import { parseStudentEmail } from "./parseStudentEmail"

export type UserRole = "student" | "staff" | "hod" | "guest"

const INTERNAL_DOMAIN = "@internal.aiml.rit"

/**
 * Accepted email formats:
 *   HOD     — hod.aids@ritchennai.edu.in          (exact match)
 *   Student — name.regno@aiml.ritchennai.edu.in   (e.g. john.7376222cs101@aiml.ritchennai.edu.in)
 *   Staff   — name@ritchennai.edu.in               (e.g. john@ritchennai.edu.in)
 */
export function getRole(email: string): UserRole {
  if (!email) return "guest"
  // ── DEV BYPASS ── remove before production ──────────────────
  if (email === "antojenishiadev@gmail.com") return "hod"
  // ────────────────────────────────────────────────────────────

  // Internal domain for faculty/HOD username logins
  if (email.endsWith(INTERNAL_DOMAIN)) {
    return "staff" // The actual role (staff vs hod) is fetched from Firestore during authorization
  }

  // Student — format: <name>.<regno>@aiml.ritchennai.edu.in
  const studentPattern = /^[a-zA-Z]+\.[a-zA-Z0-9]+@aiml\.ritchennai\.edu\.in$/
  if (studentPattern.test(email)) return "student"

  return "guest"
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // In production, restrict to RIT Workspace domain.
          ...(process.env.NODE_ENV === "production" ? { hd: "aiml.ritchennai.edu.in" } : {}),
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

        const internalEmail = `${credentials.username}${INTERNAL_DOMAIN}`

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
          console.log(`[NextAuth] REST Auth successful for UID: ${uid}. Fetching Firestore profile...`)

          // 2. Fetch user profile from Firestore to get their actual role and name
          let userDoc;
          try {
            userDoc = await adminDb.collection("users").doc(uid).get()
          } catch (dbError) {
            console.error(`[NextAuth] Firestore Admin SDK error fetching user ${uid}:`, dbError)
            return null
          }

          if (!userDoc.exists) {
            console.error(`[NextAuth] User ${uid} authenticated, but no Firestore document exists.`)
            return null
          }
          
          const userData = userDoc.data()!
          console.log(`[NextAuth] Successfully retrieved user ${uid} from Firestore. Role: ${userData.role}`)
          
          // Return NextAuth user object
          return {
            id: uid,
            email: internalEmail,
            name: userData.name || credentials.username,
            role: userData.role, // "staff" or "hod"
            username: credentials.username
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

      const email = user.email ?? ""
      const role = getRole(email)
      
      // Block non-RIT emails for Google sign-in
      if (role === "guest") return false

      try {
        const userRef = doc(db, "users", user.id!)
        const snap = await getDoc(userRef)
        
        // Check if there is a pre-imported student record under their email
        const emailRef = doc(db, "users", email)
        const emailSnap = await getDoc(emailRef)

        if (emailSnap.exists()) {
          const importedData = emailSnap.data()
          const mergedData = {
            ...importedData,
            uid: user.id!,
            photoURL: user.image ?? importedData.photoURL ?? "",
            name: user.name ?? importedData.name ?? "",
            lastLogin: new Date(),
            profileComplete: true, // Mark complete because all details were pre-entered by HOD
          }
          await setDoc(userRef, mergedData)
          await deleteDoc(emailRef)
          console.log(`[NextAuth] Successfully merged imported student document for ${email}`)
        } else if (!snap.exists()) {
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

    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.uid = user.id
        
        if (account?.provider === "credentials") {
          // @ts-expect-error - Custom property from our authorize callback
          token.role = user.role
          // @ts-expect-error - Custom property from our authorize callback
          token.username = user.username
          // Redact the internal email completely
          delete token.email
        } else if (user.email) {
          token.role = getRole(user.email)
        }
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole
        session.user.uid = token.uid as string
        
        // Ensure email is stripped for faculty/HOD
        if (token.username && !token.email) {
          delete session.user.email
          // @ts-expect-error - Add username to the session
          session.user.username = token.username as string
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
