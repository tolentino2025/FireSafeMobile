# Relatório de Conformidade Google Play — FireSafe ITM

- **Reauditoria:** 22/06/2026
- **App:** FireSafe ITM (`com.firesafe.itm`), Expo SDK 54 / React Native 0.81
- **Veredito:** **NÃO PUBLICAR AINDA**

## Resumo executivo

O app avançou: a UI local agora contém links de privacidade e termos, exclusão de conta, ressalva legal; o `versionCode` é 2; permissões desnecessárias foram bloqueadas; os testes unitários e os testes web mobile passam.

Ainda existem quatro gates técnicos/políticos antes do envio:

1. As três URLs legais públicas retornam HTTP 200, mas entregam somente o shell genérico do Expo, sem conteúdo dedicado de Política, Termos ou Exclusão.
2. A Edge Function `delete-account` existe no repositório, porém o endpoint de produção retorna **404 `NOT_FOUND`**. O fluxo autenticado de exclusão não pôde ser validado.
3. A localização precisa ainda é solicitada automaticamente ao abrir o formulário, sem disclosure destacado e ação explícita anterior ao prompt.
4. Não foi gerado e inspecionado um novo AAB desta revisão. A configuração resolvida do Expo ainda lista `RECORD_AUDIO` junto com `blockedPermissions`; somente o Manifest mesclado do AAB confirma a remoção efetiva.

Há ainda um gate condicional de segurança: o servidor Express possui rotas globais sem autenticação/tenant, autenticação fail-open e segredo fallback. Se `EXPO_PUBLIC_API_URL` estiver definido no build de produção ou esse servidor estiver implantado, isso é bloqueio crítico. É necessário provar que ele não participa da produção ou corrigi-lo.

Referências: [User Data](https://support.google.com/googleplay/android-developer/answer/10144311), [exclusão de conta](https://support.google.com/googleplay/android-developer/answer/13327111), [permissões](https://support.google.com/googleplay/android-developer/answer/9888170), [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469) e [target API](https://support.google.com/googleplay/android-developer/answer/11926878).

## Resultado por requisito

| Item | Estado | Evidência atual | Ação necessária |
|---|---|---|---|
| Package ID | ✅ | `com.firesafe.itm` | Confirmar propriedade no Console |
| Target API | ✅ Configuração | Expo SDK 54 resolve compile/target API 36; mínimo atual é 35 | Confirmar no AAB final |
| Versão | ✅ | `versionCode: 2`, versão `1.0.1` | Incrementar em cada upload |
| Formato AAB | ⚠️ | `eas.json` configura `app-bundle`; nenhum AAB novo foi analisado nesta revisão | Gerar o build final e inspecionar |
| Política/Termos no app | ✅ Local | Links em `ProfileScreen.tsx:466-476` | Manter |
| Páginas legais públicas | ❌ **Crítico** | URLs retornam o mesmo shell genérico; conteúdo legal não aparece no bundle implantado | Publicar páginas reais e revisar em navegador anônimo |
| Exclusão de conta in-app | ⚠️ | UI em `ProfileScreen.tsx:478-485`; função local implementada | Validar ponta a ponta autenticado |
| Exclusão de conta pública/backend | ❌ **Crítico** | endpoint Supabase de produção retorna 404 | Implantar a função e validar remoção/retensão |
| Permissões mínimas | ⚠️ | `blockedPermissions` correto, mas config resolvida ainda menciona `RECORD_AUDIO` | Conferir Manifest mesclado do AAB |
| Localização | ❌ **Alto** | `InspectionFormScreen.tsx:148` solicita no carregamento | Disclosure destacado + botão antes do prompt |
| Ressalva legal/NFPA | ✅ | Claim suavizado e disclaimer no modal Sobre | Informar edição/ano aplicável se fizer alegações normativas |
| Data safety/Data deletion | ⏳ | Play Console não acessado | Preencher e manter coerente com app/política |
| RLS/multitenancy | ⚠️ | Migrações contêm RLS; produção não foi testada com dois tenants | Testar dois usuários/empresas reais |
| Backend Express | ❌ se usado | rotas globais, auth fail-open, fallback secret | Não incluir em produção ou corrigir antes do build |
| Dependências | ❌ **Alto** | `npm audit --omit=dev`: 40 vulnerabilidades (3 críticas, 11 altas) | Atualizar ou documentar análise de explorabilidade |
| Lint | ❌ | 1303 ocorrências (1262 erros, 41 avisos), majoritariamente Prettier | Corrigir com mudanças controladas e CI |
| Compatibilidade Expo | ⚠️ | várias versões abaixo/acima das versões recomendadas pelo SDK 54 | Rodar `npx expo install --check` e alinhar |
| Store listing/acesso do revisor | ⏳ | Play Console não acessado | Screenshots, classificação, contato e credenciais de revisão |

## Permissões Android

`app.json` declara somente `CAMERA`, `VIBRATE` e `RECEIVE_BOOT_COMPLETED`, e bloqueia `RECORD_AUDIO`, storage legado e exact alarm. Isso é correto no fonte. Entretanto, `npx expo config --type public` ainda apresenta `RECORD_AUDIO` no conjunto resolvido, provavelmente introduzida por plugin, ao mesmo tempo em que a bloqueia. O gate é objetivo: gerar o AAB atual e verificar o Manifest mesclado. O artefato final não pode conter microfone, storage amplo ou exact alarm sem justificativa funcional/política.

A localização foreground é funcional, mas o momento do pedido está incorreto: ocorre em `useEffect`, antes de uma ação clara do usuário. O app deve explicar finalidade, armazenamento/uso e possibilidade de continuar sem acesso antes de abrir o diálogo Android.

## Privacidade e exclusão

URLs configuradas em `constants/legal.ts`:

- `https://fire-safe-mobile.vercel.app/privacidade`
- `https://fire-safe-mobile.vercel.app/termos`
- `https://fire-safe-mobile.vercel.app/excluir-conta`

As três responderam 200, mas o HTML e o JavaScript públicos não apresentam o conteúdo legal correspondente. Uma rota SPA que responde 200 não atende por si só: as páginas devem exibir conteúdo legível, público, não geobloqueado e específico.

`supabase/functions/delete-account/index.ts` usa o JWT do usuário e `service_role` no servidor, uma arquitetura adequada. Porém, a chamada sem autenticação ao endpoint publicado retornou 404, não 401; isso demonstra que a função ainda não está implantada nesse projeto. Após o deploy, testar com conta descartável: confirmação, sessão invalidada, dados apagados ou retidos conforme política, e impossibilidade de acesso posterior.

## Segurança

O caminho principal Supabase usa RLS nas migrações e storage privado com signed URLs. Isso precisa de teste em produção com dois tenants.

O servidor Express não pode ser considerado “dev-only” apenas por convenção. `utils/syncService.ts:7` ativa esse caminho quando `EXPO_PUBLIC_API_URL` existe. Antes do release, uma destas condições precisa ser comprovada:

- a variável está ausente do build de produção e o servidor não está implantado; ou
- todas as rotas exigem autenticação fail-closed, filtram tenant no servidor, não expõem erros internos e não possuem segredo fallback.

## Validações executadas

| Verificação | Resultado |
|---|---|
| `npm test -- --run` | ✅ 2 arquivos, 10 testes |
| Playwright em Pixel 5, Galaxy S9 e tablet | ✅ 19 passaram, 2 ignorados, 0 falhou |
| `npx expo config --type public` | ✅ configuração gerada; ambiguidade de `RECORD_AUDIO` registrada |
| URLs legais públicas | ❌ 200, porém shell genérico sem páginas legais efetivas |
| Edge Function pública | ❌ 404 `NOT_FOUND` |
| `npm audit --omit=dev` | ❌ 40 vulnerabilidades: 3 críticas, 11 altas, 24 moderadas, 2 baixas |
| `npm run lint` | ❌ 1262 erros e 41 avisos |

Os dois testes Playwright ignorados são deliberados: exclusão autenticada (modo guest) e política antes do cadastro. Playwright web não substitui teste nativo de permissões, câmera, notificações, Back, share/PDF, Manifest ou Pre-launch report.

## Gate de publicação

Só considerar o app pronto quando todos forem verdadeiros:

1. páginas públicas de privacidade, termos e exclusão exibem conteúdo real;
2. exclusão funciona ponta a ponta em uma conta autenticada de teste;
3. disclosure de localização antecede o prompt;
4. novo AAB foi gerado e seu Manifest não contém permissões indevidas;
5. backend Express foi excluído do caminho produtivo ou corrigido;
6. Data safety, Data deletion, App access e store listing foram revisados no Console;
7. RLS foi testado com dois tenants e o Pre-launch report não apresenta crash/ANR crítico;
8. vulnerabilidades críticas/altas receberam correção ou análise técnica documentada.

## Limitações

Esta revisão não acessou o Play Console, não descompilou um AAB atual, não validou RLS no ambiente remoto com dois tenants e não executou o fluxo autenticado de exclusão. Esses itens permanecem pendentes; não foram classificados como conformes por inferência.
