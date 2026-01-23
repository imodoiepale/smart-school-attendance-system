import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VoiceInterventionPanel } from '@/components/interventions/voice-panel'
import { EvidencePanel } from '@/components/interventions/evidence-panel'

export default async function InterventionsPage({
  searchParams
}: {
  searchParams: { anomaly?: string }
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  const [anomaliesData, speakerZonesData] = await Promise.all([
    supabase
      .from('anomalies')
      .select('*')
      .eq('status', 'active')
      .order('severity', { ascending: true })
      .order('detected_at', { ascending: false }),
    
    supabase
      .from('speaker_zones')
      .select('*')
      .eq('is_active', true)
      .order('zone_name')
  ])
  
  const anomalies = anomaliesData.data || []
  const speakerZones = speakerZonesData.data || []
  
  const selectedAnomaly = searchParams.anomaly 
    ? anomalies.find(a => a.id === searchParams.anomaly)
    : anomalies[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-[1800px] mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900">Anomaly Intervention Hub</h1>
          <p className="text-gray-600 mt-1">Real-time incident command center</p>
        </div>
      </div>
      
      <main className="max-w-[1800px] mx-auto p-6">
        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          <div className="col-span-1 overflow-y-auto space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Incidents ({anomalies.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {anomalies.map(anomaly => (
                  <a
                    key={anomaly.id}
                    href={`/admin/interventions?anomaly=${anomaly.id}`}
                    className={`block p-4 rounded-lg border-2 transition-all ${
                      selectedAnomaly?.id === anomaly.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">
                        {anomaly.severity === 'critical' ? '🚨' : 
                         anomaly.severity === 'warning' ? '⚠️' : '🟡'}
                      </span>
                      <span className="font-semibold text-sm">{anomaly.user_name}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{anomaly.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(anomaly.detected_at).toLocaleTimeString()}
                    </p>
                  </a>
                ))}
                
                {anomalies.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No active incidents</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="col-span-2 space-y-4">
            {selectedAnomaly ? (
              <>
                <EvidencePanel anomaly={selectedAnomaly} />
                <VoiceInterventionPanel 
                  anomaly={selectedAnomaly} 
                  speakerZones={speakerZones}
                  userEmail={user.email || ''}
                />
              </>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <p className="text-gray-500">Select an incident to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
