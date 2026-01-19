"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

interface AttendanceLogProps {
  selectedDate: Date
}

interface AttendanceRecord {
  id: string
  student_id: string
  event_type: string
  status: string
  timestamp: string
  camera_id: string | null
  confidence: number | null
}

export function AttendanceLog({ selectedDate }: AttendanceLogProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, unknown: 0 })
  const supabase = createClient()

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true)

      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)

      const { data } = await supabase
        .from("attendance")
        .select("*")
        .gte("timestamp", startOfDay.toISOString())
        .lte("timestamp", endOfDay.toISOString())
        .order("timestamp", { ascending: false })

      if (data) {
        setRecords(data)

        const stats = {
          present: data.filter((r) => r.status === "present").length,
          absent: data.filter((r) => r.status === "absent").length,
          late: data.filter((r) => r.status === "late").length,
          unknown: data.filter((r) => r.status === "unknown").length,
        }
        setStats(stats)
      }

      setLoading(false)
    }

    fetchAttendance()
  }, [selectedDate])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      present: "default",
      absent: "destructive",
      late: "secondary",
      unknown: "outline",
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  const getEventLabel = (type: string) => {
    const labels: Record<string, string> = {
      morning_roll: "Morning Roll Call",
      class_period: "Class Period",
      lunch: "Lunch",
      dinner: "Dinner",
      gate_entry: "Gate Entry",
      gate_exit: "Gate Exit",
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.present}</p>
              <p className="text-sm text-muted-foreground">Present</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.absent}</p>
              <p className="text-sm text-muted-foreground">Absent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.late}</p>
              <p className="text-sm text-muted-foreground">Late</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{stats.unknown}</p>
              <p className="text-sm text-muted-foreground">Unknown</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : records.length === 0 ? (
            <p className="text-center text-muted-foreground">No records found for this date</p>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{getEventLabel(record.event_type)}</p>
                      {getStatusBadge(record.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(record.timestamp).toLocaleTimeString()}</p>
                  </div>
                  {record.confidence && (
                    <span className="text-xs font-mono text-muted-foreground">{record.confidence.toFixed(1)}%</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
