"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import type { JSX } from "react/jsx-runtime"

interface AbsenceRequest {
  id: string
  student_id: string
  reason: string
  start_date: string
  end_date: string
  status: string
  document_url: string | null
}

export function AbsenceRequests() {
  const [requests, setRequests] = useState<AbsenceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true)
      const { data } = await supabase.from("absences").select("*").order("created_at", { ascending: false })

      setRequests(data || [])
      setLoading(false)
    }

    fetchRequests()
  }, [])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "text-orange-600 dark:text-orange-400",
      approved: "text-green-600 dark:text-green-400",
      rejected: "text-red-600 dark:text-red-400",
    }
    return colors[status] || "text-gray-600"
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      pending: <Clock className="w-5 h-5" />,
      approved: <CheckCircle className="w-5 h-5" />,
      rejected: <XCircle className="w-5 h-5" />,
    }
    return icons[status]
  }

  const handleApprove = async (id: string) => {
    await supabase.from("absences").update({ status: "approved" }).eq("id", id)
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "approved" } : r)))
  }

  const handleReject = async (id: string) => {
    await supabase.from("absences").update({ status: "rejected" }).eq("id", id)
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {requests.length} Absence Request{requests.length !== 1 ? "s" : ""}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground">No absence requests</p>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className={`${getStatusColor(request.status)} flex-shrink-0`}>{getStatusIcon(request.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium">{request.reason}</h3>
                    <Badge variant={request.status === "approved" ? "default" : "secondary"}>{request.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(request.start_date).toLocaleDateString()} to{" "}
                    {new Date(request.end_date).toLocaleDateString()}
                  </p>
                </div>
                {request.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleReject(request.id)}>
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => handleApprove(request.id)}>
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
