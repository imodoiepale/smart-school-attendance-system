export type UserRole = "senior_master" | "teacher" | "gate_guard" | "parent" | "admin" | "it_staff"
export type AttendanceStatus =
  | "present"
  | "on_time"
  | "late_minor"
  | "late_major"
  | "very_late"
  | "absent"
  | "authorized_absence"
  | "off_campus"
export type StudentStatus = "on_campus" | "off_campus" | "medical_leave" | "unknown"
export type AbsenceReasonType =
  | "sick"
  | "medical_appointment"
  | "family_emergency"
  | "field_trip"
  | "sports_event"
  | "counseling"
  | "other"
export type EventStatus = "planned" | "scheduled" | "in_progress" | "completed" | "cancelled"
export type EventType = "field_trip" | "sports_tournament" | "assembly" | "activity" | "other"
export type MealType = "breakfast" | "lunch" | "supper"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  class_assigned: string | null
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  student_id: string
  first_name: string
  last_name: string
  date_of_birth: string | null
  gender: string | null
  grade: string
  class: string
  house: string | null
  status: StudentStatus
  photo_url: string | null
  face_descriptor: Record<string, any> | null
  boarding_status: string | null
  parent_id: string | null
  created_at: string
  updated_at: string
}

export interface Camera {
  id: string
  camera_id: string
  name: string
  location: string
  building: string | null
  floor: string | null
  ip_address: string | null
  mqtt_topic: string | null
  status: string
  last_heartbeat: string | null
  detection_count_today: number
  uptime_percentage: number
  is_backup: boolean
  created_at: string
}

export interface AttendanceLog {
  id: string
  student_id: string
  camera_id: string
  event_type: string
  attendance_status: AttendanceStatus
  confidence_score: number | null
  timestamp: string
  period: number | null
  class: string | null
  created_at: string
}

export interface AbsenceRequest {
  id: string
  student_id: string
  start_date: string
  end_date: string | null
  reason: AbsenceReasonType
  description: string | null
  status: string
  requires_certificate: boolean
  certificate_url: string | null
  submitted_by: string | null
  approved_by: string | null
  created_at: string
  updated_at: string
}

export interface SpecialEvent {
  id: string
  event_name: string
  event_type: EventType
  event_category: string | null
  location: string
  date: string
  departure_time: string | null
  expected_return_time: string | null
  status: EventStatus
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface EventParticipant {
  id: string
  event_id: string
  student_id: string
  status: string
  departed_at: string | null
  returned_at: string | null
  notes: string | null
  created_at: string
}

export interface EarlyDismissal {
  id: string
  student_id: string
  requested_by: string | null
  approval_status: string
  approved_by: string | null
  reason: string
  expected_return_time: string | null
  actual_return_time: string | null
  document_url: string | null
  created_at: string
  updated_at: string
}

export interface ChronicAbsenteeism {
  id: string
  student_id: string
  absence_rate: number
  risk_level: string
  days_missed: number
  period_analyzed: string
  pattern_notes: string | null
  last_updated: string
}
