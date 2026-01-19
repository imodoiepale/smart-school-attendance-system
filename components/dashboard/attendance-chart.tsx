"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface AttendanceChartProps {
  logs: any[]
}

export function AttendanceChart({ logs }: AttendanceChartProps) {
  const periodStats: Record<string, { present: number; absent: number; late: number }> = {
    "Morning Roll Call": { present: 0, absent: 0, late: 0 },
    "Period 1": { present: 0, absent: 0, late: 0 },
    "Period 2": { present: 0, absent: 0, late: 0 },
    Lunch: { present: 0, absent: 0, late: 0 },
    "Period 3": { present: 0, absent: 0, late: 0 },
  }

  logs.forEach((log) => {
    const period = log.class || "Period 1"
    if (periodStats[period]) {
      if (log.attendance_status === "present" || log.attendance_status === "on_time") {
        periodStats[period].present++
      } else if (log.attendance_status === "absent") {
        periodStats[period].absent++
      } else if (log.attendance_status?.includes("late")) {
        periodStats[period].late++
      }
    }
  })

  const chartData = Object.entries(periodStats).map(([period, stats]) => ({
    period,
    ...stats,
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
              <XAxis dataKey="period" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="var(--color-chart-1)" name="Present" />
              <Bar dataKey="absent" fill="var(--color-chart-3)" name="Absent" />
              <Bar dataKey="late" fill="var(--color-chart-2)" name="Late" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
