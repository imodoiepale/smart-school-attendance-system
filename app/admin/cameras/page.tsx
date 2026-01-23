import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { AddCameraModal } from "@/components/admin/AddCameraModal"

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
    .from("camera_metadata")
    .select("*")
    .order("created_at", { ascending: false })

  const cameraData = cameras || []
  const onlineCameras = cameraData.filter((c) => c.is_online).length
  const totalCameras = cameraData.length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-[1600px] mx-auto p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Camera Management</h1>
              <p className="text-gray-600 mt-1">Monitor and configure facial recognition cameras</p>
            </div>
            <AddCameraModal />
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-1">{totalCameras}</div>
                  <div className="text-sm text-gray-600">Total Cameras</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-1">{onlineCameras}</div>
                  <div className="text-sm text-gray-600">Online</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-1">{totalCameras - onlineCameras}</div>
                  <div className="text-sm text-gray-600">Offline</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-1">
                    {cameraData.reduce((sum, c) => sum + (c.total_detections_today || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Detections Today</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
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
                      <td className="py-3 px-4 font-medium">
                        <div className="flex flex-col">
                          <span>{camera.display_name}</span>
                          <span className="text-xs text-muted-foreground">{camera.location_tag}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {camera.is_online ? (
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
                      <td className="py-3 px-4 py-8 text-center">{camera.total_detections_today || 0}</td>
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
      </main>
    </div>
  )
}
