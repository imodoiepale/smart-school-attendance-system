import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Upload, Trash2, Edit } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header" // Import DashboardHeader component

export default async function StudentManagement() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all students
  const { data: students } = await supabase.from("students").select("*").order("last_name", { ascending: true })

  const studentData = students || []

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} /> // Use DashboardHeader component

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header with Actions */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">Student Management</h2>
            <p className="text-muted-foreground">Total Students: {studentData.length}</p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import CSV
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <Input placeholder="Search by name, student ID, or class..." className="w-full" />
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Photo</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Student ID</th>
                    <th className="text-left py-3 px-4 font-medium">Class</th>
                    <th className="text-left py-3 px-4 font-medium">Grade</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    studentData.map((student) => (
                      <tr key={student.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {student.photo_url ? (
                            <img
                              src={student.photo_url || "/placeholder.svg"}
                              alt={student.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                              {student.full_name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {student.full_name}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{student.student_id}</td>
                        <td className="py-3 px-4">{student.class}</td>
                        <td className="py-3 px-4">{student.grade}</td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            {student.status === "on_campus" ? "On Campus" : student.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
