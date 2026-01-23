import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, TrendingDown, Users } from 'lucide-react'

export default async function StudentRiskPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  const [studentsData, flaggedData] = await Promise.all([
    supabase
      .from('user_registry')
      .select('*')
      .eq('person_type', 'student')
      .not('risk_level', 'is', null)
      .order('risk_score', { ascending: false }),
    
    supabase
      .from('flagged_students')
      .select('*')
      .eq('intervention_status', 'pending')
      .order('flagged_at', { ascending: false })
  ])
  
  const students = studentsData.data || []
  const flagged = flaggedData.data || []
  
  const criticalRisk = students.filter(s => s.risk_level === 'critical').length
  const highRisk = students.filter(s => s.risk_level === 'high_risk').length
  const watchList = students.filter(s => s.risk_level === 'watch').length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-[1600px] mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900">Student Risk Dashboard</h1>
          <p className="text-gray-600 mt-1">AI-powered at-risk student identification and monitoring</p>
          
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-1">{criticalRisk}</div>
                  <div className="text-sm text-gray-600">Critical Risk</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-1">{highRisk}</div>
                  <div className="text-sm text-gray-600">High Risk</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-yellow-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-600 mb-1">{watchList}</div>
                  <div className="text-sm text-gray-600">Watch List</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-1">{flagged.length}</div>
                  <div className="text-sm text-gray-600">Pending Interventions</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        {students.filter(s => s.risk_level === 'critical' || s.risk_level === 'high_risk').length > 0 && (
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="w-5 h-5" />
                High Priority Students
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {students
                  .filter(s => s.risk_level === 'critical' || s.risk_level === 'high_risk')
                  .slice(0, 10)
                  .map(student => (
                    <div key={student.id} className="p-4 border-2 border-red-200 rounded-lg bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{student.full_name}</h3>
                          <p className="text-sm text-gray-600">{student.class} • {student.user_id}</p>
                        </div>
                        <Badge variant={student.risk_level === 'critical' ? 'destructive' : 'secondary'}>
                          Risk: {student.risk_score || 0}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        {student.attendance_rate_30day && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">30-Day Attendance:</span>
                            <span className={`font-medium ${student.attendance_rate_30day < 80 ? 'text-red-600' : 'text-green-600'}`}>
                              {student.attendance_rate_30day.toFixed(1)}%
                            </span>
                          </div>
                        )}
                        
                        {student.punctuality_score && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Punctuality Score:</span>
                            <span className="font-medium">{student.punctuality_score.toFixed(1)}%</span>
                          </div>
                        )}
                        
                        {student.total_anomalies_count > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Anomalies:</span>
                            <span className="font-medium text-orange-600">{student.total_anomalies_count}</span>
                          </div>
                        )}
                      </div>
                      
                      {student.behavioral_notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                          <p className="text-gray-700">{student.behavioral_notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {flagged.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Flagged Students Requiring Intervention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {flagged.map(flag => (
                  <div key={flag.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{flag.student_name}</h3>
                        <p className="text-sm text-gray-600">{flag.class}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {flag.flag_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{flag.description}</p>
                    {flag.pattern_description && (
                      <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{flag.pattern_description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
