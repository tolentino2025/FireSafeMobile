# Supabase — Setup (Fase 4)

Projeto: **tbbnysvkfnoydjqxdnlc** · URL: `https://tbbnysvkfnoydjqxdnlc.supabase.co`

> Este ambiente (onde a IA roda) tem **egress de rede bloqueado** para o Supabase.
> Por isso os passos com a **CLI do Supabase rodam na SUA máquina** (têm sua autenticação).

---

## 1. O que já foi configurado no código (pela IA)
- App **conectado ao Supabase** (cliente): `.env` + `vercel.json` com `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` (publishable — segura por design).
- **Login opcional** durante os testes: `EXPO_PUBLIC_AUTH_REQUIRED` vazio → o app **não força login**. Para tornar obrigatório depois, defina `EXPO_PUBLIC_AUTH_REQUIRED=1`.
- Migrations prontas em `supabase/migrations/` (tabelas de notificação + RLS).

## 2. Rodar as migrations (na sua máquina)
```bash
# instalar a CLI (se necessário): npm i -g supabase
supabase login                 # abre o navegador para autenticar
cd <pasta-do-projeto>
supabase link --project-ref tbbnysvkfnoydjqxdnlc
supabase db push               # aplica supabase/migrations/*.sql
```
Isso cria: `user_notification_preferences`, `notification_logs`, `user_push_tokens`,
`user_calendar_connections`, `itm_calendar_events`, `calendar_feed_tokens` (com RLS por usuário).

> Há também o schema base do app em `server/supabase/schema.sql` (tenants/profiles/companies/
> inspections…). Se quiser usá-lo no Supabase, copie-o para uma migration também.

## 3. Variáveis no Vercel (produção web)
As env do cliente já estão embutidas no `buildCommand` do `vercel.json` (publishable é pública).
Nada a fazer — o próximo deploy já conecta. (Opcional: mover para o painel de Env do Vercel.)

## 4. Para o worker de e-mail (Fase 5) — quando formos ativar
Você precisará fornecer (NÃO vão para o cliente):
- **`SUPABASE_SERVICE_ROLE_KEY`** (Supabase → Project Settings → API → service_role) — só no servidor.
- Chave do provedor de e-mail (recomendado **Resend**: `RESEND_API_KEY`).
- Decidir onde roda o cron (Vercel Cron, Supabase Edge + pg_cron, ou o servidor Express).

## 5. Habilitar login obrigatório (multiempresa) — quando quiser
1. Criar usuários (Auth) e a tabela `profiles` ligando `auth.uid()` → empresa/tenant.
2. Definir `EXPO_PUBLIC_AUTH_REQUIRED=1` no `vercel.json`/env.
3. A partir daí o app exige login (tela já existente).

## 6. Status atual
- Cliente conecta ao Supabase ✅
- Login opcional (não bloqueia testes) ✅
- Tabelas de notificação: **prontas para `db push`** (rodar passo 2) ⏳
- E-mail 48h / push remoto / Google / Outlook: próximas fases (precisam service_role + worker) ⏳
