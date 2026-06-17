// Helpers de autenticação: login, logout, navegação para LoginScreen.
// O login é OPCIONAL por padrão no app (sem EXPO_PUBLIC_AUTH_REQUIRED=1).
// O LoginScreen é acessível via Perfil → Entrar.

import { Page, test } from "@playwright/test";
import { SUPABASE_CONFIGURED, AUTH_TEST_USERS_CONFIGURED } from "../constants";

/** Skip se Supabase não estiver configurado nas env vars. */
export function skipIfNoSupabase(): void {
  test.skip(!SUPABASE_CONFIGURED, "Supabase não configurado — teste pulado.");
}

/** Skip se os usuários de teste (PW_USER_A/B_EMAIL) não estiverem configurados. */
export function skipIfNoTestUsers(): void {
  test.skip(
    !AUTH_TEST_USERS_CONFIGURED,
    "PW_USER_A_EMAIL / PW_USER_B_EMAIL não definidos. " +
      "Configure os usuários de teste no Supabase e exporte as env vars.",
  );
}

/**
 * Navega até a LoginScreen via aba Perfil.
 * Funciona tanto no modo login-opcional quanto no modo gate.
 */
async function gotoLoginScreen(page: Page): Promise<void> {
  // Vai para Perfil
  const profileTab = page.getByRole("tab", { name: /perfil/i });
  if (await profileTab.count() > 0) {
    await profileTab.click();
    await page.waitForTimeout(400);
  } else {
    await page.getByText("Perfil").last().click();
    await page.waitForTimeout(400);
  }
  // Clica em "Entrar / Criar conta" (visível quando não está logado e Supabase configurado)
  // Usa regex que casa com o texto exato do botão no ProfileScreen
  const loginBtn = page.getByText(/entrar.*criar conta/i).first();
  const visible = await loginBtn.isVisible({ timeout: 4_000 }).catch(() => false);
  if (visible) {
    await loginBtn.click();
    await page.waitForTimeout(800);
  }
}

/**
 * Faz login com email e senha.
 * Aguarda até 10s pelo campo de email (modal da LoginScreen).
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await gotoLoginScreen(page);

  const emailInput = page.getByPlaceholder(/seu@email\.com/i);
  await emailInput.waitFor({ timeout: 10_000 });
  await emailInput.fill(email);
  await page.getByPlaceholder(/sua senha/i).fill(password);

  // Clica em "Entrar" (botão de submit no modo login). No RN Web é um
  // Pressable com texto — usamos .first() para evitar strict-mode se houver
  // outros textos "Entrar" na tela (ex.: link de alternância de modo).
  await page.getByText(/^entrar$/i).first().click();

  // Aguarda o login completar — a rede do Supabase no CI pode levar vários segundos.
  await page.waitForTimeout(8_000);
}

/** Faz logout a partir da aba Perfil. */
export async function logout(page: Page): Promise<void> {
  const profileTab = page.getByRole("tab", { name: /perfil/i });
  if (await profileTab.count() > 0) {
    await profileTab.click();
    await page.waitForTimeout(400);
  }

  const sairBtn = page.getByText(/^sair$/i).first();
  await sairBtn.waitFor({ state: "visible", timeout: 5_000 });

  // No RN Web, Alert.alert com 2 botões usa window.confirm() → diálogo nativo do browser.
  // Playwright auto-rejeita diálogos por padrão (dismiss = Cancel = logout não executado).
  // Registramos um handler único para aceitar o diálogo antes de clicar.
  page.once("dialog", (dialog) => dialog.accept());
  await sairBtn.click();

  // Fallback para implementações que usam modal customizado em vez de window.confirm()
  for (const text of ["OK", "Sair", "Confirmar", "Sim"]) {
    const btn = page.getByText(text).first();
    if (await btn.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await btn.click();
      break;
    }
  }

  await page.waitForTimeout(2_000);
}

/**
 * Verifica se um usuário está logado verificando se o botão "Sair" está visível
 * na tela de Perfil.
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const profileTab = page.getByRole("tab", { name: /perfil/i });
  if (await profileTab.count() > 0) {
    await profileTab.click();
    await page.waitForTimeout(500);
  }
  // Timeout generoso: auth do Supabase no CI pode levar vários segundos.
  return page.getByText(/^sair$/i).isVisible({ timeout: 8_000 }).catch(() => false);
}
