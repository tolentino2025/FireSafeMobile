# FireSafe ITM — Submissão App Store (1.0.1)

App Store Connect: Apple ID `6758782734` · Bundle `com.firesafe.itm` · Team `C4452PAU4U`

---

## 1. O que mudou nesta versão para a Apple

O paywall simulado foi removido. Ele mostrava preços (R$ 29,90 / R$ 249,90) e o
botão "Assinar" gravava premium no `AsyncStorage` sem cobrar nada — rejeição
certa por **Guideline 2.1** (funcionalidade placeholder) e **3.1.1** (conteúdo
digital fora do In-App Purchase).

No lugar entrou o modelo B2B: 5 inspeções de avaliação e depois uma **chave de
acesso** resgatada dentro do app. A interface não exibe preço, plano, botão de
assinar nem link de compra — só o campo de resgate. A venda acontece fora do
app, por contrato direto com a empresa cliente.

> **Risco residual:** a tela de resgate traz uma linha de contato do suporte
> (`suporte@firesafeitm.com`) sob "Precisa de ajuda?". É neutra e não menciona
> compra, preço ou assinatura. Apps B2B fazem assim rotineiramente e a
> Guideline 3.1.3(c) (Enterprise Services) cobre venda direta a organizações,
> mas um revisor rigoroso pode enxergar ali um caminho de compra. Se vier
> rejeição por 3.1.1, o ajuste é remover essa linha e reenviar.

---

## 2. Emitir chaves de acesso

```bash
npx tsx scripts/gen-access-key.ts --label "Nome do cliente" --months 12 --count 1
```

O script imprime a chave em texto puro (entregue ao cliente) e o `INSERT` com o
SHA-256 para colar no SQL Editor do Supabase. **A chave em texto puro não fica
salva em lugar nenhum** — se perder, revogue e emita outra.

Operações comuns no SQL Editor:

```sql
-- quem resgatou o quê
select label, redeemed_at, company_id from public.access_keys order by created_at desc;

-- liberações vigentes
select company_id, user_id, expires_at from public.entitlements where expires_at > now();

-- revogar uma chave ainda não resgatada
update public.access_keys set revoked_at = now() where label = 'Nome do cliente';
```

Resgatar de novo **renova**: soma o prazo da chave nova ao que ainda resta.

---

## 3. Pendências antes de enviar para revisão

### 3.1 Conta de demonstração — OBRIGATÓRIA
O app exige login. A Apple **precisa de credenciais reais** em App Review
Information; "conta de teste mediante solicitação" (texto atual do
`store-listing.md`) é rejeição por Guideline 2.1.

- [ ] Criar uma conta real no app (e-mail + senha), confirmar o e-mail
- [ ] Deixá-la com dados de exemplo: 1 empresa, 1 propriedade, 1 inspeção
- [ ] Preencher usuário e senha no App Store Connect

### 3.2 Chave de acesso para o revisor — JÁ CRIADA
Já existe em produção uma chave de 24 meses com o label `Apple App Review 1.0.1`.
A chave em texto puro **não é versionada aqui de propósito** — está fora do
repositório. Se você não a tiver mais em mãos, revogue e emita outra:

```sql
update public.access_keys set revoked_at = now() where label = 'Apple App Review 1.0.1';
```
```bash
npx tsx scripts/gen-access-key.ts --label "Apple App Review 1.0.1" --months 24
```

É de uso único — se o revisor resgatar e o app for rejeitado, emita outra antes
de reenviar.

### 3.3 Screenshots — PRECISAM SER REFEITAS
As de `store-assets/` são 1080×1920 (formato Android) e a Apple não aceita.

- [ ] iPhone 6.9" — 1290×2796 ou 1320×2868, mínimo 3 imagens
- [ ] iPad: **não é necessário** (`supportsTablet: false` nesta versão)

### 3.4 App Privacy (nutrition labels)
Declarar o que o app coleta, de acordo com o `data_safety_FireSafe_ITM.csv` já
usado na Play: e-mail e nome (conta), fotos e localização (documentação da
inspeção), tudo vinculado ao usuário e nada usado para rastreamento.

### 3.5 Export compliance
`ITSAppUsesNonExemptEncryption: false` já está no `app.json` — a Apple não vai
perguntar de novo.

---

## 4. Ficha da loja

- **Nome:** FireSafe ITM
- **Subtítulo:** Inspeções NFPA 25
- **Idioma principal:** Português (Brasil)
- **Categoria:** Business (secundária: Utilities)
- **Copyright:** © 2026 Jonel Incêndio
- **Support URL:** https://firesafeitm.com
- **Privacy Policy URL:** https://firesafeitm.com/privacidade/
- **Contato:** cleiton@jonelincendio.com.br

### Notas de revisão (App Review Information)

```
App profissional para inspeção, teste e manutenção de sistemas de proteção
contra incêndio conforme a norma NFPA 25. É usado por empresas contratadas de
inspeção; por isso exige cadastro, já que os dados de inspeção são sincronizados
em nuvem e compartilhados entre os membros da empresa.

Conta de demonstração:
  usuário: <PREENCHER>
  senha:   <PREENCHER>

A versão de avaliação permite 5 inspeções. O uso completo é liberado por uma
chave de acesso fornecida pela empresa contratante. Chave para teste:

  <PREENCHER com a chave gerada>

Ela é resgatada no app em Perfil > Licença > "Inserir chave de acesso".
O app não vende assinaturas nem conteúdo digital dentro dele.

Fluxo principal para avaliar:
  1. Entrar com a conta acima
  2. Cadastros > cadastrar uma propriedade
  3. Inspeções > Nova inspeção > escolher o tipo de sistema
  4. Preencher o checklist e concluir
  5. Compartilhar > gerar o relatório em PDF
```

---

## 5. Depois do build

```bash
npx eas submit --platform ios --profile production --latest
```

Usa o `ascAppId 6758782734` já configurado no `eas.json`. Vai pedir a senha do
Apple ID (ou uma App Store Connect API key).
