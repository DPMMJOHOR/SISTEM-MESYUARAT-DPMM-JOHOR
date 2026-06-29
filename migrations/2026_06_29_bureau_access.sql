-- Add bureau column to DPMM_USERS table
ALTER TABLE DPMM_USERS
ADD COLUMN IF NOT EXISTS bureau TEXT,
ADD CONSTRAINT IF NOT EXISTS check_bureau_value 
  CHECK (bureau IN ('Biro Professional', 'Biro Kontraktor', 'Biro International Trade', NULL));

-- Add index for bureau queries
CREATE INDEX IF NOT EXISTS idx_dpmm_users_bureau 
ON DPMM_USERS(bureau);

-- Update RLS policies for DPMM_EVENTS to enforce bureau access
DROP POLICY IF EXISTS events_select_policy ON DPMM_EVENTS;
CREATE POLICY events_select_policy ON DPMM_EVENTS
  FOR SELECT
  USING (
    -- Super admin can see all events
    EXISTS (
      SELECT 1 FROM DPMM_USERS 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
    OR
    -- Bureau admin can only see events for their bureau
    (
      EXISTS (
        SELECT 1 FROM DPMM_USERS 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'staff')
        AND bureau = DPMM_EVENTS.bureau
      )
      OR DPMM_EVENTS.bureau IS NULL
    )
  );

DROP POLICY IF EXISTS events_insert_policy ON DPMM_EVENTS;
CREATE POLICY events_insert_policy ON DPMM_EVENTS
  FOR INSERT
  WITH CHECK (
    -- Super admin can create events for any bureau
    EXISTS (
      SELECT 1 FROM DPMM_USERS 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
    OR
    -- Bureau admin can only create events for their bureau
    (
      EXISTS (
        SELECT 1 FROM DPMM_USERS 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'staff')
        AND bureau = DPMM_EVENTS.bureau
      )
      OR DPMM_EVENTS.bureau IS NULL
    )
  );

DROP POLICY IF EXISTS events_update_policy ON DPMM_EVENTS;
CREATE POLICY events_update_policy ON DPMM_EVENTS
  FOR UPDATE
  USING (
    -- Super admin can update all events
    EXISTS (
      SELECT 1 FROM DPMM_USERS 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
    OR
    -- Bureau admin can only update events for their bureau
    (
      EXISTS (
        SELECT 1 FROM DPMM_USERS 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'staff')
        AND bureau = DPMM_EVENTS.bureau
      )
      OR DPMM_EVENTS.bureau IS NULL
    )
  );

DROP POLICY IF EXISTS events_delete_policy ON DPMM_EVENTS;
CREATE POLICY events_delete_policy ON DPMM_EVENTS
  FOR DELETE
  USING (
    -- Super admin can delete all events
    EXISTS (
      SELECT 1 FROM DPMM_USERS 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
    OR
    -- Bureau admin can only delete events for their bureau
    (
      EXISTS (
        SELECT 1 FROM DPMM_USERS 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'staff')
        AND bureau = DPMM_EVENTS.bureau
      )
      OR DPMM_EVENTS.bureau IS NULL
    )
  );

-- Update RLS policies for DPMM_RSVP to enforce bureau access
DROP POLICY IF EXISTS rsvp_select_policy ON DPMM_RSVP;
CREATE POLICY rsvp_select_policy ON DPMM_RSVP
  FOR SELECT
  USING (
    -- Super admin can see all RSVPs
    EXISTS (
      SELECT 1 FROM DPMM_USERS 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
    OR
    -- Bureau admin can only see RSVPs for their bureau's events
    EXISTS (
      SELECT 1 FROM DPMM_EVENTS e
      WHERE e.event_id = DPMM_RSVP.event_id
      AND (
        EXISTS (
          SELECT 1 FROM DPMM_USERS 
          WHERE user_id = auth.uid() 
          AND role IN ('admin', 'staff')
          AND bureau = e.bureau
        )
        OR e.bureau IS NULL
      )
    )
  );

-- Update RLS policies for DPMM_NON_MEMBER_CONTACTS to enforce bureau access
DROP POLICY IF EXISTS non_member_contacts_select_policy ON DPMM_NON_MEMBER_CONTACTS;
CREATE POLICY non_member_contacts_select_policy ON DPMM_NON_MEMBER_CONTACTS
  FOR SELECT
  USING (
    -- Super admin can see all contacts
    EXISTS (
      SELECT 1 FROM DPMM_USERS 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
    OR
    -- Bureau admin can only see contacts for their bureau
    (
      EXISTS (
        SELECT 1 FROM DPMM_USERS 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'staff')
        AND bureau = DPMM_NON_MEMBER_CONTACTS.bureau
      )
      OR DPMM_NON_MEMBER_CONTACTS.bureau IS NULL
    )
  );

DROP POLICY IF EXISTS non_member_contacts_insert_policy ON DPMM_NON_MEMBER_CONTACTS;
CREATE POLICY non_member_contacts_insert_policy ON DPMM_NON_MEMBER_CONTACTS
  FOR INSERT
  WITH CHECK (
    -- Super admin can create contacts for any bureau
    EXISTS (
      SELECT 1 FROM DPMM_USERS 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
    OR
    -- Bureau admin can only create contacts for their bureau
    (
      EXISTS (
        SELECT 1 FROM DPMM_USERS 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'staff')
        AND bureau = DPMM_NON_MEMBER_CONTACTS.bureau
      )
      OR DPMM_NON_MEMBER_CONTACTS.bureau IS NULL
    )
  );

DROP POLICY IF EXISTS non_member_contacts_update_policy ON DPMM_NON_MEMBER_CONTACTS;
CREATE POLICY non_member_contacts_update_policy ON DPMM_NON_MEMBER_CONTACTS
  FOR UPDATE
  USING (
    -- Super admin can update all contacts
    EXISTS (
      SELECT 1 FROM DPMM_USERS 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
    OR
    -- Bureau admin can only update contacts for their bureau
    (
      EXISTS (
        SELECT 1 FROM DPMM_USERS 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'staff')
        AND bureau = DPMM_NON_MEMBER_CONTACTS.bureau
      )
      OR DPMM_NON_MEMBER_CONTACTS.bureau IS NULL
    )
  );

DROP POLICY IF EXISTS non_member_contacts_delete_policy ON DPMM_NON_MEMBER_CONTACTS;
CREATE POLICY non_member_contacts_delete_policy ON DPMM_NON_MEMBER_CONTACTS
  FOR DELETE
  USING (
    -- Super admin can delete all contacts
    EXISTS (
      SELECT 1 FROM DPMM_USERS 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
    OR
    -- Bureau admin can only delete contacts for their bureau
    (
      EXISTS (
        SELECT 1 FROM DPMM_USERS 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'staff')
        AND bureau = DPMM_NON_MEMBER_CONTACTS.bureau
      )
      OR DPMM_NON_MEMBER_CONTACTS.bureau IS NULL
    )
  );
