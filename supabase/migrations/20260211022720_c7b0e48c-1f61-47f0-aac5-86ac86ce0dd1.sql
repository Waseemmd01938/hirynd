
-- Add missing columns to interview_logs
ALTER TABLE public.interview_logs ADD COLUMN IF NOT EXISTS round text DEFAULT '';
ALTER TABLE public.interview_logs ADD COLUMN IF NOT EXISTS difficult_questions text DEFAULT '';
ALTER TABLE public.interview_logs ADD COLUMN IF NOT EXISTS support_needed boolean DEFAULT false;
ALTER TABLE public.interview_logs ADD COLUMN IF NOT EXISTS support_notes text DEFAULT '';

-- Add admin notes column to referrals
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS notes text DEFAULT '';
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS referral_note text DEFAULT '';

-- Create admin config table
CREATE TABLE IF NOT EXISTS public.admin_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text NOT NULL UNIQUE,
  config_value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read config" ON public.admin_config
  FOR SELECT USING (true);

CREATE POLICY "Admins manage config" ON public.admin_config
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed default Cal.com URLs
INSERT INTO public.admin_config (config_key, config_value) VALUES
  ('cal_screening_practice', 'https://cal.com/hyrind/screening'),
  ('cal_interview_training', 'https://cal.com/hyrind/interview'),
  ('cal_operations_call', 'https://cal.com/hyrind/operations')
ON CONFLICT (config_key) DO NOTHING;

-- Create training click tracking table
CREATE TABLE IF NOT EXISTS public.training_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id),
  training_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.training_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates insert own clicks" ON public.training_clicks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM candidates c WHERE c.id = training_clicks.candidate_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Admins view all clicks" ON public.training_clicks
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Candidates view own clicks" ON public.training_clicks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM candidates c WHERE c.id = training_clicks.candidate_id AND c.user_id = auth.uid())
  );

-- Update interview_logs: allow recruiters to insert for assigned candidates
DROP POLICY IF EXISTS "Users insert interview logs" ON public.interview_logs;
CREATE POLICY "Users insert interview logs" ON public.interview_logs
  FOR INSERT WITH CHECK (
    submitted_by = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Allow update on interview_logs for submitter, assigned recruiter, admin
CREATE POLICY "Users update interview logs" ON public.interview_logs
  FOR UPDATE USING (
    submitted_by = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM candidate_assignments ca
      WHERE ca.candidate_id = interview_logs.candidate_id
        AND ca.recruiter_id = auth.uid()
        AND ca.is_active = true
    )
  );

-- Allow authenticated users to insert notifications (for cross-role alerts)
DROP POLICY IF EXISTS "Admins insert notifications" ON public.notifications;
CREATE POLICY "Authenticated insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admin update referral status
CREATE POLICY "Admins update referrals" ON public.referrals
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
