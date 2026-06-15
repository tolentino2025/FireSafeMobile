# Módulo de Agendamento (Agenda ITM) — Relatório de Lógica

Documento técnico-resumido para análise externa. App: **FireSafe ITM** (React Native / Expo), inspeções NFPA 25.
Objetivo do módulo: gerar automaticamente a agenda de Inspeção, Teste e Manutenção (ITM) de uma propriedade, conforme as frequências da NFPA 25.

---

## 1. Visão geral do fluxo

```
Plano (propriedade + data início + sistemas escolhidos)
   └─ para cada SISTEMA escolhido
        └─ para cada TEMPLATE daquele sistema (atividade × frequência)
             └─ MOTOR gera as datas de vencimento (recorrência)
                  └─ Ocorrências (tarefas datadas) salvas localmente
```

Navegação em 3 níveis:
`Planos → Sistemas do plano → Agendamentos do sistema (com filtros)`

---

## 2. Componentes principais (arquivos)

| Camada | Arquivo | Papel |
|---|---|---|
| Motor (puro) | `server/scheduler/engine.ts` | Gera datas de recorrência (drift-safe) |
| Camada do app | `utils/itm/scheduler.ts` | Liga o motor aos templates do plano |
| Classificação | `utils/itm/agenda.ts` | Status (vencida/próxima/futura/concluída) + contadores |
| Estado/persistência | `contexts/ITMContext.tsx` | CRUD de planos/ocorrências (AsyncStorage) + sync |
| Templates | `constants/itmTemplates.ts` | 100 templates derivados da NFPA 25 |
| Rótulos | `utils/itm/labels.ts` | Nomes de sistemas e frequências (PT/EN) |

---

## 3. Modelo de dados

**Template** (atividade padrão de um sistema):
```
{ key, system, activity, frequency, intervalUnit, intervalCount, descriptionPt, descriptionEn, normativeRef }
```
- `system`: ex. `wet_pipe`, `fire_pump`, `water_storage_tank`
- `activity`: `inspection` | `test` | `maintenance`
- `frequency`: `weekly|monthly|quarterly|semiannual|annual|3year|5year|daily`
- `intervalUnit`+`intervalCount`: o intervalo de recorrência (ex.: `month` × 1 = mensal; `year` × 5 = quinquenal)

**Plano**:
```
{ id, assetId (propriedade), propertyName, startDate (YYYY-MM-DD), systemKeys[], normativeProfile:"nfpa25", createdAt }
```

**Ocorrência** (tarefa datada gerada):
```
{ id, planId, templateKey, system, activity, frequency, description,
  dueDate, scheduledDate, windowStart, windowEnd, status,
  completedAt?, result?, note?, completedBy? }
```
- `id` determinístico = `${planId}:${templateKey}:${dueDate}` (garante idempotência).

---

## 4. Lógica do MOTOR (recorrência) — `engine.ts`

Princípio central: **drift-safe**. Cada vencimento é calculado a partir da **âncora teórica** (data de início), nunca acumulando um "cursor". Isso evita erros de deriva (ex.: fim de mês).

```
due(n) = addInterval(startDate, unit, count * n)
```
- `n` começa em 1 (a 1ª ocorrência é início + 1 intervalo). [Decisão de design — ver §6]
- Gera enquanto `due(n) <= horizonte`.
- `scheduledDate` = `due` ajustado para **dia útil** (pula sábado/domingo/feriados).
- `windowStart`/`windowEnd` = janela de tolerância em torno do vencimento (padrão 0 dias).

Usa `date-fns` (`addDays/Weeks/Months/Years`). Datas trafegam como string `YYYY-MM-DD`.

---

## 5. Camada do app — `utils/itm/scheduler.ts`

`gerarAgendaDoPlano(plano, templates, opts)`:
1. Filtra os templates cujo `system` está em `plano.systemKeys`.
2. Para cada template, chama o motor com `startDate` do plano e o intervalo do template.
3. **Horizonte padrão = hoje + 12 meses.**
4. **Garantia de atividades longas:** se um template (ex.: quinquenal) não produzir nenhuma ocorrência dentro do horizonte, gera **pelo menos a 1ª ocorrência futura** para não "sumir" da agenda.
5. Monta as ocorrências achatadas (com `id` determinístico) e ordena por `dueDate`.

---

## 6. Decisão de datas (correção importante aplicada)

- **Antes (bug):** `firstDueIsStart = true` → TODAS as atividades caíam na **mesma data de início** (semanal, mensal, anual, quinquenal no dia 15/06, por ex.).
- **Agora:** `firstDueIsStart = false` → a 1ª ocorrência é **início + 1 intervalo**.
  - Ex. início 15/06/2026: mensal→15/07, semestral→15/12, anual→15/06/2027, quinquenal→15/06/2031.

---

## 7. Status e contadores — `utils/itm/agenda.ts`

Status calculado **na leitura** (não armazenado), comparando com a data de hoje:
- `completed`: tem `completedAt`
- `overdue` (vencida): `windowEnd < hoje` e não concluída
- `due_soon` (próxima): vence em ≤ 30 dias
- `future` (futura): vence em > 30 dias

`resumir(ocorrencias)` → `{ total, vencidas, proximas, futuras, concluidas, proximoVencimento, ultimaConclusao }`.
`statusGeral(resumo)` → `em_dia | com_pendencias | vencido | sem_agenda` (usado nos cards).
`resumirPorSistema(ocorrencias)` → agrega por sistema (nível 2 da navegação).

**Correção de contagem:** antes contava TODAS as não-concluídas do horizonte (milhares); agora separa vencidas / próximas 30d / futuras.

---

## 8. Persistência e ciclo de vida — `contexts/ITMContext.tsx`

- Armazenamento local (offline-first) via AsyncStorage:
  - `@firesafe_itm_plans`, `@firesafe_itm_occurrences`, `@firesafe_itm_version`
- Ações: `criarPlano`, `removerPlano`, `concluirOcorrencia(id, dados)`, `reabrirOcorrencia`, `regenerarAgenda`.
- **Idempotência:** ao (re)gerar, preserva conclusões existentes pelo `id` determinístico.
- **Migração v2:** planos criados com a lógica antiga (datas erradas) são regenerados automaticamente no carregamento, preservando conclusões.
- **Sincronização:** ao criar plano/concluir ocorrência, enfileira para sync (`utils/syncService.ts`) e tenta sincronizar quando online (Postgres no servidor). Funciona offline; sincroniza depois.

---

## 9. Conclusão de tarefa

`concluirOcorrencia(id, { completedAt, result, note, completedBy })`:
- `result`: `approved | nonconforming | pending`
- Marca `status=completed` e grava os dados. A próxima ocorrência da série **já existe** (foi pré-gerada no horizonte), então a recorrência continua naturalmente.
- `reabrirOcorrencia(id)` volta a tarefa para agendada.

---

## 10. Origem normativa dos templates

- Documento NFPA 25 (eForms) → 1005 itens "golden" com IDs estáveis.
- Agregados por (sistema × atividade × frequência) → **100 templates** práticos (`constants/itmTemplates.ts`).
- Cada template referencia os IDs golden de origem (`sourceRef`) e a referência normativa.

---

## 11. Pontos em aberto / limitações conhecidas

- Horizonte fixo de 12 meses (atividades > 12 meses registram só a 1ª futura).
- Tolerância (`toleranceDays`) e feriados são parametrizáveis, mas hoje usam padrão (0 dias / sem feriados).
- Multiempresa/RLS e fila de sync robusta dependem do backend (Supabase) — estrutura pronta, ativação pendente.
- Vínculo da tarefa ITM com o formulário de inspeção executado (`inspectionId`) existe no modelo, mas o fluxo "abrir inspeção a partir da tarefa" ainda não está conectado.

---

## 12. Resumo em uma frase

O módulo gera, **de forma determinística e idempotente**, as datas de ITM de cada atividade NFPA 25 dos sistemas escolhidos num plano (recorrência drift-safe a partir da data de início, horizonte de 12 meses + garantia das atividades longas), classifica cada tarefa por status na leitura, e persiste tudo offline-first com sincronização posterior.
