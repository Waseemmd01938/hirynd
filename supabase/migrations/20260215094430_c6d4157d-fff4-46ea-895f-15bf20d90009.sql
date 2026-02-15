
-- ============================================================
-- PHASE 1.6: Subscription & Billing System
-- ============================================================

-- 1. Subscription status enum
CREATE TYPE public.subscription_status AS ENUM (
  'trialing', 'active', 'past_due', 'canceled', 'unpaid'
);

-- 2. Payment provider enum
CREATE TYPE public.payment_provider AS ENUM (
  'manual', 'razorpay', 'stripe'
);

-- 3. candidate_subscriptions table
CREATE TABLE public.candidate_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id),
  provider payment_provider NOT NULL DEFAULT 'manual',
  provider_subscription_id text,
  provider_customer_id text,
  status subscription_status NOT NULL DEFAULT 'active',
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  billing_cycle text NOT NULL DEFAULT 'monthly',
  next_billing_at timestamptz,
  last_payment_at timestamptz,
  grace_period_ends_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT one_active_sub_per_candidate UNIQUE (candidate_id)
);

CREATE INDEX idx_candidate_subscriptions_candidate ON public.candidate_subscriptions(candidate_id);
CREATE INDEX idx_candidate_subscriptions_status ON public.candidate_subscriptions(status);
CREATE INDEX idx_candidate_subscriptions_next_billing ON public.candidate_subscriptions(next_billing_at);

ALTER TABLE public.candidate_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS: Admin full access
CREATE POLICY "Admins manage subscriptions"
  ON public.candidate_subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS: Candidate views own
CREATE POLICY "Candidates view own subscription"
  ON public.candidate_subscriptions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM candidates c WHERE c.id = candidate_subscriptions.candidate_id AND c.user_id = auth.uid()
  ));

-- RLS: Recruiters view assigned
CREATE POLICY "Recruiters view assigned subscription"
  ON public.candidate_subscriptions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM candidate_assignments ca
    WHERE ca.candidate_id = candidate_subscriptions.candidate_id
      AND ca.recruiter_id = auth.uid() AND ca.is_active = true
  ));

-- 4. subscription_payments table
CREATE TABLE public.subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.candidate_subscriptions(id),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id),
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  payment_status text NOT NULL DEFAULT 'success',
  payment_method text DEFAULT 'manual',
  provider_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscription_payments_sub ON public.subscription_payments(subscription_id);
CREATE INDEX idx_subscription_payments_candidate ON public.subscription_payments(candidate_id);

ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage subscription payments"
  ON public.subscription_payments FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Candidates view own subscription payments"
  ON public.subscription_payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM candidates c WHERE c.id = subscription_payments.candidate_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Recruiters view assigned subscription payments"
  ON public.subscription_payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM candidate_assignments ca
    WHERE ca.candidate_id = subscription_payments.candidate_id
      AND ca.recruiter_id = auth.uid() AND ca.is_active = true
  ));

-- 5. Updated_at trigger for subscriptions
CREATE TRIGGER update_candidate_subscriptions_updated_at
  BEFORE UPDATE ON public.candidate_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- RPC FUNCTIONS
-- ============================================================

-- 6. Create manual subscription
CREATE OR REPLACE FUNCTION public.admin_create_subscription(
  _candidate_id uuid,
  _amount numeric,
  _status text DEFAULT 'active',
  _provider text DEFAULT 'manual',
  _next_billing_at timestamptz DEFAULT (now() + interval '30 days'),
  _notes text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  _caller_id uuid := auth.uid();
  _new_id uuid;
  _candidate_status text;
  _candidate_user_id uuid;
BEGIN
  IF NOT has_role(_caller_id, 'admin') THEN RAISE EXCEPTION 'Admin only'; END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  IF _status NOT IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid') THEN
    RAISE EXCEPTION 'Invalid subscription status';
  END IF;
  IF _provider NOT IN ('manual', 'razorpay', 'stripe') THEN
    RAISE EXCEPTION 'Invalid provider';
  END IF;

  SELECT status, user_id INTO _candidate_status, _candidate_user_id
  FROM candidates WHERE id = _candidate_id;
  IF _candidate_status IS NULL THEN RAISE EXCEPTION 'Candidate not found'; END IF;

  -- Delete existing subscription if any
  DELETE FROM candidate_subscriptions WHERE candidate_id = _candidate_id;

  INSERT INTO candidate_subscriptions (
    candidate_id, provider, status, amount, currency, billing_cycle,
    next_billing_at, last_payment_at
  ) VALUES (
    _candidate_id, _provider::payment_provider, _status::subscription_status, _amount, 'USD', 'monthly',
    _next_billing_at, CASE WHEN _status = 'active' THEN now() ELSE NULL END
  ) RETURNING id INTO _new_id;

  INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, new_value)
  VALUES (_caller_id, 'subscription_created', 'candidate_subscription', _candidate_id,
    jsonb_build_object('amount', _amount, 'status', _status, 'provider', _provider, 'notes', _notes));

  PERFORM create_system_notification(
    _candidate_user_id, 'Subscription Created',
    'A monthly subscription has been set up for your account.',
    '/candidate-dashboard/billing'
  );

  RETURN _new_id;
END;
$$;

-- 7. Update subscription status
CREATE OR REPLACE FUNCTION public.admin_update_subscription_status(
  _candidate_id uuid,
  _new_status text,
  _reason text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  _caller_id uuid := auth.uid();
  _old_status text;
  _sub_id uuid;
  _candidate_user_id uuid;
  _grace_days int;
BEGIN
  IF NOT has_role(_caller_id, 'admin') THEN RAISE EXCEPTION 'Admin only'; END IF;
  IF _new_status NOT IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid') THEN
    RAISE EXCEPTION 'Invalid subscription status';
  END IF;

  SELECT cs.id, cs.status::text, c.user_id INTO _sub_id, _old_status, _candidate_user_id
  FROM candidate_subscriptions cs
  JOIN candidates c ON c.id = cs.candidate_id
  WHERE cs.candidate_id = _candidate_id;

  IF _sub_id IS NULL THEN RAISE EXCEPTION 'Subscription not found'; END IF;
  IF _old_status = _new_status THEN RETURN; END IF;

  -- Set grace period if transitioning to past_due
  IF _new_status = 'past_due' AND _old_status != 'past_due' THEN
    SELECT COALESCE(config_value::int, 5) INTO _grace_days
    FROM admin_config WHERE config_key = 'default_grace_period_days';
    IF _grace_days IS NULL THEN _grace_days := 5; END IF;

    UPDATE candidate_subscriptions
    SET status = 'past_due'::subscription_status,
        grace_period_ends_at = now() + (_grace_days || ' days')::interval,
        updated_at = now()
    WHERE id = _sub_id;
  ELSIF _new_status = 'canceled' THEN
    UPDATE candidate_subscriptions
    SET status = 'canceled'::subscription_status, canceled_at = now(), updated_at = now()
    WHERE id = _sub_id;
    -- Auto-pause candidate
    UPDATE candidates SET status = 'paused' WHERE id = _candidate_id AND status = 'active_marketing';
  ELSIF _new_status = 'active' THEN
    UPDATE candidate_subscriptions
    SET status = 'active'::subscription_status,
        grace_period_ends_at = NULL, canceled_at = NULL,
        last_payment_at = now(), updated_at = now()
    WHERE id = _sub_id;
  ELSE
    UPDATE candidate_subscriptions
    SET status = _new_status::subscription_status, updated_at = now()
    WHERE id = _sub_id;
  END IF;

  INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, old_value, new_value)
  VALUES (_caller_id, 'subscription_status_changed', 'candidate_subscription', _candidate_id,
    jsonb_build_object('status', _old_status),
    jsonb_build_object('status', _new_status, 'reason', _reason));

  PERFORM create_system_notification(
    _candidate_user_id, 'Subscription Updated',
    'Your subscription status has been updated to: ' || replace(_new_status, '_', ' '),
    '/candidate-dashboard/billing'
  );
END;
$$;

-- 8. Record subscription payment
CREATE OR REPLACE FUNCTION public.admin_record_subscription_payment(
  _candidate_id uuid,
  _amount numeric,
  _payment_status text DEFAULT 'success',
  _payment_method text DEFAULT 'manual',
  _advance_billing boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  _caller_id uuid := auth.uid();
  _sub_id uuid;
  _sub_status text;
  _new_payment_id uuid;
  _candidate_user_id uuid;
BEGIN
  IF NOT has_role(_caller_id, 'admin') THEN RAISE EXCEPTION 'Admin only'; END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  IF _payment_status NOT IN ('success', 'failed', 'refunded') THEN
    RAISE EXCEPTION 'Invalid payment status';
  END IF;

  SELECT cs.id, cs.status::text, c.user_id INTO _sub_id, _sub_status, _candidate_user_id
  FROM candidate_subscriptions cs
  JOIN candidates c ON c.id = cs.candidate_id
  WHERE cs.candidate_id = _candidate_id;

  IF _sub_id IS NULL THEN RAISE EXCEPTION 'Subscription not found'; END IF;

  INSERT INTO subscription_payments (subscription_id, candidate_id, amount, currency, payment_status, payment_method)
  VALUES (_sub_id, _candidate_id, _amount, 'USD', _payment_status, _payment_method)
  RETURNING id INTO _new_payment_id;

  IF _payment_status = 'success' THEN
    UPDATE candidate_subscriptions
    SET last_payment_at = now(),
        next_billing_at = CASE WHEN _advance_billing THEN now() + interval '30 days' ELSE next_billing_at END,
        status = 'active'::subscription_status,
        grace_period_ends_at = NULL,
        updated_at = now()
    WHERE id = _sub_id;

    -- If was past_due, log recovery
    IF _sub_status IN ('past_due', 'unpaid') THEN
      INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, new_value)
      VALUES (_caller_id, 'marketing_resumed_after_payment', 'candidate_subscription', _candidate_id,
        jsonb_build_object('amount', _amount));
    END IF;
  END IF;

  INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, new_value)
  VALUES (_caller_id, 'subscription_payment_recorded', 'subscription_payment', _candidate_id,
    jsonb_build_object('amount', _amount, 'status', _payment_status, 'method', _payment_method));

  PERFORM create_system_notification(
    _candidate_user_id,
    CASE WHEN _payment_status = 'success' THEN 'Payment Received' ELSE 'Payment Issue' END,
    CASE WHEN _payment_status = 'success' THEN 'Your subscription payment of $' || _amount || ' has been recorded.'
    ELSE 'There was an issue with your subscription payment.' END,
    '/candidate-dashboard/billing'
  );

  RETURN _new_payment_id;
END;
$$;

-- 9. Extend grace period
CREATE OR REPLACE FUNCTION public.admin_extend_grace_period(
  _candidate_id uuid,
  _days int DEFAULT 5
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  _caller_id uuid := auth.uid();
  _sub_id uuid;
BEGIN
  IF NOT has_role(_caller_id, 'admin') THEN RAISE EXCEPTION 'Admin only'; END IF;
  IF _days <= 0 OR _days > 30 THEN RAISE EXCEPTION 'Days must be between 1 and 30'; END IF;

  SELECT id INTO _sub_id FROM candidate_subscriptions
  WHERE candidate_id = _candidate_id AND status = 'past_due';

  IF _sub_id IS NULL THEN RAISE EXCEPTION 'No past_due subscription found'; END IF;

  UPDATE candidate_subscriptions
  SET grace_period_ends_at = now() + (_days || ' days')::interval, updated_at = now()
  WHERE id = _sub_id;

  INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, new_value)
  VALUES (_caller_id, 'grace_period_extended', 'candidate_subscription', _candidate_id,
    jsonb_build_object('days', _days));
END;
$$;

-- 10. Billing check function (called manually by admin or cron)
CREATE OR REPLACE FUNCTION public.run_billing_checks()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  _result jsonb := '{"expired_grace":0,"newly_past_due":0}'::jsonb;
  _rec record;
  _count_expired int := 0;
  _count_past_due int := 0;
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Admin only'; END IF;

  -- 1. Check expired grace periods → pause marketing
  FOR _rec IN
    SELECT cs.candidate_id, c.user_id, c.status as cand_status
    FROM candidate_subscriptions cs
    JOIN candidates c ON c.id = cs.candidate_id
    WHERE cs.status = 'past_due'
      AND cs.grace_period_ends_at IS NOT NULL
      AND cs.grace_period_ends_at < now()
      AND c.status = 'active_marketing'
  LOOP
    UPDATE candidates SET status = 'paused' WHERE id = _rec.candidate_id;

    INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, new_value)
    VALUES (auth.uid(), 'marketing_paused_due_to_billing', 'candidate', _rec.candidate_id,
      jsonb_build_object('reason', 'grace_period_expired'));

    PERFORM create_system_notification(
      _rec.user_id, 'Marketing Paused',
      'Your marketing has been paused due to an outstanding billing issue. Please update your payment method.',
      '/candidate-dashboard/billing'
    );

    _count_expired := _count_expired + 1;
  END LOOP;

  _result := jsonb_build_object('expired_grace', _count_expired);
  RETURN _result;
END;
$$;

-- 11. Add default billing config values
INSERT INTO admin_config (config_key, config_value) VALUES
  ('default_grace_period_days', '5'),
  ('subscription_amount_default', '499'),
  ('allow_auto_resume_after_payment', 'false')
ON CONFLICT (config_key) DO NOTHING;
