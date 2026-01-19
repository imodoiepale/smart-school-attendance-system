-- Performance Optimization Indexes for SmartSchool Sentinel
-- Run this after the initial schema (001-init-schema.sql)

-- ============================================
-- ATTENDANCE TABLE INDEXES
-- ============================================

-- Index for querying today's attendance (most common query)
CREATE INDEX IF NOT EXISTS idx_attendance_created_at 
ON attendance(created_at DESC);

-- Index for student attendance lookups
CREATE INDEX IF NOT EXISTS idx_attendance_student_id 
ON attendance(student_id);

-- Index for event type filtering (entry/exit)
CREATE INDEX IF NOT EXISTS idx_attendance_event_type 
ON attendance(event_type);

-- Composite index for student + date queries
CREATE INDEX IF NOT EXISTS idx_attendance_student_date 
ON attendance(student_id, created_at DESC);

-- Index for timestamp-based queries
CREATE INDEX IF NOT EXISTS idx_attendance_timestamp 
ON attendance(timestamp DESC);

-- ============================================
-- STUDENTS TABLE INDEXES
-- ============================================

-- Index for student status (on_campus, off_campus, unknown)
CREATE INDEX IF NOT EXISTS idx_students_status 
ON students(status);

-- Index for student_id lookups (unique searches)
CREATE INDEX IF NOT EXISTS idx_students_student_id 
ON students(student_id);

-- Index for class-based queries
CREATE INDEX IF NOT EXISTS idx_students_class 
ON students(class);

-- Index for full name searches (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_students_full_name_lower 
ON students(LOWER(full_name));

-- Composite index for class + status queries
CREATE INDEX IF NOT EXISTS idx_students_class_status 
ON students(class, status);

-- ============================================
-- ALERTS TABLE INDEXES
-- ============================================

-- Index for active alerts (not resolved)
CREATE INDEX IF NOT EXISTS idx_alerts_resolved 
ON alerts(resolved);

-- Index for alert severity
CREATE INDEX IF NOT EXISTS idx_alerts_severity 
ON alerts(severity);

-- Index for student alerts
CREATE INDEX IF NOT EXISTS idx_alerts_student_id 
ON alerts(student_id);

-- Index for alert creation time
CREATE INDEX IF NOT EXISTS idx_alerts_created_at 
ON alerts(created_at DESC);

-- Composite index for active alerts by severity
CREATE INDEX IF NOT EXISTS idx_alerts_active_severity 
ON alerts(resolved, severity, created_at DESC) 
WHERE resolved = false;

-- ============================================
-- ABSENCE_REQUESTS TABLE INDEXES
-- ============================================

-- Index for absence request status
CREATE INDEX IF NOT EXISTS idx_absence_requests_status 
ON absence_requests(status);

-- Index for student absence requests
CREATE INDEX IF NOT EXISTS idx_absence_requests_student_id 
ON absence_requests(student_id);

-- Index for absence date range queries
CREATE INDEX IF NOT EXISTS idx_absence_requests_dates 
ON absence_requests(absence_date_start, absence_date_end);

-- Composite index for pending requests
CREATE INDEX IF NOT EXISTS idx_absence_requests_pending 
ON absence_requests(status, created_at DESC) 
WHERE status = 'pending';

-- ============================================
-- SPECIAL_EVENTS TABLE INDEXES
-- ============================================

-- Index for event status
CREATE INDEX IF NOT EXISTS idx_special_events_status 
ON special_events(status);

-- Index for event date
CREATE INDEX IF NOT EXISTS idx_special_events_event_date 
ON special_events(event_date);

-- Index for upcoming events
CREATE INDEX IF NOT EXISTS idx_special_events_upcoming 
ON special_events(event_date, status) 
WHERE status IN ('scheduled', 'in_progress');

-- ============================================
-- CAMERAS TABLE INDEXES
-- ============================================

-- Index for camera status
CREATE INDEX IF NOT EXISTS idx_cameras_status 
ON cameras(status);

-- Index for camera zone
CREATE INDEX IF NOT EXISTS idx_cameras_zone 
ON cameras(zone);

-- Index for active cameras
CREATE INDEX IF NOT EXISTS idx_cameras_active 
ON cameras(status) 
WHERE status = 'active';

-- ============================================
-- TIMETABLE_PERIODS TABLE INDEXES
-- ============================================

-- Index for day of week
CREATE INDEX IF NOT EXISTS idx_timetable_periods_day 
ON timetable_periods(day_of_week);

-- Index for class timetable
CREATE INDEX IF NOT EXISTS idx_timetable_periods_class 
ON timetable_periods(class_id);

-- Composite index for class schedule by day
CREATE INDEX IF NOT EXISTS idx_timetable_class_day 
ON timetable_periods(class_id, day_of_week, start_time);

-- ============================================
-- PROFILES TABLE INDEXES
-- ============================================

-- Index for user role
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON profiles(role);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON profiles(email);

-- ============================================
-- PERFORMANCE NOTES
-- ============================================

-- These indexes will significantly improve:
-- 1. Dashboard loading times (attendance queries)
-- 2. Student search and filtering
-- 3. Alert notifications
-- 4. Absence request management
-- 5. Event tracking
-- 6. Camera monitoring

-- Monitor index usage with:
-- SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';

-- Drop unused indexes if needed:
-- DROP INDEX IF EXISTS index_name;

ANALYZE attendance;
ANALYZE students;
ANALYZE alerts;
ANALYZE absence_requests;
ANALYZE special_events;
ANALYZE cameras;
ANALYZE timetable_periods;
ANALYZE profiles;
