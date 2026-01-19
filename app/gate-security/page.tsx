import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header" // Declare the DashboardHeader variable

export default async function GateSecurityInterface() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch students and attendance records
  const [studentData, attendanceData] = await Promise.all([
    supabase.from("students").select("*").eq("status", "on_campus").order("full_name"),
    supabase
      .from("attendance")
      .select("*, students(id, full_name, student_id, photo_url)")
      .eq("event_type", "exit")
      .order("timestamp", { ascending: false })
      .limit(20),
  ])

  const students_list = studentData.data || []
  const exitRecords = attendanceData.data || []

  // Declare pendingData, approvedData, and exitData variables
  const pendingData = exitRecords.filter((exit) => exit.status === "pending")
  const approvedData = exitRecords.filter((exit) => exit.status === "approved")
  const exitData = exitRecords.filter((exit) => exit.status === "verified")

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold">Gate Security Interface</h2>
          <p className="text-muted-foreground">Exit verification and approval management</p>
        </div>

        {/* Students On Campus */}
        <Card>
          <CardHeader>
            <CardTitle>Students Currently On Campus ({students_list.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students_list.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 col-span-3">No students on campus</p>
              ) : (
                students_list.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {student.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{student.full_name}</p>
                      <p className="text-sm text-muted-foreground">{student.student_id}</p>
                      <p className="text-xs text-green-600 mt-1">On Campus</p>
                    </div>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      Mark Exit
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Exit Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Exit Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Student Name</th>
                    <th className="text-left py-3 px-4 font-medium">Student ID</th>
                    <th className="text-left py-3 px-4 font-medium">Exit Time</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {exitRecords.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-muted-foreground">
                        No exit activity recorded
                      </td>
                    </tr>
                  ) : (
                    exitRecords.map((exit) => (
                      <tr key={exit.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {exit.students?.full_name}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{exit.students?.student_id}</td>
                        <td className="py-3 px-4">{new Date(exit.timestamp || exit.created_at).toLocaleTimeString()}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
