"use client"

import { useState } from 'react'
import { useRealtimeAnomalies, useRealtimeAttendance, useRealtimeStudents } from '@/hooks/use-realtime-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, AlertTriangle, Eye, Bell, CheckCircle, Clock, MapPin, 
  Camera, Phone, MessageSquare, Volume2, ArrowUpRight, RefreshCw,
  Settings, BarChart3, User, Utensils, BookOpen, AlertCircle,
  Radio, ChevronRight, X, Play, Pause, Users, TrendingUp, 
  TrendingDown, LogOut, HelpCircle, ArrowDownRight, Activity
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'

interface AIActionQueueProps {
  initialAnomalies: any[]
  initialAttendance: any[]
  initialStudents: any[]
  stats: {
    total: number
    present: number
    absent: number
    offCampus: number
    unknown: number
    presentPercentage: number
  }
}

export function AIActionQueue({ 
  initialAnomalies, 
  initialAttendance, 
  initialStudents,
  stats: initialStats 
}: AIActionQueueProps) {
  const { anomalies, isConnected: anomaliesConnected, criticalCount, warningCount, watchlistCount, totalActive } = useRealtimeAnomalies(initialAnomalies)
  const { logs, isConnected: logsConnected, newLogCount, clearNewLogCount } = useRealtimeAttendance(initialAttendance)
  const { students, isConnected: studentsConnected, onCampusCount, offCampusCount, totalStudents } = useRealtimeStudents(initialStudents)
  
  const [activeTab, setActiveTab] = useState<'critical' | 'warnings' | 'watchlist' | 'resolved'>('critical')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const supabase = createClient()

  // Calculate auto-resolved count (resolved in last 24 hours)
  const autoResolvedToday = anomalies.filter(a => 
    a.status === 'resolved' && 
    a.resolved_at && 
    new Date(a.resolved_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length

  // Filter anomalies by type
  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical' && a.status === 'active')
  const warningAnomalies = anomalies.filter(a => a.severity === 'warning' && a.status === 'active')
  const watchlistAnomalies = anomalies.filter(a => (a.severity === 'watchlist' || a.severity === 'low') && a.status === 'active')

  const handleResolve = async (anomalyId: string) => {
    await supabase
      .from('anomalies')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', anomalyId)
  }

  const handleEscalate = async (anomalyId: string) => {
    await supabase
      .from('anomalies')
      .update({ severity: 'critical' })
      .eq('id', anomalyId)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Trigger a page refresh or refetch
    window.location.reload()
  }

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case 'unknown_face': return <AlertTriangle className="w-5 h-5" />
      case 'out_of_bounds': return <MapPin className="w-5 h-5" />
      case 'class_skipping': return <BookOpen className="w-5 h-5" />
      case 'double_meal': return <Utensils className="w-5 h-5" />
      case 'attendance_drop': return <BarChart3 className="w-5 h-5" />
      default: return <AlertCircle className="w-5 h-5" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? 's' : ''} ago`
  }

  const isConnected = anomaliesConnected && logsConnected && studentsConnected

  // Calculate event type stats from logs
  const entryCount = logs.filter(l => l.event_type === 'entry').length
  const exitCount = logs.filter(l => l.event_type === 'exit').length
  const mealCount = logs.filter(l => ['breakfast', 'lunch', 'supper'].includes(l.event_type)).length
  const classCount = logs.filter(l => l.event_type === 'class').length

  // Process attendance data for charts
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hour = i
    const hourLogs = logs.filter(l => new Date(l.timestamp || l.created_at).getHours() === hour)
    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      entries: hourLogs.filter(l => l.event_type === 'entry').length,
      exits: hourLogs.filter(l => l.event_type === 'exit').length,
      total: hourLogs.length
    }
  }).filter(d => d.total > 0 || (d.hour >= '06:00' && d.hour <= '22:00'))

  // Event type distribution for pie chart
  const eventDistribution = [
    { name: 'Entry', value: entryCount, color: '#22C55E' },
    { name: 'Exit', value: exitCount, color: '#F97316' },
    { name: 'Meals', value: mealCount, color: '#8B5CF6' },
    { name: 'Class', value: classCount, color: '#3B82F6' },
  ].filter(d => d.value > 0)

  // Status distribution
  const statusData = [
    { name: 'On Time', value: logs.filter(l => l.attendance_status === 'on_time' || l.attendance_status === 'present').length, color: '#22C55E' },
    { name: 'Late Minor', value: logs.filter(l => l.attendance_status === 'late_minor').length, color: '#EAB308' },
    { name: 'Late Major', value: logs.filter(l => l.attendance_status === 'late_major' || l.attendance_status === 'very_late').length, color: '#F97316' },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-4">
      {/* Live Status Bar */}
      <div className="bg-white border rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h1 className="font-bold text-lg">SMARTSCHOOL SENTINEL</h1>
              <span className="text-gray-400">—</span>
              <span className="text-gray-600 font-medium">AI Action Queue</span>
            </div>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
              isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <Radio className={`w-3 h-3 ${isConnected ? 'animate-pulse' : ''}`} />
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/admin/settings">
              <Button variant="ghost" size="sm"><Settings className="w-4 h-4" /></Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="px-4 py-3 bg-gray-50 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-gray-600">On Campus:</span>
            <span className="font-bold text-green-700">{onCampusCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>
            <span className="text-gray-600">Active Alerts:</span>
            <span className="font-bold text-yellow-700">{totalActive}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            <span className="text-gray-600">Critical:</span>
            <span className="font-bold text-red-700">{criticalCount}</span>
          </div>
          {newLogCount > 0 && (
            <button 
              onClick={clearNewLogCount}
              className="flex items-center gap-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
            >
              <Bell className="w-3 h-3" />
              {newLogCount} new event{newLogCount > 1 ? 's' : ''}
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">Total Students</p>
                <p className="text-2xl font-bold">{totalStudents.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-medium">On Campus</p>
                <p className="text-2xl font-bold">{onCampusCount.toLocaleString()}</p>
                <p className="text-green-200 text-xs">{totalStudents > 0 ? Math.round((onCampusCount / totalStudents) * 100) : 0}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-medium">Off Campus</p>
                <p className="text-2xl font-bold">{offCampusCount.toLocaleString()}</p>
              </div>
              <LogOut className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-xs font-medium">Absent</p>
                <p className="text-2xl font-bold">{initialStats.absent}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium">Today's Events</p>
                <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
              </div>
              <Activity className="w-6 h-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium">Entry/Exit</p>
                <p className="text-2xl font-bold text-gray-900">{entryCount}/{exitCount}</p>
              </div>
              <div className="flex flex-col">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
                <ArrowDownRight className="w-4 h-4 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hourly Activity Chart */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Today's Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="hour" fontSize={10} stroke="#9CA3AF" />
                  <YAxis fontSize={10} stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="entries" stackId="1" stroke="#22C55E" fill="#22C55E" fillOpacity={0.6} name="Entries" />
                  <Area type="monotone" dataKey="exits" stackId="1" stroke="#F97316" fill="#F97316" fillOpacity={0.6} name="Exits" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Event Distribution Pie */}
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              Event Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center">
              {eventDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {eventDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value, 'Events']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-sm">No events yet</p>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {eventDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card className="shadow-lg">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Recent Activity Feed
              <Badge variant="outline" className="ml-2">{logs.length} events today</Badge>
            </CardTitle>
            <Link href="/attendance">
              <Button variant="ghost" size="sm" className="text-xs">
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-gray-600">Time</th>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-gray-600">Student</th>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-gray-600">Event</th>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-gray-600">Camera</th>
                  <th className="text-center py-2 px-4 text-xs font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.slice(0, 10).map((log: any, idx: number) => (
                  <tr key={log.id || idx} className="hover:bg-gray-50">
                    <td className="py-2 px-4 text-xs font-medium text-gray-900">
                      {new Date(log.timestamp || log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-2">
                        {log.capture_image_url ? (
                          <img src={log.capture_image_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                            {log.user_name?.charAt(0) || '?'}
                          </div>
                        )}
                        <span className="text-xs font-medium truncate max-w-[120px]">{log.user_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <Badge variant="outline" className={`text-[10px] ${
                        log.event_type === 'entry' ? 'bg-green-50 text-green-700 border-green-200' :
                        log.event_type === 'exit' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        ['breakfast', 'lunch', 'supper'].includes(log.event_type) ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {log.event_type === 'entry' ? '↗️' : log.event_type === 'exit' ? '↙️' : '📍'} {log.event_type}
                      </Badge>
                    </td>
                    <td className="py-2 px-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Camera className="w-3 h-3 text-gray-400" />
                        <span className="truncate max-w-[80px]">{log.camera_name || '-'}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 text-center">
                      {log.attendance_status && (
                        <Badge variant={
                          log.attendance_status === 'on_time' || log.attendance_status === 'present' ? 'default' :
                          log.attendance_status?.includes('late') ? 'secondary' : 'destructive'
                        } className="text-[10px]">
                          {log.attendance_status}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                      No activity recorded today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Queue Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('critical')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'critical' 
              ? 'bg-red-600 text-white shadow-lg shadow-red-200' 
              : 'bg-white border hover:bg-red-50 text-gray-700'
          }`}
        >
          <span className="text-lg">🔴</span> CRITICAL
          {criticalCount > 0 && (
            <Badge variant="secondary" className={activeTab === 'critical' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'}>
              {criticalCount}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab('warnings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'warnings' 
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
              : 'bg-white border hover:bg-orange-50 text-gray-700'
          }`}
        >
          <span className="text-lg">🟠</span> WARNINGS
          {warningCount > 0 && (
            <Badge variant="secondary" className={activeTab === 'warnings' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'}>
              {warningCount}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'watchlist' 
              ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-200' 
              : 'bg-white border hover:bg-yellow-50 text-gray-700'
          }`}
        >
          <span className="text-lg">🟡</span> WATCHLIST
          {watchlistCount > 0 && (
            <Badge variant="secondary" className={activeTab === 'watchlist' ? 'bg-white/20 text-white' : 'bg-yellow-100 text-yellow-700'}>
              {watchlistCount}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'resolved' 
              ? 'bg-green-600 text-white shadow-lg shadow-green-200' 
              : 'bg-white border hover:bg-green-50 text-gray-700'
          }`}
        >
          <span className="text-lg">✅</span> AUTO-RESOLVED
          <Badge variant="secondary" className={activeTab === 'resolved' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}>
            {autoResolvedToday} today
          </Badge>
        </button>
      </div>

      {/* Queue Content */}
      <div className="space-y-3">
        {activeTab === 'critical' && (
          <Card className="border-l-4 border-l-red-500 shadow-lg">
            <CardHeader className="pb-2 bg-red-50/50">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Shield className="w-5 h-5" />
                🔴 PRIORITY QUEUE - SECURITY BREACHES
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {criticalAnomalies.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p className="font-medium">No critical alerts</p>
                  <p className="text-sm">All security systems operating normally</p>
                </div>
              ) : (
                criticalAnomalies.map((anomaly) => (
                  <div key={anomaly.id} className="py-4 first:pt-2 last:pb-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-100 rounded-lg text-red-600">
                        {getAnomalyIcon(anomaly.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">#{anomaly.id?.slice(0, 4)}</span>
                          <span className="text-lg">🚨</span>
                          <span className="font-medium">{anomaly.title || anomaly.type?.replace(/_/g, ' ').toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Camera className="w-3.5 h-3.5" />
                          <span>{anomaly.camera_name || 'Unknown Camera'}</span>
                          <span className="text-gray-300">•</span>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatTimeAgo(anomaly.created_at)}</span>
                        </div>
                        {anomaly.student_name && (
                          <div className="flex items-center gap-2 text-sm mb-2">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-medium">{anomaly.student_name}</span>
                            {anomaly.student_class && <span className="text-gray-500">({anomaly.student_class})</span>}
                          </div>
                        )}
                        {anomaly.description && (
                          <p className="text-sm text-gray-600 mb-3">{anomaly.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            <Eye className="w-3 h-3 mr-1" /> VIEW FEED
                          </Button>
                          <Button size="sm" variant="destructive" className="h-7 text-xs">
                            <Volume2 className="w-3 h-3 mr-1" /> SOUND ALARM
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            <Phone className="w-3 h-3 mr-1" /> CALL SECURITY
                          </Button>
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="h-7 text-xs bg-green-600 hover:bg-green-700"
                            onClick={() => handleResolve(anomaly.id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> MARK RESOLVED
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'warnings' && (
          <Card className="border-l-4 border-l-orange-500 shadow-lg">
            <CardHeader className="pb-2 bg-orange-50/50">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="w-5 h-5" />
                🟠 WARNING QUEUE - BEHAVIORAL ANOMALIES
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {warningAnomalies.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p className="font-medium">No warnings</p>
                  <p className="text-sm">All behavioral patterns normal</p>
                </div>
              ) : (
                warningAnomalies.map((anomaly) => (
                  <div key={anomaly.id} className="py-4 first:pt-2 last:pb-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                        {getAnomalyIcon(anomaly.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">#{anomaly.id?.slice(0, 4)}</span>
                          <span className="text-lg">{anomaly.type === 'class_skipping' ? '📍' : anomaly.type === 'double_meal' ? '🍽️' : '⚠️'}</span>
                          <span className="font-medium">{anomaly.title || anomaly.type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                        </div>
                        {anomaly.student_name && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <User className="w-3.5 h-3.5" />
                            <span className="font-medium">{anomaly.student_name}</span>
                            {anomaly.student_class && <span>({anomaly.student_class})</span>}
                          </div>
                        )}
                        {anomaly.expected_location && (
                          <div className="text-sm text-gray-600 mb-1">
                            <span className="text-gray-500">Expected:</span> {anomaly.expected_location}
                          </div>
                        )}
                        {anomaly.actual_location && (
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="text-gray-500">Currently:</span> {anomaly.actual_location}
                            <span className="text-gray-300 mx-2">•</span>
                            <Clock className="w-3 h-3 inline" /> {formatTimeAgo(anomaly.created_at)}
                          </div>
                        )}
                        {anomaly.description && (
                          <p className="text-sm text-gray-600 mb-3">{anomaly.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            <BarChart3 className="w-3 h-3 mr-1" /> VIEW TIMELINE
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            <Volume2 className="w-3 h-3 mr-1" /> VOICE INTERVENTION
                          </Button>
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="h-7 text-xs bg-green-600 hover:bg-green-700"
                            onClick={() => handleResolve(anomaly.id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> AUTO-RESOLVE IF COMPLIES
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'watchlist' && (
          <Card className="border-l-4 border-l-yellow-500 shadow-lg">
            <CardHeader className="pb-2 bg-yellow-50/50">
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Eye className="w-5 h-5" />
                🟡 WATCHLIST - AT-RISK STUDENT MONITORING
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {watchlistAnomalies.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p className="font-medium">No students on watchlist</p>
                  <p className="text-sm">All student patterns within normal range</p>
                </div>
              ) : (
                watchlistAnomalies.map((anomaly) => (
                  <div key={anomaly.id} className="py-4 first:pt-2 last:pb-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">📊</span>
                          <span className="font-medium">AI Pattern Alert:</span>
                          <span className="font-semibold">{anomaly.student_name || 'Unknown Student'}</span>
                          {anomaly.student_class && <span className="text-gray-500">({anomaly.student_class})</span>}
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Concerning Trends Detected:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {anomaly.trends ? (
                              anomaly.trends.map((trend: string, i: number) => (
                                <li key={i} className="flex items-center gap-2">
                                  <span className="text-yellow-500">•</span> {trend}
                                </li>
                              ))
                            ) : (
                              <>
                                <li className="flex items-center gap-2">
                                  <span className="text-yellow-500">•</span> {anomaly.description || 'Behavioral pattern change detected'}
                                </li>
                              </>
                            )}
                          </ul>
                          {anomaly.last_seen_location && (
                            <p className="text-sm text-gray-500 mt-2">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              Last seen: {anomaly.last_seen_location} ({formatTimeAgo(anomaly.created_at)})
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/admin/students/${anomaly.student_id}`}>
                            <Button size="sm" variant="outline" className="h-7 text-xs">
                              <User className="w-3 h-3 mr-1" /> VIEW FULL PROFILE
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" /> NOTIFY COUNSELOR
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            <Phone className="w-3 h-3 mr-1" /> ALERT PARENT
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs">
                            <BookOpen className="w-3 h-3 mr-1" /> ADD NOTE
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'resolved' && (
          <Card className="border-l-4 border-l-green-500 shadow-lg">
            <CardHeader className="pb-2 bg-green-50/50">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                ✅ AUTO-RESOLVED - SYSTEM HANDLED ({autoResolvedToday} today)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-4 text-center text-gray-500">
                <CheckCircle className="w-16 h-16 mx-auto mb-3 text-green-500" />
                <p className="font-medium text-lg text-green-700">{autoResolvedToday} issues auto-resolved today</p>
                <p className="text-sm">The AI system automatically handled these anomalies</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" /> REFRESH
          </Button>
          <Link href="/admin/settings/rules">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" /> CONFIGURE RULES
            </Button>
          </Link>
          <Link href="/admin/attendance-analytics">
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" /> VIEW ANALYTICS
            </Button>
          </Link>
        </div>
        <div className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
