-- ============================================================
-- COMPREHENSIVE AUDIT LOGGING SYSTEM
-- Track all system operations for security and compliance
-- ============================================================

-- ============================================================
-- ENHANCED AUDIT LOG TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS DPMM_AUDIT_LOG_ENHANCED (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON DPMM_AUDIT_LOG_ENHANCED(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON DPMM_AUDIT_LOG_ENHANCED(action);
CREATE INDEX IF NOT EXISTS idx_audit_table_name ON DPMM_AUDIT_LOG_ENHANCED(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON DPMM_AUDIT_LOG_ENHANCED(created_at);

-- ============================================================
-- CREATE AUDIT LOG FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION log_audit(
  p_action TEXT,
  p_table_name TEXT DEFAULT NULL,
  p_record_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_success BOOLEAN DEFAULT TRUE,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
  client_ip TEXT;
  client_ua TEXT;
BEGIN
  -- Get client information
  client_ip := inet_client_addr()::TEXT;
  client_ua := current_setting('request.headers', true);
  
  -- Insert audit log
  INSERT INTO DPMM_AUDIT_LOG_ENHANCED (
    user_id,
    session_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address,
    user_agent,
    success,
    error_message,
    metadata
  ) VALUES (
    auth.uid(),
    current_setting('request.jwt.claim.session_id', true),
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values,
    client_ip,
    client_ua,
    p_success,
    p_error_message,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CREATE AUTOMATIC AUDIT TRIGGERS
-- ============================================================

-- Function to trigger audit on insert
CREATE OR REPLACE FUNCTION audit_insert()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_audit(
    'WRITE',
    TG_TABLE_NAME,
    NEW.id,
    NULL,
    to_jsonb(NEW),
    TRUE,
    NULL,
    jsonb_build_object('operation', 'INSERT')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to trigger audit on update
CREATE OR REPLACE FUNCTION audit_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_audit(
    'WRITE',
    TG_TABLE_NAME,
    NEW.id,
    to_jsonb(OLD),
    to_jsonb(NEW),
    TRUE,
    NULL,
    jsonb_build_object('operation', 'UPDATE')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to trigger audit on delete
CREATE OR REPLACE FUNCTION audit_delete()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_audit(
    'DELETE',
    TG_TABLE_NAME,
    OLD.id,
    to_jsonb(OLD),
    NULL,
    TRUE,
    NULL,
    jsonb_build_object('operation', 'DELETE')
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- APPLY TRIGGERS TO TABLES
-- ============================================================

-- Meeting System Tables
DROP TRIGGER IF EXISTS audit_meeting_insert ON DPMM_MESYUARAT;
DROP TRIGGER IF EXISTS audit_meeting_update ON DPMM_MESYUARAT;
DROP TRIGGER IF EXISTS audit_meeting_delete ON DPMM_MESYUARAT;

CREATE TRIGGER audit_meeting_insert
AFTER INSERT ON DPMM_MESYUARAT
FOR EACH ROW EXECUTE FUNCTION audit_insert();

CREATE TRIGGER audit_meeting_update
AFTER UPDATE ON DPMM_MESYUARAT
FOR EACH ROW EXECUTE FUNCTION audit_update();

CREATE TRIGGER audit_meeting_delete
AFTER DELETE ON DPMM_MESYUARAT
FOR EACH ROW EXECUTE FUNCTION audit_delete();

-- Attendance Table
DROP TRIGGER IF EXISTS audit_attendance_insert ON DPMM_KEHADIRAN;
DROP TRIGGER IF EXISTS audit_attendance_update ON DPMM_KEHADIRAN;
DROP TRIGGER IF EXISTS audit_attendance_delete ON DPMM_KEHADIRAN;

CREATE TRIGGER audit_attendance_insert
AFTER INSERT ON DPMM_KEHADIRAN
FOR EACH ROW EXECUTE FUNCTION audit_insert();

CREATE TRIGGER audit_attendance_update
AFTER UPDATE ON DPMM_KEHADIRAN
FOR EACH ROW EXECUTE FUNCTION audit_update();

CREATE TRIGGER audit_attendance_delete
AFTER DELETE ON DPMM_KEHADIRAN
FOR EACH ROW EXECUTE FUNCTION audit_delete();

-- Member System Tables
DROP TRIGGER IF EXISTS audit_member_insert ON "AHLI DPMM JOHOR";
DROP TRIGGER IF EXISTS audit_member_update ON "AHLI DPMM JOHOR";
DROP TRIGGER IF EXISTS audit_member_delete ON "AHLI DPMM JOHOR";

CREATE TRIGGER audit_member_insert
AFTER INSERT ON "AHLI DPMM JOHOR"
FOR EACH ROW EXECUTE FUNCTION audit_insert();

CREATE TRIGGER audit_member_update
AFTER UPDATE ON "AHLI DPMM JOHOR"
FOR EACH ROW EXECUTE FUNCTION audit_update();

CREATE TRIGGER audit_member_delete
AFTER DELETE ON "AHLI DPMM JOHOR"
FOR EACH ROW EXECUTE FUNCTION audit_delete();

-- ============================================================
-- RLS POLICIES FOR AUDIT LOGS
-- ============================================================

-- Enable RLS on audit log table
ALTER TABLE DPMM_AUDIT_LOG_ENHANCED ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "Admins view all audit logs"
ON DPMM_AUDIT_LOG_ENHANCED
FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- Users can view their own audit logs
CREATE POLICY "Users view own audit logs"
ON DPMM_AUDIT_LOG_ENHANCED
FOR SELECT
USING (auth.uid() = user_id);

-- Only system can insert audit logs
CREATE POLICY "System can insert audit logs"
ON DPMM_AUDIT_LOG_ENHANCED
FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- AUDIT LOG RETENTION POLICY
-- ============================================================

-- Function to clean up old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(p_retention_days INT DEFAULT 365)
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM DPMM_AUDIT_LOG_ENHANCED
  WHERE created_at < NOW() - INTERVAL '1 day' * p_retention_days;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
