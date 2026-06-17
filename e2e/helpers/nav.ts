// Helpers de navegação para Playwright + React Native Web.
// React Navigation bottom-tabs renderiza com role="tab" no DOM web.
// Telas são detectadas por conteúdo único (sem mudança de URL — app usa in-memory routing).

import { Page, expect } from "@playwright/test";

const APP_READY_TIMEOUT = 90_000; // bundle cold-start pode ser lento

/** Aguarda o shell do app ficar pronto (tab bar visível). */
export async function waitForApp(page: Page): Promise<void> {
  // "Perfil" é sempre o último tab — presença confirma que o bundle carregou
  await page.getByText("Perfil").first().waitFor({ timeout: APP_READY_TIMEOUT });
}

/**
 * Clica em uma aba do bottom tab bar.
 * Tenta role="tab" primeiro; se não encontrar, usa o texto visível.
 */
export async function clickTab(page: Page, label: string): Promise<void> {
  const byRole = page.getByRole("tab", { name: new RegExp(label, "i") });
  if (await byRole.count() > 0) {
    await byRole.first().click();
  } else {
    // Fallback: último elemento com esse texto (tab bar fica no final do DOM)
    await page.getByText(label).last().click();
  }
  await page.waitForTimeout(400);
}

/** Navega para Home e aguarda o conteúdo carregar. */
export async function goHome(page: Page): Promise<void> {
  await clickTab(page, "Inicio");
  // Home mostra o anel de conformidade
  await page.waitForTimeout(500);
}

/** Navega para a aba Inspeções e aguarda o campo de busca aparecer. */
export async function goInspections(page: Page): Promise<void> {
  await clickTab(page, "Inspeções");
  await page.getByPlaceholder("Buscar inspeções...").waitFor({ timeout: 10_000 });
}

/** Navega para a aba Agenda ITM. */
export async function goSchedule(page: Page): Promise<void> {
  await clickTab(page, "Agenda");
  await page.getByText("Agenda ITM").first().waitFor({ timeout: 10_000 });
}

/** Navega para a aba Cadastros e aguarda o grid de categorias. */
export async function goRegistrations(page: Page): Promise<void> {
  await clickTab(page, "Cadastros");
  // A tela mostra "Empresas" como primeiro tile
  await page.getByText("Empresas").first().waitFor({ timeout: 10_000 });
}

/** Navega para a aba Perfil. */
export async function goProfile(page: Page): Promise<void> {
  await clickTab(page, "Perfil");
  await page.getByText("Perfil").first().waitFor({ timeout: 10_000 });
}

/**
 * Dentro da tela de Cadastros, clica em um tile de categoria.
 * Ex: "Empresas", "Inspetores", "Prestadoras de Serviço" etc.
 */
export async function clickRegistrationTile(page: Page, label: string): Promise<void> {
  await page.getByText(label).first().click();
  await page.waitForTimeout(400);
}

/**
 * Clica no botão de adicionar/novo da tela atual.
 *
 * No React Native Web os botões são Pressable e NÃO expõem role="button".
 * Há dois tipos de FAB nesta aplicação:
 *   1. FAB de tela (PropertiesScreen): testID="fab-add" → data-testid no web
 *   2. FAB global (MainTabNavigator): accessibilityLabel="Nova inspeção" → aria-label no web
 *   3. Botões com texto: ITM "Novo Plano", Agenda "Nova Inspeção"
 *
 * IMPORTANTE: [tabindex="0"].last() NÃO é o FAB de tela — é o FAB global que
 * aparece por último no DOM. Por isso usamos seletores específicos em vez de .last().
 */
export async function clickFab(page: Page): Promise<void> {
  // 1. Botões com texto visível (ITMPlansScreen "Novo Plano" etc.)
  const addByText = page
    .getByText(/^(adicionar|nova inspeção|nova vistoria|novo plano)\b/i)
    .first();
  if (await addByText.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await addByText.click();
    await page.waitForTimeout(500);
    return;
  }
  // 2. FAB de tela via testID (PropertiesScreen "+" para CRUD de cadastros)
  const screenFab = page.locator('[data-testid="fab-add"]');
  if (await screenFab.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await screenFab.click();
    await page.waitForTimeout(500);
    return;
  }
  // 3. FAB global via aria-label (MainTabNavigator, visível nas abas raiz)
  const globalFab = page.locator('[aria-label="Nova inspeção"]');
  if (await globalFab.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await globalFab.click();
    await page.waitForTimeout(500);
    return;
  }
  // 4. Último recurso
  await page.locator('[tabindex="0"]').last().click();
  await page.waitForTimeout(500);
}

/** Aguarda uma mensagem de texto aparecer e desaparecer (toast/snackbar). */
export async function waitForToast(page: Page, text: string, timeout = 5_000): Promise<void> {
  await page.getByText(text).waitFor({ state: "visible", timeout });
  await page.getByText(text).waitFor({ state: "hidden", timeout: timeout * 2 });
}

/** Verifica que um elemento com determinado texto NÃO está visível. */
export async function assertNotVisible(page: Page, text: string): Promise<void> {
  const el = page.getByText(text);
  const count = await el.count();
  if (count > 0) {
    await expect(el.first()).not.toBeVisible();
  }
  // Se count === 0, o elemento não existe — também é válido
}
