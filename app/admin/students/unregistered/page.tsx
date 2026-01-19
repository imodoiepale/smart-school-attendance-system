"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, AlertCircle } from "lucide-react"
import { ModernHeader } from "@/components/modern-header"

export default function UnregisteredPeople() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [unregistered, setUnregistered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPerson, setSelectedPerson] = useState<any>(null)
  const [registering, setRegistering] = useState(false)
  const [formData, setFormData] = useState({ class: "", stream: "" })

  useEffect(() => {
    checkUser()
    fetchUnregistered()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
    } else {
      setUser(user)
    }
  }

  const fetchUnregistered = async () => {
    setLoading(true)
    const response = await fetch("/api/students/unregistered")
    if (response.ok) {
      const data = await response.json()
      setUnregistered(data.unregistered || [])
    }
    setLoading(false)
  }

  const handleRegister = async () => {
    if (!selectedPerson || !formData.class || !formData.stream) {
      alert("Please fill in Class and Stream")
      return
    }

    setRegistering(true)
    const response = await fetch("/api/students/unregistered", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: selectedPerson.user_id,
        user_name: selectedPerson.user_name,
        photo_url: selectedPerson.capture_image_url,
        class: formData.class,
        stream: formData.stream,
      }),
    })

    if (response.ok) {
      alert("Student registered successfully!")
      setSelectedPerson(null)
      setFormData({ class: "", stream: "" })
      fetchUnregistered()
    } else {
      alert("Failed to register student")
    }
    setRegistering(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader user={user} title="Unregistered People" subtitle="Detected by cameras but not in system" />

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-900">
                  {unregistered.length} unregistered {unregistered.length === 1 ? 'person' : 'people'} detected
                </p>
                <p className="text-sm text-orange-700">
                  These people were detected by cameras but are not in the user registry. Click to add them.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unregistered People Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Detected People</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Photo</th>
                      <th className="text-left py-3 px-4 font-medium">ID</th>
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Detections</th>
                      <th className="text-left py-3 px-4 font-medium">First Seen</th>
                      <th className="text-left py-3 px-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                          Loading...
                        </td>
                      </tr>
                    ) : unregistered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                          No unregistered people found
                        </td>
                      </tr>
                    ) : (
                      unregistered.map((person) => (
                        <tr 
                          key={person.user_id} 
                          className={`border-b border-border hover:bg-muted/50 cursor-pointer ${
                            selectedPerson?.user_id === person.user_id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => setSelectedPerson(person)}
                        >
                          <td className="py-3 px-4">
                            {person.capture_image_url ? (
                              <img
                                src={person.capture_image_url}
                                alt={person.user_name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xs font-semibold text-orange-700">
                                {person.user_name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs">{person.user_id}</td>
                          <td className="py-3 px-4 font-medium">{person.user_name}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {person.detection_count}x
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">
                            {new Date(person.first_seen).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedPerson(person)
                              }}
                            >
                              <UserPlus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Register Student</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPerson ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-3 pb-4 border-b">
                    {selectedPerson.capture_image_url ? (
                      <img
                        src={selectedPerson.capture_image_url}
                        alt={selectedPerson.user_name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700">
                        {selectedPerson.user_name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="text-center">
                      <p className="font-semibold text-lg">{selectedPerson.user_name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{selectedPerson.user_id}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Detected {selectedPerson.detection_count} times
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="class">Class *</Label>
                      <Input
                        id="class"
                        required
                        value={formData.class}
                        onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                        placeholder="Form 1A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stream">Stream *</Label>
                      <Input
                        id="stream"
                        required
                        value={formData.stream}
                        onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                        placeholder="Science"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleRegister}
                    disabled={registering || !formData.class || !formData.stream}
                    className="w-full"
                  >
                    {registering ? "Registering..." : "Register Student"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Click on a person from the table to register them</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
