import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AttendanceStats } from "@/components/dashboard/stats"
import { AttendanceChart } from "@/components/dashboard/attendance-chart"
import { ActiveAlerts } from "@/components/dashboard/active-alerts"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { StudentSearch } from "@/components/dashboard/student-search"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { getAlerts } from "@/lib/alerts"

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch real-time attendance data and alerts
  const [todayAttendance, recentLogs, students, alerts] = await Promise.all([
    supabase
      .from("attendance")
      .select("*, students(student_id, full_name)")
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
      .order("created_at", { ascending: false }),
    supabase
      .from("attendance")
      .select("*, students(student_id, full_name, class)")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("students").select("id, status").order("created_at", { ascending: false }),
    getAlerts(), // Fetch alerts using the getAlerts function
  ])

  const attendanceData = todayAttendance.data || []
  const activityData = recentLogs.data || []
  const studentData = students.data || []
  const alertData = alerts || [] // Declare alertData variable

  // Calculate stats
  const totalStudents = studentData.length
  const presentCount = studentData.filter((s) => s.status === "on_campus").length
  const offCampusCount = studentData.filter((s) => s.status === "off_campus").length
  const unknownCount = studentData.filter((s) => s.status === "unknown").length
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
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Real-time Stats */}
        <AttendanceStats stats={stats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts & Data */}
          <div className="lg:col-span-2 space-y-6">
            <AttendanceChart logs={attendanceData} />
            <RecentActivity activities={activityData} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <ActiveAlerts alerts={alertData} />
            <StudentSearch />
          </div>
        </div>
      </main>
    </div>
  )
}
