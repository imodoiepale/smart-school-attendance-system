"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface EventData {
  event_id: string
  event_name: string
  total_students: number
  departed: number
  returned: number
  missing: number
}

export function EventReports() {
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true)

      // Mock data - in production, fetch real event analytics
      const mockData = [
        {
          event_id: "1",
          event_name: "Science Museum Trip",
          total_students: 50,
          departed: 50,
          returned: 48,
          missing: 0,
        },
        {
          event_id: "2",
          event_name: "Sports Day",
          total_students: 480,
          departed: 475,
          returned: 475,
          missing: 0,
        },
        {
          event_id: "3",
          event_name: "Annual Debate",
          total_students: 25,
          departed: 25,
          returned: 25,
          missing: 0,
        },
        {
          event_id: "4",
          event_name: "Engineering Workshop",
          total_students: 60,
          departed: 58,
          returned: 57,
          missing: 1,
        },
      ]

      setEvents(mockData)
      setLoading(false)
    }

    fetchEventData()
  }, [])

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
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.event_id}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{event.event_name}</h3>
                  <p className="text-sm text-muted-foreground">Total Students: {event.total_students}</p>
                </div>
                {event.missing === 0 ? (
                  <Badge variant="default">Completed</Badge>
                ) : (
                  <Badge variant="destructive">{event.missing} Missing</Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Departed</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{event.departed}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Returned</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{event.returned}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Missing</p>
                  <p
                    className={`text-2xl font-bold ${event.missing > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
                  >
                    {event.missing}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
