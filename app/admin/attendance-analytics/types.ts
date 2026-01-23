// Shared types for attendance analytics components

export interface AttendanceLog {
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

export interface Student {
  id: string
  user_id: string
  full_name: string
  person_type: string
  form?: string
  class_name?: string
  admission_number?: string
  gender?: string
  date_of_birth?: string
  parent_phone?: string
  email?: string
  profile_image_url?: string
  created_at?: string
}

export interface Camera {
  id: string
  camera_id: string
  display_name: string
  location_tag?: string
  camera_group?: string
  status?: string
  ip_address?: string
  created_at?: string
}

export interface Event {
  id: string
  name: string
  description?: string
  event_type: string
  start_date: string
  end_date?: string
  start_time?: string
  end_time?: string
  location?: string
  is_active?: boolean
  created_at?: string
}

export interface FormStructure {
  form: string
  subLevels: string[]
}

export interface CameraGroup {
  name: string
  cameras: Camera[]
}

export interface DateRange {
  from: Date | null
  to: Date | null
}

export type ActiveSection = 'students' | 'forms' | 'cameras' | 'events' | 'meals' | 'trends'

// Utility functions
export const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export const formatShortDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const getEventColor = (eventType: string) => {
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

export const getStatusBadgeClass = (status: string | null) => {
  switch (status) {
    case 'present':
    case 'on_time':
      return 'bg-green-100 text-green-800'
    case 'late_minor':
      return 'bg-yellow-100 text-yellow-800'
    case 'late_major':
      return 'bg-orange-100 text-orange-800'
    case 'very_late':
    case 'absent':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export const getStatusLabel = (status: string | null) => {
  switch (status) {
    case 'present':
    case 'on_time':
      return 'On Time'
    case 'late_minor':
      return 'Late (Minor)'
    case 'late_major':
      return 'Late (Major)'
    case 'very_late':
      return 'Very Late'
    case 'absent':
      return 'Absent'
    default:
      return 'Unknown'
  }
}

// Form structure with sub-levels
export const FORM_STRUCTURE: FormStructure[] = [
  { form: 'Form 1', subLevels: ['1A', '1B', '1C', '1D'] },
  { form: 'Form 2', subLevels: ['2A', '2B', '2C', '2D'] },
  { form: 'Form 3', subLevels: ['3A', '3B', '3C', '3D'] },
  { form: 'Form 4', subLevels: ['4A', '4B', '4C', '4D'] },
]
