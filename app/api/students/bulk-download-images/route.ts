import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import JSZip from "jszip"

/**
 * Bulk download all student images with their names
 * Returns a ZIP file with images named as: StudentID_StudentName.ext
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all students with photos
    const { data: students, error } = await supabase
      .from("students")
      .select("student_id, full_name, photo_url")
      .not("photo_url", "is", null)
      .order("student_id", { ascending: true })

    if (error) {
      console.error("Error fetching students:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!students || students.length === 0) {
      return NextResponse.json({ error: "No students with photos found" }, { status: 404 })
    }

    // Create ZIP file
    const zip = new JSZip()
    const folder = zip.folder("student-photos")

    // Download and add each image to ZIP
    for (const student of students) {
      try {
        const response = await fetch(student.photo_url)
        if (response.ok) {
          const blob = await response.blob()
          const arrayBuffer = await blob.arrayBuffer()
          
          // Clean filename: StudentID_StudentName.ext
          const ext = student.photo_url.split('.').pop() || 'jpg'
          const cleanName = student.full_name.replace(/[^a-zA-Z0-9]/g, '_')
          const filename = `${student.student_id}_${cleanName}.${ext}`
          
          folder?.file(filename, arrayBuffer)
        }
      } catch (err) {
        console.error(`Failed to download image for ${student.student_id}:`, err)
      }
    }

    // Generate ZIP
    const zipBlob = await zip.generateAsync({ type: "nodebuffer" })

    // Return ZIP file
    return new NextResponse(zipBlob, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="student-photos-${new Date().toISOString().split('T')[0]}.zip"`,
      },
    })
  } catch (error) {
    console.error("Error in GET /api/students/bulk-download-images:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
