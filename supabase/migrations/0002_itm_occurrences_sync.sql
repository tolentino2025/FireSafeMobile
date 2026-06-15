-- FireSafe ITM — Fase 5: tabela de ocorrências sincronizadas (origem do worker de e-mail).
-- As ocorrências ITM "oficiais" vivem no cliente (AsyncStorage). Para um worker de
-- servidor enviar e-mail 48h antes, ele precisa das ocorrências NO Supabase.
-- Esta tabela é o destino do sync do cliente (apenas ocorrências futuras/não concluídas).
-- RLS: cada usuário acessa só as próprias linhas; o service_role (worker) ignora RLS.

create table if not exists public.itm_occurrences (
  id uuid primary key default gen_random_uuid(),
  company_id uuid,
  user_id uuid not null,
  -- chave estável da ocorrência no cliente (idempotência do upsert)
  occurrence_id text not null,
  plan_id text,
  property_name text,
  system text,
  activity text,
  frequency text,
  description text,
  -- e-mail de destino (capturado no sync; evita acesso ao schema auth no worker)
  email text,
  due_date date,
  scheduled_date date,
  timezone text default 'America/Sao_Paulo',
  -- instante (UTC) em que o lembrete de 48h deve disparar
  notify_at timestamptz,
  completed_at timestamptz,
  status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, occurrence_id)
);

-- Índice para o worker varrer rápido a janela de notificação.
create index if not exists itm_occurrences_notify_idx
  on public.itm_occurrences (notify_at)
  where completed_at is null;

-- RLS: dono acessa só as próprias linhas.
alter table public.itm_occurrences enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'itm_occurrences'
      and policyname = 'itm_occurrences_owner'
  ) then
    create policy itm_occurrences_owner on public.itm_occurrences
      for all to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $$;
