"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
    Clock, Camera, TrendingUp, MapPin, Phone, User, Fingerprint, 
    ShieldCheck, CheckCircle, Calendar, Loader2, Eye, ChevronUp, 
    ChevronDown, Hash, Utensils, BookOpen, ArrowUpDown, ChevronLeft,
    ChevronRight, ChevronsLeft, ChevronsRight, Download
} from "lucide-react"

interface AttendanceLog {
    id: number
    user_id: string
    user_name: string
    person_type: string
    event_type: string
    period_number: number | null
    subject: string | null
    camera_id: string
    camera_name: string
    camera_group: string | null
    timestamp: string
    log_date: string | null
    attendance_status: string | null
    confidence_score: number | null
    capture_image_url: string | null
    raw_payload?: any
    created_at: string
}

interface StudentAttendanceTableProps {
    logs: AttendanceLog[]
    studentName: string
    userId: string
    totalCount?: number
    pageSize?: number
}

const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

export function StudentAttendanceTable({ logs: initialLogs, studentName, userId, totalCount = 0, pageSize = 50 }: StudentAttendanceTableProps) {
    const [logs, setLogs] = useState(initialLogs)
    const [selectedLog, setSelectedLog] = useState<AttendanceLog | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(initialLogs.length >= pageSize)
    const [total, setTotal] = useState(totalCount || initialLogs.length)
    const [sortField, setSortField] = useState<'timestamp' | 'event_type' | 'attendance_status'>('timestamp')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
    const supabase = createClient()

    const fetchMoreLogs = async (loadAll = false) => {
        setIsLoadingMore(true)
        try {
            const offset = logs.length
            const limit = loadAll ? 10000 : pageSize
            
            const { data, error, count } = await supabase
                .from("attendance_logs")
                .select(`
                    id,
                    user_id,
                    user_name,
                    person_type,
                    event_type,
                    period_number,
                    subject,
                    camera_id,
                    camera_name,
                    camera_group,
                    timestamp,
                    log_date,
                    attendance_status,
                    confidence_score,
                    capture_image_url,
                    raw_payload,
                    created_at
                `, { count: 'exact' })
                .eq("user_id", userId)
                .order("timestamp", { ascending: false })
                .range(offset, offset + limit - 1)

            if (data && !error) {
                setLogs(prev => [...prev, ...data as AttendanceLog[]])
                setHasMore(data.length >= limit && !loadAll)
                if (count) setTotal(count)
                setCurrentPage(prev => prev + 1)
            }
        } catch (err) {
            console.error("Failed to fetch more logs:", err)
        } finally {
            setIsLoadingMore(false)
        }
    }

    const fetchAllLogs = async () => {
        setIsLoadingMore(true)
        try {
            const { data, error, count } = await supabase
                .from("attendance_logs")
                .select(`
                    id,
                    user_id,
                    user_name,
                    person_type,
                    event_type,
                    period_number,
                    subject,
                    camera_id,
                    camera_name,
                    camera_group,
                    timestamp,
                    log_date,
                    attendance_status,
                    confidence_score,
                    capture_image_url,
                    raw_payload,
                    created_at
                `, { count: 'exact' })
                .eq("user_id", userId)
                .order("timestamp", { ascending: false })

            if (data && !error) {
                setLogs(data as AttendanceLog[])
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
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('desc')
        }

        const sorted = [...logs].sort((a, b) => {
            let aVal = a[field] || ''
            let bVal = b[field] || ''
            if (field === 'timestamp') {
                aVal = new Date(a.timestamp).getTime().toString()
                bVal = new Date(b.timestamp).getTime().toString()
            }
            if (sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1
            }
            return aVal < bVal ? 1 : -1
        })
        setLogs(sorted)
    }

    const handleRowClick = async (log: AttendanceLog) => {
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
                setSelectedLog(data as AttendanceLog)
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

    return (
        <>
            <Card className="border-0 shadow-sm">
                <CardHeader className="py-2 px-3 border-b bg-white">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            Attendance Log History
                        </CardTitle>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                            {logs.length} records
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
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
                                                    <span className="text-gray-500 text-[9px]">{formatTime(log.timestamp)}</span>
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
                                        onClick={() => fetchMoreLogs()}
                                        disabled={isLoadingMore}
                                    >
                                        {isLoadingMore ? (
                                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                        ) : (
                                            <ChevronRight className="w-3 h-3 mr-1" />
                                        )}
                                        Load More ({pageSize})
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 text-[10px] px-2"
                                        onClick={fetchAllLogs}
                                        disabled={isLoadingMore}
                                    >
                                        {isLoadingMore ? (
                                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                        ) : (
                                            <ChevronsRight className="w-3 h-3 mr-1" />
                                        )}
                                        Fetch All
                                    </Button>
                                </>
                            )}
                            {!hasMore && logs.length > 0 && (
                                <span className="text-[10px] text-green-600 font-medium">✓ All records loaded</span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detail Modal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                                    <InfoItem label="Student Name" value={selectedLog.user_name || studentName} icon={<User className="w-3.5 h-3.5" />} />
                                    <InfoItem label="User ID" value={selectedLog.user_id} icon={<Hash className="w-3.5 h-3.5" />} />
                                    <InfoItem label="Date" value={formatDate(selectedLog.timestamp)} icon={<Calendar className="w-3.5 h-3.5" />} />
                                    <InfoItem label="Time" value={formatTime(selectedLog.timestamp)} icon={<Clock className="w-3.5 h-3.5" />} />
                                    <InfoItem label="Event Type" value={selectedLog.event_type.replace('_', ' ')} icon={getEventIcon(selectedLog.event_type)} />
                                    <InfoItem label="Status" value={selectedLog.attendance_status?.replace('_', ' ') || 'Unknown'} icon={<CheckCircle className="w-3.5 h-3.5" />} />
                                </div>
                            </div>

                            {/* Camera & Location Info */}
                            <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
                                <InfoItem label="Camera ID" value={selectedLog.camera_id} icon={<Camera className="w-3.5 h-3.5" />} />
                                <InfoItem label="Camera Name" value={selectedLog.camera_name} icon={<Camera className="w-3.5 h-3.5" />} />
                                <InfoItem label="Camera Group" value={selectedLog.camera_group || 'N/A'} icon={<MapPin className="w-3.5 h-3.5" />} />
                            </div>

                            {/* Period & Subject (if applicable) */}
                            {(selectedLog.period_number || selectedLog.subject) && (
                                <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50 rounded-lg">
                                    <InfoItem label="Period Number" value={selectedLog.period_number?.toString() || 'N/A'} icon={<BookOpen className="w-3.5 h-3.5" />} />
                                    <InfoItem label="Subject" value={selectedLog.subject || 'N/A'} icon={<BookOpen className="w-3.5 h-3.5" />} />
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
                                        <InfoItem 
                                            label="Confidence Score" 
                                            value={selectedLog.confidence_score ? `${selectedLog.confidence_score.toFixed(2)}%` : (selectedLog.raw_payload?.info?.similarity1 ? `${parseFloat(selectedLog.raw_payload.info.similarity1).toFixed(2)}%` : 'N/A')} 
                                            icon={<TrendingUp className="w-3.5 h-3.5 text-green-500" />} 
                                        />
                                        {selectedLog.raw_payload?.info?.personId && (
                                            <InfoItem label="Person ID" value={selectedLog.raw_payload.info.personId} icon={<User className="w-3.5 h-3.5" />} />
                                        )}
                                        {selectedLog.raw_payload?.info?.idCard && (
                                            <InfoItem label="ID Card" value={selectedLog.raw_payload.info.idCard} icon={<ShieldCheck className="w-3.5 h-3.5" />} />
                                        )}
                                        {selectedLog.raw_payload?.info?.telnum && (
                                            <InfoItem label="Telephone" value={selectedLog.raw_payload.info.telnum} icon={<Phone className="w-3.5 h-3.5" />} />
                                        )}
                                        {selectedLog.raw_payload?.info?.facesluiceId && (
                                            <InfoItem label="Device ID" value={selectedLog.raw_payload.info.facesluiceId} icon={<Camera className="w-3.5 h-3.5" />} />
                                        )}
                                        {selectedLog.raw_payload?.info?.VerifyStatus && (
                                            <InfoItem 
                                                label="Verify Status" 
                                                value={selectedLog.raw_payload.info.VerifyStatus === "1" ? "✓ Verified" : "✗ Failed"} 
                                                icon={<CheckCircle className="w-3.5 h-3.5 text-blue-500" />} 
                                            />
                                        )}
                                        {selectedLog.raw_payload?.info?.RecordID && (
                                            <InfoItem label="Record ID" value={selectedLog.raw_payload.info.RecordID} icon={<Hash className="w-3.5 h-3.5" />} />
                                        )}
                                        {selectedLog.raw_payload?.info?.persionName && (
                                            <InfoItem label="Registered Name" value={selectedLog.raw_payload.info.persionName} icon={<User className="w-3.5 h-3.5" />} />
                                        )}
                                        {selectedLog.raw_payload?.info?.time && (
                                            <InfoItem label="Device Time" value={selectedLog.raw_payload.info.time} icon={<Clock className="w-3.5 h-3.5" />} />
                                        )}
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
                                    <span className="font-medium">{selectedLog.created_at ? formatDate(selectedLog.created_at) + ' ' + formatTime(selectedLog.created_at) : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
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
