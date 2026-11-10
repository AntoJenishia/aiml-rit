import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore"
import { db } from "./firebase"
import { adminDb } from "./firebaseAdmin"
import { supabaseAdmin, formatProfileUrl } from "./supabase"
import { parseStudentEmail } from "./parseStudentEmail"
import { logActivity } from "./auditLogger"

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
      name: "Institutional Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          console.warn("[NextAuth authorize] Missing username or password")
          return null
        }

        const trimmedUsername = credentials.username.trim()
        const trimmedPassword = credentials.password.trim()

        try {
          // ─── 1. CHECK FACULTY / STAFF TABLE ─────────────────────────────
          const { data: staffData, error: sbError } = await supabaseAdmin
            .from("staff")
            .select("*")
            .or(`staff_code.ilike.${trimmedUsername},email.ilike.${trimmedUsername}`)
            .maybeSingle()

          if (sbError) {
            console.error("[NextAuth authorize] Supabase staff query error:", sbError)
          }

          if (staffData) {
            const staffCode = (staffData.staff_code || "").trim()
            const staffCodeUpper = staffCode.toUpperCase()
            const staffCodeLower = staffCode.toLowerCase()

            const validDefaultPasswords = [
              `Rit@${staffCodeUpper}`,
              `Rit@${staffCodeLower}`,
              `rit@${staffCodeUpper}`,
              `rit@${staffCodeLower}`,
              staffCodeUpper,
              staffCodeLower,
            ]

            let passwordValid = validDefaultPasswords.some(
              (p) => p.toLowerCase() === trimmedPassword.toLowerCase()
            )

            // Fallback to Firebase Auth REST API check (for any customized passwords)
            if (!passwordValid) {
              try {
                const internalEmail = `${staffCodeLower}${INTERNAL_DOMAIN}`
                const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
                const res = await fetch(
                  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: internalEmail,
                      password: trimmedPassword,
                      returnSecureToken: true,
                    }),
                  }
                )
                if (res.ok) {
                  passwordValid = true
                }
              } catch (fbErr) {
                console.warn("[NextAuth] Firebase Auth fallback error:", fbErr)
              }
            }

            if (!passwordValid) {
              console.warn("[NextAuth authorize] Invalid password for staff:", staffCode)
              return null
            }

            const staffRole: UserRole = (staffCodeUpper === "CS91" || staffData.role === "hod") ? "hod" : "staff"
            const uid = staffData.id || `staff_${staffCodeLower}`

            console.log(`[NextAuth authorize] ✅ Login successful for ${staffData.name} (${staffCodeUpper}) as ${staffRole}`)

            // Audit log login with IP & location
            logActivity({
              userId: uid,
              userName: staffData.name,
              userEmail: staffData.email || `${staffCodeLower}${INTERNAL_DOMAIN}`,
              userRole: staffRole,
              staffCode: staffCodeUpper,
              action: "AUTH_LOGIN",
              entityType: "auth",
              details: `Faculty/Staff login: ${staffData.name} (${staffCodeUpper}) logged into ${staffRole} portal`,
              req,
            })

            return {
              id: uid,
              email: staffData.email || `${staffCodeLower}${INTERNAL_DOMAIN}`,
              name: staffData.name,
              role: staffRole,
              username: staffCodeUpper,
              staffCode: staffCodeUpper,
              image: formatProfileUrl(staffData.profile_url) || undefined,
            }
          }

          // ─── 2. CHECK STUDENTS TABLE ────────────────────────────────────
          let { data: studentData, error: stuError } = await supabaseAdmin
            .from("students")
            .select("*")
            .or(`register_no.ilike.${trimmedUsername},email.ilike.${trimmedUsername}`)
            .maybeSingle()

          // If not found and input might be short roll or partial
          if (!studentData) {
            const { data: matches } = await supabaseAdmin
              .from("students")
              .select("*")
              .or(`register_no.ilike.%${trimmedUsername}%,email.ilike.%${trimmedUsername}%`)
              .limit(1)
            studentData = matches?.[0] || null
          }

          if (stuError) {
            console.error("[NextAuth authorize] Supabase student query error:", stuError)
          }

          if (studentData) {
            const regNo = (studentData.register_no || "").trim()
            // Extract roll number from email (e.g. ajitha.250005@... -> 250005)
            const emailDigitsMatch = (studentData.email || "").match(/\.(\d+)@/)
            const rollNo = emailDigitsMatch ? emailDigitsMatch[1] : ""
            // Extract first name (e.g. "AJITHA.V" -> "AJITHA")
            const firstName = (studentData.name || "").split(/[ .\s]+/)[0].trim()
            const phone = (studentData.phone || "").trim()

            const validStudentPasswords = new Set([
              `Rit@${regNo}`,
              `rit@${regNo}`,
              `RIT@${regNo}`,
              regNo,
              // Common defaults
              "Rit@123",
              "rit@123",
              "student",
              "Rit@aiml",
              "aiml",
              "123456",
            ])

            if (rollNo) {
              validStudentPasswords.add(`Rit@${rollNo}`)
              validStudentPasswords.add(`rit@${rollNo}`)
              validStudentPasswords.add(`RIT@${rollNo}`)
              validStudentPasswords.add(rollNo)
            }

            if (firstName) {
              validStudentPasswords.add(`Rit@${firstName}`)
              validStudentPasswords.add(`rit@${firstName}`)
              validStudentPasswords.add(firstName)
            }

            if (phone) {
              validStudentPasswords.add(phone)
              validStudentPasswords.add(`Rit@${phone}`)
              validStudentPasswords.add(`rit@${phone}`)
            }

            let passwordValid = Array.from(validStudentPasswords).some(
              (p) => p.toLowerCase() === trimmedPassword.toLowerCase()
            )

            // Fallback to Firebase Auth (if student previously had a custom password)
            if (!passwordValid && studentData.email) {
              try {
                const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
                const res = await fetch(
                  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: studentData.email,
                      password: trimmedPassword,
                      returnSecureToken: true,
                    }),
                  }
                )
                if (res.ok) {
                  passwordValid = true
                }
              } catch (fbErr) {
                console.warn("[NextAuth] Firebase Auth student fallback error:", fbErr)
              }
            }

            if (!passwordValid) {
              console.warn("[NextAuth authorize] Invalid password for student:", regNo, "Entered was:", trimmedPassword)
              return null
            }

            console.log(`[NextAuth authorize] ✅ Login successful for student ${studentData.name} (${regNo})`)

            // Audit log login with IP & location
            logActivity({
              userId: studentData.id,
              userName: studentData.name,
              userEmail: studentData.email,
              userRole: "student",
              registerNumber: regNo,
              action: "AUTH_LOGIN",
              entityType: "auth",
              details: `Student login: ${studentData.name} (${regNo}) logged in`,
              req,
            })

            // Backward compatibility sync with Firestore users doc
            try {
              const userRef = doc(db, "users", studentData.id)
              await setDoc(
                userRef,
                {
                  email: studentData.email,
                  name: studentData.name,
                  role: "student",
                  registerNumber: regNo,
                  rollNumber: rollNo || regNo,
                  class: studentData.class,
                  classId: studentData.class,
                  semester: studentData.semester,
                  section: studentData.section,
                  batch: studentData.batch,
                  department: studentData.department,
                  photoURL: formatProfileUrl(studentData.profile_url) || "",
                  lastLogin: new Date(),
                  profileComplete: true,
                },
                { merge: true }
              )
            } catch (fsErr) {
              console.warn("Firestore student sync warning:", fsErr)
            }

            return {
              id: studentData.id,
              email: studentData.email,
              name: studentData.name,
              role: "student",
              username: regNo,
              registerNumber: regNo,
              image: formatProfileUrl(studentData.profile_url) || undefined,
            }
          }

          console.warn("[NextAuth authorize] No record found in staff or students for:", trimmedUsername)
          return null
        } catch (error) {
          console.error("[NextAuth authorize] Unexpected error:", error)
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
          token.registerNumber = (user as any).registerNumber
          if (user.image) {
            token.picture = user.image
          }
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

        // Ensure staffCode, registerNumber, image and username are set on session.user
        if (token.username) {
          session.user.username = token.username as string
        }
        if (token.staffCode) {
          session.user.staffCode = token.staffCode as string
        }
        if ((token as any).registerNumber) {
          (session.user as any).registerNumber = (token as any).registerNumber
        }
        if (token.picture && !session.user.image) {
          session.user.image = token.picture as string
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
