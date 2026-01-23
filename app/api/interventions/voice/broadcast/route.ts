import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { anomaly_id, zone, message_text, admin_id, admin_name } = await request.json()
  
  const { data: speakerZone } = await supabase
    .from('speaker_zones')
    .select('*')
    .eq('zone_code', zone)
    .single()
  
  if (!speakerZone) {
    return NextResponse.json({ error: 'Speaker zone not found' }, { status: 404 })
  }
  
  const { data: intervention, error } = await supabase
    .from('voice_interventions')
    .insert([{
      anomaly_id,
      broadcast_type: 'live_voice',
      zone: speakerZone.zone_name,
      speaker_ids: speakerZone.speaker_ids,
      message_text,
      admin_id,
      admin_name,
      duration_seconds: Math.ceil(message_text.length / 10)
    }])
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  await supabase
    .from('anomalies')
    .update({
      intervention_type: 'voice',
      intervention_at: new Date().toISOString(),
      intervention_by: admin_name
    })
    .eq('id', anomaly_id)
  
  return NextResponse.json({ data: intervention })
}
