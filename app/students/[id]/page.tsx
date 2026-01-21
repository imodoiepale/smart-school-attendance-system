import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ModernHeader } from "@/components/modern-header"
import { Phone, MessageCircle, Calendar, TrendingUp, Clock, MapPin, Camera, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Helper to format timestamps
const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Await params before using them (Fix for Next.js 15+)
  const { id } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch student data using user_id (from params)
  const { data: student } = await supabase
    .from("user_registry")
    .select("*")
    .eq("user_id", id) // Use the awaited id
    .eq("person_type", "student")
    .single()

  if (!student) {
    redirect("/admin/students")
  }

  // Fetch attendance logs (Expanded to include more details for the table)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: attendanceLogs } = await supabase
    .from("attendance_logs")
    .select("id, event_type, timestamp, attendance_status, camera_name, capture_image_url")
    .eq("user_id", student.user_id)
    .eq("person_type", "student")
    .gte("timestamp", thirtyDaysAgo.toISOString())
    .order("timestamp", { ascending: false })
    .limit(50) // Limit to last 50 records for performance

  const logs = attendanceLogs || []

  // Calculate summary stats
  const totalDays = new Set(logs.map(l => new Date(l.timestamp).toDateString())).size
  const presentCount = logs.filter(l => l.attendance_status === 'present' || l.attendance_status === 'on_time').length
  const lateCount = logs.filter(l => l.attendance_status?.includes('late')).length
  const lastAttendance = logs.length > 0 ? new Date(logs[0].timestamp) : null

  // Mock academic data (Secondary priority)
  const subjects = [
    { name: 'Mathematics', lastGrade: 'A', avgGrade: 'B+', improvement: 'Improved' },
    { name: 'English', lastGrade: 'B+', avgGrade: 'B', improvement: 'Stable' },
    { name: 'Science', lastGrade: 'C', avgGrade: 'A', improvement: 'Improved' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader
        user={user}
        title={`Student Profile`}
        subtitle={`Viewing record for ${student.full_name}`}
      />

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* 1. Student Identity Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Profile Photo */}
            <div className="relative">
              {student.photo_url ? (
                <img
                  src={student.photo_url}
                  alt={student.full_name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                  {student.full_name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className={`absolute bottom-1 right-1 w-5 h-5 border-2 border-white rounded-full ${student.current_status === 'on_campus' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{student.full_name}</h2>
                  <p className="text-blue-600 font-medium">{student.student_id || student.user_id}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-xs">Class</p>
                  <p className="font-medium text-gray-900">{student.class || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-xs">House</p>
                  <p className="font-medium text-gray-900">{student.house || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-xs">Parent Phone</p>
                  <p className="font-medium text-gray-900">{student.parent_phone || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-xs">Last Seen</p>
                  <p className="font-medium text-gray-900">
                    {lastAttendance ? `${formatDate(lastAttendance.toISOString())} ${formatTime(lastAttendance.toISOString())}` : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Attendance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Days Present (30d)</p>
                <p className="text-3xl font-bold text-gray-900">{totalDays}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">On Time Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {logs.length > 0 ? Math.round((presentCount / logs.length) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Late Arrivals</p>
                <p className="text-3xl font-bold text-gray-900">{lateCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* 3. PRIMARY COLUMN: Attendance Logs (Expanded) */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="overflow-hidden border-t-4 border-t-blue-600">
              <CardHeader className="bg-gray-50/50 border-b pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Attendance Log History
                  </CardTitle>
                  <Badge variant="outline" className="bg-white">Last 30 Days</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="px-6 py-3 text-left font-medium">Date & Time</th>
                        <th className="px-6 py-3 text-left font-medium">Event</th>
                        <th className="px-6 py-3 text-left font-medium">Camera</th>
                        <th className="px-6 py-3 text-left font-medium">Capture</th>
                        <th className="px-6 py-3 text-right font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            No attendance records found for this period.
                          </td>
                        </tr>
                      ) : (
                        logs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">{formatDate(log.timestamp)}</span>
                                <span className="text-gray-500 text-xs">{formatTime(log.timestamp)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${log.event_type === 'entry' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'
                                }`}>
                                {log.event_type === 'entry' ? <TrendingUp className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                {log.event_type.charAt(0).toUpperCase() + log.event_type.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Camera className="w-4 h-4 text-gray-400" />
                                <span className="truncate max-w-[120px]" title={log.camera_name}>{log.camera_name || 'Main Gate'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {log.capture_image_url ? (
                                <div className="w-10 h-10 rounded overflow-hidden border border-gray-200">
                                  <img src={log.capture_image_url} alt="Capture" className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">No image</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Badge variant={
                                log.attendance_status === 'present' || log.attendance_status === 'on_time' ? 'default' :
                                  log.attendance_status?.includes('late') ? 'secondary' : 'destructive'
                              } className="capitalize">
                                {log.attendance_status?.replace('_', ' ') || 'Unknown'}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Academic Performance (Secondary Priority) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80 hover:opacity-100 transition-opacity">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-gray-700">Academic Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subjects.map((subject, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{subject.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-900">{subject.avgGrade}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${subject.improvement === 'Improved' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                            }`}>
                            {subject.improvement}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-gray-700">Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-24 h-24 rounded-full border-8 border-blue-100 border-t-blue-600 flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-blue-600">85%</span>
                    </div>
                    <p className="text-sm text-gray-500">Assignment Completion Rate</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 4. SIDEBAR: Notices & Quick Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Notices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-blue-100 bg-blue-50 rounded-lg">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-700">AD</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Admin Dept</p>
                        <p className="text-xs text-gray-500 mb-2">Yesterday, 10:00 AM</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          School will close early this Friday for staff development training. Pickup is at 1:00 PM.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-purple-700">SC</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Science Club</p>
                        <p className="text-xs text-gray-500 mb-1">2 days ago</p>
                        <p className="text-sm text-gray-600">
                          Science fair project submissions are due next Monday.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Location Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Last Known Location</p>
                    <p className="font-medium text-sm">{student.last_seen_camera || logs[0]?.camera_name || 'Main Entrance'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Current Status</p>
                    <Badge variant={student.current_status === 'on_campus' ? 'default' : 'secondary'}>
                      {student.current_status === 'on_campus' ? 'On Campus' : 'Off Campus'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}