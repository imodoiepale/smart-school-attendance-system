import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { request_id } = await request.json()
  
  const { data, error } = await supabase
    .from('gate_approval_requests')
    .update({
      status: 'approved',
      approved_by: user.email,
      approved_at: new Date().toISOString()
    })
    .eq('id', request_id)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ data })
}
