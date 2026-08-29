-- FireSafe ITM — 0011: chaves de acesso (licenciamento B2B fora da loja).
--
-- Modelo: a venda acontece FORA do app (contrato direto com o cliente). Você
-- emite uma chave com `node scripts/gen-access-key.mjs`, insere o HASH aqui via
-- service_role, e o cliente resgata a chave dentro do app. O resgate libera a
-- EMPRESA do usuário (todos os membros ativos) ou, se ele ainda não tiver
-- empresa, o próprio usuário.
--
-- A chave em texto puro NUNCA é armazenada — só o SHA-256 da forma canônica.
-- O app não expõe preço nem caminho de compra: apenas o campo de resgate.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- Tabelas
-- ─────────────────────────────────────────────────────────────
create table if not exists public.access_keys (
  id              uuid primary key default gen_random_uuid(),
  key_hash        text not null unique,
  label           text,                                   -- cliente/contrato, uso interno
  validity_months integer not null default 12
                    check (validity_months between 1 and 120),
  redeemed_by     uuid references auth.users(id) on delete set null,
  redeemed_at     timestamptz,
  company_id      uuid references public.companies(id) on delete set null,
  revoked_at      timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists idx_access_keys_company on public.access_keys(company_id);

create table if not exists public.entitlements (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid references public.companies(id) on delete cascade,
  user_id       uuid references auth.users(id) on delete cascade,
  plan          text not null default 'premium' check (plan in ('premium')),
  source        text not null default 'access_key',
  access_key_id uuid references public.access_keys(id) on delete set null,
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- escopo é exclusivo: ou empresa, ou usuário avulso.
  constraint entitlements_scope_chk check (num_nonnulls(company_id, user_id) = 1)
);

create unique index if not exists idx_entitlements_company
  on public.entitlements(company_id) where company_id is not null;
create unique index if not exists idx_entitlements_user
  on public.entitlements(user_id) where user_id is not null;

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────
-- access_keys: nenhuma policy — só service_role (que ignora RLS) enxerga.
alter table public.access_keys enable row level security;
revoke all on public.access_keys from anon, authenticated;

-- entitlements: leitura própria/da empresa. Escrita só pela RPC abaixo.
alter table public.entitlements enable row level security;
revoke all on public.entitlements from anon, authenticated;
grant select on public.entitlements to authenticated;

drop policy if exists entitlements_read on public.entitlements;
create policy entitlements_read on public.entitlements for select to authenticated
  using (
    user_id = auth.uid()
    or company_id in (select public.user_company_ids())
  );

-- ─────────────────────────────────────────────────────────────
-- RPC: resgatar chave. SECURITY DEFINER (a tabela é fechada ao cliente).
-- ─────────────────────────────────────────────────────────────
create or replace function public.redeem_access_key(p_key text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_canonical text;
  v_hash      text;
  v_key       public.access_keys%rowtype;
  v_company   uuid;
  v_expires   timestamptz;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  -- Forma canônica: maiúsculas, só A-Z0-9. Hífens/espaços digitados são ignorados.
  v_canonical := upper(regexp_replace(coalesce(p_key, ''), '[^A-Za-z0-9]', '', 'g'));
  if length(v_canonical) < 16 then
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;

  v_hash := encode(digest(v_canonical, 'sha256'), 'hex');

  select * into v_key from public.access_keys where key_hash = v_hash limit 1;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;
  if v_key.revoked_at is not null then
    return jsonb_build_object('ok', false, 'error', 'revoked');
  end if;
  if v_key.redeemed_at is not null then
    return jsonb_build_object('ok', false, 'error', 'used');
  end if;

  -- Empresa ativa mais antiga do usuário; sem empresa, libera o usuário.
  select company_id into v_company from public.company_members
  where user_id = auth.uid() and status = 'active'
  order by created_at
  limit 1;

  v_expires := now() + make_interval(months => v_key.validity_months);

  update public.access_keys
  set redeemed_by = auth.uid(), redeemed_at = now(), company_id = v_company
  where id = v_key.id;

  if v_company is not null then
    insert into public.entitlements (company_id, plan, source, access_key_id, expires_at)
    values (v_company, 'premium', 'access_key', v_key.id, v_expires)
    on conflict (company_id) where company_id is not null
    do update set
      expires_at    = greatest(entitlements.expires_at, now())
                        + make_interval(months => v_key.validity_months),
      access_key_id = excluded.access_key_id,
      updated_at    = now()
    returning expires_at into v_expires;
  else
    insert into public.entitlements (user_id, plan, source, access_key_id, expires_at)
    values (auth.uid(), 'premium', 'access_key', v_key.id, v_expires)
    on conflict (user_id) where user_id is not null
    do update set
      expires_at    = greatest(entitlements.expires_at, now())
                        + make_interval(months => v_key.validity_months),
      access_key_id = excluded.access_key_id,
      updated_at    = now()
    returning expires_at into v_expires;
  end if;

  return jsonb_build_object(
    'ok', true,
    'plan', 'premium',
    'scope', case when v_company is not null then 'company' else 'user' end,
    'expiresAt', v_expires
  );
end $$;

-- ─────────────────────────────────────────────────────────────
-- RPC: liberação vigente do usuário (própria ou herdada da empresa).
-- ─────────────────────────────────────────────────────────────
create or replace function public.my_entitlement()
returns jsonb
language sql
security definer
stable
set search_path = public, extensions
as $$
  select coalesce(
    (select jsonb_build_object(
       'plan', e.plan,
       'scope', case when e.company_id is not null then 'company' else 'user' end,
       'expiresAt', e.expires_at
     )
     from public.entitlements e
     where (e.user_id = auth.uid() or e.company_id in (select public.user_company_ids()))
       and e.expires_at > now()
     order by e.expires_at desc
     limit 1),
    jsonb_build_object('plan', 'free')
  )
$$;

revoke execute on function public.redeem_access_key(text) from public, anon;
revoke execute on function public.my_entitlement() from public, anon;
grant execute on function public.redeem_access_key(text) to authenticated;
grant execute on function public.my_entitlement() to authenticated;
