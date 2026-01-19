import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, MapPin, Calendar, Users } from "lucide-react"
import { getStatusColor } from "@/utils/statusColor" // Import getStatusColor function

export default async function SpecialEventsManagement() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch special events with participants
  const [events, eventParticipants] = await Promise.all([
    supabase.from("special_events").select("*").order("date_start", { ascending: false }),
    supabase.from("event_participants").select("*, students(full_name)"),
  ])

  const eventData = events.data || []
  const participantData = eventParticipants.data || []

  // Count participants per event
  const participantCount = eventData.map((event) => ({
    eventId: event.id,
    count: participantData.filter((p) => p.event_id === event.id).length,
  }))



  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Special Events Management</h1>
          <p className="text-gray-600 mt-2">Manage field trips, sports events, and activities</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Events Grid */}
      {eventData.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No events created yet</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create First Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventData.map((event) => {
            const partCount = participantCount.find((p) => p.eventId === event.id)?.count || 0
            const eventDate = new Date(event.date_start)

            return (
              <Card key={event.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{event.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1 capitalize">{event.type}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Event Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{eventDate.toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location || "Location TBD"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{partCount} students registered</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="pt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>

                  {/* Expected Return Time */}
                  {event.expected_return_time && (
                    <div className="text-sm">
                      <span className="text-gray-500">Expected Return:</span>
                      <p className="font-medium">{new Date(event.expected_return_time).toLocaleTimeString()}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      Edit
                    </Button>
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
