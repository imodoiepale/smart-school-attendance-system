"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, Search, Clock, CheckCircle2, XCircle, RefreshCw, 
  Camera, Wifi, WifiOff, Sparkles, ArrowUpDown, Filter,
  ChevronDown, ChevronUp, Eye, AlertTriangle
} from "lucide-react"
import { AttendanceLog, Student, Camera as CameraType, formatTime, formatDate, FORM_STRUCTURE } from "../types"

interface RealtimeAttendanceTableProps {
  students: Student[]
  initialLogs: AttendanceLog[]
  cameras: CameraType[]
  title?: string
  maxHeight?: string
  showFilters?: boolean
}

export function RealtimeAttendanceTable({ 
  students, 
  initialLogs, 
  cameras,
  title = "Real-time Attendance",
  maxHeight = "600px",
  showFilters = true
}: RealtimeAttendanceTableProps) {
  const supabase = createClient()
  const [logs, setLogs] = useState<AttendanceLog[]>(initialLogs)
  const [isConnected, setIsConnected] = useState(false)
  const [recentIds, setRecentIds] = useState<Set<number>>(new Set())
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedForm, setSelectedForm] = useState('all')
  const [selectedCamera, setSelectedCamera] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState<'time' | 'name' | 'form'>('time')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  const channelRef = useRef<any>(null)

  // Realtime subscription
  useEffect(() => {
    const channelName = `realtime-table-${Date.now()}`
    console.log('📊 RealtimeTable: Setting up subscription', channelName)

    const channel = supabase
      .channel(channelName, {
        config: { broadcast: { self: true } }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance_logs'
        },
        (payload: any) => {
          console.log('⚡ RealtimeTable: New log!', payload.new?.user_name)
          const newLog = payload.new as AttendanceLog
          
          setLogs(prev => [newLog, ...prev])
          setLastUpdateTime(new Date())
          
          // Mark as recent for animation
          setRecentIds(prev => new Set([...prev, newLog.id]))
          
          // Remove animation after 5 seconds
          setTimeout(() => {
            setRecentIds(prev => {
              const next = new Set(prev)
              next.delete(newLog.id)
              return next
            })
          }, 5000)
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
          setLogs(prev => prev.map(log => log.id === updatedLog.id ? updatedLog : log))
          setLastUpdateTime(new Date())
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
          setLogs(prev => prev.filter(log => log.id !== deletedLog.id))
        }
      )
      .subscribe((status: string) => {
        console.log('📡 RealtimeTable subscription:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    return () => {
      console.log('🔌 RealtimeTable: Cleanup')
      supabase.removeChannel(channel)
    }
  }, [])

  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    let result = [...logs]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(log => 
        log.user_name?.toLowerCase().includes(query) ||
        log.camera_name?.toLowerCase().includes(query)
      )
    }

    // Form filter
    if (selectedForm !== 'all') {
      const formStudentIds = students
        .filter(s => s.form === selectedForm)
        .map(s => s.user_id)
      result = result.filter(log => formStudentIds.includes(log.user_id))
    }

    // Camera filter
    if (selectedCamera !== 'all') {
      result = result.filter(log => log.camera_id === selectedCamera)
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter(log => log.attendance_status === selectedStatus)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'time':
          comparison = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          break
        case 'name':
          comparison = (a.user_name || '').localeCompare(b.user_name || '')
          break
        case 'form':
          const studentA = students.find(s => s.user_id === a.user_id)
          const studentB = students.find(s => s.user_id === b.user_id)
          comparison = (studentA?.form || '').localeCompare(studentB?.form || '')
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [logs, searchQuery, selectedForm, selectedCamera, selectedStatus, sortBy, sortOrder, students])

  // Stats
  const stats = useMemo(() => {
    const uniqueUsers = new Set(logs.map(l => l.user_id)).size
    const presentToday = logs.filter(l => l.attendance_status === 'present' || l.attendance_status === 'on_time').length
    const lateToday = logs.filter(l => l.attendance_status?.includes('late')).length
    return { total: logs.length, uniqueUsers, presentToday, lateToday }
  }, [logs])

  // Manual refresh
  const handleRefresh = async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(500)

    if (data && !error) {
      setLogs(data)
      setLastUpdateTime(new Date())
    }
  }

  // Toggle sort
  const toggleSort = (field: 'time' | 'name' | 'form') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  // Get status badge style
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'present':
      case 'on_time':
        return { className: 'bg-green-100 text-green-800 border-green-200', label: 'Present' }
      case 'late_minor':
        return { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Late (Minor)' }
      case 'late_major':
        return { className: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Late (Major)' }
      case 'very_late':
        return { className: 'bg-red-100 text-red-800 border-red-200', label: 'Very Late' }
      default:
        return { className: 'bg-gray-100 text-gray-600 border-gray-200', label: status || 'Unknown' }
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="py-3 px-4 border-b bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            
            {/* Connection Status */}
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${
              isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="w-3 h-3 animate-pulse" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span>Offline</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mr-2">
              <span><strong className="text-blue-600">{stats.total}</strong> logs</span>
              <span><strong className="text-green-600">{stats.uniqueUsers}</strong> users</span>
              <span className="text-gray-300">|</span>
              <span>Updated: {lastUpdateTime.toLocaleTimeString()}</span>
            </div>

            <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-7 px-2">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <div className="relative flex-1 min-w-[150px] max-w-[250px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 pl-7 text-xs"
              />
            </div>
            
            <Select value={selectedForm} onValueChange={setSelectedForm}>
              <SelectTrigger className="h-7 w-28 text-xs">
                <SelectValue placeholder="Form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Forms</SelectItem>
                {FORM_STRUCTURE.map(f => (
                  <SelectItem key={f.form} value={f.form}>{f.form}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCamera} onValueChange={setSelectedCamera}>
              <SelectTrigger className="h-7 w-36 text-xs">
                <SelectValue placeholder="Camera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cameras</SelectItem>
                {cameras.map(c => (
                  <SelectItem key={c.camera_id} value={c.camera_id}>{c.display_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-7 w-28 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="on_time">On Time</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late_minor">Late (Minor)</SelectItem>
                <SelectItem value="late_major">Late (Major)</SelectItem>
                <SelectItem value="very_late">Very Late</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      {/* Table */}
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                  Student
                </th>
                <th 
                  className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('form')}
                >
                  <div className="flex items-center gap-1">
                    Form
                    {sortBy === 'form' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('time')}
                >
                  <div className="flex items-center gap-1">
                    Time
                    {sortBy === 'time' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                  Camera
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="text-gray-400">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No attendance logs found</p>
                      <p className="text-xs mt-1">Waiting for check-ins...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.slice(0, 200).map((log) => {
                  const student = students.find(s => s.user_id === log.user_id)
                  const isRecent = recentIds.has(log.id)
                  const statusBadge = getStatusBadge(log.attendance_status)
                  
                  return (
                    <tr 
                      key={log.id}
                      className={`
                        transition-all duration-500 hover:bg-gray-50
                        ${isRecent ? 'bg-green-50 animate-pulse' : ''}
                      `}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {/* Avatar with capture image */}
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0">
                            {log.capture_image_url ? (
                              <img 
                                src={log.capture_image_url} 
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : student?.profile_image_url ? (
                              <img 
                                src={student.profile_image_url} 
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            {isRecent && (
                              <div className="absolute inset-0 bg-green-400/30 flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-green-600 animate-bounce" />
                              </div>
                            )}
                          </div>
                          
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{log.user_name}</p>
                            <p className="text-[10px] text-gray-500">{student?.admission_number || log.user_id.slice(0, 8)}</p>
                          </div>
                          
                          {isRecent && (
                            <Badge className="bg-yellow-400 text-yellow-900 text-[8px] px-1 py-0 animate-bounce ml-1">
                              NEW
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {student?.form || '-'} {student?.class_name || ''}
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={`text-[10px] ${statusBadge.className}`}>
                          {statusBadge.label}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs">
                          <span className="font-medium text-gray-900">
                            {formatTime(log.timestamp)}
                          </span>
                          <p className="text-[10px] text-gray-400">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Camera className="w-3 h-3 text-gray-400" />
                          <span className="truncate max-w-[100px]">{log.camera_name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {log.confidence_score ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  (log.confidence_score > 1 ? log.confidence_score : log.confidence_score * 100) > 80 ? 'bg-green-500' :
                                  (log.confidence_score > 1 ? log.confidence_score : log.confidence_score * 100) > 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(log.confidence_score > 1 ? log.confidence_score : log.confidence_score * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-500">
                              {Math.round(log.confidence_score > 1 ? log.confidence_score : log.confidence_score * 100)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          
          {filteredLogs.length > 200 && (
            <div className="px-4 py-2 text-center text-xs text-gray-500 bg-gray-50 border-t">
              Showing 200 of {filteredLogs.length} logs
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
