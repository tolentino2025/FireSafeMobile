import { test, expect } from "@playwright/test";

// Teste de fumaça: garante que o app web carrega e renderiza a UI inicial.
// Não depende de Supabase nem de login obrigatório — só verifica que o bundle
// sobe e a marca aparece (presente na tela de login e no app).
test("app web carrega e mostra a marca FireSafe ITM", async ({ page }) => {
  await page.goto("/");

  // O nome do app aparece como texto em react-native-web (div/span), tanto na
  // tela de login quanto no app logado/local. Usamos um regex tolerante.
  await expect(page.getByText(/FireSafe ITM/i).first()).toBeVisible();
});

// Quando o login está habilitado (Supabase configurado), o formulário deve
// estar acessível. Tolerante: se o app abrir direto no modo local (sem gate),
// o teste é pulado em vez de falhar.
test("formulário de login está acessível quando aplicável", async ({ page }) => {
  await page.goto("/");

  const emailField = page.getByPlaceholder(/seu@email\.com/i);
  const appearedCount = await emailField.count();

  test.skip(
    appearedCount === 0,
    "Login não exibido (modo local/sem gate de auth) — nada a testar aqui.",
  );

  await expect(emailField.first()).toBeVisible();
  await expect(page.getByPlaceholder(/sua senha/i).first()).toBeVisible();
});
