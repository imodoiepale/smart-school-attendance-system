-- SmartSchool Sentinel: Complete Attendance Management System Schema
-- Database: PostgreSQL with Supabase
-- Last Updated: 2026-01-14

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('senior_master', 'teacher', 'gate_guard', 'parent', 'admin', 'it_staff');
CREATE TYPE attendance_status AS ENUM ('present', 'on_time', 'late_minor', 'late_major', 'very_late', 'absent', 'authorized_absence', 'off_campus');
CREATE TYPE absence_reason_type AS ENUM ('sick', 'medical_appointment', 'family_emergency', 'field_trip', 'sports_event', 'counseling', 'other');
CREATE TYPE student_status AS ENUM ('on_campus', 'off_campus', 'medical_leave', 'unknown');
CREATE TYPE exit_approval_status AS ENUM ('pending', 'approved', 'denied', 'returned');
CREATE TYPE event_status AS ENUM ('planned', 'scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE event_type AS ENUM ('field_trip', 'sports_tournament', 'assembly', 'activity', 'other');
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'supper');

-- ============================================================================
-- PROFILES & USERS
-- ============================================================================

CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  phone text,
  role user_role NOT NULL DEFAULT 'parent',
  avatar_url text,
  class_assigned text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- STUDENTS & FAMILY
-- ============================================================================

CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date,
  gender text,
  grade text NOT NULL,
  class text NOT NULL,
  house text,
  status student_status DEFAULT 'on_campus',
  photo_url text,
  face_descriptor jsonb,
  boarding_status text,
  parent_id uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.parent_contacts (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  parent_name text NOT NULL,
  relationship text,
  phone text,
  email text,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- CAMERAS & DEVICES
-- ============================================================================

CREATE TABLE public.cameras (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  camera_id text NOT NULL UNIQUE,
  name text NOT NULL,
  location text NOT NULL,
  building text,
  floor text,
  ip_address text,
  mqtt_topic text,
  status text DEFAULT 'online',
  last_heartbeat timestamp with time zone,
  detection_count_today integer DEFAULT 0,
  uptime_percentage numeric(5,2) DEFAULT 100.00,
  is_backup boolean DEFAULT false,
  arm_schedule jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- TIMETABLES & SCHEDULES
-- ============================================================================

CREATE TABLE public.timetables (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_name text NOT NULL,
  class text NOT NULL,
  day_of_week integer,
  period_number integer,
  subject text,
  teacher_id uuid REFERENCES public.profiles(id),
  start_time time,
  end_time time,
  room_location text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.schedule_overrides (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  class text,
  date date NOT NULL,
  period_number integer,
  override_type text,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.academic_calendar (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  date date NOT NULL,
  day_type text NOT NULL,
  event_name text,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- ATTENDANCE & DETECTION
-- ============================================================================

CREATE TABLE public.attendance_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id),
  camera_id uuid NOT NULL REFERENCES public.cameras(id),
  event_type text NOT NULL,
  attendance_status attendance_status NOT NULL,
  confidence_score numeric(5,2),
  timestamp timestamp with time zone DEFAULT now(),
  period integer,
  class text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.last_known_location (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id uuid NOT NULL UNIQUE REFERENCES public.students(id),
  camera_id uuid REFERENCES public.cameras(id),
  location_name text,
  timestamp timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- ABSENCE MANAGEMENT
-- ============================================================================

CREATE TABLE public.absence_requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id),
  start_date date NOT NULL,
  end_date date,
  reason absence_reason_type NOT NULL,
  description text,
  status text DEFAULT 'pending',
  requires_certificate boolean DEFAULT false,
  certificate_url text,
  submitted_by uuid REFERENCES public.profiles(id),
  approved_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.chronic_absenteeism (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id uuid NOT NULL UNIQUE REFERENCES public.students(id),
  absence_rate numeric(5,2),
  risk_level text,
  days_missed integer,
  period_analyzed text,
  pattern_notes text,
  last_updated timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- EXIT & DISMISSAL MANAGEMENT
-- ============================================================================

CREATE TABLE public.early_dismissal_requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id),
  requested_by uuid REFERENCES public.profiles(id),
  approval_status exit_approval_status DEFAULT 'pending',
  approved_by uuid REFERENCES public.profiles(id),
  reason text,
  expected_return_time timestamp with time zone,
  actual_return_time timestamp with time zone,
  document_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.exit_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id),
  exit_time timestamp with time zone DEFAULT now(),
  confirmed_by uuid REFERENCES public.profiles(id),
  approval_id uuid REFERENCES public.early_dismissal_requests(id),
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- SPECIAL EVENTS & FIELD TRIPS
-- ============================================================================

CREATE TABLE public.special_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_name text NOT NULL,
  event_type event_type NOT NULL,
  event_category text,
  location text,
  date date NOT NULL,
  departure_time time,
  expected_return_time time,
  status event_status DEFAULT 'planned',
  notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.event_participants (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.special_events(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status text DEFAULT 'registered',
  departed_at timestamp with time zone,
  returned_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.event_supervising_teachers (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.special_events(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.absence_exemptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id),
  event_id uuid NOT NULL REFERENCES public.special_events(id),
  exemption_type text DEFAULT 'auto_created',
  status text DEFAULT 'confirmed',
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- MEAL TRACKING
-- ============================================================================

CREATE TABLE public.meal_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id),
  meal_type meal_type NOT NULL,
  date date NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  camera_id uuid REFERENCES public.cameras(id),
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- NOTES & ANNOTATIONS
-- ============================================================================

CREATE TABLE public.tracking_notes (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id),
  note_type text NOT NULL,
  content text NOT NULL,
  visibility text DEFAULT 'private',
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.event_notes (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.special_events(id),
  note_type text,
  content text,
  visibility text,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- ALERTS & INTERVENTIONS
-- ============================================================================

CREATE TABLE public.alerts (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  alert_type text NOT NULL,
  severity text NOT NULL,
  student_id uuid REFERENCES public.students(id),
  description text,
  action_required boolean DEFAULT false,
  status text DEFAULT 'open',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.interventions (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id),
  intervention_type text,
  notes text,
  assigned_to uuid REFERENCES public.profiles(id),
  status text DEFAULT 'open',
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- AUDIT LOGGING
-- ============================================================================

CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  changes jsonb,
  ip_address text,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_attendance_student_id ON public.attendance_logs(student_id);
CREATE INDEX idx_attendance_timestamp ON public.attendance_logs(timestamp);
CREATE INDEX idx_attendance_camera_id ON public.attendance_logs(camera_id);
CREATE INDEX idx_student_status ON public.students(status);
CREATE INDEX idx_exit_approval_status ON public.early_dismissal_requests(approval_status);
CREATE INDEX idx_absence_student_date ON public.absence_requests(student_id, start_date);
CREATE INDEX idx_event_date ON public.special_events(date);
CREATE INDEX idx_meal_student_date ON public.meal_logs(student_id, date);
CREATE INDEX idx_camera_status ON public.cameras(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.early_dismissal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own profile
CREATE POLICY profile_self_select ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Admins can see all students
CREATE POLICY student_admin_select ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'senior_master')
    )
  );

-- Policy: Parents can only see their children
CREATE POLICY student_parent_select ON public.students
  FOR SELECT USING (
    auth.uid() = parent_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'senior_master', 'teacher')
    )
  );
