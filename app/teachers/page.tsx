import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Clock } from "lucide-react"

export default async function TeacherPortal() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get teacher's classes and today's attendance
  const [classAttendance, students] = await Promise.all([
    supabase
      .from("attendance")
      .select("*, students(id, full_name, student_id, class)")
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
      .order("created_at", { ascending: false }),
    supabase.from("students").select("*").order("class"),
  ])

  const attendanceData = classAttendance.data || []
  const classLogs = attendanceData

  // Count attendance statuses
  const statusCount = {
    present: classLogs.filter((l) => l.status === "present" || l.event_type === "entry").length,
    late: classLogs.filter((l) => l.status === "late").length,
    absent: classLogs.filter((l) => l.status === "absent").length,
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Teacher Portal</h1>
          <p className="text-gray-600 mt-2">Today's Attendance Review</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-green-600">{statusCount.present}</p>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-orange-600">{statusCount.late}</p>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-red-600">{statusCount.absent}</p>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Class Attendance Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Student Name</th>
                  <th className="text-left py-3 px-4 font-medium">Student ID</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Time</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No attendance records yet
                    </td>
                  </tr>
                ) : (
                  classLogs.slice(0, 20).map((log) => {
                    const statusColor =
                      log.attendance_status === "on_time" || log.attendance_status === "present"
                        ? "text-green-600"
                        : log.attendance_status === "absent"
                          ? "text-red-600"
                          : "text-orange-600"

                    return (
                      <tr key={log.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {log.students?.full_name}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{log.students?.student_id}</td>
                        <td className="py-3 px-4">
                          <span className={`font-medium capitalize ${statusColor}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(log.timestamp || log.created_at).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            Verify
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
