"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export function AttendanceSummaryReport() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Simulated data - in production, this would aggregate real attendance data
      const mockData = [
        { date: "Mon", present: 450, absent: 25, late: 15 },
        { date: "Tue", present: 460, absent: 18, late: 12 },
        { date: "Wed", present: 468, absent: 15, late: 7 },
        { date: "Thu", present: 455, absent: 22, late: 13 },
        { date: "Fri", present: 470, absent: 12, late: 8 },
      ]

      setData(mockData)
      setLoading(false)
    }

    fetchData()
  }, [])

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
    <div className="space-y-6">
      {/* Line Chart - Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="var(--color-chart-1)" name="Present" />
                <Line type="monotone" dataKey="absent" stroke="var(--color-chart-3)" name="Absent" />
                <Line type="monotone" dataKey="late" stroke="var(--color-chart-2)" name="Late" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart - Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
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

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">94.2%</p>
              <p className="text-sm text-muted-foreground">Weekly Average</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">2,303</p>
              <p className="text-sm text-muted-foreground">Total Present</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">92</p>
              <p className="text-sm text-muted-foreground">Total Absent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">55</p>
              <p className="text-sm text-muted-foreground">Total Late</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
