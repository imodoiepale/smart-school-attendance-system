import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Auto-register student from attendance detection
 * When a camera detects an unknown person, this endpoint creates a student record
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const body = await request.json()
    const { person_id, person_name, camera_id, photo_url, face_descriptor } = body
    
    if (!person_id || !person_name) {
      return NextResponse.json({ error: "person_id and person_name required" }, { status: 400 })
    }

    // Check if student already exists
    const { data: existing } = await supabase
      .from("students")
      .select("id")
      .eq("student_id", person_id)
      .single()

    if (existing) {
      return NextResponse.json({ 
        message: "Student already exists", 
        student_id: existing.id 
      }, { status: 200 })
    }

    // Create new student from attendance detection
    const { data: student, error } = await supabase
      .from("students")
      .insert([{
        student_id: person_id,
        full_name: person_name,
        photo_url: photo_url || null,
        face_descriptor: face_descriptor || null,
        status: "unknown", // Set to unknown until verified
        grade: "Unassigned",
        class: "Unassigned",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) {
      console.error("Error auto-registering student:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the auto-registration event
    await supabase
      .from("system_logs")
      .insert([{
        log_type: "student_auto_registration",
        log_category: "attendance",
        message: `Student auto-registered from camera detection: ${person_name} (${person_id})`,
        metadata: {
          student_id: student.id,
          person_id,
          camera_id,
          source: "attendance_detection"
        },
        severity: "info",
        created_at: new Date().toISOString(),
      }])

    return NextResponse.json({ 
      success: true, 
      student,
      message: "Student auto-registered successfully" 
    }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/attendance/auto-register:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
