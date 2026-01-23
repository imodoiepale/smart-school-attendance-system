"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { ModernHeader } from "@/components/modern-header"

export default function FlaggedStudents() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [flaggedStudents, setFlaggedStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    fetchFlaggedStudents()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
    } else {
      setUser(user)
    }
  }

  const fetchFlaggedStudents = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("flagged_students")
      .select("*")
      .order("flagged_at", { ascending: false })
    setFlaggedStudents(data || [])
    setLoading(false)
  }

  const handleResolve = async (id: string) => {
    const notes = prompt("Resolution notes:")
    if (!notes) return

    const { error } = await supabase
      .from("flagged_students")
      .update({
        intervention_status: "resolved",
        resolved_at: new Date().toISOString(),
        resolution_notes: notes,
      })
      .eq("id", id)

    if (!error) {
      fetchFlaggedStudents()
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-[1600px] mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900">Flagged Students</h1>
          <p className="text-gray-600 mt-1">At-risk students requiring intervention and support</p>
          
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-1">{flaggedStudents.length}</div>
                  <div className="text-sm text-gray-600">Total Flagged</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-1">
                    {flaggedStudents.filter(s => s.intervention_status === "pending").length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-1">
                    {flaggedStudents.filter(s => s.intervention_status === "in_progress").length}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-1">
                    {flaggedStudents.filter(s => s.intervention_status === "resolved").length}
                  </div>
                  <div className="text-sm text-gray-600">Resolved</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Flagged Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4">Student</th>
                    <th className="text-left py-3 px-4">Class</th>
                    <th className="text-left py-3 px-4">Flag Type</th>
                    <th className="text-left py-3 px-4">Severity</th>
                    <th className="text-left py-3 px-4">Absence Rate</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Flagged</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  ) : flaggedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-muted-foreground">
                        No flagged students
                      </td>
                    </tr>
                  ) : (
                    flaggedStudents.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{student.student_name}</p>
                            <p className="text-xs text-muted-foreground">{student.student_id}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{student.class}</td>
                        <td className="py-3 px-4">{student.flag_type}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              student.severity === "high"
                                ? "destructive"
                                : student.severity === "medium"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {student.severity}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {student.absence_rate ? `${(student.absence_rate * 100).toFixed(1)}%` : "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              student.intervention_status === "resolved"
                                ? "default"
                                : student.intervention_status === "in_progress"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {student.intervention_status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {new Date(student.flagged_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {student.intervention_status !== "resolved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolve(student.id)}
                            >
                              Resolve
                            </Button>
                          )}
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
