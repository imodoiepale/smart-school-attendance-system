import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

export default async function AIInsightsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  const { data: insights } = await supabase
    .from('ai_insights')
    .select('*')
    .order('detected_at', { ascending: false })
    .limit(50)

  const insightsList = insights || []
  const activeInsights = insightsList.filter(i => i.status === 'active')
  const criticalInsights = activeInsights.filter(i => i.severity === 'critical')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-[1600px] mx-auto p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Insights Dashboard</h1>
              <p className="text-gray-600 mt-1">AI-generated patterns, trends, and recommendations</p>
            </div>
            <Button>
              <Lightbulb className="w-4 h-4 mr-2" />
              Generate New Insights
            </Button>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-1">{activeInsights.length}</div>
                  <div className="text-sm text-gray-600">Active Insights</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-1">{criticalInsights.length}</div>
                  <div className="text-sm text-gray-600">Critical</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-1">
                    {insightsList.filter(i => i.status === 'actioned').length}
                  </div>
                  <div className="text-sm text-gray-600">Actioned</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-1">
                    {insightsList.filter(i => i.insight_type === 'recommendation').length}
                  </div>
                  <div className="text-sm text-gray-600">Recommendations</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        {criticalInsights.length > 0 && (
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertCircle className="w-5 h-5" />
                Critical Insights ({criticalInsights.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {criticalInsights.map(insight => (
                <div key={insight.id} className="p-4 border-2 border-red-200 rounded-lg bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{insight.title}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {insight.insight_type.replace(/_/g, ' ')} • {insight.scope}: {insight.scope_name}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {insight.confidence_score}% confidence
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{insight.description}</p>
                  
                  {insight.recommended_actions && insight.recommended_actions.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-2">Recommended Actions:</p>
                      <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                        {insight.recommended_actions.map((action: string, idx: number) => (
                          <li key={idx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Acknowledge
                    </Button>
                    <Button size="sm">
                      Take Action
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              All Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeInsights.filter(i => i.severity !== 'critical').map(insight => (
              <div key={insight.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{insight.title}</h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {insight.insight_type.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <Badge variant={insight.severity === 'warning' ? 'secondary' : 'outline'}>
                    {insight.severity}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">{insight.description}</p>
              </div>
            ))}
            
            {activeInsights.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No active insights. Generate new insights to see AI recommendations.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
