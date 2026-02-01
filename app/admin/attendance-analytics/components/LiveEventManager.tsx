"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { 
  Play, Square, Clock, Users, Camera, Pause, Plus, CalendarDays, Trash2, Eye, RefreshCw, CheckCircle2, XCircle, AlertCircle, Maximize2, Minimize2, Zap, Radio, Timer, UserCheck, UserX,
  ChevronRight, History
} from "lucide-react"
import { Student, Camera as CameraType, AttendanceLog, FORM_STRUCTURE, Event } from "../types"

interface LiveEventManagerProps {
  students: Student[]
  cameras: CameraType[]
  initialLogs?: AttendanceLog[]
  onAttendanceUpdate?: (logs: AttendanceLog[]) => void
}

interface LiveSession {
  id: string
  name: string
  eventType: string
  selectedCameras: string[]
  selectedForms: string[]
  expectedStudents: Student[]
  startTime: Date
  isActive: boolean
}

interface RealtimeStudent {
  student: Student
  status: 'present' | 'absent' | 'pending'
  lastSeen?: Date
  captureImage?: string
  confidence?: number
  animationState: 'idle' | 'just-arrived' | 'checking'
}

const EVENT_TYPES = [
  { value: 'roll_call', label: '📋 Roll Call' },
  { value: 'assembly', label: '🏫 Assembly' },
  { value: 'class', label: '📚 Class Session' },
  { value: 'exam', label: '📝 Examination' },
  { value: 'sports', label: '⚽ Sports Event' },
  { value: 'meal', label: '🍽️ Meal Time' },
  { value: 'custom', label: '✨ Custom Event' },
]

export function LiveEventManager({ students, cameras, initialLogs = [], onAttendanceUpdate }: LiveEventManagerProps) {
  const supabase = createClient()
  const [isQuickEventOpen, setIsQuickEventOpen] = useState(false)
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null)
  const [realtimeStudents, setRealtimeStudents] = useState<RealtimeStudent[]>([])
  const [sessionLogs, setSessionLogs] = useState<AttendanceLog[]>(initialLogs)
  const [isConnected, setIsConnected] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [excludedStudents, setExcludedStudents] = useState<Set<string>>(new Set())
  const channelRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const activityScrollRef = useRef<HTMLDivElement>(null)

  // End session dialog state
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [endSessionSummary, setEndSessionSummary] = useState<{
    present: Student[]
    absent: Student[]
    total: number
    percentage: number
  } | null>(null)

  // Quick event form state
  const [quickEventName, setQuickEventName] = useState('')
  const [quickEventType, setQuickEventType] = useState('roll_call')
  const [selectedCameraIds, setSelectedCameraIds] = useState<string[]>([])
  const [selectedForms, setSelectedForms] = useState<string[]>([])

  // Events sidebar state
  const [savedEvents, setSavedEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [showEventsSidebar, setShowEventsSidebar] = useState(true)

  // Event details dialog state
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null)
  const [eventAttendanceLogs, setEventAttendanceLogs] = useState<AttendanceLog[]>([])
  const [isLoadingEventLogs, setIsLoadingEventLogs] = useState(false)

  // Filter students by selected forms
  const filteredStudents = students.filter(s => 
    selectedForms.length === 0 || selectedForms.includes(s.form || '')
  )

  // Fetch today's events on mount
  useEffect(() => {
    const fetchTodayEvents = async () => {
      setIsLoadingEvents(true)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { data, error } = await supabase
        .from('special_events')
        .select('*')
        .gte('start_datetime', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        setSavedEvents(data)
      }
      setIsLoadingEvents(false)
    }

    fetchTodayEvents()

    // Subscribe to events changes
    const channel = supabase
      .channel('events-sidebar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'special_events' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setSavedEvents(prev => [payload.new as Event, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setSavedEvents(prev => prev.map(e => e.id === payload.new.id ? payload.new as Event : e))
        } else if (payload.eventType === 'DELETE') {
          setSavedEvents(prev => prev.filter(e => e.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Initialize realtime students when session starts - check existing logs
  useEffect(() => {
    if (liveSession) {
      // Get user IDs that already have logs (present)
      const presentUserIds = new Set(sessionLogs.map(log => log.user_id))
      
      const initial: RealtimeStudent[] = liveSession.expectedStudents.map(student => {
        const existingLog = sessionLogs.find(log => log.user_id === student.user_id)
        return {
          student,
          status: presentUserIds.has(student.user_id) ? 'present' : 'pending',
          lastSeen: existingLog ? new Date(existingLog.timestamp) : undefined,
          captureImage: existingLog?.capture_image_url || undefined,
          confidence: existingLog?.confidence_score || undefined,
          animationState: 'idle'
        }
      })
      setRealtimeStudents(initial)
    }
  }, [liveSession?.id, sessionLogs])

  // Timer effect
  useEffect(() => {
    if (liveSession?.isActive) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - liveSession.startTime.getTime()) / 1000))
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      setElapsedTime(0)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [liveSession?.isActive])

  // Global realtime subscription - always active
  useEffect(() => {
    const channelName = `live-manager-${Date.now()}`
    console.log('🔴 Starting LIVE manager subscription:', channelName)

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
          console.log('🎯 LIVE: New attendance detected!', payload.new?.user_name)
          const newLog = payload.new as AttendanceLog

          // Always update session logs
          setSessionLogs(prev => [newLog, ...prev])
          
          // Auto-scroll activity feed to top
          setTimeout(() => {
            activityScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
          }, 100)
          
          // If we have an active session, check camera filter and update grid
          if (liveSession?.isActive) {
            const shouldInclude = liveSession.selectedCameras.length === 0 || 
                liveSession.selectedCameras.includes(newLog.camera_id)
            
            if (shouldInclude) {
              // Update student status with animation
              setRealtimeStudents(prev => prev.map(rs => {
                if (rs.student.user_id === newLog.user_id) {
                  return {
                    ...rs,
                    status: 'present',
                    lastSeen: new Date(newLog.timestamp),
                    captureImage: newLog.capture_image_url || undefined,
                    confidence: newLog.confidence_score || undefined,
                    animationState: 'just-arrived'
                  }
                }
                return rs
              }))

              // Reset animation after 3 seconds
              setTimeout(() => {
                setRealtimeStudents(prev => prev.map(rs => {
                  if (rs.student.user_id === newLog.user_id && rs.animationState === 'just-arrived') {
                    return { ...rs, animationState: 'idle' }
                  }
                  return rs
                }))
              }, 3000)
            }
          }

          // Callback to parent
          onAttendanceUpdate?.([newLog])
        }
      )
      .subscribe((status: string) => {
        console.log('📡 Live manager subscription:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    return () => {
      console.log('🔴 Stopping LIVE manager subscription')
      supabase.removeChannel(channel)
    }
  }, [])

  // Start quick event - saves to database
  const startQuickEvent = useCallback(async () => {
    if (!quickEventName.trim()) return

    const expectedStudents = filteredStudents
    const sessionId = `live-${Date.now()}`
    const startTime = new Date()

    // Save event to database - matching special_events schema
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // Default 1 hour duration
    const participantIds = expectedStudents.map(s => s.user_id)
    
    const { data: savedEvent, error } = await supabase
      .from('special_events')
      .insert([{
        event_name: quickEventName,
        event_type: quickEventType,
        event_location: selectedCameraIds.length > 0 
          ? cameras.filter(c => selectedCameraIds.includes(c.camera_id)).map(c => c.display_name).join(', ')
          : 'All Cameras',
        start_datetime: startTime.toISOString(),
        end_datetime: endTime.toISOString(),
        participant_ids: participantIds,
        participant_count: participantIds.length,
        notes: `Live event tracking ${expectedStudents.length} students from ${selectedForms.length > 0 ? selectedForms.join(', ') : 'all forms'}`,
        status: 'active',
        created_by: 'admin'
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to save event to DB:', error)
    } else {
      console.log('✅ Event saved to DB:', savedEvent)
    }

    const session: LiveSession = {
      id: savedEvent?.id || sessionId,
      name: quickEventName,
      eventType: quickEventType,
      selectedCameras: selectedCameraIds,
      selectedForms: selectedForms,
      expectedStudents,
      startTime,
      isActive: true
    }

    setLiveSession(session)
    setSessionLogs([])
    setIsQuickEventOpen(false)

    console.log('🚀 Live session started:', session)
  }, [quickEventName, quickEventType, selectedCameraIds, selectedForms, filteredStudents, cameras, supabase])

  // Stop event
  const stopEvent = useCallback(() => {
    if (liveSession) {
      setLiveSession(prev => prev ? { ...prev, isActive: false } : null)
      console.log('⏹️ Live session stopped')
    }
  }, [liveSession])

  // Resume event
  const resumeEvent = useCallback(() => {
    if (liveSession) {
      setLiveSession(prev => prev ? { ...prev, isActive: true, startTime: new Date() } : null)
    }
  }, [liveSession])

  // End session - show summary popup first
  const handleEndSession = useCallback(() => {
    if (!liveSession) return
    
    const presentStudentsList = realtimeStudents
      .filter(s => s.status === 'present')
      .map(s => s.student)
    const absentStudentsList = realtimeStudents
      .filter(s => s.status === 'pending')
      .map(s => s.student)
    const total = realtimeStudents.length
    const percentage = total > 0 ? Math.round((presentStudentsList.length / total) * 100) : 0
    
    setEndSessionSummary({
      present: presentStudentsList,
      absent: absentStudentsList,
      total,
      percentage
    })
    setShowEndDialog(true)
  }, [liveSession, realtimeStudents])

  // Confirm end session - updates database
  const confirmEndSession = useCallback(async () => {
    if (liveSession?.id && endSessionSummary) {
      const endTime = new Date()
      
      // Try to update event in database
      try {
        const { error } = await supabase
          .from('special_events')
          .update({
            end_datetime: endTime.toISOString(),
            status: 'completed',
            notes: `${liveSession.name} - ${endSessionSummary.present.length}/${endSessionSummary.total} students attended (${endSessionSummary.percentage}%)`
          })
          .eq('id', liveSession.id)

        if (error) {
          console.error('❌ Failed to update event in DB:', error)
        } else {
          console.log('✅ Event ended and saved to DB')
        }
      } catch (err) {
        console.error('❌ Error updating event:', err)
      }
    }

    setShowEndDialog(false)
    setEndSessionSummary(null)
    setLiveSession(null)
    setRealtimeStudents([])
    setSessionLogs([])
    setElapsedTime(0)
  }, [liveSession, endSessionSummary, supabase])

  // Delete event from database
  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('special_events')
        .delete()
        .eq('id', eventId)
      
      if (error) {
        console.error('❌ Failed to delete event:', error)
      } else {
        console.log('✅ Event deleted')
        setSavedEvents(prev => prev.filter(e => e.id !== eventId))
        if (liveSession?.id === eventId) {
          setLiveSession(null)
          setRealtimeStudents([])
          setSessionLogs([])
        }
      }
    } catch (err) {
      console.error('❌ Error deleting event:', err)
    }
  }, [liveSession, supabase])

  // Clear activity feed
  const clearActivityFeed = useCallback(() => {
    setSessionLogs([])
  }, [])

  // View event details - fetch attendance logs for the event
  const viewEventDetails = useCallback(async (event: Event) => {
    setViewingEvent(event)
    setIsLoadingEventLogs(true)
    
    try {
      // Fetch attendance logs during the event time range
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .gte('timestamp', event.start_datetime)
        .lte('timestamp', event.end_datetime)
        .order('timestamp', { ascending: false })

      if (!error && data) {
        setEventAttendanceLogs(data)
      }
    } catch (err) {
      console.error('❌ Error fetching event logs:', err)
    }
    
    setIsLoadingEventLogs(false)
  }, [supabase])

  // Export attendance to CSV
  const exportAttendanceCSV = useCallback((event: Event, logs: AttendanceLog[]) => {
    // Deduplicate logs by user_id
    const userMap = new Map<string, { log: AttendanceLog; count: number }>()
    logs.forEach(log => {
      const existing = userMap.get(log.user_id)
      if (!existing) {
        userMap.set(log.user_id, { log, count: 1 })
      } else {
        existing.count++
      }
    })

    const rows = [
      ['Event Name', 'Event Type', 'Start Time', 'End Time', 'Location'],
      [event.event_name, event.event_type, event.start_datetime, event.end_datetime, event.event_location],
      [],
      ['User ID', 'Name', 'Person Type', 'Camera', 'First Detection', 'Detection Count', 'Confidence'],
      ...Array.from(userMap.values()).map(({ log, count }) => [
        log.user_id,
        log.user_name,
        log.person_type,
        log.camera_name,
        new Date(log.timestamp).toLocaleString(),
        count.toString(),
        log.confidence_score ? `${Math.round(log.confidence_score > 1 ? log.confidence_score : log.confidence_score * 100)}%` : '-'
      ])
    ]

    const csvContent = rows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `attendance_${event.event_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }, [])

  // Toggle camera selection
  const toggleCamera = (cameraId: string) => {
    setSelectedCameraIds(prev => 
      prev.includes(cameraId) 
        ? prev.filter(id => id !== cameraId)
        : [...prev, cameraId]
    )
  }

  // Toggle form selection
  const toggleForm = (form: string) => {
    setSelectedForms(prev =>
      prev.includes(form)
        ? prev.filter(f => f !== form)
        : [...prev, form]
    )
  }

  // Toggle exclude student
  const toggleExcludeStudent = (userId: string) => {
    setExcludedStudents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  // Format elapsed time
  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Stats - exclude excluded students from counts
  const activeStudents = realtimeStudents.filter(s => !excludedStudents.has(s.student.user_id))
  const presentCount = activeStudents.filter(s => s.status === 'present').length
  const absentCount = activeStudents.filter(s => s.status === 'pending').length
  const totalExpected = activeStudents.length
  const attendancePercentage = totalExpected > 0 ? Math.round((presentCount / totalExpected) * 100) : 0

  // Deduplicate session logs - group by user_id and count detections
  const deduplicatedLogs = React.useMemo(() => {
    const logMap = new Map<string, { log: AttendanceLog; count: number; latestTimestamp: string }>()
    
    sessionLogs.forEach(log => {
      const existing = logMap.get(log.user_id)
      if (!existing) {
        logMap.set(log.user_id, { log, count: 1, latestTimestamp: log.timestamp })
      } else {
        existing.count++
        // Keep the most recent log data
        if (new Date(log.timestamp) > new Date(existing.latestTimestamp)) {
          existing.log = log
          existing.latestTimestamp = log.timestamp
        }
      }
    })
    
    // Sort by most recent first
    return Array.from(logMap.values())
      .sort((a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime())
  }, [sessionLogs])

  // Get detection count for a specific user
  const getDetectionCount = (userId: string) => {
    return sessionLogs.filter(log => log.user_id === userId).length
  }

  return (
    <>
    <div className="flex gap-4">
      {/* Events Sidebar */}
      {showEventsSidebar && (
        <div className="w-72 shrink-0">
          <Card className="sticky top-4">
            <CardHeader className="py-3 px-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  My Events
                </CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  {savedEvents.length} today
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {isLoadingEvents ? (
                  <div className="p-4 text-center text-gray-500">
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2" />
                    <p className="text-xs">Loading events...</p>
                  </div>
                ) : savedEvents.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No events today</p>
                    <p className="text-xs mt-1">Create a quick event to get started</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {savedEvents.map((event) => {
                      const isCurrentEvent = liveSession?.id === event.id
                      const isActive = event.status === 'active'
                      const startTime = event.start_datetime ? new Date(event.start_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null
                      const endTime = event.end_datetime ? new Date(event.end_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null
                      
                      return (
                        <div
                          key={event.id}
                          className={`p-3 cursor-pointer transition-all hover:bg-gray-50 ${
                            isCurrentEvent ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          } ${selectedEventId === event.id ? 'bg-indigo-50' : ''}`}
                          onClick={() => setSelectedEventId(selectedEventId === event.id ? null : event.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{event.event_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant="outline" 
                                  className={`text-[9px] px-1.5 py-0 ${
                                    isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'
                                  }`}
                                >
                                  {isActive ? '● Live' : '○ Ended'}
                                </Badge>
                                <span className="text-[10px] text-gray-400">
                                  {event.event_type}
                                </span>
                              </div>
                            </div>
                            {isCurrentEvent && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mt-1" />
                            )}
                          </div>
                          
                          {/* Event Details (expanded) */}
                          {selectedEventId === event.id && (
                            <div className="mt-3 pt-3 border-t space-y-2">
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Clock className="w-3 h-3" />
                                <span>{startTime || 'No time set'}</span>
                                {endTime && <span>- {endTime}</span>}
                              </div>
                              {event.event_location && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Camera className="w-3 h-3" />
                                  <span className="truncate">{event.event_location}</span>
                                </div>
                              )}
                              {event.notes && (
                                <p className="text-[11px] text-gray-500 line-clamp-2">
                                  {event.notes}
                                </p>
                              )}
                              <div className="flex gap-2 mt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-xs flex-1"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    viewEventDetails(event)
                                  }}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                                {!isCurrentEvent && (
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    className="h-7 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteEvent(event.id)
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {/* Control Bar */}
        <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Radio className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Live Event Mode</h3>
                <p className="text-sm text-gray-500">
                  {liveSession 
                    ? `${liveSession.name} - ${liveSession.isActive ? 'Running' : 'Paused'}`
                    : 'Start a quick event to track attendance in real-time'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {isConnected ? 'Live' : 'Offline'}
              </div>

              {!liveSession ? (
                <Button 
                  onClick={() => setIsQuickEventOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Event
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Timer */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border">
                    <Timer className="w-4 h-4 text-blue-600" />
                    <span className="font-mono font-bold text-blue-900">{formatElapsed(elapsedTime)}</span>
                  </div>

                  {liveSession.isActive ? (
                    <Button variant="outline" onClick={stopEvent} className="border-orange-300 text-orange-600 hover:bg-orange-50">
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={resumeEvent} className="bg-green-600 hover:bg-green-700">
                      <Play className="w-4 h-4 mr-1" />
                      Resume
                    </Button>
                  )}

                  <Button variant="destructive" onClick={handleEndSession}>
                    <Square className="w-4 h-4 mr-1" />
                    End
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Event Dialog */}
      <Dialog open={isQuickEventOpen} onOpenChange={setIsQuickEventOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Start Quick Event
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Event Name */}
            <div className="space-y-2">
              <Label>Event Name</Label>
              <Input
                value={quickEventName}
                onChange={(e) => setQuickEventName(e.target.value)}
                placeholder="e.g., Morning Roll Call, Assembly"
              />
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select value={quickEventType} onValueChange={setQuickEventType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Camera Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Select Cameras ({selectedCameraIds.length} selected)
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCameraIds(
                    selectedCameraIds.length === cameras.length ? [] : cameras.map(c => c.camera_id)
                  )}
                >
                  {selectedCameraIds.length === cameras.length ? 'Clear All' : 'Select All'}
                </Button>
              </div>
              <ScrollArea className="h-32 border rounded-lg p-2">
                <div className="grid grid-cols-2 gap-2">
                  {cameras.map((camera, idx) => (
                    <div key={`${camera.camera_id}-${idx}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cam-${camera.camera_id}-${idx}`}
                        checked={selectedCameraIds.includes(camera.camera_id)}
                        onCheckedChange={() => toggleCamera(camera.camera_id)}
                      />
                      <Label htmlFor={`cam-${camera.camera_id}-${idx}`} className="text-sm cursor-pointer">
                        {camera.display_name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {selectedCameraIds.length === 0 && (
                <p className="text-xs text-amber-600">⚠️ No cameras selected - will track from ALL cameras</p>
              )}
            </div>

            {/* Form/Class Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Select Forms/Classes ({selectedForms.length} selected)
              </Label>
              <div className="flex flex-wrap gap-2">
                {FORM_STRUCTURE.map(form => (
                  <Badge
                    key={form.form}
                    variant={selectedForms.includes(form.form) ? 'default' : 'outline'}
                    className="cursor-pointer px-3 py-1.5 hover:bg-primary/80"
                    onClick={() => toggleForm(form.form)}
                  >
                    {form.form}
                  </Badge>
                ))}
              </div>
              {selectedForms.length === 0 && (
                <p className="text-xs text-amber-600">⚠️ No forms selected - will track ALL students</p>
              )}
            </div>

            {/* Exclude Students */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Exclude Students ({excludedStudents.size} excluded)
                </Label>
                {excludedStudents.size > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setExcludedStudents(new Set())}
                    className="text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              <ScrollArea className="h-40 border rounded-lg p-2">
                <div className="grid grid-cols-2 gap-1">
                  {filteredStudents.map((student) => (
                    <div 
                      key={student.user_id} 
                      className={`flex items-center space-x-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                        excludedStudents.has(student.user_id) 
                          ? 'bg-red-50 border border-red-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleExcludeStudent(student.user_id)}
                    >
                      <Checkbox
                        id={`exclude-${student.user_id}`}
                        checked={excludedStudents.has(student.user_id)}
                        onCheckedChange={() => toggleExcludeStudent(student.user_id)}
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {student.profile_image_url ? (
                          <img src={student.profile_image_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className={`text-xs font-medium truncate ${excludedStudents.has(student.user_id) ? 'text-red-600 line-through' : ''}`}>
                            {student.full_name}
                          </p>
                          <p className="text-[10px] text-gray-500">{student.form}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {excludedStudents.size > 0 && (
                <p className="text-xs text-red-600">
                  ⚠️ {excludedStudents.size} student(s) will be excluded from this event
                </p>
              )}
            </div>

            {/* Summary */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                Expected Participants: <span className="font-bold">{filteredStudents.length - excludedStudents.size}</span> students
                {excludedStudents.size > 0 && (
                  <span className="text-red-600 ml-2">({excludedStudents.size} excluded)</span>
                )}
              </p>
              {selectedForms.length > 0 && (
                <p className="text-xs text-blue-700 mt-1">
                  From: {selectedForms.join(', ')}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuickEventOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={startQuickEvent}
              disabled={!quickEventName.trim()}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End Session Summary Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              Event Summary: {liveSession?.name}
            </DialogTitle>
          </DialogHeader>

          {endSessionSummary && (
            <div className="space-y-6 py-4">
              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-3xl font-bold text-green-700">{endSessionSummary.present.length}</p>
                  <p className="text-sm text-green-600">Present</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                  <p className="text-3xl font-bold text-red-700">{endSessionSummary.absent.length}</p>
                  <p className="text-sm text-red-600">Absent</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-3xl font-bold text-blue-700">{endSessionSummary.percentage}%</p>
                  <p className="text-sm text-blue-600">Attendance Rate</p>
                </div>
              </div>

              {/* Absent Students List */}
              {endSessionSummary.absent.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-700 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Absent Students ({endSessionSummary.absent.length})
                  </h4>
                  <ScrollArea className="h-48 border rounded-lg">
                    <div className="p-2 space-y-1">
                      {endSessionSummary.absent.map((student, idx) => (
                        <div key={student.user_id || idx} className="flex items-center gap-3 p-2 rounded-lg bg-red-50 hover:bg-red-100">
                          <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center shrink-0">
                            {student.profile_image_url ? (
                              <img src={student.profile_image_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <Users className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{student.full_name}</p>
                            <p className="text-xs text-gray-500">{student.form} {student.class_name}</p>
                          </div>
                          <Badge variant="outline" className="text-red-600 border-red-300 text-[10px]">
                            Absent
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Present Students List (Collapsed) */}
              {endSessionSummary.present.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Present Students ({endSessionSummary.present.length})
                  </h4>
                  <ScrollArea className="h-32 border rounded-lg">
                    <div className="p-2 flex flex-wrap gap-2">
                      {endSessionSummary.present.map((student, idx) => (
                        <Badge key={student.user_id || idx} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {student.full_name}
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              Continue Event
            </Button>
            <Button variant="destructive" onClick={confirmEndSession}>
              <Square className="w-4 h-4 mr-2" />
              End Event & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog 
        open={!!viewingEvent} 
        onOpenChange={(open) => {
          if (!open) {
            setViewingEvent(null)
            setEventAttendanceLogs([])
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {viewingEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <CalendarDays className="w-6 h-6 text-blue-500" />
                  {viewingEvent.event_name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Event Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-[10px] text-blue-600 uppercase font-medium">Type</p>
                    <p className="text-sm font-semibold text-blue-900">{viewingEvent.event_type}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-[10px] text-green-600 uppercase font-medium">Status</p>
                    <p className="text-sm font-semibold text-green-900">{viewingEvent.status || 'Unknown'}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-[10px] text-purple-600 uppercase font-medium">Participants</p>
                    <p className="text-sm font-semibold text-purple-900">{viewingEvent.participant_count}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-[10px] text-orange-600 uppercase font-medium">Detections</p>
                    <p className="text-sm font-semibold text-orange-900">{eventAttendanceLogs.length}</p>
                  </div>
                </div>

                {/* Time & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Schedule
                    </h4>
                    <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Start:</span>
                        <span className="font-medium">{new Date(viewingEvent.start_datetime).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">End:</span>
                        <span className="font-medium">{new Date(viewingEvent.end_datetime).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Camera className="w-4 h-4" /> Location
                    </h4>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">{viewingEvent.event_location}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {viewingEvent.notes && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">Notes</h4>
                    <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{viewingEvent.notes}</p>
                  </div>
                )}

                {/* Attendance Logs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Attendance Records
                    </h4>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => exportAttendanceCSV(viewingEvent, eventAttendanceLogs)}
                      disabled={eventAttendanceLogs.length === 0}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Export CSV
                    </Button>
                  </div>
                  
                  {isLoadingEventLogs ? (
                    <div className="p-8 text-center text-gray-500">
                      <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />
                      <p className="text-sm">Loading attendance records...</p>
                    </div>
                  ) : eventAttendanceLogs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No attendance records found for this event</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-64 border rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="text-left p-2 font-medium">Person</th>
                            <th className="text-left p-2 font-medium">Camera</th>
                            <th className="text-left p-2 font-medium">Time</th>
                            <th className="text-left p-2 font-medium">Confidence</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {eventAttendanceLogs.map((log, idx) => (
                            <tr key={log.id || idx} className="hover:bg-gray-50">
                              <td className="p-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                    {log.capture_image_url ? (
                                      <img src={log.capture_image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-blue-100">
                                        <Users className="w-4 h-4 text-blue-400" />
                                      </div>
                                    )}
                                  </div>
                                  <span className="font-medium">{log.user_name}</span>
                                </div>
                              </td>
                              <td className="p-2 text-gray-600">{log.camera_name}</td>
                              <td className="p-2 text-gray-600">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="p-2">
                                {log.confidence_score && (
                                  <Badge variant="outline" className="text-[10px]">
                                    {Math.round(log.confidence_score > 1 ? log.confidence_score : log.confidence_score * 100)}%
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </ScrollArea>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { setViewingEvent(null); setEventAttendanceLogs([]); }}>
                  Close
                </Button>
                <Button onClick={() => exportAttendanceCSV(viewingEvent, eventAttendanceLogs)} disabled={eventAttendanceLogs.length === 0}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Export Attendance
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Live Session View */}
      {liveSession && (
        <div className="space-y-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs">Expected</p>
                    <p className="text-3xl font-bold">{totalExpected}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs">Present</p>
                    <p className="text-3xl font-bold">{presentCount}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-xs">Not Yet</p>
                    <p className="text-3xl font-bold">{absentCount}</p>
                  </div>
                  <UserX className="w-8 h-8 text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs">Attendance</p>
                    <p className="text-3xl font-bold">{attendancePercentage}%</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Real-time Attendance</h3>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(true)}
                className="ml-2"
              >
                <Maximize2 className="w-4 h-4 mr-1" />
                Fullscreen
              </Button>
            </div>
          </div>

          {/* Realtime Grid - Shows actual captured face photos */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
              {realtimeStudents.map((rs, idx) => {
                const detectionCount = getDetectionCount(rs.student.user_id)
                const confidencePercent = rs.confidence ? Math.round(rs.confidence > 1 ? rs.confidence : rs.confidence * 100) : null
                
                return (
                  <div
                    key={rs.student.user_id}
                    className={`
                      relative rounded-xl overflow-hidden transition-all duration-500 transform
                      ${rs.status === 'present' 
                        ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-400 shadow-lg shadow-green-200' 
                        : 'bg-gray-50 border border-gray-200'
                      }
                      ${rs.animationState === 'just-arrived' 
                        ? 'scale-105 ring-4 ring-green-400 ring-opacity-50 animate-pulse' 
                        : ''
                      }
                    `}
                  >
                    {/* Row number badge */}
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-xs font-bold z-10">
                      {idx + 1}
                    </div>

                    {/* Status indicator */}
                    <div className={`
                      absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold z-10
                      ${rs.status === 'present' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}
                    `}>
                      {rs.status === 'present' ? 'Present' : 'Waiting'}
                    </div>

                    {/* Detection count badge */}
                    {detectionCount > 1 && (
                      <div className="absolute top-2 left-10 px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold z-10">
                        {detectionCount}x
                      </div>
                    )}

                    {/* Face Capture Image - Priority: captured > profile > placeholder */}
                    <div className="aspect-square relative bg-gray-100">
                      {rs.captureImage ? (
                        <img 
                          src={rs.captureImage} 
                          alt={rs.student.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : rs.student.profile_image_url ? (
                        <img 
                          src={rs.student.profile_image_url} 
                          alt={rs.student.full_name}
                          className={`w-full h-full object-cover ${rs.status === 'pending' ? 'opacity-40 grayscale' : ''}`}
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${
                          rs.status === 'present' ? 'bg-green-200' : 'bg-gray-200'
                        }`}>
                          <Users className={`w-12 h-12 ${rs.status === 'present' ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                      )}

                      {/* Just arrived overlay */}
                      {rs.animationState === 'just-arrived' && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-12 h-12 text-green-600 animate-bounce" />
                        </div>
                      )}

                      {/* Confidence bar overlay at bottom */}
                      {confidencePercent && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-600 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  confidencePercent > 80 ? 'bg-green-500' : confidencePercent > 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${confidencePercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-white font-medium">{confidencePercent}%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info - Compact */}
                    <div className="p-1.5 space-y-0.5">
                      <p className="text-[11px] font-semibold truncate">{rs.student.full_name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-gray-500">{rs.student.form}</span>
                        {rs.lastSeen && (
                          <span className="text-[9px] text-green-600 font-medium">
                            {new Date(rs.lastSeen).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Realtime Table - Detailed attendance log style */}
          {viewMode === 'table' && (
            <Card>
              <CardHeader className="py-3 border-b">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Student Attendance Logs</span>
                  <Badge variant="secondary">{realtimeStudents.length} records</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 w-10">#</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">Date & Time</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">Student</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">Event</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">Camera</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">Confidence</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {realtimeStudents.map((rs, idx) => {
                        const detectionCount = getDetectionCount(rs.student.user_id)
                        const confidencePercent = rs.confidence ? Math.round(rs.confidence > 1 ? rs.confidence : rs.confidence * 100) : null
                        const log = sessionLogs.find(l => l.user_id === rs.student.user_id)
                        
                        return (
                          <tr 
                            key={rs.student.user_id}
                            className={`
                              transition-all duration-500 hover:bg-gray-50
                              ${rs.animationState === 'just-arrived' ? 'bg-green-100 animate-pulse' : ''}
                              ${rs.status === 'present' ? 'bg-green-50/30' : ''}
                            `}
                          >
                            {/* Row number */}
                            <td className="px-3 py-3 text-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                                {idx + 1}
                              </span>
                            </td>
                            
                            {/* Date & Time */}
                            <td className="px-3 py-3">
                              <div className="text-xs">
                                <p className="font-medium text-gray-900">
                                  {rs.lastSeen ? new Date(rs.lastSeen).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                                </p>
                                <p className="text-gray-500">
                                  {rs.lastSeen ? new Date(rs.lastSeen).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                                </p>
                              </div>
                            </td>
                            
                            {/* Student with photo */}
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 border-2 border-white shadow-sm shrink-0">
                                  {rs.captureImage ? (
                                    <img src={rs.captureImage} alt="" className="w-full h-full object-cover" />
                                  ) : rs.student.profile_image_url ? (
                                    <img src={rs.student.profile_image_url} alt="" className={`w-full h-full object-cover ${rs.status === 'pending' ? 'opacity-40 grayscale' : ''}`} />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                      <Users className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{rs.student.full_name}</p>
                                  <p className="text-xs text-gray-500">{rs.student.form}</p>
                                  {detectionCount > 1 && (
                                    <Badge variant="secondary" className="text-[9px] px-1 py-0 mt-0.5 bg-blue-50 text-blue-600">
                                      {detectionCount}x detected
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </td>
                            
                            {/* Event type */}
                            <td className="px-3 py-3">
                              <Badge variant="outline" className="text-[10px]">
                                {liveSession?.name || 'class'}
                              </Badge>
                            </td>
                            
                            {/* Camera */}
                            <td className="px-3 py-3">
                              <div className="text-xs">
                                <p className="font-medium text-gray-700">{log?.camera_name || '-'}</p>
                                <p className="text-gray-400">{rs.student.form}</p>
                              </div>
                            </td>
                            
                            {/* Confidence */}
                            <td className="px-3 py-3">
                              {confidencePercent ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-14 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${confidencePercent > 80 ? 'bg-green-500' : confidencePercent > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                      style={{ width: `${confidencePercent}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-gray-700">{confidencePercent}%</span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </td>
                            
                            {/* Status */}
                            <td className="px-3 py-3">
                              <Badge className={`text-[10px] ${
                                rs.status === 'present' 
                                  ? 'bg-green-100 text-green-700 border-green-200' 
                                  : 'bg-gray-100 text-gray-600 border-gray-200'
                              }`}>
                                {rs.status === 'present' ? 'On Time' : 'Waiting...'}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      )}

      {/* Always Visible: Recent Activity Log */}
      <Card>
        <CardHeader className="py-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Live Activity Feed ({sessionLogs.length} detections)
            </CardTitle>
            <div className="flex items-center gap-2">
              {sessionLogs.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs text-gray-500 hover:text-red-600"
                  onClick={clearActivityFeed}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${
                isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
                {isConnected ? 'Live' : 'Connecting...'}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-64" ref={activityScrollRef}>
            {deduplicatedLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Radio className="w-8 h-8 mx-auto mb-2 animate-pulse text-blue-400" />
                <p className="text-sm">Waiting for attendance detections...</p>
                <p className="text-xs text-gray-400 mt-1">New check-ins will appear here in real-time</p>
              </div>
            ) : (
              <div className="divide-y">
                {deduplicatedLogs.slice(0, 50).map(({ log, count }, idx) => {
                  const student = students.find(s => s.user_id === log.user_id)
                  const confidenceValue = log.confidence_score 
                    ? Math.round(log.confidence_score > 1 ? log.confidence_score : log.confidence_score * 100)
                    : null
                  const rowNumber = idx + 1
                  
                  return (
                    <div 
                      key={log.user_id}
                      className={`px-4 py-3 flex items-center gap-3 transition-all ${
                        idx === 0 ? 'bg-green-50 animate-pulse' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Row number */}
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                        {rowNumber}
                      </div>
                      
                      {/* Avatar with count badge */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow">
                          {log.capture_image_url ? (
                            <img src={log.capture_image_url} alt="" className="w-full h-full object-cover" />
                          ) : student?.profile_image_url ? (
                            <img src={student.profile_image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-100">
                              <Users className="w-5 h-5 text-blue-400" />
                            </div>
                          )}
                        </div>
                        {count > 1 && (
                          <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md">
                            {count}x
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{log.user_name}</p>
                          {count > 1 && (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-600 shrink-0">
                              {count} detections
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{student?.form || '-'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            {log.camera_name}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-green-600">
                          {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                        {confidenceValue && (
                          <div className="flex items-center gap-1 justify-end mt-0.5">
                            <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${confidenceValue > 80 ? 'bg-green-500' : confidenceValue > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(confidenceValue, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400">{confidenceValue}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      </div>
    </div>

      {/* Fullscreen Overlay - Glassmorphism Theme */}
    {isFullscreen && liveSession && (
      <div className="fixed inset-0 z-50 overflow-auto bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        {/* Animated background orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl" />
        </div>

        {/* Fullscreen Header - Glassmorphism */}
        <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-white/50 shadow-lg shadow-black/5">
          <div className="max-w-[1920px] mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg">
                  <div className="relative">
                    <Radio className="w-6 h-6 text-red-500" />
                    <div className="absolute inset-0 w-6 h-6 bg-red-500 rounded-full animate-ping opacity-30" />
                  </div>
                  <span className="text-gray-800 font-bold text-xl">{liveSession.name}</span>
                </div>
                <Badge className="px-4 py-1.5 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 border-0">
                  {liveSession.isActive ? '● LIVE' : '○ PAUSED'}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg">
                  <Timer className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-800 font-mono font-bold text-lg">{formatElapsed(elapsedTime)}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(false)}
                  className="rounded-2xl px-4 bg-white/50 backdrop-blur-sm border-white/60 hover:bg-white/80 shadow-lg"
                >
                  <Minimize2 className="w-4 h-4 mr-2" />
                  Exit
                </Button>
              </div>
            </div>
            
            {/* Stats Row - Glassmorphism Cards */}
            <div className="grid grid-cols-5 gap-4">
              <div className="relative overflow-hidden rounded-2xl p-4 text-center bg-gradient-to-br from-blue-500/10 to-blue-600/20 backdrop-blur-xl border border-blue-200/50 shadow-xl shadow-blue-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
                <div className="relative">
                  <div className="text-4xl font-black text-blue-600 drop-shadow-sm">{activeStudents.length}</div>
                  <div className="text-sm text-blue-600/80 font-semibold mt-1">Expected</div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl p-4 text-center bg-gradient-to-br from-emerald-500/10 to-green-600/20 backdrop-blur-xl border border-green-200/50 shadow-xl shadow-green-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
                <div className="relative">
                  <div className="text-4xl font-black text-emerald-600 drop-shadow-sm">{presentCount}</div>
                  <div className="text-sm text-emerald-600/80 font-semibold mt-1">Present</div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl p-4 text-center bg-gradient-to-br from-orange-500/10 to-amber-600/20 backdrop-blur-xl border border-orange-200/50 shadow-xl shadow-orange-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
                <div className="relative">
                  <div className="text-4xl font-black text-orange-600 drop-shadow-sm">{absentCount}</div>
                  <div className="text-sm text-orange-600/80 font-semibold mt-1">Waiting</div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl p-4 text-center bg-gradient-to-br from-violet-500/10 to-purple-600/20 backdrop-blur-xl border border-purple-200/50 shadow-xl shadow-purple-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
                <div className="relative">
                  <div className="text-4xl font-black text-violet-600 drop-shadow-sm">
                    {attendancePercentage}%
                  </div>
                  <div className="text-sm text-violet-600/80 font-semibold mt-1">Attendance</div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl p-4 text-center bg-gradient-to-br from-cyan-500/10 to-teal-600/20 backdrop-blur-xl border border-cyan-200/50 shadow-xl shadow-cyan-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
                <div className="relative">
                  <div className="text-4xl font-black text-cyan-600 drop-shadow-sm">{sessionLogs.length}</div>
                  <div className="text-sm text-cyan-600/80 font-semibold mt-1">Detections</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Excluded count - Glassmorphism */}
        {excludedStudents.size > 0 && (
          <div className="mx-4 mt-4 px-4 py-3 rounded-2xl backdrop-blur-xl bg-red-500/10 border border-red-200/50 flex items-center justify-between shadow-lg">
            <span className="text-red-700 text-sm font-medium flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              {excludedStudents.size} student(s) excluded from this event
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExcludedStudents(new Set())}
              className="text-red-600 hover:text-red-800 hover:bg-red-100/50 rounded-xl"
            >
              Clear All
            </Button>
          </div>
        )}

        {/* Fullscreen Grid - Glassmorphism Cards */}
        <div className="p-4 overflow-auto">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4">
            {realtimeStudents
              .filter(s => !excludedStudents.has(s.student.user_id))
              .map((rs, idx) => {
              const detectionCount = getDetectionCount(rs.student.user_id)
              const confidencePercent = rs.confidence ? Math.round(rs.confidence > 1 ? rs.confidence : rs.confidence * 100) : null
              
              return (
                <div
                  key={rs.student.user_id}
                  className={`
                    relative rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer group
                    backdrop-blur-xl border shadow-xl
                    ${rs.status === 'present' 
                      ? 'bg-gradient-to-br from-white/80 to-green-50/80 border-green-300/50 shadow-green-500/20' 
                      : 'bg-white/40 border-white/30 opacity-60 grayscale'
                    }
                    ${rs.animationState === 'just-arrived' 
                      ? 'scale-105 ring-4 ring-green-400/50 shadow-2xl shadow-green-500/40 z-10' 
                      : 'hover:scale-102 hover:shadow-2xl'
                    }
                  `}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />

                  {/* Row number - Glass pill */}
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-bold z-10 shadow-lg">
                    #{idx + 1}
                  </div>

                  {/* Status badge - Glass pill */}
                  <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold z-10 shadow-lg backdrop-blur-sm ${
                    rs.status === 'present' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                      : 'bg-gray-500/80 text-white'
                  }`}>
                    {rs.status === 'present' ? '✓ Present' : '○ Waiting'}
                  </div>

                  {/* Exclude button - Glass effect */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleExcludeStudent(rs.student.user_id)
                    }}
                    className="absolute top-2 left-12 w-7 h-7 rounded-full bg-red-500/90 backdrop-blur-sm text-white flex items-center justify-center text-lg z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 shadow-lg hover:scale-110"
                    title="Exclude from event"
                  >
                    ×
                  </button>

                  {/* Detection badge */}
                  {detectionCount > 1 && (
                    <div className="absolute top-11 left-2 px-2 py-0.5 rounded-full bg-blue-500/90 backdrop-blur-sm text-white text-[10px] font-bold z-10 shadow-lg">
                      {detectionCount}× seen
                    </div>
                  )}

                  {/* Image with glass frame */}
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 m-1.5 rounded-xl overflow-hidden shadow-inner">
                    {rs.captureImage ? (
                      <img src={rs.captureImage} alt="" className="w-full h-full object-cover" />
                    ) : rs.student.profile_image_url ? (
                      <img src={rs.student.profile_image_url} alt="" className={`w-full h-full object-cover ${rs.status !== 'present' ? 'grayscale opacity-50' : ''}`} />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${
                        rs.status === 'present' 
                          ? 'bg-gradient-to-br from-green-100 to-emerald-200' 
                          : 'bg-gradient-to-br from-gray-100 to-gray-200'
                      }`}>
                        <Users className={`w-12 h-12 ${rs.status === 'present' ? 'text-green-500' : 'text-gray-400'}`} />
                      </div>
                    )}

                    {/* Just arrived celebration */}
                    {rs.animationState === 'just-arrived' && (
                      <div className="absolute inset-0 bg-gradient-to-t from-green-500/40 to-transparent flex items-center justify-center">
                        <div className="relative">
                          <CheckCircle2 className="w-16 h-16 text-white drop-shadow-lg animate-bounce" />
                          <div className="absolute inset-0 w-16 h-16 bg-white rounded-full animate-ping opacity-30" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confidence bar - Gradient */}
                  {confidencePercent && (
                    <div className="mx-1.5 h-1.5 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${
                          confidencePercent > 80 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                            : confidencePercent > 60 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                              : 'bg-gradient-to-r from-red-400 to-rose-500'
                        }`}
                        style={{ width: `${confidencePercent}%` }}
                      />
                    </div>
                  )}

                  {/* Info - Glass footer */}
                  <div className="p-2.5 bg-gradient-to-t from-white/80 to-transparent backdrop-blur-sm">
                    <p className="text-sm font-bold text-gray-800 truncate">{rs.student.full_name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500 font-medium">{rs.student.form}</span>
                      {rs.lastSeen && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-full">
                          {new Date(rs.lastSeen).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {confidencePercent && (
                      <div className="mt-1.5 flex items-center gap-1">
                        <span className="text-[10px] text-gray-500">Confidence:</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          confidencePercent > 80 
                            ? 'bg-green-100 text-green-700' 
                            : confidencePercent > 60 
                              ? 'bg-yellow-100 text-yellow-700' 
                              : 'bg-red-100 text-red-700'
                        }`}>{confidencePercent}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )}
    </>
  )
}
