-- FireSafe ITM — Tabelas de Notificações e Calendário (Fases 3–8)
-- Rode com: supabase link --project-ref tbbnysvkfnoydjqxdnlc && supabase db push
-- RLS baseline: cada usuário acessa apenas as próprias linhas (user_id = auth.uid()).
-- O service_role (worker backend) ignora RLS automaticamente.

-- 1) Preferências de notificação por usuário
create table if not exists public.user_notification_preferences (
  id uuid primary key default gen_random_uuid(),
  company_id uuid,
  user_id uuid not null,
  email_48h_enabled boolean default true,
  push_48h_enabled boolean default false,
  daily_summary_enabled boolean default false,
  overdue_alert_enabled boolean default true,
  calendar_sync_enabled boolean default false,
  default_timezone text default 'America/Sao_Paulo',
  default_event_start_time time default '08:00',
  default_event_duration_minutes integer default 60,
  sync_horizon_days integer default 90,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id)
);

-- 2) Log de notificações (idempotência)
create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid,
  user_id uuid not null,
  occurrence_id text not null,
  channel text not null,            -- 'email' | 'push'
  offset_minutes integer not null,  -- 2880 = 48h
  status text not null,             -- 'sent' | 'failed' | 'skipped'
  sent_at timestamptz,
  error_message text,
  created_at timestamptz default now(),
  unique (user_id, occurrence_id, channel, offset_minutes)
);

-- 3) Tokens de push (Expo)
create table if not exists public.user_push_tokens (
  id uuid primary key default gen_random_uuid(),
  company_id uuid,
  user_id uuid not null,
  provider text not null default 'expo',
  push_token text not null,
  platform text,
  device_name text,
  is_active boolean default true,
  last_seen_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, push_token)
);

-- 4) Conexões de calendário externo (Google/Outlook) — tokens criptografados
create table if not exists public.user_calendar_connections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid,
  user_id uuid not null,
  provider text not null,           -- 'google' | 'microsoft'
  provider_account_email text,
  calendar_id text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  sync_enabled boolean default true,
  sync_horizon_days integer default 90,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, provider)
);

-- 5) Mapeamento ocorrência ITM <-> evento externo
create table if not exists public.itm_calendar_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid,
  user_id uuid not null,
  occurrence_id text not null,
  provider text not null,
  external_event_id text,
  calendar_id text,
  sync_status text not null default 'pending',
  last_synced_at timestamptz,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, occurrence_id, provider)
);

-- 6) Tokens de feed .ics (assinatura de calendário) — armazenar hash
create table if not exists public.calendar_feed_tokens (
  id uuid primary key default gen_random_uuid(),
  company_id uuid,
  user_id uuid not null,
  token_hash text not null,
  is_active boolean default true,
  horizon_days integer default 90,
  created_at timestamptz default now(),
  revoked_at timestamptz
);

-- ─────────────────────────────────────────────────────────────
-- RLS: usuário só acessa as próprias linhas (service_role ignora RLS).
-- ─────────────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'user_notification_preferences',
    'notification_logs',
    'user_push_tokens',
    'user_calendar_connections',
    'itm_calendar_events',
    'calendar_feed_tokens'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format($f$
      create policy %1$I_owner on public.%1$I
      for all to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
    $f$, t);
  end loop;
end $$;
