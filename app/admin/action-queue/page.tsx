import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Settings, BarChart3 } from 'lucide-react'
import { AnomalyCard } from '@/components/anomalies/anomaly-card'

export default async function ActionQueuePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  const [criticalData, warningData, watchlistData, resolvedTodayData, statsData] = await Promise.all([
    supabase
      .from('anomalies')
      .select('*')
      .eq('status', 'active')
      .eq('severity', 'critical')
      .order('detected_at', { ascending: false }),
    
    supabase
      .from('anomalies')
      .select('*')
      .eq('status', 'active')
      .eq('severity', 'warning')
      .order('detected_at', { ascending: false }),
    
    supabase
      .from('anomalies')
      .select('*')
      .eq('status', 'active')
      .eq('severity', 'watchlist')
      .order('detected_at', { ascending: false }),
    
    supabase
      .from('anomalies')
      .select('id')
      .eq('status', 'resolved')
      .gte('resolved_at', new Date().toISOString().split('T')[0]),
    
    supabase
      .from('user_registry')
      .select('current_status')
      .eq('person_type', 'student')
  ])
  
  const critical = criticalData.data || []
  const warnings = warningData.data || []
  const watchlist = watchlistData.data || []
  const resolvedToday = resolvedTodayData.data?.length || 0
  
  const students = statsData.data || []
  const onCampus = students.filter(s => s.current_status === 'on_campus').length
  const activeAlerts = critical.length + warnings.length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SmartSchool Sentinel - AI Action Queue</h1>
              <p className="text-gray-600 mt-1">Don't hunt for problems. The AI assigns them to you.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure Rules
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-1">{onCampus}</div>
                  <div className="text-sm text-gray-600">🟢 On Campus</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-1">{activeAlerts}</div>
                  <div className="text-sm text-gray-600">🟡 Active Alerts</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-1">{critical.length}</div>
                  <div className="text-sm text-gray-600">🔴 Critical</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-1">{resolvedToday}</div>
                  <div className="text-sm text-gray-600">✅ Auto-Resolved Today</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        {critical.length > 0 && (
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-900">
                🔴 PRIORITY QUEUE - SECURITY BREACHES ({critical.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {critical.map(anomaly => (
                <AnomalyCard key={anomaly.id} anomaly={anomaly} />
              ))}
            </CardContent>
          </Card>
        )}
        
        {warnings.length > 0 && (
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="bg-orange-50">
              <CardTitle className="flex items-center gap-2 text-orange-900">
                🟠 WARNING QUEUE - BEHAVIORAL ANOMALIES ({warnings.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {warnings.map(anomaly => (
                <AnomalyCard key={anomaly.id} anomaly={anomaly} />
              ))}
            </CardContent>
          </Card>
        )}
        
        {watchlist.length > 0 && (
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="bg-yellow-50">
              <CardTitle className="flex items-center gap-2 text-yellow-900">
                🟡 WATCHLIST - AT-RISK STUDENT MONITORING ({watchlist.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {watchlist.map(anomaly => (
                <AnomalyCard key={anomaly.id} anomaly={anomaly} />
              ))}
            </CardContent>
          </Card>
        )}
        
        {critical.length === 0 && warnings.length === 0 && watchlist.length === 0 && (
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="py-16 text-center">
              <div className="text-8xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold text-green-600 mb-3">ZERO INBOX ACHIEVED!</h2>
              <p className="text-gray-600 text-lg">All anomalies have been resolved. Great work!</p>
              <p className="text-gray-500 mt-2">{resolvedToday} issues auto-resolved today</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
