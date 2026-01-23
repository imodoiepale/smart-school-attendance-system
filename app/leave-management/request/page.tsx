import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LeaveRequestForm } from '@/components/leave/leave-request-form'

export default async function LeaveRequestPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  const { data: students } = await supabase
    .from('user_registry')
    .select('user_id, full_name, class, grade')
    .eq('person_type', 'student')
    .eq('is_active', true)
    .order('full_name')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-[1200px] mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900">Submit Leave Request</h1>
          <p className="text-gray-600 mt-1">Request leave approval for a student</p>
        </div>
      </div>
      
      <main className="max-w-[1200px] mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Leave Request Form</CardTitle>
          </CardHeader>
          <CardContent>
            <LeaveRequestForm students={students || []} userEmail={user.email || ''} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
