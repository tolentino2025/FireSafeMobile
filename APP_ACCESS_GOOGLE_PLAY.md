# App Access — Credenciais de teste para a revisão do Google Play

O FireSafe ITM exige login (Supabase Auth) para acessar conta, sincronização e
exclusão de conta. Por isso, na seção **App access** (Acesso ao app) do Play
Console, é obrigatório fornecer credenciais de teste ao revisor do Google.

---

## ⚠️ Pré-requisito CRÍTICO — Supabase no build de produção

O perfil `production` do EAS **não tem** as variáveis do Supabase hoje
(`eas env:list --environment production` → vazio). Sem elas, o AAB:

- **não pede login** (roda em modo local/guest), e
- **não mostra** o botão "Excluir Conta" (renderiza só com `isConfigured && user`).

Isso invalida as credenciais abaixo e as correções de compliance. **Defina as
variáveis públicas do Supabase no ambiente de produção do EAS** (são chaves
`EXPO_PUBLIC_*`, públicas por design — já ficam embutidas no bundle):

```bash
eas env:create --environment production --visibility plaintext \
  --name EXPO_PUBLIC_SUPABASE_URL \
  --value "https://tbbnysvkfnoydjqxdnlc.supabase.co" --non-interactive

eas env:create --environment production --visibility plaintext \
  --name EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "sb_publishable_GC_Hwk0Jj9mwPSehlO4DiQ_0XmpqKy1" --non-interactive
```

> Alternativa (sem login): se você decidir publicar **sem** Supabase/login, então
> não há criação de conta → a política de exclusão de conta **não se aplica** e em
> App access você marca "Não é necessário login". Mas o app perde nuvem,
> multiempresa e exclusão de conta. **Recomendado: manter o login (acima).**

Depois de definir as variáveis, **rebuild** o AAB:
`eas build -p android --profile production`.

---

## 1. Criar a conta de teste no Supabase

No painel Supabase do projeto (`tbbnysvkfnoydjqxdnlc`):
**Authentication → Users → Add user**

- **Email:** `revisor.google@firesafeitm.com`
- **Password:** `FireSafe-Review#2026`
- ✅ Marque **Auto Confirm User** (para o revisor logar sem confirmar e-mail).

(Opcional, mas recomendado) Após criar, faça login uma vez com essa conta e
cadastre **1 inspeção de exemplo**, para o revisor não ver telas vazias.

---

## 2. Credenciais para o Play Console

| Campo | Valor |
|---|---|
| **Username (e-mail)** | `revisor.google@firesafeitm.com` |
| **Password** | `FireSafe-Review#2026` |

No Play Console: **Política do app → App access (Acesso ao app)** →
"Todas ou algumas funcionalidades exigem credenciais" → adicione um registro com
o usuário/senha acima e as instruções abaixo.

---

## 3. Instruções para o revisor (colar no campo "Instruções")

**Português:**
```
O FireSafe ITM exige login para acessar todas as funcionalidades.

Como acessar:
1. Abra o app. Na tela inicial, toque em "Entrar / Criar conta" (ou Perfil > Entrar).
2. E-mail: revisor.google@firesafeitm.com
3. Senha: FireSafe-Review#2026
4. Toque em "Entrar".

Após o login você terá acesso a: criação de inspeções, captura de fotos,
geração de relatórios PDF, agenda/lembretes e perfil.

Política de Privacidade: https://firesafeitm.com/privacidade/
Exclusão de conta: no app, em Perfil > Privacidade e Termos > Excluir Conta;
ou em https://firesafeitm.com/excluir-conta/

O app é uma ferramenta profissional de inspeção (NFPA 25); não coleta dados em
segundo plano e a localização é usada apenas durante a inspeção, em primeiro plano.
```

**English:**
```
FireSafe ITM requires sign-in to access all features.

How to access:
1. Open the app. On the start screen tap "Sign in / Create account" (or Profile > Sign in).
2. Email: revisor.google@firesafeitm.com
3. Password: FireSafe-Review#2026
4. Tap "Sign in".

After signing in you can: create inspections, capture photos, generate PDF
reports, manage schedule/reminders and profile.

Privacy Policy: https://firesafeitm.com/privacidade/
Account deletion: in-app at Profile > Privacy & Terms > Delete Account;
or at https://firesafeitm.com/excluir-conta/

This is a professional inspection tool (NFPA 25); no background data collection,
and location is used only during an inspection, in the foreground.
```

---

## 4. Checklist deste item

- [ ] Variáveis Supabase definidas no EAS production (seção pré-requisito).
- [ ] Conta de teste criada no Supabase com Auto Confirm.
- [ ] (Opcional) 1 inspeção de exemplo cadastrada na conta de teste.
- [ ] AAB rebuildado com Supabase configurado.
- [ ] Credenciais + instruções coladas em App access no Play Console.
- [ ] Login testado no próprio AAB (teste interno) antes de enviar à revisão.

> Segurança: use esta conta **apenas** para revisão. Após a aprovação, você pode
> trocar a senha. Não reutilize senhas reais.
