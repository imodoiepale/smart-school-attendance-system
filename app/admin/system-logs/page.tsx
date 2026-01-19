"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, AlertCircle, Info, AlertTriangle, XCircle } from "lucide-react"
import { ModernHeader } from "@/components/modern-header"

export default function SystemLogs() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")

  useEffect(() => {
    checkUser()
    fetchLogs()
  }, [severityFilter])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
    } else {
      setUser(user)
    }
  }

  const fetchLogs = async () => {
    setLoading(true)
    let query = supabase
      .from("system_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)

    if (severityFilter !== "all") {
      query = query.eq("severity", severityFilter)
    }

    const { data } = await query
    setLogs(data || [])
    setLoading(false)
  }

  if (!user) return null

  const filteredLogs = logs.filter(log =>
    log.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.log_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user_id?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "error":
        return <Badge variant="destructive">{severity}</Badge>
      case "warning":
        return <Badge className="bg-yellow-500 text-white">{severity}</Badge>
      case "info":
        return <Badge variant="default">{severity}</Badge>
      default:
        return <Badge variant="secondary">{severity}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader user={user} title="System Logs" subtitle="Monitor system activity and errors" />

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={severityFilter === "all" ? "default" : "outline"}
              onClick={() => setSeverityFilter("all")}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={severityFilter === "error" ? "default" : "outline"}
              onClick={() => setSeverityFilter("error")}
              size="sm"
            >
              Errors
            </Button>
            <Button
              variant={severityFilter === "warning" ? "default" : "outline"}
              onClick={() => setSeverityFilter("warning")}
              size="sm"
            >
              Warnings
            </Button>
            <Button
              variant={severityFilter === "info" ? "default" : "outline"}
              onClick={() => setSeverityFilter("info")}
              size="sm"
              >
              Info
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Logs ({filteredLogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">Loading...</p>
              ) : filteredLogs.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No logs found</p>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(log.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getSeverityBadge(log.severity)}
                          <Badge variant="outline">{log.log_type}</Badge>
                          {log.log_category && (
                            <Badge variant="secondary">{log.log_category}</Badge>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {log.message}
                        </p>
                        {log.user_id && (
                          <p className="text-xs text-muted-foreground">
                            User: {log.user_id}
                          </p>
                        )}
                        {log.camera_id && (
                          <p className="text-xs text-muted-foreground">
                            Camera: {log.camera_id}
                          </p>
                        )}
                        {log.metadata && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 cursor-pointer hover:underline">
                              View metadata
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
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
