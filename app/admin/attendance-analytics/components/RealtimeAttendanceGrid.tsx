"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Users, Search, Grid3X3, List, Clock, CheckCircle2, XCircle,
  RefreshCw, Camera, Wifi, WifiOff, Sparkles, Zap
} from "lucide-react"
import { Student, AttendanceLog, Camera as CameraType, formatTime } from "../types"

interface RealtimeAttendanceGridProps {
  students: Student[]
  initialLogs: AttendanceLog[]
  cameras: CameraType[]
  selectedForm?: string
  selectedClass?: string
}

interface StudentWithStatus extends Student {
  isPresent: boolean
  lastLog?: AttendanceLog
  animationClass: string
}

export function RealtimeAttendanceGrid({ 
  students, 
  initialLogs, 
  cameras,
  selectedForm,
  selectedClass 
}: RealtimeAttendanceGridProps) {
  const supabase = createClient()
  const [realtimeLogs, setRealtimeLogs] = useState<AttendanceLog[]>(initialLogs)
  const [isConnected, setIsConnected] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [recentlyArrived, setRecentlyArrived] = useState<Set<string>>(new Set())
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())
  const channelRef = useRef<any>(null)

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesForm = !selectedForm || selectedForm === 'all' || s.form === selectedForm
      const matchesClass = !selectedClass || selectedClass === 'all' || s.class_name === selectedClass
      const matchesSearch = !searchQuery || 
        s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.admission_number?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesForm && matchesClass && matchesSearch
    })
  }, [students, selectedForm, selectedClass, searchQuery])

  // Build student status map
  const studentsWithStatus: StudentWithStatus[] = useMemo(() => {
    const logsByStudent = new Map<string, AttendanceLog>()
    
    // Get latest log for each student
    realtimeLogs.forEach(log => {
      const existing = logsByStudent.get(log.user_id)
      if (!existing || new Date(log.timestamp) > new Date(existing.timestamp)) {
        logsByStudent.set(log.user_id, log)
      }
    })

    return filteredStudents.map(student => {
      const lastLog = logsByStudent.get(student.user_id)
      const isPresent = !!lastLog
      const isRecentlyArrived = recentlyArrived.has(student.user_id)

      return {
        ...student,
        isPresent,
        lastLog,
        animationClass: isRecentlyArrived 
          ? 'animate-pulse ring-4 ring-green-400 ring-opacity-75 scale-105' 
          : ''
      }
    }).sort((a, b) => {
      // Recently arrived first, then present, then absent
      if (recentlyArrived.has(a.user_id) && !recentlyArrived.has(b.user_id)) return -1
      if (!recentlyArrived.has(a.user_id) && recentlyArrived.has(b.user_id)) return 1
      if (a.isPresent && !b.isPresent) return -1
      if (!a.isPresent && b.isPresent) return 1
      return (a.full_name || '').localeCompare(b.full_name || '')
    })
  }, [filteredStudents, realtimeLogs, recentlyArrived])

  // Stats
  const stats = useMemo(() => {
    const present = studentsWithStatus.filter(s => s.isPresent).length
    const absent = studentsWithStatus.filter(s => !s.isPresent).length
    const total = studentsWithStatus.length
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0
    return { present, absent, total, percentage }
  }, [studentsWithStatus])

  // Realtime subscription
  useEffect(() => {
    const channelName = `realtime-grid-${Date.now()}`
    console.log('🔌 RealtimeGrid: Setting up subscription', channelName)

    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: true }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance_logs'
        },
        (payload: any) => {
          console.log('⚡ RealtimeGrid: New log received!', payload.new?.user_name)
          const newLog = payload.new as AttendanceLog
          
          // Add to logs
          setRealtimeLogs(prev => [newLog, ...prev])
          setLastUpdateTime(new Date())
          
          // Mark as recently arrived (for animation)
          setRecentlyArrived(prev => new Set([...prev, newLog.user_id]))
          
          // Remove animation after 5 seconds
          setTimeout(() => {
            setRecentlyArrived(prev => {
              const next = new Set(prev)
              next.delete(newLog.user_id)
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
          setRealtimeLogs(prev => 
            prev.map(log => log.id === updatedLog.id ? updatedLog : log)
          )
          setLastUpdateTime(new Date())
        }
      )
      .subscribe((status: string) => {
        console.log('📡 RealtimeGrid subscription:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    return () => {
      console.log('🔌 RealtimeGrid: Cleaning up subscription')
      supabase.removeChannel(channel)
    }
  }, [])

  // Manual refresh
  const handleRefresh = async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })

    if (data && !error) {
      setRealtimeLogs(data)
      setLastUpdateTime(new Date())
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4 animate-pulse" />
                    <span className="text-sm font-medium">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm font-medium">Offline</span>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{stats.present}</p>
                  <p className="text-xs text-slate-400">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{stats.absent}</p>
                  <p className="text-xs text-slate-400">Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{stats.percentage}%</p>
                  <p className="text-xs text-slate-400">Rate</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Last Update */}
              <div className="text-xs text-slate-400">
                Last update: {lastUpdateTime.toLocaleTimeString()}
              </div>

              {/* Refresh */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>

              {/* View Toggle */}
              <div className="flex bg-slate-700 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`px-3 ${viewMode === 'grid' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`px-3 ${viewMode === 'list' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {studentsWithStatus.map((student) => (
            <div
              key={student.user_id}
              className={`
                relative rounded-xl overflow-hidden transition-all duration-500 transform
                ${student.isPresent 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300 shadow-md' 
                  : 'bg-gray-50 border border-gray-200 opacity-60'
                }
                ${student.animationClass}
                hover:shadow-lg hover:scale-102
              `}
            >
              {/* Status Badge */}
              <div className={`
                absolute top-1 right-1 z-10 w-5 h-5 rounded-full flex items-center justify-center
                ${student.isPresent ? 'bg-green-500' : 'bg-gray-300'}
              `}>
                {student.isPresent ? (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                ) : (
                  <XCircle className="w-3 h-3 text-white" />
                )}
              </div>

              {/* Recently Arrived Indicator */}
              {recentlyArrived.has(student.user_id) && (
                <div className="absolute top-1 left-1 z-10">
                  <Badge className="bg-yellow-400 text-yellow-900 text-[8px] px-1.5 py-0 animate-bounce">
                    <Sparkles className="w-2 h-2 mr-0.5" />
                    NEW
                  </Badge>
                </div>
              )}

              {/* Image */}
              <div className="aspect-square relative bg-gray-100">
                {student.lastLog?.capture_image_url ? (
                  <img 
                    src={student.lastLog.capture_image_url} 
                    alt={student.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : student.profile_image_url ? (
                  <img 
                    src={student.profile_image_url} 
                    alt={student.full_name}
                    className={`w-full h-full object-cover ${!student.isPresent ? 'grayscale opacity-50' : ''}`}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${
                    student.isPresent ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Users className={`w-8 h-8 ${student.isPresent ? 'text-green-400' : 'text-gray-300'}`} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2 bg-white/80 backdrop-blur-sm">
                <p className="text-xs font-semibold truncate text-gray-800">{student.full_name}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-gray-500">{student.form}</span>
                  {student.lastLog && (
                    <span className="text-[9px] text-green-600 font-medium">
                      {formatTime(student.lastLog.timestamp)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Form</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Check-in Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Camera</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {studentsWithStatus.map((student) => (
                    <tr 
                      key={student.user_id}
                      className={`
                        transition-all duration-500
                        ${recentlyArrived.has(student.user_id) ? 'bg-green-100 animate-pulse' : ''}
                        ${student.isPresent ? 'bg-green-50/30' : ''}
                        hover:bg-gray-50
                      `}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                            {student.lastLog?.capture_image_url || student.profile_image_url ? (
                              <img 
                                src={student.lastLog?.capture_image_url || student.profile_image_url} 
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            {recentlyArrived.has(student.user_id) && (
                              <div className="absolute inset-0 bg-green-400/30 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-green-600 animate-bounce" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{student.full_name}</p>
                            <p className="text-xs text-gray-500">{student.admission_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{student.form} {student.class_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={
                          student.isPresent 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }>
                          {student.isPresent ? (
                            <><CheckCircle2 className="w-3 h-3 mr-1" /> Present</>
                          ) : (
                            <><XCircle className="w-3 h-3 mr-1" /> Absent</>
                          )}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {student.lastLog ? (
                          <span className="text-green-600 font-medium">
                            {formatTime(student.lastLog.timestamp)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student.lastLog?.camera_name || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {studentsWithStatus.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No students found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
