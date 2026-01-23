-- ============================================================================
-- ENABLE SUPABASE REALTIME FOR ALL REQUIRED TABLES
-- Run this script in Supabase SQL Editor to enable realtime functionality
-- ============================================================================

-- First, check if the publication exists (it should in Supabase)
-- If not, create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END
$$;

-- ============================================================================
-- ADD TABLES TO REALTIME PUBLICATION
-- ============================================================================

-- Core attendance tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.attendance_logs;

-- User/Student tables  
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.user_registry;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.students;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.profiles;

-- Anomaly/Alert tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.anomalies;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.alerts;

-- Location tracking tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.student_whereabouts;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.student_movements;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.last_known_location;

-- Camera tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.cameras;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.camera_metadata;

-- Event tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.special_events;

-- Gate/Leave tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.gate_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.gate_approval_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.leave_approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.visitor_registry;

-- Meal tracking
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.meal_logs;

-- Absence management
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.absence_requests;

-- Interventions
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.interventions;

-- ============================================================================
-- VERIFY REALTIME IS ENABLED
-- ============================================================================

-- Check which tables are in the realtime publication
SELECT 
    schemaname,
    tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- ============================================================================
-- ALTERNATIVE: If above doesn't work, try this approach
-- (Some Supabase versions use different syntax)
-- ============================================================================

-- DROP and recreate publication with all tables
-- WARNING: Only run this if the above doesn't work!
/*
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.attendance_logs,
    public.user_registry,
    public.anomalies,
    public.student_whereabouts,
    public.student_movements,
    public.camera_metadata,
    public.events,
    public.gate_transactions,
    public.leave_approvals;
*/

-- ============================================================================
-- GRANT PERMISSIONS FOR REALTIME
-- ============================================================================

-- Ensure the authenticated role can receive realtime updates
GRANT SELECT ON public.attendance_logs TO authenticated;
GRANT SELECT ON public.user_registry TO authenticated;
GRANT SELECT ON public.anomalies TO authenticated;
GRANT SELECT ON public.student_whereabouts TO authenticated;
GRANT SELECT ON public.student_movements TO authenticated;
GRANT SELECT ON public.camera_metadata TO authenticated;
GRANT SELECT ON public.events TO authenticated;

-- For anon users (if needed for public dashboards)
GRANT SELECT ON public.attendance_logs TO anon;
GRANT SELECT ON public.camera_metadata TO anon;

-- ============================================================================
-- ENABLE REPLICA IDENTITY FOR FULL ROW DATA ON DELETE
-- (Required to get old row data in DELETE events)
-- ============================================================================

ALTER TABLE public.attendance_logs REPLICA IDENTITY FULL;
ALTER TABLE public.user_registry REPLICA IDENTITY FULL;
ALTER TABLE public.anomalies REPLICA IDENTITY FULL;
ALTER TABLE public.student_whereabouts REPLICA IDENTITY FULL;
ALTER TABLE public.student_movements REPLICA IDENTITY FULL;
ALTER TABLE public.events REPLICA IDENTITY FULL;

-- ============================================================================
-- VERIFICATION QUERY
-- Run this to confirm realtime is working
-- ============================================================================

SELECT 
    'Realtime enabled for ' || COUNT(*) || ' tables' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
