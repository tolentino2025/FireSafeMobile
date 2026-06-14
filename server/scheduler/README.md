# Motor de Agendamento ITM (FireSafeITM)

Modulo backend isolado para agendamento de Inspecao, Teste e Manutencao (ITM)
conforme NFPA 25 (2019 eForms Handbook). Nao depende do app React Native nem de
outros projetos.

## Conceitos

- **Granularidade de data = dia.** Datas de dominio sao strings `YYYY-MM-DD`
  (colunas Postgres `date`, nunca `timestamptz`).
- **Drift-safe.** As datas teoricas (`dueDate`) sao sempre derivadas da ancora
  (`startDate`) via `addInterval(startDate, unit, count * n)`, nunca incrementando
  um cursor. Assim a sequencia mensal a partir de `2025-01-31` produz
  `2025-02-28, 2025-03-31, 2025-04-30, ...` sem perder o fim de mes.
- **Dia util.** `scheduledDate` ajusta `dueDate` para o proximo dia util (pula
  fim de semana e feriados), mas a sequencia teorica de `dueDate` permanece
  inalterada.
- **Idempotencia.** A constraint `unique(planId, templateId, dueDate)` e o
  `insertOccurrences` com `onConflictDoNothing` garantem que reconstruir o
  cronograma nunca duplica nem sobrescreve ocorrencias `completed`/`skipped`.

## Arquivos

- `schema.ts` — schema Drizzle (pg-core): enums + 3 tabelas.
- `migrations/` — migration Drizzle gerada (`drizzle-kit generate`).
- `engine.ts` — motor drift-safe (`addInterval`, `toBusinessDay`,
  `generateOccurrences` em `Date` e `gerarOcorrencias` em string).
- `rebuild.ts` — persistencia idempotente desacoplada por `deps`
  (`rebuildSchedule`, `executarJobDiario`, `aoConcluirOcorrencia`).
- `seed.nfpa25.ts` — gera os templates a partir do golden (`carregarSeedNfpa25`).
- `__tests__/` — testes do motor e de cobertura (Vitest).

## Como rodar

Instalar dependencias (devDependencies ja declaradas):

```bash
npm install
```

### Testes

```bash
npm test          # vitest run (inclui apenas server/** e scripts/**)
npm run test:watch
```

### Migration Drizzle

```bash
npx drizzle-kit generate   # le drizzle.config.ts -> server/scheduler/migrations
```

### Golden NFPA 25 (matriz de rastreabilidade)

O golden e gerado programaticamente a partir do parser do documento-fonte
(`docs/normas/nfpa25-eforms.md`), com IDs estaveis
`NFPA25-<SYSTEM>-<ACTIVITY>-<FREQUENCY>-<NNN>`:

```bash
npm run scheduler:golden   # tsx scripts/generate-golden.ts -> docs/normas/golden.nfpa25.yaml
```

Itens com `frequency=unknown` ou `activity=unknown` sao pulados (registrado no log).

### Relatorio de cobertura (gap analysis)

```bash
npm run scheduler:report   # tsx scripts/report.ts
```

Imprime cobertura total, % por sistema e listas de Faltando / Divergencia de
frequencia / Orfaos. Como o seed e derivado do golden, a cobertura e 100% e
sem divergencias por construcao.

## Integracao com Postgres

`rebuild.ts` e desacoplado via interface `SchedulerDeps`. Em producao, implemente
`deps` com Drizzle + `pg`; nos testes usa-se um repositorio em memoria. O
`insertOccurrences` deve usar `onConflictDoNothing` na constraint unique.
