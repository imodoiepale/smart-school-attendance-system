import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users, Activity } from 'lucide-react'

export default async function LiveMapPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  const [whereaboutsData, camerasData] = await Promise.all([
    supabase
      .from('student_whereabouts')
      .select('*')
      .order('updated_at', { ascending: false }),
    
    supabase
      .from('camera_metadata')
      .select('*')
      .eq('is_active', true)
  ])
  
  const whereabouts = whereaboutsData.data || []
  const cameras = camerasData.data || []
  
  const locationGroups = whereabouts.reduce((acc: any, item) => {
    const loc = item.current_location || 'Unknown'
    if (!acc[loc]) acc[loc] = []
    acc[loc].push(item)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-[1800px] mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900">Real-Time Kinetic Map</h1>
          <p className="text-gray-600 mt-1">Live student location tracking across campus</p>
          
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-1">{whereabouts.length}</div>
                  <div className="text-sm text-gray-600">Students Tracked</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-1">{Object.keys(locationGroups).length}</div>
                  <div className="text-sm text-gray-600">Active Locations</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-1">{cameras.filter(c => c.is_online).length}</div>
                  <div className="text-sm text-gray-600">Cameras Online</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-1">
                    {whereabouts.filter(w => !w.location_match).length}
                  </div>
                  <div className="text-sm text-gray-600">Location Mismatches</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <main className="max-w-[1800px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Campus Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <MapPin className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">Interactive Campus Map</p>
                    <p className="text-sm mt-2">Real-time student location visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Location Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(locationGroups).slice(0, 10).map(([location, students]: [string, any]) => (
                  <div key={location} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{location}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {students.length}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
