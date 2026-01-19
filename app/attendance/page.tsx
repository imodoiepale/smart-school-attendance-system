import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ModernHeader } from "@/components/modern-header"
import { Calendar, ChevronDown, Edit, Trash2 } from "lucide-react"

export default async function AttendancePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch students with their attendance for the week
  const { data: students } = await supabase
    .from("user_registry")
    .select("id, user_id, full_name, photo_url, class")
    .eq("person_type", "student")
    .order("full_name")
    .limit(50)

  const studentsData = students || []

  // Get current week dates
  const today = new Date()
  const currentDay = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1))

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return date
  })

  // Fetch attendance for the week
  const startDate = weekDates[0].toISOString()
  const endDate = new Date(weekDates[6])
  endDate.setHours(23, 59, 59)

  // Fetch attendance data for the selected week from attendance_logs
  const { data: attendanceData } = await supabase
    .from("attendance_logs")
    .select(`
      id,
      user_id,
      user_name,
      event_type,
      timestamp,
      created_at,
      attendance_status,
      capture_image_url
    `)
    .eq("person_type", "student")
    .gte("created_at", startDate)
    .lte("created_at", endDate.toISOString())
    .order("created_at", { ascending: false })

  const attendance = attendanceData || []

  // Get unique students from attendance_logs
  const studentMap = new Map()
  attendanceData?.forEach((record: any) => {
    if (record.user_id && !studentMap.has(record.user_id)) {
      studentMap.set(record.user_id, {
        student_id: record.user_id,
        full_name: record.user_name,
        photo_url: record.capture_image_url,
      })
    }
  })

  // Create attendance map for status lookup
  const attendanceMap = new Map()
  attendanceData?.forEach((record: any) => {
    const date = new Date(record.timestamp || record.created_at)
    const key = `${record.user_id}-${date.toDateString()}`
    attendanceMap.set(key, record.attendance_status || record.event_type)
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { day: 'numeric' })
  }

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const getAttendanceStatus = (studentId: string, date: Date) => {
    const key = `${studentId}-${date.toDateString()}`
    const status = attendanceMap.get(key)
    
    // Check if it's a weekend
    const day = date.getDay()
    if (day === 0 || day === 6) {
      return { type: 'holiday', label: 'Holiday', color: 'bg-purple-50 text-purple-700' }
    }

    if (status === 'entry') {
      return { type: 'present', label: 'On time', color: 'text-gray-700' }
    } else if (status === 'exit') {
      return { type: 'late', label: 'Late', color: 'bg-yellow-50 text-yellow-700', detail: '(9:42 Jan)' }
    } else {
      return { type: 'absent', label: 'Absent', color: 'bg-red-50 text-red-700', detail: '(Health Problem)' }
    }
  }

  const stats = {
    holiday: 0,
    onTime: 0,
    late: 0,
    absent: 0,
  }

  studentsData.forEach(student => {
    weekDates.forEach(date => {
      const status = getAttendanceStatus(student.id, date)
      if (status.type === 'holiday') stats.holiday++
      else if (status.type === 'present') stats.onTime++
      else if (status.type === 'late') stats.late++
      else if (status.type === 'absent') stats.absent++
    })
  })

  const total = stats.onTime + stats.late + stats.absent
  const onTimePercent = total > 0 ? Math.round((stats.onTime / total) * 100) : 0
  const latePercent = total > 0 ? Math.round((stats.late / total) * 100) : 0
  const absentPercent = total > 0 ? Math.round((stats.absent / total) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader user={user} title="Attendance" subtitle="Manage and view records" />

      <main className="max-w-[1600px] mx-auto p-6">
        {/* Controls Bar */}
        <div className="flex items-center justify-between mb-6">
          {/* Date Selector */}
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">
              {weekDates[0].toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - {weekDates[6].toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </button>

          {/* Filter Dropdown */}
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-sm text-gray-700">September</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {/* Legend */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-gray-600">Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">On time {onTimePercent}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600">Late {latePercent}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">Absent {absentPercent}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Edit className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Trash2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Student Profile
                  </th>
                  {weekDates.map((date, idx) => (
                    <th key={idx} className="px-4 py-4 text-center min-w-[100px]">
                      <div className="text-sm font-semibold text-gray-900">{formatDate(date)}</div>
                      <div className="text-xs text-gray-500">{formatDay(date)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {studentsData.map((student) => (
                  <tr key={student.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {student.photo_url ? (
                          <img
                            src={student.photo_url}
                            alt={student.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {student.full_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{student.full_name}</p>
                          <p className="text-xs text-gray-500">{student.class}</p>
                        </div>
                      </div>
                    </td>
                    {weekDates.map((date, idx) => {
                      const status = getAttendanceStatus(student.user_id, date)
                      return (
                        <td key={idx} className="px-4 py-4">
                          <div className={`text-center text-sm px-3 py-2 rounded ${status.color}`}>
                            <div className="font-medium">{status.label}</div>
                            {status.detail && (
                              <div className="text-xs mt-0.5">{status.detail}</div>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Add Section */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {studentsData.length} students
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            + Add Student
          </button>
        </div>
      </main>
    </div>
  )
}
