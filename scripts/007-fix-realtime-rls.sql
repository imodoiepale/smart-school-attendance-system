-- ============================================================================
-- FIX RLS POLICIES FOR REALTIME TO WORK
-- Run this in Supabase SQL Editor
-- ============================================================================

-- The issue: RLS is enabled on attendance_logs but no SELECT policy exists
-- This blocks realtime events from being received by authenticated users

-- ============================================================================
-- 1. ADD SELECT POLICIES FOR REALTIME TABLES
-- ============================================================================

-- attendance_logs - Allow authenticated users to read
CREATE POLICY IF NOT EXISTS "Enable read access for authenticated users" 
ON public.attendance_logs
FOR SELECT 
USING (auth.role() = 'authenticated');

-- If the above fails due to policy already existing, try this:
-- DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.attendance_logs;
-- CREATE POLICY "Enable read access for authenticated users" ON public.attendance_logs FOR SELECT USING (auth.role() = 'authenticated');

-- user_registry - Allow authenticated users to read
CREATE POLICY IF NOT EXISTS "Enable read access for authenticated users" 
ON public.user_registry
FOR SELECT 
USING (auth.role() = 'authenticated');

-- camera_metadata - Allow authenticated users to read
CREATE POLICY IF NOT EXISTS "Enable read access for authenticated users" 
ON public.camera_metadata
FOR SELECT 
USING (auth.role() = 'authenticated');

-- events - Allow authenticated users to read
CREATE POLICY IF NOT EXISTS "Enable read access for authenticated users" 
ON public.events
FOR SELECT 
USING (auth.role() = 'authenticated');

-- ============================================================================
-- 2. ALTERNATIVE: DISABLE RLS FOR TESTING (NOT RECOMMENDED FOR PRODUCTION)
-- ============================================================================
-- Uncomment these lines ONLY for testing. Re-enable RLS after testing.

-- ALTER TABLE public.attendance_logs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_registry DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.camera_metadata DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. VERIFY RLS POLICIES
-- ============================================================================

-- Check existing policies on attendance_logs
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'attendance_logs';

-- ============================================================================
-- 4. TEST REALTIME WITH A MANUAL INSERT
-- ============================================================================
-- After running the above, insert a test record to verify realtime works:

-- INSERT INTO attendance_logs (
--     user_id, 
--     user_name, 
--     camera_id, 
--     camera_name, 
--     event_type, 
--     attendance_status, 
--     timestamp,
--     created_at
-- ) VALUES (
--     'test-user-123',
--     'Test Student',
--     'cam-test',
--     'Test Camera',
--     'entry',
--     'present',
--     NOW(),
--     NOW()
-- );

-- ============================================================================
-- 5. GRANT REALTIME PERMISSIONS
-- ============================================================================

-- Ensure authenticated users can receive realtime updates
GRANT SELECT ON public.attendance_logs TO authenticated;
GRANT SELECT ON public.user_registry TO authenticated;
GRANT SELECT ON public.camera_metadata TO authenticated;
GRANT SELECT ON public.events TO authenticated;
GRANT SELECT ON public.anomalies TO authenticated;

-- For service role (if using service key for inserts)
GRANT ALL ON public.attendance_logs TO service_role;
GRANT ALL ON public.user_registry TO service_role;

-- ============================================================================
-- 6. CHECK REALTIME PUBLICATION STATUS
-- ============================================================================

SELECT 
    schemaname,
    tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
