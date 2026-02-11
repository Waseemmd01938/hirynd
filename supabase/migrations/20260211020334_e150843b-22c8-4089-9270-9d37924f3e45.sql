
-- Fix: HR/Interviewer emails exposed to candidates in placement_closures
-- Restrict SELECT to admin-only (candidates should not see HR contact info)
DROP POLICY IF EXISTS "View closures" ON public.placement_closures;
CREATE POLICY "View closures" ON public.placement_closures
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
