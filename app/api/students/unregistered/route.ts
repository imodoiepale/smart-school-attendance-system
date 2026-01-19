import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Get unregistered people from attendance_logs who are not in user_registry
 * These are people detected by cameras but not yet added to the system
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get unique people from attendance_logs who are students
    const { data: attendanceLogs, error: logsError } = await supabase
      .from("attendance_logs")
      .select("user_id, user_name, person_type, capture_image_url, timestamp")
      .eq("person_type", "student")
      .order("timestamp", { ascending: false })

    if (logsError) {
      console.error("Error fetching attendance_logs:", logsError)
      return NextResponse.json({ error: logsError.message }, { status: 500 })
    }

    // Get all registered users from user_registry
    const { data: registeredUsers, error: registryError } = await supabase
      .from("user_registry")
      .select("user_id")
      .eq("person_type", "student")

    if (registryError) {
      console.error("Error fetching user_registry:", registryError)
      return NextResponse.json({ error: registryError.message }, { status: 500 })
    }

    const registeredIds = new Set(registeredUsers?.map(u => u.user_id) || [])

    // Filter to get unregistered people
    const unregisteredMap = new Map()
    
    attendanceLogs?.forEach(log => {
      if (!registeredIds.has(log.user_id) && !unregisteredMap.has(log.user_id)) {
        unregisteredMap.set(log.user_id, {
          user_id: log.user_id,
          user_name: log.user_name,
          person_type: log.person_type,
          capture_image_url: log.capture_image_url,
          first_seen: log.timestamp,
          detection_count: 1
        })
      } else if (!registeredIds.has(log.user_id)) {
        const existing = unregisteredMap.get(log.user_id)
        existing.detection_count++
      }
    })

    const unregistered = Array.from(unregisteredMap.values())
      .sort((a, b) => b.detection_count - a.detection_count)

    return NextResponse.json({
      count: unregistered.length,
      unregistered
    }, { status: 200 })
  } catch (error) {
    console.error("Error in GET /api/students/unregistered:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * Register a person from attendance_logs to user_registry and students table
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { user_id, user_name, photo_url, class: studentClass, stream } = body

    if (!user_id || !user_name) {
      return NextResponse.json({ error: "user_id and user_name required" }, { status: 400 })
    }

    // Add to user_registry
    const { data: student, error: registryError } = await supabase
      .from("user_registry")
      .insert([{
        user_id,
        full_name: user_name,
        person_type: "student",
        class: studentClass || "Unassigned",
        stream: stream || "Unassigned",
        grade: "Unassigned",
        photo_url: photo_url || null,
        current_status: "on_campus",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (registryError) {
      console.error("Error adding to user_registry:", registryError)
      return NextResponse.json({ error: registryError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Student registered successfully",
      student
    }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/students/unregistered:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
