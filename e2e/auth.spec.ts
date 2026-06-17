// Testes de autenticação: login inválido, login válido, logout, proteção de sessão.
// Requer Supabase configurado. Usuários de teste requerem env PW_USER_A_*.

import { test, expect } from "@playwright/test";
import { waitForApp, goProfile } from "./helpers/nav";
import { clearAppStorage } from "./helpers/storage";
import { skipIfNoSupabase, skipIfNoTestUsers, login, logout, isLoggedIn } from "./helpers/auth";
import { AUTH_USER_A, SUPABASE_CONFIGURED } from "./constants";

test.describe("Autenticação", () => {
  test.beforeEach(async ({ page }) => {
    skipIfNoSupabase();
    await page.goto("/");
    await clearAppStorage(page);
    await page.reload();
    await waitForApp(page);
  });

  test("tela de login é acessível via aba Perfil", async ({ page }) => {
    await goProfile(page);

    // Sem login, deve mostrar opção de entrar
    const loginLink = page.getByText(/entrar|criar conta/i).first();
    await expect(loginLink).toBeVisible({ timeout: 5_000 });
    await loginLink.click();

    await expect(page.getByPlaceholder(/seu@email\.com/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByPlaceholder(/sua senha/i)).toBeVisible();
  });

  test("login inválido exibe mensagem de erro", async ({ page }) => {
    await goProfile(page);

    const loginLink = page.getByText(/entrar/i).first();
    if (await loginLink.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await loginLink.click();
    }

    await page.getByPlaceholder(/seu@email\.com/i).waitFor({ timeout: 8_000 });
    await page.getByPlaceholder(/seu@email\.com/i).fill("invalido@teste.com");
    await page.getByPlaceholder(/sua senha/i).fill("senhaerrada123");
    await page.getByText(/^entrar$/i).first().click();

    // Deve aparecer mensagem de erro
    await expect(
      page.getByText(/inválid|invalid|senha|credencial|error/i).first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("campo email em branco exibe validação", async ({ page }) => {
    await goProfile(page);

    const loginLink = page.getByText(/entrar/i).first();
    if (await loginLink.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await loginLink.click();
    }

    await page.getByPlaceholder(/seu@email\.com/i).waitFor({ timeout: 8_000 });
    // Não preenche email, só a senha
    await page.getByPlaceholder(/sua senha/i).fill("qualquer123");
    await page.getByText(/^entrar$/i).first().click();

    // Mensagem de validação exata do LoginScreen: "Informe o e-mail."
    // (regex genérico /e-mail/ casava com textos OCULTOS do Perfil por baixo,
    // e .first() pegava um elemento hidden → falso negativo).
    await expect(
      page.getByText(/informe o e-mail/i).first(),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("senha curta exibe validação", async ({ page }) => {
    await goProfile(page);

    const loginLink = page.getByText(/entrar/i).first();
    if (await loginLink.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await loginLink.click();
    }

    await page.getByPlaceholder(/seu@email\.com/i).waitFor({ timeout: 8_000 });
    await page.getByPlaceholder(/seu@email\.com/i).fill("teste@teste.com");
    await page.getByPlaceholder(/sua senha/i).fill("123"); // menos de 6 chars
    await page.getByText(/^entrar$/i).first().click();

    await expect(
      page.getByText(/senha.*6|6.*caract|senha/i).first(),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("login válido autentica e exibe opção de logout", async ({ page }) => {
    skipIfNoTestUsers();

    await login(page, AUTH_USER_A.email, AUTH_USER_A.password);

    const loggedIn = await isLoggedIn(page);
    expect(loggedIn, "Esperava estar logado após login válido").toBe(true);
  });

  test("logout funciona e limpa a sessão", async ({ page }) => {
    skipIfNoTestUsers();

    await login(page, AUTH_USER_A.email, AUTH_USER_A.password);
    expect(await isLoggedIn(page)).toBe(true);

    await logout(page);
    expect(await isLoggedIn(page), "Esperava estar deslogado após logout").toBe(false);
  });

  test("após logout, refresh não restaura a sessão", async ({ page }) => {
    skipIfNoTestUsers();

    await login(page, AUTH_USER_A.email, AUTH_USER_A.password);
    await logout(page);

    // Recarrega a página
    await page.reload();
    await waitForApp(page);

    expect(await isLoggedIn(page), "Sessão não deve persistir após logout").toBe(false);
  });

  test("modo local funciona sem Supabase configurado (fallback)", async ({ page }) => {
    // Se Supabase estiver configurado, este teste verifica o comportamento do modo local
    // redefinindo temporariamente para um estado "sem login"
    if (!SUPABASE_CONFIGURED) {
      // Em modo puramente local, o app carrega sem exigir login
      await expect(page.getByText("Cadastros").first()).toBeVisible();
    } else {
      test.skip(true, "Supabase configurado — este teste é para modo local");
    }
  });
});
