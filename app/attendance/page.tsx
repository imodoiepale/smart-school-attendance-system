import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, ChevronDown, Download, Search, Users, Clock, 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle,
  Filter, BarChart3, PieChart, MapPin, Camera, Eye, RefreshCw,
  ArrowUpRight, ArrowDownRight, CalendarDays, FileText, Utensils
} from "lucide-react"
import Link from "next/link"

export default async function AttendancePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

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

  // Fetch students with their attendance data
  const { data: students } = await supabase
    .from("user_registry")
    .select("id, user_id, full_name, photo_url, class, house, current_status, last_seen_camera")
    .eq("person_type", "student")
    .order("full_name")
    .limit(100)

  const studentsData = students || []

  // Fetch comprehensive attendance data with ALL fields including raw_payload
  const startDate = weekDates[0].toISOString()
  const endDate = new Date(weekDates[6])
  endDate.setHours(23, 59, 59)

  const { data: attendanceData } = await supabase
    .from("attendance_logs")
    .select(`
      id, user_id, user_name, person_type, event_type, period_number, subject,
      camera_id, camera_name, camera_group, timestamp, log_date,
      attendance_status, confidence_score, capture_image_url, raw_payload, created_at
    `)
    .eq("person_type", "student")
    .gte("created_at", startDate)
    .lte("created_at", endDate.toISOString())
    .order("created_at", { ascending: false })

  const attendance = attendanceData || []

  // Fetch today's attendance for real-time stats
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  
  const { data: todayAttendance } = await supabase
    .from("attendance_logs")
    .select(`
      id, user_id, user_name, event_type, timestamp, attendance_status, 
      camera_name, confidence_score, capture_image_url, raw_payload
    `)
    .eq("person_type", "student")
    .gte("created_at", todayStart.toISOString())
    .order("created_at", { ascending: false })

  const todayLogs = todayAttendance || []

  // Calculate comprehensive statistics
  const totalStudents = studentsData.length
  const onCampusNow = studentsData.filter(s => s.current_status === 'on_campus').length
  const offCampusNow = studentsData.filter(s => s.current_status === 'off_campus').length
  
  // Today's attendance breakdown
  const todayEntries = todayLogs.filter(l => l.event_type === 'entry').length
  const todayExits = todayLogs.filter(l => l.event_type === 'exit').length
  const todayMeals = todayLogs.filter(l => ['breakfast', 'lunch', 'supper'].includes(l.event_type)).length
  const todayClasses = todayLogs.filter(l => l.event_type === 'class').length
  
  // Status breakdown
  const onTimeCount = todayLogs.filter(l => l.attendance_status === 'on_time' || l.attendance_status === 'present').length
  const lateMinorCount = todayLogs.filter(l => l.attendance_status === 'late_minor').length
  const lateMajorCount = todayLogs.filter(l => l.attendance_status === 'late_major').length
  const veryLateCount = todayLogs.filter(l => l.attendance_status === 'very_late').length
  const absentCount = totalStudents - new Set(todayLogs.map(l => l.user_id)).size

  // Create attendance map for weekly view
  const attendanceMap = new Map()
  const studentDailyLogs = new Map()
  
  attendance.forEach((record: any) => {
    const date = new Date(record.timestamp || record.created_at)
    const dateKey = date.toDateString()
    const key = `${record.user_id}-${dateKey}`
    
    if (!attendanceMap.has(key)) {
      attendanceMap.set(key, {
        status: record.attendance_status || record.event_type,
        firstEntry: record.timestamp,
        events: []
      })
    }
    
    const existing = attendanceMap.get(key)
    existing.events.push(record)
    
    // Track daily logs per student
    if (!studentDailyLogs.has(record.user_id)) {
      studentDailyLogs.set(record.user_id, new Map())
    }
    const studentLogs = studentDailyLogs.get(record.user_id)
    if (!studentLogs.has(dateKey)) {
      studentLogs.set(dateKey, [])
    }
    studentLogs.get(dateKey).push(record)
  })

  const getAttendanceStatus = (studentId: string, date: Date) => {
    const key = `${studentId}-${date.toDateString()}`
    const data = attendanceMap.get(key)
    const day = date.getDay()
    
    if (day === 0 || day === 6) {
      return { type: 'weekend', label: 'Weekend', color: 'bg-gray-100 text-gray-500', icon: '📅' }
    }
    
    if (!data) {
      if (date > today) {
        return { type: 'future', label: '-', color: 'bg-gray-50 text-gray-400', icon: '' }
      }
      return { type: 'absent', label: 'Absent', color: 'bg-red-100 text-red-700', icon: '❌' }
    }
    
    const status = data.status
    const eventCount = data.events?.length || 0
    
    if (status === 'on_time' || status === 'present' || status === 'entry') {
      return { type: 'present', label: 'Present', color: 'bg-green-100 text-green-700', icon: '✅', count: eventCount }
    } else if (status === 'late_minor') {
      return { type: 'late_minor', label: 'Late (Minor)', color: 'bg-yellow-100 text-yellow-700', icon: '⚠️', count: eventCount }
    } else if (status === 'late_major' || status === 'very_late') {
      return { type: 'late_major', label: 'Late (Major)', color: 'bg-orange-100 text-orange-700', icon: '🔶', count: eventCount }
    }
    
    return { type: 'present', label: 'Present', color: 'bg-green-100 text-green-700', icon: '✅', count: eventCount }
  }

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { day: 'numeric' })
  const formatDay = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' })

  // Calculate weekly stats per student
  const getStudentWeeklyStats = (studentId: string) => {
    let present = 0, late = 0, absent = 0
    weekDates.forEach(date => {
      const day = date.getDay()
      if (day === 0 || day === 6 || date > today) return
      const status = getAttendanceStatus(studentId, date)
      if (status.type === 'present') present++
      else if (status.type.includes('late')) late++
      else if (status.type === 'absent') absent++
    })
    const total = present + late + absent
    return { present, late, absent, rate: total > 0 ? Math.round((present / total) * 100) : 0 }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Compact Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="max-w-[1920px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Attendance Reports</h1>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                Live
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search students..." className="pl-9 w-64 h-9" />
              </div>
              <div className="flex items-center gap-1 bg-gray-50 border rounded-lg px-2 py-1">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <Input type="date" defaultValue={today.toISOString().split('T')[0]} className="border-0 bg-transparent h-7 w-32 text-sm p-0" />
              </div>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="w-4 h-4 mr-1" /> Filters
              </Button>
              <Button variant="outline" size="sm" className="h-9">
                <Download className="w-4 h-4 mr-1" /> Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1920px] mx-auto p-4 space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-medium">Total Students</p>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs font-medium">On Campus</p>
                  <p className="text-2xl font-bold">{onCampusNow}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-xs font-medium">Late Today</p>
                  <p className="text-2xl font-bold">{lateMinorCount + lateMajorCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-xs font-medium">Absent</p>
                  <p className="text-2xl font-bold">{absentCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium">Entries Today</p>
                  <p className="text-2xl font-bold text-gray-900">{todayEntries}</p>
                </div>
                <ArrowUpRight className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium">Exits Today</p>
                  <p className="text-2xl font-bold text-gray-900">{todayExits}</p>
                </div>
                <ArrowDownRight className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium">Meals Served</p>
                  <p className="text-2xl font-bold text-gray-900">{todayMeals}</p>
                </div>
                <Utensils className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium">Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{todayClasses}</p>
                </div>
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="bg-white border shadow-sm h-10">
            <TabsTrigger value="weekly" className="text-sm"><Calendar className="w-4 h-4 mr-1.5" />Weekly View</TabsTrigger>
            <TabsTrigger value="daily" className="text-sm"><Clock className="w-4 h-4 mr-1.5" />Today's Log</TabsTrigger>
            <TabsTrigger value="analytics" className="text-sm"><BarChart3 className="w-4 h-4 mr-1.5" />Analytics</TabsTrigger>
            <TabsTrigger value="alerts" className="text-sm"><AlertTriangle className="w-4 h-4 mr-1.5" />Alerts</TabsTrigger>
          </TabsList>

          {/* Weekly View Tab */}
          <TabsContent value="weekly" className="mt-4">
            <Card className="shadow-lg">
              <CardHeader className="pb-3 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Weekly Attendance Matrix
                    <Badge variant="secondary" className="ml-2">
                      {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500"></span> Present</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500"></span> Late (Minor)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500"></span> Late (Major)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500"></span> Absent</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-300"></span> Weekend</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 w-8">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 min-w-[200px]">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Form</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Status</th>
                        {weekDates.map((date, idx) => (
                          <th key={idx} className="px-2 py-3 text-center min-w-[70px]">
                            <div className={`text-xs font-bold ${date.toDateString() === today.toDateString() ? 'text-blue-600' : 'text-gray-700'}`}>
                              {formatDay(date)}
                            </div>
                            <div className={`text-sm font-semibold ${date.toDateString() === today.toDateString() ? 'text-blue-600' : 'text-gray-900'}`}>
                              {formatDate(date)}
                            </div>
                          </th>
                        ))}
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Week %</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {studentsData.map((student, idx) => {
                        const weekStats = getStudentWeeklyStats(student.user_id)
                        return (
                          <tr key={student.user_id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-4 py-2 text-xs text-gray-500">{idx + 1}</td>
                            <td className="px-4 py-2">
                              <Link href={`/admin/students/${student.user_id}`} className="flex items-center gap-3 group">
                                {student.photo_url ? (
                                  <img src={student.photo_url} alt="" className="w-8 h-8 rounded-full object-cover border" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                    {student.full_name?.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-sm text-gray-900 group-hover:text-blue-600">{student.full_name}</p>
                                  <p className="text-xs text-gray-500">{student.user_id}</p>
                                </div>
                              </Link>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">{student.class || '-'}</td>
                            <td className="px-4 py-2 text-center">
                              <Badge variant={student.current_status === 'on_campus' ? 'default' : 'secondary'} className="text-xs">
                                {student.current_status === 'on_campus' ? '🟢 Live' : '⚪ Off'}
                              </Badge>
                            </td>
                            {weekDates.map((date, dateIdx) => {
                              const status = getAttendanceStatus(student.user_id, date)
                              return (
                                <td key={dateIdx} className="px-1 py-2">
                                  <div className={`text-center text-xs px-1 py-1.5 rounded ${status.color} cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all`} title={status.label}>
                                    <span>{status.icon}</span>
                                    {status.count && status.count > 1 && (
                                      <span className="ml-0.5 text-[10px] opacity-70">({status.count})</span>
                                    )}
                                  </div>
                                </td>
                              )
                            })}
                            <td className="px-4 py-2 text-center">
                              <div className={`text-sm font-bold ${weekStats.rate >= 90 ? 'text-green-600' : weekStats.rate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {weekStats.rate}%
                              </div>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {student.last_seen_camera || '-'}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Today's Log Tab */}
          <TabsContent value="daily" className="mt-4">
            <Card className="shadow-lg">
              <CardHeader className="pb-3 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Today's Attendance Log
                    <Badge variant="outline" className="ml-2">{todayLogs.length} events</Badge>
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Event</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Camera</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Confidence</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {todayLogs.slice(0, 50).map((log: any, idx: number) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-xs text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {log.capture_image_url ? (
                                <img src={log.capture_image_url} alt="" className="w-8 h-8 rounded-full object-cover border" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                                  {log.user_name?.charAt(0)}
                                </div>
                              )}
                              <span className="text-sm font-medium">{log.user_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-xs ${
                              log.event_type === 'entry' ? 'bg-green-50 text-green-700 border-green-200' :
                              log.event_type === 'exit' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              log.event_type === 'breakfast' || log.event_type === 'lunch' || log.event_type === 'supper' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {log.event_type === 'entry' ? '↗️' : log.event_type === 'exit' ? '↙️' : '📍'} {log.event_type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Camera className="w-3 h-3" />
                              {log.camera_name || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {log.confidence_score && (
                              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                log.confidence_score >= 80 ? 'bg-green-100 text-green-700' :
                                log.confidence_score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {log.confidence_score}%
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={
                              log.attendance_status === 'on_time' || log.attendance_status === 'present' ? 'default' :
                              log.attendance_status?.includes('late') ? 'secondary' : 'destructive'
                            } className="text-xs">
                              {log.attendance_status || '-'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="shadow-lg">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-600" />
                    Attendance Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-8">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#22C55E" strokeWidth="12" 
                          strokeDasharray={`${(onTimeCount / Math.max(todayLogs.length, 1)) * 251} 251`} />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#EAB308" strokeWidth="12" 
                          strokeDasharray={`${((lateMinorCount + lateMajorCount) / Math.max(todayLogs.length, 1)) * 251} 251`}
                          strokeDashoffset={`-${(onTimeCount / Math.max(todayLogs.length, 1)) * 251}`} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{totalStudents > 0 ? Math.round((onCampusNow / totalStudents) * 100) : 0}%</p>
                          <p className="text-xs text-gray-500">Present</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded bg-green-500"></div>
                        <span className="text-sm">On Time: {onTimeCount}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded bg-yellow-500"></div>
                        <span className="text-sm">Late (Minor): {lateMinorCount}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded bg-orange-500"></div>
                        <span className="text-sm">Late (Major): {lateMajorCount + veryLateCount}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded bg-red-500"></div>
                        <span className="text-sm">Absent: {absentCount}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Event Type Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Entry Events</span>
                        <span className="font-medium">{todayEntries}</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${(todayEntries / Math.max(todayLogs.length, 1)) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Exit Events</span>
                        <span className="font-medium">{todayExits}</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(todayExits / Math.max(todayLogs.length, 1)) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Meal Events</span>
                        <span className="font-medium">{todayMeals}</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(todayMeals / Math.max(todayLogs.length, 1)) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Class Events</span>
                        <span className="font-medium">{todayClasses}</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(todayClasses / Math.max(todayLogs.length, 1)) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-4">
            <Card className="shadow-lg">
              <CardHeader className="pb-3 border-b bg-red-50">
                <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  Attendance Alerts & Anomalies
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {absentCount > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <XCircle className="w-6 h-6 text-red-600" />
                        <div>
                          <p className="font-medium text-red-800">High Absence Alert</p>
                          <p className="text-sm text-red-600">{absentCount} students have not been detected today</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {(lateMajorCount + veryLateCount) > 5 && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-orange-600" />
                        <div>
                          <p className="font-medium text-orange-800">Punctuality Warning</p>
                          <p className="text-sm text-orange-600">{lateMajorCount + veryLateCount} students arrived significantly late today</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {absentCount === 0 && (lateMajorCount + veryLateCount) <= 5 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">All Clear</p>
                          <p className="text-sm text-green-600">No significant attendance issues detected today</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
