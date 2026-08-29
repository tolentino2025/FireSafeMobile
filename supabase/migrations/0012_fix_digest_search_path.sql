-- FireSafe ITM — 0012: corrige o search_path das funções que usam pgcrypto.
--
-- BUG (produção): pgcrypto está instalado no schema `extensions` (padrão do
-- Supabase), mas estas funções SECURITY DEFINER fixam `search_path = public`.
-- Resultado: `digest(...)` não resolve e a função aborta com 42883.
--
--   * accept_company_invite — aceitar convite de empresa estava QUEBRADO em
--     produção desde a 0005 (o app publicado não conseguia entrar por convite).
--   * redeem_access_key     — mesmo problema na 0011.
--
-- Correção: incluir `extensions` no search_path (mantendo-o fixo, sem herdar o
-- do chamador, que é o motivo de existir o `set search_path` numa SECURITY
-- DEFINER).
alter function public.accept_company_invite(text) set search_path = public, extensions;
alter function public.redeem_access_key(text)     set search_path = public, extensions;
