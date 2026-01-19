"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Eye, Edit2, Trash2 } from "lucide-react"

interface Event {
  id: string
  name: string
  type: string
  date_start: string
  location: string | null
  status: string
  created_by: string
}

interface EventsListProps {
  status: string
}

export function EventsList({ status }: EventsListProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      const { data } = await supabase
        .from("special_events")
        .select("*")
        .eq("status", status)
        .order("date_start", { ascending: status === "completed" ? false : true })

      setEvents(data || [])
      setLoading(false)
    }

    fetchEvents()
  }, [status])

  const getTypeColor = (type: string) => {
    const colors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      field_trip: "default",
      sports_event: "secondary",
      competition: "secondary",
      assembly: "outline",
      other: "outline",
    }
    return colors[type] || "outline"
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
    <div className="space-y-4">
      {events.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No {status} events</p>
          </CardContent>
        </Card>
      ) : (
        events.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{event.name}</h3>
                    <Badge variant={getTypeColor(event.type)}>{event.type.replace("_", " ")}</Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.date_start).toLocaleDateString()}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  {status !== "completed" && (
                    <>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
