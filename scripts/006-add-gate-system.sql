-- Migration 006: Add Gate Security & Leave Management System
-- This migration adds tables for gate operations, visitor management, and leave approvals

-- ============================================================================
-- 1. GATE TRANSACTIONS TABLE - Entry/exit tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.gate_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Person Details
  user_id text REFERENCES user_registry(user_id),
  user_name text NOT NULL,
  person_type text NOT NULL,
  
  -- Transaction Type
  transaction_type text NOT NULL CHECK (transaction_type IN ('entry', 'exit', 'visitor_entry', 'visitor_exit')),
  gate_location text NOT NULL,
  camera_id text NOT NULL,
  
  -- Authorization
  is_authorized boolean DEFAULT false,
  authorization_status text CHECK (authorization_status IN ('approved', 'pending', 'denied', 'auto_approved')),
  authorized_by text,
  authorization_method text CHECK (authorization_method IN ('pre_approved', 'admin_approval', 'auto_system', 'emergency')),
  
  -- Exit Specific
  exit_reason text,
  expected_return_time timestamp with time zone,
  actual_return_time timestamp with time zone,
  return_confirmed boolean DEFAULT false,
  late_return boolean DEFAULT false,
  late_return_minutes integer,
  
  -- Guardian Details (for student exits)
  guardian_name text,
  guardian_id_number text,
  guardian_phone text,
  guardian_photo_url text,
  guardian_signature_url text,
  guardian_relationship text,
  
  -- Visitor Details
  visitor_purpose text,
  visitor_host text,
  visitor_duration_hours integer,
  visitor_temp_face_id text,
  
  -- Gate Guard
  guard_id text NOT NULL,
  guard_name text NOT NULL,
  guard_notes text,
  
  -- Timing
  timestamp timestamp with time zone DEFAULT now(),
  
  -- Verification
  face_match_confidence double precision,
  verification_screenshot_url text,
  
  -- Notifications
  parent_notified boolean DEFAULT false,
  parent_notification_sent_at timestamp with time zone,
  
  -- Metadata
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_gate_transactions_user_id ON gate_transactions(user_id);
CREATE INDEX idx_gate_transactions_type ON gate_transactions(transaction_type);
CREATE INDEX idx_gate_transactions_timestamp ON gate_transactions(timestamp DESC);
CREATE INDEX idx_gate_transactions_pending ON gate_transactions(authorization_status) WHERE authorization_status = 'pending';
CREATE INDEX idx_gate_transactions_gate ON gate_transactions(gate_location);
CREATE INDEX idx_gate_transactions_guard ON gate_transactions(guard_id);

-- ============================================================================
-- 2. VISITOR REGISTRY TABLE - Temporary visitor tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.visitor_registry (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Visitor Details
  full_name text NOT NULL,
  id_number text NOT NULL,
  phone_number text,
  company_organization text,
  
  -- Visit Details
  purpose text NOT NULL,
  host_staff_id text,
  host_staff_name text,
  expected_duration_hours integer DEFAULT 2,
  
  -- Entry/Exit
  entry_time timestamp with time zone NOT NULL,
  expected_exit_time timestamp with time zone NOT NULL,
  actual_exit_time timestamp with time zone,
  
  -- Verification
  photo_url text,
  id_document_url text,
  temp_face_descriptor jsonb,
  
  -- Status
  status text DEFAULT 'on_premises' CHECK (status IN ('on_premises', 'exited', 'overstayed', 'flagged')),
  
  -- Gate Details
  entry_gate text NOT NULL,
  exit_gate text,
  approved_by text NOT NULL,
  
  -- Tracking
  last_seen_camera text,
  last_seen_time timestamp with time zone,
  
  -- Audit
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_visitor_registry_status ON visitor_registry(status);
CREATE INDEX idx_visitor_registry_entry_time ON visitor_registry(entry_time DESC);
CREATE INDEX idx_visitor_registry_id_number ON visitor_registry(id_number);
CREATE INDEX idx_visitor_registry_overstayed ON visitor_registry(status) WHERE status = 'overstayed';

-- ============================================================================
-- 3. LEAVE APPROVALS TABLE - Student leave management
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.leave_approvals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Student Details
  student_id text NOT NULL REFERENCES user_registry(user_id),
  student_name text NOT NULL,
  class text NOT NULL,
  
  -- Leave Details
  leave_type text NOT NULL CHECK (leave_type IN (
    'weekend_home', 'medical', 'family_emergency', 'school_trip',
    'sports_event', 'academic_event', 'other'
  )),
  leave_reason text NOT NULL,
  
  -- Timing
  start_datetime timestamp with time zone NOT NULL,
  end_datetime timestamp with time zone NOT NULL,
  duration_hours integer,
  
  -- Guardian
  guardian_name text NOT NULL,
  guardian_id_number text NOT NULL,
  guardian_phone text NOT NULL,
  guardian_relationship text,
  
  -- Approval
  approval_status text DEFAULT 'pending' CHECK (approval_status IN (
    'pending', 'approved', 'denied', 'cancelled'
  )),
  requested_by text NOT NULL,
  requested_at timestamp with time zone DEFAULT now(),
  approved_by text,
  approved_at timestamp with time zone,
  denial_reason text,
  
  -- Exit/Return Tracking
  exit_confirmed boolean DEFAULT false,
  exit_time timestamp with time zone,
  exit_gate text,
  exit_guard text,
  exit_transaction_id uuid REFERENCES gate_transactions(id),
  
  return_confirmed boolean DEFAULT false,
  return_time timestamp with time zone,
  return_gate text,
  return_guard text,
  return_transaction_id uuid REFERENCES gate_transactions(id),
  late_return boolean DEFAULT false,
  
  -- Documents
  supporting_document_url text,
  guardian_signature_url text,
  
  -- Notifications
  parent_notified boolean DEFAULT false,
  return_reminder_sent boolean DEFAULT false,
  
  -- Metadata
  notes text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_leave_approvals_student ON leave_approvals(student_id);
CREATE INDEX idx_leave_approvals_status ON leave_approvals(approval_status);
CREATE INDEX idx_leave_approvals_dates ON leave_approvals(start_datetime, end_datetime);
CREATE INDEX idx_leave_approvals_pending ON leave_approvals(approval_status) WHERE approval_status = 'pending';
CREATE INDEX idx_leave_approvals_active ON leave_approvals(exit_confirmed, return_confirmed) WHERE exit_confirmed = true AND return_confirmed = false;
CREATE INDEX idx_leave_approvals_approved_active ON leave_approvals(approval_status, exit_confirmed) WHERE approval_status = 'approved' AND exit_confirmed = false;

-- ============================================================================
-- 4. GATE APPROVAL REQUESTS TABLE - Real-time approval queue
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.gate_approval_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Request Details
  request_type text NOT NULL CHECK (request_type IN ('exit', 'late_entry', 'visitor', 'emergency')),
  user_id text REFERENCES user_registry(user_id),
  user_name text NOT NULL,
  
  -- Gate Information
  gate_location text NOT NULL,
  camera_id text NOT NULL,
  guard_id text NOT NULL,
  guard_name text NOT NULL,
  
  -- Request Context
  reason text NOT NULL,
  urgency text DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'emergency')),
  context_data jsonb,
  
  -- Approval
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
  approved_by text,
  approved_at timestamp with time zone,
  denial_reason text,
  
  -- Timing
  requested_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  
  -- Related Records
  leave_approval_id uuid REFERENCES leave_approvals(id),
  visitor_id uuid REFERENCES visitor_registry(id),
  
  -- Metadata
  screenshot_url text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_gate_approval_requests_status ON gate_approval_requests(status);
CREATE INDEX idx_gate_approval_requests_pending ON gate_approval_requests(status, requested_at) WHERE status = 'pending';
CREATE INDEX idx_gate_approval_requests_user ON gate_approval_requests(user_id);
CREATE INDEX idx_gate_approval_requests_guard ON gate_approval_requests(guard_id);

-- ============================================================================
-- 5. GUARDIAN REGISTRY TABLE - Verified guardians database
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.guardian_registry (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Guardian Details
  full_name text NOT NULL,
  id_number text NOT NULL UNIQUE,
  phone_number text NOT NULL,
  email text,
  relationship text NOT NULL,
  
  -- Associated Students
  student_ids text[] NOT NULL,
  primary_guardian boolean DEFAULT false,
  
  -- Verification
  verified boolean DEFAULT false,
  verified_at timestamp with time zone,
  verified_by text,
  
  -- Documents
  photo_url text,
  id_document_url text,
  face_descriptor jsonb,
  
  -- Authorization
  can_pickup boolean DEFAULT true,
  can_approve_leave boolean DEFAULT true,
  restrictions text,
  
  -- Contact Preferences
  preferred_contact_method text CHECK (preferred_contact_method IN ('sms', 'email', 'call', 'whatsapp')),
  notification_enabled boolean DEFAULT true,
  
  -- Audit
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_guardian_registry_id_number ON guardian_registry(id_number);
CREATE INDEX idx_guardian_registry_phone ON guardian_registry(phone_number);
CREATE INDEX idx_guardian_registry_students ON guardian_registry USING GIN(student_ids);

-- ============================================================================
-- 6. CREATE FUNCTIONS FOR GATE OPERATIONS
-- ============================================================================

-- Function to auto-expire pending approval requests
CREATE OR REPLACE FUNCTION expire_old_approval_requests()
RETURNS void AS $$
BEGIN
  UPDATE gate_approval_requests
  SET status = 'expired'
  WHERE status = 'pending' 
    AND (expires_at IS NOT NULL AND expires_at < now())
    OR (expires_at IS NULL AND requested_at < now() - interval '30 minutes');
END;
$$ LANGUAGE plpgsql;

-- Function to check for late returns
CREATE OR REPLACE FUNCTION check_late_returns()
RETURNS void AS $$
BEGIN
  UPDATE leave_approvals
  SET late_return = true
  WHERE approval_status = 'approved'
    AND exit_confirmed = true
    AND return_confirmed = false
    AND end_datetime < now();
END;
$$ LANGUAGE plpgsql;

-- Function to update visitor overstay status
CREATE OR REPLACE FUNCTION check_visitor_overstays()
RETURNS void AS $$
BEGIN
  UPDATE visitor_registry
  SET status = 'overstayed'
  WHERE status = 'on_premises'
    AND expected_exit_time < now();
END;
$$ LANGUAGE plpgsql;

-- Function to link gate transaction to leave approval
CREATE OR REPLACE FUNCTION link_gate_transaction_to_leave()
RETURNS TRIGGER AS $$
DECLARE
  leave_record RECORD;
BEGIN
  -- Check if this is an exit transaction for a student with approved leave
  IF NEW.transaction_type = 'exit' AND NEW.person_type = 'student' THEN
    SELECT * INTO leave_record
    FROM leave_approvals
    WHERE student_id = NEW.user_id
      AND approval_status = 'approved'
      AND exit_confirmed = false
      AND start_datetime <= NEW.timestamp
      AND end_datetime >= NEW.timestamp
    ORDER BY start_datetime
    LIMIT 1;
    
    IF FOUND THEN
      UPDATE leave_approvals
      SET 
        exit_confirmed = true,
        exit_time = NEW.timestamp,
        exit_gate = NEW.gate_location,
        exit_guard = NEW.guard_name,
        exit_transaction_id = NEW.id
      WHERE id = leave_record.id;
    END IF;
  END IF;
  
  -- Check if this is a return transaction
  IF NEW.transaction_type = 'entry' AND NEW.person_type = 'student' THEN
    SELECT * INTO leave_record
    FROM leave_approvals
    WHERE student_id = NEW.user_id
      AND approval_status = 'approved'
      AND exit_confirmed = true
      AND return_confirmed = false
    ORDER BY exit_time DESC
    LIMIT 1;
    
    IF FOUND THEN
      UPDATE leave_approvals
      SET 
        return_confirmed = true,
        return_time = NEW.timestamp,
        return_gate = NEW.gate_location,
        return_guard = NEW.guard_name,
        return_transaction_id = NEW.id,
        late_return = (NEW.timestamp > end_datetime)
      WHERE id = leave_record.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_link_gate_transaction_to_leave
  AFTER INSERT ON gate_transactions
  FOR EACH ROW
  EXECUTE FUNCTION link_gate_transaction_to_leave();

-- Function to update visitor exit
CREATE OR REPLACE FUNCTION update_visitor_exit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_type = 'visitor_exit' AND NEW.visitor_temp_face_id IS NOT NULL THEN
    UPDATE visitor_registry
    SET 
      status = 'exited',
      actual_exit_time = NEW.timestamp,
      exit_gate = NEW.gate_location
    WHERE temp_face_descriptor->>'temp_id' = NEW.visitor_temp_face_id
      AND status = 'on_premises';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_visitor_exit
  AFTER INSERT ON gate_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_visitor_exit();

-- Function to update updated_at timestamp
CREATE TRIGGER trigger_visitor_registry_updated_at
  BEFORE UPDATE ON visitor_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_leave_approvals_updated_at
  BEFORE UPDATE ON leave_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_guardian_registry_updated_at
  BEFORE UPDATE ON guardian_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. GRANT PERMISSIONS & ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE gate_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_registry ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON gate_transactions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON gate_transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON visitor_registry
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON visitor_registry
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON leave_approvals
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON leave_approvals
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON gate_approval_requests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON gate_approval_requests
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON guardian_registry
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================================
-- 8. INSERT SAMPLE DATA (for testing)
-- ============================================================================

-- Sample guardian (adjust as needed)
INSERT INTO guardian_registry (full_name, id_number, phone_number, relationship, student_ids, primary_guardian, verified) VALUES
('Jane Wanjiku', '12345678', '+254712345678', 'Mother', ARRAY['STU001'], true, true),
('John Kamau', '87654321', '+254787654321', 'Father', ARRAY['STU002'], true, true)
ON CONFLICT (id_number) DO NOTHING;

-- ============================================================================
-- Migration Complete
-- ============================================================================
