'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface EntryApprovalCardProps {
  approval: any
}

export function EntryApprovalCard({ approval }: EntryApprovalCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/gate/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: approval.id })
      })
      
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error approving:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleDeny = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/gate/deny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          request_id: approval.id,
          denial_reason: 'Denied by gate guard'
        })
      })
      
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error denying:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const urgencyColors = {
    low: 'bg-gray-100 text-gray-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    emergency: 'bg-red-100 text-red-800'
  }
  
  return (
    <Card className="p-4 border-2 border-orange-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{approval.user_name}</h3>
            <Badge className={urgencyColors[approval.urgency as keyof typeof urgencyColors]}>
              {approval.urgency}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 capitalize">
            {approval.request_type.replace(/_/g, ' ')}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <Clock className="w-4 h-4 inline mr-1" />
          {new Date(approval.requested_at).toLocaleTimeString()}
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg mb-3">
        <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
        <p className="text-sm text-gray-600">{approval.reason}</p>
      </div>
      
      <div className="text-xs text-gray-500 mb-3">
        <strong>Gate:</strong> {approval.gate_location} • <strong>Guard:</strong> {approval.guard_name}
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={handleApprove}
          disabled={isLoading}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Approve
        </Button>
        <Button
          onClick={handleDeny}
          disabled={isLoading}
          variant="destructive"
          className="flex-1"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Deny
        </Button>
      </div>
    </Card>
  )
}
