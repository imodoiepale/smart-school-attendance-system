import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VisitorRegistrationForm } from '@/components/gate/visitor-registration-form'

export default async function VisitorManagementPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  const { data: visitors } = await supabase
    .from('visitor_registry')
    .select('*')
    .order('entry_time', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-[1600px] mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900">Visitor Management</h1>
          <p className="text-gray-600 mt-1">Register and manage campus visitors</p>
        </div>
      </div>
      
      <main className="max-w-[1600px] mx-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Register New Visitor</CardTitle>
              </CardHeader>
              <CardContent>
                <VisitorRegistrationForm guardEmail={user.email || ''} />
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Visitors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {visitors && visitors.length > 0 ? (
                  visitors.slice(0, 10).map(visitor => (
                    <div key={visitor.id} className="p-3 bg-gray-50 rounded-lg border">
                      <p className="font-semibold">{visitor.full_name}</p>
                      <p className="text-sm text-gray-600">{visitor.purpose}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(visitor.entry_time).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No visitors yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
