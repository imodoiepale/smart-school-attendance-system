"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { UserPlus, AlertCircle, RefreshCw, Database, CheckCircle2, Save } from "lucide-react"
import { ModernHeader } from "@/components/modern-header"

interface UnregisteredPerson {
  user_id: string
  user_name: string
  person_type: string
  capture_image_url: string | null
  first_seen: string
  detection_count: number
  // Editable fields
  form: string
  stream: string
  selected: boolean
}

const FORMS = ["Form 1", "Form 2", "Form 3", "Form 4"]
const STREAMS = ["A", "B", "C", "D", "E"]

export default function UnregisteredPeople() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [people, setPeople] = useState<UnregisteredPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncStats, setSyncStats] = useState<{ totalStudents: number; inRegistry: number; needsSync: number } | null>(null)
  const [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    checkUser()
    fetchUnregistered()
    checkSyncStatus()
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
      // Initialize with editable fields
      const peopleWithFields = (data.unregistered || []).map((p: any) => ({
        ...p,
        form: "Form 1",
        stream: "A",
        selected: false
      }))
      setPeople(peopleWithFields)
    }
    setLoading(false)
  }

  const checkSyncStatus = async () => {
    const response = await fetch("/api/students/sync-registry")
    if (response.ok) {
      const data = await response.json()
      setSyncStats(data)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    const response = await fetch("/api/students/sync-registry", { method: "POST" })
    if (response.ok) {
      const data = await response.json()
      alert(`Synced ${data.synced} students to registry!`)
      fetchUnregistered()
      checkSyncStatus()
    } else {
      alert("Failed to sync students")
    }
    setSyncing(false)
  }

  const updatePerson = (userId: string, field: keyof UnregisteredPerson, value: any) => {
    setPeople(prev => prev.map(p => 
      p.user_id === userId ? { ...p, [field]: value } : p
    ))
  }

  const toggleSelectAll = () => {
    const newValue = !selectAll
    setSelectAll(newValue)
    setPeople(prev => prev.map(p => ({ ...p, selected: newValue })))
  }

  const selectedCount = people.filter(p => p.selected).length

  const handleBulkRegister = async () => {
    const toRegister = people.filter(p => p.selected)
    if (toRegister.length === 0) {
      alert("Please select at least one person to register")
      return
    }

    setRegistering(true)
    let successCount = 0
    let failCount = 0

    for (const person of toRegister) {
      try {
        const response = await fetch("/api/students/unregistered", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: person.user_id,
            user_name: person.user_name,
            photo_url: person.capture_image_url,
            class: `${person.form}${person.stream}`,
            stream: person.stream,
          }),
        })
        if (response.ok) {
          successCount++
        } else {
          failCount++
        }
      } catch {
        failCount++
      }
    }

    alert(`Registered ${successCount} students successfully${failCount > 0 ? `, ${failCount} failed` : ''}`)
    fetchUnregistered()
    setRegistering(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader user={user} title="Unregistered People" subtitle="Detected by cameras but not in system" />

      <main className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Sync Card */}
        {syncStats && syncStats.needsSync > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">
                      {syncStats.needsSync} students in database need syncing
                    </p>
                    <p className="text-sm text-blue-700">
                      Found {syncStats.totalStudents} students in DB, {syncStats.inRegistry} in registry.
                    </p>
                  </div>
                </div>
                <Button onClick={handleSync} disabled={syncing} className="bg-blue-600 hover:bg-blue-700">
                  {syncing ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Syncing...</> : <><RefreshCw className="w-4 h-4 mr-2" />Sync Now</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alert Card */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-900">
                    {people.length} unregistered {people.length === 1 ? 'person' : 'people'} detected
                  </p>
                  <p className="text-sm text-orange-700">
                    Edit Form & Stream in the table below, then select and register them all at once.
                  </p>
                </div>
              </div>
              {selectedCount > 0 && (
                <Button 
                  onClick={handleBulkRegister} 
                  disabled={registering}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {registering ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Registering...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" />Register {selectedCount} Selected</>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Editable Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bulk Registration Table</CardTitle>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={fetchUnregistered}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="py-3 px-3 text-left">
                      <Checkbox 
                        checked={selectAll} 
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="py-3 px-3 text-left font-semibold">#</th>
                    <th className="py-3 px-3 text-left font-semibold">Photo</th>
                    <th className="py-3 px-3 text-left font-semibold">ID</th>
                    <th className="py-3 px-3 text-left font-semibold">Name</th>
                    <th className="py-3 px-3 text-left font-semibold">Detections</th>
                    <th className="py-3 px-3 text-left font-semibold">First Seen</th>
                    <th className="py-3 px-3 text-left font-semibold w-32">Form</th>
                    <th className="py-3 px-3 text-left font-semibold w-24">Stream</th>
                    <th className="py-3 px-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-muted-foreground">
                        <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />
                        Loading...
                      </td>
                    </tr>
                  ) : people.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-muted-foreground">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
                        <p className="text-lg font-medium text-green-700">All people are registered!</p>
                        <p className="text-sm">No unregistered people found</p>
                      </td>
                    </tr>
                  ) : (
                    people.map((person, idx) => (
                      <tr 
                        key={person.user_id} 
                        className={`border-b hover:bg-gray-50 ${person.selected ? 'bg-green-50' : ''}`}
                      >
                        <td className="py-3 px-3">
                          <Checkbox 
                            checked={person.selected}
                            onCheckedChange={(checked) => updatePerson(person.user_id, 'selected', checked)}
                          />
                        </td>
                        <td className="py-3 px-3 text-gray-500 font-mono text-xs">{idx + 1}</td>
                        <td className="py-3 px-3">
                          {person.capture_image_url ? (
                            <img
                              src={person.capture_image_url}
                              alt={person.user_name}
                              className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-700">
                              {person.user_name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-gray-600">{person.user_id}</td>
                        <td className="py-3 px-3 font-medium">{person.user_name}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {person.detection_count}x
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs text-gray-500">
                          {new Date(person.first_seen).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          <Select 
                            value={person.form} 
                            onValueChange={(v) => updatePerson(person.user_id, 'form', v)}
                          >
                            <SelectTrigger className="w-28 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FORMS.map(f => (
                                <SelectItem key={f} value={f}>{f}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-3">
                          <Select 
                            value={person.stream} 
                            onValueChange={(v) => updatePerson(person.user_id, 'stream', v)}
                          >
                            <SelectTrigger className="w-20 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STREAMS.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-3">
                          {person.selected ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" />
                              Ready
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Action Bar */}
            {people.length > 0 && (
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedCount} of {people.length} selected
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setPeople(prev => prev.map(p => ({ ...p, selected: true })))}>
                    Select All
                  </Button>
                  <Button variant="outline" onClick={() => setPeople(prev => prev.map(p => ({ ...p, selected: false })))}>
                    Clear Selection
                  </Button>
                  <Button 
                    onClick={handleBulkRegister} 
                    disabled={registering || selectedCount === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {registering ? (
                      <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Registering...</>
                    ) : (
                      <><UserPlus className="w-4 h-4 mr-2" />Register {selectedCount} Students</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
