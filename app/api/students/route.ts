import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Insert into user_registry (the main table)
    const { data, error } = await supabase
      .from("user_registry")
      .insert([{
        user_id: body.student_id,
        full_name: body.full_name,
        person_type: "student",
        grade: body.grade || null,
        class: body.class,
        stream: body.stream || null,
        house: body.house || null,
        parent_phone: body.parent_phone || null,
        parent_email: body.parent_email || null,
        photo_url: body.photo_url || null,
        current_status: body.status || "unknown",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) {
      console.error("Error creating user_registry entry:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { user_id, ...updateData } = body
    
    // Update user_registry
    const { data, error } = await supabase
      .from("user_registry")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id)
      .select()
      .single()

    if (error) {
      console.error("Error updating user_registry:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Error in PUT /api/students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")
    
    if (!user_id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }
    
    // Delete from user_registry
    const { error } = await supabase
      .from("user_registry")
      .delete()
      .eq("user_id", user_id)

    if (error) {
      console.error("Error deleting user_registry entry:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error in DELETE /api/students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
