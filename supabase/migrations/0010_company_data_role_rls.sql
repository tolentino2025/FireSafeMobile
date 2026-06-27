-- FireSafe ITM — RLS por PAPEL em company_data e no Storage da empresa.
-- Antes: qualquer membro (inclusive 'viewer') podia inserir/editar/APAGAR todas
-- as coleções e arquivos da empresa (company_data_rw / company_files_*).
-- Agora: LEITURA para todos os membros; ESCRITA (insert/update/delete) só para
-- papéis de edição (owner/admin/supervisor/inspector). 'viewer' fica read-only.

-- ──────────────────────────────────────────────────────────────────────────
-- company_data
-- ──────────────────────────────────────────────────────────────────────────
drop policy if exists company_data_rw on public.company_data;

create policy company_data_select on public.company_data for select to authenticated
  using (company_id in (select public.user_company_ids()));

create policy company_data_insert on public.company_data for insert to authenticated
  with check (
    public.user_role_in(company_id) in ('owner','admin','supervisor','inspector')
  );

create policy company_data_update on public.company_data for update to authenticated
  using (
    public.user_role_in(company_id) in ('owner','admin','supervisor','inspector')
  )
  with check (
    public.user_role_in(company_id) in ('owner','admin','supervisor','inspector')
  );

create policy company_data_delete on public.company_data for delete to authenticated
  using (
    public.user_role_in(company_id) in ('owner','admin','supervisor','inspector')
  );

-- ──────────────────────────────────────────────────────────────────────────
-- Storage: bucket company-files (path = <companyId>/...). Leitura mantida para
-- membros (company_files_select de 0007). Escrita restrita por papel.
-- ──────────────────────────────────────────────────────────────────────────
drop policy if exists company_files_insert on storage.objects;
drop policy if exists company_files_update on storage.objects;
drop policy if exists company_files_delete on storage.objects;

create policy company_files_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'company-files'
    and public.user_role_in(((storage.foldername(name))[1])::uuid)
        in ('owner','admin','supervisor','inspector')
  );

create policy company_files_update on storage.objects for update to authenticated
  using (
    bucket_id = 'company-files'
    and public.user_role_in(((storage.foldername(name))[1])::uuid)
        in ('owner','admin','supervisor','inspector')
  );

create policy company_files_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'company-files'
    and public.user_role_in(((storage.foldername(name))[1])::uuid)
        in ('owner','admin','supervisor','inspector')
  );
