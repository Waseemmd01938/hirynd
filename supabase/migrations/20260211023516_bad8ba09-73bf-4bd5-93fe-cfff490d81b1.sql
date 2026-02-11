
-- 1) RPC: Admin close case / create placement
CREATE OR REPLACE FUNCTION public.admin_close_placement(
  _candidate_id uuid,
  _company_name text,
  _role_title text,
  _start_date date,
  _salary text,
  _hr_email text,
  _offer_letter_url text DEFAULT '',
  _interviewer_email text DEFAULT '',
  _bgv_company_name text DEFAULT '',
  _notes text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _caller_id uuid := auth.uid();
  _new_id uuid;
  _candidate_user_id uuid;
  _candidate_status text;
BEGIN
  IF NOT has_role(_caller_id, 'admin') THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  -- Validate required fields
  IF _company_name IS NULL OR length(trim(_company_name)) = 0 THEN RAISE EXCEPTION 'Company name is required'; END IF;
  IF _role_title IS NULL OR length(trim(_role_title)) = 0 THEN RAISE EXCEPTION 'Role title is required'; END IF;
  IF _salary IS NULL OR length(trim(_salary)) = 0 THEN RAISE EXCEPTION 'Salary is required'; END IF;
  IF _hr_email IS NULL OR length(trim(_hr_email)) = 0 THEN RAISE EXCEPTION 'HR email is required'; END IF;
  IF length(_company_name) > 255 THEN RAISE EXCEPTION 'Company name too long'; END IF;
  IF length(_role_title) > 255 THEN RAISE EXCEPTION 'Role title too long'; END IF;
  IF length(_salary) > 100 THEN RAISE EXCEPTION 'Salary too long'; END IF;
  IF length(_hr_email) > 255 THEN RAISE EXCEPTION 'HR email too long'; END IF;
  IF length(_notes) > 2000 THEN RAISE EXCEPTION 'Notes too long'; END IF;

  SELECT status, user_id INTO _candidate_status, _candidate_user_id
  FROM candidates WHERE id = _candidate_id;

  IF _candidate_status IS NULL THEN RAISE EXCEPTION 'Candidate not found'; END IF;

  -- Check if already placed
  IF EXISTS (SELECT 1 FROM placement_closures WHERE candidate_id = _candidate_id) THEN
    RAISE EXCEPTION 'Placement already closed for this candidate';
  END IF;

  -- Insert placement closure
  INSERT INTO placement_closures (
    candidate_id, company_name, role_title, start_date, salary,
    hr_email, offer_letter_url, interviewer_email, bgv_company_name,
    notes, closed_by
  ) VALUES (
    _candidate_id, trim(_company_name), trim(_role_title), _start_date, trim(_salary),
    trim(_hr_email), _offer_letter_url, _interviewer_email, _bgv_company_name,
    _notes, _caller_id
  ) RETURNING id INTO _new_id;

  -- Update candidate status to placed
  UPDATE candidates SET status = 'placed' WHERE id = _candidate_id;

  -- Audit log
  INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, new_value)
  VALUES (_caller_id, 'placement_closed', 'placement_closure', _candidate_id,
    jsonb_build_object('company', _company_name, 'role', _role_title, 'salary', _salary, 'start_date', _start_date));

  -- Notify candidate
  PERFORM create_system_notification(
    _candidate_user_id,
    'Congratulations! You''ve Been Placed',
    'Your case has been closed. You''ve been placed at ' || _company_name || ' as ' || _role_title || '.',
    '/candidate-dashboard'
  );

  -- Notify assigned recruiters
  PERFORM create_system_notification(
    ca.recruiter_id,
    'Candidate Placed',
    'A candidate you were assigned to has been placed at ' || _company_name || '.',
    '/recruiter-dashboard'
  ) FROM candidate_assignments ca WHERE ca.candidate_id = _candidate_id AND ca.is_active = true;

  RETURN _new_id;
END;
$$;

-- 2) Allow candidates and assigned recruiters to view placement closures
DROP POLICY IF EXISTS "View closures" ON placement_closures;
CREATE POLICY "View closures"
ON placement_closures
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (SELECT 1 FROM candidates c WHERE c.id = placement_closures.candidate_id AND c.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM candidate_assignments ca WHERE ca.candidate_id = placement_closures.candidate_id AND ca.recruiter_id = auth.uid() AND ca.is_active = true)
);

-- 3) Allow recruiters to view audit logs for their assigned candidates
DROP POLICY IF EXISTS "Admins view audit logs" ON audit_logs;
CREATE POLICY "View audit logs"
ON audit_logs
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR actor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM candidate_assignments ca
    WHERE ca.candidate_id = audit_logs.entity_id AND ca.recruiter_id = auth.uid() AND ca.is_active = true
  )
);
