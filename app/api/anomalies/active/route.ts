import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('anomalies')
    .select('*')
    .eq('status', 'active')
    .order('severity', { ascending: true })
    .order('detected_at', { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  const grouped = {
    critical: data?.filter(a => a.severity === 'critical') || [],
    warning: data?.filter(a => a.severity === 'warning') || [],
    watchlist: data?.filter(a => a.severity === 'watchlist') || []
  }
  
  return NextResponse.json({ data: grouped })
}
