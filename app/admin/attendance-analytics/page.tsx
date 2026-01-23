import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AttendanceAnalyticsClient } from './client'

export default async function AttendanceAnalyticsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  const monthAgo = new Date(today)
  monthAgo.setDate(monthAgo.getDate() - 30)
  
  const [studentsData, todayAttendanceData, weekAttendanceData, camerasData, eventsData] = await Promise.all([
    supabase
      .from('user_registry')
      .select('*')
      .eq('person_type', 'student')
      .order('full_name'),
    
    supabase
      .from('attendance_logs')
      .select('*')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false }),
    
    supabase
      .from('attendance_logs')
      .select('*')
      .gte('created_at', weekAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5000),
    
    supabase
      .from('camera_metadata')
      .select('*')
      .order('display_name'),
    
    supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: false })
      .limit(100)
  ])
  
  return (
    <AttendanceAnalyticsClient
      students={studentsData.data || []}
      todayAttendance={todayAttendanceData.data || []}
      weekAttendance={weekAttendanceData.data || []}
      cameras={camerasData.data || []}
      events={eventsData.data || []}
    />
  )
}
