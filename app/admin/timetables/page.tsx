import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Clock } from "lucide-react"

export default async function TimetableManagement() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get unique classes from students
  const { data: students } = await supabase
    .from("students")
    .select("class")
    .order("class")

  const classes = [...new Set((students || []).map((s) => s.class).filter(Boolean))]

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Timetable & Schedule Management</h1>
          <p className="text-gray-600 mt-2">Configure class schedules and period times</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Timetable
        </Button>
      </div>

      {/* Default School Schedule Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Daily School Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-gray-900">Morning Sessions</h3>
              <div className="space-y-2">
                {[
                  { name: "Assembly", time: "08:00 - 08:15" },
                  { name: "Period 1", time: "08:15 - 09:00" },
                  { name: "Period 2", time: "09:00 - 09:45" },
                  { name: "Break", time: "09:45 - 10:00" },
                  { name: "Period 3", time: "10:00 - 10:45" },
                ].map((period) => (
                  <div key={period.name} className="flex justify-between p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border border-blue-100">
                    <span className="font-medium text-gray-700">{period.name}</span>
                    <span className="text-gray-600">{period.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-gray-900">Afternoon Sessions</h3>
              <div className="space-y-2">
                {[
                  { name: "Lunch", time: "10:45 - 11:30" },
                  { name: "Period 4", time: "11:30 - 12:15" },
                  { name: "Period 5", time: "12:15 - 13:00" },
                  { name: "Period 6", time: "13:00 - 13:45" },
                  { name: "Dismissal", time: "13:45 - 14:00" },
                ].map((period) => (
                  <div key={period.name} className="flex justify-between p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg border border-purple-100">
                    <span className="font-medium text-gray-700">{period.name}</span>
                    <span className="text-gray-600">{period.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Classes</CardTitle>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No classes configured yet</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {classes.map((cls) => (
                <div key={cls} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <p className="font-semibold text-gray-900">Class {cls}</p>
                  <p className="text-sm text-gray-500 mt-1">Manage timetable</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
