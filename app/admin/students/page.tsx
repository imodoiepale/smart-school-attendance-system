"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Upload, Trash2, Edit, Search, Download, UserPlus } from "lucide-react"
import { AddStudentModal } from "@/components/students/add-student-modal"
import { ModernHeader } from "@/components/modern-header"

export default function StudentManagement() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [addModalOpen, setAddModalOpen] = useState(false)

  useEffect(() => {
    checkUser()
    fetchStudents()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
    } else {
      setUser(user)
    }
  }

  const fetchStudents = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("user_registry")
      .select("*")
      .eq("person_type", "student")
      .order("full_name", { ascending: true })
    setStudents(data || [])
    setLoading(false)
  }

  const handleDelete = async (user_id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return
    
    const response = await fetch(`/api/students?user_id=${user_id}`, { method: "DELETE" })
    if (response.ok) {
      fetchStudents()
    } else {
      alert("Failed to delete student")
    }
  }

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.user_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader user={user} title="Student Management" subtitle="Manage student records" />

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header with Actions */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">Total Students: {filteredStudents.length}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/admin/students/unregistered')} variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
              <UserPlus className="w-4 h-4 mr-2" />
              Unregistered People
            </Button>
            <Button onClick={() => setAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
            <Button variant="outline" onClick={async () => {
              const response = await fetch('/api/students/bulk-download-images')
              if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `student-photos-${new Date().toISOString().split('T')[0]}.zip`
                a.click()
              }
            }}>
              <Download className="w-4 h-4 mr-2" />
              Download All Photos
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search by name, student ID, or class..." 
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        Loading students...
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
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
                        <td className="py-3 px-4 text-muted-foreground">{student.user_id}</td>
                        <td className="py-3 px-4">{student.class}</td>
                        <td className="py-3 px-4">{student.grade}</td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            {student.current_status === "on_campus" ? "On Campus" : student.current_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => router.push(`/students/${student.user_id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(student.user_id)}
                          >
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

      <AddStudentModal 
        open={addModalOpen} 
        onOpenChange={(open) => {
          setAddModalOpen(open)
          if (!open) fetchStudents()
        }} 
      />
    </div>
  )
}
