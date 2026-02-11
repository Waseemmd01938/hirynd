
-- 1. Role enum
CREATE TYPE public.app_role AS ENUM ('candidate', 'recruiter', 'admin');

-- 2. Candidate status enum
CREATE TYPE public.candidate_status AS ENUM (
  'lead',
  'approved',
  'intake_submitted',
  'roles_suggested',
  'roles_confirmed',
  'paid',
  'credential_completed',
  'active_marketing',
  'paused',
  'cancelled',
  'placed'
);

-- 3. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Candidates table (pipeline)
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status candidate_status NOT NULL DEFAULT 'lead',
  university TEXT DEFAULT '',
  major TEXT DEFAULT '',
  degree TEXT DEFAULT '',
  graduation_year TEXT DEFAULT '',
  visa_status TEXT DEFAULT '',
  referral_source TEXT DEFAULT '',
  referral_friend_name TEXT DEFAULT '',
  resume_url TEXT DEFAULT '',
  drive_folder_url TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- 7. Recruiter profiles
CREATE TABLE public.recruiter_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  location TEXT DEFAULT '',
  bank_name TEXT DEFAULT '',
  bank_account_number TEXT DEFAULT '',
  bank_routing_number TEXT DEFAULT '',
  documents_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;

-- 8. Candidate-recruiter assignments
CREATE TABLE public.candidate_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  recruiter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_type TEXT NOT NULL CHECK (role_type IN ('primary', 'secondary', 'team_lead')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unassigned_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (candidate_id, recruiter_id, is_active)
);
ALTER TABLE public.candidate_assignments ENABLE ROW LEVEL SECURITY;

-- 9. Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 10. Client intake sheets (locked after submit)
CREATE TABLE public.client_intake_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL UNIQUE,
  data JSONB NOT NULL DEFAULT '{}',
  is_locked BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.client_intake_sheets ENABLE ROW LEVEL SECURITY;

-- 11. Role suggestions
CREATE TABLE public.role_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  role_title TEXT NOT NULL,
  description TEXT DEFAULT '',
  candidate_confirmed BOOLEAN,
  confirmed_at TIMESTAMPTZ,
  suggested_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.role_suggestions ENABLE ROW LEVEL SECURITY;

-- 12. Credential intake sheets (versioned)
CREATE TABLE public.credential_intake_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  version INT NOT NULL DEFAULT 1,
  data JSONB NOT NULL DEFAULT '{}',
  edited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.credential_intake_sheets ENABLE ROW LEVEL SECURITY;

-- 13. Daily submission logs
CREATE TABLE public.daily_submission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  recruiter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  applications_count INT NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.daily_submission_logs ENABLE ROW LEVEL SECURITY;

-- 14. Job postings (from recruiter logs)
CREATE TABLE public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_log_id UUID REFERENCES public.daily_submission_logs(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL DEFAULT '',
  role_title TEXT NOT NULL DEFAULT '',
  job_url TEXT NOT NULL DEFAULT '',
  resume_used TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'screening', 'interview', 'offer', 'rejected')),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- 15. Interview/screening logs
CREATE TABLE public.interview_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  submitted_by UUID REFERENCES auth.users(id) NOT NULL,
  log_type TEXT NOT NULL CHECK (log_type IN ('screening', 'interview')),
  company_name TEXT DEFAULT '',
  role_title TEXT DEFAULT '',
  interview_date DATE,
  notes TEXT DEFAULT '',
  outcome TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.interview_logs ENABLE ROW LEVEL SECURITY;

-- 16. Referrals
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  friend_name TEXT NOT NULL,
  friend_email TEXT NOT NULL,
  friend_phone TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'onboarded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 17. Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_type TEXT NOT NULL DEFAULT 'initial',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_date TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 18. Placement success form (case closure)
CREATE TABLE public.placement_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  start_date DATE NOT NULL,
  salary TEXT NOT NULL,
  offer_letter_url TEXT DEFAULT '',
  hr_email TEXT NOT NULL,
  interviewer_email TEXT DEFAULT '',
  bgv_company_name TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  closed_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.placement_closures ENABLE ROW LEVEL SECURITY;

-- 19. Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ===== RLS POLICIES =====

-- User roles: users see own, admins see all
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Profiles: own profile + admins
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Candidates: own + assigned recruiters + admins
CREATE POLICY "Candidates view own record" ON public.candidates
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.candidate_assignments ca
      WHERE ca.candidate_id = id AND ca.recruiter_id = auth.uid() AND ca.is_active = true
    )
  );

CREATE POLICY "Candidates insert own" ON public.candidates
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage candidates" ON public.candidates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Candidates update own" ON public.candidates
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Recruiter profiles
CREATE POLICY "Recruiters view own profile" ON public.recruiter_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Recruiters manage own profile" ON public.recruiter_profiles
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage recruiter profiles" ON public.recruiter_profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Assignments: involved parties + admins
CREATE POLICY "View assignments" ON public.candidate_assignments
  FOR SELECT TO authenticated
  USING (
    recruiter_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.candidates c WHERE c.id = candidate_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage assignments" ON public.candidate_assignments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Audit logs: admin only
CREATE POLICY "Admins view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System inserts audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Client intake: candidate + assigned recruiters (read) + admin
CREATE POLICY "Intake sheet access" ON public.client_intake_sheets
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = candidate_id AND c.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.candidate_assignments ca WHERE ca.candidate_id = candidate_id AND ca.recruiter_id = auth.uid() AND ca.is_active = true)
  );

CREATE POLICY "Candidate manages intake" ON public.client_intake_sheets
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = candidate_id AND c.user_id = auth.uid()));

CREATE POLICY "Candidate updates intake" ON public.client_intake_sheets
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = candidate_id AND c.user_id = auth.uid()) AND is_locked = false);

CREATE POLICY "Admin manages intake" ON public.client_intake_sheets
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Role suggestions
CREATE POLICY "View role suggestions" ON public.role_suggestions
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = candidate_id AND c.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.candidate_assignments ca WHERE ca.candidate_id = candidate_id AND ca.recruiter_id = auth.uid() AND ca.is_active = true)
  );

CREATE POLICY "Admins manage role suggestions" ON public.role_suggestions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Candidates confirm roles" ON public.role_suggestions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = candidate_id AND c.user_id = auth.uid()));

-- Credential intake
CREATE POLICY "View credentials" ON public.credential_intake_sheets
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = candidate_id AND c.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.candidate_assignments ca WHERE ca.candidate_id = candidate_id AND ca.recruiter_id = auth.uid() AND ca.is_active = true)
  );

CREATE POLICY "Insert credentials" ON public.credential_intake_sheets
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = candidate_id AND c.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.candidate_assignments ca WHERE ca.candidate_id = candidate_id AND ca.recruiter_id = auth.uid() AND ca.is_active = true)
  );

-- Daily submission logs
CREATE POLICY "View submission logs" ON public.daily_submission_logs
  FOR SELECT TO authenticated
  USING (
    recruiter_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = candidate_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Recruiters manage own logs" ON public.daily_submission_logs
  FOR ALL TO authenticated
  USING (recruiter_id = auth.uid());

CREATE POLICY "Admins manage submission logs" ON public.daily_submission_logs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Job postings
CREATE POLICY "View job postings" ON public.job_postings
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = candidate_id AND c.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.daily_submission_logs dsl WHERE dsl.id = submission_log_id AND dsl.recruiter_id = auth.uid())
  );

CREATE POLICY "Recruiters manage job postings" ON public.job_postings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.daily_submission_logs dsl WHERE dsl.id = submission_log_id AND dsl.recruiter_id = auth.uid()));

CREATE POLICY "Admins manage job postings" ON public.job_postings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Interview logs
CREATE POLICY "View interview logs" ON public.interview_logs
  FOR SELECT TO authenticated
  USING (
    submitted_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = candidate_id AND c.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.candidate_assignments ca WHERE ca.candidate_id = candidate_id AND ca.recruiter_id = auth.uid() AND ca.is_active = true)
  );

CREATE POLICY "Users insert interview logs" ON public.interview_logs
  FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Admins manage interview logs" ON public.interview_logs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Referrals
CREATE POLICY "View referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = referrer_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Candidates create referrals" ON public.referrals
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = referrer_id AND c.user_id = auth.uid()));

CREATE POLICY "Admins manage referrals" ON public.referrals
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Payments
CREATE POLICY "View payments" ON public.payments
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = candidate_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Admins manage payments" ON public.payments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Placement closures
CREATE POLICY "View closures" ON public.placement_closures
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = candidate_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Admins manage closures" ON public.placement_closures
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Notifications
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System inserts notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ===== TRIGGERS =====

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recruiter_profiles_updated_at BEFORE UPDATE ON public.recruiter_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_intake_updated_at BEFORE UPDATE ON public.client_intake_sheets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_submission_logs_updated_at BEFORE UPDATE ON public.daily_submission_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON public.job_postings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
