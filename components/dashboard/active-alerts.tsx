"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, AlertTriangle } from "lucide-react"

interface Alert {
  id?: string
  alert_type?: string
  description?: string
  severity?: string
  student_id?: string
  created_at?: string
}

interface ActiveAlertsProps {
  alerts: Alert[]
}

export function ActiveAlerts({ alerts }: ActiveAlertsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "urgent":
        return "text-red-600 dark:text-red-400"
      case "high":
        return "text-orange-600 dark:text-orange-400"
      default:
        return "text-yellow-600 dark:text-yellow-400"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          Active Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No active alerts</p>
          ) : (
            alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors border-l-2 border-orange-400"
              >
                <AlertTriangle
                  className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getSeverityColor(alert.severity || "normal")}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{alert.alert_type || "System Alert"}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{alert.description}</p>
                  {alert.created_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.created_at).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
