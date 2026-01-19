import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ModernHeader } from "@/components/modern-header"
import { AttendanceChart } from "@/components/dashboard/attendance-chart"
import { BookOpen, TrendingUp, Calendar, Clock, ArrowRight } from "lucide-react"
import { getAlerts } from "@/lib/alerts"

export default async function Dashboard() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    // Fetch real-time attendance data and alerts - optimized queries with error handling
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const [todayAttendance, recentLogs, studentStats, alerts] = await Promise.all([
      supabase
        .from("attendance_logs")
        .select("id, user_id, user_name, event_type, timestamp, created_at, attendance_status")
        .gte("created_at", today.toISOString())
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("attendance_logs")
        .select("id, user_id, user_name, event_type, timestamp, created_at, attendance_status")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("user_registry")
        .select("id, current_status")
        .eq("person_type", "student")
        .limit(1000),
      Promise.resolve([]),
    ]).catch((error) => {
      console.error('Dashboard query error:', error)
      return [{ data: [], error }, { data: [], error }, { data: [], error }, []] as const
    })

  // Fetch assignments and events
  const [assignmentsData, eventsData] = await Promise.all([
    supabase
      .from("assignments")
      .select("*")
      .eq("status", "active")
      .order("due_date", { ascending: true })
      .limit(5),
    supabase
      .from("school_events")
      .select("*")
      .gte("start_datetime", new Date().toISOString())
      .order("start_datetime", { ascending: true })
      .limit(5),
  ])

  const attendanceData = (todayAttendance as any)?.data || []
  
  // Transform activity data from attendance_logs
  const activityData = ((recentLogs as any)?.data || []).map((log: any) => ({
    ...log,
    full_name: log.user_name,
    student_id: log.user_id
  }))
  
  const studentData = (studentStats as any)?.data || []
  const assignments = assignmentsData?.data || []
  const events = eventsData?.data || []

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
    <div className="min-h-screen bg-gray-50">
      <ModernHeader user={user} title="Dashboard" subtitle="Student Management" />

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Course Progress */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold">Course Progress</span>
              <button className="ml-auto text-white/80 hover:text-white">⋯</button>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold">{stats.presentPercentage}%</span>
              <span className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4" />
                12%
              </span>
            </div>
            <p className="text-sm text-white/90 mb-4">{stats.present} out of {stats.total} classes</p>
            <button className="flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all">
              See Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Attendance Rate */}
          <div className="bg-gradient-to-br from-pink-400 to-pink-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">Attendance Rate</span>
              <button className="ml-auto text-white/80 hover:text-white">⋯</button>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold">{stats.presentPercentage}%</span>
              <span className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4" />
                02%
              </span>
            </div>
            <p className="text-sm text-white/90 mb-4">Based on total student</p>
            <button className="flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all">
              See Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Assignments */}
          <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold">Assignments</span>
              <button className="ml-auto text-white/80 hover:text-white">⋯</button>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold">64%</span>
              <span className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4" />
                18%
              </span>
            </div>
            <p className="text-sm text-white/90 mb-4">Based on recent task</p>
            <button className="flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all">
              See Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Attendance Chart */}
            <AttendanceChart logs={attendanceData} />

            {/* Activities Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Activities Schedule</h3>
                <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Today
                </button>
              </div>
              <div className="space-y-3">
                {activityData.slice(0, 3).map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.students?.full_name || 'Activity'}</p>
                      <p className="text-sm text-gray-500">In progress</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>11:00 am - 12:00 am</span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">⋯</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Assignment Completion */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Assignment Completion</h3>
              <div className="relative w-48 h-48 mx-auto mb-4">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="12" strokeDasharray="251" strokeDashoffset="75" transform="rotate(-90 50 50)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">70%</p>
                    <p className="text-sm text-gray-500">Total Summary</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-600">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">Overdue</span>
                </div>
              </div>
            </div>

            {/* Current Assignment */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Current Assignment</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700">All Task</button>
              </div>
              <div className="space-y-3">
                {assignments.length > 0 ? assignments.slice(0, 3).map((assignment: any) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(assignment.due_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-4">No assignments yet</p>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Upcoming Events</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700">All Event</button>
              </div>
              <div className="space-y-4">
                {events.length > 0 ? events.slice(0, 2).map((event: any) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900">{event.name}</p>
                          {event.rating && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              {event.rating}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(event.start_datetime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-sm text-gray-600 mb-3">{event.description || event.location}</p>
                        <div className="flex -space-x-2">
                          <img src="https://ui-avatars.com/api/?name=A&size=32" className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                          <img src="https://ui-avatars.com/api/?name=B&size=32" className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-4">No upcoming events</p>
                )}
              </div>
            </div>
          </div>
        </div>
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
