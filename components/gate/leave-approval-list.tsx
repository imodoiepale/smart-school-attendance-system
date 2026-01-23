'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User } from 'lucide-react'

interface LeaveApprovalListProps {
  leaves: any[]
}

export function LeaveApprovalList({ leaves }: LeaveApprovalListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Expected Exits ({leaves.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaves.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No expected exits today</p>
          </div>
        ) : (
          leaves.map(leave => (
            <div key={leave.id} className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-semibold">{leave.student_name}</p>
                  <p className="text-sm text-gray-600">{leave.class}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 capitalize">
                  {leave.leave_type.replace(/_/g, ' ')}
                </Badge>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(leave.start_datetime).toLocaleTimeString()} - 
                    {new Date(leave.end_datetime).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{leave.guardian_name} ({leave.guardian_relationship})</span>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-500 bg-white p-2 rounded">
                <strong>Reason:</strong> {leave.leave_reason}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
