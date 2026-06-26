# Relatório de Auditoria Técnica — FireSafe ITM

Data: 24/06/2026 · Modo: diagnóstico (sem alterar código de produção) · Método: 5 auditorias paralelas read-only (frontend/UX/i18n, auth/permissões/multitenancy, dados/Supabase/sync, PDF/relatórios, segurança/qualidade). Todos os bugs com evidência `arquivo:linha`.

## 1. Resumo executivo

- **Apto para produção agora? NÃO para multiusuário/multiempresa.** Para uso single-user offline, a maioria dos riscos não dispara, mas há **2 bloqueios P0 reais no caminho de produção** (exclusão de conta quebrada e escalonamento de privilégio via RLS) e vários **P1 de perda de dados** no sync `company_data`.
- **Total de achados:** 59 brutos → ~40 distintos (o cluster do servidor Express, ~8 achados, é **dev-only** e colapsa em 1 grupo condicional).

### Contagem por severidade (distintos, caminho de produção)
| Severidade | Qtde | Observação |
|---|---|---|
| **P0 Crítico** | 2 | exclusão de conta incompleta; escalonamento de privilégio RLS |
| **P1 Alto** | 7 | perda de dados no sync; assinatura ausente no PDF; OOM de fotos no PDF |
| **P2 Médio** | ~16 | RLS de papel, formatação PDF, i18n, ocorrências órfãs, validações |
| **P3 Baixo** | ~13 | qualidade, web-only, time picker, NaN guards |
| **Condicional** | ~8 | servidor Express — **só vira P0 se for deployado** (hoje não está) |

### Top 10 correções mais urgentes
1. **P0 — `delete-account` apaga tabelas erradas e deixa `company_data` + Storage órfãos** (`supabase/functions/delete-account/index.ts:19-25`). Viola LGPD/Play. **É a função que acabamos de deployar.**
2. **P0 — Escalonamento de privilégio: admin pode se promover a owner** (`supabase/migrations/0005_multitenant_foundation.sql:110-114`, `members_write`).
3. **P1 — Sync `company_data` ignora erro do upsert (falha silenciosa)** (`utils/itm/companyDataSync.ts:96-108`) → membros não veem alterações, sem aviso.
4. **P1 — Last-write-wins sobrescreve a coleção inteira** (`companyDataSync.ts:96-105`) → inspeção de um membro some quando outro empurra.
5. **P1 — `pullCompanyData` destrutivo descarta escritas offline** (`companyDataSync.ts:154-172`) → perde dados criados offline (contradiz "offline-first").
6. **P1 — PDF sai SEM seção de assinatura quando não assinado** (`utils/pdfGenerator.ts:395-444`) → laudo inválido.
7. **P1 — Falha de upload de foto deixa base64 no JSONB / push da coleção falha** (`companyDataSync.ts:46-61`, `utils/companyStorage.ts:34-37`).
8. **P1 — PDF converte TODAS as fotos a base64 em memória** (`utils/pdfGenerator.ts:753-764`) → OOM em inspeções com muitas fotos.
9. **P2 — RLS permite `viewer` sobrescrever/apagar tudo da empresa** (`0006_company_data.sql:21-27`, `0005:98-102 companies_update`).
10. **P2 — Datas no PDF não são DD/MM/AAAA + frequências "semiannually/three_years" cruas em inglês** (`pdfGenerator.ts:57-64,188-195,257-264`).

### Riscos de colocar em produção agora
- **Compliance/LGPD:** exclusão de conta não apaga os dados reais (gate do Google que marcamos como concluído está, na prática, **não funcional**).
- **Perda de dados em equipe:** três caminhos de sync (`company_data`) podem perder/sobrescrever inspeções entre membros e descartar trabalho offline — silenciosamente.
- **Segurança multiusuário:** um `admin` toma a empresa (vira owner); um `viewer` pode zerar dados (RLS sem papel em `company_data`).
- **Documento técnico:** laudo pode sair sem assinatura; datas/frequências fora do padrão BR.
- **Notificações:** e-mails 48h para tarefas já removidas (ocorrências órfãs).
- **Dev-only (não bloqueia hoje):** servidor Express tem auth fail-open, rotas sem tenant e segredo hardcoded — **só é risco se for deployado** (não está no build da Vercel/EAS).

### Plano de correção (ordem recomendada)
1. **P0 compliance:** reescrever `delete-account` (tabelas reais + `company_data` + Storage). Reimplantar e testar com conta descartável.
2. **P0 segurança:** corrigir RLS `members_write` (sem auto-promoção; admin não mexe em owner) e `companies_update`/`company_data` por papel.
3. **P1 dados:** no sync `company_data` — checar `error` do upsert + retry; pull com merge por id; resolver upload de foto antes de persistir path.
4. **P1 PDF:** sempre renderizar a seção de assinatura (linha de assinatura quando não houver imagem); comprimir fotos antes do base64.
5. **P2:** datas DD/MM/AAAA + frequências faltantes; ocorrências órfãs no delete/regenerar plano; i18n (telas PT-BR com inglês); mensagem de erro de save; validação de e-mail no login.
6. **P3 / dev-only:** servidor Express (desativar ou proteger); qualidade (componentes grandes, `any`); npm audit fix.

### Checklist final pós-correção
- [ ] `delete-account` apaga 100% dos dados (teste de integração com seed completo → contagens zero + bucket vazio).
- [ ] Teste de RLS por papel: admin não vira owner; viewer não edita empresa nem apaga `company_data`.
- [ ] Teste de sync concorrente (2 membros): nenhuma inspeção some; offline preservado após pull.
- [ ] PDF: assinatura sempre presente; datas DD/MM/AAAA; frequências traduzidas; carga de 50 fotos sem OOM.
- [ ] Remoção de plano não dispara e-mail 48h para ocorrências inexistentes.
- [ ] Telas e PDF sem texto em inglês no modo PT-BR.
- [ ] `npm run lint` e `tsc --noEmit` limpos nos arquivos tocados; Playwright dos fluxos P0/P1 verde.

---

## 2. Bugs detalhados por área

> Severidade entre parênteses. "Condicional" = depende do servidor Express ser deployado (hoje não é — `vercel.json` não define `EXPO_PUBLIC_API_URL`; `utils/syncService.ts:7` fica vazio).

### A) Dados, Supabase, Sync (mais crítico)
- **(P0) delete-account apaga tabelas inexistentes e deixa órfãos** — `supabase/functions/delete-account/index.ts:19-25,46-58`. Lista usa `notification_settings`/`calendar_feeds` (não existem); reais: `user_notification_preferences`, `notification_logs`, `user_calendar_connections`, `itm_calendar_events`, `calendar_feed_tokens`. Não apaga `company_data` (todas as inspeções/fotos-paths em JSONB) nem o bucket `company-files`. Erros engolidos (best-effort). **Correção:** lista correta + apagar `company_data` das empresas onde é owner único + `storage.remove` por `<companyId>/` + `deleteUser`.
- **(P1) Upsert do sync sem checar erro** — `utils/itm/companyDataSync.ts:96-108`. supabase-js retorna `{error}` sem lançar; falha (RLS/rede/payload) é descartada. **Correção:** checar `error`, logar, reenfileirar.
- **(P1) Last-write-wins por coleção inteira** — `companyDataSync.ts:96-105` + modelo `0006_company_data.sql:7-15`. Sem merge/`updated_at` guard; o último push sobrescreve o array todo. **Correção:** pull→merge-por-id→push, ou granularidade por item, ou RPC de merge.
- **(P1) Pull destrutivo descarta offline** — `companyDataSync.ts:154-172` (`setItemRaw`). **Correção:** merge por id preservando local mais novo/ausente no servidor.
- **(P1) Upload de foto falho deixa base64 no JSONB / push da coleção falha** — `companyDataSync.ts:46-61`, `utils/companyStorage.ts:34-37`. `uploadCompanyBase64` engole erro e retorna null; sem retry por foto. **Correção:** abortar/reagendar push em falha; fila de fotos pendentes; nunca enviar base64 ao `company_data`.
- **(P1) seedCompanyFromUserScope pode sobrescrever empresa populada** — `companyDataSync.ts:125-151`, `contexts/CompanyContext.tsx:207-214` (suspeita técnica; suspender write hook durante `createCompany`).
- **(P2) ocorrências ITM órfãs → e-mail 48h indevido** — `utils/itm/occurrenceSync.ts:40-92`; `removerPlano`/`regenerarAgenda` (`ITMContext.tsx:285-290,337-350`) só fazem upsert, nunca delete. **Correção:** deletar/`completed_at` as removidas.
- **(P2) deletes não propagam (ressurreição)** — `InspectionContext.tsx:693-704` etc.; combinado com pull destrutivo e lost-update. **Correção:** tombstones/delete server-side; push imediato pós-delete.
- **(P2) RLS `company_data`/Storage sem papel: viewer apaga tudo** — `0006_company_data.sql:21-27`, `0007_company_storage.sql:11-40`. **Correção:** `select` para todos, `insert/update/delete` só papéis de edição (`user_role_in`).
- **(P3) versionamento de migração local re-migra dados v3** — `InspectionContext.tsx:530-555` (suspeita técnica).
- **(P2) mismatch de chaves cliente/servidor sync e cobertura incompleta** — `utils/syncService.ts:12-19` vs `OPERATIONAL_KEYS` (faltam 7 coleções). Condicional/legado.

### B) Autenticação, permissões, multitenancy
- **(P0) Escalonamento de privilégio `members_write`** — `0005_multitenant_foundation.sql:110-114`. Admin pode `update role='owner'` na própria linha; pode mexer em owners. **Correção:** policies separadas; `user_id <> auth.uid()`; proteger owners; mover promoção para RPC SECURITY DEFINER.
- **(P2) `companies_update` permite qualquer membro (viewer) editar a empresa** — `0005:98-102`. **Correção:** `user_role_in in ('owner','admin')`.
- **(P2) Auth gate desligável por env pública / degradação silenciosa para guest** — `App.tsx:46-49`, `AuthContext.tsx:6,38`. Build com `EXPO_PUBLIC_AUTH_REQUIRED=0` ou sem Supabase libera o app sem login. **Correção:** ignorar a flag em produção; erro de config (não guest) se Supabase ausente em prod.
- **(P2) Race de logout / debounce de push usa companyId do flush** — `companyDataSync.ts:111-120`; `AuthContext.signOut` não cancela timers nem zera escopo síncrono. **Correção:** teardown no signOut; capturar companyId no momento da escrita.
- **(P3) Erros crus do Supabase / enumeração de contas** — `AuthContext.tsx:116,140,162,175`, `LoginScreen.tsx:64,87,120`. **Correção:** mensagens genéricas localizadas.
- **(Condicional/dev-only) Servidor Express:** rotas sem auth/tenant (`server/index.js:301-344,469-528`), `requireAuth` fail-open (`server/middleware/auth.js:9-15`), segredo de licença hardcoded (`server/index.js:67`), upload sem validação + CORS aberto + body 50mb (`server/index.js:8,9,346-377`), schema divergente `profiles.tenant_id` (`server/supabase/schema.sql`). **Hoje inerte** (não deployado). **Correção:** desativar/remover ou proteger antes de qualquer deploy.

### C) PDF / Relatórios
- **(P1) Seção de assinatura some quando não há imagem** — `utils/pdfGenerator.ts:395-444`. **Correção:** sempre renderizar o cartão com `.signature-line` + nome quando `signature` for null.
- **(P1) Todas as fotos a base64 em memória (OOM)** — `pdfGenerator.ts:753-764`, `utils/photoUtils.ts:11-34`. **Correção:** usar `imageCompressor` (resize ~1024px, q~0.6) antes do base64.
- **(P2) Datas pt-BR por extenso, não DD/MM/AAAA** — `pdfGenerator.ts:57-64,736`. **Correção:** `month:"2-digit"` ou reusar `formatShortDateWithTimezone`.
- **(P2) Frequências `semiannually`/`three_years` cruas em inglês** — `pdfGenerator.ts:188-195,257-264,284`. **Correção:** completar mapa `frequencies` nos 2 idiomas.
- **(P2) companyName/logo nunca repassados (cabeçalho fixo "FireSafe ITM")** — `InspectionDetailScreen.tsx:172-176`, `pdfGenerator.ts:281` (suspeita de intenção).
- **(P2) Header/title do PDF sem escape de HTML** — `utils/pdf/pdfLayout.ts:44-49,84`, `pdfGenerator.ts:740`. **Correção:** `sanitizeHtml` no header/title.
- **(P2) Exclusão de PSI pode esconder valores de pressão sem `unit==="psi"`** — `pdfGenerator.ts:301-315,344-353` (suspeita técnica).
- **(P3) Observações perdem quebras de linha** — `utils/pdf/pdfTheme.ts:156-162` (falta `white-space:pre-wrap`).
- **(P3) Cargo do acompanhante não passado** — `pdfGenerator.ts:424-430` (limitação de modelo).

### D) Frontend / UX / i18n
- **(P1, web-only) "Adicionar Foto" no-op na web** — `components/PhotoCapture.tsx:188-195` (Alert.alert 3 botões). Android nativo funciona; **na web** quebra. Idem `ChecklistItemPhoto.tsx:193-204` (bloqueia na web).
- **(P2) Diálogos multi-botão no-op na web** — notificações `ProfileScreen.tsx:163-181`; FM85A `InspectionDetailScreen.tsx:270-281`.
- **(P2) Strings em inglês em UI PT-BR** — `ProfileScreen.tsx:349,366,404,585`; `LoginScreen.tsx:101,105,109`; `DieselPerformanceTestScreen.tsx:508,619,1157,1163,1168`; `PropertyFormScreen.tsx:65,109,127`.
- **(P2) Mensagem de erro de save diz "erro ao compartilhar"** — reuso de `t.report.shareError` em ~10 telas (`CompanyFormScreen.tsx:67`, `InspectionFormScreen.tsx:438,499`, etc.). **Correção:** chave `t.common.saveError`.
- **(P2) Toque em item da agenda ignora o item** — `InspectionScheduleScreen.tsx:83-85` (`navigate("InspectionsList")` descartando `schedule`).
- **(P2) Sem validação de formato de e-mail no login** — `LoginScreen.tsx:100-118`.
- **(P2/suspeita) `isSubmittingRef` não resetado em erro → autosave para** — `DieselPerformanceTestScreen.tsx` (set ~543, catch ~623). Risco de perda de rascunho.
- **(P2/suspeita) Campos numéricos sem guard de NaN** — `FirePumpFormScreen.tsx:192-230`.
- **(P3) Excluir plano ITM só por long-press (não descobrível na web)** — `ITMPlansScreen.tsx:124`.
- **(P3) Badge "NFPA 25" fixo sobre card "FM Global"** — `NewInspectionScreen.tsx:139-141`.
- **(P3) TimePicker PT-BR fixo / fallbacks de idioma inconsistentes** — `TimePickerField.tsx:139,142`, etc.
- **(P3) `onSave` morto no FM85ASection** — `components/FM85ASection.tsx:46,51` (suspeita).

### E) Segurança / Qualidade
- **(P2) npm audit:** 40 vulnerabilidades (3 críticas, 11 high) — majoritariamente transitivas Expo/RN + dev (`ws`, `yaml`). `npm audit fix` resolve `ws`/`yaml`. Baixo no bundle do cliente.
- **(P2) `JSON.parse` sem try/catch** — `utils/syncService.ts:57` (um registro corrompido trava o sync).
- **(P3) Componentes/contextos >600 linhas + ~62 `any`** — `InspectionContext.tsx:1225`, performance test screens, etc.
- **Positivos verificados (sem bug):** sem segredos reais no cliente (só `EXPO_PUBLIC_*`/anon); PEMs commitados são públicos; sem logs de token/JWT/assinatura; Edge Functions `invite-member`/`calendar-feed` sólidas; RLS de `company_data`/storage privado corretos (exceto papel); AuthContext sem fail-open.
