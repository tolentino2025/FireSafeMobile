-- FireSafe ITM — Fase 5: agendamento do worker de e-mail 48h (pg_cron + pg_net).
-- Roda a Edge Function `notify-48h` a cada 60 minutos.
--
-- PRÉ-REQUISITOS (rodar UMA vez no projeto, no SQL Editor do Supabase):
--   1. Habilitar as extensões (já incluídas abaixo, idempotentes).
--   2. Guardar a service_role key no Vault para o cron autenticar a chamada HTTP.
--      No SQL Editor (NÃO commitar a key no repo):
--        select vault.create_secret('COLE_A_SERVICE_ROLE_KEY_AQUI', 'notify_48h_service_key');
--      E o domínio do projeto:
--        select vault.create_secret('https://tbbnysvkfnoydjqxdnlc.supabase.co', 'project_url');
--
-- Esta migration NÃO contém segredos — lê tudo do Vault em tempo de execução.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove agendamento anterior (idempotência ao reaplicar).
do $$
begin
  if exists (select 1 from cron.job where jobname = 'itm-notify-48h') then
    perform cron.unschedule('itm-notify-48h');
  end if;
end $$;

-- A cada 60 minutos, invoca a Edge Function com Authorization Bearer (service_role do Vault).
select cron.schedule(
  'itm-notify-48h',
  '0 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/notify-48h',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'notify_48h_service_key')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);
