import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Clock } from "lucide-react"
import { CreateTimetableModal } from "@/components/admin/CreateTimetableModal"

async function TimetableList() {
  const supabase = await createClient()

  const { data: templates } = await supabase
    .from('timetable_template')
    .select('*')
    .order('day_of_week')
    .order('start_time')

  if (!templates?.length) {
    return <p className="text-muted-foreground">No timetable templates found. Create one to get started.</p>
  }

  // Group by day for display
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5].map(dayNum => {
        const dayTemplates = templates.filter(t => t.day_of_week === dayNum)
        if (!dayTemplates.length) return null

        return (
          <div key={dayNum} className="space-y-3 border p-4 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">{days[dayNum - 1]}</h3>
            <div className="space-y-2">
              {dayTemplates.map((t) => (
                <div key={t.id} className="flex justify-between text-sm p-2 bg-slate-50 rounded">
                  <div className="flex flex-col">
                    <span className="font-medium">{t.period_name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{t.period_type}</span>
                  </div>
                  <span className="text-gray-600">{t.start_time.slice(0, 5)} - {t.end_time.slice(0, 5)}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}


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
        <CreateTimetableModal />
      </div>

      {/* Default School Schedule Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Active Timetable Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <TimetableList />
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
