"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Clock, Camera, TrendingUp, ArrowUpDown, ChevronUp, ChevronDown, 
  Eye, Utensils, BookOpen, CheckCircle
} from "lucide-react"
import { AttendanceLog, formatTime, formatShortDate, getEventColor, getStatusBadgeClass, getStatusLabel } from "../types"

interface AttendanceLogTableProps {
  logs: AttendanceLog[]
  title?: string
  onLogClick: (log: AttendanceLog) => void
  maxHeight?: string
  showPagination?: boolean
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case 'entry': return <TrendingUp className="w-3 h-3" />
    case 'exit': return <Clock className="w-3 h-3" />
    case 'breakfast':
    case 'lunch':
    case 'supper': return <Utensils className="w-3 h-3" />
    case 'class': return <BookOpen className="w-3 h-3" />
    case 'morning_roll_call':
    case 'evening_roll_call': return <CheckCircle className="w-3 h-3" />
    default: return <Clock className="w-3 h-3" />
  }
}

export function AttendanceLogTable({ 
  logs: initialLogs, 
  title = "Attendance Logs", 
  onLogClick,
  maxHeight = "400px",
  showPagination = true
}: AttendanceLogTableProps) {
  const [logs, setLogs] = useState(initialLogs)
  const [sortField, setSortField] = useState<'timestamp' | 'event_type' | 'attendance_status'>('timestamp')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: 'timestamp' | 'event_type' | 'attendance_status') => {
    const newDirection = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc'
    setSortField(field)
    setSortDirection(newDirection)

    const sorted = [...logs].sort((a, b) => {
      let aVal = a[field] || ''
      let bVal = b[field] || ''
      if (field === 'timestamp') {
        aVal = new Date(a.timestamp).getTime().toString()
        bVal = new Date(b.timestamp).getTime().toString()
      }
      if (newDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      }
      return aVal < bVal ? 1 : -1
    })
    setLogs(sorted)
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-400" />
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
  }

  // Update logs when initialLogs change
  if (initialLogs !== logs && initialLogs.length !== logs.length) {
    setLogs(initialLogs)
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="py-2 px-3 border-b bg-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            {title}
          </CardTitle>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
            {logs.length} records
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto" style={{ maxHeight }}>
          <table className="w-full text-[10px]">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="border-b">
                <th className="text-center py-1.5 px-2 font-semibold text-gray-600 w-8">#</th>
                <th 
                  className="text-left py-1.5 px-2 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center gap-1">Date & Time <SortIcon field="timestamp" /></div>
                </th>
                <th className="text-left py-1.5 px-2 font-semibold text-gray-600">Student</th>
                <th 
                  className="text-left py-1.5 px-2 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('event_type')}
                >
                  <div className="flex items-center gap-1">Event <SortIcon field="event_type" /></div>
                </th>
                <th className="text-left py-1.5 px-2 font-semibold text-gray-600">Camera</th>
                <th className="text-center py-1.5 px-2 font-semibold text-gray-600">Confidence</th>
                <th 
                  className="text-center py-1.5 px-2 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('attendance_status')}
                >
                  <div className="flex items-center justify-center gap-1">Status <SortIcon field="attendance_status" /></div>
                </th>
                <th className="text-center py-1.5 px-2 font-semibold text-gray-600 w-8">View</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-xs">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr 
                    key={log.id} 
                    className={`border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                    onClick={() => onLogClick(log)}
                  >
                    <td className="py-1.5 px-2 text-center text-gray-400 font-mono">{idx + 1}</td>
                    <td className="py-1.5 px-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{formatShortDate(log.timestamp)}</span>
                        <span className="text-gray-500 text-[9px]">{formatTime(log.timestamp)}</span>
                      </div>
                    </td>
                    <td className="py-1.5 px-2">
                      <span className="font-medium text-gray-900 truncate max-w-[100px] block">{log.user_name}</span>
                    </td>
                    <td className="py-1.5 px-2">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-medium ${getEventColor(log.event_type)}`}>
                        {getEventIcon(log.event_type)}
                        {log.event_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-1.5 px-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Camera className="w-2.5 h-2.5 text-gray-400" />
                          <span className="truncate max-w-[70px]" title={log.camera_name}>{log.camera_name}</span>
                        </div>
                        {log.camera_group && (
                          <span className="text-[9px] text-gray-400 truncate max-w-[70px]">{log.camera_group}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      {log.confidence_score ? (
                        <span className={`text-[9px] font-semibold ${log.confidence_score >= 80 ? 'text-green-600' : log.confidence_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {log.confidence_score.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <Badge className={`${getStatusBadgeClass(log.attendance_status)} hover:${getStatusBadgeClass(log.attendance_status)} text-[9px] px-1.5 py-0`}>
                        {getStatusLabel(log.attendance_status)}
                      </Badge>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                        <Eye className="w-3 h-3 text-blue-600" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {showPagination && logs.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2 border-t bg-gray-50">
            <div className="text-[10px] text-gray-500">
              Showing <span className="font-semibold text-gray-700">{logs.length}</span> records
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
