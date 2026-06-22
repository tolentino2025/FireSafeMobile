# Checklist de Publicação Google Play — FireSafe ITM

> Reauditoria de 22/06/2026. O estado atual é **NÃO PUBLICAR AINDA**.

## P0 — gates antes de gerar/enviar o release

- [x] Links locais de Política e Termos no Perfil.
- [x] UI local de exclusão de conta para usuário autenticado.
- [x] Ressalva legal e claim “Baseado na NFPA 25”.
- [x] `versionCode` 2 e permissões não usadas em `blockedPermissions`.
- [ ] **Publicar conteúdo real** em `/privacidade`, `/termos` e `/excluir-conta`; hoje as URLs entregam somente o shell genérico do app.
- [ ] **Implantar `delete-account`** no Supabase; o endpoint atual retorna 404.
- [ ] Testar exclusão ponta a ponta com conta descartável autenticada.
- [ ] Exibir disclosure destacado de localização e aguardar ação do usuário antes do prompt.
- [ ] Confirmar que `EXPO_PUBLIC_API_URL` não existe no build de produção e que o Express não está implantado, ou corrigir autenticação/tenant/segredo.
- [ ] Gerar um novo AAB e conferir o Manifest mesclado sem `RECORD_AUDIO`, storage legado e exact alarm.

## Segurança e qualidade

- [ ] Testar RLS/storage com dois tenants reais em produção.
- [ ] Tratar ou justificar tecnicamente as 3 vulnerabilidades críticas e 11 altas do audit de produção.
- [ ] Alinhar dependências às versões recomendadas pelo Expo SDK 54.
- [ ] Reduzir o lint para zero erro e tornar a verificação obrigatória no CI.
- [x] Testes unitários: 10 passaram, 0 falhou.
- [x] Playwright mobile: 19 passaram, 2 ignorados, 0 falhou.
- [ ] Executar testes Android nativos: permissões, câmera, notificações, Back, share e PDF.
- [ ] Executar login/sessão expirada e isolamento entre tenants.
- [ ] Executar Pre-launch report do AAB final e revisar crash/ANR.

## Play Console

- [ ] Cadastrar a URL pública da política de privacidade.
- [ ] Preencher Data safety de forma coerente com nome/e-mail, empresa, clientes, inspeções, fotos, assinatura, localização precisa, anexos, PDFs e push token.
- [ ] Preencher Data deletion com a URL pública e o comportamento real de retenção.
- [ ] Declarar terceiros relevantes: Supabase, Expo Push e Brevo.
- [ ] Preparar descrição PT-BR, ícone 512×512, feature graphic 1024×500 e screenshots reais.
- [ ] Preencher classificação de conteúdo, público-alvo e contato do desenvolvedor.
- [ ] Informar credenciais/instruções válidas em **App access**.
- [ ] Confirmar Play App Signing, target API 36 e `versionCode` do AAB enviado.
- [ ] Publicar primeiro em teste interno/fechado e fazer rollout gradual após os gates.

## Critério de aceite

Todos os itens P0 devem estar concluídos e validados no artefato/ambiente de produção. HTTP 200, existência de código local ou configuração declarativa não substituem a validação do conteúdo público, endpoint implantado e Manifest final.
