import { adminDb } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"

export interface AuditLogEntry {
  id?: string
  userId: string
  userName: string
  userEmail?: string
  userRole: "student" | "staff" | "hod" | "admin" | "system"
  registerNumber?: string | null
  staffCode?: string | null
  action: string
  entityType: "auth" | "attendance" | "leave" | "od" | "achievement" | "student" | "staff" | "system"
  entityId?: string | null
  details: string
  metadata?: Record<string, any>
  ip: string
  location: string
  userAgent: string
  timestamp?: any
  createdAt: string
}

export interface LogActivityOptions {
  userId?: string
  userName?: string
  userEmail?: string
  userRole?: "student" | "staff" | "hod" | "admin" | "system"
  registerNumber?: string | null
  staffCode?: string | null
  action: string
  entityType?: "auth" | "attendance" | "leave" | "od" | "achievement" | "student" | "staff" | "system"
  entityId?: string | null
  details: string
  metadata?: Record<string, any>
  req?: Request | any
  ip?: string
  location?: string
  userAgent?: string
}

const locationCache = new Map<string, string>()

/**
 * Extracts client IP from request headers or socket.
 */
export function getClientIp(req?: Request | any): string {
  if (!req) return "127.0.0.1"
  try {
    const headers = req.headers
    const getH = (name: string) => {
      if (typeof headers?.get === "function") return headers.get(name)
      if (headers && typeof headers === "object") return headers[name]
      return null
    }

    const forwarded = getH("x-forwarded-for")
    if (forwarded) {
      const first = forwarded.split(",")[0].trim()
      if (first) return first
    }

    const realIp =
      getH("x-real-ip") ||
      getH("cf-connecting-ip") ||
      getH("fastly-client-ip") ||
      getH("true-client-ip")
    if (realIp) return realIp.trim()

    if (req.ip) return req.ip
    if (req.socket?.remoteAddress) return req.socket.remoteAddress
  } catch {
    // fallback
  }
  return "127.0.0.1"
}

/**
 * Extracts user agent / browser device string.
 */
export function getUserAgent(req?: Request | any): string {
  if (!req) return "Unknown Browser"
  try {
    const headers = req.headers
    const getH = (name: string) => {
      if (typeof headers?.get === "function") return headers.get(name)
      if (headers && typeof headers === "object") return headers[name]
      return null
    }
    return getH("user-agent") || "Unknown Browser"
  } catch {
    return "Unknown Browser"
  }
}

/**
 * Resolves geolocation (City, Region, Country) for an IP address.
 * Falls back immediately for local/campus IPs or on timeout.
 */
export async function getLocationFromIp(ip: string, req?: Request | any): Promise<string> {
  // 1. Check edge CDN headers first (Vercel / Cloudflare)
  if (req?.headers) {
    try {
      const getH = (name: string) => {
        if (typeof req.headers?.get === "function") return req.headers.get(name)
        return req.headers[name]
      }
      const city = getH("x-vercel-ip-city") || getH("cf-ipcity")
      const region = getH("x-vercel-ip-country-region")
      const country = getH("x-vercel-ip-country") || getH("cf-ipcountry")

      if (city || country) {
        const parts = [city, region, country].filter(Boolean)
        return parts.join(", ")
      }
    } catch {
      // ignore
    }
  }

  const cleanIp = (ip || "").trim()

  // 2. Localhost & Private Campus Network detection
  if (
    !cleanIp ||
    cleanIp === "127.0.0.1" ||
    cleanIp === "::1" ||
    cleanIp.startsWith("192.168.") ||
    cleanIp.startsWith("10.") ||
    cleanIp.startsWith("172.16.") ||
    cleanIp === "localhost"
  ) {
    return "Chennai, Tamil Nadu, IN (Campus LAN)"
  }

  // 3. Cache check
  if (locationCache.has(cleanIp)) {
    return locationCache.get(cleanIp)!
  }

  // 4. Remote lookup with strict 800ms abort
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 800)
    const res = await fetch(`https://freeipapi.com/api/json/${cleanIp}`, {
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (res.ok) {
      const data = await res.json()
      const city = data.cityName
      const region = data.regionName
      const country = data.countryName || data.countryCode
      const parts = [city, region, country].filter(Boolean)
      const loc = parts.length > 0 ? parts.join(", ") : "Chennai, Tamil Nadu, IN"
      locationCache.set(cleanIp, loc)
      return loc
    }
  } catch {
    // lookup timed out or failed
  }

  const fallback = "Chennai, Tamil Nadu, IN"
  locationCache.set(cleanIp, fallback)
  return fallback
}

/**
 * Universal Activity & Audit Logger.
 * Records user actions across the portal with client IP and geolocation.
 */
export async function logActivity(options: LogActivityOptions): Promise<void> {
  try {
    const ip = options.ip || getClientIp(options.req)
    const userAgent = options.userAgent || getUserAgent(options.req)
    const location = options.location || (await getLocationFromIp(ip, options.req))

    const entry = {
      userId: options.userId || "anonymous",
      userName: options.userName || "Unknown User",
      userEmail: options.userEmail || "",
      userRole: options.userRole || "student",
      registerNumber: options.registerNumber || null,
      staffCode: options.staffCode || null,
      action: options.action,
      entityType: options.entityType || "system",
      entityId: options.entityId || null,
      details: options.details,
      metadata: options.metadata || {},
      ip,
      location,
      userAgent,
      timestamp: FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString(),
    }

    // Fire and forget write to Firestore auditLogs collection
    adminDb
      .collection("auditLogs")
      .add(entry)
      .catch((err) => {
        console.warn("[auditLogger] Firestore write warning:", err?.message || err)
      })
  } catch (err: any) {
    console.warn("[auditLogger] logActivity caught warning:", err?.message || err)
  }
}

