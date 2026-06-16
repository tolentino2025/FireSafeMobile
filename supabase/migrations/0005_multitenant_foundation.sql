-- FireSafe ITM — Fase 2A: fundação multiempresa (companies + members + invites + RLS).
-- Modelo: usuário cria uma empresa OU aceita um convite. Todo dado operacional
-- (próximas migrations) vai referenciar company_id e usar a mesma regra de RLS:
--   "só vejo dados de empresas onde sou membro ativo".

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- Tabelas
-- ─────────────────────────────────────────────────────────────
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnpj text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'owner'
    check (role in ('owner','admin','supervisor','inspector','viewer')),
  status text not null default 'active'
    check (status in ('active','suspended')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (company_id, user_id)
);

create table if not exists public.company_invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  email text not null,
  role text not null default 'inspector'
    check (role in ('owner','admin','supervisor','inspector','viewer')),
  token_hash text not null,
  status text not null default 'pending'
    check (status in ('pending','accepted','revoked')),
  invited_by uuid not null default auth.uid(),
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz default now(),
  accepted_at timestamptz,
  accepted_by uuid
);

create index if not exists company_members_user_idx on public.company_members (user_id);
create index if not exists company_invites_token_idx on public.company_invites (token_hash);

-- ─────────────────────────────────────────────────────────────
-- Helper: empresas do usuário atual. SECURITY DEFINER para evitar
-- recursão de RLS quando as políticas consultam company_members.
-- ─────────────────────────────────────────────────────────────
create or replace function public.user_company_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select company_id from public.company_members
  where user_id = auth.uid() and status = 'active'
$$;

-- Papel do usuário numa empresa (para checagens de permissão).
create or replace function public.user_role_in(p_company uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.company_members
  where user_id = auth.uid() and company_id = p_company and status = 'active'
  limit 1
$$;

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.company_invites enable row level security;

do $$
begin
  -- companies: vejo as minhas; crio como dono; atualizo se for membro.
  if not exists (select 1 from pg_policies where tablename='companies' and policyname='companies_select') then
    create policy companies_select on public.companies for select to authenticated
      using (id in (select public.user_company_ids()));
  end if;
  if not exists (select 1 from pg_policies where tablename='companies' and policyname='companies_insert') then
    create policy companies_insert on public.companies for insert to authenticated
      with check (created_by = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename='companies' and policyname='companies_update') then
    create policy companies_update on public.companies for update to authenticated
      using (id in (select public.user_company_ids()))
      with check (id in (select public.user_company_ids()));
  end if;

  -- company_members: vejo membros das minhas empresas (ou minha própria linha).
  if not exists (select 1 from pg_policies where tablename='company_members' and policyname='members_select') then
    create policy members_select on public.company_members for select to authenticated
      using (user_id = auth.uid() or company_id in (select public.user_company_ids()));
  end if;
  -- admin/owner gerencia membros.
  if not exists (select 1 from pg_policies where tablename='company_members' and policyname='members_write') then
    create policy members_write on public.company_members for all to authenticated
      using (public.user_role_in(company_id) in ('owner','admin'))
      with check (public.user_role_in(company_id) in ('owner','admin'));
  end if;

  -- company_invites: membros admin/owner gerenciam os convites da empresa.
  if not exists (select 1 from pg_policies where tablename='company_invites' and policyname='invites_select') then
    create policy invites_select on public.company_invites for select to authenticated
      using (company_id in (select public.user_company_ids()));
  end if;
  if not exists (select 1 from pg_policies where tablename='company_invites' and policyname='invites_write') then
    create policy invites_write on public.company_invites for all to authenticated
      using (public.user_role_in(company_id) in ('owner','admin'))
      with check (public.user_role_in(company_id) in ('owner','admin'));
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────
-- RPC: criar empresa + virar dono (bootstrap; contorna a recursão de
-- "preciso ser membro para inserir membro"). SECURITY DEFINER.
-- ─────────────────────────────────────────────────────────────
create or replace function public.create_company_with_owner(p_name text, p_cnpj text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into public.companies (name, cnpj, created_by)
  values (p_name, p_cnpj, auth.uid())
  returning id into v_company;

  insert into public.company_members (company_id, user_id, role, status)
  values (v_company, auth.uid(), 'owner', 'active');

  return v_company;
end $$;

-- ─────────────────────────────────────────────────────────────
-- RPC: aceitar convite por token. Valida pendência/expiração/e-mail
-- e adiciona o usuário como membro. SECURITY DEFINER.
-- ─────────────────────────────────────────────────────────────
create or replace function public.accept_company_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text := encode(digest(p_token, 'sha256'), 'hex');
  v_invite public.company_invites%rowtype;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into v_invite from public.company_invites
  where token_hash = v_hash and status = 'pending' and expires_at > now()
  limit 1;
  if not found then
    raise exception 'convite inválido ou expirado';
  end if;

  -- E-mail do convite deve bater com o e-mail do usuário logado.
  select email into v_email from auth.users where id = auth.uid();
  if lower(v_email) <> lower(v_invite.email) then
    raise exception 'convite destinado a outro e-mail';
  end if;

  insert into public.company_members (company_id, user_id, role, status)
  values (v_invite.company_id, auth.uid(), v_invite.role, 'active')
  on conflict (company_id, user_id) do update set status = 'active';

  update public.company_invites
  set status = 'accepted', accepted_at = now(), accepted_by = auth.uid()
  where id = v_invite.id;

  return v_invite.company_id;
end $$;
