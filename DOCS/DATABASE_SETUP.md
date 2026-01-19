# Database Setup Guide

## 🗄️ Required Database Tables

Your app is **actively fetching** from these Supabase tables. Make sure they exist:

### Core Tables (Required)

#### 1. `students`
```sql
-- Columns being queried:
- id (uuid, primary key)
- student_id (text, unique)
- full_name (text)
- class (text)
- grade (text)
- status (text) -- 'on_campus', 'off_campus', 'unknown'
- photo_url (text, nullable)
- parent_id (uuid, nullable) -- Links to profiles.id
- created_at (timestamp)
```

**Used by:** Dashboard, Teachers, Parents, Gate Security, Admin Students

#### 2. `attendance`
```sql
-- Columns being queried:
- id (uuid, primary key)
- student_id (uuid, foreign key -> students.id)
- event_type (text) -- 'entry', 'exit'
- timestamp (timestamp)
- status (text) -- 'present', 'late', 'absent'
- created_at (timestamp)
```

**Used by:** Dashboard, Teachers, Parents, Gate Security

#### 3. `profiles`
```sql
-- Columns being queried:
- id (uuid, primary key, links to auth.users)
- email (text)
- full_name (text)
- role (text) -- 'admin', 'teacher', 'parent', 'security'
- created_at (timestamp)
```

**Used by:** All protected routes (auth check), Parents

#### 4. `alerts`
```sql
-- Columns being queried:
- id (uuid, primary key)
- alert_type (text)
- description (text)
- severity (text) -- 'urgent', 'high', 'normal'
- student_id (uuid, nullable)
- resolved (boolean)
- created_at (timestamp)
```

**Used by:** Dashboard

#### 5. `absence_requests`
```sql
-- Columns being queried:
- id (uuid, primary key)
- student_id (uuid, foreign key -> students.id)
- absence_date_start (date)
- absence_date_end (date)
- reason (text)
- status (text) -- 'pending', 'approved', 'rejected'
- created_at (timestamp)
```

**Used by:** Parents Portal

#### 6. `cameras`
```sql
-- Columns being queried:
- id (uuid, primary key)
- name (text)
- location (text)
- status (text) -- 'online', 'offline'
- last_heartbeat (timestamp, nullable)
- detection_count_today (integer, nullable)
- zone (text, nullable)
- created_at (timestamp)
```

**Used by:** Admin Cameras

#### 7. `special_events`
```sql
-- Columns being queried:
- id (uuid, primary key)
- name (text)
- type (text) -- 'field_trip', 'sports', 'assembly'
- location (text, nullable)
- date_start (timestamp)
- status (text) -- 'scheduled', 'in_progress', 'completed'
- expected_return_time (timestamp, nullable)
- created_at (timestamp)
```

**Used by:** Admin Events

#### 8. `event_participants`
```sql
-- Columns being queried:
- id (uuid, primary key)
- event_id (uuid, foreign key -> special_events.id)
- student_id (uuid, foreign key -> students.id)
- created_at (timestamp)
```

**Used by:** Admin Events

#### 9. `timetable_periods` (Optional)
```sql
-- Columns needed:
- id (uuid, primary key)
- class_id (text)
- day_of_week (integer) -- 0-6
- period_number (integer)
- subject (text)
- teacher_id (uuid, nullable)
- start_time (time)
- end_time (time)
```

**Used by:** Admin Timetables

## 🚀 Quick Setup

### Step 1: Run Initial Schema
```sql
-- In Supabase SQL Editor, run:
-- File: scripts/001-init-schema.sql
```

### Step 2: Add Performance Indexes
```sql
-- In Supabase SQL Editor, run:
-- File: scripts/002-performance-indexes.sql
```

### Step 3: Verify Tables Exist
```sql
-- Check all tables are created:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected output:
- absence_requests
- alerts
- attendance
- cameras
- event_participants
- profiles
- special_events
- students
- timetable_periods

### Step 4: Add Sample Data (Optional)
```sql
-- Insert test student
INSERT INTO students (id, student_id, full_name, class, grade, status)
VALUES (
  gen_random_uuid(),
  'STU001',
  'John Doe',
  'Form 1A',
  '9',
  'on_campus'
);

-- Insert test attendance
INSERT INTO attendance (id, student_id, event_type, timestamp, status)
SELECT 
  gen_random_uuid(),
  id,
  'entry',
  NOW(),
  'present'
FROM students
LIMIT 1;

-- Insert test camera
INSERT INTO cameras (id, name, location, status)
VALUES (
  gen_random_uuid(),
  'Main Gate Camera',
  'Main Entrance',
  'online'
);
```

## 🔐 Row Level Security (RLS)

Enable RLS on all tables for security:

```sql
-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE absence_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Example policy for students (allow authenticated users to read)
CREATE POLICY "Allow authenticated users to read students"
ON students FOR SELECT
TO authenticated
USING (true);

-- Example policy for attendance (allow authenticated users to read)
CREATE POLICY "Allow authenticated users to read attendance"
ON attendance FOR SELECT
TO authenticated
USING (true);

-- Add similar policies for other tables
```

## 🔍 Verify Data Fetching

Test each route's queries:

### Dashboard
```sql
-- Today's attendance
SELECT id, event_type, timestamp, created_at
FROM attendance
WHERE created_at >= CURRENT_DATE
ORDER BY created_at DESC
LIMIT 100;

-- Student stats
SELECT id, status
FROM students
LIMIT 1000;
```

### Teachers
```sql
-- Today's class attendance
SELECT a.*, s.id, s.full_name, s.student_id, s.class
FROM attendance a
JOIN students s ON a.student_id = s.id
WHERE a.created_at >= CURRENT_DATE
ORDER BY a.created_at DESC;
```

### Parents
```sql
-- Children for a parent
SELECT *
FROM students
WHERE parent_id = 'parent-uuid-here'
ORDER BY full_name;

-- Absence requests
SELECT ar.*, s.full_name
FROM absence_requests ar
JOIN students s ON ar.student_id = s.id
WHERE ar.student_id IN (SELECT id FROM students WHERE parent_id = 'parent-uuid-here')
ORDER BY ar.created_at DESC;
```

### Gate Security
```sql
-- Students on campus
SELECT *
FROM students
WHERE status = 'on_campus'
ORDER BY full_name;

-- Recent exits
SELECT a.*, s.id, s.full_name, s.student_id, s.photo_url
FROM attendance a
JOIN students s ON a.student_id = s.id
WHERE a.event_type = 'exit'
ORDER BY a.timestamp DESC
LIMIT 20;
```

### Admin - Students
```sql
-- All students
SELECT *
FROM students
ORDER BY last_name ASC;
```

### Admin - Cameras
```sql
-- All cameras
SELECT *
FROM cameras
ORDER BY created_at DESC;
```

### Admin - Events
```sql
-- All events
SELECT *
FROM special_events
ORDER BY date_start DESC;

-- Event participants
SELECT ep.*, s.full_name
FROM event_participants ep
JOIN students s ON ep.student_id = s.id;
```

## ⚠️ Common Issues

### Issue: "relation does not exist"
**Solution:** Table not created. Run `scripts/001-init-schema.sql`

### Issue: "permission denied for table"
**Solution:** RLS enabled but no policies. Add policies or disable RLS for testing:
```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

### Issue: "No data showing in app"
**Solution:** Tables exist but empty. Add sample data (see Step 4 above)

### Issue: "foreign key violation"
**Solution:** Inserting data in wrong order. Insert parent tables first:
1. students
2. attendance (references students)
3. event_participants (references students and special_events)

## 📊 Data Relationships

```
profiles (auth users)
  └── students (parent_id -> profiles.id)
      ├── attendance (student_id -> students.id)
      ├── absence_requests (student_id -> students.id)
      └── event_participants (student_id -> students.id)

special_events
  └── event_participants (event_id -> special_events.id)

cameras (independent)
alerts (independent, optional student_id)
timetable_periods (independent)
```

## 🎯 Next Steps

1. ✅ Verify all tables exist
2. ✅ Run performance indexes
3. ✅ Add sample data for testing
4. ✅ Test each route loads data
5. ⚠️ Configure RLS policies
6. ⚠️ Set up real-time subscriptions (optional)

---

**Last Updated:** 2026-01-19
**Required Tables:** 9
**All routes are fetching from database:** ✅ Yes
