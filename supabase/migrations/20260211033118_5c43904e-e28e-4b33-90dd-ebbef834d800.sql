
-- Tighten the insert policy: only allow inserts from authenticated users or service role
DROP POLICY "Service insert email logs" ON public.email_logs;
CREATE POLICY "Authenticated insert email logs"
ON public.email_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
