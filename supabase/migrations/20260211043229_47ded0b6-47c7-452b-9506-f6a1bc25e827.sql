
-- Add approval_status to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending_approval';

-- Set existing profiles to approved so they aren't locked out
UPDATE public.profiles SET approval_status = 'approved' WHERE approval_status = 'pending_approval';

-- Create an RPC for admin to approve/reject users
CREATE OR REPLACE FUNCTION public.admin_approve_user(_user_id uuid, _action text, _reason text DEFAULT '')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller_id uuid := auth.uid();
  _profile_name text;
  _profile_email text;
BEGIN
  IF NOT has_role(_caller_id, 'admin') THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  IF _action NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid action. Must be approved or rejected';
  END IF;

  -- Get profile info
  SELECT full_name, email INTO _profile_name, _profile_email
  FROM profiles WHERE user_id = _user_id;

  IF _profile_name IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Update approval status
  UPDATE profiles SET approval_status = _action WHERE user_id = _user_id;

  -- Audit log
  INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, new_value)
  VALUES (_caller_id, 'user_' || _action, 'profile', _user_id,
    jsonb_build_object('approval_status', _action, 'reason', _reason));

  -- Notify the user
  PERFORM create_system_notification(
    _user_id,
    CASE WHEN _action = 'approved' THEN 'Account Approved' ELSE 'Account Not Approved' END,
    CASE WHEN _action = 'approved' THEN 'Your HYRIND account has been approved. You can now log in.'
    ELSE 'Your HYRIND account application was not approved at this time.' END,
    CASE WHEN _action = 'approved' THEN '/candidate-dashboard' ELSE NULL END
  );
END;
$$;

-- Create RPC to get pending approvals for admin
CREATE OR REPLACE FUNCTION public.admin_get_pending_approvals()
RETURNS TABLE(user_id uuid, full_name text, email text, phone text, created_at timestamptz, roles app_role[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  RETURN QUERY
  SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.phone,
    p.created_at,
    ARRAY(SELECT ur.role FROM user_roles ur WHERE ur.user_id = p.user_id) as roles
  FROM profiles p
  WHERE p.approval_status = 'pending_approval'
  ORDER BY p.created_at DESC;
END;
$$;
