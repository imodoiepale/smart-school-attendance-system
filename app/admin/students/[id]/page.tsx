import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Phone, MessageCircle, ChevronRight, Home, MapPin, Download, Eye, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StudentAttendanceTable } from "@/components/admin/student-attendance-table"

const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/auth/login")

    const { data: student } = await supabase
        .from("user_registry")
        .select("*")
        .eq("user_id", id)
        .eq("person_type", "student")
        .single()

    if (!student) redirect("/admin/students")

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Fetch ALL attendance_logs fields for comprehensive display
    const { data: attendanceLogs } = await supabase
        .from("attendance_logs")
        .select(`
            id,
            user_id,
            user_name,
            person_type,
            event_type,
            period_number,
            subject,
            camera_id,
            camera_name,
            camera_group,
            timestamp,
            log_date,
            attendance_status,
            confidence_score,
            capture_image_url,
            created_at
        `)
        .eq("user_id", student.user_id)
        .eq("person_type", "student")
        .gte("timestamp", thirtyDaysAgo.toISOString())
        .order("timestamp", { ascending: false })
        .limit(500)

    const logs = attendanceLogs || []
    const totalDays = new Set(logs.map(l => new Date(l.timestamp).toDateString())).size
    const presentCount = logs.filter(l => l.attendance_status === 'present' || l.attendance_status === 'on_time').length
    const lateCount = logs.filter(l => l.attendance_status?.includes('late')).length
    const lastAttendance = logs.length > 0 ? new Date(logs[0].timestamp) : null
    const onTimeRate = logs.length > 0 ? Math.round((presentCount / logs.length) * 100) : 0

    return (
        <div className="space-y-4">
            {/* Compact Breadcrumb */}
            <nav className="flex items-center gap-1 text-xs text-gray-500">
                <Link href="/admin/dashboard" className="hover:text-blue-600 flex items-center gap-1"><Home className="w-3 h-3" />Home</Link>
                <ChevronRight className="w-3 h-3" />
                <Link href="/admin/students" className="hover:text-blue-600">Students</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-900 font-medium">{student.full_name}</span>
            </nav>

            {/* Compact Header with Student Info + Inline Stats */}
            <div className="bg-white rounded-lg border shadow-sm p-4">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        {student.photo_url ? (
                            <img src={student.photo_url} alt={student.full_name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow">
                                {student.full_name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${student.current_status === 'on_campus' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">{student.full_name}</h1>
                                <p className="text-sm text-blue-600 font-medium">{student.user_id}</p>
                            </div>
                            <div className="flex gap-1.5">
                                <Button variant="outline" size="sm" className="h-7 w-7 p-0"><Phone className="w-3.5 h-3.5" /></Button>
                                <Button variant="outline" size="sm" className="h-7 w-7 p-0"><MessageCircle className="w-3.5 h-3.5" /></Button>
                            </div>
                        </div>

                        {/* Inline Info Row */}
                        <div className="flex flex-wrap gap-4 mt-2 text-xs">
                            <div><span className="text-gray-500">Class:</span> <span className="font-semibold text-gray-900">{student.class || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Stream:</span> <span className="font-semibold text-gray-900">{student.stream || 'N/A'}</span></div>
                            <div><span className="text-gray-500">House:</span> <span className="font-semibold text-gray-900">{student.house || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Parent:</span> <span className="font-semibold text-gray-900">{student.parent_phone || 'N/A'}</span></div>
                        </div>
                    </div>

                    {/* Inline Stats */}
                    <div className="hidden lg:flex gap-3 shrink-0">
                        <div className="text-center px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="text-lg font-bold text-blue-600">{totalDays}</div>
                            <div className="text-[10px] text-blue-600">Days Present</div>
                        </div>
                        <div className="text-center px-3 py-1.5 bg-green-50 rounded-lg border border-green-100">
                            <div className="text-lg font-bold text-green-600">{onTimeRate}%</div>
                            <div className="text-[10px] text-green-600">On Time</div>
                        </div>
                        <div className="text-center px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-100">
                            <div className="text-lg font-bold text-orange-600">{lateCount}</div>
                            <div className="text-[10px] text-orange-600">Late</div>
                        </div>
                    </div>
                </div>

                {/* Mobile Stats Row */}
                <div className="flex lg:hidden gap-2 mt-3 pt-3 border-t">
                    <div className="flex-1 text-center py-1.5 bg-blue-50 rounded border border-blue-100">
                        <div className="text-sm font-bold text-blue-600">{totalDays}</div>
                        <div className="text-[9px] text-blue-600">Days</div>
                    </div>
                    <div className="flex-1 text-center py-1.5 bg-green-50 rounded border border-green-100">
                        <div className="text-sm font-bold text-green-600">{onTimeRate}%</div>
                        <div className="text-[9px] text-green-600">On Time</div>
                    </div>
                    <div className="flex-1 text-center py-1.5 bg-orange-50 rounded border border-orange-100">
                        <div className="text-sm font-bold text-orange-600">{lateCount}</div>
                        <div className="text-[9px] text-orange-600">Late</div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                {/* Left: Attendance Logs (3 cols) */}
                <div className="xl:col-span-3">
                    <StudentAttendanceTable logs={logs} studentName={student.full_name} userId={student.user_id} pageSize={50} />
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4">
                    {/* Location & Status */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="py-2 px-3 border-b">
                            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                Location & Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-2">
                            <div className="p-2 bg-gray-50 rounded">
                                <div className="text-[10px] text-gray-500">Current Status</div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`w-2 h-2 rounded-full ${student.current_status === 'on_campus' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                    <span className="text-xs font-semibold">{student.current_status === 'on_campus' ? 'On Campus' : 'Off Campus'}</span>
                                </div>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                                <div className="text-[10px] text-gray-500">Last Location</div>
                                <div className="text-xs font-medium mt-0.5">{student.last_seen_camera || logs[0]?.camera_name || 'Main Gate'}</div>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                                <div className="text-[10px] text-gray-500">Last Seen</div>
                                <div className="text-xs font-medium mt-0.5">{lastAttendance ? `${formatDate(lastAttendance.toISOString())} ${formatTime(lastAttendance.toISOString())}` : 'N/A'}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Notices */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="py-2 px-3 border-b">
                            <CardTitle className="text-xs font-semibold">Recent Notices</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 space-y-2">
                            <div className="p-2 bg-blue-50 rounded border border-blue-100">
                                <div className="flex gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center shrink-0">
                                        <span className="text-[9px] font-bold text-blue-700">AD</span>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold">Admin Dept</p>
                                        <p className="text-[9px] text-gray-500">Yesterday, 10:00 AM</p>
                                        <p className="text-[10px] text-gray-600 mt-1">School will close early this Friday for staff development training. Pickup is at 1:00 PM.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2 bg-purple-50 rounded border border-purple-100">
                                <div className="flex gap-2">
                                    <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center shrink-0">
                                        <span className="text-[9px] font-bold text-purple-700">SC</span>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold">Science Club</p>
                                        <p className="text-[9px] text-gray-500">2 days ago</p>
                                        <p className="text-[10px] text-gray-600 mt-1">Science fair project submissions are due next Monday.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="py-2 px-3 border-b">
                            <CardTitle className="text-xs font-semibold">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 space-y-1.5">
                            <Button variant="outline" size="sm" className="w-full h-7 text-[10px] justify-start gap-2">
                                <Download className="w-3 h-3" /> Export Attendance
                            </Button>
                            <Button variant="outline" size="sm" className="w-full h-7 text-[10px] justify-start gap-2">
                                <Eye className="w-3 h-3" /> View Full History
                            </Button>
                            <Button variant="outline" size="sm" className="w-full h-7 text-[10px] justify-start gap-2">
                                <Filter className="w-3 h-3" /> Filter by Date
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
