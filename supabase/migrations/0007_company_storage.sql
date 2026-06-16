-- FireSafe ITM — Fase 2D: bucket privado de arquivos por empresa.
-- Fotos/evidências/relatórios ficam em company-files sob o path <companyId>/...
-- RLS no storage.objects: só membros da empresa acessam os arquivos dela.

insert into storage.buckets (id, name, public)
values ('company-files', 'company-files', false)
on conflict (id) do nothing;

-- Helper já existe (public.user_company_ids()). As policies comparam a 1ª pasta
-- do path (o companyId) com as empresas do usuário.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='company_files_select') then
    create policy company_files_select on storage.objects for select to authenticated
      using (
        bucket_id = 'company-files'
        and (storage.foldername(name))[1] in (select public.user_company_ids()::text)
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='company_files_insert') then
    create policy company_files_insert on storage.objects for insert to authenticated
      with check (
        bucket_id = 'company-files'
        and (storage.foldername(name))[1] in (select public.user_company_ids()::text)
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='company_files_update') then
    create policy company_files_update on storage.objects for update to authenticated
      using (
        bucket_id = 'company-files'
        and (storage.foldername(name))[1] in (select public.user_company_ids()::text)
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='company_files_delete') then
    create policy company_files_delete on storage.objects for delete to authenticated
      using (
        bucket_id = 'company-files'
        and (storage.foldername(name))[1] in (select public.user_company_ids()::text)
      );
  end if;
end $$;
