"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, Camera, TrendingUp, MapPin, Phone, User, Fingerprint, 
  ShieldCheck, CheckCircle, Calendar, Loader2, Hash, Utensils, BookOpen
} from "lucide-react"
import { AttendanceLog, formatTime, formatDate, getEventColor, getStatusLabel } from "../types"

interface AttendanceLogDetailDialogProps {
  log: AttendanceLog | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isLoading?: boolean
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 p-2 bg-white rounded border">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] text-gray-500 uppercase font-semibold">{label}</p>
        <p className="text-[11px] font-medium text-gray-900 truncate">{value}</p>
      </div>
    </div>
  )
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case 'entry': return <TrendingUp className="w-3.5 h-3.5" />
    case 'exit': return <Clock className="w-3.5 h-3.5" />
    case 'breakfast':
    case 'lunch':
    case 'supper': return <Utensils className="w-3.5 h-3.5" />
    case 'class': return <BookOpen className="w-3.5 h-3.5" />
    case 'morning_roll_call':
    case 'evening_roll_call': return <CheckCircle className="w-3.5 h-3.5" />
    default: return <Clock className="w-3.5 h-3.5" />
  }
}

export function AttendanceLogDetailDialog({ log, isOpen, onOpenChange, isLoading = false }: AttendanceLogDetailDialogProps) {
  if (!log) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Attendance Record Details
          </DialogTitle>
        </DialogHeader>

        <div className={`space-y-4 mt-2 transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          {/* Top Section: Image + Basic Info */}
          <div className="flex gap-4">
            {/* Face Capture */}
            <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-gray-100 shadow bg-gray-50 flex items-center justify-center shrink-0">
              {isLoading ? (
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              ) : (
                <img
                  src={log.raw_payload?.info?.pic || log.capture_image_url || "/placeholder.svg"}
                  alt="Face Capture"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1 text-center text-[9px]">
                Face Capture
              </div>
            </div>

            {/* Basic Info Grid */}
            <div className="flex-1 grid grid-cols-2 gap-2">
              <InfoItem label="Student Name" value={log.user_name || 'Unknown'} icon={<User className="w-3.5 h-3.5" />} />
              <InfoItem label="User ID" value={log.user_id} icon={<Hash className="w-3.5 h-3.5" />} />
              <InfoItem label="Date" value={formatDate(log.timestamp)} icon={<Calendar className="w-3.5 h-3.5" />} />
              <InfoItem label="Time" value={formatTime(log.timestamp)} icon={<Clock className="w-3.5 h-3.5" />} />
              <InfoItem label="Event Type" value={log.event_type.replace('_', ' ')} icon={getEventIcon(log.event_type)} />
              <InfoItem label="Status" value={getStatusLabel(log.attendance_status)} icon={<CheckCircle className="w-3.5 h-3.5" />} />
            </div>
          </div>

          {/* Camera & Location Info */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
            <InfoItem label="Camera ID" value={log.camera_id} icon={<Camera className="w-3.5 h-3.5" />} />
            <InfoItem label="Camera Name" value={log.camera_name} icon={<Camera className="w-3.5 h-3.5" />} />
            <InfoItem label="Camera Group" value={log.camera_group || 'N/A'} icon={<MapPin className="w-3.5 h-3.5" />} />
          </div>

          {/* Period & Subject (if applicable) */}
          {(log.period_number || log.subject) && (
            <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50 rounded-lg">
              <InfoItem label="Period Number" value={log.period_number?.toString() || 'N/A'} icon={<BookOpen className="w-3.5 h-3.5" />} />
              <InfoItem label="Subject" value={log.subject || 'N/A'} icon={<BookOpen className="w-3.5 h-3.5" />} />
            </div>
          )}

          {/* Confidence & Biometric Data */}
          <div className="border-t pt-3">
            <h3 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-blue-500" />
              Biometric & Device Information
            </h3>
            
            {isLoading ? (
              <div className="grid grid-cols-3 gap-2 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-12 bg-gray-100 rounded"></div>)}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <InfoItem 
                  label="Confidence Score" 
                  value={log.confidence_score ? `${log.confidence_score.toFixed(2)}%` : (log.raw_payload?.info?.similarity1 ? `${parseFloat(log.raw_payload.info.similarity1).toFixed(2)}%` : 'N/A')} 
                  icon={<TrendingUp className="w-3.5 h-3.5 text-green-500" />} 
                />
                {log.raw_payload?.info?.personId && (
                  <InfoItem label="Person ID" value={log.raw_payload.info.personId} icon={<User className="w-3.5 h-3.5" />} />
                )}
                {log.raw_payload?.info?.idCard && (
                  <InfoItem label="ID Card" value={log.raw_payload.info.idCard} icon={<ShieldCheck className="w-3.5 h-3.5" />} />
                )}
                {log.raw_payload?.info?.telnum && (
                  <InfoItem label="Telephone" value={log.raw_payload.info.telnum} icon={<Phone className="w-3.5 h-3.5" />} />
                )}
                {log.raw_payload?.info?.facesluiceId && (
                  <InfoItem label="Device ID" value={log.raw_payload.info.facesluiceId} icon={<Camera className="w-3.5 h-3.5" />} />
                )}
                {log.raw_payload?.info?.VerifyStatus && (
                  <InfoItem 
                    label="Verify Status" 
                    value={log.raw_payload.info.VerifyStatus === "1" ? "✓ Verified" : "✗ Failed"} 
                    icon={<CheckCircle className="w-3.5 h-3.5 text-blue-500" />} 
                  />
                )}
                {log.raw_payload?.info?.RecordID && (
                  <InfoItem label="Record ID" value={log.raw_payload.info.RecordID} icon={<Hash className="w-3.5 h-3.5" />} />
                )}
                {log.raw_payload?.info?.persionName && (
                  <InfoItem label="Registered Name" value={log.raw_payload.info.persionName} icon={<User className="w-3.5 h-3.5" />} />
                )}
                {log.raw_payload?.info?.time && (
                  <InfoItem label="Device Time" value={log.raw_payload.info.time} icon={<Clock className="w-3.5 h-3.5" />} />
                )}
              </div>
            )}
          </div>

          {/* Detection Coordinates */}
          {!isLoading && log.raw_payload?.info?.targetPosInScene && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-[10px] font-bold text-blue-700 uppercase mb-1">Face Detection Coordinates</p>
              <p className="text-xs text-blue-900 font-mono">
                X: {log.raw_payload.info.targetPosInScene[0]}, 
                Y: {log.raw_payload.info.targetPosInScene[1]}, 
                W: {log.raw_payload.info.targetPosInScene[2]}, 
                H: {log.raw_payload.info.targetPosInScene[3]}
              </p>
            </div>
          )}

          {/* Raw Payload Section */}
          {!isLoading && log.raw_payload && (
            <div className="border-t pt-3">
              <h3 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-purple-500" />
                Raw Payload Data
              </h3>
              <div className="bg-gray-900 rounded-lg p-3 overflow-auto max-h-48">
                <pre className="text-[10px] text-green-400 font-mono whitespace-pre-wrap">
                  {JSON.stringify(log.raw_payload, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg text-[10px]">
            <div>
              <span className="text-gray-500">Log Date:</span>{' '}
              <span className="font-medium">{log.log_date || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">Created At:</span>{' '}
              <span className="font-medium">{log.created_at ? formatDate(log.created_at) + ' ' + formatTime(log.created_at) : 'N/A'}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
