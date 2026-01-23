'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, User, Video, Mic, Phone, CheckCircle, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AnomalyCardProps {
  anomaly: {
    id: string
    anomaly_type: string
    severity: 'critical' | 'warning' | 'watchlist'
    user_name: string
    detected_location: string
    expected_location?: string
    detected_at: string
    duration_minutes: number
    description: string
    user_id?: string
  }
}

export function AnomalyCard({ anomaly }: AnomalyCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const severityConfig = {
    critical: {
      bg: 'bg-red-50 border-red-200',
      badge: 'bg-red-100 text-red-800',
      icon: '🚨'
    },
    warning: {
      bg: 'bg-orange-50 border-orange-200',
      badge: 'bg-orange-100 text-orange-800',
      icon: '⚠️'
    },
    watchlist: {
      bg: 'bg-yellow-50 border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-800',
      icon: '🟡'
    }
  }
  
  const config = severityConfig[anomaly.severity]
  
  const handleResolve = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/anomalies/${anomaly.id}/resolve`, {
        method: 'POST'
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error resolving anomaly:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleEscalate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/anomalies/${anomaly.id}/escalate`, {
        method: 'POST'
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error escalating anomaly:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleVoiceIntervention = () => {
    router.push(`/admin/interventions?anomaly=${anomaly.id}`)
  }
  
  const timeSince = Math.floor((new Date().getTime() - new Date(anomaly.detected_at).getTime()) / 60000)
  
  return (
    <Card className={`${config.bg} border-2`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl">{config.icon}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">{anomaly.description}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {anomaly.user_name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {timeSince} mins ago
                </span>
              </div>
            </div>
          </div>
          <Badge className={config.badge}>
            {anomaly.severity.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm bg-white p-3 rounded-lg">
          <div>
            <span className="text-gray-500 block mb-1">Current Location:</span>
            <p className="font-medium flex items-center gap-1 text-gray-900">
              <MapPin className="w-4 h-4 text-red-500" />
              {anomaly.detected_location}
            </p>
          </div>
          {anomaly.expected_location && (
            <div>
              <span className="text-gray-500 block mb-1">Expected Location:</span>
              <p className="font-medium flex items-center gap-1 text-gray-900">
                <MapPin className="w-4 h-4 text-green-500" />
                {anomaly.expected_location}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleVoiceIntervention}
            disabled={isLoading}
            className="bg-white"
          >
            <Mic className="w-4 h-4 mr-1" />
            Voice Intervention
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            disabled={isLoading}
            className="bg-white"
          >
            <Video className="w-4 h-4 mr-1" />
            View Feed
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            disabled={isLoading}
            className="bg-white"
          >
            <Phone className="w-4 h-4 mr-1" />
            Call Prefect
          </Button>
          
          <div className="flex-1" />
          
          <Button 
            size="sm" 
            variant="default"
            onClick={handleResolve}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Mark Resolved
          </Button>
          
          <Button 
            size="sm" 
            variant="destructive"
            onClick={handleEscalate}
            disabled={isLoading}
          >
            <AlertTriangle className="w-4 h-4 mr-1" />
            Escalate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
