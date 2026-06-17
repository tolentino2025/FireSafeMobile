// SMOKE TEST — Garante que o app web abre, renderiza e não trava.
// Não depende de Supabase nem de login — apenas valida o carregamento.

import { test, expect } from "@playwright/test";
import { waitForApp } from "./helpers/nav";
import { clearAppStorage, assertScopedKeys } from "./helpers/storage";

test.describe("Smoke — carregamento do app", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForApp(page);
  });

  test("app abre sem tela branca", async ({ page }) => {
    // Nenhum loader infinito — a página deve ter conteúdo real
    const body = page.locator("body");
    await expect(body).not.toBeEmpty();
    await expect(page.getByText("FireSafe ITM").first()).toBeVisible();
  });

  test("não há erros críticos no console durante o carregamento", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.reload();
    await waitForApp(page);

    // Filtra erros esperados (Expo/React Native podem emitir warnings não-fatais)
    const critical = errors.filter(
      (e) =>
        !e.includes("Warning:") &&
        !e.includes("Each child in a list") &&
        !e.includes("ResizeObserver") &&
        !e.includes("Non-serializable") &&
        !e.includes("VirtualizedList") &&
        !e.includes("Animated:"),
    );
    expect(critical, `Erros críticos de console:\n${critical.join("\n")}`).toHaveLength(0);
  });

  test("os 5 tabs do bottom bar estão visíveis", async ({ page }) => {
    for (const tab of ["Inicio", "Inspeções", "Agenda", "Cadastros", "Perfil"]) {
      await expect(page.getByText(tab).first()).toBeVisible();
    }
  });

  test("tab Home mostra elementos de conformidade", async ({ page }) => {
    await page.getByText("Inicio").first().click();
    await page.waitForTimeout(500);
    // HomeScreen sempre renderiza algo — título ou anel de conformidade
    await expect(page.getByText("FireSafe ITM").first()).toBeVisible();
  });

  test("chaves de localStorage usam sufixo de escopo correto", async ({ page }) => {
    // Força criação de algum dado para gerar chaves
    await clearAppStorage(page);
    await page.reload();
    await waitForApp(page);

    const { ok, badKeys } = await assertScopedKeys(page);
    expect(
      ok,
      `Chaves sem escopo encontradas (vazamento potencial): ${badKeys.join(", ")}`,
    ).toBe(true);
  });
});
