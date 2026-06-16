-- FireSafe ITM — Fase 9: auditoria + retries + cron do resumo diário.

-- 1) Auditoria/retry no log de notificações (aditivo, não quebra dados).
alter table public.notification_logs
  add column if not exists retry_count integer default 0,
  add column if not exists last_attempt_at timestamptz;

-- 2) Cron diário do resumo (06:00 America/Sao_Paulo = 09:00 UTC).
-- Reaproveita os segredos do Vault já criados para o notify-48h
-- (notify_48h_service_key + project_url). Idempotente ao reaplicar.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'itm-daily-summary') then
    perform cron.unschedule('itm-daily-summary');
  end if;
end $$;

select cron.schedule(
  'itm-daily-summary',
  '0 9 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/daily-summary',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'notify_48h_service_key')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);
