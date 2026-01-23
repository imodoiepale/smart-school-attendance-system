import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AIActionQueue } from "@/components/dashboard/ai-action-queue"

export default async function Dashboard() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    // Fetch all data for the AI Action Queue dashboard
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const [todayAttendance, studentStats, anomaliesData] = await Promise.all([
      supabase
        .from("attendance_logs")
        .select(`
          id, user_id, user_name, person_type, event_type, period_number, subject,
          camera_id, camera_name, camera_group, timestamp, log_date,
          attendance_status, confidence_score, capture_image_url, raw_payload, created_at
        `)
        .gte("created_at", today.toISOString())
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("user_registry")
        .select("id, user_id, full_name, current_status, last_seen_camera, photo_url, class")
        .eq("person_type", "student")
        .limit(2000),
      supabase
        .from('anomalies')
        .select(`
          id, type, severity, status, title, description,
          student_id, student_name, student_class,
          camera_name, expected_location, actual_location,
          last_seen_location, trends, resolved_at, created_at
        `)
        .order('created_at', { ascending: false })
        .limit(100),
    ]).catch((error) => {
      console.error('Dashboard query error:', error)
      return [{ data: [], error }, { data: [], error }, { data: [], error }] as const
    })

  const attendanceData = (todayAttendance as any)?.data || []
  const studentData = (studentStats as any)?.data || []
  const anomalies = (anomaliesData as any)?.data || []

  // Calculate stats efficiently
  const stats_counts = studentData.reduce(
    (acc: any, student: any) => {
      acc.total++
      if (student.current_status === "on_campus") acc.present++
      else if (student.current_status === "off_campus") acc.offCampus++
      else if (student.current_status === "unknown") acc.unknown++
      return acc
    },
    { total: 0, present: 0, offCampus: 0, unknown: 0 }
  )

  const totalStudents = stats_counts.total
  const presentCount = stats_counts.present
  const offCampusCount = stats_counts.offCampus
  const unknownCount = stats_counts.unknown
  const absentCount = totalStudents - presentCount - offCampusCount - unknownCount

  const stats = {
    total: totalStudents,
    present: presentCount,
    absent: absentCount,
    offCampus: offCampusCount,
    unknown: unknownCount,
    presentPercentage: totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0,
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-[1600px] mx-auto p-4">
        <AIActionQueue 
          initialAnomalies={anomalies}
          initialAttendance={attendanceData}
          initialStudents={studentData}
          stats={stats}
        />
      </main>
    </div>
  )
  } catch (error) {
    console.error('Dashboard error:', error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-red-600">Configuration Error</h1>
          <p className="text-muted-foreground">
            Supabase environment variables are missing or invalid.
          </p>
          <p className="text-sm text-muted-foreground">
            Please check <code className="bg-muted px-2 py-1 rounded">ENV_SETUP.md</code> for setup instructions.
          </p>
          <pre className="text-left bg-muted p-4 rounded text-xs overflow-auto">
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
        </div>
      </div>
    )
  }
}
