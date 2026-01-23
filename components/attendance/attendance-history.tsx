"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
    Clock, Camera, TrendingUp, MapPin, Tablet, Phone, User, Fingerprint, 
    ShieldCheck, CheckCircle, Calendar, Loader2, Eye, ChevronUp, ChevronDown,
    Hash, Utensils, BookOpen, ArrowUpDown, ChevronRight, ChevronsRight
} from "lucide-react"

interface AttendanceRecord {
    id: string
    user_id?: string
    user_name?: string
    person_type?: string
    event_type: string
    period_number?: number | null
    subject?: string | null
    camera_id?: string
    camera_name: string | null
    camera_group?: string | null
    timestamp: string
    log_date?: string | null
    attendance_status: string | null
    confidence_score?: number | null
    capture_image_url: string | null
    raw_payload?: any
    created_at?: string
}

interface AttendanceHistoryProps {
    logs: AttendanceRecord[]
    formatDate: (dateString: string) => string
    formatTime: (dateString: string) => string
    userId?: string
    studentName?: string
    pageSize?: number
    showPagination?: boolean
}

const getEventIcon = (eventType: string) => {
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

const getEventColor = (eventType: string) => {
    switch (eventType) {
        case 'entry': return 'bg-green-50 text-green-700 border-green-200'
        case 'exit': return 'bg-orange-50 text-orange-700 border-orange-200'
        case 'breakfast': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
        case 'lunch': return 'bg-amber-50 text-amber-700 border-amber-200'
        case 'supper': return 'bg-purple-50 text-purple-700 border-purple-200'
        case 'class': return 'bg-blue-50 text-blue-700 border-blue-200'
        case 'morning_roll_call': return 'bg-cyan-50 text-cyan-700 border-cyan-200'
        case 'evening_roll_call': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
        default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
}

const getStatusBadge = (status: string | null) => {
    switch (status) {
        case 'present':
        case 'on_time':
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[9px] px-1.5 py-0">On Time</Badge>
        case 'late_minor':
            return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-[9px] px-1.5 py-0">Late (Minor)</Badge>
        case 'late_major':
            return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-[9px] px-1.5 py-0">Late (Major)</Badge>
        case 'very_late':
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-[9px] px-1.5 py-0">Very Late</Badge>
        case 'absent':
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-[9px] px-1.5 py-0">Absent</Badge>
        default:
            return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 text-[9px] px-1.5 py-0">Unknown</Badge>
    }
}

const formatTimeWithSeconds = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function AttendanceHistory({ logs: initialLogs, formatDate, formatTime, userId, studentName, pageSize = 50, showPagination = true }: AttendanceHistoryProps) {
    const [logs, setLogs] = useState(initialLogs)
    const [selectedLog, setSelectedLog] = useState<AttendanceRecord | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(initialLogs.length >= pageSize)
    const [total, setTotal] = useState(initialLogs.length)
    const [sortField, setSortField] = useState<'timestamp' | 'event_type' | 'attendance_status'>('timestamp')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
    const supabase = createClient()

    const fetchMoreLogs = async () => {
        if (!userId) return
        setIsLoadingMore(true)
        try {
            const offset = logs.length
            const { data, error, count } = await supabase
                .from("attendance_logs")
                .select(`
                    id, user_id, user_name, person_type, event_type, period_number, subject,
                    camera_id, camera_name, camera_group, timestamp, log_date,
                    attendance_status, confidence_score, capture_image_url, raw_payload, created_at
                `, { count: 'exact' })
                .eq("user_id", userId)
                .order("timestamp", { ascending: false })
                .range(offset, offset + pageSize - 1)

            if (data && !error) {
                setLogs(prev => [...prev, ...data as AttendanceRecord[]])
                setHasMore(data.length >= pageSize)
                if (count) setTotal(count)
            }
        } catch (err) {
            console.error("Failed to fetch more logs:", err)
        } finally {
            setIsLoadingMore(false)
        }
    }

    const fetchAllLogs = async () => {
        if (!userId) return
        setIsLoadingMore(true)
        try {
            const { data, error, count } = await supabase
                .from("attendance_logs")
                .select(`
                    id, user_id, user_name, person_type, event_type, period_number, subject,
                    camera_id, camera_name, camera_group, timestamp, log_date,
                    attendance_status, confidence_score, capture_image_url, raw_payload, created_at
                `, { count: 'exact' })
                .eq("user_id", userId)
                .order("timestamp", { ascending: false })

            if (data && !error) {
                setLogs(data as AttendanceRecord[])
                setHasMore(false)
                if (count) setTotal(count)
            }
        } catch (err) {
            console.error("Failed to fetch all logs:", err)
        } finally {
            setIsLoadingMore(false)
        }
    }

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
            return newDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
        })
        setLogs(sorted)
    }

    const handleRowClick = async (log: AttendanceRecord) => {
        setSelectedLog(log)
        setIsDialogOpen(true)
        setIsLoadingDetails(true)

        try {
            const { data, error } = await supabase
                .from("attendance_logs")
                .select("*")
                .eq("id", log.id)
                .single()

            if (data && !error) {
                setSelectedLog(data as AttendanceRecord)
            }
        } catch (err) {
            console.error("Failed to fetch log details:", err)
        } finally {
            setIsLoadingDetails(false)
        }
    }

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-400" />
        return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
    }

    const renderDetailItem = (label: string, value: string | number | null | undefined, icon: React.ReactNode) => {
        if (value === null || value === undefined) return null;
        return (
            <div className="flex items-start gap-2 p-2 bg-white rounded border">
                <div className="text-gray-400 mt-0.5">{icon}</div>
                <div className="min-w-0">
                    <p className="text-[9px] text-gray-500 uppercase font-semibold">{label}</p>
                    <p className="text-[11px] font-medium text-gray-900 truncate">{String(value)}</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="max-h-[600px] overflow-auto">
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
                            <th 
                                className="text-left py-1.5 px-2 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('event_type')}
                            >
                                <div className="flex items-center gap-1">Event <SortIcon field="event_type" /></div>
                            </th>
                            <th className="text-left py-1.5 px-2 font-semibold text-gray-600">Period/Subject</th>
                            <th className="text-left py-1.5 px-2 font-semibold text-gray-600">Camera</th>
                            <th className="text-center py-1.5 px-2 font-semibold text-gray-600">Confidence</th>
                            <th className="text-center py-1.5 px-2 font-semibold text-gray-600">Capture</th>
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
                                <td colSpan={9} className="px-4 py-8 text-center text-gray-400 text-xs">
                                    No attendance records found.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log, idx) => (
                                <tr
                                    key={log.id}
                                    className={`border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                    onClick={() => handleRowClick(log)}
                                >
                                    <td className="py-1.5 px-2 text-center text-gray-400 font-mono">{idx + 1}</td>
                                    <td className="py-1.5 px-2">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">{formatShortDate(log.timestamp)}</span>
                                            <span className="text-gray-500 text-[9px]">{formatTimeWithSeconds(log.timestamp)}</span>
                                        </div>
                                    </td>
                                    <td className="py-1.5 px-2">
                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-medium ${getEventColor(log.event_type)}`}>
                                            {getEventIcon(log.event_type)}
                                            {log.event_type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="py-1.5 px-2">
                                        {log.period_number || log.subject ? (
                                            <div className="flex flex-col">
                                                {log.period_number && <span className="text-[9px] text-gray-500">P{log.period_number}</span>}
                                                {log.subject && <span className="text-[9px] font-medium truncate max-w-[60px]">{log.subject}</span>}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="py-1.5 px-2">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1 text-gray-700">
                                                <Camera className="w-2.5 h-2.5 text-gray-400" />
                                                <span className="truncate max-w-[70px]" title={log.camera_name || ''}>{log.camera_name || 'Main Gate'}</span>
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
                                        {log.capture_image_url ? (
                                            <div className="w-7 h-7 rounded overflow-hidden border border-gray-200 mx-auto">
                                                <img src={log.capture_image_url} alt="Capture" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="py-1.5 px-2 text-center">
                                        {getStatusBadge(log.attendance_status)}
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
            
            {/* Pagination Footer */}
            {showPagination && userId && (
                <div className="flex items-center justify-between px-3 py-2 border-t bg-gray-50">
                    <div className="text-[10px] text-gray-500">
                        Showing <span className="font-semibold text-gray-700">{logs.length}</span> of <span className="font-semibold text-gray-700">{total}</span> records
                    </div>
                    <div className="flex items-center gap-2">
                        {hasMore && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-[10px] px-2"
                                    onClick={fetchMoreLogs}
                                    disabled={isLoadingMore}
                                >
                                    {isLoadingMore ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                                    Load More ({pageSize})
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-[10px] px-2"
                                    onClick={fetchAllLogs}
                                    disabled={isLoadingMore}
                                >
                                    {isLoadingMore ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <ChevronsRight className="w-3 h-3 mr-1" />}
                                    Fetch All
                                </Button>
                            </>
                        )}
                        {!hasMore && logs.length > 0 && (
                            <span className="text-[10px] text-green-600 font-medium">✓ All records loaded</span>
                        )}
                    </div>
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                            Attendance Record Details
                        </DialogTitle>
                    </DialogHeader>

                    {selectedLog && (
                        <div className={`space-y-4 mt-2 transition-opacity ${isLoadingDetails ? 'opacity-50' : 'opacity-100'}`}>
                            {/* Top Section: Image + Basic Info */}
                            <div className="flex gap-4">
                                {/* Face Capture */}
                                <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-gray-100 shadow bg-gray-50 flex items-center justify-center shrink-0">
                                    {isLoadingDetails ? (
                                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                    ) : (
                                        <img
                                            src={selectedLog.raw_payload?.info?.pic || selectedLog.capture_image_url || "/placeholder.svg"}
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
                                    {renderDetailItem("Student Name", selectedLog.user_name || studentName || 'Unknown', <User className="w-3.5 h-3.5" />)}
                                    {renderDetailItem("User ID", selectedLog.user_id || 'N/A', <Hash className="w-3.5 h-3.5" />)}
                                    {renderDetailItem("Date", formatDate(selectedLog.timestamp), <Calendar className="w-3.5 h-3.5" />)}
                                    {renderDetailItem("Time", formatTimeWithSeconds(selectedLog.timestamp), <Clock className="w-3.5 h-3.5" />)}
                                    {renderDetailItem("Event Type", selectedLog.event_type.replace('_', ' '), getEventIcon(selectedLog.event_type))}
                                    {renderDetailItem("Status", selectedLog.attendance_status?.replace('_', ' ') || 'Unknown', <CheckCircle className="w-3.5 h-3.5" />)}
                                </div>
                            </div>

                            {/* Camera & Location Info */}
                            <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
                                {renderDetailItem("Camera ID", selectedLog.camera_id || 'N/A', <Camera className="w-3.5 h-3.5" />)}
                                {renderDetailItem("Camera Name", selectedLog.camera_name || 'Main Gate', <Camera className="w-3.5 h-3.5" />)}
                                {renderDetailItem("Camera Group", selectedLog.camera_group || 'N/A', <MapPin className="w-3.5 h-3.5" />)}
                            </div>

                            {/* Period & Subject (if applicable) */}
                            {(selectedLog.period_number || selectedLog.subject) && (
                                <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50 rounded-lg">
                                    {renderDetailItem("Period Number", selectedLog.period_number?.toString() || 'N/A', <BookOpen className="w-3.5 h-3.5" />)}
                                    {renderDetailItem("Subject", selectedLog.subject || 'N/A', <BookOpen className="w-3.5 h-3.5" />)}
                                </div>
                            )}

                            {/* Confidence & Biometric Data */}
                            <div className="border-t pt-3">
                                <h3 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                                    <Fingerprint className="w-3.5 h-3.5 text-blue-500" />
                                    Biometric & Device Information
                                </h3>
                                
                                {isLoadingDetails ? (
                                    <div className="grid grid-cols-3 gap-2 animate-pulse">
                                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-12 bg-gray-100 rounded"></div>)}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {renderDetailItem(
                                            "Confidence Score", 
                                            selectedLog.confidence_score ? `${selectedLog.confidence_score.toFixed(2)}%` : (selectedLog.raw_payload?.info?.similarity1 ? `${parseFloat(selectedLog.raw_payload.info.similarity1).toFixed(2)}%` : 'N/A'), 
                                            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                                        )}
                                        {selectedLog.raw_payload?.info?.personId && renderDetailItem("Person ID", selectedLog.raw_payload.info.personId, <User className="w-3.5 h-3.5" />)}
                                        {selectedLog.raw_payload?.info?.idCard && renderDetailItem("ID Card", selectedLog.raw_payload.info.idCard, <ShieldCheck className="w-3.5 h-3.5" />)}
                                        {selectedLog.raw_payload?.info?.telnum && renderDetailItem("Telephone", selectedLog.raw_payload.info.telnum, <Phone className="w-3.5 h-3.5" />)}
                                        {selectedLog.raw_payload?.info?.facesluiceId && renderDetailItem("Device ID", selectedLog.raw_payload.info.facesluiceId, <Camera className="w-3.5 h-3.5" />)}
                                        {selectedLog.raw_payload?.info?.VerifyStatus && renderDetailItem("Verify Status", selectedLog.raw_payload.info.VerifyStatus === "1" ? "✓ Verified" : "✗ Failed", <CheckCircle className="w-3.5 h-3.5 text-blue-500" />)}
                                        {selectedLog.raw_payload?.info?.RecordID && renderDetailItem("Record ID", selectedLog.raw_payload.info.RecordID, <Hash className="w-3.5 h-3.5" />)}
                                        {selectedLog.raw_payload?.info?.persionName && renderDetailItem("Registered Name", selectedLog.raw_payload.info.persionName, <User className="w-3.5 h-3.5" />)}
                                        {selectedLog.raw_payload?.info?.time && renderDetailItem("Device Time", selectedLog.raw_payload.info.time, <Clock className="w-3.5 h-3.5" />)}
                                    </div>
                                )}
                            </div>

                            {/* Detection Coordinates */}
                            {!isLoadingDetails && selectedLog.raw_payload?.info?.targetPosInScene && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-[10px] font-bold text-blue-700 uppercase mb-1">Face Detection Coordinates</p>
                                    <p className="text-xs text-blue-900 font-mono">
                                        X: {selectedLog.raw_payload.info.targetPosInScene[0]}, 
                                        Y: {selectedLog.raw_payload.info.targetPosInScene[1]}, 
                                        W: {selectedLog.raw_payload.info.targetPosInScene[2]}, 
                                        H: {selectedLog.raw_payload.info.targetPosInScene[3]}
                                    </p>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg text-[10px]">
                                <div>
                                    <span className="text-gray-500">Log Date:</span>{' '}
                                    <span className="font-medium">{selectedLog.log_date || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Created At:</span>{' '}
                                    <span className="font-medium">{selectedLog.created_at ? formatDate(selectedLog.created_at) + ' ' + formatTimeWithSeconds(selectedLog.created_at) : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
