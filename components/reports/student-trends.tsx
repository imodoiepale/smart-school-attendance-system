"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function StudentTrends() {
  const trendData = [
    { week: "Week 1", present: 93, absent: 4, late: 3 },
    { week: "Week 2", present: 94, absent: 3, late: 3 },
    { week: "Week 3", present: 92, absent: 5, late: 3 },
    { week: "Week 4", present: 95, absent: 2, late: 3 },
  ]

  return (
    <div className="space-y-6">
      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Attendance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[80, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="var(--color-chart-1)" name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Class 11A", rate: "97.87%", position: 1 },
              { name: "Class 12A", rate: "95.92%", position: 2 },
              { name: "Class 10B", rate: "95.56%", position: 3 },
              { name: "Class 10A", rate: "93.75%", position: 4 },
              { name: "Class 11B", rate: "91.67%", position: 5 },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {item.position}
                  </div>
                  <p className="font-medium">{item.name}</p>
                </div>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">{item.rate}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
