-- FireSafe ITM — Fase 2C: espelho dos dados operacionais por empresa.
-- Estratégia local-first com sync bidirecional: cada coleção (inspeções,
-- propriedades, planos ITM, bombas, etc.) é guardada como um documento JSONB
-- por (company_id, entity_type). O app empurra ao salvar e puxa ao ativar a
-- empresa. RLS garante que só membros da empresa leem/escrevem.

create table if not exists public.company_data (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  entity_type text not null,
  payload jsonb not null default '[]'::jsonb,
  updated_by uuid default auth.uid(),
  updated_at timestamptz default now(),
  unique (company_id, entity_type)
);

create index if not exists company_data_company_idx on public.company_data (company_id);

alter table public.company_data enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='company_data' and policyname='company_data_rw') then
    create policy company_data_rw on public.company_data for all to authenticated
      using (company_id in (select public.user_company_ids()))
      with check (company_id in (select public.user_company_ids()));
  end if;
end $$;
