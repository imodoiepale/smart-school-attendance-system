import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Wifi, WifiOff, RefreshCw } from "lucide-react"

export default async function CameraManagement() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch cameras
  const { data: cameras } = await supabase
    .from("cameras")
    .select("*")
    .order("created_at", { ascending: false })

  const cameraData = cameras || []
  const onlineCameras = cameraData.filter((c) => c.status === "online").length
  const totalCameras = cameraData.length

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Camera Management</h1>
          <p className="text-gray-600 mt-2">Monitor and configure facial recognition cameras</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Camera
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Cameras</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{totalCameras}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Online</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{onlineCameras}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Offline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{totalCameras - onlineCameras}</p>
          </CardContent>
        </Card>
      </div>

      {/* Cameras List */}
      <Card>
        <CardHeader>
          <CardTitle>All Cameras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Location</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Last Heartbeat</th>
                  <th className="text-left py-3 px-4 font-medium">Detections Today</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cameraData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No cameras configured yet
                    </td>
                  </tr>
                ) : (
                  cameraData.map((camera) => (
                    <tr key={camera.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{camera.location || camera.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {camera.status === "online" ? (
                            <>
                              <Wifi className="w-4 h-4 text-green-600" />
                              <span className="text-green-600">Online</span>
                            </>
                          ) : (
                            <>
                              <WifiOff className="w-4 h-4 text-red-600" />
                              <span className="text-red-600">Offline</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {camera.last_heartbeat
                          ? new Date(camera.last_heartbeat).toLocaleTimeString()
                          : "Never"}
                      </td>
                      <td className="py-3 px-4">{camera.detection_count_today || 0}</td>
                      <td className="py-3 px-4 flex gap-2">
                        <Button variant="ghost" size="sm">
                          <RefreshCw className="w-4 h-4" />
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
    </div>
  )
}
