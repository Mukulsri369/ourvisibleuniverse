-- Owned OVU project only. No provider calls, customer grants or expiry extensions.
CREATE TABLE IF NOT EXISTS public.payment_orders (
 environment text NOT NULL CHECK(environment IN ('sandbox','live')),
 order_id text NOT NULL CHECK(order_id ~ '^order_[A-Za-z0-9]+$'),
 user_id uuid NOT NULL REFERENCES auth.users(id),
 plan_id text NOT NULL, access_days integer NOT NULL CHECK(access_days IN (30,180,365)),
 amount_minor bigint NOT NULL CHECK(amount_minor BETWEEN 1 AND 1000000000),
 currency text NOT NULL CHECK(currency IN ('INR','USD')),
 state text NOT NULL DEFAULT 'created' CHECK(state IN ('created','paid')),
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(environment,order_id)
);
CREATE TABLE IF NOT EXISTS public.payment_transactions (
 environment text NOT NULL, payment_id text NOT NULL CHECK(payment_id ~ '^pay_[A-Za-z0-9]+$'),
 order_id text NOT NULL, user_id uuid NOT NULL REFERENCES auth.users(id),
 amount_minor bigint NOT NULL CHECK(amount_minor BETWEEN 1 AND 1000000000),
 currency text NOT NULL CHECK(currency IN ('INR','USD')),
 state text NOT NULL CHECK(state IN ('captured','partially_refunded','refunded')),
 refunded_minor bigint NOT NULL DEFAULT 0 CHECK(refunded_minor BETWEEN 0 AND amount_minor),
 refund_unused_microseconds bigint, refund_rebased_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(environment,payment_id),
 UNIQUE(environment,order_id), FOREIGN KEY(environment,order_id) REFERENCES public.payment_orders(environment,order_id)
);
CREATE TABLE IF NOT EXISTS public.payment_events (
 environment text NOT NULL CHECK(environment IN ('sandbox','live')),
 event_id text NOT NULL CHECK(event_id ~ '^[A-Za-z0-9_-]{1,160}$'),
 event_type text NOT NULL CHECK(event_type ~ '^[A-Za-z0-9_.]{1,80}$'),
 body_sha256 text NOT NULL CHECK(body_sha256 ~ '^[a-f0-9]{64}$'),
 state text NOT NULL CHECK(state IN ('processed','ignored')),
 processed_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(environment,event_id)
);
ALTER TABLE public.access_passes ADD COLUMN IF NOT EXISTS allocated_starts_at timestamptz;
ALTER TABLE public.access_passes ADD COLUMN IF NOT EXISTS allocated_expires_at timestamptz;
ALTER TABLE public.access_passes ADD COLUMN IF NOT EXISTS original_expires_at timestamptz;
ALTER TABLE public.access_passes ADD COLUMN IF NOT EXISTS parent_pass_id uuid REFERENCES public.access_passes(id);
ALTER TABLE public.access_passes ADD COLUMN IF NOT EXISTS allocation_version integer NOT NULL DEFAULT 0;
ALTER TABLE public.access_passes ADD COLUMN IF NOT EXISTS expiry_is_fixed boolean NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS public.entitlement_refund_adjustments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), environment text NOT NULL,
 payment_id text NOT NULL, user_id uuid NOT NULL REFERENCES auth.users(id),
 pass_id uuid NOT NULL REFERENCES public.access_passes(id), previous_expiry timestamptz NOT NULL,
 updated_expiry timestamptz NOT NULL, removed_microseconds bigint NOT NULL CHECK(removed_microseconds>0),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(environment,payment_id,pass_id),
 FOREIGN KEY(environment,payment_id) REFERENCES public.payment_transactions(environment,payment_id)
);
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlement_refund_adjustments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.payment_orders,public.payment_transactions,public.payment_events,public.entitlement_refund_adjustments FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.payment_orders,public.payment_transactions,public.payment_events,public.entitlement_refund_adjustments TO service_role;
CREATE INDEX IF NOT EXISTS payment_orders_owner ON public.payment_orders(user_id,environment,created_at DESC);
CREATE INDEX IF NOT EXISTS access_passes_lineage ON public.access_passes(parent_pass_id,user_id,environment);

-- Infer only unambiguous standalone blocks from their exact existing period.
-- No original entitlement field (including updated_at) changes here.
UPDATE public.access_passes p SET allocated_starts_at=p.starts_at,
 allocated_expires_at=p.expires_at,original_expires_at=p.expires_at,allocation_version=1
WHERE p.allocation_version=0 AND p.expires_at-p.starts_at=p.access_days*interval '24 hours'
 AND NOT EXISTS(SELECT 1 FROM public.access_passes q WHERE q.user_id=p.user_id AND q.environment=p.environment AND q.id<>p.id);

CREATE OR REPLACE FUNCTION public.apply_access_purchase(
 p_user_id uuid,p_payment_session_id text,p_payment_customer_id text,p_price_id text,p_access_days integer,p_environment text)
RETURNS timestamptz LANGUAGE plpgsql SECURITY DEFINER SET search_path='' SET timezone='UTC' AS $$
DECLARE prior public.access_passes%ROWTYPE; parent public.access_passes%ROWTYPE; base timestamptz; expiry timestamptz;
BEGIN
 IF p_user_id IS NULL OR p_payment_session_id IS NULL OR length(p_payment_session_id) NOT BETWEEN 1 AND 160
 OR p_price_id IS NULL OR length(p_price_id) NOT BETWEEN 1 AND 160 OR p_access_days IS NULL OR p_access_days NOT IN (30,180,365)
 OR p_environment IS NULL OR p_environment NOT IN ('sandbox','live')
 OR NOT EXISTS(SELECT 1 FROM auth.users WHERE id=p_user_id) THEN RAISE EXCEPTION 'Invalid access purchase'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text||':'||p_environment));
 SELECT * INTO prior FROM public.access_passes WHERE payment_session_id=p_payment_session_id AND environment=p_environment FOR UPDATE;
 IF FOUND THEN
  IF prior.user_id<>p_user_id OR prior.price_id<>p_price_id OR prior.access_days<>p_access_days
  OR prior.payment_customer_id IS DISTINCT FROM p_payment_customer_id THEN RAISE EXCEPTION 'Access reference conflicts with original purchase'; END IF;
  RETURN prior.expires_at;
 END IF;
 SELECT * INTO parent FROM public.access_passes WHERE user_id=p_user_id AND environment=p_environment
 AND status='active' AND expires_at>now() ORDER BY expires_at DESC,created_at DESC,id LIMIT 1 FOR UPDATE;
 base:=greatest(now(),coalesce(parent.expires_at,now())); expiry:=base+p_access_days*interval '24 hours';
 INSERT INTO public.access_passes(user_id,payment_session_id,payment_customer_id,price_id,access_days,status,environment,starts_at,expires_at,
 allocated_starts_at,allocated_expires_at,original_expires_at,parent_pass_id,allocation_version)
 VALUES(p_user_id,p_payment_session_id,p_payment_customer_id,p_price_id,p_access_days,'active',p_environment,now(),expiry,base,expiry,expiry,parent.id,1);
 RETURN expiry;
END; $$;
REVOKE ALL ON FUNCTION public.apply_access_purchase(uuid,text,text,text,integer,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.apply_access_purchase(uuid,text,text,text,integer,text) TO service_role;

CREATE OR REPLACE FUNCTION public.payment_record_event(p_environment text,p_event_id text,p_event_type text,p_body_sha256 text,p_state text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE prior public.payment_events%ROWTYPE;
BEGIN
 IF p_environment IS NULL OR p_environment NOT IN ('sandbox','live') OR p_event_id IS NULL OR p_event_id !~ '^[A-Za-z0-9_-]{1,160}$'
 OR p_event_type IS NULL OR p_event_type !~ '^[A-Za-z0-9_.]{1,80}$' OR p_body_sha256 IS NULL OR p_body_sha256 !~ '^[a-f0-9]{64}$'
 OR p_state IS NULL OR p_state NOT IN ('processed','ignored') THEN RAISE EXCEPTION 'Invalid verified payment event'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('ovu-payment-event:'||p_environment||':'||p_event_id));
 SELECT * INTO prior FROM public.payment_events WHERE environment=p_environment AND event_id=p_event_id;
 IF FOUND THEN
  IF prior.body_sha256<>p_body_sha256 OR prior.event_type<>p_event_type THEN RAISE EXCEPTION 'Webhook event identifier collision'; END IF;
  RETURN true;
 END IF;
 INSERT INTO public.payment_events(environment,event_id,event_type,body_sha256,state) VALUES(p_environment,p_event_id,p_event_type,p_body_sha256,p_state);
 RETURN false;
END; $$;
REVOKE ALL ON FUNCTION public.payment_record_event(text,text,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.payment_record_event(text,text,text,text,text) TO service_role;

CREATE OR REPLACE FUNCTION public.payment_rebase_full_refund(p_environment text,p_payment_id text,p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE ledger public.payment_transactions%ROWTYPE; refunded public.access_passes%ROWTYPE; child public.access_passes%ROWTYPE;
 at_time timestamptz:=now(); unused_us bigint; shift_us bigint; available_us bigint;
 queue_ids uuid[]; queue_shifts bigint[]; visited uuid[]:='{}'; queue_index integer:=1; parent_id uuid; parent_shift bigint;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text||':'||p_environment));
 SELECT * INTO ledger FROM public.payment_transactions WHERE environment=p_environment AND payment_id=p_payment_id AND user_id=p_user_id FOR UPDATE;
 IF NOT FOUND OR ledger.refunded_minor<>ledger.amount_minor THEN RAISE EXCEPTION 'Full verified refund required'; END IF;
 IF ledger.refund_rebased_at IS NOT NULL THEN RETURN; END IF;
 IF EXISTS(SELECT 1 FROM public.access_passes WHERE user_id=p_user_id AND environment=p_environment AND status='active'
 AND expires_at>at_time AND allocation_version<>1) THEN RAISE EXCEPTION 'Legacy entitlement allocations require reconciliation'; END IF;
 SELECT * INTO refunded FROM public.access_passes WHERE user_id=p_user_id AND environment=p_environment AND payment_session_id=p_payment_id FOR UPDATE;
 IF NOT FOUND OR refunded.allocation_version<>1 OR refunded.allocated_starts_at IS NULL OR refunded.allocated_expires_at IS NULL
 THEN RAISE EXCEPTION 'Payment allocation requires reconciliation'; END IF;
 unused_us:=greatest(0,round(extract(epoch FROM (refunded.allocated_expires_at-greatest(at_time,refunded.allocated_starts_at)))*1000000))::bigint;
 UPDATE public.access_passes SET status='refunded',updated_at=at_time WHERE id=refunded.id;
 queue_ids:=ARRAY[refunded.id]; queue_shifts:=ARRAY[unused_us];
 WHILE queue_index<=cardinality(queue_ids) LOOP
  parent_id:=queue_ids[queue_index];parent_shift:=queue_shifts[queue_index];queue_index:=queue_index+1;
  IF parent_id=ANY(visited) OR cardinality(visited)>10000 THEN RAISE EXCEPTION 'Invalid entitlement lineage'; END IF;
  visited:=array_append(visited,parent_id);
  IF parent_shift=0 THEN CONTINUE; END IF;
  FOR child IN SELECT * FROM public.access_passes WHERE parent_pass_id=parent_id AND user_id=p_user_id AND environment=p_environment FOR UPDATE LOOP
   IF child.expiry_is_fixed THEN CONTINUE; END IF;
   IF child.allocation_version<>1 THEN RAISE EXCEPTION 'Dependent allocation requires reconciliation'; END IF;
   shift_us:=parent_shift;
   IF child.status='active' THEN
    available_us:=greatest(0,round(extract(epoch FROM (child.allocated_starts_at-greatest(at_time,child.created_at)))*1000000))::bigint;
    shift_us:=least(parent_shift,available_us);
    IF shift_us>0 THEN
     INSERT INTO public.entitlement_refund_adjustments(environment,payment_id,user_id,pass_id,previous_expiry,updated_expiry,removed_microseconds)
     VALUES(p_environment,p_payment_id,p_user_id,child.id,child.expires_at,child.expires_at-shift_us*interval '1 microsecond',shift_us);
     UPDATE public.access_passes SET allocated_starts_at=allocated_starts_at-shift_us*interval '1 microsecond',
      allocated_expires_at=allocated_expires_at-shift_us*interval '1 microsecond',expires_at=expires_at-shift_us*interval '1 microsecond',updated_at=at_time WHERE id=child.id;
    END IF;
   END IF;
   queue_ids:=array_append(queue_ids,child.id);queue_shifts:=array_append(queue_shifts,shift_us);
  END LOOP;
 END LOOP;
 UPDATE public.payment_transactions SET refund_unused_microseconds=unused_us,refund_rebased_at=at_time WHERE environment=p_environment AND payment_id=p_payment_id;
END; $$;
REVOKE ALL ON FUNCTION public.payment_rebase_full_refund(text,text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.payment_rebase_full_refund(text,text,uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.payment_apply_verified_capture(
 p_environment text,p_order_id text,p_payment_id text,p_user_id uuid,p_amount bigint,p_currency text,p_refunded bigint,
 p_event_id text DEFAULT NULL,p_event_type text DEFAULT NULL,p_body_sha256 text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE registered public.payment_orders%ROWTYPE; prior public.payment_transactions%ROWTYPE; pass public.access_passes%ROWTYPE;
 cumulative bigint; payment_state text; was_duplicate boolean:=false; expiry timestamptz;
BEGIN
 IF p_user_id IS NULL OR p_environment IS NULL OR p_environment NOT IN ('sandbox','live') OR p_payment_id IS NULL OR p_payment_id !~ '^pay_[A-Za-z0-9]+$'
 OR p_amount IS NULL OR p_amount<1 OR p_refunded IS NULL OR p_refunded<0 OR p_refunded>p_amount THEN RAISE EXCEPTION 'Invalid verified payment'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text||':'||p_environment));
 SELECT * INTO registered FROM public.payment_orders WHERE environment=p_environment AND order_id=p_order_id FOR UPDATE;
 IF NOT FOUND OR registered.user_id<>p_user_id OR registered.amount_minor<>p_amount OR registered.currency IS DISTINCT FROM p_currency THEN RAISE EXCEPTION 'Payment does not match stored order'; END IF;
 IF p_event_id IS NOT NULL THEN PERFORM public.payment_record_event(p_environment,p_event_id,p_event_type,p_body_sha256,'processed');
 ELSIF p_event_type IS NOT NULL OR p_body_sha256 IS NOT NULL THEN RAISE EXCEPTION 'Incomplete verified event'; END IF;
 SELECT * INTO prior FROM public.payment_transactions WHERE environment=p_environment AND payment_id=p_payment_id FOR UPDATE;
 IF FOUND THEN
  IF prior.user_id<>p_user_id OR prior.order_id<>p_order_id OR prior.amount_minor<>p_amount OR prior.currency<>p_currency THEN RAISE EXCEPTION 'Payment reference conflicts with original transaction'; END IF;
  was_duplicate:=true;cumulative:=greatest(prior.refunded_minor,p_refunded);
 ELSE
  IF registered.state='paid' THEN RAISE EXCEPTION 'Order already fulfilled by another payment'; END IF;
  cumulative:=p_refunded;
 END IF;
 payment_state:=CASE WHEN cumulative=p_amount THEN 'refunded' WHEN cumulative>0 THEN 'partially_refunded' ELSE 'captured' END;
 IF was_duplicate THEN
  UPDATE public.payment_transactions SET refunded_minor=cumulative,state=payment_state WHERE environment=p_environment AND payment_id=p_payment_id;
  SELECT * INTO pass FROM public.access_passes WHERE environment=p_environment AND payment_session_id=p_payment_id AND user_id=p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment ledger requires reconciliation'; END IF;
 ELSE
  INSERT INTO public.payment_transactions(environment,payment_id,order_id,user_id,amount_minor,currency,state,refunded_minor)
  VALUES(p_environment,p_payment_id,p_order_id,p_user_id,p_amount,p_currency,payment_state,cumulative);
  expiry:=public.apply_access_purchase(p_user_id,p_payment_id,p_order_id,registered.plan_id,registered.access_days,p_environment);
  UPDATE public.payment_orders SET state='paid' WHERE environment=p_environment AND order_id=p_order_id;
 END IF;
 IF payment_state='refunded' THEN PERFORM public.payment_rebase_full_refund(p_environment,p_payment_id,p_user_id); END IF;
 SELECT * INTO pass FROM public.access_passes WHERE environment=p_environment AND payment_session_id=p_payment_id AND user_id=p_user_id;
 RETURN jsonb_build_object('expiresAt',pass.expires_at,'planId',registered.plan_id,
 'status',CASE WHEN pass.status='active' AND pass.expires_at<=now() THEN 'expired'
 WHEN pass.status='active' AND pass.starts_at>now() THEN 'scheduled' ELSE pass.status END,'duplicate',was_duplicate);
END; $$;
REVOKE ALL ON FUNCTION public.payment_apply_verified_capture(text,text,text,uuid,bigint,text,bigint,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.payment_apply_verified_capture(text,text,text,uuid,bigint,text,bigint,text,text,text) TO service_role;
NOTIFY pgrst,'reload schema';
