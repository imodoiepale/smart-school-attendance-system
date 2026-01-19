"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, LogOut, Clock } from "lucide-react"

interface Activity {
  id?: string
  student_id?: string
  event_type?: string
  timestamp?: string
  attendance_status?: string
  students?: {
    student_id: string
    full_name: string
    first_name?: string
    last_name?: string
    class?: string
  }
  created_at?: string
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (activity: Activity) => {
    const type = activity.event_type || activity.attendance_status || ""
    switch (type) {
      case "entry":
      case "present":
      case "on_time":
        return CheckCircle
      case "exit":
      case "off_campus":
        return LogOut
      case "late_minor":
      case "late_major":
      case "very_late":
        return Clock
      case "absent":
        return AlertCircle
      default:
        return CheckCircle
    }
  }

  const getActivityColor = (activity: Activity) => {
    const type = activity.event_type || activity.attendance_status || ""
    switch (type) {
      case "entry":
      case "present":
      case "on_time":
        return "text-green-600 dark:text-green-400"
      case "exit":
      case "off_campus":
        return "text-blue-600 dark:text-blue-400"
      case "absent":
        return "text-red-600 dark:text-red-400"
      case "late_minor":
      case "late_major":
      case "very_late":
        return "text-orange-600 dark:text-orange-400"
      default:
        return "text-primary"
    }
  }

  const getActivityDescription = (activity: Activity) => {
    const studentName = activity.students?.full_name || 
      (activity.students?.first_name && activity.students?.last_name
        ? `${activity.students.first_name} ${activity.students.last_name}`
        : "Unknown Student")

    const eventType = activity.event_type || activity.attendance_status || ""

    switch (eventType) {
      case "entry":
      case "present":
      case "on_time":
        return `${studentName} entered campus`
      case "exit":
      case "off_campus":
        return `${studentName} exited campus`
      case "absent":
        return `${studentName} marked absent`
      case "late_minor":
        return `${studentName} arrived late (5-15 min)`
      case "late_major":
        return `${studentName} arrived late (15-30 min)`
      case "very_late":
        return `${studentName} arrived very late (30+ min)`
      default:
        return `${studentName} - ${eventType || "Activity logged"}`
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity, idx) => {
              const Icon = getActivityIcon(activity)
              return (
                <div
                  key={activity.id || idx}
                  className="flex items-start gap-4 pb-4 border-b border-border last:border-0"
                >
                  <Icon
                    className={`w-5 h-5 ${getActivityColor(activity)} mt-0.5 flex-shrink-0`}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{getActivityDescription(activity)}</p>
                    {activity.students?.class && (
                      <p className="text-xs text-muted-foreground">{activity.students.class}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.timestamp ? formatTime(activity.timestamp) : 
                     activity.created_at ? formatTime(activity.created_at) : "Recently"}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
