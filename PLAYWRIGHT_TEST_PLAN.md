# Plano de Testes Playwright — Google Play / FireSafe ITM

## Escopo

Playwright valida o build Expo web responsivo como smoke test complementar. Não valida Manifest/AAB, diálogos nativos, câmera física, notificações, botão Back, share sheet, PDF nativo ou políticas preenchidas no Play Console.

## Matriz

| Projeto | Viewport | Resultado da reauditoria |
|---|---|---|
| `pixel-5-compliance` | Pixel 5 | aprovado |
| `galaxy-s9-compliance` | 360×740 | aprovado |
| `android-tablet-compliance` | 800×1280 | aprovado |

## Resultado em 22/06/2026

| Métrica | Resultado |
|---|---|
| Passou | **19** |
| Ignorado | **2** |
| Falhou | **0** |

Os dois testes ignorados são:

- exclusão de conta autenticada, indisponível no servidor guest usado pela suíte;
- política antes da criação de conta, ainda marcada como requisito pendente.

Foram aprovados carga inicial, navegação nas abas, links legais presentes na UI local, disclaimer, responsividade, ausência de overflow relevante e degradação offline nas três dimensões.

## Comando reproduzido

```bash
EXPO_PUBLIC_AUTH_REQUIRED=0 node node_modules/expo/bin/cli start --web --port 19006
E2E_PORT=19006 node node_modules/@playwright/test/cli.js test \
  --project=pixel-5-compliance \
  --project=galaxy-s9-compliance \
  --project=android-tablet-compliance \
  --reporter=list
```

## Próximos testes obrigatórios

- executar a exclusão autenticada após o deploy da Edge Function;
- confirmar que cada link abre conteúdo legal público real, não apenas uma rota SPA com HTTP 200;
- validar login, logout, sessão expirada e isolamento com dois tenants;
- testar localização granted/denied após implementar o disclosure;
- executar testes Android nativos do AAB final e o Pre-launch report.

## Critério de saída

- zero falha nos fluxos P0/P1;
- zero erro de página/console não justificado;
- nenhuma tela branca ou overflow bloqueante;
- nenhum teste P0 ignorado;
- testes de dois tenants aprovados;
- Pre-launch report do AAB final sem crash/ANR crítico.
