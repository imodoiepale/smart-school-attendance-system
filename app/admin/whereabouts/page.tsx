"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, AlertTriangle } from "lucide-react"
import { ModernHeader } from "@/components/modern-header"

export default function StudentWhereabouts() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [whereabouts, setWhereabouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    checkUser()
    fetchWhereabouts()
    
    // Real-time subscription with optimized updates
    const channelName = `student_whereabouts-${Math.random().toString(36).substring(7)}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'student_whereabouts' },
        (payload: any) => {
          setWhereabouts(prev => [payload.new, ...prev])
          console.log('📍 New whereabouts record:', payload.new.user_id)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'student_whereabouts' },
        (payload: any) => {
          setWhereabouts(prev => prev.map((w: any) => w.user_id === payload.new.user_id ? payload.new : w))
          console.log('✏️ Whereabouts updated:', payload.new.user_id)
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'student_whereabouts' },
        (payload: any) => {
          setWhereabouts(prev => prev.filter((w: any) => w.user_id !== payload.old.user_id))
          console.log('🗑️ Whereabouts deleted:', payload.old.user_id)
        }
      )
      .subscribe((status: string, err?: Error) => {
        console.log('📡 Student whereabouts realtime:', status)
        if (err) console.error('Subscription error:', err)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
    } else {
      setUser(user)
    }
  }

  const fetchWhereabouts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("student_whereabouts")
      .select("*")
      .order("updated_at", { ascending: false })
    setWhereabouts(data || [])
    setLoading(false)
  }

  if (!user) return null

  const filteredWhereabouts = whereabouts.filter(w =>
    w.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.user_id?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const discrepancies = whereabouts.filter(w => !w.location_match)

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader user={user} title="Student Whereabouts" subtitle="Real-time location tracking" />

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{whereabouts.length}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
                <MapPin className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{whereabouts.filter(w => w.location_match).length}</p>
                  <p className="text-sm text-muted-foreground">At Expected Location</p>
                </div>
                <MapPin className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">{discrepancies.length}</p>
                  <p className="text-sm text-muted-foreground">Location Discrepancies</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Whereabouts</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4">Student</th>
                    <th className="text-left py-3 px-4">Current Location</th>
                    <th className="text-left py-3 px-4">Expected Location</th>
                    <th className="text-left py-3 px-4">Arrived</th>
                    <th className="text-left py-3 px-4">Expected Until</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredWhereabouts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    filteredWhereabouts.map((record) => (
                      <tr key={record.user_id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{record.user_name}</p>
                            <p className="text-xs text-muted-foreground">{record.user_id}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span>{record.current_location || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{record.expected_location || "N/A"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {new Date(record.arrived_at).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {record.expected_until
                            ? new Date(record.expected_until).toLocaleTimeString()
                            : "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          {record.location_match ? (
                            <Badge variant="default">Match</Badge>
                          ) : (
                            <Badge variant="destructive">Discrepancy</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {new Date(record.updated_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
