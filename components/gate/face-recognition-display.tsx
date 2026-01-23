'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, CheckCircle, XCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

export function FaceRecognitionDisplay() {
  const [detectionStatus, setDetectionStatus] = useState<'idle' | 'detecting' | 'recognized' | 'unknown'>('idle')
  const [detectedPerson, setDetectedPerson] = useState<any>(null)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Live Face Recognition
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
          
          <div className="relative z-10 text-center">
            <Camera className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/80 text-lg font-medium">Camera Feed Active</p>
            <p className="text-white/60 text-sm mt-2">Waiting for face detection...</p>
          </div>
          
          {detectionStatus === 'recognized' && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Recognized</span>
            </div>
          )}
          
          {detectionStatus === 'unknown' && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse">
              <XCircle className="w-5 h-5" />
              <span className="font-semibold">Unknown Face</span>
            </div>
          )}
        </div>
        
        {detectedPerson && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">{detectedPerson.name}</p>
                <p className="text-sm text-gray-600">{detectedPerson.id} • {detectedPerson.class}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          Face recognition system active • Confidence threshold: 85%
        </div>
      </CardContent>
    </Card>
  )
}
