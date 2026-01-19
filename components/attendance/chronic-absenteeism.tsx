"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

interface ChronicStudent {
  student_id: string
  full_name: string
  absence_rate: number
  total_absences: number
  risk_level: string
}

export function ChronicAbsenteeism() {
  const [students, setStudents] = useState<ChronicStudent[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchChronic = async () => {
      setLoading(true)

      // Fetch all students and their attendance
      const { data: allStudents } = await supabase.from("students").select("id, full_name, student_id")

      if (allStudents) {
        const chronicList = await Promise.all(
          allStudents.map(async (student) => {
            const { count: totalDays } = await supabase
              .from("attendance")
              .select("*", { count: "exact" })
              .eq("student_id", student.id)
              .filter("event_type", "eq", "morning_roll")

            const { count: absenceDays } = await supabase
              .from("attendance")
              .select("*", { count: "exact" })
              .eq("student_id", student.id)
              .eq("status", "absent")
              .filter("event_type", "eq", "morning_roll")

            const absenceRate = totalDays && totalDays > 0 ? (absenceDays || 0) / totalDays : 0

            return {
              student_id: student.student_id,
              full_name: student.full_name,
              absence_rate: absenceRate * 100,
              total_absences: absenceDays || 0,
              risk_level: absenceRate > 0.3 ? "high" : absenceRate > 0.2 ? "medium" : "low",
            }
          }),
        )

        setStudents(chronicList.filter((s) => s.absence_rate > 15).sort((a, b) => b.absence_rate - a.absence_rate))
      }

      setLoading(false)
    }

    fetchChronic()
  }, [])

  const getRiskBadge = (level: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      high: "destructive",
      medium: "secondary",
      low: "outline",
    }
    const labels: Record<string, string> = {
      high: "High Risk",
      medium: "Medium Risk",
      low: "Low Risk",
    }
    return <Badge variant={variants[level] || "outline"}>{labels[level]}</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          Chronic Absenteeism Detection
        </CardTitle>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <p className="text-center text-muted-foreground">No students with chronic absenteeism detected</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Student Name</th>
                  <th className="text-left py-3 px-4 font-medium">ID</th>
                  <th className="text-right py-3 px-4 font-medium">Absence Rate</th>
                  <th className="text-right py-3 px-4 font-medium">Total Absences</th>
                  <th className="text-right py-3 px-4 font-medium">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.student_id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">{student.full_name}</td>
                    <td className="py-3 px-4 font-mono text-xs">{student.student_id}</td>
                    <td className="py-3 px-4 text-right">{student.absence_rate.toFixed(1)}%</td>
                    <td className="py-3 px-4 text-right">{student.total_absences} days</td>
                    <td className="py-3 px-4 text-right">{getRiskBadge(student.risk_level)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
