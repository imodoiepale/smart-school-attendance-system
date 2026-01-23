import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  const status = searchParams.get('status')
  const studentId = searchParams.get('student_id')
  
  let query = supabase
    .from('leave_approvals')
    .select('*')
    .order('requested_at', { ascending: false })
  
  if (status) {
    query = query.eq('approval_status', status)
  }
  
  if (studentId) {
    query = query.eq('student_id', studentId)
  }
  
  const { data, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  
  const leaveData = {
    ...body,
    requested_by: user.email,
    duration_hours: Math.ceil(
      (new Date(body.end_datetime).getTime() - new Date(body.start_datetime).getTime()) / (1000 * 60 * 60)
    )
  }
  
  const { data, error } = await supabase
    .from('leave_approvals')
    .insert([leaveData])
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ data }, { status: 201 })
}
