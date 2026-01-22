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
import { Clock, Camera, TrendingUp, MapPin, Tablet, Phone, User, Fingerprint, ShieldCheck, CheckCircle, Calendar, Loader2 } from "lucide-react"

interface AttendanceRecord {
    id: string
    event_type: string
    timestamp: string
    attendance_status: string | null
    camera_name: string | null
    capture_image_url: string | null
    raw_payload?: any
}

interface AttendanceHistoryProps {
    logs: AttendanceRecord[]
    formatDate: (dateString: string) => string
    formatTime: (dateString: string) => string
}

export function AttendanceHistory({ logs: initialLogs, formatDate, formatTime }: AttendanceHistoryProps) {
    const [selectedLog, setSelectedLog] = useState<AttendanceRecord | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const supabase = createClient()

    const handleRowClick = async (log: AttendanceRecord) => {
        setSelectedLog(log)
        setIsDialogOpen(true)
        setIsLoadingDetails(true)

        try {
            // Fetch full details including raw_payload specifically for this record
            const { data, error } = await supabase
                .from("attendance_logs")
                .select("raw_payload")
                .eq("id", log.id)
                .single()

            if (data && !error) {
                setSelectedLog(prev => prev ? { ...prev, raw_payload: data.raw_payload } : null)
            }
        } catch (err) {
            console.error("Failed to fetch log details:", err)
        } finally {
            setIsLoadingDetails(false)
        }
    }

    const renderDetailItem = (label: string, value: string | number | null | undefined, icon: React.ReactNode) => {
        if (value === null || value === undefined) return null;
        return (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-400">{icon}</div>
                <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">{label}</p>
                    <p className="font-medium text-sm text-gray-900">{value}</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium">Date & Time</th>
                            <th className="px-6 py-3 text-left font-medium">Event</th>
                            <th className="px-6 py-3 text-left font-medium">Camera</th>
                            <th className="px-6 py-3 text-left font-medium">Capture</th>
                            <th className="px-6 py-3 text-right font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {initialLogs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No attendance records found for this period.
                                </td>
                            </tr>
                        ) : (
                            initialLogs.map((log) => (
                                <tr
                                    key={log.id}
                                    className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                                    onClick={() => handleRowClick(log)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{formatDate(log.timestamp)}</span>
                                            <span className="text-gray-500 text-xs">{formatTime(log.timestamp)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${log.event_type === 'entry' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'
                                            }`}>
                                            {log.event_type === 'entry' ? <TrendingUp className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {log.event_type.charAt(0).toUpperCase() + log.event_type.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Camera className="w-4 h-4 text-gray-400" />
                                            <span className="truncate max-w-[120px]" title={log.camera_name || ''}>{log.camera_name || 'Main Gate'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.capture_image_url ? (
                                            <div className="w-10 h-10 rounded overflow-hidden border border-gray-200">
                                                <img src={log.capture_image_url} alt="Capture" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">No image</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Badge variant={
                                            log.attendance_status === 'present' || log.attendance_status === 'on_time' ? 'default' :
                                                log.attendance_status?.includes('late') ? 'secondary' : 'destructive'
                                        } className="capitalize">
                                            {log.attendance_status?.replace('_', ' ') || 'Unknown'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <ShieldCheck className="w-6 h-6 text-blue-600" />
                            Attendance Event Details
                        </DialogTitle>
                    </DialogHeader>

                    {selectedLog && (
                        <div className={`space-y-6 mt-4 transition-opacity duration-300 ${isLoadingDetails ? 'opacity-50' : 'opacity-100'}`}>

                            {/* Primary Visual & Status */}
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="relative w-full md:w-56 h-56 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                                    {isLoadingDetails ? (
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                    ) : (
                                        <img
                                            src={selectedLog.capture_image_url || selectedLog.raw_payload?.info?.pic || "/placeholder.svg"}
                                            alt="Capture Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    {!isLoadingDetails && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-center text-xs backdrop-blur-sm">
                                            Face Capture Preview
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge className="px-3 py-1 text-sm bg-blue-100 text-blue-800 hover:bg-blue-100 border-none capitalize">
                                            {selectedLog.event_type} Event
                                        </Badge>
                                        <Badge variant={selectedLog.attendance_status?.includes('late') ? 'secondary' : 'default'} className="px-3 py-1 text-sm capitalize">
                                            {selectedLog.attendance_status?.replace('_', ' ') || 'Registered'}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {renderDetailItem("Timestamp", formatTime(selectedLog.timestamp), <Clock className="w-4 h-4" />)}
                                        {renderDetailItem("Date", formatDate(selectedLog.timestamp), <Calendar className="w-4 h-4 text-gray-400" />)}
                                        {renderDetailItem("Camera", selectedLog.camera_name || "Main Gate", <Camera className="w-4 h-4" />)}
                                        {renderDetailItem("Location", "Main Campus Entrance", <MapPin className="w-4 h-4 text-red-400" />)}
                                    </div>
                                </div>
                            </div>

                            {/* Technical Information from Raw Payload */}
                            <div className="border-t pt-6">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Fingerprint className="w-4 h-4 text-blue-500" />
                                    {isLoadingDetails ? "Loading Biometric Data..." : "Biometric & Device Information"}
                                </h3>

                                {isLoadingDetails ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-pulse">
                                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>)}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {selectedLog.raw_payload?.info?.similarity1 &&
                                            renderDetailItem("Confidence", `${parseFloat(selectedLog.raw_payload.info.similarity1).toFixed(2)}%`, <TrendingUp className="w-4 h-4 text-green-500" />)
                                        }
                                        {selectedLog.raw_payload?.info?.personId &&
                                            renderDetailItem("Person ID", selectedLog.raw_payload.info.personId, <User className="w-4 h-4" />)
                                        }
                                        {selectedLog.raw_payload?.info?.idCard &&
                                            renderDetailItem("ID Card", selectedLog.raw_payload.info.idCard, <ShieldCheck className="w-4 h-4" />)
                                        }
                                        {selectedLog.raw_payload?.info?.telnum &&
                                            renderDetailItem("Telephone", selectedLog.raw_payload.info.telnum, <Phone className="w-4 h-4" />)
                                        }
                                        {selectedLog.raw_payload?.info?.facesluiceId &&
                                            renderDetailItem("Device ID", selectedLog.raw_payload.info.facesluiceId, <Tablet className="w-4 h-4" />)
                                        }
                                        {selectedLog.raw_payload?.info?.VerifyStatus &&
                                            renderDetailItem("Verify Status", selectedLog.raw_payload.info.VerifyStatus === "1" ? "Success" : "Failed", <CheckCircle className="w-4 h-4 text-blue-500" />)
                                        }
                                    </div>
                                )}
                            </div>

                            {/* Extra details if available */}
                            {!isLoadingDetails && selectedLog.raw_payload?.info?.targetPosInScene && (
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-xs font-bold text-blue-700 uppercase mb-2">Detection Coordinates</p>
                                    <p className="text-sm text-blue-900 font-mono">
                                        X: {selectedLog.raw_payload.info.targetPosInScene[0]},
                                        Y: {selectedLog.raw_payload.info.targetPosInScene[1]},
                                        W: {selectedLog.raw_payload.info.targetPosInScene[2]},
                                        H: {selectedLog.raw_payload.info.targetPosInScene[3]}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
