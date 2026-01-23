'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, User, Camera, AlertCircle } from 'lucide-react'

interface EvidencePanelProps {
  anomaly: any
}

export function EvidencePanel({ anomaly }: EvidencePanelProps) {
  const timeSince = Math.floor((new Date().getTime() - new Date(anomaly.detected_at).getTime()) / 60000)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Incident Evidence</span>
          <Badge variant={anomaly.severity === 'critical' ? 'destructive' : 'secondary'}>
            {anomaly.severity.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Camera className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Live Camera Feed</p>
            <p className="text-xs">{anomaly.camera_name || 'Camera unavailable'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Student</span>
            </div>
            <p className="font-semibold text-gray-900">{anomaly.user_name}</p>
            <p className="text-sm text-gray-600">{anomaly.user_id}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Duration</span>
            </div>
            <p className="font-semibold text-gray-900">{timeSince} minutes</p>
            <p className="text-sm text-gray-600">
              Since {new Date(anomaly.detected_at).toLocaleTimeString()}
            </p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Current Location</span>
            </div>
            <p className="font-semibold text-gray-900">{anomaly.detected_location}</p>
          </div>
          
          {anomaly.expected_location && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Expected Location</span>
              </div>
              <p className="font-semibold text-gray-900">{anomaly.expected_location}</p>
            </div>
          )}
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Anomaly Type</span>
          </div>
          <p className="font-semibold text-gray-900 capitalize">
            {anomaly.anomaly_type.replace(/_/g, ' ')}
          </p>
          <p className="text-sm text-gray-600 mt-1">{anomaly.description}</p>
        </div>
        
        {anomaly.context_data && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="text-sm font-medium text-gray-600 block mb-2">Additional Context</span>
            <pre className="text-xs text-gray-700 overflow-auto">
              {JSON.stringify(anomaly.context_data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
