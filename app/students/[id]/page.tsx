import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ModernHeader } from "@/components/modern-header"
import { Phone, MessageCircle, Calendar, TrendingUp, TrendingDown } from "lucide-react"

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch student data
  const { data: student } = await supabase
    .from("user_registry")
    .select("*")
    .eq("user_id", params.id)
    .eq("person_type", "student")
    .single()
    .catch((error) => {
      console.error('Student fetch error:', error)
      return { data: null, error }
    })

  if (!student) {
    redirect("/admin/students")
  }

  // Fetch attendance summary
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: attendanceRecords } = await supabase
    .from("attendance_logs")
    .select("event_type, created_at, attendance_status")
    .eq("user_id", student.user_id)
    .eq("person_type", "student")
    .gte("created_at", thirtyDaysAgo.toISOString())

  const attendance = attendanceRecords || []
  const totalDays = attendance.filter(a => a.event_type === 'entry').length
  const lastAttendance = attendance.length > 0 ? new Date(attendance[0].created_at) : null
  const absentDays = 30 - totalDays

  // Mock academic data (replace with real data from your schema)
  const subjects = [
    { name: 'Mathematics', lastGrade: 'A', avgGrade: 'B+', improvement: 'Improved' },
    { name: 'English', lastGrade: 'B+', avgGrade: 'B', improvement: 'Stable' },
    { name: 'Science', lastGrade: 'C', avgGrade: 'A', improvement: 'Improved' },
    { name: 'Sports', lastGrade: 'A', avgGrade: 'A', improvement: 'Improved' },
  ]

  const grades = [
    { subject: 'Mathematics', grade: 160 },
    { subject: 'English', grade: 200 },
    { subject: 'Science', grade: 80 },
    { subject: 'P.T', grade: 70 },
    { subject: 'Sports', grade: 50 },
  ]

  const maxGrade = Math.max(...grades.map(g => g.grade))

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader 
        user={user} 
        title={`UNI - ${student.student_id}`} 
        subtitle="Student unique identifier" 
      />

      <main className="max-w-[1600px] mx-auto p-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-6">
            {/* Profile Photo */}
            {student.photo_url ? (
              <img
                src={student.photo_url}
                alt={student.full_name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                {student.full_name?.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{student.full_name}</h2>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">ID</p>
                  <p className="font-medium text-gray-900">{student.student_id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Number</p>
                  <p className="font-medium text-gray-900">+88 0163253425</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">student@email.com</p>
                </div>
                <div>
                  <p className="text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">245 Deo Street</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <MessageCircle className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Attendance Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalDays} Days</p>
                <p className="text-sm text-gray-600">Total Attendance</p>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {lastAttendance ? Math.floor((new Date().getTime() - lastAttendance.getTime()) / (1000 * 60 * 60 * 24)) : 0} Days
                </p>
                <p className="text-sm text-gray-600">Last Attendance</p>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{absentDays} Days</p>
                <p className="text-sm text-gray-600">Total Absent</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Academic Performance */}
          <div className="col-span-2 space-y-6">
            {/* Academic Performance Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Academic Performance</h3>
                <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                  <option>All</option>
                  <option>Past</option>
                  <option>Recent</option>
                </select>
              </div>

              {/* Bar Chart */}
              <div className="space-y-4">
                {grades.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700 w-24">{item.subject}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full flex items-center justify-end pr-3"
                        style={{ width: `${(item.grade / maxGrade) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">{item.grade} Grade</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grades & Assignments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Grades & Assignments Section</h3>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <span className="text-gray-600">⋯</span>
                  </button>
                </div>
              </div>

              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 text-sm font-semibold text-gray-700">Subject</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-700">Last Grade</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-700">Avg Grade</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-700">Improvement</th>
                    <th className="text-left py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subjects.map((subject, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-3 text-sm text-gray-900">{subject.name}</td>
                      <td className="py-3 text-sm font-medium text-gray-900">{subject.lastGrade}</td>
                      <td className="py-3 text-sm font-medium text-gray-900">{subject.avgGrade}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          subject.improvement === 'Improved' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {subject.improvement === 'Improved' && <TrendingUp className="w-3 h-3" />}
                          {subject.improvement}
                        </span>
                      </td>
                      <td className="py-3">
                        <button className="text-gray-400 hover:text-gray-600">⋯</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column - Recent Notice */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Notice</h3>
              
              <div className="space-y-4">
                {/* Notice Card */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src="https://ui-avatars.com/api/?name=Barney+Rojas&background=3B82F6&color=fff"
                      alt="Barney Rojas"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="font-semibold text-gray-900">Barney Rojas</p>
                          <p className="text-xs text-gray-500">English Teacher</p>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-700">+ Comment</button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Book Fair</p>
                    <p className="text-xs text-blue-700">
                      Your education path is an adventure filled with challenges, opportunities, and endless possibilities. Embrace each moment, stay focused...
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span className="text-green-600">👍</span> 10
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-red-600">❤️</span> 5
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>24 comments</span>
                      <div className="flex -space-x-2">
                        <img src="https://ui-avatars.com/api/?name=A&size=24" className="w-6 h-6 rounded-full border-2 border-white" alt="" />
                        <img src="https://ui-avatars.com/api/?name=B&size=24" className="w-6 h-6 rounded-full border-2 border-white" alt="" />
                        <img src="https://ui-avatars.com/api/?name=C&size=24" className="w-6 h-6 rounded-full border-2 border-white" alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
