import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * GET - Check status of user_registry (no separate students table exists)
 * Returns count of students in registry
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get count of students in user_registry
    const { data: registryData, count, error } = await supabase
      .from("user_registry")
      .select("user_id, full_name", { count: "exact" })
      .eq("person_type", "student")

    if (error) {
      console.error("Error fetching user_registry:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      totalStudents: count || 0,
      inRegistry: count || 0,
      needsSync: 0, // No separate students table, so nothing to sync
      students: registryData?.slice(0, 20) || []
    }, { status: 200 })
  } catch (error) {
    console.error("Error in GET /api/students/sync-registry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST - No-op since there's no separate students table to sync from
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({
      message: "No separate students table exists - user_registry is the primary table",
      synced: 0
    }, { status: 200 })
  } catch (error) {
    console.error("Error in POST /api/students/sync-registry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
