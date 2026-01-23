import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function LeaveManagementPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  const [pendingData, approvedData, activeData, completedData] = await Promise.all([
    supabase
      .from('leave_approvals')
      .select('*')
      .eq('approval_status', 'pending')
      .order('requested_at', { ascending: false }),
    
    supabase
      .from('leave_approvals')
      .select('*')
      .eq('approval_status', 'approved')
      .eq('exit_confirmed', false)
      .order('start_datetime'),
    
    supabase
      .from('leave_approvals')
      .select('*')
      .eq('approval_status', 'approved')
      .eq('exit_confirmed', true)
      .eq('return_confirmed', false)
      .order('exit_time', { ascending: false }),
    
    supabase
      .from('leave_approvals')
      .select('*')
      .eq('return_confirmed', true)
      .gte('return_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('return_time', { ascending: false })
  ])
  
  const pending = pendingData.data || []
  const approved = approvedData.data || []
  const active = activeData.data || []
  const completed = completedData.data || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-[1600px] mx-auto p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
              <p className="text-gray-600 mt-1">Student leave requests and approvals</p>
            </div>
            <Link href="/leave-management/request">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Leave Request
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-1">{pending.length}</div>
                  <div className="text-sm text-gray-600">Pending Approval</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-1">{approved.length}</div>
                  <div className="text-sm text-gray-600">Approved (Not Exited)</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-1">{active.length}</div>
                  <div className="text-sm text-gray-600">Currently Away</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-1">{completed.length}</div>
                  <div className="text-sm text-gray-600">Completed (7 days)</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        {pending.length > 0 && (
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="bg-orange-50">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Approvals ({pending.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {pending.map(leave => (
                  <LeaveCard key={leave.id} leave={leave} status="pending" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {approved.length > 0 && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Approved - Awaiting Exit ({approved.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {approved.map(leave => (
                  <LeaveCard key={leave.id} leave={leave} status="approved" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {active.length > 0 && (
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Currently Away ({active.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {active.map(leave => (
                  <LeaveCard key={leave.id} leave={leave} status="active" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

function LeaveCard({ leave, status }: { leave: any; status: string }) {
  const statusConfig = {
    pending: { bg: 'bg-orange-50', border: 'border-orange-200' },
    approved: { bg: 'bg-blue-50', border: 'border-blue-200' },
    active: { bg: 'bg-purple-50', border: 'border-purple-200' }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig]
  
  return (
    <div className={`p-4 rounded-lg border-2 ${config.border} ${config.bg}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{leave.student_name}</h3>
          <p className="text-sm text-gray-600">{leave.class}</p>
        </div>
        <Badge className="capitalize">
          {leave.leave_type.replace(/_/g, ' ')}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Start</p>
          <p className="text-sm font-medium">
            {new Date(leave.start_datetime).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">End</p>
          <p className="text-sm font-medium">
            {new Date(leave.end_datetime).toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="bg-white p-3 rounded-lg mb-3">
        <p className="text-xs text-gray-500 mb-1">Guardian</p>
        <p className="text-sm font-medium">{leave.guardian_name}</p>
        <p className="text-xs text-gray-600">{leave.guardian_phone}</p>
      </div>
      
      <div className="bg-white p-3 rounded-lg mb-3">
        <p className="text-xs text-gray-500 mb-1">Reason</p>
        <p className="text-sm">{leave.leave_reason}</p>
      </div>
      
      {status === 'pending' && (
        <div className="flex gap-2">
          <Button className="flex-1 bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>
          <Button variant="destructive" className="flex-1">
            <XCircle className="w-4 h-4 mr-2" />
            Deny
          </Button>
        </div>
      )}
      
      {status === 'active' && leave.late_return && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
          <p className="text-sm text-red-800 font-medium">⚠️ Late Return - Expected back at {new Date(leave.end_datetime).toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}
