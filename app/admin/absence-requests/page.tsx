"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react"
import { ModernHeader } from "@/components/modern-header"

export default function AbsenceRequests() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    checkUser()
    fetchRequests()
  }, [filter])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
    } else {
      setUser(user)
    }
  }

  const fetchRequests = async () => {
    setLoading(true)
    let query = supabase
      .from("absence_reasons")
      .select("*")
      .order("submitted_at", { ascending: false })

    if (filter !== "all") {
      query = query.eq("approval_status", filter)
    }

    const { data } = await query
    setRequests(data || [])
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from("absence_reasons")
      .update({
        approval_status: "approved",
        approved_by: user?.email,
        approved_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (!error) {
      fetchRequests()
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt("Rejection reason:")
    if (!reason) return

    const { error } = await supabase
      .from("absence_reasons")
      .update({
        approval_status: "rejected",
        approved_by: user?.email,
        approved_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq("id", id)

    if (!error) {
      fetchRequests()
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader user={user} title="Absence Requests" subtitle="Manage student absence requests" />

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={filter === "approved" ? "default" : "outline"}
            onClick={() => setFilter("approved")}
          >
            Approved
          </Button>
          <Button
            variant={filter === "rejected" ? "default" : "outline"}
            onClick={() => setFilter("rejected")}
          >
            Rejected
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Absence Requests ({requests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">Loading...</p>
              ) : requests.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No requests found</p>
              ) : (
                requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{request.student_name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {request.student_id}</p>
                      </div>
                      <Badge
                        variant={
                          request.approval_status === "approved"
                            ? "default"
                            : request.approval_status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {request.approval_status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Type:</span> {request.absence_type}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(request.absence_date).toLocaleDateString()}
                      </div>
                      {request.is_multi_day && (
                        <div>
                          <span className="font-medium">End Date:</span>{" "}
                          {new Date(request.end_date).toLocaleDateString()}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Submitted:</span>{" "}
                        {new Date(request.submitted_at).toLocaleString()}
                      </div>
                    </div>

                    {request.reason_details && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm font-medium mb-1">Reason:</p>
                        <p className="text-sm text-gray-700">{request.reason_details}</p>
                      </div>
                    )}

                    {request.supporting_document_url && (
                      <div>
                        <a
                          href={request.supporting_document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          View Supporting Document
                        </a>
                      </div>
                    )}

                    {request.approval_status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {request.approval_status === "rejected" && request.rejection_reason && (
                      <div className="bg-red-50 p-3 rounded">
                        <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-700">{request.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
