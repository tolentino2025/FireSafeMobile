-- FireSafe ITM — 0009: corrige escalonamento de privilégio (P0).
--
-- Problema (0005):
--   * members_write (FOR ALL, owner/admin) permitia que um admin atualizasse a
--     PRÓPRIA linha para role='owner' (auto-promoção) e mexesse em owners.
--   * companies_update permitia que QUALQUER membro (até 'viewer') editasse a
--     empresa.
--
-- Membros só são criados via RPCs SECURITY DEFINER (create_company_with_owner,
-- accept_company_invite), que ignoram RLS — então restringir o acesso DIRETO
-- do cliente não quebra criação de empresa nem aceite de convite.

-- ── companies: apenas owner/admin podem atualizar ──────────────────────────
drop policy if exists companies_update on public.companies;
create policy companies_update on public.companies for update to authenticated
  using (public.user_role_in(id) in ('owner','admin'))
  with check (public.user_role_in(id) in ('owner','admin'));

-- ── company_members: substitui a policy única FOR ALL por policies por ──────
--    operação, impedindo auto-promoção e admin alterar/remover owners.
drop policy if exists members_write on public.company_members;

-- INSERT (defesa; fluxo normal é via RPC): owner/admin adiciona membros;
-- somente owner pode criar um 'owner'.
create policy members_insert on public.company_members for insert to authenticated
  with check (
    public.user_role_in(company_id) in ('owner','admin')
    and (role <> 'owner' or public.user_role_in(company_id) = 'owner')
  );

-- UPDATE: owner/admin altera OUTROS membros; ninguém altera a própria linha
-- (impede auto-promoção); só owner mexe numa linha de owner; só owner pode
-- definir role='owner'. (user_role_in retorna o papel do ATOR — outra linha.)
create policy members_update on public.company_members for update to authenticated
  using (
    public.user_role_in(company_id) in ('owner','admin')
    and user_id <> auth.uid()
    and (role <> 'owner' or public.user_role_in(company_id) = 'owner')
  )
  with check (
    public.user_role_in(company_id) in ('owner','admin')
    and (role <> 'owner' or public.user_role_in(company_id) = 'owner')
  );

-- DELETE: owner/admin remove OUTROS membros; só owner remove owners.
-- (A exclusão de conta usa service_role e ignora RLS, então não é afetada.)
create policy members_delete on public.company_members for delete to authenticated
  using (
    public.user_role_in(company_id) in ('owner','admin')
    and user_id <> auth.uid()
    and (role <> 'owner' or public.user_role_in(company_id) = 'owner')
  );
