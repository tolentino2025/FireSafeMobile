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

## 4. Worker de e-mail 48h (Fase 5) — Supabase Edge + pg_cron a cada 60 min

Arquitetura escolhida: **Supabase Edge Function + pg_cron** (decisão sua), rodando **a cada 60 minutos**.

> **Como o worker enxerga as ocorrências?** As ocorrências oficiais vivem no app
> (AsyncStorage). Resolvemos o gap espelhando as ocorrências futuras (não concluídas,
> dentro do horizonte) em `public.itm_occurrences` via `utils/itm/occurrenceSync.ts`,
> com `notify_at` (48h antes) e e-mail já calculados. **Requer login** — sem conta o
> app não tem `user_id`/e-mail para mirar (e-mail 48h só vale com `EXPO_PUBLIC_AUTH_REQUIRED=1`
> ou usuário logado no Perfil).

### 4.1 Rodar as migrations novas (na sua máquina)
```bash
cd <pasta-do-projeto>
git pull origin claude/fix-apple-review-feedback-tto9g   # pega 0002 e 0003
supabase db push      # aplica 0002_itm_occurrences_sync.sql e 0003_cron_notify_48h.sql
```

### 4.2 Definir os segredos do worker (NÃO vão para o cliente)
Provedor de e-mail: **Brevo** (ex-Sendinblue). Pegue a API key em Brevo → SMTP & API → API Keys.
```bash
supabase secrets set BREVO_API_KEY=xkeysib-xxx
supabase secrets set NOTIFY_FROM_EMAIL="itm@seu-dominio.com" NOTIFY_FROM_NAME="FireSafe ITM"
# SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já existem no runtime das Edge Functions.
```
> O remetente (`NOTIFY_FROM_EMAIL`) precisa ser um **sender verificado** no Brevo
> (Senders, Domains & Dedicated IPs). Sem verificação, o envio é recusado.

### 4.3 Publicar a Edge Function
```bash
supabase functions deploy notify-48h
# teste manual:
supabase functions invoke notify-48h
```

### 4.4 Habilitar o cron (uma vez, no SQL Editor do Supabase)
A migration `0003` agenda o pg_cron, mas precisa dos segredos no **Vault** (não vão ao repo):
```sql
select vault.create_secret('COLE_A_SERVICE_ROLE_KEY', 'notify_48h_service_key');
select vault.create_secret('https://tbbnysvkfnoydjqxdnlc.supabase.co', 'project_url');
```
Depois reaplique a migration `0003` (ou rode o `cron.schedule` dela) e confira:
```sql
select jobname, schedule from cron.job where jobname = 'itm-notify-48h';
```

### 4.5 Provedor de e-mail — Brevo
A Edge Function usa a API transacional do Brevo (`POST https://api.brevo.com/v3/smtp/email`,
header `api-key`). Verifique o remetente/domínio no painel do Brevo antes de produção.
Plano gratuito do Brevo cobre o volume de lembretes ITM com folga.

### O que ainda falta de você
1. **`SUPABASE_SERVICE_ROLE_KEY`** — usado no Vault (4.4). Já está disponível no runtime da
   Edge Function automaticamente, então **não precisa** do `secrets set` para ela. **Não cole no repo.**
2. **`BREVO_API_KEY`** + remetente verificado (`NOTIFY_FROM_EMAIL`).

## 4-bis. Fase 7 — Feed .ics assinável (calendário que atualiza sozinho)

Duas Edge Functions:
- `manage-calendar-feed` (autenticada): o app gera/revoga o link do usuário.
- `calendar-feed` (**pública**, sem JWT): o Google/Apple/Outlook acessam a URL; a segurança
  é o token secreto na URL (guardamos só o hash em `calendar_feed_tokens`).

Deploy (na sua máquina, após `git pull`):
```bash
supabase functions deploy manage-calendar-feed
supabase functions deploy calendar-feed --no-verify-jwt
```
> O `--no-verify-jwt` (ou `[functions.calendar-feed] verify_jwt=false` no `config.toml`,
> já incluído) é obrigatório: apps de calendário não enviam JWT do Supabase.

Uso no app: **Perfil → Notificações e Calendário → Calendário assinável → Gerar link**
(requer login). Copie o link e "assine" no Google Calendar (Outros calendários → Por URL),
Apple (Arquivo → Nova assinatura de calendário) ou Outlook (Adicionar → Da internet).

## 4-ter. Fase 9 — Resumo diário + retries + auditoria

- **Resumo diário**: Edge Function `daily-summary` agrupa vencidas + a vencer por
  propriedade/sistema e manda 1 e-mail/dia (só para quem ativou em Preferências).
- **Retries**: o `notify-48h` reenvia falhas a cada hora até `MAX_RETRIES=3` e então desiste
  (tudo registrado em `notification_logs.retry_count` / `last_attempt_at`).
- **Auditoria**: `notification_logs` guarda status, erro, tentativas e horário de cada envio.
- **Preferências no servidor**: o app agora espelha `user_notification_preferences`
  (necessário para o resumo diário saber quem quer receber).

Deploy:
```bash
supabase db push      # aplica 0004 (colunas de retry + cron diário 09:00 UTC)
supabase functions deploy daily-summary
supabase functions deploy notify-48h    # redeploy com retry cap
```
O cron diário (`itm-daily-summary`, `0 9 * * *`) reaproveita os segredos do Vault já criados.
Confira: `select jobname, schedule from cron.job;`

## 4-quater. Fase 6 — Push remoto (Expo)

- O app registra o token de push em `user_push_tokens` quando o usuário liga "push" nas
  preferências (mobile + login). O `notify-48h` envia o push 48h junto com o e-mail.
- **Pré-requisito**: um **build EAS com `projectId`**. Sem ele o app só agenda o lembrete
  LOCAL (o push remoto ativa sozinho quando houver build). No web, push remoto não existe.

Para habilitar o push remoto:
1. `eas init` (ou defina `expo.extra.eas.projectId` no `app.json`).
2. Configure credenciais de push (Android FCM / iOS APNs) via EAS.
3. Gere um build (`eas build`) — daí o `getExpoPushTokenAsync` passa a retornar token.
4. Redeploy do worker: `supabase functions deploy notify-48h` (já tem o envio de push).

> O envio usa a Expo Push API (`https://exp.host/--/api/v2/push/send`), sem chave obrigatória.

## 4-quinquies. Fase 2A — Fundação multiempresa (companies + members + invites + RLS)

Migration `0005_multitenant_foundation.sql` cria:
- `companies`, `company_members` (owner/admin/supervisor/inspector/viewer), `company_invites`
- RLS: "só vejo dados de empresas onde sou membro ativo" (via função `user_company_ids()`, SECURITY DEFINER, sem recursão)
- RPCs: `create_company_with_owner(name, cnpj)` e `accept_company_invite(token)`

Aplicar (SQL Editor do Dashboard — como o `db push` é morto no seu Mac, cole o conteúdo
de `supabase/migrations/0005_multitenant_foundation.sql`). É idempotente.

> Fase 2B (próxima): onboarding (criar/aceitar empresa) + tela de membros + convite por
> e-mail (Brevo). Fase 2C: migrar entidades operacionais para o Supabase com `company_id`.

## 4-sexies. Fase 2C — Dados operacionais por empresa (sync local-first)

Migration `0006_company_data.sql`: tabela `company_data` (JSONB por empresa+coleção) + RLS.
- **PUSH**: `scopedStorage` dispara um write hook ao salvar uma coleção sob escopo de
  empresa → espelha em `company_data` (debounce 800ms).
- **PULL**: ao ativar/trocar empresa, baixa `company_data` e hidrata o local.
- **Escopo**: com empresa ativa, o storage local usa `::c:<companyId>` (membros
  compartilham); sem empresa, `::u:<userId>`; deslogado, `::u:guest`.
- **Seed**: ao criar empresa, os dados locais do dono são levados para a empresa nova.
- Aplicada automaticamente pela GitHub Action (nada manual).

> **Limitação conhecida (follow-up)**: a resolução de conflito é por COLEÇÃO
> (last-write-wins), não por registro. Para multiusuário simultâneo intenso, uma
> fase futura pode trocar para tabelas relacionais por entidade + merge por registro.

## 4-septies. Fase 2D — Arquivos por empresa (Storage privado) — FUNDAÇÃO

Migration `0007_company_storage.sql`: bucket privado `company-files` + RLS no
`storage.objects` (path `<companyId>/...`; só membros acessam). Util `utils/companyStorage.ts`:
`uploadCompanyBase64()`, `getCompanyFileUrl()` (URL assinada), `removeCompanyFile()`.

> **Pendente (integração guiada)**: religar o pipeline de fotos para subir ao bucket e
> guardar só o path (em vez de base64 embutido na inspeção). Isso enxuga o `company_data`
> e dá controle de acesso real aos binários. Tocar em captura/preview/PDF exige testes
> com o app rodando — fazer como próximo passo guiado.

## 5. Habilitar login obrigatório (multiempresa) — quando quiser
1. Criar usuários (Auth) e a tabela `profiles` ligando `auth.uid()` → empresa/tenant.
2. Definir `EXPO_PUBLIC_AUTH_REQUIRED=1` no `vercel.json`/env.
3. A partir daí o app exige login (tela já existente).

## 6. Status atual
- Cliente conecta ao Supabase ✅
- Login opcional (não bloqueia testes) ✅
- Tabelas de notificação (0001): **aplicadas** (`db push`) ✅
- Espelho de ocorrências + cron (0002/0003) e Edge Function `notify-48h` (Brevo): **ativos** ✅
- Fase 7 (feed .ics assinável): código pronto — falta `functions deploy` de `manage-calendar-feed`
  e `calendar-feed --no-verify-jwt` ⏳
- Fase 9 (resumo diário + retries + auditoria): código pronto — falta `db push` (0004) +
  `functions deploy daily-summary` e redeploy do `notify-48h` ⏳
- Fase 6 (push remoto Expo): código pronto — ativa quando houver build EAS com projectId ⏳
- Google / Outlook (Fase 8): próxima fase ⏳
