"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogOut, LogIn, Clock } from "lucide-react"
import { ModernHeader } from "@/components/modern-header"

export default function StudentMovements() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    fetchMovements()
    
    // Real-time subscription
    const channel = supabase
      .channel('student_movements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_movements' }, () => {
        fetchMovements()
      })
      .subscribe()

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

  const fetchMovements = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("student_movements")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(100)
    setMovements(data || [])
    setLoading(false)
  }

  if (!user) return null

  const exitMovements = movements.filter(m => m.movement_type === "exit" && !m.return_confirmed)
  const todayMovements = movements.filter(m => {
    const today = new Date().toDateString()
    return new Date(m.timestamp).toDateString() === today
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader user={user} title="Student Movements" subtitle="Track entry and exit activities" />

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{exitMovements.length}</p>
                  <p className="text-sm text-muted-foreground">Currently Out</p>
                </div>
                <LogOut className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{todayMovements.length}</p>
                  <p className="text-sm text-muted-foreground">Today's Movements</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {exitMovements.filter(m => m.late_return).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Late Returns</p>
                </div>
                <LogIn className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Movements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4">Student</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Camera</th>
                    <th className="text-left py-3 px-4">Reason</th>
                    <th className="text-left py-3 px-4">Expected Return</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  ) : movements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No movements recorded
                      </td>
                    </tr>
                  ) : (
                    movements.map((movement) => (
                      <tr key={movement.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{movement.student_name}</p>
                            <p className="text-xs text-muted-foreground">{movement.student_id}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={movement.movement_type === "exit" ? "destructive" : "default"}>
                            {movement.movement_type === "exit" ? (
                              <><LogOut className="w-3 h-3 mr-1" /> Exit</>
                            ) : (
                              <><LogIn className="w-3 h-3 mr-1" /> Entry</>
                            )}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs">{movement.camera_name}</td>
                        <td className="py-3 px-4 text-xs">{movement.exit_reason || "N/A"}</td>
                        <td className="py-3 px-4 text-xs">
                          {movement.expected_return_time
                            ? new Date(movement.expected_return_time).toLocaleTimeString()
                            : "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          {movement.movement_type === "exit" && !movement.return_confirmed ? (
                            <Badge variant="outline" className="text-orange-600">Out</Badge>
                          ) : movement.late_return ? (
                            <Badge variant="destructive">Late Return</Badge>
                          ) : (
                            <Badge variant="secondary">Returned</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {new Date(movement.timestamp).toLocaleString()}
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
