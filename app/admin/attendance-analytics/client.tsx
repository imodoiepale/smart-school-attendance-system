"use client"

import { useState, useMemo, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, GraduationCap, Camera, CalendarDays, Utensils, TrendingUp,
  Search, ChevronRight, Clock, MapPin, Plus, Filter, ArrowUpDown,
  ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle, BarChart3
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts"

import { 
  AttendanceLog, Student, Camera as CameraType, Event, DateRange, ActiveSection,
  FORM_STRUCTURE, formatTime, formatDate, formatShortDate
} from "./types"
import { 
  DateFilter, 
  AttendanceLogDetailDialog, 
  CreateEventDialog, 
  AttendanceLogTable,
  EventFormData 
} from "./components"

interface AttendanceAnalyticsClientProps {
  students: Student[]
  todayAttendance: AttendanceLog[]
  weekAttendance: AttendanceLog[]
  cameras: CameraType[]
  events: Event[]
}

export function AttendanceAnalyticsClient({ 
  students, 
  todayAttendance, 
  weekAttendance, 
  cameras, 
  events: initialEvents 
}: AttendanceAnalyticsClientProps) {
  const supabase = createClient()
  
  // Debug: Log when component mounts
  useEffect(() => {
    console.log('🚀 AttendanceAnalyticsClient MOUNTED')
    console.log('📊 Initial data:', { 
      students: students.length, 
      todayAttendance: todayAttendance.length,
      cameras: cameras.length 
    })
  }, [])
  
  // Section state
  const [activeSection, setActiveSection] = useState<ActiveSection>('students')
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedForm, setSelectedForm] = useState<string>('all')
  const [selectedSubLevel, setSelectedSubLevel] = useState<string>('all')
  const [selectedCamera, setSelectedCamera] = useState<string>('all')
  const [selectedCameraGroup, setSelectedCameraGroup] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null })
  
  // Dialog states
  const [selectedLog, setSelectedLog] = useState<AttendanceLog | null>(null)
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [isLogLoading, setIsLogLoading] = useState(false)
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  
  // Sidebar collapsible states
  const [formsExpanded, setFormsExpanded] = useState(true)
  const [camerasExpanded, setCamerasExpanded] = useState(false)
  const [locationsExpanded, setLocationsExpanded] = useState(false)
  
  // Sidebar search
  const [sidebarSearch, setSidebarSearch] = useState('')
  
  // Selected location
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  
  // Data states
  const [filteredLogs, setFilteredLogs] = useState<AttendanceLog[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [events, setEvents] = useState(initialEvents)
  const [realtimeAttendance, setRealtimeAttendance] = useState(todayAttendance)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)

  // Derived data - group cameras by camera_group, location_tag, or display_name pattern
  const cameraGroups = useMemo(() => {
    const groups: Record<string, CameraType[]> = {}
    cameras.forEach(camera => {
      // Use camera_group first, then location_tag, then extract from display_name
      let group = camera.camera_group || camera.location_tag
      
      // Normalize group name: "form4A" -> "Form 4A", "CLASS 4A" -> "Form 4A"
      if (group) {
        const nameMatch = group.match(/(?:form|class)\s*(\d+)\s*([A-Z])?/i)
        if (nameMatch) {
          group = `Form ${nameMatch[1]}${nameMatch[2] || ''}`
        }
      } else if (camera.display_name) {
        // Extract from display_name if no group
        const nameMatch = camera.display_name.match(/(?:form|class)\s*(\d+)\s*([A-Z])?/i)
        if (nameMatch) {
          group = `Form ${nameMatch[1]}${nameMatch[2] || ''}`
        } else {
          group = 'Other'
        }
      } else {
        group = 'Other'
      }
      
      if (!groups[group]) groups[group] = []
      groups[group].push(camera)
    })
    return Object.entries(groups).map(([name, cams]) => ({ name, cameras: cams }))
  }, [cameras])

  const availableSubLevels = useMemo(() => {
    if (selectedForm === 'all') return []
    const formData = FORM_STRUCTURE.find(f => f.form === selectedForm)
    return formData?.subLevels || []
  }, [selectedForm])

  // Stats calculations - USE REALTIME DATA
  const stats = useMemo(() => {
    const presentToday = realtimeAttendance.filter(a => a.attendance_status === 'present' || a.attendance_status === 'on_time').length
    const uniqueStudentsToday = new Set(realtimeAttendance.map(a => a.user_id)).size
    const lateToday = realtimeAttendance.filter(a => a.attendance_status?.includes('late')).length
    
    return {
      totalStudents: students.length,
      presentToday,
      uniqueStudentsToday,
      lateToday,
      absentToday: students.length - uniqueStudentsToday,
      attendanceRate: students.length > 0 ? ((uniqueStudentsToday / students.length) * 100).toFixed(1) : '0',
      totalCameras: cameras.length,
      activeCameras: cameras.filter(c => c.status === 'active').length,
      totalEvents: events.length,
      upcomingEvents: events.filter(e => new Date(e.start_date) >= new Date()).length,
    }
  }, [students, realtimeAttendance, cameras, events])

  // Chart data
  const weeklyChartData = useMemo(() => {
    const days: Record<string, { present: number; late: number; absent: number }> = {}
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    weekAttendance.forEach(log => {
      const date = new Date(log.timestamp)
      const dayName = dayNames[date.getDay()]
      if (!days[dayName]) days[dayName] = { present: 0, late: 0, absent: 0 }
      
      if (log.attendance_status === 'present' || log.attendance_status === 'on_time') {
        days[dayName].present++
      } else if (log.attendance_status?.includes('late')) {
        days[dayName].late++
      }
    })
    
    return dayNames.map(day => ({
      name: day,
      present: days[day]?.present || 0,
      late: days[day]?.late || 0,
    }))
  }, [weekAttendance])

  const mealChartData = useMemo(() => {
    const meals = { breakfast: 0, lunch: 0, supper: 0 }
    realtimeAttendance.forEach(log => {
      if (log.event_type === 'breakfast') meals.breakfast++
      if (log.event_type === 'lunch') meals.lunch++
      if (log.event_type === 'supper') meals.supper++
    })
    return [
      { name: 'Breakfast', value: meals.breakfast, color: '#f59e0b' },
      { name: 'Lunch', value: meals.lunch, color: '#10b981' },
      { name: 'Supper', value: meals.supper, color: '#8b5cf6' },
    ]
  }, [realtimeAttendance])

  // Form stats with sub-levels - USE REALTIME DATA
  const formStats = useMemo(() => {
    return FORM_STRUCTURE.map(form => {
      const formStudents = students.filter(s => s.form === form.form)
      const formPresentIds = new Set(
        realtimeAttendance
          .filter(l => {
            const student = students.find(s => s.user_id === l.user_id)
            return student?.form === form.form
          })
          .map(l => l.user_id)
      )
      
      const subLevelStats = form.subLevels.map(sl => {
        const slStudents = formStudents.filter(s => s.class_name === sl)
        const slPresentIds = new Set(
          realtimeAttendance
            .filter(l => {
              const student = students.find(s => s.user_id === l.user_id)
              return student?.form === form.form && student?.class_name === sl
            })
            .map(l => l.user_id)
        )
        return {
          name: sl,
          total: slStudents.length,
          present: slPresentIds.size,
          absent: slStudents.length - slPresentIds.size,
        }
      })
      
      return {
        form: form.form,
        total: formStudents.length,
        present: formPresentIds.size,
        absent: formStudents.length - formPresentIds.size,
        subLevels: subLevelStats,
      }
    })
  }, [students, realtimeAttendance])

  // Camera group stats - USE REALTIME DATA
  const cameraGroupStats = useMemo(() => {
    return cameraGroups.map(group => {
      const groupLogs = realtimeAttendance.filter(l => 
        group.cameras.some(c => c.camera_id === l.camera_id)
      )
      return {
        name: group.name,
        cameras: group.cameras,
        totalLogs: groupLogs.length,
        activeCameras: group.cameras.filter(c => c.status === 'active').length,
      }
    })
  }, [cameraGroups, realtimeAttendance])

  // Location stats (derived from camera location_tag) - USE REALTIME DATA
  const locationStats = useMemo(() => {
    const locations: Record<string, { cameras: CameraType[], logs: number }> = {}
    cameras.forEach(camera => {
      const loc = camera.location_tag || 'Unknown'
      if (!locations[loc]) locations[loc] = { cameras: [], logs: 0 }
      locations[loc].cameras.push(camera)
      locations[loc].logs += realtimeAttendance.filter(l => l.camera_id === camera.camera_id).length
    })
    return Object.entries(locations).map(([name, data]) => ({
      name,
      cameras: data.cameras,
      totalLogs: data.logs,
    }))
  }, [cameras, realtimeAttendance])

  // Filtered sidebar items based on search
  const filteredFormStats = useMemo(() => {
    if (!sidebarSearch) return formStats
    const search = sidebarSearch.toLowerCase()
    return formStats.filter(f => 
      f.form.toLowerCase().includes(search) ||
      f.subLevels.some(sl => sl.name.toLowerCase().includes(search))
    )
  }, [formStats, sidebarSearch])

  const filteredCameraGroups = useMemo(() => {
    if (!sidebarSearch) return cameraGroupStats
    const search = sidebarSearch.toLowerCase()
    return cameraGroupStats.filter(g => 
      g.name.toLowerCase().includes(search) ||
      g.cameras.some(c => c.display_name.toLowerCase().includes(search))
    )
  }, [cameraGroupStats, sidebarSearch])

  const filteredLocations = useMemo(() => {
    if (!sidebarSearch) return locationStats
    const search = sidebarSearch.toLowerCase()
    return locationStats.filter(l => 
      l.name.toLowerCase().includes(search) ||
      l.cameras.some(c => c.display_name.toLowerCase().includes(search))
    )
  }, [locationStats, sidebarSearch])

  // Fetch filtered logs based on current filters
  const fetchFilteredLogs = async (options?: { 
    camera?: string, 
    cameraGroup?: string, 
    location?: string,
    form?: string,
    subLevel?: string 
  }) => {
    setIsLoadingLogs(true)
    try {
      let query = supabase
        .from('attendance_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(500)

      // Date range filter - use log_date for date-only filtering, timestamp for datetime
      if (dateRange.from) {
        const startDate = new Date(dateRange.from)
        startDate.setHours(0, 0, 0, 0)
        query = query.gte('timestamp', startDate.toISOString())
      }
      if (dateRange.to) {
        const endDate = new Date(dateRange.to)
        endDate.setHours(23, 59, 59, 999)
        query = query.lte('timestamp', endDate.toISOString())
      }
      
      // Camera filter
      const cam = options?.camera ?? selectedCamera
      if (cam !== 'all') {
        console.log('Filtering by camera_id:', cam)
        query = query.eq('camera_id', cam)
      }
      
      // Camera group filter - also check camera_name for matches like "form4A"
      const camGroup = options?.cameraGroup ?? selectedCameraGroup
      if (camGroup !== 'all') {
        console.log('Filtering by camera group:', camGroup)
        // Normalize the group for matching: "Form 4A" -> "form4a" pattern
        const groupPattern = camGroup.toLowerCase().replace(/\s+/g, '')
        console.log('Group pattern:', groupPattern)
        // Try both camera_group and camera_name fields with pattern matching
        query = query.or(`camera_group.ilike.%${groupPattern}%,camera_name.ilike.%${groupPattern}%`)
      }
      
      // Status filter
      if (selectedStatus !== 'all') {
        query = query.eq('attendance_status', selectedStatus)
      }

      console.log('Fetching logs with filters:', { cam, camGroup, dateRange, selectedStatus })
      const { data, error } = await query
      
      if (error) {
        console.error('Supabase query error:', error)
      }
      
      console.log(`Fetched ${data?.length || 0} logs from database`)
      
      if (data && !error) {
        let logs = data as AttendanceLog[]
        console.log('Sample log:', logs[0])
        
        // Filter by location (camera location_tag)
        const loc = options?.location ?? selectedLocation
        if (loc !== 'all') {
          const locationCameras = cameras.filter(c => c.location_tag === loc).map(c => c.camera_id)
          logs = logs.filter(l => locationCameras.includes(l.camera_id))
        }
        
        // Filter by form/subLevel - handle both "Form 1" and "form4A" style names
        const form = options?.form ?? selectedForm
        const subLevel = options?.subLevel ?? selectedSubLevel
        if (form !== 'all') {
          // First try matching by student form
          const formStudentIds = students
            .filter(s => s.form === form && (subLevel === 'all' || s.class_name === subLevel))
            .map(s => s.user_id)
          
          // Also match by camera_name/camera_group containing form identifier
          const formPattern = form.toLowerCase().replace(/\s+/g, '')
          logs = logs.filter(l => {
            // Match by student
            if (formStudentIds.includes(l.user_id)) return true
            // Match by camera name (e.g., "form4A" matches "Form 4")
            const cameraName = (l.camera_name || '').toLowerCase().replace(/\s+/g, '')
            const cameraGroup = (l.camera_group || '').toLowerCase().replace(/\s+/g, '')
            return cameraName.includes(formPattern) || cameraGroup.includes(formPattern)
          })
        }
        
        setFilteredLogs(logs)
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  // Auto-fetch logs when section or filters change
  const handleSidebarClick = (section: ActiveSection, options?: any) => {
    setActiveSection(section)
    // Auto-fetch logs for the selected section
    setTimeout(() => fetchFilteredLogs(options), 100)
  }

  // Handle log click
  const handleLogClick = async (log: AttendanceLog) => {
    setSelectedLog(log)
    setIsLogDialogOpen(true)
    setIsLogLoading(true)

    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('id', log.id)
        .single()

      if (data && !error) {
        setSelectedLog(data as AttendanceLog)
      }
    } catch (err) {
      console.error('Failed to fetch log details:', err)
    } finally {
      setIsLogLoading(false)
    }
  }

  // Handle create event
  const handleCreateEvent = async (eventData: EventFormData) => {
    const { data, error } = await supabase
      .from('events')
      .insert([{
        name: eventData.name,
        description: eventData.description,
        event_type: eventData.event_type,
        start_date: eventData.start_date,
        end_date: eventData.end_date || null,
        start_time: eventData.start_time || null,
        end_time: eventData.end_time || null,
        location: eventData.location || null,
        is_active: true,
      }])
      .select()
      .single()

    if (data && !error) {
      setEvents(prev => [data as Event, ...prev])
    } else {
      throw error
    }
  }

  // Realtime subscription for attendance logs
  useEffect(() => {
    console.log('🔌 Setting up realtime subscription...')
    console.log('📊 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...')
    
    const channelName = `attendance-analytics-${Math.random().toString(36).substring(7)}`
    console.log('📡 Channel name:', channelName)
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance_logs'
        },
        (payload: any) => {
          console.log('🎉 REALTIME INSERT RECEIVED:', payload)
          const newLog = payload.new as AttendanceLog
          setRealtimeAttendance(prev => {
            console.log('📊 Updated realtimeAttendance count:', prev.length + 1)
            return [newLog, ...prev]
          })
          // Always add to filtered logs too
          setFilteredLogs(prev => [newLog, ...prev])
          console.log('📝 New attendance log:', newLog.id)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'attendance_logs'
        },
        (payload: any) => {
          const updatedLog = payload.new as AttendanceLog
          setRealtimeAttendance(prev => 
            prev.map(log => log.id === updatedLog.id ? updatedLog : log)
          )
          setFilteredLogs(prev => 
            prev.map(log => log.id === updatedLog.id ? updatedLog : log)
          )
          console.log('✏️ Attendance log updated:', updatedLog.id)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'attendance_logs'
        },
        (payload: any) => {
          const deletedLog = payload.old as AttendanceLog
          setRealtimeAttendance(prev => prev.filter(log => log.id !== deletedLog.id))
          setFilteredLogs(prev => prev.filter(log => log.id !== deletedLog.id))
          console.log('🗑️ Attendance log deleted:', deletedLog.id)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setEvents(prev => [payload.new as Event, ...prev])
            console.log('📅 New event created:', payload.new.name)
          } else if (payload.eventType === 'UPDATE') {
            setEvents(prev => prev.map(e => e.id === payload.new.id ? payload.new as Event : e))
            console.log('✏️ Event updated:', payload.new.name)
          } else if (payload.eventType === 'DELETE') {
            setEvents(prev => prev.filter(e => e.id !== payload.old.id))
            console.log('🗑️ Event deleted:', payload.old.id)
          }
        }
      )
      .subscribe((status: string, err?: Error) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED')
        console.log('📡 Attendance Analytics Realtime:', status)
        console.log('📡 Subscription Status Details:', {
          status,
          isSubscribed: status === 'SUBSCRIBED',
          timestamp: new Date().toISOString(),
          channelName
        })
        if (err) {
          console.error('❌ Subscription error:', err)
        }
        if (status === 'SUBSCRIBED') {
          console.log('✅ REALTIME FULLY CONNECTED - Waiting for events...')
          console.log('📋 Listening for: INSERT, UPDATE, DELETE on attendance_logs')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = !searchQuery || 
        student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admission_number?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesForm = selectedForm === 'all' || student.form === selectedForm
      const matchesSubLevel = selectedSubLevel === 'all' || student.class_name === selectedSubLevel
      
      return matchesSearch && matchesForm && matchesSubLevel
    })
  }, [students, searchQuery, selectedForm, selectedSubLevel])

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Debug Banner - Remove after testing */}
      <div className={`px-4 py-2 text-sm flex items-center justify-between ${isRealtimeConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="font-medium">
            Realtime: {isRealtimeConnected ? '✅ CONNECTED' : '❌ DISCONNECTED'}
          </span>
        </div>
        <div className="text-xs">
          Today's logs: {realtimeAttendance.length} | Students: {students.length}
        </div>
      </div>
      
      <div className="flex flex-1 gap-4 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 shrink-0 overflow-auto">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </div>
              {/* Realtime Indicator */}
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                <span className="text-[9px] text-gray-500">{isRealtimeConnected ? 'Live' : 'Offline'}</span>
              </div>
            </CardTitle>
            {/* Sidebar Search */}
            <div className="relative mt-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Quick search..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="pl-7 h-7 text-[11px]"
              />
            </div>
          </CardHeader>
          <CardContent className="p-2 space-y-1 flex-1 overflow-auto">
            {/* Students */}
            <button
              onClick={() => handleSidebarClick('students')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === 'students' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Students
              </div>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{stats.totalStudents}</Badge>
            </button>

            {/* Forms - Collapsible */}
            <Collapsible open={formsExpanded} onOpenChange={setFormsExpanded}>
              <CollapsibleTrigger asChild>
                <button
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === 'forms' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Forms & Streams
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{stats.totalStudents}</Badge>
                    {formsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-2 mt-1 space-y-1">
                {filteredFormStats.map(form => (
                  <Collapsible key={form.form}>
                    <CollapsibleTrigger asChild>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedForm(form.form); setSelectedSubLevel('all'); handleSidebarClick('forms', { form: form.form, subLevel: 'all' }) }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[11px] transition-colors ${
                          selectedForm === form.form && selectedSubLevel === 'all' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <ChevronRight className="w-3 h-3" />
                          <span className="font-medium">{form.form}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-green-600 font-semibold">{form.present}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-500">{form.total}</span>
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 mt-0.5 space-y-0.5">
                      {form.subLevels.map(sl => (
                        <button
                          key={sl.name}
                          onClick={() => { setSelectedForm(form.form); setSelectedSubLevel(sl.name); handleSidebarClick('forms', { form: form.form, subLevel: sl.name }) }}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded text-[10px] transition-colors ${
                            selectedForm === form.form && selectedSubLevel === sl.name ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span>{sl.name}</span>
                          <div className="flex items-center gap-1">
                            <span className={sl.present > 0 ? 'text-green-600' : 'text-gray-400'}>{sl.present}</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-400">{sl.total}</span>
                          </div>
                        </button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Locations - Collapsible */}
            <Collapsible open={locationsExpanded} onOpenChange={setLocationsExpanded}>
              <CollapsibleTrigger asChild>
                <button
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === 'cameras' && selectedLocation !== 'all' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Locations
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{locationStats.length}</Badge>
                    {locationsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-2 mt-1 space-y-1">
                {filteredLocations.map(loc => (
                  <Collapsible key={loc.name}>
                    <CollapsibleTrigger asChild>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedLocation(loc.name); setSelectedCamera('all'); handleSidebarClick('cameras', { location: loc.name }) }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[11px] transition-colors ${
                          selectedLocation === loc.name ? 'bg-purple-100 text-purple-800' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" />
                          <span className="font-medium truncate max-w-[120px]">{loc.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-purple-600 font-semibold">{loc.totalLogs}</span>
                          <span className="text-gray-400 text-[9px]">logs</span>
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 mt-0.5 space-y-0.5">
                      {loc.cameras.map((cam, idx) => {
                        const camLogs = realtimeAttendance.filter(l => l.camera_id === cam.camera_id).length
                        return (
                          <button
                            key={`${loc.name}-${cam.camera_id}-${idx}`}
                            onClick={() => { setSelectedLocation(loc.name); setSelectedCamera(cam.camera_id); handleSidebarClick('cameras', { location: loc.name, camera: cam.camera_id }) }}
                            className={`w-full flex items-center justify-between px-2 py-1 rounded text-[10px] transition-colors ${
                              selectedCamera === cam.camera_id ? 'bg-purple-100 text-purple-800' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <Camera className="w-2.5 h-2.5 text-gray-400" />
                              <span className="truncate max-w-[100px]">{cam.display_name}</span>
                            </div>
                            <span className="text-gray-400">{camLogs}</span>
                          </button>
                        )
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Cameras - Collapsible */}
            <Collapsible open={camerasExpanded} onOpenChange={setCamerasExpanded}>
              <CollapsibleTrigger asChild>
                <button
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === 'cameras' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Cameras
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{stats.totalCameras}</Badge>
                    {camerasExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-2 mt-1 space-y-1">
                {filteredCameraGroups.map(group => (
                  <Collapsible key={group.name}>
                    <CollapsibleTrigger asChild>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedCameraGroup(group.name); setSelectedCamera('all'); handleSidebarClick('cameras', { cameraGroup: group.name }) }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[11px] transition-colors ${
                          selectedCameraGroup === group.name ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <ChevronRight className="w-3 h-3" />
                          <span className="font-medium truncate max-w-[100px]">{group.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-blue-600 font-semibold">{group.totalLogs}</span>
                          <span className="text-gray-400 text-[9px]">logs</span>
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 mt-0.5 space-y-0.5">
                      {group.cameras.map((cam, idx) => {
                        const camLogs = realtimeAttendance.filter(l => l.camera_id === cam.camera_id).length
                        return (
                          <button
                            key={`${group.name}-${cam.camera_id}-${idx}`}
                            onClick={() => { setSelectedCameraGroup(group.name); setSelectedCamera(cam.camera_id); handleSidebarClick('cameras', { cameraGroup: group.name, camera: cam.camera_id }) }}
                            className={`w-full flex items-center justify-between px-2 py-1 rounded text-[10px] transition-colors ${
                              selectedCamera === cam.camera_id ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${cam.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <span className="truncate max-w-[90px]">{cam.display_name}</span>
                            </div>
                            <span className="text-gray-400">{camLogs}</span>
                          </button>
                        )
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Events */}
            <button
              onClick={() => handleSidebarClick('events')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === 'events' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Events
              </div>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{stats.totalEvents}</Badge>
            </button>

            {/* Meals */}
            <button
              onClick={() => handleSidebarClick('meals')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === 'meals' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                Meals
              </div>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{mealChartData.reduce((a, b) => a + b.value, 0)}</Badge>
            </button>

            {/* Trends */}
            <button
              onClick={() => handleSidebarClick('trends')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === 'trends' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trends
              </div>
            </button>

            {/* Quick Stats */}
            <div className="mt-3 pt-3 border-t space-y-2">
              <p className="text-[10px] font-semibold text-gray-500 uppercase px-2">Today's Overview</p>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-green-50 rounded-lg p-1.5 text-center">
                  <p className="text-base font-bold text-green-700">{stats.uniqueStudentsToday}</p>
                  <p className="text-[8px] text-green-600">Present</p>
                </div>
                <div className="bg-red-50 rounded-lg p-1.5 text-center">
                  <p className="text-base font-bold text-red-700">{stats.absentToday}</p>
                  <p className="text-[8px] text-red-600">Absent</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-1.5 text-center">
                  <p className="text-base font-bold text-yellow-700">{stats.lateToday}</p>
                  <p className="text-[8px] text-yellow-600">Late</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-1.5 text-center">
                  <p className="text-base font-bold text-blue-700">{stats.attendanceRate}%</p>
                  <p className="text-[8px] text-blue-600">Rate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Students Section */}
        {activeSection === 'students' && (
          <div className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                  <Select value={selectedForm} onValueChange={(v) => { setSelectedForm(v); setSelectedSubLevel('all') }}>
                    <SelectTrigger className="w-32 h-8 text-sm">
                      <SelectValue placeholder="Form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Forms</SelectItem>
                      {FORM_STRUCTURE.map(f => (
                        <SelectItem key={f.form} value={f.form}>{f.form}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableSubLevels.length > 0 && (
                    <Select value={selectedSubLevel} onValueChange={setSelectedSubLevel}>
                      <SelectTrigger className="w-24 h-8 text-sm">
                        <SelectValue placeholder="Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {availableSubLevels.map(sl => (
                          <SelectItem key={sl} value={sl}>{sl}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
                  <Button size="sm" className="h-8" onClick={() => fetchFilteredLogs()} disabled={isLoadingLogs}>
                    <Filter className="w-3 h-3 mr-1" />
                    Fetch Logs
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredStudents.slice(0, 50).map(student => {
                const studentLogs = realtimeAttendance.filter(l => l.user_id === student.user_id)
                const lastLog = studentLogs[0]
                const isPresent = studentLogs.length > 0
                
                return (
                  <Card key={student.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          {student.profile_image_url ? (
                            <img src={student.profile_image_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <Users className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{student.full_name}</p>
                          <p className="text-[10px] text-gray-500">{student.admission_number || 'No ID'}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {student.form && <Badge variant="outline" className="text-[9px] px-1 py-0">{student.form}</Badge>}
                            {student.class_name && <Badge variant="outline" className="text-[9px] px-1 py-0">{student.class_name}</Badge>}
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${isPresent ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </div>
                      {lastLog && (
                        <div className="mt-2 pt-2 border-t text-[10px] text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last seen: {formatTime(lastLog.timestamp)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            {filteredStudents.length > 50 && (
              <p className="text-center text-sm text-gray-500">Showing 50 of {filteredStudents.length} students</p>
            )}

            {/* Attendance Log Table for Students */}
            <AttendanceLogTable 
              logs={filteredLogs.length > 0 ? filteredLogs : (realtimeAttendance.length > 0 ? realtimeAttendance : weekAttendance).slice(0, 100)} 
              title={`Student Attendance Logs ${selectedForm !== 'all' ? `- ${selectedForm}` : ''} ${selectedSubLevel !== 'all' ? selectedSubLevel : ''}${realtimeAttendance.length === 0 && filteredLogs.length === 0 ? ' (Last 7 days)' : ''}`}
              onLogClick={handleLogClick}
              maxHeight="400px"
            />
          </div>
        )}

        {/* Forms Section */}
        {activeSection === 'forms' && (
          <div className="space-y-4">
            <Card>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <Select value={selectedForm} onValueChange={(v) => { setSelectedForm(v); setSelectedSubLevel('all') }}>
                    <SelectTrigger className="w-40 h-8 text-sm">
                      <SelectValue placeholder="Select Form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Forms</SelectItem>
                      {FORM_STRUCTURE.map(f => (
                        <SelectItem key={f.form} value={f.form}>{f.form}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableSubLevels.length > 0 && (
                    <Select value={selectedSubLevel} onValueChange={setSelectedSubLevel}>
                      <SelectTrigger className="w-32 h-8 text-sm">
                        <SelectValue placeholder="Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {availableSubLevels.map(sl => (
                          <SelectItem key={sl} value={sl}>{sl}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
                  <Button size="sm" className="h-8" onClick={() => fetchFilteredLogs()} disabled={isLoadingLogs}>
                    <Filter className="w-3 h-3 mr-1" />
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Form Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {FORM_STRUCTURE.map(form => {
                const formStudents = students.filter(s => s.form === form.form)
                const formLogs = realtimeAttendance.filter(l => {
                  const student = students.find(s => s.user_id === l.user_id)
                  return student?.form === form.form
                })
                const presentCount = new Set(formLogs.map(l => l.user_id)).size
                
                return (
                  <Card key={form.form} className={`cursor-pointer transition-all ${selectedForm === form.form ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
                    onClick={() => { setSelectedForm(form.form); setSelectedSubLevel('all') }}>
                    <CardHeader className="py-2 px-3 border-b">
                      <CardTitle className="text-sm font-semibold flex items-center justify-between">
                        <span>{form.form}</span>
                        <Badge variant="secondary" className="text-[10px]">{formStudents.length} students</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="text-lg font-bold text-green-700">{presentCount}</p>
                          <p className="text-[9px] text-green-600">Present</p>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded">
                          <p className="text-lg font-bold text-red-700">{formStudents.length - presentCount}</p>
                          <p className="text-[9px] text-red-600">Absent</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {form.subLevels.map(sl => (
                          <Badge 
                            key={sl} 
                            variant={selectedSubLevel === sl ? 'default' : 'outline'} 
                            className="text-[9px] px-1.5 py-0 cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); setSelectedForm(form.form); setSelectedSubLevel(sl) }}
                          >
                            {sl}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Attendance Logs Table - Always shown */}
            <AttendanceLogTable 
              logs={filteredLogs.length > 0 ? filteredLogs : (realtimeAttendance.length > 0 ? realtimeAttendance : weekAttendance).filter(l => {
                if (selectedForm === 'all') return true
                const student = students.find(s => s.user_id === l.user_id)
                if (!student) return false
                if (selectedSubLevel !== 'all') return student.form === selectedForm && student.class_name === selectedSubLevel
                return student.form === selectedForm
              }).slice(0, 100)} 
              title={`${selectedForm !== 'all' ? selectedForm : 'All Forms'} ${selectedSubLevel !== 'all' ? selectedSubLevel : ''} Attendance Logs${realtimeAttendance.length === 0 && filteredLogs.length === 0 ? ' (Last 7 days)' : ''}`}
              onLogClick={handleLogClick}
              maxHeight="400px"
            />
          </div>
        )}

        {/* Cameras Section */}
        {activeSection === 'cameras' && (
          <div className="space-y-4">
            <Card>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <Select value={selectedCameraGroup} onValueChange={setSelectedCameraGroup}>
                    <SelectTrigger className="w-48 h-8 text-sm">
                      <SelectValue placeholder="Camera Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Groups</SelectItem>
                      {cameraGroups.map(g => (
                        <SelectItem key={g.name} value={g.name}>{g.name} ({g.cameras.length})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                    <SelectTrigger className="w-48 h-8 text-sm">
                      <SelectValue placeholder="Select Camera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cameras</SelectItem>
                      {cameras
                        .filter(c => {
                          if (selectedCameraGroup === 'all') return true
                          
                          // Normalize both for comparison
                          const selectedPattern = selectedCameraGroup.toLowerCase().replace(/\s+/g, '')
                          
                          // Check camera_group
                          if (c.camera_group) {
                            const cameraGroupNorm = c.camera_group.toLowerCase().replace(/\s+/g, '')
                            if (cameraGroupNorm.includes(selectedPattern) || selectedPattern.includes(cameraGroupNorm)) return true
                          }
                          
                          // Check location_tag
                          if (c.location_tag) {
                            const locationNorm = c.location_tag.toLowerCase().replace(/\s+/g, '')
                            if (locationNorm.includes(selectedPattern) || selectedPattern.includes(locationNorm)) return true
                          }
                          
                          // Check display_name
                          if (c.display_name) {
                            const displayNorm = c.display_name.toLowerCase().replace(/\s+/g, '')
                            if (displayNorm.includes(selectedPattern) || selectedPattern.includes(displayNorm)) return true
                          }
                          
                          return false
                        })
                        .map((c, idx) => (
                          <SelectItem key={`select-${c.camera_id}-${idx}`} value={c.camera_id}>{c.display_name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
                  <Button size="sm" className="h-8" onClick={() => fetchFilteredLogs()} disabled={isLoadingLogs}>
                    <Filter className="w-3 h-3 mr-1" />
                    Fetch Logs
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Camera Groups */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {cameraGroups.map(group => (
                <Card key={group.name} className={`${selectedCameraGroup === group.name ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader className="py-2 px-3 border-b">
                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        {group.name}
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{group.cameras.length} cameras</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      {group.cameras.map(camera => {
                        const cameraLogs = realtimeAttendance.filter(l => l.camera_id === camera.camera_id)
                        const uniqueUsers = new Set(cameraLogs.map(l => l.user_id)).size
                        const lastLog = cameraLogs[0]
                        return (
                          <div 
                            key={camera.camera_id} 
                            className={`p-2 rounded-lg border cursor-pointer hover:bg-gray-50 ${selectedCamera === camera.camera_id ? 'bg-blue-50 border-blue-200' : ''}`}
                            onClick={() => { setSelectedCamera(camera.camera_id); fetchFilteredLogs({ camera: camera.camera_id }) }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Camera className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium">{camera.display_name}</p>
                                  <p className="text-[10px] text-gray-500">{camera.location_tag || camera.camera_id}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${camera.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-3">
                                <span className="text-gray-500"><span className="font-semibold text-blue-600">{cameraLogs.length}</span> logs</span>
                                <span className="text-gray-500"><span className="font-semibold text-green-600">{uniqueUsers}</span> users</span>
                              </div>
                              {lastLog && (
                                <span className="text-gray-400">Last: {formatTime(lastLog.timestamp)}</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Camera Logs Table - Always shown */}
            <AttendanceLogTable 
              logs={filteredLogs.length > 0 ? filteredLogs : (realtimeAttendance.length > 0 ? realtimeAttendance : weekAttendance).filter(l => {
                if (selectedCamera !== 'all') return l.camera_id === selectedCamera
                if (selectedCameraGroup !== 'all') {
                  const groupCameras = cameraGroups.find(g => g.name === selectedCameraGroup)?.cameras || []
                  return groupCameras.some(c => c.camera_id === l.camera_id)
                }
                if (selectedLocation !== 'all') {
                  const locCameras = cameras.filter(c => c.location_tag === selectedLocation)
                  return locCameras.some(c => c.camera_id === l.camera_id)
                }
                return true
              }).slice(0, 100)} 
              title={`Camera Logs ${selectedCamera !== 'all' ? `- ${cameras.find(c => c.camera_id === selectedCamera)?.display_name}` : selectedCameraGroup !== 'all' ? `- ${selectedCameraGroup}` : selectedLocation !== 'all' ? `- ${selectedLocation}` : ''}${realtimeAttendance.length === 0 && filteredLogs.length === 0 ? ' (Last 7 days)' : ''}`}
              onLogClick={handleLogClick}
              maxHeight="400px"
            />
          </div>
        )}

        {/* Events Section */}
        {activeSection === 'events' && (
          <div className="space-y-4">
            <Card>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
                  </div>
                  <Button size="sm" className="h-8" onClick={() => setIsCreateEventOpen(true)}>
                    <Plus className="w-3 h-3 mr-1" />
                    Create Event
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Events List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map(event => {
                const isUpcoming = new Date(event.start_date) >= new Date()
                const isPast = new Date(event.end_date || event.start_date) < new Date()
                
                return (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="py-2 px-3 border-b">
                      <CardTitle className="text-sm font-semibold flex items-center justify-between">
                        <span className="truncate">{event.name}</span>
                        <Badge variant={isUpcoming ? 'default' : isPast ? 'secondary' : 'outline'} className="text-[9px] shrink-0">
                          {isUpcoming ? 'Upcoming' : isPast ? 'Past' : 'Ongoing'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarDays className="w-4 h-4" />
                        <span>{formatDate(event.start_date)}</span>
                      </div>
                      {event.start_time && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{event.start_time} {event.end_time ? `- ${event.end_time}` : ''}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.description && (
                        <p className="text-[11px] text-gray-500 line-clamp-2">{event.description}</p>
                      )}
                      <Badge variant="outline" className="text-[9px]">{event.event_type}</Badge>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Meals Section */}
        {activeSection === 'meals' && (
          <div className="space-y-4">
            <Card>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
                  <Button size="sm" className="h-8" onClick={() => fetchFilteredLogs()} disabled={isLoadingLogs}>
                    <Filter className="w-3 h-3 mr-1" />
                    Fetch Meal Logs
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Meal Stats */}
            <div className="grid grid-cols-3 gap-4">
              {mealChartData.map(meal => (
                <Card key={meal.name}>
                  <CardContent className="p-4 text-center">
                    <Utensils className="w-8 h-8 mx-auto mb-2" style={{ color: meal.color }} />
                    <p className="text-2xl font-bold" style={{ color: meal.color }}>{meal.value}</p>
                    <p className="text-sm text-gray-600">{meal.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Meal Chart */}
            <Card>
              <CardHeader className="py-2 px-3 border-b">
                <CardTitle className="text-sm font-semibold">Today's Meal Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mealChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {mealChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Meal Logs - Always shown */}
            <AttendanceLogTable 
              logs={filteredLogs.length > 0 
                ? filteredLogs.filter(l => ['breakfast', 'lunch', 'supper'].includes(l.event_type))
                : (realtimeAttendance.length > 0 ? realtimeAttendance : weekAttendance).filter(l => ['breakfast', 'lunch', 'supper'].includes(l.event_type)).slice(0, 100)
              } 
              title={`Meal Attendance Logs${realtimeAttendance.length === 0 && filteredLogs.length === 0 ? ' (Last 7 days)' : ''}`}
              onLogClick={handleLogClick}
              maxHeight="400px"
            />
          </div>
        )}

        {/* Trends Section */}
        {activeSection === 'trends' && (
          <div className="space-y-4">
            <Card>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
                </div>
              </CardContent>
            </Card>

            {/* Weekly Trend Chart */}
            <Card>
              <CardHeader className="py-2 px-3 border-b">
                <CardTitle className="text-sm font-semibold">Weekly Attendance Trend</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="present" fill="#10b981" name="Present" />
                      <Bar dataKey="late" fill="#f59e0b" name="Late" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Rate Trend */}
            <Card>
              <CardHeader className="py-2 px-3 border-b">
                <CardTitle className="text-sm font-semibold">Attendance Rate Over Time</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="present" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Present" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold text-green-700">{stats.attendanceRate}%</p>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold text-blue-700">{stats.totalStudents}</p>
                  <p className="text-sm text-gray-600">Total Students</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold text-yellow-700">{stats.lateToday}</p>
                  <p className="text-sm text-gray-600">Late Today</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <p className="text-2xl font-bold text-red-700">{stats.absentToday}</p>
                  <p className="text-sm text-gray-600">Absent Today</p>
                </CardContent>
              </Card>
            </div>

            {/* Trends Logs - Always shown */}
            <AttendanceLogTable 
              logs={filteredLogs.length > 0 ? filteredLogs : weekAttendance.slice(0, 100)} 
              title="Weekly Attendance Logs"
              onLogClick={handleLogClick}
              maxHeight="400px"
            />
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AttendanceLogDetailDialog
        log={selectedLog}
        isOpen={isLogDialogOpen}
        onOpenChange={setIsLogDialogOpen}
        isLoading={isLogLoading}
      />

      <CreateEventDialog
        isOpen={isCreateEventOpen}
        onOpenChange={setIsCreateEventOpen}
        onCreateEvent={handleCreateEvent}
        cameras={cameras}
        students={students}
      />
      </div>
    </div>
  )
}
