# Plano — Notificações e Integração de Calendário ITM

Plano de implementação faseado, **ancorado no estado real do projeto**. Não implementa nada ainda; serve para análise/decisão.

---

## 1. Diagnóstico do estado atual (auditoria)

| Área | Estado hoje | Impacto no plano |
|---|---|---|
| **Ocorrências ITM** | Geradas client-side, persistidas em **AsyncStorage** (`contexts/ITMContext.tsx`); espelhadas no Postgres via `server/scheduler/schema.ts` (`itm_occurrences`) | Datas são **`date` (YYYY-MM-DD), sem hora, sem `notify_at`, sem timezone** |
| **Backend** | Express (`server/index.js`) + Postgres do Replit (`DATABASE_URL`). Tem rotas `/api/itm/*` e `/api/sync`. **Sem cron, sem fila de jobs** | Precisa de scheduler (cron) para e-mail/push 48h |
| **E-mail** | **Inexistente no servidor** (sem nodemailer/SendGrid/Resend). Cliente tem `expo-mail-composer` (abre o app de e-mail do usuário — não automatizável) | Fase 1 (e-mail 48h) exige adicionar provedor de e-mail no backend |
| **Push** | `expo-notifications` instalado; `utils/notifications.ts` faz **notificações LOCAIS** (agendadas no aparelho). **Sem push remoto** (sem `expo-server-sdk`, sem tabela de tokens) | Push remoto é trabalho novo; push **local** 48h é viável já |
| **Supabase / Auth** | `server/supabase/schema.sql` existe (tenants, profiles, companies, inspections, audit_log…) mas **NÃO está deployado nem configurado** (env vazias). `AuthContext` em modo degradado | **Bloqueador**: sem auth/Supabase ativo não há `user_id`/`company_id` reais para mirar e-mail/push por usuário nem RLS |
| **Sync** | `utils/syncService.ts` (fila offline) + `/api/sync` | Reaproveitável para enfileirar preferências/tokens |
| **Multiempresa/RLS** | Definidos no `schema.sql`, **não ativos** | RLS só vale após Supabase ativo |
| **Deploy** | App web no Vercel (estático). Servidor Express roda separado (Replit) | Cron pode ser Vercel Cron, Replit, ou Supabase Edge + cron |

### Conclusão da auditoria
O documento assume um backend com Supabase/Auth/RLS e jobs agendados — **a maior parte ainda não existe**. O que dá para fazer **sem dependências** hoje: **`.ics` (export + feed)**, **notificações locais no mobile** e a **tela de preferências + schema**. E-mail/push remoto/Google/Outlook dependem de **Supabase + Auth + um worker com cron + provedor de e-mail**.

---

## 2. Dependência crítica (caminho)

```
Supabase ativo (URL+keys) + Auth (login real) + RLS
        │
        ├─ user_id / company_id reais  → e-mail por usuário, push, multiempresa
        ├─ tabelas de preferências/logs/tokens/feed
        └─ worker com cron (process-itm-notifications)
```

**Sem isso**, "e-mail 48h por usuário" não tem como mirar destinatário/empresa corretamente. Por isso o plano abaixo **reordena** as fases para entregar valor antes do Supabase, e deixa e-mail/push para depois do Supabase ativo.

---

## 3. Plano faseado (reordenado para a realidade do projeto)

### FASE 0 — Fundação de dados/tempo (pré-requisito barato)
- Adicionar campos de **data/hora** ao modelo de ocorrência (cliente + `itm_occurrences`):
  `scheduledStartAt` (timestamptz), `scheduledEndAt`, `timezone`, `notify48hAt`.
- Regra: `due_date` continua oficial; se não houver hora, padrão **08:00–09:00 `America/Sao_Paulo`**.
- Migration aditiva (não quebra dados existentes).
- **Risco baixo. Sem dependência externa.**

### FASE 1 (reordenada) — `.ics` universal ⭐ *prioridade imediata*
- Gerar arquivo **`.ics`** client-side a partir das ocorrências do plano/propriedade/sistema, dentro de um horizonte (30/60/90 dias, padrão 90).
- Botão **"Adicionar ao calendário / Baixar .ics"** na tela da Agenda.
- Cada evento: título `ITM — [Atividade] — [Sistema]`, descrição com propriedade/sistema/periodicidade/vencimento/deep link, **lembrete 48h antes** (`VALARM`).
- **Funciona em web, iOS, Android, Outlook, Google, Apple** sem backend.
- **Risco baixo. Entrega valor já. Sem Supabase.**

### FASE 2 — Notificações LOCAIS no mobile (complementar)
- Usar `expo-notifications` (já presente) para agendar lembrete **48h antes** no aparelho ao criar/abrir a Agenda.
- Reaproveita `utils/notifications.ts`.
- Não cobre web nem e-mail, mas é grátis e offline.
- **Risco baixo–médio.**

### FASE 3 — Tela "Perfil > Notificações e Calendário" + schema de preferências
- Tela com toggles: e-mail 48h, push, resumo diário, aviso de vencidos, sincronizar calendário; fuso horário; horário/duração padrão; horizonte (30/60/90).
- Tabela `user_notification_preferences` (schema pronto no MD).
- **Persistência local agora; sincroniza quando o Supabase entrar.**
- **Risco baixo.**

### --- a partir daqui exige Supabase + Auth ativos ---

### FASE 4 — Ativar Supabase + Auth + RLS (bloqueador habilitador)
- Criar projeto Supabase, preencher env, rodar `schema.sql` + novas tabelas (preferências, logs, push tokens, feed tokens, conexões de calendário, eventos).
- Ativar login real (já há `AuthContext`).
- RLS por `company_id`/`user_id` em todas as tabelas novas.
- **Pré-requisito de tudo abaixo. Risco médio.**

### FASE 5 — Worker + E-mail 48h (a peça central do MD)
- Provedor de e-mail no backend (recomendado **Resend** ou **SendGrid** via API — simples, sem SMTP).
- Rotina **`process-itm-notifications`** a cada 15–30 min: busca ocorrências com `notify48hAt` na janela, não concluídas/canceladas, respeita preferências, envia e-mail, grava `notification_logs` (idempotência `unique(user_id, occurrence_id, channel, offset_minutes)`).
- Onde rodar o cron: **Vercel Cron** (se o servidor for para Vercel) ou **Supabase Edge Function + pg_cron**. Decisão na Fase 4.
- **Risco médio–alto (infra). Núcleo do pedido.**

### FASE 6 — Push remoto (Expo) + tabela de tokens
- `expo-server-sdk` no backend; `user_push_tokens`; app registra token (com `user_id`+`company_id`).
- Push complementar ao e-mail, na mesma rotina.
- **Risco médio.**

### FASE 7 — Feed `.ics` assinável (servidor)
- Endpoint `…/calendar-feed/[token].ics` + `calendar_feed_tokens` (hash, revogável, horizonte, por usuário/empresa).
- Permite "assinar" a agenda (atualiza sozinho), além do download da Fase 1.
- **Risco médio.**

### FASE 8 — Google Calendar (OAuth) → depois Outlook/Graph → depois Apple/Android local
- `user_calendar_connections` + `itm_calendar_events`, tokens **criptografados**, sync por horizonte, sem importar de volta.
- Apple/Android local via API do dispositivo (complementar; `.ics` é o universal).
- **Risco alto / esforço grande. Fases finais.**

### FASE 9 — Resumo diário + auditoria + tratamento de falhas
- `daily-itm-summary` (agrupa por propriedade/sistema), retries, `requires_reconnect`, eventos de auditoria.

---

## 4. Resumo de prioridade recomendada

```
0. Campos de data/hora (notify_at, timezone)         [barato, sem dependência]
1. .ics universal (download)                          [⭐ valor imediato, sem backend]
2. Notificações locais mobile                         [grátis, offline]
3. Tela de preferências + schema                      [UI + estrutura]
── precisa Supabase+Auth ──
4. Ativar Supabase + Auth + RLS                       [habilitador]
5. Worker cron + e-mail 48h + logs                    [núcleo do MD]
6. Push remoto Expo                                   [complementar]
7. Feed .ics assinável                                [conveniência]
8. Google → Outlook → Apple/Android                   [integrações OAuth]
9. Resumo diário + auditoria + retries                [robustez]
```

O MD diz que a prioridade é "e-mail 48h + preferências + logs + .ics". Dessas, **`.ics` e preferências (UI)** são entregáveis **já**; **e-mail 48h + logs** dependem de Supabase/Auth + worker (Fase 4–5).

---

## 5. Restrições respeitadas (do MD)
- App continua a **fonte oficial** da agenda; calendário externo só recebe.
- Não quebrar a Agenda ITM atual; migrations **aditivas**; nada apagado.
- Sem integração externa sem consentimento; tokens OAuth criptografados; RLS no backend (não só no front).
- Offline-first preservado (preferências/locais funcionam offline; e-mail/push entram quando online + Supabase).

---

## 6. Decisões que dependem de você
1. **Quando ativar o Supabase?** É o bloqueador de e-mail/push/multiempresa. Sem ele, só dá Fases 0–3.
2. **Onde rodar o cron** do worker (Vercel Cron vs Supabase Edge+pg_cron vs servidor Replit)?
3. **Provedor de e-mail** (recomendo **Resend** — API simples; alternativa SendGrid).
4. **Começar pela Fase 1 (.ics)** agora (entrega imediata, zero dependência) enquanto o Supabase não está pronto?

---

## 7. Riscos conhecidos
- Sem Supabase/Auth, "por usuário/empresa" não é confiável — risco de mandar e-mail errado. Por isso e-mail fica após Fase 4.
- Ocorrências hoje vivem majoritariamente no **dispositivo** (AsyncStorage). Para um worker de servidor enviar e-mail, as ocorrências precisam estar **no servidor** (sync confiável) — reforço necessário na Fase 4/5.
- Cron em web estático (Vercel) exige Vercel Cron (serverless) — o Express atual do Replit é um processo separado; definir a topologia na Fase 4.
