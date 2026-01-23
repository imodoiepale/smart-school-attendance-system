"use client"

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

// Type for realtime subscription status
type RealtimeStatus = 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR'

// Type for subscription error
interface SubscriptionError {
  message: string
}

// Generic realtime hook for any table
export function useRealtimeTable<T>(
  tableName: string,
  initialData: T[],
  options?: {
    filter?: { column: string; value: string }
    orderBy?: { column: string; ascending?: boolean }
    onInsert?: (payload: T) => void
    onUpdate?: (payload: T) => void
    onDelete?: (payload: { old: T }) => void
  }
) {
  const [data, setData] = useState<T[]>(initialData)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  useEffect(() => {
    let channel: RealtimeChannel
    let reconnectTimeout: NodeJS.Timeout

    const setupSubscription = () => {
      const channelName = `realtime-${tableName}-${Math.random().toString(36).substring(7)}`
      
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: tableName,
            ...(options?.filter && { filter: `${options.filter.column}=eq.${options.filter.value}` })
          },
          (payload: any) => {
            try {
              const newRecord = payload.new as T
              setData(prev => [newRecord, ...prev])
              options?.onInsert?.(newRecord)
              setError(null)
            } catch (err) {
              console.error(`Error processing INSERT for ${tableName}:`, err)
              setError('Failed to process new record')
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: tableName,
            ...(options?.filter && { filter: `${options.filter.column}=eq.${options.filter.value}` })
          },
          (payload: any) => {
            try {
              const updatedRecord = payload.new as T
              setData(prev => prev.map(item => 
                (item as any).id === (updatedRecord as any).id ? updatedRecord : item
              ))
              options?.onUpdate?.(updatedRecord)
              setError(null)
            } catch (err) {
              console.error(`Error processing UPDATE for ${tableName}:`, err)
              setError('Failed to process update')
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: tableName,
            ...(options?.filter && { filter: `${options.filter.column}=eq.${options.filter.value}` })
          },
          (payload: any) => {
            try {
              const deletedRecord = payload.old as T
              setData(prev => prev.filter(item => (item as any).id !== (deletedRecord as any).id))
              options?.onDelete?.({ old: deletedRecord })
              setError(null)
            } catch (err) {
              console.error(`Error processing DELETE for ${tableName}:`, err)
              setError('Failed to process deletion')
            }
          }
        )
        .subscribe((status: string, err?: Error) => {
          setIsConnected(status === 'SUBSCRIBED')
          console.log(`Realtime ${tableName}:`, status)
          
          if (err) {
            console.error(`Subscription error for ${tableName}:`, err)
            setError(err.message)
          }
          
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setError('Connection lost. Reconnecting...')
            reconnectTimeout = setTimeout(() => {
              console.log(`Attempting to reconnect ${tableName}...`)
              setupSubscription()
            }, 3000)
          }
        })
    }

    setupSubscription()

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [tableName, options?.filter?.column, options?.filter?.value])

  return { data, isConnected, error, setData }
}

// Specific hook for attendance logs with realtime updates
export function useRealtimeAttendance(initialLogs: any[]) {
  const [logs, setLogs] = useState(initialLogs)
  const [isConnected, setIsConnected] = useState(false)
  const [newLogCount, setNewLogCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    setLogs(initialLogs)
  }, [initialLogs])

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout
    const channelName = `attendance-realtime-${Math.random().toString(36).substring(7)}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance_logs'
        },
        (payload) => {
          try {
            const newLog = payload.new
            setLogs(prev => [newLog, ...prev])
            setNewLogCount(prev => prev + 1)
            setError(null)
            console.log('📝 New attendance log received:', newLog.id)
          } catch (err) {
            console.error('Error processing attendance log:', err)
            setError('Failed to process attendance log')
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'attendance_logs'
        },
        (payload) => {
          try {
            const updatedLog = payload.new
            setLogs(prev => prev.map(log => log.id === updatedLog.id ? updatedLog : log))
            setError(null)
            console.log('✏️ Attendance log updated:', updatedLog.id)
          } catch (err) {
            console.error('Error updating attendance log:', err)
            setError('Failed to update attendance log')
          }
        }
      )
      .subscribe((status, err) => {
        setIsConnected(status === 'SUBSCRIBED')
        console.log('📡 Attendance realtime:', status)
        
        if (err) {
          console.error('Attendance subscription error:', err)
          setError(err.message)
        }
        
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setError('Connection lost. Reconnecting...')
          reconnectTimeout = setTimeout(() => {
            console.log('🔄 Reconnecting attendance channel...')
            window.location.reload()
          }, 5000)
        }
      })

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      supabase.removeChannel(channel)
    }
  }, [])

  const clearNewLogCount = useCallback(() => setNewLogCount(0), [])

  return { logs, isConnected, newLogCount, clearNewLogCount, error, setLogs }
}

// Specific hook for anomalies/alerts with realtime updates
export function useRealtimeAnomalies(initialAnomalies: any[]) {
  const [anomalies, setAnomalies] = useState(initialAnomalies)
  const [isConnected, setIsConnected] = useState(false)
  const [criticalCount, setCriticalCount] = useState(0)
  const [warningCount, setWarningCount] = useState(0)
  const [watchlistCount, setWatchlistCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    setAnomalies(initialAnomalies)
    updateCounts(initialAnomalies)
  }, [initialAnomalies])

  const updateCounts = useCallback((data: any[]) => {
    const active = data.filter(a => a.status === 'active')
    setCriticalCount(active.filter(a => a.severity === 'critical').length)
    setWarningCount(active.filter(a => a.severity === 'warning').length)
    setWatchlistCount(active.filter(a => a.severity === 'watchlist' || a.severity === 'low').length)
  }, [])

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout
    const channelName = `anomalies-realtime-${Math.random().toString(36).substring(7)}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'anomalies'
        },
        (payload) => {
          try {
            if (payload.eventType === 'INSERT') {
              setAnomalies(prev => {
                const updated = [payload.new, ...prev]
                updateCounts(updated)
                return updated
              })
              console.log('🚨 New anomaly detected:', payload.new.type)
            } else if (payload.eventType === 'UPDATE') {
              setAnomalies(prev => {
                const updated = prev.map(a => a.id === payload.new.id ? payload.new : a)
                updateCounts(updated)
                return updated
              })
              console.log('✏️ Anomaly updated:', payload.new.id)
            } else if (payload.eventType === 'DELETE') {
              setAnomalies(prev => {
                const updated = prev.filter(a => a.id !== payload.old.id)
                updateCounts(updated)
                return updated
              })
              console.log('🗑️ Anomaly deleted:', payload.old.id)
            }
            setError(null)
          } catch (err) {
            console.error('Error processing anomaly:', err)
            setError('Failed to process anomaly update')
          }
        }
      )
      .subscribe((status, err) => {
        setIsConnected(status === 'SUBSCRIBED')
        console.log('🚨 Anomalies realtime:', status)
        
        if (err) {
          console.error('Anomalies subscription error:', err)
          setError(err.message)
        }
        
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setError('Connection lost. Reconnecting...')
          reconnectTimeout = setTimeout(() => {
            console.log('🔄 Reconnecting anomalies channel...')
            window.location.reload()
          }, 5000)
        }
      })

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      supabase.removeChannel(channel)
    }
  }, [updateCounts])

  return { 
    anomalies, 
    isConnected, 
    criticalCount, 
    warningCount, 
    watchlistCount,
    totalActive: criticalCount + warningCount + watchlistCount,
    error,
    setAnomalies 
  }
}

// Hook for realtime student status updates
export function useRealtimeStudents(initialStudents: any[]) {
  const [students, setStudents] = useState(initialStudents)
  const [isConnected, setIsConnected] = useState(false)
  const [onCampusCount, setOnCampusCount] = useState(0)
  const [offCampusCount, setOffCampusCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    setStudents(initialStudents)
    updateCounts(initialStudents)
  }, [initialStudents])

  const updateCounts = useCallback((data: any[]) => {
    setOnCampusCount(data.filter(s => s.current_status === 'on_campus').length)
    setOffCampusCount(data.filter(s => s.current_status === 'off_campus').length)
  }, [])

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout
    const channelName = `students-realtime-${Math.random().toString(36).substring(7)}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_registry',
          filter: 'person_type=eq.student'
        },
        (payload) => {
          try {
            setStudents(prev => {
              const updated = prev.map(s => s.id === payload.new.id ? payload.new : s)
              updateCounts(updated)
              return updated
            })
            setError(null)
            console.log('👤 Student status updated:', payload.new.user_id)
          } catch (err) {
            console.error('Error updating student status:', err)
            setError('Failed to update student status')
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_registry',
          filter: 'person_type=eq.student'
        },
        (payload) => {
          try {
            setStudents(prev => {
              const updated = [payload.new, ...prev]
              updateCounts(updated)
              return updated
            })
            setError(null)
            console.log('👤 New student added:', payload.new.user_id)
          } catch (err) {
            console.error('Error adding new student:', err)
            setError('Failed to add new student')
          }
        }
      )
      .subscribe((status, err) => {
        setIsConnected(status === 'SUBSCRIBED')
        console.log('👥 Students realtime:', status)
        
        if (err) {
          console.error('Students subscription error:', err)
          setError(err.message)
        }
        
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setError('Connection lost. Reconnecting...')
          reconnectTimeout = setTimeout(() => {
            console.log('🔄 Reconnecting students channel...')
            window.location.reload()
          }, 5000)
        }
      })

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      supabase.removeChannel(channel)
    }
  }, [updateCounts])

  return { 
    students, 
    isConnected, 
    onCampusCount, 
    offCampusCount,
    totalStudents: students.length,
    error,
    setStudents 
  }
}
