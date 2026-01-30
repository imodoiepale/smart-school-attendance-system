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
  Play, Square, Camera, Users, Clock, CheckCircle2, XCircle, 
  AlertCircle, Zap, RefreshCw, Pause, Radio, Timer, UserCheck, UserX,
  CalendarDays, ChevronRight, History, Trash2, Eye
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

  // Format elapsed time
  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Stats
  const presentCount = realtimeStudents.filter(s => s.status === 'present').length
  const absentCount = realtimeStudents.filter(s => s.status === 'pending').length
  const totalExpected = realtimeStudents.length
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
                                    // View event logs
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

            {/* Summary */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                Expected Participants: <span className="font-bold">{filteredStudents.length}</span> students
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
            </div>
          </div>

          {/* Realtime Grid */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {realtimeStudents.map((rs) => (
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
                  {/* Status indicator */}
                  <div className={`
                    absolute top-2 right-2 w-3 h-3 rounded-full z-10
                    ${rs.status === 'present' ? 'bg-green-500' : 'bg-gray-300'}
                    ${rs.animationState === 'just-arrived' ? 'animate-ping' : ''}
                  `} />

                  {/* Image */}
                  <div className="aspect-square relative">
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
                        <Users className={`w-8 h-8 ${rs.status === 'present' ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                    )}

                    {/* Just arrived overlay */}
                    {rs.animationState === 'just-arrived' && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-green-600 animate-bounce" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{rs.student.full_name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-gray-500">{rs.student.form}</span>
                      {rs.lastSeen && (
                        <span className="text-[9px] text-green-600">
                          {new Date(rs.lastSeen).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {rs.confidence && (
                      <div className="mt-1">
                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${rs.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Realtime Table */}
          {viewMode === 'table' && (
            <Card>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Form</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {realtimeStudents.map((rs) => (
                        <tr 
                          key={rs.student.user_id}
                          className={`
                            transition-all duration-500
                            ${rs.animationState === 'just-arrived' ? 'bg-green-100 animate-pulse' : ''}
                            ${rs.status === 'present' ? 'bg-green-50/50' : ''}
                          `}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                {rs.captureImage || rs.student.profile_image_url ? (
                                  <img 
                                    src={rs.captureImage || rs.student.profile_image_url} 
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Users className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{rs.student.full_name}</p>
                                <p className="text-xs text-gray-500">{rs.student.admission_number}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{rs.student.form} {rs.student.class_name}</td>
                          <td className="px-4 py-3">
                            <Badge className={
                              rs.status === 'present' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }>
                              {rs.status === 'present' ? 'Present' : 'Waiting...'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {rs.lastSeen 
                              ? new Date(rs.lastSeen).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                              : '-'
                            }
                          </td>
                          <td className="px-4 py-3">
                            {rs.confidence ? (
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500"
                                    style={{ width: `${rs.confidence * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-600">{Math.round(rs.confidence * 100)}%</span>
                              </div>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
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
            {sessionLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Radio className="w-8 h-8 mx-auto mb-2 animate-pulse text-blue-400" />
                <p className="text-sm">Waiting for attendance detections...</p>
                <p className="text-xs text-gray-400 mt-1">New check-ins will appear here in real-time</p>
              </div>
            ) : (
              <div className="divide-y">
                {sessionLogs.slice(0, 50).map((log, idx) => {
                  const student = students.find(s => s.user_id === log.user_id)
                  const confidenceValue = log.confidence_score 
                    ? Math.round(log.confidence_score > 1 ? log.confidence_score : log.confidence_score * 100)
                    : null
                  
                  return (
                    <div 
                      key={log.id || idx}
                      className={`px-4 py-3 flex items-center gap-3 transition-all ${
                        idx === 0 ? 'bg-green-50 animate-pulse' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0 border-2 border-white shadow">
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
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{log.user_name}</p>
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
  )
}
