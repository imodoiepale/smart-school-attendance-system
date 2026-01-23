-- Migration 005: Add Anomaly Detection & AI Action Queue System
-- This migration adds all tables needed for the AI-driven anomaly detection system

-- ============================================================================
-- 1. ANOMALIES TABLE - Core anomaly tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.anomalies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  anomaly_type text NOT NULL CHECK (anomaly_type IN (
    'class_skipping', 'loitering', 'unauthorized_exit', 'unknown_face',
    'out_of_bounds', 'meal_fraud', 'late_arrival', 'behavioral_pattern',
    'attendance_drop', 'uniform_violation', 'security_breach'
  )),
  severity text NOT NULL CHECK (severity IN ('critical', 'warning', 'watchlist', 'info')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved', 'escalated', 'dismissed')),
  
  -- Student/Person Information
  user_id text REFERENCES user_registry(user_id),
  user_name text NOT NULL,
  person_type text DEFAULT 'student',
  
  -- Location & Detection
  detected_location text NOT NULL,
  expected_location text,
  camera_id text,
  camera_name text,
  
  -- Timing
  detected_at timestamp with time zone NOT NULL DEFAULT now(),
  duration_minutes integer DEFAULT 0,
  expected_until timestamp with time zone,
  
  -- Context
  description text NOT NULL,
  context_data jsonb,
  related_period integer,
  related_event_id uuid REFERENCES special_events(id),
  
  -- Resolution
  resolution_method text CHECK (resolution_method IN ('auto', 'manual', 'escalated', 'dismissed')),
  resolved_at timestamp with time zone,
  resolved_by text,
  resolution_notes text,
  compliance_time_seconds integer,
  
  -- Intervention
  intervention_type text CHECK (intervention_type IN ('voice', 'sms', 'call', 'security_dispatch', 'none')),
  intervention_at timestamp with time zone,
  intervention_by text,
  
  -- Assignment
  assigned_to text,
  assigned_at timestamp with time zone,
  priority_score integer DEFAULT 50,
  
  -- Audit
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_anomalies_status ON anomalies(status);
CREATE INDEX idx_anomalies_severity ON anomalies(severity);
CREATE INDEX idx_anomalies_user_id ON anomalies(user_id);
CREATE INDEX idx_anomalies_detected_at ON anomalies(detected_at DESC);
CREATE INDEX idx_anomalies_active ON anomalies(status, severity) WHERE status = 'active';
CREATE INDEX idx_anomalies_user_status ON anomalies(user_id, status);

-- ============================================================================
-- 2. VOICE INTERVENTIONS TABLE - Audio intervention logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.voice_interventions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  anomaly_id uuid REFERENCES anomalies(id),
  
  -- Broadcast Details
  broadcast_type text NOT NULL CHECK (broadcast_type IN ('live_voice', 'text_to_speech', 'pre_recorded')),
  zone text NOT NULL,
  speaker_ids text[] NOT NULL,
  
  -- Message
  message_text text NOT NULL,
  audio_file_url text,
  duration_seconds integer,
  
  -- Admin
  admin_id text NOT NULL,
  admin_name text NOT NULL,
  
  -- Timing
  broadcast_at timestamp with time zone DEFAULT now(),
  
  -- Metadata
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_voice_interventions_anomaly ON voice_interventions(anomaly_id);
CREATE INDEX idx_voice_interventions_broadcast_at ON voice_interventions(broadcast_at DESC);
CREATE INDEX idx_voice_interventions_admin ON voice_interventions(admin_id);

-- ============================================================================
-- 3. SPEAKER ZONES TABLE - PA system configuration
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.speaker_zones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Zone Details
  zone_name text NOT NULL UNIQUE,
  zone_code text NOT NULL UNIQUE,
  building text,
  floor text,
  area_description text NOT NULL,
  
  -- Speakers
  speaker_ids text[] NOT NULL,
  speaker_count integer NOT NULL,
  
  -- Coverage
  camera_coverage text[],
  adjacent_zones text[],
  
  -- Configuration
  volume_level integer DEFAULT 70 CHECK (volume_level >= 0 AND volume_level <= 100),
  is_active boolean DEFAULT true,
  
  -- Metadata
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_speaker_zones_active ON speaker_zones(is_active);
CREATE INDEX idx_speaker_zones_zone_code ON speaker_zones(zone_code);

-- ============================================================================
-- 4. COMPLIANCE MONITORING TABLE - Track anomaly compliance
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.compliance_monitoring (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Anomaly Reference
  anomaly_id uuid NOT NULL REFERENCES anomalies(id),
  user_id text NOT NULL REFERENCES user_registry(user_id),
  
  -- Monitoring Details
  expected_action text NOT NULL,
  expected_location text,
  deadline timestamp with time zone,
  
  -- Tracking
  check_interval_seconds integer DEFAULT 60,
  last_check_at timestamp with time zone,
  checks_performed integer DEFAULT 0,
  
  -- Status
  compliance_status text DEFAULT 'monitoring' CHECK (compliance_status IN (
    'monitoring', 'compliant', 'non_compliant', 'expired', 'cancelled'
  )),
  compliant_at timestamp with time zone,
  
  -- Location History
  location_checks jsonb[] DEFAULT ARRAY[]::jsonb[],
  
  -- Escalation
  escalation_triggered boolean DEFAULT false,
  escalation_at timestamp with time zone,
  
  -- Audit
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_compliance_monitoring_anomaly ON compliance_monitoring(anomaly_id);
CREATE INDEX idx_compliance_monitoring_status ON compliance_monitoring(compliance_status);
CREATE INDEX idx_compliance_monitoring_active ON compliance_monitoring(compliance_status) WHERE compliance_status = 'monitoring';
CREATE INDEX idx_compliance_monitoring_user ON compliance_monitoring(user_id);

-- ============================================================================
-- 5. AI INSIGHTS TABLE - AI-generated patterns and recommendations
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Insight Type
  insight_type text NOT NULL CHECK (insight_type IN (
    'attendance_pattern', 'behavioral_trend', 'security_risk',
    'performance_anomaly', 'hardware_utilization', 'recommendation'
  )),
  
  -- Scope
  scope text NOT NULL CHECK (scope IN ('student', 'class', 'form', 'school', 'camera', 'event')),
  scope_id text,
  scope_name text,
  
  -- Insight Details
  title text NOT NULL,
  description text NOT NULL,
  severity text CHECK (severity IN ('critical', 'warning', 'info', 'positive')),
  confidence_score double precision CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Data
  supporting_data jsonb NOT NULL,
  metrics jsonb,
  
  -- Recommendations
  recommended_actions text[],
  
  -- Status
  status text DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'actioned', 'dismissed')),
  acknowledged_by text,
  acknowledged_at timestamp with time zone,
  action_taken text,
  action_taken_at timestamp with time zone,
  
  -- Timing
  detected_at timestamp with time zone DEFAULT now(),
  valid_until timestamp with time zone,
  
  -- Audit
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX idx_ai_insights_scope ON ai_insights(scope, scope_id);
CREATE INDEX idx_ai_insights_status ON ai_insights(status);
CREATE INDEX idx_ai_insights_detected_at ON ai_insights(detected_at DESC);
CREATE INDEX idx_ai_insights_severity ON ai_insights(severity);

-- ============================================================================
-- 6. UPDATE EXISTING TABLES - Add behavioral tracking to user_registry
-- ============================================================================
ALTER TABLE user_registry ADD COLUMN IF NOT EXISTS risk_level text DEFAULT 'normal' CHECK (risk_level IN ('normal', 'watch', 'high_risk', 'critical'));
ALTER TABLE user_registry ADD COLUMN IF NOT EXISTS risk_score integer DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100);
ALTER TABLE user_registry ADD COLUMN IF NOT EXISTS last_anomaly_date date;
ALTER TABLE user_registry ADD COLUMN IF NOT EXISTS total_anomalies_count integer DEFAULT 0;
ALTER TABLE user_registry ADD COLUMN IF NOT EXISTS attendance_rate_30day double precision;
ALTER TABLE user_registry ADD COLUMN IF NOT EXISTS punctuality_score double precision;
ALTER TABLE user_registry ADD COLUMN IF NOT EXISTS behavioral_notes text;

CREATE INDEX IF NOT EXISTS idx_user_registry_risk_level ON user_registry(risk_level);
CREATE INDEX IF NOT EXISTS idx_user_registry_risk_score ON user_registry(risk_score DESC);

-- ============================================================================
-- 7. UPDATE CAMERA METADATA - Add speaker integration
-- ============================================================================
ALTER TABLE camera_metadata ADD COLUMN IF NOT EXISTS has_speaker boolean DEFAULT false;
ALTER TABLE camera_metadata ADD COLUMN IF NOT EXISTS speaker_zone_id uuid REFERENCES speaker_zones(id);
ALTER TABLE camera_metadata ADD COLUMN IF NOT EXISTS detection_zones jsonb;
ALTER TABLE camera_metadata ADD COLUMN IF NOT EXISTS restricted_area boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_camera_metadata_speaker_zone ON camera_metadata(speaker_zone_id);
CREATE INDEX IF NOT EXISTS idx_camera_metadata_restricted ON camera_metadata(restricted_area) WHERE restricted_area = true;

-- ============================================================================
-- 8. UPDATE STUDENT WHEREABOUTS - Add anomaly tracking
-- ============================================================================
ALTER TABLE student_whereabouts ADD COLUMN IF NOT EXISTS anomaly_detected boolean DEFAULT false;
ALTER TABLE student_whereabouts ADD COLUMN IF NOT EXISTS anomaly_id uuid REFERENCES anomalies(id);
ALTER TABLE student_whereabouts ADD COLUMN IF NOT EXISTS last_anomaly_check timestamp with time zone;

CREATE INDEX IF NOT EXISTS idx_student_whereabouts_anomaly ON student_whereabouts(anomaly_detected) WHERE anomaly_detected = true;

-- ============================================================================
-- 9. INSERT SAMPLE SPEAKER ZONES (for testing)
-- ============================================================================
INSERT INTO speaker_zones (zone_name, zone_code, building, floor, area_description, speaker_ids, speaker_count, camera_coverage) VALUES
('Corridor A - North Wing', 'CA-NORTH', 'Main Building', '1', 'North wing corridor connecting classrooms 1A-1D', ARRAY['SPK-CA-01', 'SPK-CA-02', 'SPK-CA-03'], 3, ARRAY['CAM-001', 'CAM-002']),
('Corridor B - West Wing', 'CB-WEST', 'Main Building', '1', 'West wing corridor near library', ARRAY['SPK-CB-01', 'SPK-CB-02', 'SPK-CB-03'], 3, ARRAY['CAM-004', 'CAM-005']),
('Dining Hall', 'DH-MAIN', 'Dining Building', '1', 'Main dining hall area', ARRAY['SPK-DH-01', 'SPK-DH-02', 'SPK-DH-03', 'SPK-DH-04'], 4, ARRAY['CAM-008', 'CAM-009', 'CAM-010', 'CAM-011']),
('Assembly Ground', 'AG-MAIN', 'Outdoor', 'Ground', 'Main assembly ground', ARRAY['SPK-AG-01', 'SPK-AG-02', 'SPK-AG-03', 'SPK-AG-04', 'SPK-AG-05'], 5, ARRAY['CAM-020', 'CAM-021', 'CAM-022']),
('Dormitory Block A', 'DB-A', 'Dormitory A', '1-3', 'Dormitory block A all floors', ARRAY['SPK-DA-01', 'SPK-DA-02'], 2, ARRAY['CAM-030', 'CAM-031'])
ON CONFLICT (zone_code) DO NOTHING;

-- ============================================================================
-- 10. CREATE FUNCTIONS FOR ANOMALY MANAGEMENT
-- ============================================================================

-- Function to auto-resolve anomaly when compliance is achieved
CREATE OR REPLACE FUNCTION auto_resolve_anomaly()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.compliance_status = 'compliant' AND OLD.compliance_status = 'monitoring' THEN
    UPDATE anomalies 
    SET 
      status = 'resolved',
      resolution_method = 'auto',
      resolved_at = now(),
      compliance_time_seconds = EXTRACT(EPOCH FROM (now() - detected_at))::integer
    WHERE id = NEW.anomaly_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_resolve_anomaly
  AFTER UPDATE ON compliance_monitoring
  FOR EACH ROW
  EXECUTE FUNCTION auto_resolve_anomaly();

-- Function to update user registry anomaly count
CREATE OR REPLACE FUNCTION update_user_anomaly_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' OR NEW.status = 'dismissed' THEN
    UPDATE user_registry
    SET 
      total_anomalies_count = total_anomalies_count + 1,
      last_anomaly_date = CURRENT_DATE
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_anomaly_count
  AFTER UPDATE ON anomalies
  FOR EACH ROW
  WHEN (OLD.status = 'active' AND (NEW.status = 'resolved' OR NEW.status = 'dismissed'))
  EXECUTE FUNCTION update_user_anomaly_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_anomalies_updated_at
  BEFORE UPDATE ON anomalies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_compliance_monitoring_updated_at
  BEFORE UPDATE ON compliance_monitoring
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_speaker_zones_updated_at
  BEFORE UPDATE ON speaker_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 11. GRANT PERMISSIONS
-- ============================================================================
-- Grant appropriate permissions (adjust based on your auth setup)
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaker_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Create policies (example - adjust based on your auth requirements)
CREATE POLICY "Enable read access for authenticated users" ON anomalies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON anomalies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON anomalies
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Similar policies for other tables
CREATE POLICY "Enable read access for authenticated users" ON voice_interventions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON speaker_zones
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON compliance_monitoring
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON ai_insights
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================================
-- Migration Complete
-- ============================================================================
