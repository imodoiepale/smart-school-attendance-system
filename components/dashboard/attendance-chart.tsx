"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface AttendanceChartProps {
  logs: any[]
}

export function AttendanceChart({ logs }: AttendanceChartProps) {
  // Process attendance data by day of week
  const dayStats: Record<string, { present: number; late: number; absent: number }> = {
    "Mon": { present: 0, late: 0, absent: 0 },
    "Tue": { present: 0, late: 0, absent: 0 },
    "Wed": { present: 0, late: 0, absent: 0 },
    "Thu": { present: 0, late: 0, absent: 0 },
    "Fri": { present: 0, late: 0, absent: 0 },
  }

  // Group logs by day of week (last 5 days)
  logs.forEach((log) => {
    const date = new Date(log.timestamp || log.created_at)
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const dayName = dayNames[date.getDay()]
    
    // Only count weekdays
    if (dayStats[dayName]) {
      if (log.event_type === "entry" || log.attendance_status === "present" || log.attendance_status === "on_time") {
        dayStats[dayName].present++
      } else if (log.attendance_status === "absent") {
        dayStats[dayName].absent++
      } else if (log.attendance_status?.includes("late")) {
        dayStats[dayName].late++
      }
    }
  })

  const chartData = Object.entries(dayStats).map(([day, stats]) => ({
    day,
    Present: stats.present,
    Late: stats.late,
    Absent: stats.absent,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Attendance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" fontSize={12} stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="Present" fill="#10B981" name="Present" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Late" fill="#F59E0B" name="Late" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Absent" fill="#EF4444" name="Absent" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
