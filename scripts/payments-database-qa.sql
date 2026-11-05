CREATE FUNCTION pg_temp.payment_assert(p_ok boolean,p_label text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 IF p_ok IS NOT TRUE THEN RAISE EXCEPTION 'Payment QA failed: %',p_label; END IF;
 PERFORM set_config('ovu.payment_qa_checks',(current_setting('ovu.payment_qa_checks')::integer+1)::text,true);
END; $$;
SELECT set_config('ovu.payment_qa_checks','0',true);
DO $qa$
DECLARE a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); c uuid:=gen_random_uuid(); result jsonb; again jsonb;
 before_b timestamptz; before_c timestamptz; before_manual timestamptz; original_c timestamptz;
 fixed_id uuid; fixed_before timestamptz; descendant_before timestamptz; rejected boolean;
BEGIN
 INSERT INTO pg_temp.fixture_users(id) VALUES(a),(b),(c);
 PERFORM pg_temp.payment_assert(NOT EXISTS(SELECT 1 FROM pg_class WHERE relnamespace=pg_my_temp_schema()
 AND relname IN ('payment_orders','payment_transactions','payment_events','entitlement_refund_adjustments') AND NOT relrowsecurity),'ledger RLS enabled');
 PERFORM pg_temp.payment_assert(NOT has_table_privilege('anon','pg_temp.payment_orders','SELECT')
 AND NOT has_table_privilege('authenticated','pg_temp.payment_orders','INSERT'),'browser ledger access denied');
 PERFORM pg_temp.payment_assert(NOT has_function_privilege('authenticated','pg_temp.payment_apply_verified_capture(text,text,text,uuid,bigint,text,bigint,text,text,text)','EXECUTE')
 AND NOT has_function_privilege('anon','pg_temp.payment_rebase_full_refund(text,text,uuid)','EXECUTE'),'browser mutation RPC denied');
 INSERT INTO pg_temp.payment_orders(environment,order_id,user_id,plan_id,access_days,amount_minor,currency) VALUES
 ('sandbox','order_QA1',a,'universe_30_days',30,17900,'INR'),
 ('sandbox','order_QA2',a,'universe_180_days',180,79900,'INR'),
 ('sandbox','order_QA3',a,'universe_365_days',365,139900,'INR'),
 ('sandbox','order_QA4',b,'universe_30_days',30,249,'USD'),
 ('sandbox','order_QA5',c,'universe_30_days',30,17900,'INR'),
 ('sandbox','order_QA6',c,'universe_180_days',180,79900,'INR');
 result:=pg_temp.payment_apply_verified_capture('sandbox','order_QA1','pay_QA1',a,17900,'INR',0,'event_QA1','payment.captured',repeat('a',64));
 PERFORM pg_temp.payment_assert(result->>'status'='active' AND (result->>'expiresAt')::timestamptz=now()+interval '30 days','captured payment grants exact plan');
 again:=pg_temp.payment_apply_verified_capture('sandbox','order_QA1','pay_QA1',a,17900,'INR',0,'event_QA1','payment.captured',repeat('a',64));
 PERFORM pg_temp.payment_assert((again->>'duplicate')::boolean AND result->>'expiresAt'=again->>'expiresAt','duplicate capture keeps expiry');
 PERFORM pg_temp.payment_assert((SELECT count(*) FROM pg_temp.access_passes WHERE user_id=a)=1
 AND (SELECT count(*) FROM pg_temp.payment_events WHERE event_id='event_QA1')=1,'one pass and one event after replay');
 rejected:=false;
 BEGIN PERFORM pg_temp.payment_apply_verified_capture('sandbox','order_QA1','pay_QA1',b,17900,'INR',0); EXCEPTION WHEN OTHERS THEN rejected:=true; END;
 PERFORM pg_temp.payment_assert(rejected,'other-owner claim denied');
 rejected:=false;
 BEGIN PERFORM pg_temp.payment_apply_verified_capture('sandbox','order_QA1','pay_QA1',a,1,'INR',0); EXCEPTION WHEN OTHERS THEN rejected:=true; END;
 PERFORM pg_temp.payment_assert(rejected,'wrong amount denied');
 rejected:=false;
 BEGIN PERFORM pg_temp.payment_apply_verified_capture('sandbox','order_QA1','pay_QA1',a,17900,'USD',0); EXCEPTION WHEN OTHERS THEN rejected:=true; END;
 PERFORM pg_temp.payment_assert(rejected,'wrong currency denied');
 rejected:=false;
 BEGIN PERFORM pg_temp.payment_apply_verified_capture('sandbox','order_QA1','pay_QA1',a,17900,'INR',0,'event_QA1','payment.captured',repeat('b',64)); EXCEPTION WHEN OTHERS THEN rejected:=true; END;
 PERFORM pg_temp.payment_assert(rejected,'same event ID with different body denied');
 rejected:=false;
 BEGIN PERFORM pg_temp.payment_apply_verified_capture('sandbox','order_QA1','pay_QAOther',a,17900,'INR',0); EXCEPTION WHEN OTHERS THEN rejected:=true; END;
 PERFORM pg_temp.payment_assert(rejected,'second captured payment cannot fulfill one order twice');
 PERFORM pg_temp.payment_apply_verified_capture('sandbox','order_QA2','pay_QA2',a,79900,'INR',0);
 PERFORM pg_temp.payment_apply_verified_capture('sandbox','order_QA3','pay_QA3',a,139900,'INR',0);
 PERFORM pg_temp.apply_access_purchase(a,'admin:qa-duration',NULL,'admin_grant_30_days',30,'sandbox');
 UPDATE pg_temp.access_passes SET starts_at=starts_at-interval '5 days',expires_at=expires_at-interval '5 days',
 allocated_starts_at=allocated_starts_at-interval '5 days',allocated_expires_at=allocated_expires_at-interval '5 days',
 original_expires_at=original_expires_at-interval '5 days',created_at=created_at-interval '5 days' WHERE user_id=a;
 SELECT expires_at INTO before_b FROM pg_temp.access_passes WHERE user_id=a AND payment_session_id='pay_QA2';
 SELECT expires_at,original_expires_at INTO before_c,original_c FROM pg_temp.access_passes WHERE user_id=a AND payment_session_id='pay_QA3';
 SELECT expires_at INTO before_manual FROM pg_temp.access_passes WHERE user_id=a AND payment_session_id='admin:qa-duration';
 result:=pg_temp.payment_apply_verified_capture('sandbox','order_QA1','pay_QA1',a,17900,'INR',17900,'event_QAR1','refund.processed',repeat('c',64));
 PERFORM pg_temp.payment_assert(result->>'status'='refunded','full refund revokes that purchase');
 PERFORM pg_temp.payment_assert((SELECT refund_unused_microseconds FROM pg_temp.payment_transactions WHERE payment_id='pay_QA1')=25::bigint*86400*1000000,'only unused refunded time removed');
 PERFORM pg_temp.payment_assert((SELECT expires_at FROM pg_temp.access_passes WHERE user_id=a AND payment_session_id='pay_QA2')=before_b-interval '25 days','dependent first purchase rebased');
 PERFORM pg_temp.payment_assert((SELECT expires_at FROM pg_temp.access_passes WHERE user_id=a AND payment_session_id='pay_QA3')=before_c-interval '25 days','dependent later purchase rebased');
 PERFORM pg_temp.payment_assert((SELECT original_expires_at FROM pg_temp.access_passes WHERE user_id=a AND payment_session_id='pay_QA3')=original_c,'original promised expiry retained for audit');
 PERFORM pg_temp.payment_assert((SELECT expires_at FROM pg_temp.access_passes WHERE user_id=a AND payment_session_id='admin:qa-duration')=before_manual-interval '25 days'
 AND (SELECT allocated_expires_at-allocated_starts_at FROM pg_temp.access_passes WHERE user_id=a AND payment_session_id='admin:qa-duration')=interval '30 days','manual duration preserved');
 PERFORM pg_temp.payment_assert((SELECT count(*) FROM pg_temp.entitlement_refund_adjustments WHERE user_id=a)=3,'refund adjustments audited once per dependent pass');
 PERFORM pg_temp.payment_apply_verified_capture('sandbox','order_QA1','pay_QA1',a,17900,'INR',17900,'event_QAR1','refund.processed',repeat('c',64));
 PERFORM pg_temp.payment_assert((SELECT count(*) FROM pg_temp.entitlement_refund_adjustments WHERE user_id=a)=3,'refund replay does not subtract again');
 PERFORM pg_temp.payment_apply_verified_capture('sandbox','order_QA2','pay_QA2',a,79900,'INR',79900);
 PERFORM pg_temp.payment_assert((SELECT max(expires_at) FROM pg_temp.access_passes WHERE user_id=a AND status='active')=now()+interval '395 days','multiple refunds preserve surviving purchase and manual duration');
 SELECT expires_at INTO before_c FROM pg_temp.access_passes WHERE user_id=a AND payment_session_id='pay_QA3';
 PERFORM pg_temp.payment_apply_verified_capture('sandbox','order_QA3','pay_QA3',a,139900,'INR',69950);
 PERFORM pg_temp.payment_assert((SELECT state FROM pg_temp.payment_transactions WHERE payment_id='pay_QA3')='partially_refunded'
 AND (SELECT expires_at FROM pg_temp.access_passes WHERE user_id=a AND payment_session_id='pay_QA3')=before_c,'partial refund retains access per existing rules');
 PERFORM pg_temp.payment_apply_verified_capture('sandbox','order_QA3','pay_QA3',a,139900,'INR',0);
 PERFORM pg_temp.payment_assert((SELECT refunded_minor FROM pg_temp.payment_transactions WHERE payment_id='pay_QA3')=69950,'older capture does not erase refund');
 UPDATE pg_temp.access_passes SET allocation_version=0 WHERE user_id=a AND payment_session_id='pay_QA3';
 rejected:=false;
 BEGIN PERFORM pg_temp.payment_apply_verified_capture('sandbox','order_QA3','pay_QA3',a,139900,'INR',139900,'event_QALegacy','refund.processed',repeat('d',64)); EXCEPTION WHEN OTHERS THEN rejected:=true; END;
 PERFORM pg_temp.payment_assert(rejected AND (SELECT refunded_minor FROM pg_temp.payment_transactions WHERE payment_id='pay_QA3')=69950
 AND NOT EXISTS(SELECT 1 FROM pg_temp.payment_events WHERE event_id='event_QALegacy'),'unreconciled refund rolls back ledger and event');
 result:=pg_temp.payment_apply_verified_capture('sandbox','order_QA4','pay_QA4',b,249,'USD',249);
 PERFORM pg_temp.payment_assert(result->>'status'='refunded' AND NOT EXISTS(SELECT 1 FROM pg_temp.access_passes WHERE user_id=b AND status='active'),'refund-before-capture never leaves active credit');
 PERFORM pg_temp.payment_apply_verified_capture('sandbox','order_QA4','pay_QA4',b,249,'USD',0);
 PERFORM pg_temp.payment_assert((SELECT state FROM pg_temp.payment_transactions WHERE payment_id='pay_QA4')='refunded','old callback cannot reactivate full refund');
 PERFORM pg_temp.payment_apply_verified_capture('sandbox','order_QA5','pay_QA5',c,17900,'INR',0);
 PERFORM pg_temp.apply_access_purchase(c,'admin:qa-fixed',NULL,'admin_grant_30_days',30,'sandbox');
 SELECT id INTO fixed_id FROM pg_temp.access_passes WHERE user_id=c AND payment_session_id='admin:qa-fixed';
 UPDATE pg_temp.access_passes SET expiry_is_fixed=true,expires_at=now()+interval '100 days',allocated_expires_at=now()+interval '100 days',original_expires_at=now()+interval '100 days' WHERE id=fixed_id;
 PERFORM pg_temp.payment_apply_verified_capture('sandbox','order_QA6','pay_QA6',c,79900,'INR',0);
 SELECT expires_at INTO fixed_before FROM pg_temp.access_passes WHERE id=fixed_id;
 SELECT expires_at INTO descendant_before FROM pg_temp.access_passes WHERE user_id=c AND payment_session_id='pay_QA6';
 PERFORM pg_temp.payment_apply_verified_capture('sandbox','order_QA5','pay_QA5',c,17900,'INR',17900);
 PERFORM pg_temp.payment_assert((SELECT expires_at FROM pg_temp.access_passes WHERE id=fixed_id)=fixed_before
 AND (SELECT expires_at FROM pg_temp.access_passes WHERE user_id=c AND payment_session_id='pay_QA6')=descendant_before,'fixed admin dates anchor descendants');
 PERFORM pg_temp.payment_record_event('sandbox','event_QAIgnored','payment.failed',repeat('e',64),'ignored');
 PERFORM pg_temp.payment_record_event('sandbox','event_QAIgnored','payment.failed',repeat('e',64),'ignored');
 PERFORM pg_temp.payment_assert((SELECT count(*) FROM pg_temp.payment_events WHERE event_id='event_QAIgnored')=1,'failed event recorded without duplicate access');
END $qa$;
