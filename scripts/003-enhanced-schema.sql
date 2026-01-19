-- Enhanced Schema for New Features
-- Run this after 001-init-schema.sql and 002-performance-indexes.sql

-- Add missing columns to students table for new features
ALTER TABLE students ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_phone TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_email TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS admission_date DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS house TEXT;

-- Add academic performance tracking
CREATE TABLE IF NOT EXISTS academic_grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  grade_value NUMERIC(5,2), -- For calculations (e.g., 85.5)
  term TEXT NOT NULL, -- 'Term 1', 'Term 2', etc.
  academic_year TEXT NOT NULL, -- '2024-2025'
  assessment_type TEXT, -- 'Exam', 'Quiz', 'Assignment', 'Project'
  assessment_date DATE,
  teacher_id UUID REFERENCES profiles(id),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add assignments tracking
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  class TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  total_points NUMERIC(5,2),
  assignment_type TEXT, -- 'Homework', 'Project', 'Essay', etc.
  teacher_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add student assignment submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submission_date TIMESTAMPTZ,
  grade TEXT,
  points_earned NUMERIC(5,2),
  status TEXT DEFAULT 'pending', -- 'pending', 'submitted', 'graded', 'late'
  feedback TEXT,
  submission_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- Add announcements/notices
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- 'general', 'academic', 'event', 'urgent'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  target_audience TEXT[], -- ['students', 'teachers', 'parents', 'staff']
  target_classes TEXT[], -- Specific classes if applicable
  author_id UUID REFERENCES profiles(id),
  author_name TEXT,
  author_role TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  attachments JSONB, -- Array of file URLs
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add announcement comments
CREATE TABLE IF NOT EXISTS announcement_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  user_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add announcement reactions
CREATE TABLE IF NOT EXISTS announcement_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  reaction_type TEXT NOT NULL, -- 'like', 'love', 'helpful', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(announcement_id, user_id, reaction_type)
);

-- Add events/activities
CREATE TABLE IF NOT EXISTS school_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- 'academic', 'sports', 'cultural', 'trip', 'meeting'
  location TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  organizer_id UUID REFERENCES profiles(id),
  organizer_name TEXT,
  target_participants TEXT[], -- ['Form 1A', 'Form 2B', 'All Students']
  max_participants INTEGER,
  registration_required BOOLEAN DEFAULT false,
  registration_deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'ongoing', 'completed', 'cancelled'
  rating NUMERIC(2,1), -- Average rating out of 5
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add event participants
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES school_events(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  attendance_status TEXT, -- 'registered', 'attended', 'absent', 'cancelled'
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, student_id)
);

-- Add timetable periods
CREATE TABLE IF NOT EXISTS timetable_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  period_number INTEGER NOT NULL,
  subject TEXT NOT NULL,
  teacher_id UUID REFERENCES profiles(id),
  teacher_name TEXT,
  room TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_academic_grades_student ON academic_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_academic_grades_subject ON academic_grades(subject);
CREATE INDEX IF NOT EXISTS idx_academic_grades_term ON academic_grades(term);

CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON assignment_submissions(status);

CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);

CREATE INDEX IF NOT EXISTS idx_announcement_comments_announcement ON announcement_comments(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reactions_announcement ON announcement_reactions(announcement_id);

CREATE INDEX IF NOT EXISTS idx_school_events_start ON school_events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_school_events_status ON school_events(status);
CREATE INDEX IF NOT EXISTS idx_school_events_type ON school_events(event_type);

CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_student ON event_participants(student_id);

CREATE INDEX IF NOT EXISTS idx_timetable_periods_class ON timetable_periods(class);
CREATE INDEX IF NOT EXISTS idx_timetable_periods_day ON timetable_periods(day_of_week);

-- Add sample data for testing (optional - comment out if not needed)

-- Sample academic grades
INSERT INTO academic_grades (student_id, subject, grade, grade_value, term, academic_year, assessment_type)
SELECT 
  id,
  subject,
  CASE 
    WHEN random() > 0.7 THEN 'A'
    WHEN random() > 0.4 THEN 'B'
    WHEN random() > 0.2 THEN 'C'
    ELSE 'D'
  END,
  FLOOR(random() * 40 + 60),
  'Term 1',
  '2024-2025',
  'Exam'
FROM students
CROSS JOIN (VALUES ('Mathematics'), ('English'), ('Science'), ('Sports')) AS subjects(subject)
WHERE students.id IN (SELECT id FROM students LIMIT 10)
ON CONFLICT DO NOTHING;

-- Sample announcements
INSERT INTO announcements (title, content, category, priority, target_audience, author_name, author_role)
VALUES 
  ('Annual Book Fair', 'Your education path is an adventure filled with challenges, opportunities, and endless possibilities. Embrace each moment, stay focused...', 'event', 'normal', ARRAY['students', 'parents'], 'Barney Rojas', 'English Teacher'),
  ('Art Competition', 'Unleash your creativity! Submit your artwork by the end of the month.', 'event', 'normal', ARRAY['students'], 'Art Department', 'Teacher'),
  ('Parent-Teacher Meeting', 'Scheduled for next Friday at 2 PM. Please confirm your attendance.', 'academic', 'high', ARRAY['parents'], 'Administration', 'Admin')
ON CONFLICT DO NOTHING;

-- Sample school events
INSERT INTO school_events (name, description, event_type, location, start_datetime, end_datetime, organizer_name, status, rating)
VALUES 
  ('Annual Book Fair', 'Haven for Book Lovers of All Ages', 'cultural', 'School Library', NOW() + INTERVAL '5 days', NOW() + INTERVAL '7 days', 'Library Committee', 'scheduled', 4.5),
  ('Art Competition', 'Unleash your creativity', 'cultural', 'Art Room', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days', 'Art Department', 'scheduled', 4.5)
ON CONFLICT DO NOTHING;

-- Sample assignments
INSERT INTO assignments (title, description, subject, class, due_date, total_points, assignment_type, status)
VALUES 
  ('Branding Visual Identity', 'Create a brand identity for a fictional company', 'Art & Design', 'Form 4A', NOW() + INTERVAL '3 days', 100, 'Project', 'active'),
  ('Literary Analysis', 'Analyze the themes in the assigned novel', 'English', 'Form 4A', NOW() + INTERVAL '5 days', 100, 'Essay', 'active'),
  ('Calculus Challenge', 'Solve advanced calculus problems', 'Mathematics', 'Form 4A', NOW() + INTERVAL '7 days', 100, 'Homework', 'active')
ON CONFLICT DO NOTHING;

-- Sample timetable periods
INSERT INTO timetable_periods (class, day_of_week, period_number, subject, teacher_name, room, start_time, end_time)
VALUES 
  ('Form 1A', 1, 1, 'Mathematics', 'Mr. Smith', 'Room 101', '08:00', '09:00'),
  ('Form 1A', 1, 2, 'English', 'Ms. Johnson', 'Room 102', '09:15', '10:15'),
  ('Form 1A', 1, 3, 'Science', 'Dr. Brown', 'Lab 1', '10:30', '11:30'),
  ('Form 1A', 1, 4, 'Physical Education', 'Coach Davis', 'Gym', '11:45', '12:45')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE academic_grades IS 'Stores student grades and academic performance';
COMMENT ON TABLE assignments IS 'Tracks homework, projects, and assignments';
COMMENT ON TABLE assignment_submissions IS 'Student submissions for assignments';
COMMENT ON TABLE announcements IS 'School-wide announcements and notices';
COMMENT ON TABLE school_events IS 'School events, activities, and trips';
COMMENT ON TABLE event_participants IS 'Tracks student participation in events';
COMMENT ON TABLE timetable_periods IS 'Class schedule and timetable';
