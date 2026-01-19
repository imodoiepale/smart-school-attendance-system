"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ClassStats {
  class: string
  present: number
  absent: number
  rate: number
}

export function ClassAnalytics() {
  const [classStats, setClassStats] = useState<ClassStats[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchClassData = async () => {
      setLoading(true)

      // Mock data - in production, fetch real class analytics
      const mockData = [
        { class: "10A", present: 45, absent: 3, rate: 93.75 },
        { class: "10B", present: 43, absent: 2, rate: 95.56 },
        { class: "10C", present: 42, absent: 5, rate: 89.36 },
        { class: "11A", present: 46, absent: 1, rate: 97.87 },
        { class: "11B", present: 44, absent: 4, rate: 91.67 },
        { class: "12A", present: 47, absent: 2, rate: 95.92 },
        { class: "12B", present: 45, absent: 3, rate: 93.75 },
        { class: "12C", present: 41, absent: 6, rate: 87.23 },
      ]

      setClassStats(mockData)
      setLoading(false)
    }

    fetchClassData()
  }, [])

  const getRateColor = (rate: number) => {
    if (rate >= 95) return "text-green-600 dark:text-green-400"
    if (rate >= 90) return "text-blue-600 dark:text-blue-400"
    if (rate >= 85) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
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
        <CardTitle>Class-wise Attendance Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium">Class</th>
                <th className="text-right py-3 px-4 font-medium">Present</th>
                <th className="text-right py-3 px-4 font-medium">Absent</th>
                <th className="text-right py-3 px-4 font-medium">Attendance Rate</th>
              </tr>
            </thead>
            <tbody>
              {classStats.map((stat) => (
                <tr key={stat.class} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 font-medium">{stat.class}</td>
                  <td className="py-3 px-4 text-right">{stat.present}</td>
                  <td className="py-3 px-4 text-right">{stat.absent}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${getRateColor(stat.rate)}`}>
                    {stat.rate.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
