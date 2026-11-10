import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { AuditLogEntry } from "@/lib/auditLogger"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionUser = session.user as any
    const staffCode = (sessionUser.staffCode || sessionUser.username || "").toUpperCase().trim()
    const isHodOrAdmin =
      sessionUser.role === "hod" ||
      sessionUser.role === "admin" ||
      staffCode === "CS91" ||
      session.user?.email === "antojenishiadev@gmail.com"

    if (!isHodOrAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Audit logs are restricted to Head of Department & Administrators." },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const roleFilter = searchParams.get("role") || "ALL"
    const actionFilter = searchParams.get("action") || "ALL"
    const entityFilter = searchParams.get("entity") || "ALL"
    const search = (searchParams.get("search") || "").toLowerCase().trim()
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 300)
    const fromDate = searchParams.get("fromDate")
    const toDate = searchParams.get("toDate")

    let query: FirebaseFirestore.Query = adminDb.collection("auditLogs")

    if (roleFilter !== "ALL") {
      query = query.where("userRole", "==", roleFilter.toLowerCase())
    }

    if (actionFilter !== "ALL") {
      query = query.where("action", "==", actionFilter)
    }

    if (entityFilter !== "ALL") {
      query = query.where("entityType", "==", entityFilter.toLowerCase())
    }

    // Fetch snapshot
    const snap = await query.get()

    let logs: AuditLogEntry[] = snap.docs.map((doc) => {
      const d = doc.data()
      return {
        id: doc.id,
        userId: d.userId || "",
        userName: d.userName || "Unknown",
        userEmail: d.userEmail || "",
        userRole: d.userRole || "student",
        registerNumber: d.registerNumber || null,
        staffCode: d.staffCode || null,
        action: d.action || "UNKNOWN",
        entityType: d.entityType || "system",
        entityId: d.entityId || null,
        details: d.details || "",
        metadata: d.metadata || {},
        ip: d.ip || "127.0.0.1",
        location: d.location || "Chennai, Tamil Nadu, IN",
        userAgent: d.userAgent || "Unknown Device",
        createdAt: d.createdAt || (d.timestamp?.toDate ? d.timestamp.toDate().toISOString() : new Date().toISOString()),
      }
    })

    // Filter by search query if provided
    if (search) {
      logs = logs.filter((log) => {
        return (
          log.userName.toLowerCase().includes(search) ||
          (log.userEmail || "").toLowerCase().includes(search) ||
          (log.registerNumber || "").toLowerCase().includes(search) ||
          (log.staffCode || "").toLowerCase().includes(search) ||
          log.details.toLowerCase().includes(search) ||
          log.ip.toLowerCase().includes(search) ||
          log.location.toLowerCase().includes(search) ||
          log.action.toLowerCase().includes(search)
        )
      })
    }

    // Filter by date range if provided
    if (fromDate || toDate) {
      logs = logs.filter((log) => {
        const logDate = log.createdAt.split("T")[0]
        if (fromDate && logDate < fromDate) return false
        if (toDate && logDate > toDate) return false
        return true
      })
    }

    // Sort newest first
    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Metrics summary
    const uniqueUsers = new Set(logs.map((l) => l.userId)).size
    const loginEvents = logs.filter((l) => l.action.includes("LOGIN")).length
    const attendanceEvents = logs.filter((l) => l.action.includes("ATTENDANCE")).length
    const leaveEvents = logs.filter((l) => l.action.includes("LEAVE")).length
    const odEvents = logs.filter((l) => l.action.includes("OD")).length

    const pagedLogs = logs.slice(0, limit)

    return NextResponse.json({
      logs: pagedLogs,
      totalCount: logs.length,
      metrics: {
        totalLogs: logs.length,
        uniqueUsers,
        loginEvents,
        attendanceEvents,
        leaveEvents,
        odEvents,
      },
    })
  } catch (error: any) {
    console.error("[GET /api/admin/audit-logs] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch audit logs" }, { status: 500 })
  }
}

