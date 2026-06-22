import { expect, test } from "@playwright/test";
import { clickTab, goProfile, waitForApp } from "./helpers/nav";

// Ruídos benignos de RN/Expo Web que não indicam crash funcional.
const BENIGN_CONSOLE = [
  /Warning:/i,
  /VirtualizedList/i,
  /ResizeObserver/i,
  /componentWillReceiveProps/i,
  /useNativeDriver/i,
  /shadow\* style props are deprecated/i,
  /pointerEvents is deprecated/i,
  /expo-notifications/i,
  /Failed to load resource/i,
];

function isCritical(text: string): boolean {
  return !BENIGN_CONSOLE.some((re) => re.test(text));
}

test.describe("Google Play — requisitos verificáveis no app", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForApp(page);
  });

  test("carrega sem tela branca, crash ou erro crítico", async ({ page }) => {
    const failures: string[] = [];
    page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error" && isCritical(message.text())) {
        failures.push(`console.error: ${message.text()}`);
      }
    });

    await page.reload();
    await waitForApp(page);
    await expect(page.getByText("FireSafe ITM").first()).toBeVisible();
    expect(failures, failures.join("\n")).toEqual([]);
  });

  test("nenhuma aba principal produz crash visual ou erro crítico", async ({ page }) => {
    const failures: string[] = [];
    page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error" && isCritical(message.text())) {
        failures.push(`console.error: ${message.text()}`);
      }
    });

    for (const tab of ["Inicio", "Inspeções", "Agenda", "Cadastros", "Perfil"]) {
      await clickTab(page, tab);
      await expect(page.locator("body")).toBeVisible();
      const text = (await page.locator("body").innerText()).trim();
      expect(text.length, `Aba ${tab} renderizou tela vazia`).toBeGreaterThan(0);
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Requisitos de política implementados — UI verificável no app.
  // ──────────────────────────────────────────────────────────────────────────

  test("política de privacidade acessível dentro do app", async ({ page }) => {
    await goProfile(page);
    // A linha existe e é o link in-app para a política pública (abre browser externo).
    await expect(page.getByTestId("settings-privacy")).toBeVisible();
    await expect(page.getByText(/política de privacidade|privacy policy/i).first()).toBeVisible();
  });

  test("termos de uso acessíveis dentro do app", async ({ page }) => {
    await goProfile(page);
    await expect(page.getByTestId("settings-terms")).toBeVisible();
    await expect(page.getByText(/termos de uso|terms of (use|service)/i).first()).toBeVisible();
  });

  test("exclusão de conta acessível no perfil quando autenticado", async ({ page }) => {
    await goProfile(page);
    const deleteRow = page.getByTestId("settings-delete-account");
    // Em guest mode (E2E sem Supabase) a linha só aparece autenticado.
    test.skip((await deleteRow.count()) === 0, "Exclusão de conta exige sessão (não há login no E2E guest)");
    await expect(deleteRow).toBeVisible();
  });

  test("modal Sobre exibe ressalva legal (não substitui ART/AVCB/laudo)", async ({ page }) => {
    await goProfile(page);
    await page.getByText(/sobre|about/i).first().click();
    await expect(
      page.getByText(/não substitui|ferramenta de apoio|does not replace|support tool/i).first(),
    ).toBeVisible();
  });
});
