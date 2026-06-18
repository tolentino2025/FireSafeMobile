-- FireSafe ITM — Fase 2D: perfil completo da empresa (endereço + contato).
-- Adiciona colunas opcionais à tabela companies para endereço e dados de contato.

alter table public.companies
  add column if not exists address       text,
  add column if not exists city          text,
  add column if not exists state         text,
  add column if not exists zip_code      text,
  add column if not exists contact_name  text,
  add column if not exists contact_phone text,
  add column if not exists contact_email text;

-- Atualiza a função RPC para aceitar os novos campos.
create or replace function public.create_company_with_owner(
  p_name          text,
  p_cnpj          text    default null,
  p_address       text    default null,
  p_city          text    default null,
  p_state         text    default null,
  p_zip_code      text    default null,
  p_contact_name  text    default null,
  p_contact_phone text    default null,
  p_contact_email text    default null
)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_company_id uuid;
begin
  insert into public.companies (
    name, cnpj, address, city, state, zip_code,
    contact_name, contact_phone, contact_email, created_by
  )
  values (
    p_name, p_cnpj, p_address, p_city, p_state, p_zip_code,
    p_contact_name, p_contact_phone, p_contact_email, auth.uid()
  )
  returning id into v_company_id;

  insert into public.company_members (company_id, user_id, role)
  values (v_company_id, auth.uid(), 'owner');

  return v_company_id;
end;
$$;
