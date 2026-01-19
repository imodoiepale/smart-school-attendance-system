import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, Calendar, AlertCircle, FileText } from "lucide-react"

export default async function ParentPortal() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get parent's profile to find their children
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Fetch children's data (assuming parent_id relationship exists)
  const { data: children } = await supabase
    .from("students")
    .select("*")
    .eq("parent_id", user.id)
    .order("full_name")

  const childrenData = children || []

  // Fetch attendance for all children (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: attendanceRecords } = await supabase
    .from("attendance")
    .select("*, students(id, full_name, student_id)")
    .in("student_id", childrenData.map(c => c.id))
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(50)

  const attendance = attendanceRecords || []

  // Fetch absence requests
  const { data: absenceRequests } = await supabase
    .from("absence_requests")
    .select("*, students(full_name)")
    .in("student_id", childrenData.map(c => c.id))
    .order("created_at", { ascending: false })
    .limit(20)

  const requests = absenceRequests || []

  // Calculate stats for each child
  const childStats = childrenData.map(child => {
    const childAttendance = attendance.filter(a => a.student_id === child.id)
    const presentCount = childAttendance.filter(a => a.event_type === "entry").length
    const totalDays = 30 // Last 30 days
    const attendanceRate = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0

    return {
      ...child,
      presentCount,
      attendanceRate,
      recentAttendance: childAttendance.slice(0, 5)
    }
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-3xl font-bold">Parent Portal</h1>
          <p className="text-muted-foreground">Welcome, {profile?.full_name || user.email}</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Children Overview */}
        <div>
          <h2 className="text-2xl font-bold mb-4">My Children</h2>
          {childrenData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No children linked to your account</p>
                <p className="text-sm text-muted-foreground">Please contact the school administrator</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {childStats.map((child) => (
                <Card key={child.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {child.photo_url ? (
                        <img
                          src={child.photo_url}
                          alt={child.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                          {child.full_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{child.full_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{child.class} - {child.student_id}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Attendance Rate */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Attendance Rate (30 days)</span>
                        <span className={`text-lg font-bold ${
                          child.attendanceRate >= 90 ? 'text-green-600' :
                          child.attendanceRate >= 75 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {child.attendanceRate}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            child.attendanceRate >= 90 ? 'bg-green-600' :
                            child.attendanceRate >= 75 ? 'bg-orange-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${child.attendanceRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Current Status */}
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                      {child.status === "on_campus" ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium">Currently On Campus</span>
                        </>
                      ) : child.status === "off_campus" ? (
                        <>
                          <XCircle className="w-5 h-5 text-orange-600" />
                          <span className="text-sm font-medium">Off Campus</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm font-medium">Status Unknown</span>
                        </>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1">
                        Request Absence
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Attendance Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Attendance Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendance.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent attendance records</p>
            ) : (
              <div className="space-y-3">
                {attendance.slice(0, 10).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {record.event_type === "entry" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-orange-600" />
                      )}
                      <div>
                        <p className="font-medium">
                          {Array.isArray(record.students) ? record.students[0]?.full_name : record.students?.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {record.event_type === "entry" ? "Entered Campus" : "Exited Campus"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(record.timestamp || record.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.timestamp || record.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Absence Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Absence Requests
              </CardTitle>
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No absence requests</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Student</th>
                      <th className="text-left py-3 px-4 font-medium">Date Range</th>
                      <th className="text-left py-3 px-4 font-medium">Reason</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {Array.isArray(request.students) ? request.students[0]?.full_name : request.students?.full_name}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(request.absence_date_start).toLocaleDateString()} - 
                          {new Date(request.absence_date_end).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">{request.reason}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === "approved" ? "bg-green-100 text-green-800" :
                            request.status === "rejected" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {request.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
