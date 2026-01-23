import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, UserCheck, UserX, Clock, LogOut, LogIn } from "lucide-react"
import { FaceRecognitionDisplay } from "@/components/gate/face-recognition-display"
import { EntryApprovalCard } from "@/components/gate/entry-approval-card"
import { LeaveApprovalList } from "@/components/gate/leave-approval-list"

export default async function GateSecurityInterface() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [studentsData, pendingApprovalsData, activeLeavesData, recentTransactionsData, visitorsData] = await Promise.all([
    supabase
      .from("user_registry")
      .select("*")
      .eq("person_type", "student")
      .eq("current_status", "on_campus")
      .order("full_name"),
    
    supabase
      .from("gate_approval_requests")
      .select("*")
      .eq("status", "pending")
      .order("requested_at", { ascending: false }),
    
    supabase
      .from("leave_approvals")
      .select("*")
      .eq("approval_status", "approved")
      .eq("exit_confirmed", false)
      .order("start_datetime"),
    
    supabase
      .from("gate_transactions")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(20),
    
    supabase
      .from("visitor_registry")
      .select("*")
      .eq("status", "on_premises")
      .order("entry_time", { ascending: false })
  ])

  const students = studentsData.data || []
  const pendingApprovals = pendingApprovalsData.data || []
  const activeLeaves = activeLeavesData.data || []
  const recentTransactions = recentTransactionsData.data || []
  const activeVisitors = visitorsData.data || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-[1800px] mx-auto p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gate Security Interface</h1>
              <p className="text-gray-600 mt-1">Entry/exit verification and approval management</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg py-2 px-4">
                <UserCheck className="w-5 h-5 mr-2" />
                {students.length} On Campus
              </Badge>
              <Badge variant="outline" className="text-lg py-2 px-4 bg-orange-50 border-orange-200">
                <Clock className="w-5 h-5 mr-2" />
                {pendingApprovals.length} Pending
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <FaceRecognitionDisplay />
            
            {pendingApprovals.length > 0 && (
              <Card className="border-orange-300">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Pending Approvals ({pendingApprovals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  {pendingApprovals.map(approval => (
                    <EntryApprovalCard key={approval.id} approval={approval} />
                  ))}
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogOut className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium">Name</th>
                        <th className="text-left py-3 px-4 font-medium">Type</th>
                        <th className="text-left py-3 px-4 font-medium">Gate</th>
                        <th className="text-left py-3 px-4 font-medium">Time</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">
                            No recent transactions
                          </td>
                        </tr>
                      ) : (
                        recentTransactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{transaction.user_name}</td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="capitalize">
                                {transaction.transaction_type === 'entry' && <LogIn className="w-3 h-3 mr-1" />}
                                {transaction.transaction_type === 'exit' && <LogOut className="w-3 h-3 mr-1" />}
                                {transaction.transaction_type.replace(/_/g, ' ')}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{transaction.gate_location}</td>
                            <td className="py-3 px-4 text-gray-600">
                              {new Date(transaction.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="py-3 px-4">
                              {transaction.is_authorized ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Authorized
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Unauthorized
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <LeaveApprovalList leaves={activeLeaves} />
            
            {activeVisitors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Visitors ({activeVisitors.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeVisitors.map(visitor => (
                    <div key={visitor.id} className="p-3 bg-gray-50 rounded-lg border">
                      <p className="font-semibold">{visitor.full_name}</p>
                      <p className="text-sm text-gray-600">{visitor.purpose}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Entry: {new Date(visitor.entry_time).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
